import { Link, NavLink, useNavigate } from "react-router-dom";

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

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const linkClass = "rounded-lg px-3 py-2 text-sm font-medium hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white";

  return (
    <nav aria-label="Navegação principal" className="w-full bg-naf-blue text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-wrap items-center gap-4">
        <Link to="/" className="text-xl font-bold rounded focus-visible:outline-2 focus-visible:outline-white">
          Calculadora Tributária
        </Link>
        <div className="flex flex-wrap items-center gap-1">
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
        </div>
      </div>
    </nav>
  );
}
