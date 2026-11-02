import { useState } from "react";
import Calculadora from "./Pages/Calculadora";
import { resultadoComparativo } from "./utils/resultadoComparativo";
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

const formularioInicial = { profissao: "psicologo", renda: "", custos: "", folha: "" };

function App() {
  const [formulario, setFormulario] = useState(formularioInicial);
  const [simulacao, setSimulacao] = useState(null);

  function abrirSimulacao(calculo) {
    setSimulacao({ calculo, resultado: resultadoComparativo(calculo) });
    setFormulario({
      profissao: calculo.tipoProfissao,
      renda: String(calculo.faturamento),
      custos: calculo.custos == null ? "" : String(calculo.custos),
      folha: calculo.folha == null ? "" : String(calculo.folha),
    });
  }

  function limparSessao() {
    setFormulario(formularioInicial);
    setSimulacao(null);
  }

  return (
    <BrowserRouter>
      <Navbar onLogout={limparSessao} />
      <Routes>
        {/* Rotas Públicas */}
        <Route path="/" element={<Calculadora formulario={formulario} setFormulario={setFormulario} abrirSimulacao={abrirSimulacao} />} />
        <Route path="/inicio" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/cadastro" element={<Cadastro />} />
        <Route path="/RecuperarSenha" element={<RecuperarSenha />} />

        <Route path="/faq" element={<Faq />} />
        <Route path="/sobre" element={<Sobre />} />

        {/* Páginas que verificam a sessão */}
        <Route path="/Home" element={<Home />} />
        <Route path="/calculo-pf" element={<CalculoPF />} />
        <Route path="/calculo-pj" element={<CalculoPJ />} />
        <Route path="/comparativo" element={<Comparativo key={simulacao?.calculo.id || "vazio"} simulacao={simulacao} />} />
        <Route path="/historico" element={<Historico abrirSimulacao={abrirSimulacao} />} />
        <Route path="*" element={<NaoEncontrada />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
