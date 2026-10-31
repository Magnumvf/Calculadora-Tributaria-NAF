import { useCallback, useEffect, useState } from "react";

// Chave usada para guardar a preferência de tema entre as visitas.
export const CHAVE_TEMA = "naf-tema";

/**
 * Lê o tema inicial: primeiro a preferência salva pelo usuário; se não houver,
 * segue a configuração do sistema operacional (prefers-color-scheme).
 * O acesso ao localStorage fica em try/catch porque pode falhar em modo
 * privado ou com armazenamento bloqueado.
 */
function lerTemaInicial() {
  try {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (salvo === "claro" || salvo === "escuro") return salvo;
  } catch {
    // Sem acesso ao armazenamento: usa a preferência do sistema.
  }
  return window.matchMedia?.("(prefers-color-scheme: dark)").matches ? "escuro" : "claro";
}

/**
 * Hook do tema claro/escuro (funcionalidade opcional da seção 2.5).
 * Aplica a classe "dark" no <html>, que redefine os tokens de cor do index.css,
 * e persiste a escolha no localStorage.
 */
export default function useTema() {
  const [tema, setTema] = useState(lerTemaInicial);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", tema === "escuro");
    try {
      localStorage.setItem(CHAVE_TEMA, tema);
    } catch {
      // Se não for possível salvar, o tema vale apenas para esta visita.
    }
  }, [tema]);

  const alternarTema = useCallback(() => {
    setTema((atual) => (atual === "escuro" ? "claro" : "escuro"));
  }, []);

  return { tema, alternarTema };
}
