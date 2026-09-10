# AgroSamas 2026 — contrato de arquitetura e verdade editorial

## 1. Escopo e autoridade

Este documento fecha o contrato técnico/editorial do AgroSamas antes da criação
do microsite. A implementação canônica está em `js/data/agrosamas.js`; este
documento explica como as próximas superfícies devem consumi-la.

A ordem de autoridade é:

1. responsável pelo conteúdo, quando fornece ou aprova diretamente um dado ou
   asset para este projeto;
2. Prefeitura Municipal de São Mateus do Sul e documentos oficiais;
3. site oficial do AgroSamas (`https://www.agrosamas.com.br/`);
4. Portal de Turismo de São Mateus do Sul.

Quando fontes divergirem, vence a fonte de maior autoridade. Ausência de
confirmação não pode ser convertida em afirmação pública. O relatório
`AGROSAMAS-2026-AUDITORIA-E-PLANO.md` é a base de evidências desta decisão.

## 2. Verdade editorial da edição 2026

| Campo | Valor canônico | Estado |
| --- | --- | --- |
| Nome | 5º AgroSamas | `CONFIRMED` |
| Início | 18 de setembro de 2026 | `CONFIRMED` |
| Fim | 21 de setembro de 2026 | `CONFIRMED` |
| Duração | quatro dias | `CONFIRMED` |
| Local | Rua do Mathe e entorno | `CONFIRMED` |
| Cidade/UF | São Mateus do Sul/PR | `CONFIRMED` |
| Miss São Mateus do Sul 2026 | 18 de setembro de 2026 | `CONFIRMED` |
| Logo oficial | asset fornecido diretamente pelo usuário | `USER_PROVIDED_APPROVED` |
| Programação | parcial | `CONFIRMED` |
| Roupa Nova | 20 de setembro de 2026 | `CONFIRMED` |
| Demais atrações | ainda não anunciadas | `NOT_YET_ANNOUNCED` |
| Horários e palco | ainda não anunciados | `NOT_YET_ANNOUNCED` |
| Condição de acesso/ingresso | ainda não anunciada | `NOT_YET_ANNOUNCED` |
| Expositores 2026 | ainda não anunciados | `NOT_YET_ANNOUNCED` |
| Mobilidade, estacionamento e operação | ainda não anunciados | `NOT_YET_ANNOUNCED` |

Shows específicos, dinossauros, atrações, expositores e programação herdados de
2025 não são fatos da edição 2026. Conteúdo histórico pode permanecer em arquivo
claramente identificado, mas nunca alimentar automaticamente a edição corrente.

## 3. Identidade e modelo de dados

- `seriesId`: `agrosamas` — identidade permanente, independente do ano.
- `editionId`: `agrosamas-2026` — identidade imutável da quinta edição.
- `activeEditionId`: aponta hoje para `agrosamas-2026`.
- `schemaVersion`: `2`.
- timezone: `America/Sao_Paulo`.

A identidade da edição usa `brand.status=USER_PROVIDED_APPROVED` e o binário
canônico `images/agrosamas/2026/logo-5-agrosamas.png`, PNG 1287 × 1222, SHA-256
`5ceb3d4ffba413d88f2e157d8202916f206c049c04bdb505ee5629043990b839`. Escala,
posicionamento e comportamento responsivo podem mudar; proporções, cores,
desenho, tipografia e composição do arquivo não podem ser reinterpretados.

O contrato é publicado como `window.AgroSamasContract`, em namespace não
reescrevível, e todos os seus dados são profundamente congelados. Ele centraliza
identidade, datas, duração, local, URLs, fontes, estados temporais, fatos,
programação, fallbacks e política de arquivo.

Hub, edição, Home e Eventos usam `js/agrosamas-contract-bindings.js` para nome,
ano, mês, intervalo de datas, duração, local, URL oficial, logo e primeiro item
confirmado. Textos editoriais traduzíveis continuam no dicionário i18n
existente; não há um segundo sistema de tradução.

## 4. Classificação de conteúdo

Todo fato editorial específico da edição usa um dos estados:

- `CONFIRMED`: pode ser publicado, desde que mantenha a fonte associada.
- `NOT_YET_ANNOUNCED`: ainda não divulgado; não pode ser inventado, mas sua
  ausência não bloqueia publicação nem deve produzir linguagem de erro.
