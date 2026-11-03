import { useEffect, useState } from "react";

export default function useTema() {
  const [tema, setTema] = useState(() => localStorage.getItem("naf-tema") === "escuro" ? "escuro" : "claro");

  useEffect(() => {
    document.documentElement.dataset.theme = tema;
    localStorage.setItem("naf-tema", tema);
  }, [tema]);

  return [tema, setTema];
}
