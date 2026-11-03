# Auditoria de acessibilidade M4

Data: 3 de novembro de 2026

## Resultados

Auditoria feita localmente com Lighthouse 13.6.0, categoria Acessibilidade,
Chrome headless e emulação móvel de 320 × 800 px. Cada rota abaixo foi
confirmada na URL final indicada e exibiu seu conteúdo esperado.

| Rota | URL final | Acessibilidade |
| --- | --- | ---: |
| `/` | `/` | 100 |
| `/inicio` | `/inicio` | 100 |
| `/faq` | `/faq` | 100 |
| `/sobre` | `/sobre` | 100 |
| `/login` | `/login` | 100 |
| `/cadastro` | `/cadastro` | 100 |
| `/RecuperarSenha` | `/RecuperarSenha` | 100 |

Também foram verificadas, com Playwright, a ausência de rolagem horizontal nas
rotas públicas a 320 px e 1440 px, nos temas claro e escuro, o fechamento do
menu móvel com `Escape` e retorno do foco ao botão, e o foco do link “Pular
para o conteúdo” em `#conteudo-principal`.

## Rotas e fluxos não auditados

`/comparativo` sem simulação redireciona para `/`; o conteúdo exibido foi
confirmado como a calculadora, portanto essa rota não foi considerada
auditada. `/historico` sem sessão redireciona para `/login`, que também foi
confirmado; o histórico não foi considerado auditado. O comparativo e o
histórico com dados reais, bem como a página de redefinição com token válido,
dependem de sessão e dados do backend.

Os fluxos reais de cálculo, geração de PDF, histórico/reabertura, login/logout,
recuperação por e-mail e contato não foram executados: este ambiente não tem
arquivo `.env`, Docker CLI, conta de teste ou credenciais SMTP. Nenhum dado ou
resposta de API simulada foi usado para alegar esses testes.

## Verificações locais

- `npm run lint`: aprovado.
- `npm run build`: aprovado; o Vite avisou que o bundle JavaScript minificado
  excede 500 kB.
- `frontend/npm test`: 5 testes aprovados.
- `backend/npm test`: 12 testes aprovados. Os testes de API de cálculo,
  autenticação/recuperação e e-mail usam banco e/ou SMTP simulados; não
  substituem os fluxos reais com conta, banco ou credenciais.
- `npm ci` informou 20 vulnerabilidades nas dependências do frontend (1
  crítica, 10 altas, 8 moderadas e 1 baixa); a instalação do backend informou
  mais 6 (1 crítica, 2 altas e 3 moderadas). Elas não foram investigadas nem
  corrigidas nesta atualização.
