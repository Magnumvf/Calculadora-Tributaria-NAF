import test from "node:test";
import assert from "node:assert/strict";
import { resultadoComparativo } from "./resultadoComparativo.js";

test("usa os detalhes retornados junto à simulação sem alterar os totais salvos", () => {
  const resultado = resultadoComparativo({
    faturamento: 10000,
    custos: 1000,
    folha: 2800,
    fatorR: 0.28,
    anexo: "Anexo III",
    impostoPF: 1578.77,
    impostoPJ: 908,
    melhorOpcao: "Pessoa Jurídica (PJ)",
    economiaMensal: 670.77,
    detalhe: {
      simples: 600,
      aliquota: 0.06,
      anexo: "Anexo III",
      fatorR: 0.28,
      folha: 2800,
      salarioBase: 2800,
      inss: 308,
    },
  });

  assert.equal(resultado.pj.fatorR, 0.28);
  assert.equal(resultado.pj.folha, 2800);
  assert.equal(resultado.pj.anexo, "Anexo III");
  assert.equal(resultado.pj.simples, 600);
  assert.equal(resultado.pj.inss, 308);
  assert.equal(resultado.pj.total, 908);
  assert.equal(resultado.pf.imposto, 1578.77);
});

test("não inventa detalhamento nem substitui custos ausentes por zero", () => {
  const resultado = resultadoComparativo({
    faturamento: 8000,
    custos: null,
    impostoPF: 500,
    impostoPJ: 700,
    melhorOpcao: "Pessoa Física (PF)",
    economiaMensal: 200,
  });

  assert.equal(resultado.pf.base, null);
  assert.equal(resultado.pf.faixa, null);
  assert.equal(resultado.pj.simples, null);
  assert.equal(resultado.pj.fatorR, null);
  assert.equal(resultado.pj.salarioBase, null);
});

test("usa alíquota, anexo e Fator R persistidos pela M2 ao reabrir o histórico", () => {
  const resultado = resultadoComparativo({
    faturamento: 10000,
    custos: 500,
    tipoProfissao: "dentista",
    folha: 2799,
    fatorR: 0.2799,
    anexo: "Anexo V",
    aliquotaPJ: 0.155,
    impostoPF: 1700,
    impostoPJ: 1880,
    melhorOpcao: "Pessoa Física (PF)",
    economiaMensal: 180,
  });

  assert.equal(resultado.pj.anexo, "Anexo V");
  assert.equal(resultado.pj.fatorR, 0.2799);
  assert.equal(resultado.pj.aliquota, "15,5%");
  assert.equal(resultado.pj.simples, 1550);
  assert.equal(resultado.pj.total, 1880);
});
