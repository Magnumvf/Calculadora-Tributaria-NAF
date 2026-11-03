import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function RedefinirSenha({ onRedefinir }) {
  const { hash } = useLocation();
  const navigate = useNavigate();
  const token = new URLSearchParams(hash.slice(1)).get("token") || "";
  const tokenValido = /^[a-f0-9]{64}$/.test(token);
  const [password, setPassword] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [erro, setErro] = useState("");
  const [concluido, setConcluido] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function redefinir(event) {
    event.preventDefault();
    setErro("");
    if (password !== confirmacao) {
      setErro("As senhas não coincidem.");
      return;
    }
    if (new TextEncoder().encode(password).length > 72) {
      setErro("A senha é muito longa. Use no máximo 72 bytes (acentos e emojis ocupam mais de um byte).");
      return;
    }
    setSalvando(true);
    try {
      await api.post("/auth/reset-password", { token, password });
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      onRedefinir();
      setPassword("");
      setConfirmacao("");
      setConcluido(true);
      navigate('/redefinir-senha', { replace: true });
    } catch (error) {
      setErro(error.response?.data?.error || "Não foi possível atualizar a senha. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="min-h-screen bg-naf-light px-4 py-12 text-naf-blue">
      <div className="max-w-md mx-auto bg-white p-6 rounded-2xl shadow-lg">
        <h1 className="text-2xl font-bold mb-4">Definir nova senha</h1>
        {concluido ? (
          <div role="status"><p>Senha atualizada. Entre novamente com sua nova senha.</p><Link to="/login" className="inline-block mt-4 underline font-bold">Ir para o login</Link></div>
        ) : !tokenValido ? (
          <p role="alert">Link inválido. Solicite um novo link de recuperação.</p>
        ) : (
          <form onSubmit={redefinir} className="space-y-4">
            <p>Use pelo menos 8 caracteres na nova senha.</p>
            <div>
              <label htmlFor="nova-senha" className="block mb-2 font-medium">Nova senha</label>
              <input id="nova-senha" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={password} onChange={(event) => setPassword(event.target.value)} aria-invalid={Boolean(erro)} aria-describedby={erro ? "redefinir-erro" : undefined} className="w-full rounded-lg border border-gray-400 bg-white p-3 text-naf-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red" />
            </div>
            <div>
              <label htmlFor="confirmar-senha" className="block mb-2 font-medium">Confirmar nova senha</label>
              <input id="confirmar-senha" type="password" autoComplete="new-password" minLength={8} maxLength={72} required value={confirmacao} onChange={(event) => setConfirmacao(event.target.value)} aria-invalid={Boolean(erro)} aria-describedby={erro ? "redefinir-erro" : undefined} className="w-full rounded-lg border border-gray-400 bg-white p-3 text-naf-blue focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-naf-red" />
            </div>
            <button disabled={salvando} className="w-full bg-naf-blue text-white p-3 rounded-lg font-bold disabled:opacity-60">{salvando ? "Salvando..." : "Salvar nova senha"}</button>
          </form>
        )}
        {erro && <p id="redefinir-erro" role="alert" aria-live="assertive" className="mt-4 text-red-700">{erro}</p>}
        {!concluido && <Link to="/RecuperarSenha" className="inline-block mt-6 underline font-medium">Solicitar novo link</Link>}
      </div>
    </main>
  );
}
