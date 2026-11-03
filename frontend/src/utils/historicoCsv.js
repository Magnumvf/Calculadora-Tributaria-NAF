const formatarMoeda = (valor) => {
  if (valor === null || valor === undefined || valor === "") return "";
  return Number(valor).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
};

const formatarData = (valor) => {
  if (!valor) return "";
  const data = new Date(valor);
  return Number.isNaN(data.getTime()) ? "" : data.toLocaleString("pt-BR");
};

const formatarProfissao = (valor) => ({
  psicologo: "Psicólogo(a)",
  arquiteto: "Arquiteto(a)",
  advogado: "Advogado(a)",
  medico: "Médico(a)",
  dentista: "Dentista"
}[valor?.toLowerCase()] || valor || "");

const escaparCampo = (valor) => `"${String(valor ?? "").replaceAll('"', '""').replace(/[\r\n]/g, " ")}"`;

const colunas = [
  ["Data da simulação", (item) => formatarData(item.createdAt)],
  ["Profissão", (item) => formatarProfissao(item.tipoProfissao)],
  ["Faturamento mensal (R$)", (item) => formatarMoeda(item.faturamento)],
  ["Custos dedutíveis (R$)", (item) => formatarMoeda(item.custos)],
  ["Folha mensal para Fator R (R$)", (item) => formatarMoeda(item.folha)],
  ["Fator R", (item) => item.fatorR == null ? "" : new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(item.fatorR)],
  ["Anexo tributário", (item) => item.anexo || ""],
  ["Alíquota PJ", (item) => item.aliquotaPJ == null ? "" : new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(item.aliquotaPJ)],
  ["Imposto PF (R$)", (item) => formatarMoeda(item.impostoPF)],
  ["Imposto PJ (R$)", (item) => formatarMoeda(item.impostoPJ)],
  ["Cenário mais vantajoso", (item) => item.melhorOpcao || ""],
  ["Economia mensal (R$)", (item) => formatarMoeda(item.economiaMensal)]
];

export function gerarCsvHistorico(registros) {
  const linhas = [
    "sep=;",
    colunas.map(([titulo]) => escaparCampo(titulo)).join(";"),
    ...registros.map((item) => colunas.map(([, valor]) => escaparCampo(valor(item))).join(";"))
  ];

  return `\uFEFF${linhas.join("\r\n")}`;
}

export function nomeArquivoHistorico(data = new Date()) {
  const dia = [data.getFullYear(), String(data.getMonth() + 1).padStart(2, "0"), String(data.getDate()).padStart(2, "0")].join("-");
  return `historico_calculadora_tributaria_${dia}.csv`;
}
