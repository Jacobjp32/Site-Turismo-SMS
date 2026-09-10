# AGRO-05 — Relatório do release candidate AgroSamas 2026

**Classificação:** `AGRO-05 RELEASE CANDIDATE READY`

**Data da validação:** 10 de setembro de 2026

**Base Git verificada:** branch `main`, `HEAD=2b862718eec74f4b316f1a8f2f361c87b9ff03fe`

**Escopo:** correção editorial, integração da identidade oficial fornecida pelo
responsável pelo conteúdo, primeira atração confirmada, programação parcial e
QA local das quatro superfícies afetadas. Este relatório não autoriza nem
registra commit, push, deploy, publicação ou escrita em Firestore.

## 1. Decisão de release

O estado atual está pronto para publicação em um bloco posterior e separado.
Não foi encontrado blocker real de produto ou conteúdo dentro do escopo
AGRO-05.

Informações ainda não divulgadas são atualizações editoriais futuras, e não
falhas deste candidato. Continuam proibidos preenchimento por inferência,
reaproveitamento de 2025 como conteúdo 2026 e afirmações sem confirmação.

## 2. Identidade oficial

- origem fornecida pelo usuário:
  `D:\PREFEITURA\AGROSAMAS\LOGO 5º AGROSAMAS.png`;
- caminho canônico no projeto:
  `images/agrosamas/2026/logo-5-agrosamas.png`;
- formato e dimensões: PNG RGBA, 1287 × 1222;
- SHA-256 de origem e destino:
  `5ceb3d4ffba413d88f2e157d8202916f206c049c04bdb505ee5629043990b839`;
- igualdade binária: confirmada;
- classificação: `USER_PROVIDED_APPROVED`.

A marca foi integrada uma vez no hub e uma vez na edição, além dos metadados
Open Graph/Twitter correspondentes. O arquivo não recebeu filtro, recorte,
textura, reconstrução ou alteração de proporção. Somente escala, posição,
respiro e comportamento responsivo foram tratados em CSS.

## 3. Verdade editorial publicada

| Campo | Valor | Estado interno |
| --- | --- | --- |
| programação | parcial | `PARTIAL` |
| primeira atração | Roupa Nova | `CONFIRMED` |
| data da atração | 20 de setembro de 2026 | `CONFIRMED` |
| horário e palco | omitidos | `NOT_YET_ANNOUNCED` |
| demais atrações | ainda não divulgadas | `NOT_YET_ANNOUNCED` |
| expositores 2026 | ainda não divulgados | `NOT_YET_ANNOUNCED` |
| entrada e acesso | ainda não divulgados | `NOT_YET_ANNOUNCED` |
| mobilidade, estacionamento e operação | ainda não divulgados | `NOT_YET_ANNOUNCED` |

A interface apresenta os quatro dias, seleciona 20 SET como primeiro dia com
conteúdo confirmado e mostra Roupa Nova em composição tipográfica própria. Nos
outros dias, usa a frase natural “Novas atrações serão divulgadas em breve”,
sem cards falsos. Nenhuma superfície pública exibe os nomes dos estados
internos acima.

## 4. Integração por superfície

### Hub `/agrosamas`

A marca oficial integra o destaque da edição vigente sem transformar o hub em
grade de programação. O bloco destaca Roupa Nova e 20 SET e informa que novos
anúncios virão, preservando o papel perene da rota.

### Edição `/agrosamas-2026`

O hero usa a identidade oficial e mantém a foundation “território em
movimento”. A programação possui abas 18, 19, 20 e 21 SET; Roupa Nova recebe
destaque no dia 20 sem fotografia, logo ou material externo da banda e sem
horário, palco, duração ou repertório inventados.

### Home e Eventos

As duas superfícies exibem uma chamada compacta para Roupa Nova — 20 SET,
mantêm a edição como ação primária e o hub como descoberta permanente. A copy
de “novas atrações em breve” substitui qualquer leitura de bloqueio editorial.

### Busca, chatbot, CMS local e i18n

A busca reconhece Roupa Nova como termo da edição. As respostas locais do
chatbot e o fallback local do CMS usam somente nome e data confirmados. O
dicionário i18n existente foi estendido em português, inglês, espanhol e
polonês, sem criar um segundo sistema de tradução.

