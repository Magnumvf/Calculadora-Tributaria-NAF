import React from "react";

export default function Footer() {
  return (
    <footer className="w-full bg-naf-blue text-white py-6 mt-auto shadow-inner">
      <div className="max-w-6xl mx-auto px-4 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        
        {/* Créditos do Projeto */}
        <div className="text-center md:text-left">
          <p className="font-bold text-lg mb-1 tracking-wide">Calculadora Tributária NAF</p>
          <p className="text-sm text-[#B2B2B2]">
            Desenvolvido por <span className="font-medium text-white">Alisson Almeida de Oliveira</span>
          </p>
        </div>

        {/* Links Úteis */}
        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium">
          <a 
            href="https://unichristus.edu.br/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors duration-300"
          >
            Portal Unichristus
          </a>
          <a 
            href="https://www.instagram.com/naf.unichristus/" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors duration-300"
          >
            Instagram do NAF
          </a>
          <a 
            href="https://www.gov.br/receitafederal/pt-br" 
            target="_blank" 
            rel="noopener noreferrer" 
            className="hover:text-white transition-colors duration-300"
          >
            Receita Federal
          </a>
        </div>
      </div>
    </footer>
  );
}
