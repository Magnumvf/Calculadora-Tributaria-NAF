import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../services/api";
import GraficoComparativo from "../components/GraficoComparativo";

const formatarMoeda = (valor) => valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
const nomesProfissao = { psicologo: "Psicólogo(a)", arquiteto: "Arquiteto(a)", advogado: "Advogado(a)" };

function normalizarCoresPdf(documento) {
  const contexto = documento.createElement("canvas").getContext("2d");
  if (!contexto) return;

  const coresCompativeis = new Map();
  const visitarRegras = (regras) => {
    for (const regra of regras) {
      if (regra.style) {
        for (let indice = 0; indice < regra.style.length; indice += 1) {
          const propriedade = regra.style.item(indice);
          const valor = regra.style.getPropertyValue(propriedade).trim();
          if (!propriedade.startsWith("--") || !/^oklch\(/i.test(valor)) continue;

          contexto.clearRect(0, 0, 1, 1);
          contexto.fillStyle = "#010203";
          contexto.fillStyle = valor;
          if (contexto.fillStyle === "#010203") continue;

          contexto.fillRect(0, 0, 1, 1);
          const [vermelho, verde, azul] = contexto.getImageData(0, 0, 1, 1).data;
          coresCompativeis.set(propriedade, `rgb(${vermelho}, ${verde}, ${azul})`);
        }
      }
      if (regra.cssRules) visitarRegras(regra.cssRules);
    }
  };

  for (const folha of documento.styleSheets) {
    try {
      visitarRegras(folha.cssRules);
    } catch {
      // Folhas externas não acessíveis não fazem parte do CSS local do relatório.
    }
  }

  for (const [propriedade, cor] of coresCompativeis) {
    documento.documentElement.style.setProperty(propriedade, cor);
  }
}

export default function Comparativo() {
  const [renda, setRenda] = useState("");
  const [custos, setCustos] = useState("");
  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [showTooltipRenda, setShowTooltipRenda] = useState(false);
  const [showTooltipCustos, setShowTooltipCustos] = useState(false);
  const [profissao, setProfissao] = useState("psicologo");
  
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagemEnvio, setMensagemEnvio] = useState("");
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [dataGeracaoPdf, setDataGeracaoPdf] = useState("");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleRendaChange = (e) => {
    const valor = parseFloat(e.target.value);
    if (valor > 15000) {
      setErro("O valor máximo permitido é R$ 15.000,00");
      setRenda(15000);
    } else {
      setErro("");
      setRenda(e.target.value);
    }
  };

  const calcularComparativo = async () => {
    const rendaNum = parseFloat(renda);
    const custosNum = parseFloat(custos);

    if (isNaN(rendaNum) || isNaN(custosNum)) {
      setResultado("Por favor, insira valores válidos.");
      return;
    }

    try {
      const response = await api.post("/calculos", {
        tipoProfissao: profissao,
        faturamento: rendaNum,
        custos: custosNum
      });

      const { impostoPF, impostoPJ, melhorOpcao, economiaMensal } = response.data.calculo;

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

      setResultado({
        pf: { base: basePF, faixa: faixaPF, parcelaDedutivel, imposto: impostoPF },
        pj: { simples: rendaNum * (profissao === "advogado" ? 0.045 : 0.06), aliquota: aliquotaPJ, salarioBase, inss, total: impostoPJ },
        maisVantajoso: melhorOpcao,
        siglaVencedora,
        diferenca: economiaMensal
      });

      setMostrarEmail(false);
      setMensagemEnvio("");

    } catch (error) {
      console.error("Erro ao salvar comparativo no banco:", error);
      const mensagemErro = error.response?.data?.error || "Erro ao processar o comparativo no servidor.";
      setResultado(mensagemErro);
    }
  };

  const enviarEmail = () => {
    if (!email.includes("@")) {
      setMensagemEnvio("Por favor, insira um e-mail válido.");
      return;
    }
    setMensagemEnvio(`Resultados simulados e enviados para ${email} com sucesso!`);
    setEmail("");
  };

  const gerarPDF = async () => {
    setGerandoPdf(true);
    setDataGeracaoPdf(new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date()));
    const elemento = document.getElementById("resultado-comparativo");
    
    if (!elemento) {
      console.error("Erro interno: A div do PDF não foi encontrada.");
      setGerandoPdf(false);
      return;
    }

    try {
      await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      const opcoes = {
        margin:       10,
        filename:     `Comparativo_Tributario_${profissao}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          onclone: (documentoClonado) => normalizarCoresPdf(documentoClonado),
        },
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak:    { mode: ["css", "legacy"], before: [".pdf-pagina-memoria"], avoid: ["tr"] }
      };

      await html2pdf().set(opcoes).from(elemento).save();
    } catch (error) {
      console.error("Falha ao processar o arquivo PDF:", error);
    } finally {
      setGerandoPdf(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#EFEFEF]">
      
      <main className="flex-grow flex flex-col items-center py-10 px-4">
        {/* CABEÇALHO DA PÁGINA */}
        <div className={`text-center mb-8 transition-all duration-[700ms] ease-out delay-[200ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="text-3xl font-bold text-[#132436] mb-2">Descubra onde você paga menos impostos</h1>
          <p className="text-[#B2B2B2] font-medium max-w-xl mx-auto">
            Preencha os dados abaixo e o sistema fará um raio-x completo comparando o regime como Autônomo (PF) e como Empresa (PJ).
          </p>
        </div>

        {/* CONTAINER DOS INPUTS */}
        <div
          className={`w-full max-w-4xl bg-white rounded-3xl shadow-xl border border-gray-200 transition-all duration-[700ms] ease-out delay-[400ms] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
          }`}
        >
          <div className="p-6 md:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
            <div className="w-full">
              <label className="block mb-2 text-sm font-medium text-[#132436]">Sua Profissão</label>
              <select
                value={profissao}
                onChange={(e) => setProfissao(e.target.value)}
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#CD371F] outline-none transition cursor-pointer"
              >
                <option value="psicologo">Psicólogo(a)</option>
                <option value="arquiteto">Arquiteto(a)</option>
                <option value="advogado">Advogado(a)</option>
              </select>
            </div>

            <div className="w-full">
              <div className="relative flex items-center gap-1 mb-2">
                <label className="text-sm font-medium text-[#132436]">Renda Mensal (R$)</label>
                <button
                  type="button"
                  className="text-gray-400 hover:text-[#132436] focus:outline-none cursor-help"
                  onMouseEnter={() => setShowTooltipRenda(true)}
                  onMouseLeave={() => setShowTooltipRenda(false)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </button>
                {showTooltipRenda && <div className="absolute z-10 w-64 p-3 text-sm text-white bg-[#132436] rounded-xl shadow-lg -top-2 left-full ml-2 border border-gray-200">Sua receita bruta total prevista para o mês.</div>}
              </div>
              <input
                type="number"
                value={renda}
                onChange={handleRendaChange}
                max="15000"
                placeholder="Ex: 5000"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#CD371F] outline-none transition"
              />
              {erro && <p className="text-[#CD371F] text-xs mt-1 absolute font-medium">{erro}</p>}
            </div>

            <div className="w-full">
              <div className="relative flex items-center gap-1 mb-2">
                <label className="text-sm font-medium text-[#132436]">Custos Dedutíveis (R$)</label>
                <button
                  type="button"
                  className="text-gray-400 hover:text-[#132436] focus:outline-none cursor-help"
                  onMouseEnter={() => setShowTooltipCustos(true)}
                  onMouseLeave={() => setShowTooltipCustos(false)}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" /></svg>
                </button>
                {showTooltipCustos && <div className="absolute z-10 w-64 p-3 text-sm text-white bg-[#132436] rounded-xl shadow-lg -top-2 right-full mr-2 border border-gray-200">Despesas do seu negócio (aluguel, internet, etc). Usado apenas para abater a base da PF.</div>}
              </div>
              <input
                type="number"
                value={custos}
                onChange={(e) => setCustos(e.target.value)}
                placeholder="Ex: 800"
                className="w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-[#CD371F] outline-none transition"
              />
            </div>
          </div>

          <div className="px-6 md:px-8 pb-8">
            <button onClick={calcularComparativo} className="w-full bg-[#CD371F] text-white font-bold py-4 rounded-xl hover:bg-[#a62b18] hover:scale-[1.01] transition-all duration-[400ms] ease-out shadow-md text-lg cursor-pointer">
              Analisar Vantagem Tributária
            </button>
          </div>

          {/* ÁREA DE RESULTADOS E PDF */}
          {resultado && typeof resultado === "string" ? (
            <p className="text-[#CD371F] font-medium text-center pb-8">{resultado}</p>
          ) : resultado && (
            <div className="border-t border-gray-200 bg-gray-50 rounded-b-3xl">
              <div id="resultado-comparativo" className="p-6 md:p-8 bg-[#ffffff]">
                <header className="mb-6 border-b-2 border-[#132436] pb-5 text-center" style={{ breakInside: "avoid" }}>
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-[#CD371F]">NAF — Núcleo de Apoio Contábil e Fiscal</p>
                  <p className="mt-1 text-sm font-bold text-[#132436]">Universidade Christus</p>
                  <h2 className="mt-4 text-2xl font-bold leading-tight text-[#132436]">Relatório Comparativo de Tributação</h2>
                  <p className="mt-1 text-base font-medium text-gray-600">Pessoa Física x Pessoa Jurídica</p>
                  <p className="mt-3 text-xs text-gray-500">Emitido em {dataGeracaoPdf || "data e hora registradas ao baixar o PDF"}</p>
                </header>

                <section className="mb-6 rounded-xl bg-gray-50 p-4" style={{ breakInside: "avoid" }}>
                  <h3 className="mb-2 font-bold text-[#132436]">Dados da simulação</h3>
                  <p className="text-sm text-gray-700">Profissão: {nomesProfissao[profissao] || profissao}</p>
                  <p className="text-sm text-gray-700">Renda/faturamento mensal: {formatarMoeda(Number(renda))}</p>
                  <p className="text-sm text-gray-700">Custos dedutíveis informados: {formatarMoeda(Number(custos))}</p>
                </section>

                <div className="mb-6 rounded-2xl border-l-4 p-5 text-center" style={{ borderColor: resultado.siglaVencedora === 'PJ' ? '#22c55e' : '#3b82f6', backgroundColor: resultado.siglaVencedora === 'PJ' ? '#f0fdf4' : '#eff6ff', breakInside: "avoid" }}>
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-600">Cenário mais vantajoso</h3>
                  <p className="mt-1 text-2xl font-extrabold text-[#132436]">{resultado.maisVantajoso}</p>
                  <p className="mt-2 text-sm text-gray-700">Economia mensal estimada de <strong className="text-lg tabular-nums">{formatarMoeda(resultado.diferenca)}</strong></p>
                </div>

                <h4 className="mb-3 text-center text-sm font-bold uppercase tracking-wider text-[#132436]">Resumo da comparação</h4>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2" style={{ breakInside: "avoid" }}>
                  <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ borderTop: "3px solid #2563eb", breakInside: "avoid" }}>
                    <h3 className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 font-bold text-[#132436]">Pessoa Física (PF) {resultado.siglaVencedora === 'PF' && <span className="rounded-full bg-blue-50 px-2 py-1 text-[10px] uppercase text-blue-700">Mais vantajosa</span>}</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between gap-3"><span>Base de cálculo</span><span className="font-medium tabular-nums">{formatarMoeda(resultado.pf.base)}</span></div>
                      <div className="flex justify-between gap-3"><span>Faixa IRPF</span><span className="font-medium">{resultado.pf.faixa}</span></div>
                      <div className="flex justify-between gap-3"><span>Dedução permitida</span><span className="font-medium tabular-nums">− {formatarMoeda(resultado.pf.parcelaDedutivel)}</span></div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-gray-200 pt-3"><span className="font-bold text-[#132436]">Total mensal</span><span className="text-xl font-extrabold tabular-nums text-[#132436]">{formatarMoeda(resultado.pf.imposto)}</span></div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ borderTop: "3px solid #CD371F", breakInside: "avoid" }}>
                    <h3 className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 font-bold text-[#132436]">Pessoa Jurídica (PJ) {resultado.siglaVencedora === 'PJ' && <span className="rounded-full bg-green-50 px-2 py-1 text-[10px] uppercase text-green-700">Mais vantajosa</span>}</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      <div className="flex justify-between gap-3"><span>Simples Nacional ({resultado.pj.aliquota})</span><span className="font-medium tabular-nums">{formatarMoeda(resultado.pj.simples)}</span></div>
                      <div className="flex justify-between gap-3"><span>Base do pró-labore</span><span className="font-medium tabular-nums">{formatarMoeda(resultado.pj.salarioBase)}</span></div>
                      <div className="flex justify-between gap-3"><span>INSS (11%)</span><span className="font-medium tabular-nums">{formatarMoeda(resultado.pj.inss)}</span></div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-gray-200 pt-3"><span className="font-bold text-[#132436]">Total mensal</span><span className="text-xl font-extrabold tabular-nums text-[#132436]">{formatarMoeda(resultado.pj.total)}</span></div>
                  </div>
                </div>

                <section className="mx-auto mt-5 max-w-2xl" style={{ breakInside: "avoid" }}>
                  <GraficoComparativo impostoPF={resultado.pf.imposto} impostoPJ={resultado.pj.total} />
                </section>

                <section className="pdf-pagina-memoria mt-8" style={{ breakBefore: "page", pageBreakBefore: "always" }}>
                  <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-[#132436] pb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#CD371F]">NAF · Universidade Christus</p>
                      <h3 className="mt-1 text-xl font-bold text-[#132436]">Memória de Cálculo</h3>
                    </div>
                    <p className="text-right text-xs text-gray-500">Continuação do relatório<br />Emitido em {dataGeracaoPdf}</p>
                  </div>
                  <div className="mb-5 grid grid-cols-3 gap-2 rounded-xl bg-gray-50 p-3 text-center" style={{ breakInside: "avoid" }}>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total PF</p><p className="mt-1 text-sm font-bold tabular-nums text-[#132436]">{formatarMoeda(resultado.pf.imposto)}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total PJ</p><p className="mt-1 text-sm font-bold tabular-nums text-[#132436]">{formatarMoeda(resultado.pj.total)}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Diferença mensal</p><p className="mt-1 text-sm font-bold tabular-nums text-[#132436]">{formatarMoeda(resultado.diferenca)}</p></div>
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-gray-600">Detalhamento dos tributos, bases e parâmetros informados nesta simulação.</p>
                  <h4 className="mb-2 text-base font-bold text-[#132436]" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>Pessoa Física (PF)</h4>
                  <div className="pdf-tabela mb-6 overflow-hidden rounded-xl border border-gray-300">
                    <table className="w-full table-fixed border-collapse text-left text-xs">
                      <colgroup><col style={{ width: "21%" }} /><col style={{ width: "25%" }} /><col style={{ width: "34%" }} /><col style={{ width: "20%" }} /></colgroup>
                      <thead className="bg-gray-100 text-[#132436]"><tr><th className="p-3 font-semibold">Tributo</th><th className="p-3 font-semibold">Base de cálculo</th><th className="p-3 font-semibold">Alíquota / faixa</th><th className="p-3 font-semibold">Valor</th></tr></thead>
                      <tbody><tr className="border-t border-gray-200" style={{ breakInside: "avoid" }}><td className="p-3 align-top font-medium">IRPF</td><td className="p-3 align-top tabular-nums">{formatarMoeda(resultado.pf.base)}</td><td className="p-3 align-top">{resultado.pf.faixa}{resultado.pf.parcelaDedutivel ? ` · parcela a deduzir: ${formatarMoeda(resultado.pf.parcelaDedutivel)}` : ""}</td><td className="p-3 align-top font-semibold tabular-nums">{formatarMoeda(resultado.pf.imposto)}</td></tr></tbody>
                    </table>
                  </div>
                  <h4 className="mb-2 text-base font-bold text-[#132436]" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>Pessoa Jurídica (PJ)</h4>
                  <div className="pdf-tabela overflow-hidden rounded-xl border border-gray-300">
                    <table className="w-full table-fixed border-collapse text-left text-xs">
                      <colgroup><col style={{ width: "25%" }} /><col style={{ width: "25%" }} /><col style={{ width: "20%" }} /><col style={{ width: "30%" }} /></colgroup>
                      <thead className="bg-gray-100 text-[#132436]"><tr><th className="p-3 font-semibold">Tributo</th><th className="p-3 font-semibold">Base de cálculo</th><th className="p-3 font-semibold">Alíquota</th><th className="p-3 font-semibold">Valor calculado</th></tr></thead>
                      <tbody>
                        <tr className="border-t border-gray-200" style={{ breakInside: "avoid" }}><td className="p-3 align-top font-medium">Simples Nacional</td><td className="p-3 align-top tabular-nums">{formatarMoeda(Number(renda))}</td><td className="p-3 align-top">{resultado.pj.aliquota}</td><td className="p-3 align-top font-semibold tabular-nums">{formatarMoeda(resultado.pj.simples)}</td></tr>
                        <tr className="border-t border-gray-200" style={{ breakInside: "avoid" }}><td className="p-3 align-top font-medium">INSS sobre pró-labore</td><td className="p-3 align-top tabular-nums">{formatarMoeda(resultado.pj.salarioBase)}</td><td className="p-3 align-top">11%</td><td className="p-3 align-top font-semibold tabular-nums">{formatarMoeda(resultado.pj.inss)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="mt-4 text-xs leading-relaxed text-gray-600">A aplicação não disponibiliza neste resultado uma memória adicional de faixas progressivas ou outros componentes além dos itens listados.</p>
                </section>

                <footer className="mt-7 border-t border-gray-300 pt-4 text-xs leading-relaxed text-gray-600" style={{ breakInside: "avoid" }}>
                  <p><strong>Estimativa:</strong> Os valores apresentados neste relatório são estimativas calculadas com base nas informações fornecidas pelo usuário e nas regras consideradas pela aplicação. Este documento possui finalidade informativa e não substitui uma análise contábil ou orientação profissional individualizada.</p>
                </footer>
              </div>

              <div className="px-6 md:px-8 pb-8 pt-4 flex flex-col gap-4 border-t border-gray-200">
                <button onClick={gerarPDF} disabled={gerandoPdf} className={`w-full bg-[#132436] text-white font-bold py-3 rounded-xl transition-all duration-[400ms] shadow-md flex items-center justify-center gap-2 cursor-pointer ${gerandoPdf ? 'opacity-70 cursor-wait' : 'hover:bg-[#0c1825] hover:-translate-y-1'}`}>
                  <svg className={`w-5 h-5 ${gerandoPdf ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {gerandoPdf ? "Processando e Baixando PDF..." : "Baixar Relatório Oficial em PDF"}
                </button>

                <div className="text-center mt-2">
                  <button onClick={() => setMostrarEmail(!mostrarEmail)} className="text-sm font-bold text-gray-500 hover:text-[#132436] transition-colors underline cursor-pointer bg-transparent border-none">Deseja enviar os resultados para o seu e-mail?</button>
                </div>

                {mostrarEmail && (
                  <div className="mt-2 space-y-3 p-4 bg-white border border-gray-300 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-[#132436]">Qual e-mail deve receber a simulação?</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@exemplo.com" className="flex-grow border border-gray-300 px-4 py-2 rounded-xl focus:ring-2 focus:ring-[#132436] outline-none text-sm" />
                      <button onClick={enviarEmail} className="bg-[#CD371F] text-white px-6 py-2 rounded-xl hover:bg-[#a62b18] transition text-sm font-bold cursor-pointer shadow-sm">Enviar Agora</button>
                    </div>
                    {mensagemEnvio && <p className="text-sm font-bold text-green-600">{mensagemEnvio}</p>}
                  </div>
                )}
              </div>

              <div className="px-6 md:px-8 pb-8 pt-6 border-t border-gray-200 bg-white rounded-b-3xl">
                <div className="text-center mb-4">
                  <h4 className="font-bold text-[#132436] uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-[#CD371F]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    Conteúdo Recomendado Para Você
                  </h4>
                  <p className="text-sm text-gray-500">Separamos este vídeo do Sebrae para te ajudar a entender melhor o regime {resultado.siglaVencedora}.</p>
                </div>
                
                <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg border border-gray-200">
                  {resultado.siglaVencedora === 'PJ' ? (
                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/yMlNDLDlk2c" title="Como funciona o Simples Nacional" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  ) : (
                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/QtPQq3di4xI" title="Como fazer o Carnê-Leão e Livro Caixa" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
