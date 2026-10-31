import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Cadastro() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!name) newErrors.name = "Por favor, preencha o campo de nome.";
    if (!email) {
      newErrors.email = "Por favor, preencha o campo de email.";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Por favor, informe um email válido (contendo '@' e '.').";
    }
    if (!password) newErrors.password = "Por favor, preencha o campo de senha.";
    if (!confirmPassword) {
      newErrors.confirmPassword = "Por favor, confirme sua senha.";
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem.";
    }

    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = validateForm();

    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    setErrors({});
    setErroServidor("");

    try {
      await api.post("/auth/register", { name, email, password });

      // O aviso é exibido (e anunciado) na tela de login.
      navigate("/login", { state: { aviso: "Cadastro realizado com sucesso! Agora você pode fazer o login." } });

    } catch (error) {
      const mensagemErro = error.response?.data?.error || "Erro ao conectar com o servidor.";
      setErroServidor(mensagemErro);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);

    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-naf-light p-4">
      <h1
        className={`text-3xl font-bold text-center mb-6 text-naf-ink transition-all duration-[700ms] ease-out delay-[100ms]
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        CALCULADORA DE IMPOSTO DE RENDA
      </h1>

      <div
        className={`w-full max-w-sm p-8 bg-naf-surface rounded-2xl shadow-xl border border-naf-gray/30 transition-all duration-[700ms] ease-out
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <h2
          className={`text-2xl font-bold text-center mb-6 text-naf-ink transition-all duration-[700ms] ease-out delay-[200ms] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          Criar Conta
        </h2>

        <p role="alert" className="min-h-5 mb-2 text-sm text-center font-semibold text-naf-alert">{erroServidor}</p>

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div
            className={`transition-all duration-[700ms] ease-out delay-[300ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="cadastro-name" className="block mb-1 text-sm font-medium text-naf-ink">
              Nome Completo
            </label>
            <input
              id="cadastro-name"
              type="text"
              autoComplete="name"
              placeholder="Digite seu nome"
              aria-invalid={Boolean(errors.name)}
              aria-describedby="cadastro-name-error"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm"
            />
            <p id="cadastro-name-error" aria-live="polite" className="mt-1 min-h-4 text-xs text-naf-alert font-medium">{errors.name}</p>
          </div>

          <div
            className={`transition-all duration-[700ms] ease-out delay-[400ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="cadastro-email" className="block mb-1 text-sm font-medium text-naf-ink">
              Email
            </label>
            <input
              id="cadastro-email"
              type="email"
              autoComplete="email"
              placeholder="Digite seu email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby="cadastro-email-error"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm"
            />
            <p id="cadastro-email-error" aria-live="polite" className="mt-1 min-h-4 text-xs text-naf-alert font-medium">{errors.email}</p>
          </div>

          <div
            className={`transition-all duration-[700ms] ease-out delay-[500ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="cadastro-password" className="block mb-1 text-sm font-medium text-naf-ink">
              Senha
            </label>
            <input
              id="cadastro-password"
              type="password"
              autoComplete="new-password"
              placeholder="Crie uma senha segura"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="cadastro-password-error"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm"
            />
            <p id="cadastro-password-error" aria-live="polite" className="mt-1 min-h-4 text-xs text-naf-alert font-medium">{errors.password}</p>
          </div>

          <div
            className={`transition-all duration-[700ms] ease-out delay-[600ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="cadastro-confirm-password" className="block mb-1 text-sm font-medium text-naf-ink">
              Confirmar Senha
            </label>
            <input
              id="cadastro-confirm-password"
              type="password"
              autoComplete="new-password"
              placeholder="Repita a senha"
              aria-invalid={Boolean(errors.confirmPassword)}
              aria-describedby="cadastro-confirm-password-error"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:shadow-sm"
            />
            <p id="cadastro-confirm-password-error" aria-live="polite" className="mt-1 min-h-4 text-xs text-naf-alert font-medium">
              {errors.confirmPassword}
            </p>
          </div>

          <div
            className={`pt-2 transition-all duration-[700ms] ease-out delay-[700ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <button
              type="submit"
              className="w-full bg-naf-red text-white font-bold py-3 rounded-xl hover:bg-[#a62b18] transition delay-[80ms] duration-[400ms] ease-in-out hover:scale-105 shadow-md cursor-pointer"
            >
              Cadastrar
            </button>
          </div>
        </form>

        <p
          className={`text-center text-sm text-naf-gray mt-6 transition-all duration-[700ms] ease-out delay-[800ms] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          Já tem conta?{" "}
          <button
            onClick={() => navigate("/login")}
            className="text-naf-alert hover:underline font-bold bg-transparent border-none p-0 cursor-pointer"
          >
            Faça login
          </button>
        </p>
      </div>
    </main>
  );
}
