import { useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";

export default function RecuperarSenha() {
  const [email, setEmail] = useState("");
  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function solicitar(event) {
    event.preventDefault();
    setErro("");
    setMensagem("");
    setEnviando(true);
    try {
      const { data } = await api.post("/auth/forgot-password", { email: email.trim() });
      setMensagem(data.message);
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível conectar ao servidor. Tente novamente.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <main className="min-h-screen bg-naf-light px-4 py-12 text-naf-blue">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Recuperar senha</h1>
        <p className="mb-6">Informe seu e-mail cadastrado para receber um link de redefinição válido por 30 minutos.</p>
        <form onSubmit={solicitar} className="space-y-4">
          <div>
            <label htmlFor="recuperar-email" className="block mb-2 font-medium">E-mail cadastrado</label>
            <input id="recuperar-email" type="email" autoComplete="email" maxLength={254} required value={email} onChange={(event) => setEmail(event.target.value)} className="w-full border border-gray-400 rounded-lg p-3 focus:ring-2 focus:ring-naf-blue" />
          </div>
          <button disabled={enviando} className="w-full bg-naf-blue text-white p-3 rounded-lg font-bold disabled:opacity-60">
            {enviando ? "Solicitando..." : "Enviar instruções"}
          </button>
        </form>
        {erro && <p role="alert" className="mt-4 text-red-700">{erro}</p>}
        {mensagem && <div role="status" className="mt-4"><p>{mensagem}</p><p className="mt-2 text-sm">Caso precise tentar novamente, aguarde pelo menos um minuto.</p></div>}
        <Link to="/login" className="inline-block mt-6 underline font-medium">Voltar ao login</Link>
      </div>
    </main>
  );
}
