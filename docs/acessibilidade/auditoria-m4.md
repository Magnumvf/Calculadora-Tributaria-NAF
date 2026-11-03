# Auditoria de acessibilidade M4

Data: 3 de novembro de 2026

## Resultados após integração

Lighthouse 13.6.0, categoria Acessibilidade, Chrome headless; viewport de
320 × 640 px para a checagem de largura. As 11 rotas listadas em
[`README.md`](./README.md) pontuaram 100 nos temas claro e escuro. Nas rotas
`/Home`, `/calculo-pf` e `/calculo-pj`, foi usado token fictício apenas para
renderizar a tela e conferir seu conteúdo; isso não é evidência de
autenticação ou dos fluxos do backend.

`/comparativo` foi excluída porque redirecionou para `/` sem uma simulação.
`/historico` foi excluída porque não carregou registros. Os resumos JSON
distinguem essas rotas não auditadas das pontuações obtidas.

A correção final também registrou os tokens semânticos no tema Tailwind para
que as utilidades de texto e superfície usadas pelas páginas sejam incluídas
no CSS de produção.

No navegador, as rotas públicas foram conferidas em 320 e 1440 px nos dois
temas. Não houve rolagem horizontal. Também foram verificados o fechamento do
menu móvel com `Escape`, o retorno do foco ao botão do menu e o foco do link
“Pular para o conteúdo” em `#conteudo-principal`.

## Fluxos com respostas simuladas

Uma verificação de interface interceptou as APIs (sem backend real): cálculo,
comparativo, histórico e reabertura foram percorridos com médico (Fator R
30%, Anexo III) e dentista (20%, Anexo V). O botão de PDF foi acionado, voltou
ao estado habilitado e não exibiu erro, mas o navegador integrado não reportou
um evento de download; portanto, o arquivo PDF e sua paginação não foram
confirmados. Os mocks não comprovam persistência, autenticação ou envio real.

## Verificações locais

- `npm run lint`: aprovado.
- `npm run build`: aprovado; o bundle JavaScript minificado excede 500 kB.
- `frontend/npm test`: 5 testes aprovados.
- `backend/npm test`: 12 testes aprovados. Os testes de API de cálculo,
  autenticação/recuperação e e-mail usam banco e/ou SMTP simulados.
- Não foram executados fluxos reais com banco, conta de teste ou credenciais
  SMTP: cálculo, geração/abertura de PDF, histórico/reabertura, login,
  recuperação por e-mail ou contato. O logout foi verificado no navegador,
  incluindo remoção do token e limpeza do formulário.
- A instalação anterior informou vulnerabilidades de dependências; elas não
  foram investigadas nem corrigidas nesta atualização.
