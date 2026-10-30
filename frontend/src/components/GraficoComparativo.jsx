const moeda = (valor) => valor.toLocaleString("pt-BR", {
  style: "currency",
  currency: "BRL",
});

function criarSetor(inicio, fim, raio = 74) {
  const ponto = (angulo) => {
    const radianos = (angulo - 90) * Math.PI / 180;
    return [100 + raio * Math.cos(radianos), 100 + raio * Math.sin(radianos)];
  };
  const [x1, y1] = ponto(inicio);
  const [x2, y2] = ponto(fim);
  const grandeArco = fim - inicio > 180 ? 1 : 0;
  return `M 100 100 L ${x1} ${y1} A ${raio} ${raio} 0 ${grandeArco} 1 ${x2} ${y2} Z`;
}

export default function GraficoComparativo({ impostoPF, impostoPJ, className = "" }) {
  const valores = [impostoPF, impostoPJ];
  const validos = valores.every((valor) => Number.isFinite(valor) && valor >= 0);
  const total = validos ? impostoPF + impostoPJ : 0;

  if (!validos || total <= 0) {
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

  const percentualPF = impostoPF / total * 100;
  const percentualPJ = impostoPJ / total * 100;
  const pontoDivisao = percentualPF === 100 ? 360 : percentualPF * 3.6;

  return (
    <section className={`rounded-2xl border border-gray-200 bg-white p-5 ${className}`} aria-label="Comparativo da carga tributária">
      <h3 className="text-center text-lg font-bold text-[#132436]">Comparativo da carga tributária</h3>
      <p className="mt-1 text-center text-xs text-gray-500">Participação proporcional na soma dos dois cenários, apresentados separadamente.</p>
      <div className="mt-4 flex flex-col items-center justify-center gap-5 sm:flex-row">
        <svg viewBox="0 0 200 200" role="img" aria-label={`Pessoa Física ${percentualPF.toFixed(2)} por cento; Pessoa Jurídica ${percentualPJ.toFixed(2)} por cento`} className="h-44 w-44 shrink-0">
          {percentualPF === 100 ? (
            <circle cx="100" cy="100" r="74" fill="#CD371F" />
          ) : percentualPF === 0 ? (
            <circle cx="100" cy="100" r="74" fill="#2563eb" />
          ) : (
            <>
              <path d={criarSetor(0, pontoDivisao)} fill="#CD371F" />
              <path d={criarSetor(pontoDivisao, 360)} fill="#2563eb" />
            </>
          )}
          <circle cx="100" cy="100" r="43" fill="white" />
          <text x="100" y="96" textAnchor="middle" className="fill-[#132436] text-[10px] font-semibold">Total comparado</text>
          <text x="100" y="112" textAnchor="middle" className="fill-[#132436] text-[10px]">{moeda(total)}</text>
        </svg>
        <ul className="w-full space-y-3 text-sm sm:max-w-xs">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-[#CD371F]" />
            <span><strong>Pessoa Física (PF)</strong><br />{moeda(impostoPF)} · {percentualPF.toFixed(2).replace(".", ",")}%</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-3 w-3 shrink-0 rounded-sm bg-blue-600" />
            <span><strong>Pessoa Jurídica (PJ)</strong><br />{moeda(impostoPJ)} · {percentualPJ.toFixed(2).replace(".", ",")}%</span>
          </li>
        </ul>
      </div>
    </section>
  );
}