- `LEGACY`: referência histórica interna, nunca promovida como fato corrente.
- `REJECTED`: informação já descartada por conflito com a fonte canônica.

Uma informação só migra para `CONFIRMED` após validação na hierarquia de fontes.
A mudança deve atualizar o contrato, a origem e os testes no mesmo delta.

## 5. Contrato de rotas

### `/agrosamas` — hub permanente da série

- Responsabilidade: apresentar a série, apontar a edição vigente e preservar a
  descoberta das edições arquivadas.
- Canonical URL: `https://turismo.saomateusdosul.pr.gov.br/agrosamas`.
- SEO: título e descrição perenes; `index,follow` quando a rota existir e passar
  QA.
- Busca e navegação: entrada principal da série após a ativação da rota.
- Sitemap: uma URL permanente, sem substituição anual.
- Deep links: nunca redirecionar silenciosamente para apagar uma edição passada.

### `/agrosamas-2026` — arquivo da edição 2026

- Responsabilidade: apresentar apenas fatos e mídia atribuídos à edição 2026.
- Canonical URL: `https://turismo.saomateusdosul.pr.gov.br/agrosamas-2026`.
- SEO: título e descrição específicos; `index,follow` e sitemap somente depois
  que o arquivo real existir e passar QA.
- Preservação: a URL continua válida em `POST_EVENT` e depois do surgimento de
  novas edições.
- Deep links: âncoras de programação, notícias e galeria pertencem a esta edição
  e não migram para o ano seguinte.

As duas rotas foram implementadas e ativadas na descoberta global no AGRO-04.
Home, Eventos, menu, busca e sitemap preservam o hub como porta permanente e a
edição 2026 como destino editorial específico. É proibido publicar link interno
quebrado apenas porque uma URL futura já consta no contrato.

Quando surgir 2027, deve ser criado `agrosamas-2027`, o `activeEditionId` e o CTA
principal do hub passam para a nova edição, e `/agrosamas-2026` permanece como
arquivo. O template de caminho é `/agrosamas-{year}`.

## 6. Estados temporais automáticos

Os limites são calculados pelo contrato, sem virada manual:

- `PRE_EVENT`: antes de `2026-09-18T00:00:00-03:00`.
- `EVENT_LIVE`: de `2026-09-18T00:00:00-03:00` até, sem incluir,
  `2026-09-22T00:00:00-03:00`.
- `POST_EVENT`: a partir de `2026-09-22T00:00:00-03:00`.
- `UNKNOWN`: relógio ou entrada inválida; a interface deve falhar de modo seguro.

| Superfície | `PRE_EVENT` | `EVENT_LIVE` | `POST_EVENT` |
| --- | --- | --- | --- |
| Hero | contagem/planejamento | estado do dia | arquivo da edição |
| CTA | planejar visita | programação do dia confirmada | retrospectiva/arquivo |
| Programação | confirmada ou fallback | dia atual primeiro | arquivo confirmado |
| Informações práticas | somente planejamento confirmado | informação operacional confirmada | contexto histórico |
| Fallback | programação em breve | ocultar bloco sem dado operacional | manter arquivo sem inventar retrospectiva |
| Notícias | anúncios oficiais | atualizações oficiais | resultados oficiais |
| Galeria | legado apenas se rotulado | somente mídia confirmada da edição | galeria arquivada da edição |
| Integração turística | planejamento do destino | atalhos úteis | descoberta permanente do destino |

Conteúdo editorial novo pode exigir publicação humana. A simples troca de estado
temporal não pode exigir edição de código ou mudança manual de flag.

## 7. Contrato de programação

`programming.availability` aceita:

- `UNAVAILABLE`: não renderiza itens, mesmo que uma entrada indevida seja
  fornecida; usa o fallback seguro.
- `PARTIAL`: renderiza apenas os itens confirmados já disponíveis e informa que a
  programação está em atualização.
- `COMPLETE`: renderiza o conjunto confirmado como programação completa.

Cada item deve usar:

