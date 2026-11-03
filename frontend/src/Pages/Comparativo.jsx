import { useState } from "react";
import Footer from "../components/Footer";
import { Link, Navigate } from "react-router-dom";
import html2pdf from "html2pdf.js";
import api from "../services/api";
import GraficoComparativo from "../components/GraficoComparativo";

const formatarMoeda = (valor) => Number.isFinite(valor) ? valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }) : "Não disponível";
const formatarPercentual = (valor) => Number.isFinite(valor) ? new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(valor) : "Não disponível";
const nomesProfissao = {
  psicologo: "Psicólogo(a)",
  arquiteto: "Arquiteto(a)",
  advogado: "Advogado(a)",
  medico: "Médico(a)",
  dentista: "Dentista"
};

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

export default function Comparativo({ simulacao }) {
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagemEnvio, setMensagemEnvio] = useState("");
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [dataGeracaoPdf, setDataGeracaoPdf] = useState("");
  const [erroPdf, setErroPdf] = useState("");
  const calculo = simulacao?.calculo;
  const resultado = simulacao?.resultado;
  const profissao = calculo?.tipoProfissao;

  const enviarEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMensagemEnvio("Por favor, insira um e-mail válido.");
      return;
    }
    setEnviandoEmail(true);
    setMensagemEnvio("");
    try {
      const { data } = await api.post("/emails/comparativo", { email, calculoId: calculo.id });
      setMensagemEnvio(data.message);
    } catch (error) {
      setMensagemEnvio(error.response?.data?.error || "Não foi possível enviar o e-mail.");
    } finally {
      setEnviandoEmail(false);
    }
  };

  const gerarPDF = async () => {
    setErroPdf("");
    setGerandoPdf(true);
    setDataGeracaoPdf(new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short" }).format(new Date()));
    const elemento = document.getElementById("resultado-comparativo");
    
    if (!elemento) {
      setErroPdf("Não foi possível localizar o relatório para gerar o PDF.");
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
        pagebreak:    { mode: ["css"], before: [".pdf-pagina-memoria"], avoid: ["tr"] }
      };

      const worker = html2pdf().set(opcoes).from(elemento).toContainer();
      const workerComQuebraValidada = worker.get("container", (container) => {
        const memoria = container.querySelector(".pdf-pagina-memoria");
        const espacador = memoria?.previousElementSibling;
        const alturaEspacador = Number.parseFloat(espacador?.style.height || "");
        const alturaPagina = worker.prop.pageSize.inner.px.height;

        if (
          !memoria ||
          !espacador ||
          espacador.style.display !== "block" ||
          !Number.isFinite(alturaEspacador)
        ) return;

        // O pagebreak do html2pdf insere uma página inteira quando o alvo já
        // começa numa página posterior. Nesse caso, a quebra é desnecessária.
        const inicioSemEspacador = memoria.getBoundingClientRect().top - alturaEspacador;
        if (Math.floor(inicioSemEspacador / alturaPagina) >= 1) espacador.remove();
      });

      await workerComQuebraValidada.toCanvas().toPdf().save();
    } catch (error) {
      console.error("Falha ao processar o arquivo PDF:", error);
      setErroPdf("Não foi possível gerar o PDF. Tente novamente.");
    } finally {
      setGerandoPdf(false);
    }
  };

  if (!simulacao) return <Navigate to="/" replace />;

  return (
    <div className="flex min-h-screen flex-col bg-naf-light">
      <main className="mx-auto w-full max-w-4xl flex-grow px-4 py-10 text-naf-blue">
        <h1 className="mb-4 text-3xl font-bold">Comparativo PF × PJ</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <Link to="/" className="underline">Voltar ao formulário</Link>
          <Link to="/historico" className="underline">Ver histórico</Link>
        </div>
        <div className="rounded-3xl border-t border-gray-200 bg-gray-50 shadow-xl">
              <div id="resultado-comparativo" className="tema-papel rounded-t-3xl bg-white p-4 sm:p-6 md:p-8">
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
                  <p className="text-sm text-gray-700">Renda/faturamento mensal: {formatarMoeda(calculo.faturamento)}</p>
                  {calculo.custos !== null && calculo.custos !== undefined && <p className="text-sm text-gray-700">Custos dedutíveis informados: {formatarMoeda(calculo.custos)}</p>}
                  {resultado.pj.fatorR !== null && resultado.pj.fatorR !== undefined && <p className="text-sm text-gray-700">Folha mensal informada para o Fator R: {formatarMoeda(resultado.pj.folha)}</p>}
                </section>

                <div className="mb-6 rounded-2xl border-l-4 p-5 text-center" style={{ borderColor: resultado.siglaVencedora === 'PJ' ? '#CD371F' : '#3b82f6', backgroundColor: resultado.siglaVencedora === 'PJ' ? '#fef2f2' : '#eff6ff', breakInside: "avoid" }}>
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
                      {resultado.pf.faixa && <div className="flex justify-between gap-3"><span>Faixa IRPF</span><span className="font-medium">{resultado.pf.faixa}</span></div>}
                      <div className="flex justify-between gap-3"><span>Dedução permitida</span><span className="font-medium tabular-nums">− {formatarMoeda(resultado.pf.parcelaDedutivel)}</span></div>
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-gray-200 pt-3"><span className="font-bold text-[#132436]">Total mensal</span><span className="text-xl font-extrabold tabular-nums text-[#132436]">{formatarMoeda(resultado.pf.imposto)}</span></div>
                  </div>

                  <div className="rounded-xl border border-gray-200 bg-white p-4" style={{ borderTop: "3px solid #CD371F", breakInside: "avoid" }}>
                    <h3 className="mb-3 flex items-center justify-between border-b border-gray-200 pb-2 font-bold text-[#132436]">Pessoa Jurídica (PJ) {resultado.siglaVencedora === 'PJ' && <span className="rounded-full bg-red-50 px-2 py-1 text-[10px] uppercase text-red-700">Mais vantajosa</span>}</h3>
                    <div className="space-y-2 text-sm text-gray-700">
                      {resultado.pj.simples !== null && <div className="flex justify-between gap-3"><span>Simples Nacional · {resultado.pj.anexo || "anexo não registrado"} ({resultado.pj.aliquota || "alíquota não disponível"})</span><span className="font-medium tabular-nums">{formatarMoeda(resultado.pj.simples)}</span></div>}
                      {resultado.pj.fatorR !== null && resultado.pj.fatorR !== undefined && <div className="flex justify-between gap-3"><span>Fator R</span><span className="font-medium tabular-nums">{formatarPercentual(resultado.pj.fatorR)}</span></div>}
                      {resultado.pj.salarioBase !== null && <div className="flex justify-between gap-3"><span>Base do pró-labore</span><span className="font-medium tabular-nums">{formatarMoeda(resultado.pj.salarioBase)}</span></div>}
                      {resultado.pj.inss !== null && <div className="flex justify-between gap-3"><span>INSS (11%)</span><span className="font-medium tabular-nums">{formatarMoeda(resultado.pj.inss)}</span></div>}
                    </div>
                    <div className="mt-4 flex items-baseline justify-between gap-3 border-t border-gray-200 pt-3"><span className="font-bold text-[#132436]">Total mensal</span><span className="text-xl font-extrabold tabular-nums text-[#CD371F]">{formatarMoeda(resultado.pj.total)}</span></div>
                  </div>
                </div>

                <section className="mx-auto mt-5 max-w-2xl" style={{ breakInside: "avoid" }}>
                  <GraficoComparativo impostoPF={resultado.pf.imposto} impostoPJ={resultado.pj.total} />
                </section>

                <section className="pdf-pagina-memoria mt-8">
                  <div className="mb-5 flex items-end justify-between gap-4 border-b-2 border-[#132436] pb-3">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#CD371F]">NAF · Universidade Christus</p>
                      <h3 className="mt-1 text-xl font-bold text-[#132436]">Memória de Cálculo</h3>
                    </div>
                    <p className="text-right text-xs text-gray-500">Continuação do relatório<br />Emitido em {dataGeracaoPdf}</p>
                  </div>
                  <div className="mb-5 grid grid-cols-1 gap-2 rounded-xl bg-gray-50 p-3 text-center sm:grid-cols-3" style={{ breakInside: "avoid" }}>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total PF</p><p className="mt-1 text-sm font-bold tabular-nums text-[#132436]">{formatarMoeda(resultado.pf.imposto)}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Total PJ</p><p className="mt-1 text-sm font-bold tabular-nums text-[#132436]">{formatarMoeda(resultado.pj.total)}</p></div>
                    <div><p className="text-[10px] font-semibold uppercase tracking-wide text-gray-500">Diferença mensal</p><p className="mt-1 text-sm font-bold tabular-nums text-[#132436]">{formatarMoeda(resultado.diferenca)}</p></div>
                  </div>
                  <p className="mb-5 text-sm leading-relaxed text-gray-600">Detalhamento dos tributos, bases e parâmetros informados nesta simulação.</p>
                  <div className="mb-5 rounded-xl border border-gray-200 bg-white p-4" style={{ breakInside: "avoid" }}>
                    <h4 className="mb-2 font-bold text-[#132436]">Enquadramento da Pessoa Jurídica</h4>
                    <p className="text-sm text-gray-700">{resultado.pj.anexo || "Anexo não registrado neste cálculo"}{resultado.pj.aliquota ? ` · alíquota do Simples Nacional: ${resultado.pj.aliquota}` : ""}</p>
                    {resultado.pj.fatorR !== null && resultado.pj.fatorR !== undefined && (
                      <div className="mt-2 space-y-1 text-sm text-gray-700">
                        <p>Folha mensal informada: {formatarMoeda(resultado.pj.folha)}</p>
                        <p>Faturamento mensal considerado: {formatarMoeda(calculo.faturamento)}</p>
                        <p>Fator R aplicado pelo cálculo M2 (folha ÷ faturamento): {formatarPercentual(resultado.pj.fatorR)}</p>
                        <p className="text-xs text-gray-500">O motor M2 usa os valores mensais informados para calcular a razão do Fator R.</p>
                      </div>
                    )}
                  </div>
                  <h4 className="mb-2 text-base font-bold text-[#132436]" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>Pessoa Física (PF)</h4>
                  <div className="pdf-tabela mb-6 overflow-hidden rounded-xl border border-gray-300">
                    <table className="w-full table-fixed border-collapse text-left text-xs">
                      <colgroup><col style={{ width: "21%" }} /><col style={{ width: "25%" }} /><col style={{ width: "34%" }} /><col style={{ width: "20%" }} /></colgroup>
                      <thead className="bg-gray-100 text-[#132436]"><tr><th className="p-3 font-semibold">Tributo</th><th className="p-3 font-semibold">Base de cálculo</th><th className="p-3 font-semibold">Alíquota / faixa</th><th className="p-3 font-semibold">Valor</th></tr></thead>
                      <tbody><tr className="border-t border-gray-200" style={{ breakInside: "avoid" }}><td className="p-3 align-top font-medium">IRPF</td><td className="p-3 align-top tabular-nums">{formatarMoeda(resultado.pf.base)}</td><td className="p-3 align-top">{resultado.pf.faixa || "Faixa não disponível"}{resultado.pf.parcelaDedutivel ? ` · parcela a deduzir: ${formatarMoeda(resultado.pf.parcelaDedutivel)}` : ""}</td><td className="p-3 align-top font-semibold tabular-nums">{formatarMoeda(resultado.pf.imposto)}</td></tr></tbody>
                    </table>
                  </div>
                  <h4 className="mb-2 text-base font-bold text-[#132436]" style={{ breakAfter: "avoid", pageBreakAfter: "avoid" }}>Pessoa Jurídica (PJ)</h4>
                  <div className="pdf-tabela overflow-hidden rounded-xl border border-gray-300">
                    <table className="w-full table-fixed border-collapse text-left text-xs">
                      <colgroup><col style={{ width: "25%" }} /><col style={{ width: "25%" }} /><col style={{ width: "20%" }} /><col style={{ width: "30%" }} /></colgroup>
                      <thead className="bg-gray-100 text-[#132436]"><tr><th className="p-3 font-semibold">Tributo</th><th className="p-3 font-semibold">Base de cálculo</th><th className="p-3 font-semibold">Alíquota</th><th className="p-3 font-semibold">Valor calculado</th></tr></thead>
                      <tbody>
                        {resultado.pj.simples !== null && <tr className="border-t border-gray-200" style={{ breakInside: "avoid" }}><td className="p-3 align-top font-medium">Simples Nacional · {resultado.pj.anexo || "anexo não registrado"}</td><td className="p-3 align-top tabular-nums">{formatarMoeda(calculo.faturamento)}</td><td className="p-3 align-top">{resultado.pj.aliquota || "Não disponível"}</td><td className="p-3 align-top font-semibold tabular-nums">{formatarMoeda(resultado.pj.simples)}</td></tr>}
                        {resultado.pj.salarioBase !== null && resultado.pj.inss !== null && <tr className="border-t border-gray-200" style={{ breakInside: "avoid" }}><td className="p-3 align-top font-medium">INSS sobre pró-labore</td><td className="p-3 align-top tabular-nums">{formatarMoeda(resultado.pj.salarioBase)}</td><td className="p-3 align-top">11%</td><td className="p-3 align-top font-semibold tabular-nums">{formatarMoeda(resultado.pj.inss)}</td></tr>}
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
                <button type="button" onClick={gerarPDF} disabled={gerandoPdf} className={`w-full rounded-xl bg-naf-blue py-3 font-bold text-white shadow-md transition-all duration-[400ms] ${gerandoPdf ? 'cursor-wait opacity-70' : 'cursor-pointer hover:-translate-y-1 hover:bg-[#0c1825]'}`}>
                  <svg className={`w-5 h-5 ${gerandoPdf ? 'animate-bounce' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path></svg>
                  {gerandoPdf ? "Processando e Baixando PDF..." : "Baixar Relatório Oficial em PDF"}
                </button>

                <div className="text-center mt-2">
                  <button type="button" onClick={() => setMostrarEmail(!mostrarEmail)} aria-expanded={mostrarEmail} aria-controls="formulario-email-comparativo" className="border-none bg-transparent text-sm font-bold text-gray-700 underline transition-colors hover:text-naf-blue">Deseja enviar os resultados para o seu e-mail?</button>
                </div>

                {mostrarEmail && (
                  <div id="formulario-email-comparativo" className="mt-2 space-y-3 rounded-xl border border-gray-300 bg-white p-4 shadow-sm">
                    <label htmlFor="comparativo-email" className="block text-sm font-medium text-naf-blue">Qual e-mail deve receber a simulação?</label>
                    <div className="flex flex-col sm:flex-row gap-2">
                      <input id="comparativo-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setMensagemEnvio(""); }} placeholder="contato@exemplo.com" aria-invalid={mensagemEnvio.startsWith("Por favor")} aria-describedby="comparativo-email-message" className="min-w-0 flex-grow rounded-xl border border-gray-300 px-4 py-2 text-sm focus:ring-2 focus:ring-naf-blue" />
                      <button type="button" onClick={enviarEmail} disabled={enviandoEmail} className="rounded-xl bg-naf-red px-6 py-2 text-sm font-bold text-white shadow-sm transition hover:bg-[#a62b18] disabled:cursor-wait disabled:opacity-60">{enviandoEmail ? "Enviando..." : "Enviar Agora"}</button>
                    </div>
                    <p id="comparativo-email-message" role={mensagemEnvio && !mensagemEnvio.startsWith("Por favor") && mensagemEnvio.startsWith("Não") ? "alert" : "status"} aria-live={mensagemEnvio.startsWith("Não") ? "assertive" : "polite"} className={`text-sm font-bold ${mensagemEnvio.startsWith("Por favor") || mensagemEnvio.startsWith("Não") ? "text-naf-red" : "text-green-700"}`}>{mensagemEnvio}</p>
                  </div>
                )}
                {erroPdf && <p role="alert" aria-live="assertive" className="text-sm font-medium text-naf-red">{erroPdf}</p>}
              </div>

              <div className="px-6 md:px-8 pb-8 pt-6 border-t border-naf-line bg-naf-surface rounded-b-3xl">
                <div className="text-center mb-4">
                  <h3 className="font-bold text-naf-ink uppercase tracking-wider text-sm flex items-center justify-center gap-2">
                    <svg className="w-5 h-5 text-naf-alert" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" /></svg>
                    Conteúdo Recomendado Para Você
                  </h3>
                  <p className="text-sm text-naf-gray">Separamos este vídeo do Sebrae para te ajudar a entender melhor o regime {resultado.siglaVencedora}.</p>
                </div>
                
                <div className="aspect-video w-full max-w-2xl mx-auto rounded-xl overflow-hidden shadow-lg border border-naf-line">
                  {resultado.siglaVencedora === 'PJ' ? (
                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/yMlNDLDlk2c" title="Como funciona o Simples Nacional" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  ) : (
                    <iframe className="w-full h-full" src="https://www.youtube.com/embed/QtPQq3di4xI" title="Como fazer o Carnê-Leão e Livro Caixa" frameBorder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen></iframe>
                  )}
                </div>
              </div>
            </div>
      </main>
      <Footer />
    </div>
  );
}
