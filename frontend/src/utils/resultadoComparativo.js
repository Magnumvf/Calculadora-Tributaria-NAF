// Mantém a memória de cálculo já exibida pela aplicação; os totais vêm da API.
export function resultadoComparativo(calculo) {
  const { faturamento: rendaNum, custos: custosNum, tipoProfissao: profissao,
    impostoPF, impostoPJ, melhorOpcao, economiaMensal } = calculo;
  const basePF = rendaNum - custosNum;
  let faixaPF = "Isento";
  let parcelaDedutivel = 0;

  if (basePF <= 2428.8) faixaPF = "Isento";
  else if (basePF <= 2826.65) { faixaPF = "7,5%"; parcelaDedutivel = 182.16; }
  else if (basePF <= 3751.05) { faixaPF = "15%"; parcelaDedutivel = 394.16; }
  else if (basePF <= 4664.68) { faixaPF = "22,5%"; parcelaDedutivel = 675.49; }
  else { faixaPF = "27,5%"; parcelaDedutivel = 908.73; }

  let aliquotaPJ = profissao === "advogado" ? "4,5%" : "6%";
  const salario28 = rendaNum * 0.28;
  const salarioMin = 1621;
  const salarioBase = salario28 < salarioMin ? salarioMin : salario28;
  const inss = salarioBase * 0.11;

  const siglaVencedora = melhorOpcao.includes("PJ") ? "PJ" : "PF";

  return {
    pf: { base: basePF, faixa: faixaPF, parcelaDedutivel, imposto: impostoPF },
    pj: { simples: rendaNum * (profissao === "advogado" ? 0.045 : 0.06), aliquota: aliquotaPJ, salarioBase, inss, total: impostoPJ },
    maisVantajoso: melhorOpcao,
    siglaVencedora,
    diferenca: economiaMensal
  };

}
