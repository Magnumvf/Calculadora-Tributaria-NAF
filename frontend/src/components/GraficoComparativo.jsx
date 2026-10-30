const moeda = (valor) => valor.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export default function GraficoComparativo({ impostoPF, impostoPJ, className = "" }) {
  const valores = [impostoPF, impostoPJ];
  const validos = valores.every((valor) => Number.isFinite(valor) && valor >= 0);
  const haDados = validos && (impostoPF > 0 || impostoPJ > 0);

  if (!validos || !haDados) {
    return (
      <section className={`rounded-2xl border border-gray-200 bg-white p-5 ${className}`} aria-label="Comparativo da carga tributária">
        <h3 className="text-center text-lg font-bold text-[#132436]">Comparativo da carga tributária</h3>
        <p className="mt-4 text-center text-sm text-gray-600">
          {!validos
            ? "Não há dados válidos suficientes para exibir o gráfico."
            : "Não há dados suficientes para exibir o gráfico, pois os dois valores são zero."}
        </p>
      </section>
    );
  }

  const maiorValor = Math.max(impostoPF, impostoPJ);
  const larguraPF = impostoPF / maiorValor * 100;
  const larguraPJ = impostoPJ / maiorValor * 100;

  const linha = (nome, sigla, valor, largura, cor) => (
    <div className="space-y-2">
      <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1 text-sm">
        <span className="font-semibold text-[#132436]">{nome} ({sigla})</span>
        <span className="font-bold tabular-nums text-[#132436]">{moeda(valor)}</span>
      </div>
      <div className="h-4 overflow-hidden rounded-full bg-gray-100" role="img" aria-label={`${nome}: ${moeda(valor)}, barra proporcional à maior carga tributária`}>
        <div className={`h-full rounded-full ${cor}`} style={{ width: `${largura}%` }} />
      </div>
    </div>
  );

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-6 ${className}`} aria-label="Comparativo da carga tributária">
      <h3 className="text-center text-lg font-bold text-[#132436]">Comparativo da carga tributária</h3>
      <p className="mx-auto mt-1 max-w-lg text-center text-xs leading-relaxed text-gray-600">PF e PJ são cenários alternativos. As barras usam a mesma escala para comparar os valores, não representam partes de uma cobrança única.</p>
      <div className="mx-auto mt-6 w-full max-w-xl space-y-5">
        {linha("Pessoa Física", "PF", impostoPF, larguraPF, "bg-[#CD371F]")}
        {linha("Pessoa Jurídica", "PJ", impostoPJ, larguraPJ, "bg-blue-600")}
      </div>
    </section>
  );
}
