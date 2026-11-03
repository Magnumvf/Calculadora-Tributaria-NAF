import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { gerarCsvHistorico, nomeArquivoHistorico } from "../utils/historicoCsv";

export default function Historico({ abrirSimulacao }) {
  const [calculos, setCalculos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [mensagemExportacao, setMensagemExportacao] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  
  const token = localStorage.getItem("token");
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/login", { replace: true, state: { from: "/historico" } });
    }
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const buscarHistorico = async () => {
      try {
        const response = await api.get("/calculos/historico");
        setCalculos(response.data);
      } catch (err) {
        console.error("Erro ao buscar histórico:", err);
        setErro("Não foi possível carregar o seu histórico de simulações.");
      } finally {
        setCarregando(false);
      }
    };

    if (token) buscarHistorico();
  }, [token]);

  const exportarHistorico = () => {
    if (calculos.length === 0) {
      setMensagemExportacao("Não há simulações para exportar.");
      return;
    }

    try {
      const arquivo = new Blob([gerarCsvHistorico(calculos)], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(arquivo);
      const link = document.createElement("a");
      link.href = url;
      link.download = nomeArquivoHistorico();
      link.style.display = "none";
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setMensagemExportacao(`${calculos.length} simulação(ões) exportada(s).`);
    } catch (exportError) {
      console.error("Erro ao exportar histórico:", exportError);
      setMensagemExportacao("Não foi possível gerar o arquivo CSV.");
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-naf-light">

      <main className="flex flex-grow flex-col items-center px-4 py-10">
        {/* Cabeçalho */}
        <div className={`text-center mb-8 transition-all duration-[700ms] ease-out delay-[200ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          <h1 className="mb-2 text-3xl font-bold text-naf-blue">Suas Simulações Salvas</h1>
          <p className="text-naf-gray font-medium max-w-xl mx-auto">
            Confira abaixo o histórico de todos os cálculos e comparativos tributários guardados em sua conta.
          </p>
        </div>

        {/* Listagem / Tabela */}
        <div className={`w-full max-w-5xl rounded-3xl border border-gray-200 bg-white p-4 shadow-xl transition-all duration-[700ms] ease-out delay-[400ms] sm:p-6 md:p-8 ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"}`}>
          
          {carregando ? (
            <div role="status" aria-live="polite" className="text-center py-10 text-naf-gray font-medium animate-pulse">
              Carregando histórico do banco de dados...
            </div>
          ) : erro ? (
            <div role="alert" aria-live="assertive" className="text-center py-10 text-naf-red font-semibold">
              {erro}
            </div>
          ) : calculos.length === 0 ? (
            <div className="text-center py-12">
              <svg className="w-16 h-16 text-naf-gray/40 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
              <p className="text-naf-gray font-medium text-lg">Você ainda não realizou nenhuma simulação.</p>
              <button onClick={() => navigate("/")} className="mt-4 px-6 py-2.5 bg-naf-red text-white font-bold rounded-xl hover:bg-[#a62b18] transition shadow-md">
                Fazer Primeiro Cálculo
              </button>
            </div>
          ) : (
            <>
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-gray-600">A exportação inclui todos os registros carregados do seu histórico.</p>
                <button
                  type="button"
                  onClick={exportarHistorico}
                  className="rounded-xl bg-naf-blue px-5 py-2.5 font-bold text-white shadow-sm transition hover:bg-[#0c1825] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red"
                >
                  Exportar histórico ({calculos.length})
                </button>
              </div>
              <p className={`mb-3 min-h-5 text-sm ${mensagemExportacao.startsWith("Não foi") ? "text-naf-red" : "text-green-700"}`} role="status" aria-live="polite">{mensagemExportacao}</p>
              <div className="hidden overflow-x-auto rounded-2xl border border-gray-100 shadow-inner lg:block">
                <table aria-label="Histórico de simulações" className="min-w-full text-sm text-gray-700">
                <caption className="sr-only">Simulações salvas, com valores e opção para abrir cada comparativo.</caption>
                <thead className="bg-[#132436] text-white text-xs uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="py-4 px-4 text-left">Data</th>
                    <th scope="col" className="py-4 px-4 text-left">Profissão</th>
                    <th scope="col" className="py-4 px-4 text-left">Faturamento (Bruto)</th>
                    <th scope="col" className="py-4 px-4 text-left">Livro Caixa (PF)</th>
                    <th scope="col" className="py-4 px-4 text-left">Imposto PF</th>
                    <th scope="col" className="py-4 px-4 text-left">Imposto PJ</th>
                    <th scope="col" className="py-4 px-4 text-left">Folha</th>
                    <th scope="col" className="py-4 px-4 text-left">Fator R</th>
                    <th scope="col" className="py-4 px-4 text-left">Anexo PJ</th>
                    <th scope="col" className="py-4 px-4 text-center">Melhor Opção</th>
                    <th scope="col" className="py-4 px-4 text-right">Economia</th>
                    <th scope="col" className="py-4 px-4 text-left">Comparativo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {calculos.map((item) => (
                    <tr key={item.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="break-words py-3 px-2 font-medium text-gray-500">
                        {new Date(item.createdAt).toLocaleDateString("pt-BR")}
                      </td>
                      <td className="break-words py-3 px-2 capitalize font-semibold text-naf-blue">
                        {item.tipoProfissao}
                      </td>
                      <td className="break-words py-3 px-2 font-medium">
                        R$ {item.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="break-words py-3 px-2 text-gray-500">
                        {item.custos ? `R$ ${item.custos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                      </td>
                      <td className="break-words py-3 px-2 text-[#C3321D] font-medium">
                        R$ {item.impostoPF.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="break-words py-3 px-2 text-[#C3321D] font-medium">
                        R$ {item.impostoPJ.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {item.folha == null ? "—" : `R$ ${item.folha.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}
                      </td>
                      <td className="py-4 px-4 text-gray-500">
                        {item.fatorR == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(item.fatorR)}
                      </td>
                      <td className="py-4 px-4 text-gray-500">{item.anexo || "—"}</td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase ${
                          item.melhorOpcao.includes("PJ") 
                            ? "bg-red-50 text-[#CD371F] border border-red-200"
                            : "bg-blue-50 text-blue-700 border border-blue-200"
                        }`}>
                          {item.melhorOpcao.includes("PJ") ? "PJ" : "PF"}
                        </span>
                      </td>
                      <td className="break-words py-3 px-2 text-right font-bold text-green-700">
                        R$ {item.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}
                      </td>
                      <td className="py-4 px-4">
                        <button type="button" className="underline font-medium text-naf-blue" onClick={() => {
                          abrirSimulacao(item);
                          navigate("/comparativo");
                        }}>Abrir</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="space-y-4 lg:hidden">
              {calculos.map((item) => (
                <article key={item.id} className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-700">
                  <h2 className="mb-3 font-bold capitalize text-naf-blue">{item.tipoProfissao} — {new Date(item.createdAt).toLocaleDateString("pt-BR")}</h2>
                  <dl className="space-y-2">
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Faturamento</dt><dd className="text-right font-medium">R$ {item.faturamento.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Livro Caixa (PF)</dt><dd className="text-right">{item.custos ? `R$ ${item.custos.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Imposto PF</dt><dd className="text-right">R$ {item.impostoPF.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Imposto PJ</dt><dd className="text-right">R$ {item.impostoPJ.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Folha</dt><dd className="text-right">{item.folha == null ? "—" : `R$ ${item.folha.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}`}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Fator R</dt><dd className="text-right">{item.fatorR == null ? "—" : new Intl.NumberFormat("pt-BR", { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 2 }).format(item.fatorR)}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Anexo PJ</dt><dd className="text-right">{item.anexo || "—"}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Melhor opção</dt><dd className="font-bold">{item.melhorOpcao.includes("PJ") ? "PJ" : "PF"}</dd></div>
                    <div className="flex flex-wrap justify-between gap-x-3"><dt>Economia</dt><dd className="text-right font-bold text-green-700">R$ {item.economiaMensal.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</dd></div>
                  </dl>
                  <button type="button" className="mt-4 rounded-lg font-medium text-naf-blue underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red" onClick={() => {
                    abrirSimulacao(item);
                    navigate("/comparativo");
                  }}>Abrir comparativo</button>
                </article>
              ))}
            </div>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
