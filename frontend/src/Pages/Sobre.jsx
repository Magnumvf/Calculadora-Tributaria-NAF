import Footer from "../components/Footer";
import ContatoNaf from "../components/ContatoNaf";

export default function Sobre() {
  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 text-naf-ink">
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
              <a className="font-medium text-naf-alert underline" href="https://unichristus.edu.br/" target="_blank" rel="noopener noreferrer">
                Portal da Universidade Christus
              </a>
            </li>
            <li>
              <a className="font-medium text-naf-alert underline" href="https://www.instagram.com/naf.unichristus/" target="_blank" rel="noopener noreferrer">
                Instagram do NAF
              </a>
            </li>
          </ul>
        </div>

        <section aria-labelledby="sobre-contato-titulo" className="mt-10 rounded-3xl border border-naf-gray/20 bg-naf-surface p-6 sm:p-8 shadow-lg">
          <h2 id="sobre-contato-titulo" className="text-xl font-bold">Contato por e-mail</h2>
          <p className="mt-1 mb-6 text-sm text-naf-gray">
            Ficou com dúvida sobre o resultado? Envie uma mensagem e a equipe do NAF responde no e-mail informado.
          </p>
          <ContatoNaf idPrefixo="sobre-contato" />
        </section>
      </main>
      <Footer />
    </div>
  );
}
