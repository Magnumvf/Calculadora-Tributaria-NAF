import api from "../services/api";
import { Link } from "react-router-dom";
import { useState } from "react";

export default function ContatoNaf() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);

  const [status, setStatus] = useState("");
  const token = localStorage.getItem("token");

  function handleChange(event) {
    setFormData({ ...formData, [event.target.name]: event.target.value });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setStatus("");
    setEnviando(true);
    try {
      const { data } = await api.post("/emails/naf", formData);
      setStatus(data.message);
      setFormData({ nome: "", email: "", mensagem: "" });
    } catch (error) {
      setStatus(error.response?.data?.error || "Não foi possível enviar sua mensagem. Tente novamente mais tarde.");
    } finally {
      setEnviando(false);
    }
  }

  return (
        <section className="w-full max-w-2xl bg-white rounded-3xl shadow-lg border border-naf-gray/20 p-8 my-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-naf-blue">Fale com o NAF</h2>
            <p className="text-sm text-naf-gray mt-1">Sua situação é muito complexa? Envie uma mensagem para nossa equipe.</p>
          </div>

          {!token && <p className="mb-4"><Link to="/login" className="underline">Entre na sua conta</Link> para enviar uma mensagem.</p>}
          {status && <p role={status.startsWith("Não foi") ? "alert" : "status"} aria-live={status.startsWith("Não foi") ? "assertive" : "polite"} className="mb-4 text-naf-blue">{status}</p>}
          <form onSubmit={handleSubmit} className="space-y-4 text-left">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="naf-nome" className="block text-sm font-medium text-naf-blue mb-1">Nome Completo</label>
                <input
                  type="text"
                  id="naf-nome" name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition"
                />
              </div>
              <div>
                <label htmlFor="naf-email" className="block text-sm font-medium text-naf-blue mb-1">E-mail</label>
                <input
                  type="email"
                  id="naf-email" name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition"
                />
              </div>
            </div>
            <div>
              <label htmlFor="naf-mensagem" className="block text-sm font-medium text-naf-blue mb-1">Sua Mensagem / Dúvida</label>
              <textarea
                id="naf-mensagem" name="mensagem"
                value={formData.mensagem}
                onChange={handleChange}
                required
                rows="3"
                className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition resize-none"
              ></textarea>
            </div>
            <button
              type="submit"
              disabled={enviando || !token}
              className={`cursor-pointer w-full bg-naf-blue text-white py-3 rounded-xl hover:bg-[#0c1825] transition-all duration-[400ms] ease-out text-base font-bold shadow-md ${enviando ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
            >
              {enviando ? "Enviando para o NAF..." : "Enviar Mensagem"}
            </button>
          </form>
        </section>
  );
}
