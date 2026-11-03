// Totais e enquadramento persistidos pela API são a fonte da comparação.
// A abertura do histórico reaproveita os campos salvos no próprio cálculo.
export function resultadoComparativo(calculo) {
  const {
    faturamento: renda,
    custos,
    tipoProfissao: profissao,
    impostoPF,
    impostoPJ,
    melhorOpcao,
    economiaMensal,
    anexo,
    aliquotaPJ,
    fatorR,
    detalhe,
  } = calculo;

  const basePF = Number.isFinite(renda) && Number.isFinite(custos) ? renda - custos : null;
  let faixaPF = null;
  let parcelaDedutivel = 0;

  if (basePF !== null) {
    if (basePF <= 2428.8) faixaPF = "Isento";
    else if (basePF <= 2826.65) { faixaPF = "7,5%"; parcelaDedutivel = 182.16; }
    else if (basePF <= 3751.05) { faixaPF = "15%"; parcelaDedutivel = 394.16; }
    else if (basePF <= 4664.68) { faixaPF = "22,5%"; parcelaDedutivel = 675.49; }
    else { faixaPF = "27,5%"; parcelaDedutivel = 908.73; }
  }

  const taxaSalva = Number.isFinite(aliquotaPJ) ? aliquotaPJ : detalhe?.aliquota;
  const taxasLegadas = { advogado: 0.045, psicologo: 0.06, arquiteto: 0.06 };
  const aliquota = Number.isFinite(taxaSalva) ? taxaSalva : taxasLegadas[profissao] ?? null;
  const simples = detalhe?.simples ?? (Number.isFinite(renda) && Number.isFinite(aliquota) ? renda * aliquota : null);
  const salarioBase = detalhe?.salarioBase ?? (Number.isFinite(renda) && Number.isFinite(aliquota) ? Math.max(renda * 0.28, 1621) : null);
  const inss = detalhe?.inss ?? (salarioBase === null ? null : salarioBase * 0.11);
  const anexoSalvo = detalhe?.anexo ?? anexo;
  const anexoLegado = profissao === "advogado" ? "Anexo IV" : ["psicologo", "arquiteto"].includes(profissao) ? "Anexo III" : null;
  const aliquotaTexto = Number.isFinite(aliquota)
    ? new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(aliquota)
    : null;
  const siglaVencedora = melhorOpcao?.includes("PJ") ? "PJ" : "PF";

  return {
    pf: { base: basePF, faixa: faixaPF, parcelaDedutivel, imposto: impostoPF },
    pj: {
      simples,
      aliquota: aliquotaTexto,
      anexo: anexoSalvo ?? anexoLegado,
      folha: detalhe?.folha ?? calculo.folha ?? null,
      fatorR: detalhe?.fatorR ?? fatorR ?? null,
      salarioBase,
      inss,
      total: impostoPJ,
    },
    maisVantajoso: melhorOpcao,
    siglaVencedora,
    diferenca: economiaMensal,
  };
}