## 5. QA real em navegador

A matriz foi executada em `Chrome/152.0.7977.83`, por HTTP local, nas quatro
superfícies e cinco viewports solicitados.

| Superfície | 390×844 | 430×932 | 768×1024 | 1280×900 | 1440×900 |
| --- | --- | --- | --- | --- | --- |
| `/agrosamas` | PASS | PASS | PASS | PASS | PASS |
| `/agrosamas-2026` | PASS | PASS | PASS | PASS | PASS |
| Home | PASS | PASS | PASS | PASS | PASS |
| Eventos | PASS | PASS | PASS | PASS | PASS |

Resultado consolidado dos 20 casos:

- viewport interno solicitado confirmado em todos os casos;
- zero overflow horizontal inicial ou após interações;
- zero imagens quebradas;
- zero respostas HTTP locais com erro;
- marca natural 1287 × 1222, nítida no tamanho renderizado, sem filtro e com
  proporção preservada nos dez casos de hub/edição;
- Roupa Nova, 20 SET e a copy de novos anúncios presentes nos 20 casos;
- `programmingStatus=PARTIAL`, quatro abas e seleção inicial de 20 SET;
- `ArrowRight` mudou a seleção de 20 para 21 SET, comprovando teclado nas abas;
- dias sem item confirmado mantiveram fallback natural;
- nenhuma ocorrência de horário ou palco atribuída a Roupa Nova;
- PRE, LIVE e POST derivados do contrato e aprovados, sem overflow;
- navegação local sticky aprovada com `position=fixed`, `top=164`,
  `z-index=9000`, abaixo da barra global `z-index=9999`;
- A+ elevou a fonte base de 16 px para 19,2 px sem overflow e foi restaurado;
- alto contraste ativou corretamente, sem overflow, e foi restaurado;
- foco por teclado alcançou controles em todos os casos; inspeção visual
  adicional mostrou outline sólido de 3 px no controle A+.

O hub e a edição tiveram console e rede limpos nos dez casos. Home e Eventos
registraram somente a falha de App Check/reCAPTCHA já conhecida no ambiente
local e cancelamentos externos de Analytics/reCAPTCHA ao encerrar cada caso.
Não houve erro HTTP local, asset quebrado ou evidência de regressão causada pelo
AGRO-05. A matriz classifica esse ruído externo esperado separadamente e fechou
com `failures=[]`.

Evidência da rodada final:
`C:\Users\jacob\.codex\visualizations\2026\09\10\01a088a2-786a-7091-af4c-7d3634ea95d3\agro05-qa\agro05-browser-qa.json`.

## 6. Validação automatizada e estática

| Comando/verificação | Resultado |
| --- | --- |
| `npm.cmd run test:agrosamas` | PASS — 112/112 |
| `npm.cmd run test:rotas:public` | PASS — 16/16 |
| `npm.cmd run test:admin-finalization` | PASS — 15/15 |
| `node scripts/check-agent-harness.mjs --check` | PASS |
| `node --check` nos sete JS diretamente afetados | PASS |
| links/assets nas quatro superfícies | PASS — 214 referências locais, zero quebradas |
| âncoras no hub e na edição | PASS — zero quebradas |
| identidade origem/destino | PASS — SHA-256 idêntico |
| `git diff --check` | PASS; apenas avisos informativos de futura conversão LF/CRLF |

Rules não foram executadas porque o delta não altera Firestore Rules, Storage
Rules, índices nem contrato de escrita. Nenhuma operação Firebase foi usada na
implementação ou na validação.

## 7. Delta específico do AGRO-05

Arquivos criados ou alterados neste bloco:

- identidade e contrato: `images/agrosamas/2026/logo-5-agrosamas.png`,
  `js/data/agrosamas.js`, `js/agrosamas-contract-bindings.js`;
- hub: `agrosamas.html`, `css/agrosamas.css`, `js/agrosamas-hub.js`;
- edição: `agrosamas-2026.html`, `css/agrosamas-2026.css`,
  `js/agrosamas-2026.js`;
- Home/Eventos: `index.html`, `css/index.css`, `eventos.html`,
  `css/eventos.css`, `translations.js`;
