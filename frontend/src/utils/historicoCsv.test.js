import test from "node:test";
import assert from "node:assert/strict";
import { gerarCsvHistorico, nomeArquivoHistorico } from "./historicoCsv.js";

test("gera CSV com BOM, separador brasileiro e campos M2 disponíveis", () => {
  const csv = gerarCsvHistorico([{
    createdAt: "2026-11-01T12:00:00.000Z",
    tipoProfissao: "medico",
    faturamento: 10000,
    custos: 250,
    folha: 2800,
    fatorR: 0.28,
    anexo: "Anexo III",
    aliquotaPJ: 0.06,
    impostoPF: 900,
    impostoPJ: 908,
    melhorOpcao: "Pessoa Física (PF)",
    economiaMensal: 8
  }]);

  assert.ok(csv.startsWith("\uFEFFsep=;\r\n"));
  assert.ok(csv.includes('"Médico(a)"'));
  assert.ok(csv.includes('"10.000,00"'));
  assert.ok(csv.includes('"28,0%"'));
  assert.ok(csv.includes('"Anexo III"'));
  assert.ok(csv.includes('"6,0%"'));
  assert.ok(csv.includes('"Pessoa Física (PF)"'));
});

test("escapa aspas e quebra de linha e nomeia arquivo pela data local", () => {
  const csv = gerarCsvHistorico([{
    tipoProfissao: "Médico \"PJ\"",
    melhorOpcao: "Pessoa PJ;\nPessoa PF"
  }]);

  assert.ok(csv.includes('"Médico ""PJ"""'));
  assert.ok(csv.includes('"Pessoa PJ; Pessoa PF"'));
  assert.equal(nomeArquivoHistorico(new Date(2026, 10, 1)), "historico_calculadora_tributaria_2026-11-01.csv");
});
