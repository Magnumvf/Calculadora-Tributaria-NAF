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
      <div className="mx-auto w-full max-w-md rounded-2xl border border-naf-gray/30 bg-white p-6 shadow-lg sm:p-8">
        <h1 className="mb-4 text-2xl font-bold">Recuperar senha</h1>
        <p className="mb-6">Informe seu e-mail cadastrado para receber um link de redefinição válido por 30 minutos.</p>
        <form onSubmit={solicitar} className="space-y-4">
          <div>
            <label htmlFor="recuperar-email" className="block mb-2 font-medium">E-mail cadastrado</label>
            <input
              id="recuperar-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              onChange={(event) => {
                setEmail(event.target.value);
                setErro("");
              }}
              aria-invalid={Boolean(erro)}
              aria-describedby={erro ? "recuperar-email-erro" : undefined}
              className="w-full rounded-xl border border-naf-gray px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red"
            />
            {erro && <p id="recuperar-email-erro" role="alert" className="mt-2 text-sm text-red-700">{erro}</p>}
          </div>
          <button type="submit" disabled={enviando} className="w-full rounded-xl bg-naf-blue p-3 font-bold text-white disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red">
            {enviando ? "Solicitando..." : "Enviar instruções"}
          </button>
        </form>
        {mensagem && <div role="status" aria-live="polite" className="mt-4 text-sm text-green-800"><p>{mensagem}</p><p className="mt-2">Caso precise tentar novamente, aguarde pelo menos um minuto.</p></div>}
        <Link to="/login" className="mt-6 inline-block font-medium underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red">Voltar ao login</Link>
      </div>
    </main>
  );
}
