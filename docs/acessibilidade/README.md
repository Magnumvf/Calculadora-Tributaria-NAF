# Auditoria de acessibilidade e responsividade (M4)

Auditoria refeita após integrar a `main` à branch M4. Ferramenta: Google
Lighthouse 13.6.0, categoria Acessibilidade, Chrome headless. A checagem de
largura usou viewport de 320 × 640 px.

## Resultados confirmados

| Rota | Claro | Escuro | Largura do documento em 320 px |
| --- | :---: | :---: | :---: |
| `/` (calculadora) | 100 | 100 | 305 px |
| `/inicio` | 100 | 100 | 305 px |
| `/login` | 100 | 100 | 305 px |
| `/cadastro` | 100 | 100 | 305 px |
| `/RecuperarSenha` | 100 | 100 | 305 px |
| `/faq` | 100 | 100 | 305 px |
| `/sobre` | 100 | 100 | 305 px |
| rota inexistente (404) | 100 | 100 | 305 px |
| `/Home` | 100 | 100 | 305 px |
| `/calculo-pf` | 100 | 100 | 305 px |
| `/calculo-pj` | 100 | 100 | 305 px |

O documento e o `body` não excederam a viewport de 320 px. `/Home`,
`/calculo-pf` e `/calculo-pj` foram renderizadas com token fictício para
auditar a apresentação das telas; isso não comprova login ou qualquer fluxo
autenticado.

## Rotas não consideradas auditadas

- `/comparativo` sem simulação redirecionou para `/` e exibiu a calculadora.
- `/historico` permaneceu na própria rota, mas a API indisponível não carregou
  registros. O token fictício não foi tratado como evidência de histórico.

Por isso, não há pontuação publicada para comparativo ou histórico. Eles ainda
precisam de auditoria com uma sessão e simulações carregadas.

## Outras verificações

- Em `/`, `/inicio`, `/faq`, `/sobre`, `/login`, `/cadastro` e
  `/RecuperarSenha`, as larguras foram conferidas em 320 e 1440 px, nos dois
  temas, e não houve rolagem horizontal.
- O menu móvel fechou com `Escape` e devolveu o foco ao botão.
- O primeiro `Tab` focou o link “Pular para o conteúdo”, que aponta para
  `#conteudo-principal`.
- A auditoria identificou contraste insuficiente no tema escuro e tokens
  semânticos ausentes na configuração Tailwind. Os tokens e fundos foram
  corrigidos; a execução final marcou 100 nas rotas auditadas.

## Limitações e pendências

Os fluxos reais de cálculo, PDF, histórico/reabertura, login/logout,
recuperação por e-mail e contato dependem de backend, banco de dados e SMTP.
Não foram executados com uma conta real neste ambiente. Os testes automatizados
do backend usam banco/SMTP simulados e não substituem esses testes
end-to-end. A auditoria de acessibilidade também não substitui testes com
leitores de tela.

Os relatórios HTML em `lighthouse/` mostram a execução final no tema claro; os
resumos JSON registram os dois temas e identificam as rotas não auditadas.
As capturas em `capturas-320px/` mostram a calculadora nos dois temas.

## Como repetir

```bash
cd frontend
npm run build
npx vite preview --port 4173
# em outro terminal; instale as ferramentas de auditoria apenas localmente
npm i --no-save lighthouse puppeteer-core chrome-launcher
node scripts/auditar-acessibilidade.mjs http://localhost:4173 ./auditoria claro
node scripts/auditar-acessibilidade.mjs http://localhost:4173 ./auditoria-escuro escuro
```

O script confere URL final e conteúdo principal. Comparativo sem resultado e
histórico sem dados são marcados como não auditados, em vez de atribuir a eles
a pontuação de uma tela de redirecionamento ou de erro.
