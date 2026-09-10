# AGRO-04 — Relatório de integração global do AgroSamas

**Classificação:** `AGRO-04 GLOBAL INTEGRATION COMPLETE`

**Data da validação:** 10 de setembro de 2026

**Rotas físicas:** `/agrosamas` (`agrosamas.html`) e `/agrosamas-2026` (`agrosamas-2026.html`)

**Escopo desta entrega:** hub permanente, conteúdo oficial revalidado, descoberta global, relação entre série e edição, SEO, estados temporais e QA local em navegador real. Este bloco não inclui publicação, commit, push, deploy, preview externo, Firestore ou alteração funcional do Admin.

## 1. Revalidação das fontes oficiais

A pesquisa foi limitada à Prefeitura Municipal e ao site oficial do evento, seguindo a hierarquia editorial do contrato. A ausência de uma programação final e o desencontro de atualização entre páginas oficiais foram tratados de forma fail-closed.

Fontes consultadas:

- [site oficial do AgroSamas](https://www.agrosamas.com.br/);
- [página de expositores do site oficial](https://www.agrosamas.com.br/expositores);
- [notícia municipal do Miss São Mateus do Sul 2026](https://www.saomateusdosul.pr.gov.br/portal/noticias/0/3/3591/inscricoes-abertas-para-o-miss-sao-mateus-do-sul-2026/);
- [notícia municipal do chamamento para o 5º AgroSamas](https://www.saomateusdosul.pr.gov.br/portal/noticias/0/3/3565/prefeitura-de-sao-mateus-do-sul-abre-inscricoes-para-chamamento-publico-para-comercializacao-de-chopp-no-5-agrosamas);
- [categoria municipal AgroSamas](https://www.saomateusdosul.pr.gov.br/portal/noticias/3/1/52/0/0/0).

| Tema | Classificação | Evidência e decisão pública |
| --- | --- | --- |
| Identidade | `CONFIRMED` | 5º AgroSamas, edição 2026. |
| Datas e duração | `CONFIRMED` | 18 a 21 de setembro de 2026, quatro dias. |
| Local | `CONFIRMED` | Rua do Mathe e entorno, São Mateus do Sul/PR. |
| Miss São Mateus do Sul | `CONFIRMED` | Concurso em 18 de setembro, dentro da 5ª edição. Somente a data confirmada foi incorporada. |
| Aniversário municipal | `CONFIRMED` | A edição integra a programação do 118º aniversário do município. |
| Programação e atrações | `PENDING` | A programação completa permanece anunciada como futura no site oficial; chamadas isoladas não foram convertidas em grade do evento. |
| Horários do evento | `PENDING` | Não existe grade oficial inequívoca da edição 2026. Horários de inscrições e editais não foram tratados como horários do evento. |
| Entrada e acesso | `PENDING` | Não foi localizada confirmação suficiente sobre gratuidade, bilheteria ou regras de acesso. |
| Como chegar e mobilidade | `PENDING` | O destino Rua do Mathe está confirmado, mas não há instruções operacionais 2026 suficientes sobre chegada, estacionamento, bloqueios ou embarque/desembarque. |
| Expositores | `CONFLICTING` / `LEGACY` | A área de expositores mantém conteúdo explicitamente associado ao 4º AgroSamas 2025 dentro de um site já identificado como 5º AgroSamas 2026. Nenhum nome foi promovido. |
| Informações operacionais | `PENDING` | Chamamentos e credenciamentos provam organização da edição, mas não substituem orientações finais ao visitante. |

Não foram incorporados atrações, expositores, horários, regras de entrada, estacionamento ou bloqueios. O fallback finalizado do AGRO-03 continua sendo o comportamento público da programação.

## 2. Arquitetura final

`/agrosamas` é a porta permanente da série. A página explica a identidade do evento, contextualiza sua relação com o território, destaca a edição vigente, inicia o arquivo digital em 2026 e conecta o visitante às rotas turísticas canônicas. Ela usa a mesma família visual “território em movimento” do AGRO-03, com tom menos urgente e mais orientado a patrimônio, memória e descoberta.

`/agrosamas-2026` permanece como a edição temporal e indexável. Sua energia de evento, countdown, programação, planejamento e comportamento PRE/LIVE/POST não foi duplicada no hub.

A relação é bidirecional:

- o hub possui CTAs para a edição vigente e o arquivo de 2026;
- a edição possui breadcrumb `Início > AgroSamas > 5º AgroSamas` e retorno explícito ao hub;
- o arquivo não remove a edição quando o estado passa para POST;
- a configuração `activeEditionId` e o template `/agrosamas-{year}` deixam a descoberta preparada para uma futura edição, sem criar rota histórica inexistente.

## 3. Conteúdo e contrato

- O contrato mantém identidades imutáveis distintas para série e edição.
- O vínculo com os 118 anos e a data do Miss foram acrescentados como fatos `CONFIRMED`, com fonte municipal explícita.
- Os bindings só tornam esses fatos visíveis quando o status permanece `CONFIRMED`.
- Programação segue `UNAVAILABLE`, com lista vazia e fallback seguro.
- Conteúdo `PENDING`, `LEGACY`, `CONFLICTING` ou `REJECTED` não entra em cards, schema ou texto factual da edição.
- A identidade oficial externa não foi baixada, simulada nem incorporada; a foundation tipográfica aprovada foi preservada.

## 4. Descoberta global

### Home

O destaque AgroSamas mantém a edição 2026 como ação primária e acrescenta o hub permanente como ação secundária. Datas, duração e local continuam derivados do contrato, sem implementação paralela e sem alterar a deduplicação ou o limite de quatro cards de eventos.

### Eventos

O destaque segue a mesma hierarquia: `/agrosamas-2026` para a experiência temporal e `/agrosamas` para a série. O resumo canônico de `js/data/eventos.js` aponta para o hub, preservando `seriesId`, `editionId`, ocorrências do calendário e adapter.

### Menu

Foi adicionado exatamente um item permanente “AgroSamas” dentro de `Agenda`, apontando para `/agrosamas`. A decisão evita inflar o primeiro nível e não duplica a entrada em desktop ou mobile.

### Busca

Existem duas entradas fixas e semanticamente distintas:

- `AgroSamas` → `/agrosamas`;
- `5º AgroSamas 2026` → `/agrosamas-2026`.

O resumo dinâmico do calendário é filtrado para não criar uma terceira duplicata. Em navegador real, as consultas `AgroSamas`, `5º AgroSamas` e `AgroSamas 2026` classificaram, respectivamente, hub, edição e edição em primeiro lugar. `Escape` fechou a busca, restaurou o foco ao acionador e liberou o scroll do documento.

### Mapa e jornada turística

O resumo do evento no mapa aponta para o hub. Os oito caminhos turísticos do hub reutilizam destinos existentes: hospedagem, sabores, mapa, atrações, rotas, Mês Polonês, erva-mate e Rio Iguaçu. Uma auditoria local de 212 referências em hub, edição, Home e Eventos encontrou zero rotas/assets internos inexistentes e zero âncoras locais quebradas.

## 5. Sitemap e SEO

- `/agrosamas` e `/agrosamas-2026` aparecem exatamente uma vez no sitemap.
- Cada página possui `title`, description, robots, canonical, Open Graph e Twitter próprios.
- O hub usa SEO perene e schema `WebPage` + `EventSeries`.
- A edição usa SEO de 2026, schema `Event` gerado pelo controlador e breadcrumb coerente com a série.
- Não existe canonical cruzado entre hub e edição.
- As imagens sociais reutilizam assets locais já aprovados; nenhuma identidade externa sem proveniência foi usada.

## 6. Estados temporais

Os estados continuam derivados exclusivamente dos limites `America/Sao_Paulo` do contrato, sem flag, query de controle ou persistência.

| Estado | Hub | Edição | Prova |
| --- | --- | --- | --- |
| `PRE_EVENT` | edição vigente com linguagem “vem aí” | countdown e fallback | harness real derivado do instante anterior ao início |
| `EVENT_LIVE` | destaque “acontecendo” | “AgroSamas Agora”, sem countdown | harness real derivado do intervalo do evento |
| `POST_EVENT` | 2026 passa a arquivo | edição continua acessível e orienta retrospectiva/destino | harness real derivado do instante posterior ao fim |

Os dois harnesses passam números de timestamp ao iframe para evitar dependência de objetos `Date` entre realms. No POST, os quatro links da edição no hub e os três retornos ao hub na edição permaneceram presentes; canonicals não mudaram.

## 7. QA visual e funcional

QA executado em Chromium real, servido por HTTP local.

### Matriz principal

| Superfície | 390×844 | 430×932 | 768×1024 | 1280×900 | 1440×900 |
| --- | --- | --- | --- | --- | --- |
| `/agrosamas` | PASS | PASS | PASS | PASS | PASS |
| `/agrosamas-2026` | PASS | PASS | PASS | PASS | PASS |
| Home | PASS | PASS | PASS | PASS | PASS |
| Eventos | PASS | PASS | PASS | PASS | PASS |

Em todas as medições, `documentElement.scrollWidth === clientWidth`. Não houve 404, imagem efetivamente quebrada, CTA fora do viewport ou título recortado. Um overflow real causado por tamanho mínimo de grid no hub mobile e uma colisão do título com o marcador no desktop foram encontrados durante o QA, corrigidos e revalidados nos cinco viewports.

### Navegação e acessibilidade

- navegação local sticky validada em desktop, tablet e mobile, abaixo das barras globais;
- Agenda validada em desktop e no drawer mobile, com um único link permanente e sem overflow;
- sequência inicial de oito focos percorrida por teclado, com foco visível e dentro do viewport;
- alto contraste alternado e restaurado;
- A+ elevou a fonte base de 16 px para 19,2 px sem gerar overflow e foi restaurado;
- `prefers-reduced-motion` possui regra explícita que remove reveal, transições, animações e smooth scroll; o contrato foi verificado pela suíte. A automação de navegador disponível não expôs a troca da preferência do sistema operacional, portanto esta parte não é apresentada como emulação real do SO.

### Regressões

Mapa, Galeria, Mês Polonês, Mês Polonês 2026 e Portal do Usuário foram exercitados em 390×844 e 1280×900. O login do Admin também foi carregado de forma estritamente read-only, sem autenticação. Todas as páginas mantiveram título, heading principal, navegação, largura correta e ausência de 404/assets quebrados.

Console limpo, em abas novas, para `/agrosamas` e `/agrosamas-2026`: zero erros e zero avisos. Nas páginas de regressão integradas a serviços externos, a sessão local registrou indisponibilidade esperada do Firestore no Mapa e falhas de App Check/reCAPTCHA em superfícies Firebase; os fallbacks existentes foram preservados e não há evidência de relação com o delta AGRO-04. A auditoria de rede/local encontrou zero referência interna quebrada.

## 8. Validação automatizada

| Comando | Resultado |
| --- | --- |
| `node --check js/agrosamas-hub.js` | PASS |
| `node --check js/agrosamas-contract-bindings.js` | PASS |
| `node --check js/search-index.js` | PASS |
| `npm.cmd run test:agrosamas` | PASS — 110/110 |
| `npm.cmd run test:rotas:public` | PASS — 16/16 |
| `npm.cmd run test:admin-finalization` | PASS — 15/15 |
| `node scripts/check-agent-harness.mjs --check` | PASS |
| auditoria local de links/assets/âncoras nas quatro superfícies principais | PASS — 212 referências, zero quebradas |
| `git diff --check` | PASS; apenas avisos informativos de futura conversão LF/CRLF em arquivos preexistentes |

A suíte AGRO cobre existência e papéis das duas rotas, identidade, bindings, Home/Eventos, busca real, menu, sitemap, SEO, ausência de fatos pendentes/legados, estados PRE/LIVE/POST, permanência de 2026 no POST, localização e adapters. Rules não foram executadas porque não houve alteração em Firestore Rules, Storage Rules ou contrato de escrita.

## 9. Arquivos do AGRO-04

### Criados

- `agrosamas.html`;
- `css/agrosamas.css`;
- `js/agrosamas-hub.js`;
- `tests/agrosamas-global-integration.test.mjs`;
- `tests/fixtures/agrosamas-hub-temporal-harness.html`;
- `AGROSAMAS-2026-GLOBAL-INTEGRATION-REPORT.md`.

### Alterados no delta de integração

- contrato e bindings: `js/data/agrosamas.js`, `js/agrosamas-contract-bindings.js`;
- edição e harness: `agrosamas-2026.html`, `tests/fixtures/agrosamas-2026-temporal-harness.html`;
- Home/Eventos: `index.html`, `eventos.html`, `css/index.css`, `css/eventos.css`, `js/data/eventos.js`, `translations.js`;
- descoberta: `js/nav-shared.js`, `js/search-index.js`, `sitemap.xml`, `mapa-turistico.html`;
- testes: `package.json`, `tests/agrosamas-architecture-contract.test.mjs`, `tests/agrosamas-visual-foundation.test.mjs`, `tests/agrosamas-location-data.test.mjs`, `tests/polish-month-permanent-hub.test.mjs`;
- consumidores globais de `nav-shared.js`: cache key atualizada nas páginas HTML do Portal para impedir navegação antiga servida pelo cache.

O CSS órfão do antigo `.agrosamas-banner` foi removido somente depois de comprovados zero consumidores. Não houve housekeeping fora desse legado AgroSamas.

## 10. Riscos e pendências reais

- programação, atrações, horários, entrada, mobilidade e operação continuam dependentes de publicação oficial inequívoca;
- a página oficial de expositores precisa ser atualizada e vinculada claramente à edição 2026 antes de qualquer integração;
- identidade/logo oficial continua bloqueada por proveniência e direitos;
- a prova local não substitui validação pública de cache, canonical servido, Core Web Vitals ou integrações Firebase após futura publicação;
- preferências de reduced motion foram verificadas por contrato, mas a preferência real do sistema não foi emulada nesta sessão;
- arquivos e alterações preexistentes dos blocos AGRO-02/03 e de outros trabalhos continuam preservados no worktree; nada foi stageado.

## 11. Próximo milestone recomendado

Executar um bloco independente de **conteúdo operacional e publicação**, somente quando houver:

1. programação 2026 oficial e inequívoca;
2. orientação ao visitante sobre acesso, entrada, mobilidade e horários;
3. lista de expositores sem conflito com 2025;
4. eventual identidade visual com proveniência e direitos aprovados;
5. autorização explícita, em gates separados, para versionamento e publicação.

Até lá, o contrato deve continuar fail-closed. Este relatório não autoriza commit, push, deploy, preview externo, Firestore, autenticação ou avanço automático.

## 12. Adendo AGRO-05 — correção editorial superveniente

Os achados acima permanecem como registro fiel do AGRO-04. Em 10 de setembro de
2026, o responsável pelo conteúdo forneceu uma decisão posterior que substitui
somente as conclusões sobre identidade, programação e blockers editoriais:

- a logo original fornecida pelo usuário está aprovada para este projeto e foi
  incorporada como `USER_PROVIDED_APPROVED`;
- Roupa Nova está confirmado para 20 de setembro de 2026, sem horário ou palco
  atribuídos;
- `programming.availability=PARTIAL`;
- demais atrações, expositores, entrada, mobilidade, estacionamento, horários e
  informações operacionais são `NOT_YET_ANNOUNCED`;
- essas ausências não impedem publicação. Permanecem proibidas invenção,
  inferência e promoção de conteúdo 2025 como se fosse 2026.

Com isso, os itens 1–4 da recomendação anterior deixam de ser pré-condições de
publicação. Commit, push e deploy continuam gates separados e não foram
autorizados pelo AGRO-05.
