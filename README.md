# 🧮 Calculadora Tributária NAF - Comparativo PF vs PJ (2026)

Este projeto consiste em uma aplicação web full-stack desenvolvida para o **Núcleo de Apoio Contábil e Fiscal (NAF)**. O objetivo é automatizar a simulação e análise de vantagem tributária para prestadores de serviços autônomos (**Psicologia, Arquitetura e Advocacia**), comparando os cenários de atuação como Pessoa Física (IRPF/Livro Caixa) e Pessoa Jurídica (Simples Nacional/Fator R) com base nas regras fiscais do ano-calendário **2026**.

## 🏗️ Estrutura do Projeto
* **/frontend**: Interface do usuário desenvolvida em ReactJS, Vite e Tailwind CSS.
* **/backend**: Servidor Node.js com Express, Prisma ORM e banco de dados PostgreSQL.

## 🚀 Como Executar o Ecossistema Completo (Via Docker)
A forma recomendada e homologada de rodar o projeto completo (Frontend, Backend e Banco de Dados) é utilizando o Docker Compose a partir da raiz:

### 📋 Pré-requisitos
* Docker Desktop instalado e ativo.

### 🔌 Passo a Passo
1. Na raiz do projeto, copie `.env.example` para `.env` e configure as credenciais
   do banco e `JWT_SECRET`. Repita as credenciais em `DATABASE_URL`, mantendo
   `database:5432` como endereço interno. O banco usa somente a rede do Docker.
   `BACKEND_PORT` define a porta da API no computador (padrão: `3002`); o frontend
   recebe esse endereço automaticamente pelo Compose.
2. Construa as imagens e inicie os serviços orquestrados:
   ```bash
   docker compose up --build
   ```
3. O Docker irá configurar e subir automaticamente:
* Frontend: http://localhost:5173
* Backend: http://localhost:3002 (porta definida por `BACKEND_PORT` no `.env`)
* Banco de Dados: PostgreSQL (Instância interna)

_Nota: Para instruções de desenvolvimento isolado ou scripts específicos de cada serviço, consulte os arquivos README de suas respectivas pastas._

## Fluxo de trabalho da equipe — NP2

Cada integrante cria sua própria branch. A branch desta base é
`feat/m1-navegacao`. Sugestão de nomes para os demais blocos:
`feat/m2-fator-r`, `feat/m3-pdf-graficos` e `feat/m4-ux-acessibilidade`.

Depois que a base do M1 for integrada à `main`, cada integrante pode partir dela:

```bash
git switch main
git pull --ff-only origin main
git switch -c feat/m2-fator-r
```

Substitua o nome da branch pelo seu bloco. Faça commits pequenos e envie sua
branch com `git push -u origin NOME-DA-BRANCH`. Abra um pull request para `main`
e peça revisão de outro integrante antes do merge. Se já criou sua branch,
incorpore a base atualizada com `git fetch origin` e `git merge origin/main`.

Esse fluxo é uma proposta para a equipe confirmar no GitHub; não configura
proteções de branch automaticamente. O mapa das rotas e os pontos de trabalho
estão no [README do frontend](frontend/README.md#base-de-navegação--m1).
