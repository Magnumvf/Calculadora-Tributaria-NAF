import api from "../services/api";
import { useState } from "react";
import { Link, Navigate } from "react-router-dom";
import Footer from "../components/Footer";
import html2pdf from "html2pdf.js";

export default function Comparativo({ simulacao }) {
  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagemEnvio, setMensagemEnvio] = useState("");
  const [gerandoPdf, setGerandoPdf] = useState(false);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const resultado = simulacao?.resultado;
  const profissao = simulacao?.calculo.tipoProfissao;

  const enviarEmail = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setMensagemEnvio("Por favor, insira um e-mail válido.");
      return;
    }
    setEnviandoEmail(true);
    setMensagemEnvio("");
    try {
      const { data } = await api.post("/emails/comparativo", { email, calculoId: simulacao.calculo.id });
      setMensagemEnvio(data.message);
    } catch (error) {
      setMensagemEnvio(error.response?.data?.error || "Não foi possível enviar o e-mail.");
    } finally {
      setEnviandoEmail(false);
    }
  };

  const gerarPDF = async () => {
    setGerandoPdf(true);
    const elemento = document.getElementById("resultado-comparativo");
    
    if (!elemento) {
      console.error("Erro interno: A div do PDF não foi encontrada.");
      setGerandoPdf(false);
      return;
    }

    try {
      const opcoes = {
        margin:       10,
        filename:     `Comparativo_Tributario_${profissao}.pdf`,
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, useCORS: true }, 
        jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };

      await html2pdf().set(opcoes).from(elemento).save();
    } catch (error) {
      console.error("Falha ao processar o arquivo PDF:", error);
    } finally {
      setGerandoPdf(false);
    }
  };

  if (!simulacao) return <Navigate to="/" replace />;

  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-naf-blue mb-4">Comparativo PF × PJ</h1>
        <div className="flex flex-wrap gap-4 mb-6">
          <Link to="/" className="underline text-naf-blue">Voltar ao formulário</Link>
          <Link to="/historico" className="underline text-naf-blue">Ver histórico</Link>
        </div>
            <div className="border-t border-gray-200 bg-gray-50 rounded-b-3xl">
              <div id="resultado-comparativo" className="p-6 md:p-8 bg-[#ffffff]">
                <div className="mb-8 p-6 rounded-2xl border-2 text-center shadow-sm" style={{ borderColor: resultado.siglaVencedora === 'PJ' ? '#22c55e' : '#3b82f6', backgroundColor: resultado.siglaVencedora === 'PJ' ? '#f0fdf4' : '#eff6ff' }}>
                  <h3 className="text-xl font-bold text-[#1f2937] mb-1">A melhor opção para você é:</h3>
                  <p className="text-3xl font-extrabold mb-2" style={{ color: resultado.siglaVencedora === 'PJ' ? '#16a34a' : '#2563eb' }}>{resultado.maisVantajoso}</p>
                  <p className="text-[#374151] font-medium">Atuando como {resultado.siglaVencedora}, você tem uma <span className="font-bold underline decoration-2">economia de R$ {resultado.diferenca.toFixed(2)}</span> todos os meses.</p>
                </div>

                <h4 className="text-center font-bold text-[#132436] mb-4 uppercase tracking-wider text-sm">Resumo Detalhado dos Cálculos</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-5 rounded-xl border-2 shadow-md" style={{ borderColor: resultado.siglaVencedora === 'PF' ? '#3b82f6' : '#e5e7eb', backgroundColor: resultado.siglaVencedora === 'PF' ? '#ffffff' : '#f3f4f6', opacity: resultado.siglaVencedora === 'PF' ? 1 : 0.7 }}>
                    <h3 className="font-bold text-xl text-[#132436] mb-4 border-b border-[#e5e7eb] pb-2 flex items-center justify-between">Pessoa Física (PF) {resultado.siglaVencedora === 'PF' && <span className="text-xs bg-[#eff6ff] text-[#1d4ed8] px-2 py-1 rounded-full uppercase">Recomendado</span>}</h3>
                    <div className="space-y-3 text-sm text-[#374151]">
                      <div className="flex justify-between"><span>Base de Cálculo:</span> <span className="font-semibold">R$ {resultado.pf.base.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Faixa IRPF:</span> <span className="font-semibold">{resultado.pf.faixa}</span></div>
                      <div className="flex justify-between"><span>Dedução Permitida:</span> <span className="font-semibold text-[#16a34a]">- R$ {resultado.pf.parcelaDedutivel.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-[#e5e7eb] flex justify-between items-end"><span className="font-bold text-[#132436]">Custo Mensal:</span><span className="text-2xl font-black text-[#CD371F]">R$ {resultado.pf.imposto.toFixed(2)}</span></div>
                  </div>

                  <div className="p-5 rounded-xl border-2 shadow-md" style={{ borderColor: resultado.siglaVencedora === 'PJ' ? '#22c55e' : '#e5e7eb', backgroundColor: resultado.siglaVencedora === 'PJ' ? '#ffffff' : '#f3f4f6', opacity: resultado.siglaVencedora === 'PJ' ? 1 : 0.7 }}>
                    <h3 className="font-bold text-xl text-[#132436] mb-4 border-b border-[#e5e7eb] pb-2 flex items-center justify-between">Pessoa Jurídica (PJ) {resultado.siglaVencedora === 'PJ' && <span className="text-xs bg-[#f0fdf4] text-[#15803d] px-2 py-1 rounded-full uppercase">Recomendado</span>}</h3>
                    <div className="space-y-3 text-sm text-[#374151]">
                      <div className="flex justify-between"><span>Enquadramento:</span> <span className="font-semibold">{resultado.pj.anexo}</span></div>
                      {resultado.pj.fatorR !== null && (
                        <div className="flex justify-between"><span>Fator R:</span> <span className="font-semibold">{(resultado.pj.fatorR * 100).toFixed(2).replace(".", ",")}%</span></div>
                      )}
                      <div className="flex justify-between"><span>Simples ({resultado.pj.aliquota}):</span> <span className="font-semibold">R$ {resultado.pj.simples.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Pró-labore base:</span> <span className="font-semibold">R$ {resultado.pj.salarioBase.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>INSS Mensal (11%):</span> <span className="font-semibold">R$ {resultado.pj.inss.toFixed(2)}</span></div>
                    </div>
                    <div className="mt-5 pt-3 border-t border-[#e5e7eb] flex justify-between items-end"><span className="font-bold text-[#132436]">Custo Mensal:</span><span className="text-2xl font-black text-[#CD371F]">R$ {resultado.pj.total.toFixed(2)}</span></div>
                  </div>
                </div>
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
                      <button disabled={enviandoEmail} onClick={enviarEmail} className="bg-[#CD371F] text-white px-6 py-2 rounded-xl hover:bg-[#a62b18] transition text-sm font-bold cursor-pointer shadow-sm">{enviandoEmail ? "Enviando..." : "Enviar agora"}</button>
                    </div>
                    {mensagemEnvio && <p role="status" className="text-sm font-medium text-naf-blue">{mensagemEnvio}</p>}
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
      </main>
      <Footer />
    </div>
  );
}
