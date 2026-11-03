import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import api from "../services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const [erroServidor, setErroServidor] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const destino = ["/Home", "/calculo-pf", "/calculo-pj", "/historico"].includes(location.state?.from)
    ? location.state.from
    : "/";
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Por favor, preencha o campo de email.";
    } else if (!email.includes("@") || !email.includes(".")) {
      newErrors.email = "Por favor, informe um email válido (contendo '@' e '.').";
    }
    if (!password) newErrors.password = "Por favor, preencha o campo de senha.";
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
    setEnviando(true);

    try {
      const response = await api.post('/auth/login', { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      navigate(destino, { replace: true });

    } catch (error) {
      setErroServidor(error.response?.data?.error || "Erro ao conectar ao servidor.");
    } finally {
      setEnviando(false);
    }
  };

  return (
    <main
      className="flex min-h-screen flex-col items-center justify-center bg-naf-light p-4"
    >
      <h1
        className={`text-3xl font-bold text-center mb-6 text-naf-blue transition-all duration-[700ms] ease-out delay-[200ms]
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-10"}`}
      >
        CALCULADORA DE IMPOSTO DE RENDA
      </h1>

      <div
        className={`w-full max-w-sm rounded-2xl border border-naf-gray/30 bg-white p-6 shadow-xl transition-all duration-[700ms] ease-out delay-[300ms] sm:p-8
          ${isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"}`}
      >
        <h2
          className={`text-2xl font-bold text-center mb-6 text-naf-blue transition-all duration-[700ms] ease-out delay-[500ms] ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
          }`}
        >
          Login
        </h2>

        {destino !== "/" && (
          <p className="mb-4 text-sm text-naf-blue" role="status">
            Entre na sua conta para acessar a página solicitada.
          </p>
        )}
        {location.state?.notice && <p role="status" aria-live="polite" className="mb-4 text-sm text-green-700">{location.state.notice}</p>}
        {erroServidor && <p role="alert" aria-live="assertive" className="mb-4 text-sm text-red-700">{erroServidor}</p>}

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          <div
            className={`transition-all duration-[700ms] ease-out delay-[700ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="login-email" className="block mb-2 text-sm font-medium text-naf-blue">
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              placeholder="Digite seu email"
              aria-invalid={Boolean(errors.email)}
              aria-describedby="login-email-error"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (errors.email) {
                  const val = e.target.value;
                  if (val && val.includes("@") && val.includes(".")) {
                    setErrors((prev) => ({ ...prev, email: undefined }));
                  }
                }
              }}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:-translate-y-1 hover:shadow-md"
            />
            <div>
              <p id="login-email-error" aria-live="polite" className="mt-1 min-h-5 text-sm text-naf-red font-medium">
                {errors.email}
              </p>
            </div>
          </div>

          <div
            className={`transition-all duration-[700ms] ease-out delay-[850ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <label htmlFor="login-password" className="block mb-2 text-sm font-medium text-naf-blue">
              Senha
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              placeholder="Digite sua senha"
              aria-invalid={Boolean(errors.password)}
              aria-describedby="login-password-error"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-naf-gray rounded-xl focus:ring-2 focus:ring-naf-red focus:border-transparent outline-none transition delay-[80ms] duration-[400ms] ease-in-out hover:-translate-y-1 hover:shadow-md"
            />
            <p id="login-password-error" aria-live="polite" className="mt-1 min-h-5 text-sm text-naf-red font-medium">
              {errors.password}
            </p>
          </div>

          <div
            className={`transition-all duration-[700ms] ease-out delay-[1000ms] ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5"
            }`}
          >
            <button
              type="submit"
              disabled={enviando}
              className="w-full rounded-xl bg-naf-red py-3 font-bold text-white shadow-md transition delay-[80ms] duration-[400ms] ease-in-out hover:scale-105 hover:bg-[#a62b18] disabled:cursor-wait disabled:opacity-60"
            >
              {enviando ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>

        <p
          className={`text-center text-sm text-naf-gray mt-6 transition-all duration-[700ms] ease-out delay-[1150ms] ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Não tem conta?{" "}
          <Link to="/cadastro" className="text-naf-red hover:underline font-bold">
            Cadastre-se
          </Link>
        </p>

        <p
          className={`text-center text-sm text-naf-gray mt-2 transition-all duration-[700ms] ease-out delay-[1250ms] ${
            isVisible ? "opacity-100" : "opacity-0"
          }`}
        >
          Esqueceu a senha?{" "}
          <Link to="/RecuperarSenha" className="text-naf-red hover:underline font-bold">
            Recuperar Senha
          </Link>
        </p>
      </div>

    </main>
  );
}
