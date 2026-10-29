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

## Base de navegação — M1

O React Router já faz parte das dependências. As rotas ficam em `src/App.jsx`,
e o menu compartilhado em `src/components/Navbar.jsx`. O menu é renderizado
uma única vez, acima das páginas, incluindo login e página 404.

| Rota | Componente | Estado nesta etapa |
| --- | --- | --- |
| `/` | `Landing` | Entrada existente |
| `/Home` | `Home` | Painel existente e contato com o NAF |
| `/calculo-pf` | `CalculoPF` | Calculadora PF existente |
| `/calculo-pj` | `CalculoPJ` | Calculadora PJ existente |
| `/comparativo` | `Comparativo` | Formulário e resultado existentes |
| `/historico` | `Historico` | Histórico existente conectado à API |
| `/faq` | `Faq` | Esqueleto para conteúdo do M4 |
| `/sobre` | `Sobre` | Esqueleto para conteúdo e contato do M4 |
| `/login`, `/cadastro`, `/RecuperarSenha` | Páginas de acesso | Fluxo existente |
| Qualquer outra rota | `NaoEncontrada` | Página 404 |

As calculadoras e o histórico dependem do backend e de uma sessão autenticada.
Nesta primeira tarefa, o fluxo existente foi mantido. Nas próximas tarefas de
M1, o formulário passará para `/`, o resultado para `/comparativo`, com estado
compartilhado e redirecionamento quando não houver simulação.

M2 pode trabalhar nas calculadoras existentes; M3 encontra o PDF em
`src/Pages/Comparativo.jsx`; M4 pode preencher `Faq.jsx` e `Sobre.jsx`.
Coordenem alterações em `Comparativo.jsx`, pois a separação do formulário e do
resultado também afetará esse arquivo.

Para verificar a base:

```bash
npm ci
npm run build
npm run dev
```

Abra o endereço informado pelo Vite e confira o menu, `/faq`, `/sobre` e um
endereço inexistente. Para validar as funcionalidades conectadas, execute também
o backend conforme o README da raiz. Na hospedagem, o servidor precisa servir
`index.html` para as rotas do frontend (fallback de SPA do BrowserRouter).
