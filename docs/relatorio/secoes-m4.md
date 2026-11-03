# Relatório técnico NP2: seções sob responsabilidade do M4

Seções da estrutura 4.4 do edital redigidas pelo M4 (UX, acessibilidade e QA):
Contextualização, Dificuldades e Limitações e Conclusão, além das linhas do M4
na Lista de Atividades. O M4 também consolida o documento final com as seções
dos demais integrantes.

---

## Contextualização

A Calculadora Web de PJ e PF é uma aplicação de natureza extensionista
desenvolvida para apoiar o Núcleo de Apoio Contábil e Fiscal (NAF) da
Universidade Christus no atendimento à comunidade. Profissionais autônomos
costumam ter dúvida sobre continuar atuando como Pessoa Física (pagando Imposto
de Renda pela tabela progressiva, com dedução das despesas do livro caixa) ou
abrir uma empresa no Simples Nacional (pagando o imposto sobre o faturamento e
o INSS sobre o pró-labore). A ferramenta recebe a renda mensal, os custos e a
profissão, estima os encargos nos dois regimes e indica qual deles é mais
vantajoso, permitindo ainda gerar um PDF, enviar o resultado por e-mail e
mandar dúvidas ao NAF.

A versão da sprint 2026.1 atendia psicólogos, arquitetos e advogados em uma
aplicação React com backend Node.js, banco PostgreSQL e autenticação. A NP2
continua esse código e acrescenta quatro entregas obrigatórias: as profissões
de médico e dentista com cálculo do Fator R, a navegação multipágina com React
Router, a responsividade e a acessibilidade, e a evolução do PDF do
comparativo. Como o público do NAF é amplo, incluindo pessoas que usam
leitores de tela, navegam apenas pelo teclado ou acessam pelo celular, a
acessibilidade e o funcionamento em telas pequenas são parte central do
objetivo social do projeto.

## Dificuldades e Limitações

**Contraste da identidade visual.** A paleta herdada usava o vermelho #CD371F
e o cinza #B2B2B2 em textos sobre fundos claros, abaixo do mínimo de 4,5:1 do
nível AA. Além disso, o cartão do regime não recomendado no comparativo era
exibido com opacidade de 70%, o que reduzia o contraste de todo o texto dentro
dele. A solução foi criar tokens de cor centralizados no `index.css`, com
combinações conferidas, e trocar a opacidade por bordas e selo de destaque.

**Mensagens que os leitores de tela não acompanhavam.** Login, cadastro,
recuperação de senha e contato com o NAF usavam `alert()`, que interrompe o
fluxo e não se integra ao formulário. Essas mensagens passaram a ser exibidas
na própria página, em regiões `role="alert"` e `role="status"`, e os erros de
validação ficaram ligados aos campos por `aria-describedby` e `aria-invalid`.

**Menu em 320 px.** Com oito destinos mais as opções de conta, o menu ocupava
várias linhas no celular. Foi criado um menu recolhível com botão "Menu"
(`aria-expanded` e `aria-controls`), que fecha ao trocar de página ou com a
tecla Esc, e um link "Pular para o conteúdo" para quem usa teclado.

**Tema escuro sem quebrar o PDF.** Trocar cores fixas por classes do tema
poderia escurecer também a área do resultado que vira PDF. A área do
comparativo recebeu a classe `tema-papel`, que mantém as cores claras em
qualquer tema, preservando a legibilidade dos fundos coloridos e o visual do
documento gerado.

**Auditoria das páginas protegidas.** As páginas internas exigem login e o
backend roda com banco de dados. O script
`frontend/scripts/auditar-acessibilidade.mjs` verifica a URL final e o conteúdo
antes de executar o Lighthouse. Um token fictício foi usado somente para
renderizar as telas de `/Home`, `/calculo-pf` e `/calculo-pj`; isso não é
considerado teste de autenticação. `/comparativo` sem simulação redirecionou
para `/`, e `/historico` não carregou registros, então essas duas rotas não
foram pontuadas.

**Limitações e melhorias possíveis.**
- O contato usa `POST /emails/naf` com autenticação, o envio do comparativo
  usa `POST /emails/comparativo`, e a recuperação de senha usa as rotas reais
  de solicitação e redefinição. Esses fluxos não foram testados com conta,
  banco e SMTP reais neste ambiente.
- A auditoria automática cobre as regras verificáveis por ferramenta; um teste
  com usuários reais de leitores de tela (NVDA, TalkBack) traria evidências
  complementares.
- O fluxo completo de cálculo, PDF e reabertura pelo histórico ainda precisa
  de validação ponta a ponta com dados carregados.

## Conclusão

A equipe deu continuidade à Calculadora Web do NAF preservando as
funcionalidades da sprint anterior (cálculo e comparação PF/PJ, indicação do
regime mais vantajoso, envio por e-mail, mensagem ao NAF e PDF) e incorporando
as entregas obrigatórias da NP2. No bloco de responsividade e acessibilidade, a
aplicação passou a funcionar a partir de 320 px sem rolagem horizontal, com
rótulos em todos os campos, erros anunciados a leitores de tela, navegação
completa por teclado com foco visível e contraste AA. Na auditoria
pós-integração, 11 rotas com conteúdo confirmado atingiram 100 pontos nos
temas claro e escuro, acima do mínimo de 90 exigido. Comparativo sem simulação
e histórico sem registros carregados não foram contabilizados. Como
funcionalidade opcional, foi entregue o tema claro/escuro com a preferência
persistida entre as visitas. O resultado aproxima a ferramenta do seu
propósito extensionista: ser utilizável por qualquer pessoa atendida pelo
NAF, em qualquer dispositivo.

## Lista de Atividades (linhas do M4)

| Integrante | Atividade definida | Realizada? |
| --- | --- | --- |
| M4 | Responsividade a partir de 320 px sem rolagem horizontal | Sim |
| M4 | Rótulos em todos os campos e erros anunciados (aria-live) | Sim |
| M4 | Navegação por teclado com foco visível e contraste AA | Sim |
| M4 | Conteúdo das páginas /faq e /sobre | Sim |
| M4 | Auditoria Lighthouse de acessibilidade (mínimo 90) | Sim (100 em 11 rotas confirmadas; comparativo e histórico pendentes) |
| M4 | Opcional: tema claro/escuro persistido | Sim |
| M4 | Seções Contextualização, Dificuldades e Limitações e Conclusão | Sim |
| M4 | Consolidação do relatório técnico | Sim (resultados pós-integração atualizados) |

Evidências da auditoria: [`docs/acessibilidade/`](../acessibilidade/README.md).
