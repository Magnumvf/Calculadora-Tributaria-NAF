# 💻 Calculadora Tributária NAF - Frontend Application

Esta pasta contém a interface gráfica de usuário (Single Page Application) da Calculadora Tributária, projetada com foco em experiência do usuário (UX) e responsividade para os atendimentos do NAF.

## 🛠️ Tecnologias e Bibliotecas
* **Core:** ReactJS estruturado e compilado via Vite (Node Alpine no ecossistema Docker).
* **Roteamento:** React Router Dom com gerenciamento de rotas protegidas (bloqueio de acesso sem token).
* **Estilização:** Tailwind CSS com transições fluidas e efeitos modernos de animação.
* **Comunicação:** Axios configurado com *interceptors* para injeção automática do Bearer Token JWT no cabeçalho das requisições.
* **Exportação:** html2pdf.js para captura do DOM e conversão em relatórios fiscais oficiais.

## 📄 Fluxos e Telas Conectadas à API
* **Acesso e Sessão:** Formulários reais e validados de **Login** e **Cadastro**, armazenando o token no `localStorage`.
* **Painel Interno:** Home integrada protegendo o acesso às calculadoras.
* **Simuladores Conectados:** Telas de Cálculo PF, Cálculo PJ e Análise de Vantagem Comparativa disparando parâmetros ao motor fiscal do servidor e atualizando os estados em tempo real.
* **Histórico de Simulações:** Página com tabela responsiva que busca e renderiza o histórico de simulações salvas no banco de dados do usuário autenticado.

## 🚀 Execução Local (Desenvolvimento Isolado)
Se preferir rodar ou testar apenas a interface do React de forma isolada sem o Docker Compose da raiz:

### Passo a Passo
1. Garanta que está na pasta correta:
    ```bash
    cd frontend
    ```
2. Instale as dependências do ecossistema:
    ```bash
    npm install
    ```
3. Inicie o servidor do Vite em ambiente de desenvolvimento local:
    ```bash
    npm run dev
    ```

## Navegação e estado — M1

As rotas e o estado compartilhado ficam em `src/App.jsx`. O menu é renderizado
uma única vez em `src/components/Navbar.jsx`, inclusive no login e na página 404.
Não foi adicionada biblioteca de gerenciamento de estado.

| Rota | Componente | Função |
| --- | --- | --- |
| `/` | `Calculadora` | Formulário do comparativo |
| `/comparativo` | `Comparativo` | Resultado, PDF e envio por e-mail |
| `/historico` | `Historico` | Simulações da conta e botão para reabrir o resultado |
| `/faq` | `Faq` | Perguntas frequentes |
| `/sobre` | `Sobre` | Informações do NAF e formulário de contato |
| `/inicio` | `Landing` | Página de apresentação anterior preservada |
| `/Home` | `Home` | Painel anterior e contato com o NAF |
| `/calculo-pf`, `/calculo-pj` | `CalculoPF`, `CalculoPJ` | Calculadoras individuais existentes |
| `/login`, `/cadastro`, `/RecuperarSenha` | Páginas de acesso | Fluxo de autenticação |
| Qualquer outra rota | `NaoEncontrada` | Página 404 |

Painel, Cálculo PF, Cálculo PJ e Histórico exigem login. Sem sessão, levam a
`/login` e, após autenticar, retornam à página solicitada. O botão Entrar
continua levando ao formulário após o login.

O formulário mantém os campos ao navegar pelo menu ou pelo login. O cálculo
continua exigindo autenticação e é salvo pela API existente. Após o sucesso,
`abrirSimulacao` atualiza o estado do App e a navegação leva a `/comparativo`.
Voltar ao formulário mantém os valores; reabrir pelo histórico não cria um novo
registro. O histórico continua consultando os registros da conta no banco.

O estado do formulário e do resultado é mantido em memória, sendo limpo ao sair
ou recarregar a página. Acesso a `/comparativo` sem resultado redireciona para `/`
com `replace`; o usuário autenticado pode reabrir os registros pelo histórico.

Pontos de trabalho dos colegas:
- M2: `Pages/Calculadora.jsx`, `utils/resultadoComparativo.js` e o motor existente
  no backend. O utilitário preserva a memória de cálculo anterior; não revisa as
  regras tributárias. Totais e registros vêm da API.
- M3: PDF e apresentação em `Pages/Comparativo.jsx`.
- M4: conteúdo em `Faq.jsx`/`Sobre.jsx` e acessibilidade das páginas.

O contato compartilhado está em `components/ContatoNaf.jsx`. Os dois envios de
e-mail usam as rotas `/emails/naf` e `/emails/comparativo` e exigem login. O
backend precisa das variáveis SMTP e do destinatário NAF; consulte seu README.
Falhas são exibidas ao usuário sem apagar a mensagem de contato.

O menu responsivo abre abaixo do breakpoint `md`, fecha com `Escape` e devolve
o foco ao botão do menu. O link de salto leva ao contêiner `#conteudo-principal`.
O tema pode ser alternado no menu e é salvo no navegador; o relatório PDF é
mantido em cores de papel para continuar legível nos dois temas.

Resultados da auditoria Lighthouse e limitações dos fluxos não executados:
[`docs/acessibilidade/auditoria-m4.md`](../docs/acessibilidade/auditoria-m4.md).

Validação local:

```bash
npm ci
npm run build
npm run lint
npm run dev
```

Para testar cálculos e histórico reais, execute também a API e o banco. Na
hospedagem, o servidor precisa servir `index.html` nas rotas do frontend
(fallback de SPA do BrowserRouter).
