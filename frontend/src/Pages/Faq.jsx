import Footer from "../components/Footer";

export default function Faq() {
  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 text-naf-blue">
        <h1 className="text-3xl font-bold mb-4">Perguntas frequentes</h1>
        <p>Em breve, respostas às principais dúvidas sobre a calculadora.</p>
        {/* M4: adicionar o conteúdo das perguntas frequentes. */}
      </main>
      <Footer />
    </div>
  );
}
