import { useEffect, useRef, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import useTema from "../hooks/useTema";

const links = [
  ["/", "Calculadora"],
  ["/Home", "Painel"],
  ["/calculo-pf", "Cálculo PF"],
  ["/calculo-pj", "Cálculo PJ"],
  ["/comparativo", "Comparativo"],
  ["/historico", "Histórico"],
  ["/faq", "FAQ"],
  ["/sobre", "Sobre"],
];

export default function Navbar({ onLogout }) {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const [menuAberto, setMenuAberto] = useState(false);
  const { tema, alternarTema } = useTema();
  const botaoMenuRef = useRef(null);
  const localizacaoAnterior = useRef(location.pathname);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    onLogout();
    setMenuAberto(false);
    navigate("/");
    requestAnimationFrame(() => document.getElementById("conteudo-principal")?.focus());
  };

  useEffect(() => {
    if (!menuAberto) return undefined;
    const fecharComEscape = (event) => {
      if (event.key === "Escape") {
        setMenuAberto(false);
        botaoMenuRef.current?.focus();
      }
    };
    document.addEventListener("keydown", fecharComEscape);
    return () => document.removeEventListener("keydown", fecharComEscape);
  }, [menuAberto]);

  useEffect(() => {
    if (localizacaoAnterior.current !== location.pathname && menuAberto) {
      setMenuAberto(false);
      document.getElementById("conteudo-principal")?.focus();
    }
    localizacaoAnterior.current = location.pathname;
  }, [location.pathname, menuAberto]);

  const linkClass = "rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <nav aria-label="Navegação principal" className="w-full bg-naf-blue text-white shadow-lg">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-4 py-4">
        <Link to="/" className="rounded text-xl font-bold focus-visible:outline-2 focus-visible:outline-white">
          Calculadora Tributária
        </Link>
        <button
          ref={botaoMenuRef}
          type="button"
          aria-expanded={menuAberto}
          aria-controls="menu-principal"
          onClick={() => setMenuAberto((aberto) => !aberto)}
          className={`${linkClass} border border-white/50 lg:hidden`}
        >
          {menuAberto ? "Fechar menu" : "Menu"}
        </button>
        <div id="menu-principal" className={`${menuAberto ? "flex" : "hidden"} w-full flex-col gap-1 lg:flex lg:w-auto lg:flex-row lg:flex-wrap lg:items-center`}>
          {links.map(([path, label]) => (
            <NavLink key={path} to={path} end className={({ isActive }) => `${linkClass} ${isActive ? "bg-white/15 underline underline-offset-4" : ""}`}>
              {label}
            </NavLink>
          ))}
          {token ? (
            <button type="button" onClick={handleLogout} className={`${linkClass} border border-white/50 cursor-pointer`}>Sair</button>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>Entrar</NavLink>
              <NavLink to="/cadastro" className={linkClass}>Criar conta</NavLink>
            </>
          )}
          <button
            type="button"
            aria-pressed={tema === "escuro"}
            onClick={alternarTema}
            className={linkClass}
          >
            Tema {tema === "escuro" ? "escuro" : "claro"}
          </button>
        </div>
      </div>
    </nav>
  );
}
