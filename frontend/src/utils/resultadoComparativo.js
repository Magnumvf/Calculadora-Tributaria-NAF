// Monta a memória de cálculo exibida; os totais e a alíquota vêm do que foi salvo pela API.
export function resultadoComparativo(calculo) {
  const { faturamento: rendaNum, custos: custosNum, tipoProfissao: profissao,
    impostoPF, impostoPJ, melhorOpcao, economiaMensal,
    anexo, aliquotaPJ, fatorR } = calculo;

  const basePF = rendaNum - custosNum;
  let faixaPF = "Isento";
  let parcelaDedutivel = 0;
  if (basePF <= 2428.8) faixaPF = "Isento";
  else if (basePF <= 2826.65) { faixaPF = "7,5%"; parcelaDedutivel = 182.16; }
  else if (basePF <= 3751.05) { faixaPF = "15%"; parcelaDedutivel = 394.16; }
  else if (basePF <= 4664.68) { faixaPF = "22,5%"; parcelaDedutivel = 675.49; }
  else { faixaPF = "27,5%"; parcelaDedutivel = 908.73; }

  // Usa a alíquota salva (consistente com o total). Fallback para cálculos antigos sem esse campo.
  const aliquotaDecimal = (aliquotaPJ != null)
    ? aliquotaPJ
    : (profissao === "advogado" ? 0.045 : 0.06);
  const aliquotaTexto = (aliquotaDecimal * 100).toFixed(1).replace(".", ",") + "%";
  const simples = rendaNum * aliquotaDecimal;

  const salario28 = rendaNum * 0.28;
  const salarioMin = 1621;
  const salarioBase = salario28 < salarioMin ? salarioMin : salario28;
  const inss = salarioBase * 0.11;

  const siglaVencedora = melhorOpcao.includes("PJ") ? "PJ" : "PF";

  return {
    pf: { base: basePF, faixa: faixaPF, parcelaDedutivel, imposto: impostoPF },
    pj: { simples, aliquota: aliquotaTexto, anexo: anexo ?? "Anexo III", fatorR: fatorR ?? null, salarioBase, inss, total: impostoPJ },
    maisVantajoso: melhorOpcao,
    siglaVencedora,
    diferenca: economiaMensal
  };
}
