import { useEffect, useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import useTema from "../hooks/useTema";

const links = [
  ["/", "Início"],
  ["/Home", "Painel"],
  ["/calculo-pf", "Cálculo PF"],
  ["/calculo-pj", "Cálculo PJ"],
  ["/comparativo", "Comparativo"],
  ["/historico", "Histórico"],
  ["/faq", "FAQ"],
  ["/sobre", "Sobre"],
];

/**
 * Menu de navegação presente em todas as páginas.
 * - Em telas menores que 1024 px os links ficam recolhidos atrás do botão
 *   "Menu" (aria-expanded/aria-controls), evitando rolagem horizontal em 320 px.
 * - Em telas maiores todos os links ficam visíveis.
 * - Inclui o botão de tema claro/escuro (opcional da seção 2.5).
 */
export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const token = localStorage.getItem("token");
  const { tema, alternarTema } = useTema();
  const [menuAberto, setMenuAberto] = useState(false);

  // Fecha o menu móvel sempre que o usuário troca de página.
  useEffect(() => {
    setMenuAberto(false);
  }, [location.pathname]);

  // Permite fechar o menu móvel com a tecla Esc.
  useEffect(() => {
    if (!menuAberto) return undefined;
    const fecharComEsc = (evento) => {
      if (evento.key === "Escape") setMenuAberto(false);
    };
    document.addEventListener("keydown", fecharComEsc);
    return () => document.removeEventListener("keydown", fecharComEsc);
  }, [menuAberto]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const linkClass =
    "block rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";
  const temaEscuro = tema === "escuro";

  return (
    <header>
      <a href="#conteudo-principal" className="pular-conteudo">
        Pular para o conteúdo
      </a>
      <nav aria-label="Navegação principal" className="w-full bg-naf-blue text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center gap-2">
          <Link to="/" className="mr-auto text-lg sm:text-xl font-bold rounded py-1">
            Calculadora Tributária
          </Link>

          <button
            type="button"
            onClick={alternarTema}
            aria-pressed={temaEscuro}
            aria-label={temaEscuro ? "Ativar tema claro" : "Ativar tema escuro"}
            title={temaEscuro ? "Ativar tema claro" : "Ativar tema escuro"}
            className="rounded-lg p-2 hover:bg-white/15 cursor-pointer"
          >
            {temaEscuro ? (
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
                <path strokeLinecap="round" d="M12 2v2m0 16v2M4.9 4.9l1.4 1.4m11.4 11.4 1.4 1.4M2 12h2m16 0h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" />
              </svg>
            )}
          </button>

          <button
            type="button"
            onClick={() => setMenuAberto((aberto) => !aberto)}
            aria-expanded={menuAberto}
            aria-controls="menu-principal"
            className="lg:hidden flex items-center gap-2 rounded-lg border border-white/50 px-3 py-2 text-sm font-medium hover:bg-white/15 cursor-pointer"
          >
            <svg aria-hidden="true" className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              {menuAberto ? (
                <path strokeLinecap="round" d="M6 6l12 12M18 6 6 18" />
              ) : (
                <path strokeLinecap="round" d="M4 7h16M4 12h16M4 17h16" />
              )}
            </svg>
            Menu
          </button>

          <ul
            id="menu-principal"
            className={`${menuAberto ? "flex" : "hidden"} w-full flex-col gap-1 pb-2 lg:pb-0 lg:flex lg:w-auto lg:flex-row lg:flex-wrap lg:items-center`}
          >
            {links.map(([path, label]) => (
              <li key={path}>
                <NavLink
                  to={path}
                  end
                  className={({ isActive }) => `${linkClass} ${isActive ? "bg-white/15 underline underline-offset-4" : ""}`}
                >
                  {label}
                </NavLink>
              </li>
            ))}
            {token ? (
              <li>
                <button type="button" onClick={handleLogout} className={`${linkClass} w-full text-left border border-white/50 cursor-pointer`}>
                  Sair
                </button>
              </li>
            ) : (
              <>
                <li>
                  <NavLink to="/login" className={linkClass}>Entrar</NavLink>
                </li>
                <li>
                  <NavLink to="/cadastro" className={linkClass}>Criar conta</NavLink>
                </li>
              </>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
}
