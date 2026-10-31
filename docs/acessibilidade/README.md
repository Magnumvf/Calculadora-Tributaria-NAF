# Auditoria de acessibilidade e responsividade (M4)

Requisito da seção 2.4 do edital: aplicação utilizável a partir de 320 px sem
rolagem horizontal, rótulos em todos os campos, erros anunciados a leitores de
tela, navegação por teclado com foco visível, contraste AA (4,5:1) e auditoria
de acessibilidade com pontuação mínima de 90.

## Resultado

Ferramenta: Google Lighthouse 13, categoria **Acessibilidade**, emulação de
dispositivo móvel. A largura de 320 px foi verificada separadamente com o
Chrome em modo headless (viewport de 320 x 640).

| Rota | Tema claro | Tema escuro | Sem rolagem horizontal em 320 px |
| --- | :---: | :---: | :---: |
| `/` (início) | 100 | 100 | Sim |
| `/login` | 100 | 100 | Sim |
| `/cadastro` | 100 | 100 | Sim |
| `/RecuperarSenha` | 100 | 100 | Sim |
| `/faq` | 100 | 100 | Sim |
| `/sobre` | 100 | 100 | Sim |
| rota inexistente (404) | 100 | 100 | Sim |
| `/Home` (painel e contato NAF) | 100 | 100 | Sim |
| `/calculo-pf` | 100 | 100 | Sim |
| `/calculo-pj` | 100 | 100 | Sim |
| `/comparativo` | 100 | 100 | Sim |
| `/historico` | 100 | 100 | Sim |

Antes dos ajustes do M4, a primeira rodada apontava 98 em 8 páginas
(regiões `main` ausentes nas telas de acesso e títulos fora de ordem).

## Evidências nesta pasta

- `lighthouse/*.html`: relatórios completos do Lighthouse (abra no navegador).
- `resumo-tema-claro.json` e `resumo-tema-escuro.json`: pontuação de todas as rotas.
- `capturas-320px/`: telas início, comparativo e painel em 320 px nos dois temas.

As páginas internas foram auditadas com um token fictício no navegador, sem o
backend, para que o formulário fosse exibido; o histórico aparece no estado de
erro de conexão, que também foi avaliado.

## Como repetir a auditoria

```bash
cd frontend
npm run build
npx vite preview --port 4173
# em outro terminal
npm i --no-save lighthouse puppeteer-core chrome-launcher
node scripts/auditar-acessibilidade.mjs http://localhost:4173 ./auditoria claro
node scripts/auditar-acessibilidade.mjs http://localhost:4173 ./auditoria-escuro escuro
```

## O que foi feito para atender cada critério

| Critério | Implementação |
| --- | --- |
| 320 px sem rolagem horizontal | Menu recolhível (botão "Menu" abaixo de 1024 px), tooltips limitados à largura da tela, mídias com `max-width: 100%`, quebra de palavras longas |
| Rótulo em cada campo | Todos os `input`, `select` e `textarea` têm `label` com `htmlFor`/`id` |
| Erros anunciados | Mensagens de validação em regiões `aria-live`, campos com `aria-invalid` e `aria-describedby`; os `alert()` de login, cadastro, recuperação de senha e contato com o NAF viraram avisos `role="alert"`/`role="status"` na própria página |
| Teclado e foco visível | Contorno de foco de 3 px em todos os elementos, link "Pular para o conteúdo", menu fecha com Esc, tooltips abrem com foco, FAQ com `aria-expanded` |
| Contraste AA | Paleta revista com tokens de cor (`index.css`); remoção da opacidade que apagava o cartão não recomendado no comparativo; destaque da página inicial em cor clara sobre o azul |
| Movimento reduzido | Animações desligadas quando o sistema pede `prefers-reduced-motion` |
| Tema claro/escuro (opcional 2.5) | Botão no menu com `aria-pressed`, preferência salva no `localStorage` e aplicada antes do carregamento para não piscar |