- descoberta e conteúdo local: `js/search-index.js`, `js/chatbot.js`,
  `js/cms.js`;
- testes: `tests/agrosamas-architecture-contract.test.mjs`,
  `tests/agrosamas-visual-foundation.test.mjs`,
  `tests/agrosamas-global-integration.test.mjs`;
- documentação: `AGROSAMAS-2026-ARCHITECTURE-CONTRACT.md`,
  `AGROSAMAS-2026-VISUAL-FOUNDATION-REPORT.md`,
  `AGROSAMAS-2026-GLOBAL-INTEGRATION-REPORT.md` e este relatório.

Os dois relatórios históricos receberam somente adendos supervenientes; seus
achados originais não foram reescritos como se nunca tivessem ocorrido.

## 8. Candidate diff cumulativo pronto para versionamento

Como os blocos AGRO-02 a AGRO-05 permanecem sem commit, o candidato publicável
é cumulativo. A lista abaixo é o pathspec exato do conjunto AgroSamas que deve
ser auditado e stageado nominalmente em um futuro bloco de versionamento.

### Arquivos rastreados alterados

- `config.js`
- `css/eventos.css`
- `css/index.css`
- `docs/cms-establishments-seed-preview.json`
- `eventos-2026.json`
- `eventos.html`
- `galeria.html`
- `index.html`
- `js/chatbot.js`
- `js/cms.js`
- `js/data/eventos.js`
- `js/event-occurrence-adapter.js`
- `js/locais-data.js`
- `js/nav-shared.js`
- `js/search-index.js`
- `local.html`
- `mapa-3d.html`
- `mapa-completo.html`
- `mapa-turistico.html`
- `mes-polones-2026.html`
- `mes-polones.html`
- `noticia.html`
- `noticias.html`
- `o-que-fazer.html`
- `onde-ficar.html`
- `package.json`
- `para-o-trade.html`
- `portal-usuario.html`
- `reservas.html`
- `rotas-completas.html`
- `roteiro-ia.html`
- `sabores.html`
- `sitemap.xml`
- `tests/agrosamas-location-data.test.mjs`
- `tests/event-occurrence-adapter.test.mjs`
- `tests/polish-month-permanent-hub.test.mjs`
- `translations.js`
- `transparencia.html`

### Arquivos novos do candidato

- `AGROSAMAS-2026-ARCHITECTURE-CONTRACT.md`
- `AGROSAMAS-2026-AUDITORIA-E-PLANO.md`
- `AGROSAMAS-2026-GLOBAL-INTEGRATION-REPORT.md`
- `AGROSAMAS-2026-RELEASE-CANDIDATE-REPORT.md`
- `AGROSAMAS-2026-VISUAL-FOUNDATION-REPORT.md`
- `agrosamas-2026.html`
- `agrosamas.html`
- `css/agrosamas-2026.css`
- `css/agrosamas.css`
- `docs/research/manifesto_candidatos_imagens_mapa_turistico.json`
- `images/agrosamas/2026/logo-5-agrosamas.png`
- `js/agrosamas-2026.js`
- `js/agrosamas-contract-bindings.js`
- `js/agrosamas-hub.js`
- `js/data/agrosamas.js`
- `tests/agrosamas-architecture-contract.test.mjs`
- `tests/agrosamas-global-integration.test.mjs`
- `tests/agrosamas-visual-foundation.test.mjs`
- `tests/fixtures/agrosamas-2026-temporal-harness.html`
- `tests/fixtures/agrosamas-hub-temporal-harness.html`

Ficam explicitamente fora do candidato e não foram inspecionados, alterados ou
stageados: `.claude/`, `IMAGENS_MES_POLONES_2026_WEB.zip`,
`images/empreendimentos/_staging/` e `images/mascotes/mascotes.zip`.

## 9. Blockers e gates seguintes

**Blockers reais encontrados:** nenhum.

Programação ainda parcial, atrações futuras, expositores, entrada, mobilidade,
estacionamento, horários e operação ainda não anunciados não bloqueiam o
candidato. Eles devem entrar como updates futuros somente quando o responsável
pelo conteúdo fornecer ou confirmar os dados.

Commit, push, deploy e validação pública continuam ações separadas que exigem
autorização explícita. Nenhuma delas foi iniciada neste bloco.
