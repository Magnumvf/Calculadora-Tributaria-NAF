import { Link } from "react-router-dom";
import Footer from "../components/Footer";

export default function NaoEncontrada() {
  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 text-naf-ink">
        <h1 className="text-3xl font-bold mb-4">404 — Página não encontrada</h1>
        <p>O endereço acessado não existe.</p>
        <Link to="/" className="inline-block mt-4 underline font-medium">Voltar ao início</Link>
      </main>
      <Footer />
    </div>
  );
}
