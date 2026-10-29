import Footer from "../components/Footer";

export default function Sobre() {
  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 text-naf-blue">
        <h1 className="text-3xl font-bold mb-4">Sobre o NAF</h1>
        <div className="space-y-4 leading-relaxed">
          <p>
            O Núcleo de Apoio Contábil e Fiscal (NAF) da Universidade Christus
            oferece apoio e orientação em temas contábeis e fiscais. Esta
            calculadora é uma ferramenta de apoio para comparar estimativas de
            tributação como Pessoa Física e Pessoa Jurídica.
          </p>
          <p>
            Os valores apresentados são estimativas e não substituem a análise
            individual de um profissional contábil nem a consulta às regras
            oficiais vigentes.
          </p>
          <h2 className="pt-4 text-xl font-bold">Saiba mais</h2>
          <ul className="list-inside list-disc space-y-2">
            <li>
              <a className="font-medium text-naf-red underline" href="https://unichristus.edu.br/" target="_blank" rel="noopener noreferrer">
                Portal da Universidade Christus
              </a>
            </li>
            <li>
              <a className="font-medium text-naf-red underline" href="https://www.instagram.com/naf.unichristus/" target="_blank" rel="noopener noreferrer">
                Instagram do NAF
              </a>
            </li>
          </ul>
        </div>
      </main>
      <Footer />
    </div>
  );
}
