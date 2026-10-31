import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Faq from "./Pages/Faq";
import Sobre from "./Pages/Sobre";
import NaoEncontrada from "./Pages/NaoEncontrada";
import Landing from "./Pages/Landing";
import Login from "./Pages/Login";
import Cadastro from "./Pages/Cadastro";
import RecuperarSenha from "./Pages/RecuperarSenha";
import Home from "./Pages/Home";
import CalculoPF from "./Pages/CalculoPF";
import CalculoPJ from "./Pages/CalculoPJ";
import Comparativo from "./Pages/Comparativo";
import Historico from "./Pages/Historico";

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      {/* Destino do link "Pular para o conteúdo" do menu (acessibilidade). */}
      <div id="conteudo-principal" tabIndex={-1} className="outline-none">
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/RecuperarSenha" element={<RecuperarSenha />} />

        <Route path="/faq" element={<Faq />} />
        <Route path="/sobre" element={<Sobre />} />

        {/* Páginas que verificam a sessão */}
        <Route path="/Home" element={<Home />} />
        <Route path="/calculo-pf" element={<CalculoPF />} />
        <Route path="/calculo-pj" element={<CalculoPJ />} />
        <Route path="/comparativo" element={<Comparativo />} />
        <Route path="/historico" element={<Historico />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
