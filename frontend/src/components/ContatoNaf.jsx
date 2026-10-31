import { useState } from "react";

/**
 * Formulário de mensagem ao NAF (funcionalidade existente da sprint 2026.1,
 * item 2.2.1 d). Extraído do painel para ser reutilizado também na página
 * /sobre, que deve trazer o contato por e-mail (seção 2.4).
 * O retorno do envio é anunciado em região role="status" (acessibilidade).
 */
export default function ContatoNaf({ idPrefixo = "contato" }) {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    mensagem: "",
  });
  const [enviando, setEnviando] = useState(false);
  // Retorno do envio ao NAF, exibido em região aria-live em vez de alert().
  const [retornoEnvio, setRetornoEnvio] = useState({ tipo: "", texto: "" });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setEnviando(true);
    setRetornoEnvio({ tipo: "", texto: "" });

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000'}/send-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        setRetornoEnvio({ tipo: "sucesso", texto: "Mensagem enviada com sucesso ao NAF!" });
        setFormData({ nome: "", email: "", mensagem: "" });
      } else {
        setRetornoEnvio({ tipo: "erro", texto: "Houve um erro ao enviar a mensagem. Tente novamente." });
      }
    } catch (error) {
      console.error("Erro:", error);
      // Mantém o que a pessoa digitou para que possa tentar de novo.
      setRetornoEnvio({ tipo: "erro", texto: "Não foi possível conectar ao servidor. Verifique sua conexão e tente novamente." });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-left">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label htmlFor={`${idPrefixo}-nome`} className="block text-sm font-medium text-naf-ink mb-1">Nome Completo</label>
          <input
            id={`${idPrefixo}-nome`}
            type="text"
            name="nome"
            autoComplete="name"
            value={formData.nome}
            onChange={handleChange}
            required
            className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition"
          />
        </div>
        <div>
          <label htmlFor={`${idPrefixo}-email`} className="block text-sm font-medium text-naf-ink mb-1">E-mail</label>
          <input
            id={`${idPrefixo}-email`}
            type="email"
            name="email"
            autoComplete="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition"
          />
        </div>
      </div>
      <div>
        <label htmlFor={`${idPrefixo}-mensagem`} className="block text-sm font-medium text-naf-ink mb-1">Sua Mensagem / Dúvida</label>
        <textarea
          id={`${idPrefixo}-mensagem`}
          name="mensagem"
          value={formData.mensagem}
          onChange={handleChange}
          required
          rows="3"
          className="w-full border border-naf-gray px-4 py-2 rounded-xl focus:ring-2 focus:ring-naf-red outline-none transition resize-none"
        ></textarea>
      </div>
      <button
        type="submit"
        disabled={enviando}
        className={`cursor-pointer w-full bg-naf-blue text-white py-3 rounded-xl hover:bg-[#0c1825] transition-all duration-[400ms] ease-out text-base font-bold shadow-md ${enviando ? 'opacity-70 cursor-not-allowed' : 'hover:scale-[1.02]'}`}
      >
        {enviando ? "Enviando para o NAF..." : "Enviar Mensagem"}
      </button>
      <p
        role="status"
        className={`min-h-5 text-sm text-center font-semibold ${retornoEnvio.tipo === "erro" ? "text-naf-alert" : "text-naf-ok"}`}
      >
        {retornoEnvio.texto}
      </p>
    </form>
  );
}