| Campo | Obrigatoriedade | Regra |
| --- | --- | --- |
| `id` | obrigatória | estável dentro da edição |
| `seriesId` | obrigatória | exatamente `agrosamas` |
| `editionId` | obrigatória | exatamente `agrosamas-2026` |
| `date` | obrigatória | entre 18 e 21/09/2026 |
| `title` | obrigatória | título confirmado |
| `time` | opcional | omitir se ainda não confirmado |
| `venue` | opcional | omitir se ainda não confirmado |
| `category` | obrigatória | categoria editorial controlada |
| `featured` | obrigatória | booleano, sem alterar confirmação |
| `source` | obrigatória | URL/documento na hierarquia canônica |
| `contentStatus` | obrigatória | precisa ser `CONFIRMED` para publicação |

O seletor público aceita somente item `CONFIRMED`, da série e edição exatas,
dentro do intervalo canônico e com todos os campos obrigatórios válidos. Itens
`NOT_YET_ANNOUNCED`, `LEGACY`, `REJECTED`, de 2025, de outra edição, fora das
datas ou incompletos são filtrados. A programação 2026 está em `PARTIAL` e
contém um item: `Roupa Nova`, em `2026-09-20`, sem horário ou palco. O fallback
i18n canônico é `agrosamas-programming-fallback`: “Novas atrações serão
divulgadas em breve”.

## 8. Integrações preservadas

- `eventos-2026.json`: ocorrências 199–203 usam `seriesId=agrosamas` e
  `editionId=agrosamas-2026`; horários permanecem “A confirmar”.
- `js/event-occurrence-adapter.js`: `seriesId` e `editionId` são metadados
  aditivos de passagem; identidade de runtime, publicação e assinatura exata não
  mudaram.
- `js/data/eventos.js`: conserva o item único `id=agrosamas`, o vínculo com Rua
  do Mathe e a URL compatível `/eventos`; adiciona metadados das futuras rotas.
- Home: continua com limite de quatro cards, prioridade de eventos únicos,
  deduplicação e política de publicação existentes.
- Busca e mapa: continuam derivados do registro único de eventos, sem criar uma
  segunda cópia do AgroSamas.
- CMS/Admin/Firestore: nenhuma integração, configuração Admin, dado remoto ou
  backend foi alterado. O post local de fallback do CMS menciona somente o item
  confirmado e a continuidade dos anúncios, sem simular programação completa.

## 9. SEO, busca, sitemap e ativação

Série e edição possuem metadados distintos, dados estruturados compatíveis com
os fatos confirmados e links internos consistentes. A ativação em navegação,
busca e sitemap só acontece depois de cada rota existir e passar:

1. teste estrutural do contrato;
2. teste de rotas e links internos;
3. verificação responsiva e de acessibilidade;
4. verificação de console e assets;
5. revisão editorial humana.

O sitemap deve manter o hub e todas as edições publicadas. Encerrar o evento não
autoriza retirar `/agrosamas-2026` do índice nem redirecioná-la para 2027.

## 10. Invariantes para a edição 2026 e edições futuras

1. Não duplicar nome, datas, local ou URL oficial em novas páginas; consumir o
   contrato canônico.
2. Não transformar conteúdo `NOT_YET_ANNOUNCED`, `LEGACY` ou `REJECTED` em
   afirmação pública; usar copy natural de próximos anúncios quando apropriado.
3. Não usar programação 2025 como placeholder visual de 2026.
4. Não inferir ingresso, horários, shows, atrações, expositores ou métricas.
5. Não alterar identidade, publicação, deduplicação ou limite da Home para criar
   o microsite.
6. Não associar o evento ao Parque de Exposições ou à Arena Cultural sem nova
   confirmação oficial.
7. Derivar PRE/LIVE/POST de `resolveTemporalState`; `UNKNOWN` usa fallback seguro.
8. Manter `/agrosamas` perene e cada `/agrosamas-{year}` como arquivo imutável.
9. Só trocar links públicos para as novas rotas depois de implementação e QA.
10. Preservar i18n, SEO, acessibilidade, responsividade e proveniência das fontes.
11. Não tratar programação incompleta, demais atrações, expositores, entrada,
    mobilidade, estacionamento, horários ou operação ainda não anunciados como
    blocker de publicação.

## 11. Gates do contrato

O gate focado é `npm.cmd run test:agrosamas`. Ele valida fatos, identidade,
calendário, estados temporais, filtragem da programação, fallbacks, rotas
planejadas e regressões da Home/Eventos. Mudanças posteriores no contrato devem
manter esse gate verde e executar também os checks proporcionais à superfície
alterada.
