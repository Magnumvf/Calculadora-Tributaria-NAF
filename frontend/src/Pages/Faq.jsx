import Footer from "../components/Footer";

export default function Faq() {
  const perguntas = [
    {
      pergunta: "Para que serve a calculadora?",
      resposta: "Ela permite simular e comparar estimativas de tributos para atuação como Pessoa Física e Pessoa Jurídica, usando os dados informados no formulário."
    },
    {
      pergunta: "Quais profissões posso selecionar?",
      resposta: "A lista de profissões disponível aparece no formulário da calculadora e pode variar conforme as regras de tributação aplicáveis."
    },
    {
      pergunta: "O que é o Fator R?",
      resposta: "É a relação entre a folha de pagamento, incluindo o pró-labore, e a receita bruta dos últimos 12 meses. Para atividades sujeitas a essa regra, o resultado pode influenciar o anexo do Simples Nacional."
    },
    {
      pergunta: "A calculadora substitui um contador?",
      resposta: "Não. Os resultados são estimativas para apoiar a compreensão e não substituem a análise de um profissional contábil."
    },
    {
      pergunta: "Meus dados de simulação são armazenados?",
      resposta: "As simulações realizadas com uma conta podem aparecer no histórico da aplicação. Evite inserir informações que não sejam necessárias para a simulação."
    },
    {
      pergunta: "Qual é o ano de referência dos cálculos?",
      resposta: "A aplicação foi preparada para as regras e referências do ano-calendário de 2026."
    }
  ];

  return (
    <div className="flex flex-col min-h-screen bg-naf-light">
      <main className="flex-grow w-full max-w-4xl mx-auto px-4 py-10 text-naf-blue">
        <h1 className="text-3xl font-bold mb-4">Perguntas frequentes</h1>
        <p className="mb-8">Informações para ajudar você a usar a calculadora e entender os resultados.</p>
        <div className="space-y-4">
          {perguntas.map(({ pergunta, resposta }) => (
            <details key={pergunta} className="rounded-xl border border-naf-gray/30 bg-white p-4">
              <summary className="cursor-pointer font-semibold focus-visible:rounded">{pergunta}</summary>
              <p className="mt-3 leading-relaxed text-gray-700">{resposta}</p>
            </details>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
