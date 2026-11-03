import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "../services/api";

export default function Calculadora({ formulario, setFormulario, abrirSimulacao }) {
  const [erro, setErro] = useState("");
  const [calculando, setCalculando] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const campoClass = "w-full rounded-xl border border-gray-300 bg-white px-4 py-3 text-naf-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red";

  const usaFatorR = formulario.profissao === "medico" || formulario.profissao === "dentista";

  function atualizarCampo(event) {
    const { name, value } = event.target;
    setFormulario((anterior) => ({ ...anterior, [name]: value }));
    setErro("");
  }

  async function calcular(event) {
    event.preventDefault();
    if (!token) {
      navigate("/login");
      return;
    }
    const faturamento = Number(formulario.renda);
    const custos = Number(formulario.custos);
    if (!formulario.renda || !Number.isFinite(faturamento) || faturamento <= 0 || faturamento > 15000 || !Number.isFinite(custos) || custos < 0) {
      setErro("Informe renda maior que zero até R$ 15.000 e custos iguais ou maiores que zero.");
      return;
    }

    let folha;
    if (usaFatorR) {
      if (formulario.folha === "" || formulario.folha === undefined || formulario.folha === null) {
        setErro("Para médico e dentista, informe a folha de pagamento / pró-labore.");
        return;
      }
      folha = Number(formulario.folha);
      if (!Number.isFinite(folha) || folha < 0) {
        setErro("Informe uma folha de pagamento válida (igual ou maior que zero).");
        return;
      }
    }

    setErro("");
    setCalculando(true);
    try {
      const { data } = await api.post("/calculos", {
        tipoProfissao: formulario.profissao,
        faturamento,
        custos,
        folha: usaFatorR ? folha : undefined,
      });
      abrirSimulacao(data.calculo);
      navigate("/comparativo");
    } catch (error) {
      setErro(error.response?.status === 401
        ? "Sua sessão expirou. Entre novamente para calcular."
        : error.response?.data?.error || "Não foi possível calcular. Tente novamente.");
    } finally {
      setCalculando(false);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 text-naf-blue">
        <h1 className="text-3xl font-bold mb-4">Calculadora tributária PF × PJ</h1>
        <p className="mb-6">Preencha sua renda e seus custos para comparar os regimes.</p>
        <form onSubmit={calcular} className="space-y-6 rounded-3xl border border-naf-gray/30 bg-white p-4 shadow sm:p-6 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label htmlFor="profissao" className="block mb-2 font-medium">Profissão</label>
              <select id="profissao" name="profissao" value={formulario.profissao} onChange={atualizarCampo} className={campoClass}>
                <option value="psicologo">Psicólogo(a)</option>
                <option value="arquiteto">Arquiteto(a)</option>
                <option value="advogado">Advogado(a)</option>
                <option value="medico">Médico(a)</option>
                <option value="dentista">Dentista</option>
              </select>
            </div>
            <div>
              <label htmlFor="renda" className="block mb-2 font-medium">Renda mensal (R$)</label>
              <input id="renda" name="renda" type="number" min="0.01" max="15000" step="0.01" required value={formulario.renda} onChange={atualizarCampo} aria-invalid={Boolean(erro)} aria-describedby={erro ? "calculadora-erro" : undefined} className={campoClass} />
            </div>
            <div>
              <label htmlFor="custos" className="block mb-2 font-medium">Custos mensais (R$)</label>
              <input id="custos" name="custos" type="number" min="0" step="0.01" value={formulario.custos} onChange={atualizarCampo} aria-invalid={Boolean(erro)} aria-describedby={erro ? "calculadora-erro" : undefined} className={campoClass} />
            </div>
          </div>
          {usaFatorR && (
            <div>
              <label htmlFor="folha" className="block mb-2 font-medium">Folha de pagamento / pró-labore mensal (R$)</label>
              <input id="folha" name="folha" type="number" min="0" step="0.01" value={formulario.folha} onChange={atualizarCampo} aria-invalid={Boolean(erro)} aria-describedby={erro ? "calculadora-erro" : undefined} className={campoClass} />
              <p className="text-sm text-gray-500 mt-1">Usada no Fator R (folha ÷ receita): a partir de 28% aplica-se o Anexo III (6%); abaixo de 28%, o Anexo V (15,5%).</p>
            </div>
          )}
          {!token && <p>Para calcular e salvar sua simulação, <Link to="/login" className="underline">entre na sua conta</Link> ou <Link to="/cadastro" className="underline">cadastre-se</Link>. Os campos preenchidos serão mantidos durante a navegação.</p>}
          {erro && <p id="calculadora-erro" role="alert" aria-live="assertive" className="text-red-700">{erro}</p>}
          <button type="submit" disabled={calculando} className="w-full rounded-xl bg-naf-red py-4 font-bold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-blue">
            {calculando ? "Calculando..." : "Analisar vantagem tributária"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}