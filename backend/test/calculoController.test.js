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
        const registro = { id: `calculo-${registrosCriados.length + 1}`, createdAt: new Date("2026-11-01T12:00:00Z"), ...data };
        registrosCriados.push(registro);
        return registro;
      },
      findMany: async () => [...registrosCriados],
    }
  }
};

const controller = require("../src/controllers/calculoController");

async function chamar(handler, body = {}) {
  const response = {
    statusCode: null,
    body: null,
    status(code) { this.statusCode = code; return this; },
    json(value) { this.body = value; return this; }
  };
  await handler({ body, userId: "usuario-teste" }, response);
  return response;
}

const calcular = (body) => chamar(controller.create, body);

test("médico com Fator R exatamente em 28% persiste anexo e alíquota da M2", async () => {
  const response = await calcular({ tipoProfissao: "medico", faturamento: 10000, custos: 0, folha: 2800 });

  assert.equal(response.statusCode, 201);
  assert.equal(response.body.calculo.fatorR, 0.28);
  assert.equal(response.body.calculo.anexo, "Anexo III");
  assert.equal(response.body.calculo.aliquotaPJ, 0.06);
  assert.equal(response.body.calculo.folha, 2800);
});

test("dentista abaixo de 28% fica no Anexo V", async () => {
  const response = await calcular({ tipoProfissao: "dentista", faturamento: 10000, custos: 0, folha: 2799 });

  assert.equal(response.body.calculo.fatorR, 0.2799);
  assert.equal(response.body.calculo.anexo, "Anexo V");
  assert.equal(response.body.calculo.aliquotaPJ, 0.155);
});

test("M2 exige folha válida para médicos e dentistas", async () => {
  assert.equal((await calcular({ tipoProfissao: "medico", faturamento: 10000 })).statusCode, 400);
  assert.equal((await calcular({ tipoProfissao: "dentista", faturamento: 10000, folha: -1 })).statusCode, 400);
});

test("advogado, psicólogo e arquiteto preservam seus enquadramentos", async () => {
  const advogado = await calcular({ tipoProfissao: "advogado", faturamento: 10000, custos: 0 });
  const psicologo = await calcular({ tipoProfissao: "psicologo", faturamento: 10000, custos: 0 });
  const arquiteto = await calcular({ tipoProfissao: "arquiteto", faturamento: 10000, custos: 0 });

  assert.equal(advogado.body.calculo.anexo, "Anexo IV");
  assert.equal(advogado.body.calculo.aliquotaPJ, 0.045);
  assert.equal(psicologo.body.calculo.anexo, "Anexo III");
  assert.equal(psicologo.body.calculo.aliquotaPJ, 0.06);
  assert.equal(arquiteto.body.calculo.anexo, "Anexo III");
  assert.equal(arquiteto.body.calculo.fatorR, null);
});

test("histórico retorna os campos M2 persistidos", async () => {
  await calcular({ tipoProfissao: "medico", faturamento: 10000, custos: 500, folha: 2800 });
  const response = await chamar(controller.history);
  const medico = response.body.find((calculo) => calculo.tipoProfissao === "medico");

  assert.equal(response.statusCode, 200);
  assert.equal(medico.folha, 2800);
  assert.equal(medico.fatorR, 0.28);
  assert.equal(medico.anexo, "Anexo III");
  assert.equal(medico.aliquotaPJ, 0.06);
});
