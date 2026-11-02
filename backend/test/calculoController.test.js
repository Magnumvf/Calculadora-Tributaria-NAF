const test = require("node:test");
const assert = require("node:assert/strict");

const prismaPath = require.resolve("../src/config/prisma");
const registrosCriados = [];
require.cache[prismaPath] = {
  id: prismaPath,
  filename: prismaPath,
  loaded: true,
  exports: {
    calculo: {
      create: async ({ data }) => {
        registrosCriados.push(data);
        return { id: `calculo-${registrosCriados.length}`, createdAt: new Date("2026-11-01T12:00:00Z"), ...data };
      },
      findMany: async () => registrosCriados.map((data, index) => ({ id: `calculo-${index + 1}`, ...data })),
    }
  }
};

const controller = require("../src/controllers/calculoController");

async function calcular(body) {
  const response = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };

  await controller.create({ body, userId: "usuario-teste" }, response);
  return response;
}

test("médico com Fator R exatamente em 28% usa Anexo III e persiste os dados", async () => {
  const response = await calcular({ tipoProfissao: "medico", faturamento: 10000, custos: 0, folha: 2800 });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.detalhe.fatorR, 0.28);
  assert.equal(response.body.detalhe.anexo, "Anexo III");
  assert.equal(response.body.detalhe.simples, 600);
  assert.ok(Math.abs(response.body.detalhe.salarioBase - 2800) < 1e-9);
  assert.ok(Math.abs(response.body.detalhe.inss - 308) < 1e-9);
  assert.equal(registrosCriados.at(-1).folha, 2800);
  assert.equal(registrosCriados.at(-1).fatorR, 0.28);
  assert.equal(registrosCriados.at(-1).anexo, "Anexo III");
});

test("dentista com Fator R abaixo de 28% usa Anexo V", async () => {
  const response = await calcular({ tipoProfissao: "dentista", faturamento: 10000, custos: 0, folha: 2799 });

  assert.equal(response.body.detalhe.fatorR, 0.2799);
  assert.equal(response.body.detalhe.anexo, "Anexo V");
  assert.equal(response.body.detalhe.aliquota, 0.155);
  assert.equal(response.body.detalhe.simples, 1550);
});

test("advogado preserva o Anexo IV e profissões antigas não recebem Fator R", async () => {
  const advogado = await calcular({ tipoProfissao: "advogado", faturamento: 10000, custos: 0 });
  const psicologo = await calcular({ tipoProfissao: "psicologo", faturamento: 10000, custos: 0 });

  assert.equal(advogado.body.detalhe.anexo, "Anexo IV");
  assert.equal(advogado.body.detalhe.aliquota, 0.045);
  assert.equal(advogado.body.detalhe.fatorR, null);
  assert.equal(psicologo.body.detalhe.anexo, "Anexo III");
  assert.equal(psicologo.body.detalhe.aliquota, 0.06);
  assert.equal(psicologo.body.detalhe.fatorR, null);
});

test("histórico retorna o detalhamento PJ com os campos M2 persistidos", async () => {
  await calcular({ tipoProfissao: "medico", faturamento: 10000, custos: 500, folha: 2800 });
  const response = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };

  await controller.history({ userId: "usuario-teste" }, response);
  const medico = response.body.find((calculo) => calculo.tipoProfissao === "medico");

  assert.equal(response.statusCode, 200);
  assert.equal(medico.folha, 2800);
  assert.equal(medico.fatorR, 0.28);
  assert.equal(medico.anexo, "Anexo III");
  assert.equal(medico.detalhe.fatorR, 0.28);
  assert.equal(medico.detalhe.simples, 600);
  assert.ok(Math.abs(medico.detalhe.inss - 308) < 1e-9);
});
