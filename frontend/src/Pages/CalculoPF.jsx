import { useState, useEffect } from "react";
import Footer from "../components/Footer";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

function CalculoPF() {
  const [renda, setRenda] = useState("");
  const [custos, setCustos] = useState("");
  const [resultado, setResultado] = useState(null);
  const [erro, setErro] = useState("");
  const [isVisible, setIsVisible] = useState(false);

  const [mostrarEmail, setMostrarEmail] = useState(false);
  const [email, setEmail] = useState("");
  const [mensagemEnvio, setMensagemEnvio] = useState("");
  const [showTooltipRenda, setShowTooltipRenda] = useState(false);
  const [showTooltipCustos, setShowTooltipCustos] = useState(false);
  const [profissao, setProfissao] = useState("psicologo");

  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  
  useEffect(() => {
    if (!token) {
      navigate("/");
    }
  }, [token, navigate]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
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

  const calcularIRPF = async () => {
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

      const { impostoPF } = response.data.calculo;
      const base = rendaNum - custosNum;

      let faixa = "Isento";
      let parcelaDedutivel = 0;

      if (base <= 2428.8) faixa = "Isento";
      else if (base <= 2826.65) { faixa = "7,5%"; parcelaDedutivel = 182.16; }
      else if (base <= 3751.05) { faixa = "15%"; parcelaDedutivel = 394.16; }
      else if (base <= 4664.68) { faixa = "22,5%"; parcelaDedutivel = 675.49; }
      else { faixa = "27,5%"; parcelaDedutivel = 908.73; }

      setResultado({
        base,
        faixa,
        imposto: impostoPF,
        parcelaDedutivel,
      });

      setMostrarEmail(false);
      setMensagemEnvio("");

    } catch (error) {
      console.error("Erro ao salvar cálculo PF:", error);
      const msg = error.response?.data?.error || "Erro ao processar cálculo no servidor.";
      setResultado(msg);
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

  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow flex flex-col items-center justify-center p-6">
        <div className={`w-full max-w-md bg-naf-surface rounded-3xl shadow-xl p-8 border border-naf-gray/20 transition-all duration-[700ms] ease-out delay-[100ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}>
          <h2 className={`text-2xl font-bold text-center mb-6 text-naf-ink transition-all duration-[700ms] ease-out delay-[300ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
            Cálculo IR Pessoa Física
          </h2>

          <div className="space-y-4">
            <div className={`transition-all duration-[700ms] ease-out delay-[500ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <label htmlFor="pf-profissao" className="block mb-1 text-sm font-medium text-naf-ink">Profissão</label>
              <select id="pf-profissao" value={profissao} onChange={(e) => setProfissao(e.target.value)} className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition delay-[80ms] duration-[400ms] ease-in-out">
                <option value="psicologo">Psicólogo(a)</option>
                <option value="arquiteto">Arquiteto(a)</option>
                <option value="advogado">Advogado(a)</option>
              </select>
            </div>

            <div className={`transition-all duration-[700ms] ease-out delay-[600ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <div className="relative flex items-center gap-1 mb-1">
                <label htmlFor="pf-renda" className="text-sm font-medium text-naf-ink">Renda Mensal Bruta (R$)</label>
                <button type="button" aria-label="Ajuda sobre renda mensal bruta" aria-expanded={showTooltipRenda} aria-describedby={showTooltipRenda ? "pf-renda-help" : undefined} className="text-naf-gray hover:text-naf-ink focus:outline-none" onFocus={() => setShowTooltipRenda(true)} onBlur={() => setShowTooltipRenda(false)} onMouseEnter={() => setShowTooltipRenda(true)} onMouseLeave={() => setShowTooltipRenda(false)}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                {showTooltipRenda && (
                  <div id="pf-renda-help" role="tooltip" className="absolute z-10 w-64 max-w-[calc(100vw-5rem)] p-3 text-sm text-white bg-naf-blue rounded-xl shadow-lg top-full left-0 mt-2 border border-naf-gray/30">
                    É o valor total que você espera receber por mês com o seu trabalho, antes de qualquer desconto.
                  </div>
                )}
              </div>
              <input id="pf-renda" type="number" value={renda} onChange={handleRendaChange} max="15000" placeholder="Ex: 3000" aria-invalid={Boolean(erro)} aria-describedby="pf-renda-error" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm" />
              <p id="pf-renda-error" aria-live="polite" className="text-naf-alert text-sm mt-1 min-h-5 font-medium">{erro}</p>
            </div>

            <div className={`transition-all duration-[700ms] ease-out delay-[700ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <div className="relative flex items-center gap-1 mb-1">
                <label htmlFor="pf-custos" className="text-sm font-medium text-naf-ink">Despesas Dedutíveis (Livro Caixa)</label>
                <button type="button" aria-label="Ajuda sobre despesas dedutíveis" aria-expanded={showTooltipCustos} aria-describedby={showTooltipCustos ? "pf-custos-help" : undefined} className="text-naf-gray hover:text-naf-ink focus:outline-none" onFocus={() => setShowTooltipCustos(true)} onBlur={() => setShowTooltipCustos(false)} onMouseEnter={() => setShowTooltipCustos(true)} onMouseLeave={() => setShowTooltipCustos(false)}>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                </button>
                {showTooltipCustos && (
                  <div id="pf-custos-help" role="tooltip" className="absolute z-10 w-64 max-w-[calc(100vw-5rem)] p-3 text-sm text-white bg-naf-blue rounded-xl shadow-lg top-full left-0 mt-2 border border-naf-gray/30">
                    São os gastos essenciais para o seu trabalho acontecer (ex: aluguel de consultório/escritório, internet, energia). Eles reduzem a base de cálculo do imposto.
                  </div>
                )}
              </div>
              <input id="pf-custos" type="number" value={custos} onChange={(e) => setCustos(e.target.value)} placeholder="Ex: 750" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm" />
            </div>

            <div className={`transition-all duration-[700ms] ease-out delay-[900ms] ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"}`}>
              <button type="button" onClick={calcularIRPF} className="w-full bg-naf-blue text-white font-bold py-3 rounded-xl hover:bg-[#0c1825] hover:scale-105 transition-all duration-[400ms] ease-out shadow-md">
                Calcular
              </button>
            </div>

            {resultado && (
              <div className={`bg-naf-surface-2 border border-naf-gray/20 rounded-xl shadow-inner mt-4 p-5 transition-all duration-[400ms] ease-out ${isVisible ? "opacity-100" : "opacity-0"}`}>
                {typeof resultado === "string" ? (
                  <p role="alert" aria-live="assertive" className="text-naf-alert font-medium">{resultado}</p>
                ) : (
                  <>
                    <div className="space-y-2 text-sm text-naf-ink">
                      <p><strong>Base de cálculo:</strong> R$ {resultado.base.toFixed(2)}</p>
                      <p><strong>Faixa IRPF:</strong> {resultado.faixa}</p>
                      <p><strong>Parcela a deduzir:</strong> R$ {resultado.parcelaDedutivel.toFixed(2)}</p>
                    </div>
                    <p className="text-lg font-bold text-naf-alert mt-3 pt-3 border-t border-naf-gray/30">
                      IR a pagar: R$ {resultado.imposto.toFixed(2)}
                    </p>

                    <div className="mt-5 pt-3 border-t border-naf-gray/30">
                      <p className="text-sm font-medium text-naf-ink mb-3 text-center">Deseja enviar essa simulação por e-mail?</p>
                      <div className="flex gap-3 justify-center">
                        <button onClick={() => setMostrarEmail(true)} className="bg-naf-blue text-white px-5 py-2 rounded-xl hover:bg-[#0c1825] transition shadow-sm text-sm font-medium">Sim, enviar</button>
                        <button onClick={() => setMostrarEmail(false)} className="bg-naf-surface border border-naf-gray text-naf-ink px-5 py-2 rounded-xl hover:bg-naf-surface-2 transition shadow-sm text-sm font-medium">Não, obrigado</button>
                      </div>

                      {mostrarEmail && (
                        <div className="mt-4 space-y-3">
                          <label htmlFor="pf-email" className="block text-sm font-medium text-naf-ink">E-mail para envio</label>
                          <input id="pf-email" type="email" autoComplete="email" value={email} onChange={(e) => { setEmail(e.target.value); setMensagemEnvio(""); }} placeholder="Digite seu e-mail" aria-invalid={mensagemEnvio.startsWith("Por favor")} aria-describedby="pf-email-message" className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none text-sm" />
                          <button type="button" onClick={enviarEmail} className="w-full bg-naf-red text-white py-2 rounded-xl hover:bg-[#a62b18] transition text-sm font-bold shadow-sm">Enviar resultados</button>
                        </div>
                      )}

                      <p id="pf-email-message" role="status" aria-live="polite" className={`mt-3 text-sm font-bold text-center ${mensagemEnvio.startsWith("Por favor") ? "text-naf-alert" : "text-naf-ok"}`}>{mensagemEnvio}</p>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}

export default CalculoPF;
