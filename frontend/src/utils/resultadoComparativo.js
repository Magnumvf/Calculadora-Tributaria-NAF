// Os totais tributários são os valores persistidos e retornados pelo backend.
// Os detalhes PJ são consumidos da resposta de cálculo ou do histórico enriquecido.
export function resultadoComparativo(calculo) {
  const { faturamento: renda, custos, impostoPF, impostoPJ, melhorOpcao, economiaMensal } = calculo;
  const basePF = Number.isFinite(custos) ? renda - custos : null;
  let faixaPF = null;
  let parcelaDedutivel = 0;

  if (basePF !== null) {
    if (basePF <= 2428.8) faixaPF = "Isento";
    else if (basePF <= 2826.65) { faixaPF = "7,5%"; parcelaDedutivel = 182.16; }
    else if (basePF <= 3751.05) { faixaPF = "15%"; parcelaDedutivel = 394.16; }
    else if (basePF <= 4664.68) { faixaPF = "22,5%"; parcelaDedutivel = 675.49; }
    else { faixaPF = "27,5%"; parcelaDedutivel = 908.73; }
  }

  const detalhe = calculo.detalhe;
  const siglaVencedora = melhorOpcao.includes("PJ") ? "PJ" : "PF";

  return {
    pf: { base: basePF, faixa: faixaPF, parcelaDedutivel, imposto: impostoPF },
    pj: {
      simples: detalhe?.simples ?? null,
      aliquota: Number.isFinite(detalhe?.aliquota)
        ? new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(detalhe.aliquota)
        : null,
      anexo: detalhe?.anexo ?? calculo.anexo ?? null,
      folha: detalhe?.folha ?? calculo.folha ?? null,
      fatorR: detalhe?.fatorR ?? calculo.fatorR ?? null,
      salarioBase: detalhe?.salarioBase ?? null,
      inss: detalhe?.inss ?? null,
      total: impostoPJ,
    },
    maisVantajoso: melhorOpcao,
    siglaVencedora,
    diferenca: economiaMensal,
  };
}
