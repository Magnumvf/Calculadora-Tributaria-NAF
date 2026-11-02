import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Footer from "../components/Footer";
import api from "../services/api";

export default function Calculadora({ formulario, setFormulario, abrirSimulacao }) {
  const [erro, setErro] = useState("");
  const [calculando, setCalculando] = useState(false);
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const campoClass = "w-full border border-gray-300 px-4 py-3 rounded-xl focus:ring-2 focus:ring-naf-red";

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
    const custos = formulario.custos === "" ? undefined : Number(formulario.custos);
    const precisaFatorR = ["medico", "dentista"].includes(formulario.profissao);
    const folha = formulario.folha === "" ? undefined : Number(formulario.folha);
    if (!formulario.renda || !Number.isFinite(faturamento) || faturamento <= 0 || faturamento > 15000 || (custos !== undefined && (!Number.isFinite(custos) || custos < 0)) || (folha !== undefined && (!Number.isFinite(folha) || folha < 0)) || (precisaFatorR && folha === undefined)) {
      setErro("Informe renda válida, custos não negativos e, para médicos e dentistas, a folha mensal do Fator R.");
      return;
    }
    setErro("");
    setCalculando(true);
    try {
      const { data } = await api.post("/calculos", {
        tipoProfissao: formulario.profissao,
        faturamento,
        ...(custos !== undefined ? { custos } : {}),
        ...(folha !== undefined ? { folha } : {}),
      });
      abrirSimulacao({ ...data.calculo, detalhe: data.detalhe });
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
        <form onSubmit={calcular} className="bg-white rounded-3xl shadow p-6 md:p-8 space-y-6">
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
              <input id="renda" name="renda" type="number" min="0.01" max="15000" step="0.01" required value={formulario.renda} onChange={atualizarCampo} className={campoClass} />
            </div>
            <div>
              <label htmlFor="custos" className="block mb-2 font-medium">Custos mensais (R$)</label>
              <input id="custos" name="custos" type="number" min="0" step="0.01" value={formulario.custos} onChange={atualizarCampo} className={campoClass} />
            </div>
          </div>
          {["medico", "dentista"].includes(formulario.profissao) && (
            <div>
              <label htmlFor="folha" className="block mb-2 font-medium">Folha mensal para o Fator R (R$)</label>
              <input id="folha" name="folha" type="number" min="0" step="0.01" required value={formulario.folha} onChange={atualizarCampo} className={campoClass} />
              <p className="mt-1 text-sm text-gray-600">Informe o total mensal de folha considerado pelo cálculo do Fator R.</p>
            </div>
          )}
          {!token && <p>Para calcular e salvar sua simulação, <Link to="/login" className="underline">entre na sua conta</Link> ou <Link to="/cadastro" className="underline">cadastre-se</Link>. Os campos preenchidos serão mantidos durante a navegação.</p>}
          {erro && <p role="alert" className="text-red-700">{erro} <Link to="/login" className="underline">Entrar</Link></p>}
          <button type="submit" disabled={calculando} className="w-full bg-naf-red text-white font-bold py-4 rounded-xl disabled:opacity-60">
            {calculando ? "Calculando..." : "Analisar vantagem tributária"}
          </button>
        </form>
      </main>
      <Footer />
    </div>
  );
}
