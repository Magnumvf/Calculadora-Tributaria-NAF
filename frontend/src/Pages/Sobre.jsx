import ContatoNaf from "../components/ContatoNaf";
import Footer from "../components/Footer";

export default function Sobre() {
  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 text-naf-blue">
        <h1 className="text-3xl font-bold mb-4">Sobre o NAF</h1>
        <p>A calculadora apoia o Núcleo de Apoio Contábil e Fiscal da Universidade Christus na comparação de estimativas de tributação como Pessoa Física e Pessoa Jurídica.</p>
        <ContatoNaf />
        {/* M4: completar as informações institucionais do NAF. */}
      </main>
      <Footer />
    </div>
  );
}
