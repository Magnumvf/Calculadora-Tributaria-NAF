const prisma = require('../config/prisma');

const PROFISSOES_FATOR_R = ["medico", "dentista"];

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
      const prof = tipoProfissao.toLowerCase();
      const usaFatorR = PROFISSOES_FATOR_R.includes(prof);

      // --- VALIDAÇÃO DA FOLHA (Fator R) ---
      let folhaNum = null;
      if (usaFatorR) {
        if (folha === undefined || folha === null || folha === "") {
          return res.status(400).json({ error: "Para médico e dentista, informe a folha de pagamento / pró-labore." });
        }
        folhaNum = parseFloat(folha);
        if (!Number.isFinite(folhaNum) || folhaNum < 0) {
          return res.status(400).json({ error: "Folha de pagamento inválida. Informe um valor igual ou maior que zero." });
        }
      }

      // --- PESSOA FÍSICA (IRPF 2026) ---
      const basePF = rendaNum - custosNum;
      let impostoPF = 0;
      if (basePF <= 2428.8) impostoPF = 0;
      else if (basePF <= 2826.65) impostoPF = basePF * 0.075 - 182.16;
      else if (basePF <= 3751.05) impostoPF = basePF * 0.15 - 394.16;
      else if (basePF <= 4664.68) impostoPF = basePF * 0.225 - 675.49;
      else impostoPF = basePF * 0.275 - 908.73;
      impostoPF = impostoPF <= 0 ? 0 : impostoPF;

      // --- PESSOA JURÍDICA (Simples Nacional 2026) ---
      let aliquotaPJ = 0.06;      // padrão: Anexo III
      let anexo = "Anexo III";
      let fatorR = null;

      if (prof === "advogado") {
        aliquotaPJ = 0.045;       // Anexo IV
        anexo = "Anexo IV";
      } else if (usaFatorR) {
        // Fator R = folha (12m) / receita (12m) — decisão sobre o valor SEM arredondamento
        fatorR = rendaNum > 0 ? folhaNum / rendaNum : 0;
        if (fatorR >= 0.28) { aliquotaPJ = 0.06; anexo = "Anexo III"; }
        else { aliquotaPJ = 0.155; anexo = "Anexo V"; }
      }
      // psicólogo e arquiteto permanecem no Anexo III (6%)

      const simples = rendaNum * aliquotaPJ;
      const salario28 = rendaNum * 0.28;
      const salarioMin = 1621;
      const salarioBase = salario28 < salarioMin ? salarioMin : salario28;
      const inss = salarioBase * 0.11;
      const impostoPJ = simples + inss;

      // --- COMPARAÇÃO ---
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
          folha: folhaNum,
          fatorR,
          anexo,
          aliquotaPJ
        }
      });

      return res.status(201).json({
        message: "Cálculo simulado e salvo com sucesso!",
        calculo: novoCalculo
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
      return res.status(200).json(historico);
    } catch (error) {
      console.error("Erro ao buscar histórico:", error);
      return res.status(500).json({ error: "Erro interno ao buscar o histórico de cálculos." });
    }
  }
};

module.exports = calculoController;