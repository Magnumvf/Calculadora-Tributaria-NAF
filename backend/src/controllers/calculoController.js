const prisma = require('../config/prisma');

function detalhesPJSalvos(calculo) {
  const aliquotasPorAnexo = { 'Anexo III': 0.06, 'Anexo IV': 0.045, 'Anexo V': 0.155 };
  const aliquota = aliquotasPorAnexo[calculo.anexo];
  if (!Number.isFinite(aliquota) || !Number.isFinite(calculo.faturamento)) return null;

  const salarioBase = Math.max(calculo.faturamento * 0.28, 1621);
  return {
    anexo: calculo.anexo,
    aliquota,
    fatorR: calculo.fatorR,
    folha: calculo.folha,
    salarioBase,
    simples: calculo.faturamento * aliquota,
    inss: salarioBase * 0.11,
  };
}

const calculoController = {
  create: async (req, res) => {
    try {
      const { tipoProfissao, faturamento, custos, folha } = req.body;
      const userId = req.userId;

      if (!tipoProfissao || faturamento === undefined) {
        return res.status(400).json({ error: "Profissão e Faturamento são obrigatórios." });
      }

      const rendaNum = parseFloat(faturamento);
      const custosNum = custos ? parseFloat(custos) : 0;

      // --- REGRA DE NEGÓCIO DA PESSOA FÍSICA (IRPF 2026) ---
      const basePF = rendaNum - custosNum;
      let impostoPF = 0;
      let faixaPF = "Isento";

      if (basePF <= 2428.8) {
        faixaPF = "Isento";
      } else if (basePF <= 2826.65) {
        impostoPF = basePF * 0.075 - 182.16;
        faixaPF = "7,5%";
      } else if (basePF <= 3751.05) {
        impostoPF = basePF * 0.15 - 394.16;
        faixaPF = "15%";
      } else if (basePF <= 4664.68) {
        impostoPF = basePF * 0.225 - 675.49;
        faixaPF = "22,5%";
      } else {
        impostoPF = basePF * 0.275 - 908.73;
        faixaPF = "27,5%";
      }
      impostoPF = impostoPF <= 0 ? 0 : impostoPF;

      // --- REGRA DE NEGÓCIO DA PESSOA JURÍDICA (Simples Nacional 2026) ---
      const folhaNum = folha ? parseFloat(folha) : 0;
      const prof = tipoProfissao.toLowerCase();
      const profissoesFatorR = ["medico", "dentista"];

      let aliquota = 0.06;
      let anexo = "Anexo III";
      let fatorR = null;

      if (prof === "advogado") {
        aliquota = 0.045;
        anexo = "Anexo IV";
      } else if (profissoesFatorR.includes(prof)) {
        // Mantém a regra já implementada na M2: folha mensal / receita mensal.
        fatorR = rendaNum > 0 ? folhaNum / rendaNum : 0;
        if (fatorR >= 0.28) {
          aliquota = 0.06;
          anexo = "Anexo III";
        } else {
          aliquota = 0.155;
          anexo = "Anexo V";
        }
      }
      // Psicólogo e arquiteto permanecem no Anexo III (6%).

      const simples = rendaNum * aliquota;

      const salario28 = rendaNum * 0.28;
      const salarioMin = 1621; // Salário mínimo projetado para 2026
      const salarioBase = salario28 < salarioMin ? salarioMin : salario28;
      const inss = salarioBase * 0.11; // 11% obrigatório sobre o pró-labore
      const impostoPJ = simples + inss;

      // --- COMPARAÇÃO DE VANTAGEM TRIBUTÁRIA ---
      const economiaMensal = Math.abs(impostoPJ - impostoPF);
      const melhorOpcao = impostoPJ < impostoPF ? "Pessoa Jurídica (PJ)" : "Pessoa Física (PF)";

      const novoCalculo = await prisma.calculo.create({
        data: {
          userId,
          tipoProfissao,
          faturamento: rendaNum,
          custos: custosNum,
          impostoPF,
          impostoPJ,
          melhorOpcao,
          economiaMensal,
          folha: profissoesFatorR.includes(prof) ? folhaNum : null,
          fatorR,
          anexo
        }
      });

      return res.status(201).json({
        message: "Cálculo simulado e salvo com sucesso!",
        calculo: novoCalculo,
        detalhe: {
          anexo,
          aliquota,
          fatorR,
          folha: profissoesFatorR.includes(prof) ? folhaNum : null,
          salarioBase,
          simples,
          inss
        }
      });

    } catch (error) {
      console.error("Erro ao processar cálculo:", error);
      return res.status(500).json({ error: "Erro interno do servidor ao processar o cálculo tributário." });
    }
  },

  history: async (req, res) => {
    try {
      const userId = req.userId;

      const historico = await prisma.calculo.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return res.status(200).json(historico.map((calculo) => ({
        ...calculo,
        detalhe: detalhesPJSalvos(calculo),
      })));
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return res.status(500).json({ error: "Erro interno ao buscar o histórico de cálculos." });
    }
  }
};

module.exports = calculoController;
