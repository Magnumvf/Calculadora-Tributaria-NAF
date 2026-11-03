# 💻 Calculadora Tributária NAF - Backend API

Esta pasta contém o servidor backend (API REST) da Calculadora Tributária, responsável pelas regras de negócio fiscais, autenticação de usuários e persistência de dados.

## 🛠️ Tecnologias e Dependências
* **Runtime & Framework:** Node.js com Express.
* **ORM & Banco de Dados:** Prisma ORM integrado ao PostgreSQL via Docker.
* **Segurança:** BCrypt (criptografia de senhas) e JSON Web Token (JWT para autenticação de sessões).
* **Desenvolvimento:** Nodemon com suporte a *Legacy Watch* para sincronização instantânea em containers.

## 🔑 Funcionalidades e Regras de Negócio Implementadas
* **Autenticação:** Cadastro de usuários com hash seguro e geração de tokens JWT no login.
* **Motor Fiscal (2026):**
  * **Pessoa Física:** Cálculo progressivo do IRPF 2026 deduzindo despesas operacionais escrituradas via Livro Caixa.
  * **Pessoa Jurídica:** Apuração do Simples Nacional considerando Anexo IV (Advocacia) e Anexo III com Fator R ativo (Psicologia/Arquitetura), somado ao recolhimento obrigatório do INSS sobre pró-labore baseado no salário mínimo vigente de 2026 ($R\$\,1.621,00$).
* **Histórico:** Salvamento automático e consulta de simulações tributárias atreladas de forma relacional ao ID do usuário autenticado.

## 🚀 Execução Local (Desenvolvimento Isolado)
Se houver a necessidade de rodar o servidor Express isoladamente fora do Docker local:

### Passo a Passo
1. Certifique-se de estar na pasta correta:
```bash
cd backend
```
2. Instale as dependências locais:
  ```bash
  npm install
  ```
3. Configure a variável de ambiente criando um arquivo .env com a sua string de conexão para um banco PostgreSQL local:
  ```bash
  DATABASE_URL="postgresql://usuario:senha@localhost:5432/nome_banco?schema=public"
  ```
4. Execute as migrações do banco com o Prisma:
  ```bash
  npx prisma migrate dev
  ```
5. Inicie o servidor em modo de desenvolvimento:
  ```bash
  npm run dev
  ```


## Envio de e-mail

O envio anterior do comparativo apenas exibia uma mensagem no frontend, e o
contato chamava `/send-email`, que não existia no backend. Agora as rotas
`POST /emails/comparativo` e `POST /emails/naf` fazem envio por SMTP com
[Nodemailer](https://nodemailer.com/smtp). Ambas exigem autenticação.

Configure no `.env` da raiz (repassado ao backend pelo Compose):

```env
SMTP_HOST=
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=
SMTP_PASS=
SMTP_FROM=
NAF_EMAIL=
```

Use os dados do serviço de envio escolhido pela equipe. Para TLS direto na porta
465, use `SMTP_SECURE=true`; na porta 587, use `false` (STARTTLS). `SMTP_FROM` é o
remetente autorizado no serviço, e `NAF_EMAIL` é o endereço de destino confirmado
pela equipe. Não há destinatário real predefinido. Sem configuração, a API
retorna erro 503 e não declara sucesso.

O comparativo recebe `{ email, calculoId }`, consulta a simulação do usuário
logado e envia o resumo salvo no banco. O contato recebe `{ nome, email,
mensagem }`, envia ao destinatário fixo `NAF_EMAIL` e define o e-mail do usuário
como endereço de resposta. Sucesso indica aceite pelo servidor SMTP, não uma
garantia de entrega na caixa de entrada.

Para iniciar ou atualizar o ambiente Docker, execute na raiz:

```bash
docker compose up --build
```

Frontend e backend executam `npm ci` antes de iniciar, atualizando inclusive
volumes de dependências reutilizados. Isso requer acesso ao registro npm e pode
demorar um pouco em cada inicialização. Não é necessário apagar volumes nem
instalar dependências manualmente. O volume do PostgreSQL é preservado.

## Recuperação de senha

O link “Esqueci minha senha” do login abre `/RecuperarSenha`. O envio reutiliza
as variáveis `SMTP_*` acima (inclusive o remetente autorizado na Brevo).
O destinatário é o e-mail cadastrado do usuário, não `NAF_EMAIL`.
Configure também no `.env` da raiz:

```env
APP_URL=http://localhost:5173
```

Use o endereço do frontend acessível por quem receber o e-mail. Em produção,
use a URL pública HTTPS; localhost só funciona na própria máquina.

Para atualizar uma instalação Docker, rode na raiz:

```bash
docker compose up --build
```

O script de inicialização gera o cliente Prisma e aplica a nova migração sem
apagar usuários ou cálculos.

- `POST /auth/forgot-password`, corpo `{ "email": "usuario@example.com" }`:
  retorna uma mensagem genérica para não revelar contas cadastradas. O envio
  ocorre após a resposta; falhas SMTP aparecem nos logs, sem expor o link.
- O link abre `/redefinir-senha#token=...`, vale por 30 minutos e tem uso único.
  Apenas o hash do token fica no banco. Um novo pedido substitui o link anterior.
- `POST /auth/reset-password`, corpo `{ "token": "...", "password": "..." }`:
  grava a nova senha com bcrypt e invalida as sessões anteriores.
- Senha nova: mínimo de 8 caracteres e máximo de 72 bytes. Há intervalo de
  1 minuto entre envios por conta e limite de 20 tentativas por IP em 15 minutos.
  O limite por IP fica em memória, adequado ao backend de instância única do projeto.

Execute `npm test` na pasta `backend`. Os testes usam banco e SMTP simulados e
cobrem expiração, uso único, concorrência, login com nova senha e invalidação de
sessões. Para validar a entrega real, solicite o link com uma conta cadastrada,
confira a caixa de entrada/spam, troque a senha e faça login novamente.
