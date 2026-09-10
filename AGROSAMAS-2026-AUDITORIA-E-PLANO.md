# AGRO-01 — Auditoria e plano de implementação do Hub AgroSamas

**Projeto:** Portal de Turismo de São Mateus do Sul

**Data de corte da auditoria:** 9 de setembro de 2026

**Base local auditada:** branch `main`, commit `2b862718eec74f4b316f1a8f2f361c87b9ff03fe`

**Escopo deste bloco:** auditoria e planejamento. Nenhuma página, conteúdo existente, contrato, Admin ou dado remoto foi alterado.

## 1. Resumo executivo

O Portal ainda não possui as rotas `/agrosamas` e `/agrosamas-2026`. O evento aparece de forma fragmentada na Home, em Eventos, no calendário anual, na busca/mapa por meio de um resumo estático, no chatbot, em locais e em um fallback local de notícias. Não existe hoje uma fonte editorial única da edição nem um contrato capaz de representar programação por dia/palco, blocos operacionais, disponibilidade de conteúdo ou os estados `PRE_EVENT`, `EVENT_LIVE` e `POST_EVENT`.

A baseline pública verificável é: **5º AgroSamas, de 18 a 21 de setembro de 2026, quatro dias, na Rua do Mathe/entorno, em São Mateus do Sul/PR**. O Portal contradiz essa baseline em superfícies importantes: Home e card de Eventos anunciam 17–21 e cinco dias; o calendário local coloca o Miss em 19/09, embora a Prefeitura confirme 18/09; e diferentes componentes afirmam entrada gratuita, Parque dos Dinossauros, parque de diversões, horários e conteúdo de shows sem confirmação pública suficiente para 2026.

A arquitetura recomendada mantém o site [agrosamas.com.br](https://www.agrosamas.com.br/) como fonte oficial do evento e cria no Turismo uma jornada complementar, orientada à visita:

- `/agrosamas`: hub permanente, história, identidade, arquivo de edições e porta de entrada turística;
- `/agrosamas-2026`: edição operacional, rápida e temporal, com programação e informações práticas publicadas somente quando houver fonte confirmada;
- configuração frontend pequena e testável para a edição, sem backend novo no primeiro ciclo;
- vínculo `seriesId` entre a edição e as ocorrências do calendário, com teste de consistência entre fontes;
- integrações profundas com Rua do Mathe, mapa, hospedagem, gastronomia, atrativos e rotas, sem copiar os respectivos dados.

A maior evolução sobre o Mês Polonês deve ser **priorizar a tarefa do visitante antes da narrativa longa**: status e data visíveis, navegação rápida persistente, programação por dia imediatamente consultável, planejamento da visita e estado temporal automático. Fotografia, números e movimento entram como hierarquia editorial; não como peso ou ornamentação.

## 2. Estado atual do AgroSamas no Portal

### 2.1 Superfícies públicas e fluxo de dados

| Superfície | Estado encontrado | Fonte/trecho principal | Consequência para o hub |
| --- | --- | --- | --- |
| Home — “Festas em destaque” | Card estático com link apenas para o site externo | `index.html:542-572`; traduções em `translations.js` | Precisa passar a oferecer CTA interno para `/agrosamas-2026` e CTA secundário para o site oficial. |
| Home — “Acontece em breve” | Carrega `eventos-2026.json`, normaliza e depois enriquece com `eventos_aprovados` | `js/home-eventos.js:23-204` | As ocorrências AgroSamas entram como cinco cards concorrentes; `seriesId` deve permitir agrupamento/ligação coerente. |
| Eventos — destaque lateral | Card estático, externo, com 17–21 e gratuito | `eventos.html:177-188` | Deve apontar para a edição interna e receber data da configuração canônica. |
| Eventos — calendário | Cinco ocorrências estáticas em quatro datas | `eventos-2026.json:167-171` | Datas/horários/conteúdo precisam ser revalidados e associados à série. |
| Eventos — conteúdo dinâmico | Mescla coleção pública genérica `eventos_aprovados` | `eventos.html:366-773` | Não é contrato de programação de festival; manter como calendário genérico. |
| Busca global | AgroSamas é criado dinamicamente a partir de `TURISMO_EVENTOS` e aponta para `/eventos` | `js/search-index.js:19-30,58-91`; `js/data/eventos.js:1-22` | Criar entradas fixas para as duas rotas e trocar o destino do resumo para o hub. |
| Mapa turístico | Consome o resumo `TURISMO_EVENTOS` e ocorrências aprovadas | `js/data/eventos.js:1-22`; `js/mapa-turistico.js:923-944` | Preservar Rua do Mathe como local canônico; oferecer deep link ao mapa, sem duplicar coordenadas. |
| Página de local | Rua do Mathe cita AgroSamas; Arena Cultural afirma receber parte da programação | `js/locais-data.js:54-70,255` | Rua do Mathe é o vínculo confiável. A associação à Arena requer fonte oficial antes de aparecer no hub. |
| Hospedagem | Alerta geral de alta procura em setembro | `onde-ficar.html:251`; `translations.js:910,1852,2794,3736` | Útil como link contextual, sem copiar estabelecimentos. |
| Notícias | CMS genérico; fallback local contém notícia AgroSamas demonstrativa e desatualizada | `js/cms.js:86-100`; `noticias.html:341-381`; `noticia.html` | Remover/corrigir o fallback somente em bloco autorizado; no hub, usar links editoriais confirmados e estado vazio seguro. |
| Configuração promocional | `CONFIG.agrosamas` desativado, data inicial 17/09 e Instagram não verificado | `config.js:56-65,145-154` | Não reutilizar como contrato da edição. Banners públicos dinâmicos já são o mecanismo apropriado para campanha. |
| CSS promocional | CSS do antigo banner permanece sem elemento correspondente na Home | `css/index.css:2634-2825` | Dívida órfã; não incorporar ao novo microsite. |
| SEO | Apenas `AgroSamas` em keywords da Home | `index.html:20` | Não há canonical, metadados sociais ou dados estruturados próprios. |
| Sitemap | Nenhuma rota AgroSamas | `sitemap.xml:1-113` | Adicionar as duas rotas quando existirem e estiverem indexáveis. |
| Navegação | Nenhum item AgroSamas | `js/nav-shared.js:43-83` | Recomenda-se link permanente em Agenda, sem criar novo item de primeiro nível. |
| Link externo | Home e Eventos apontam para `https://agrosamas.com.br` | `index.html:571`; `eventos.html:188`; `config.js:64` | Preservar como CTA “Site oficial do evento”, claramente distinto da experiência turística. |

### 2.2 Contratos atuais

O resumo estático em `js/data/eventos.js:1-22` é a identidade usada por busca e mapa. Seus campos canônicos atuais são `id`, `nome`, `categoria`, `descricao`, `imagem`, `galeria`, `url`, `localId`, `localUrl`, `periodo`, `local`, `recorrencia`, `coordenadas` e `tags`. O local está corretamente vinculado a `rua-do-mathe`, `/local?id=rua-do-mathe` e às coordenadas `-25.878, -50.385`.

O adaptador `js/event-occurrence-adapter.js:186-220` já reconhece `seriesId`, mas as cinco ocorrências AgroSamas em `eventos-2026.json` ainda não o declaram. Essa é a menor extensão capaz de unir calendário, Home e edição sem inventar uma nova coleção.

O Admin genérico de eventos oferece título, data, horário inicial, local, organizador, categoria, capa, publicação, destaque e descrição (`js/admin-content-cms.js:1069-1125`). Ele não representa:

- duração e horário final;
- palco/área;
- grade ordenada por dia;
- status de confirmação;
- fonte e data de verificação por item;
- mapa operacional;
- informações de trânsito, acessibilidade, banheiros, primeiros socorros ou estacionamento;
- blocos editoriais e disponibilidade de seção;
- estado temporal da edição.

`firestore.rules:1284-1287` permite leitura pública da coleção genérica e escrita por moderador. O CMS de notícias é igualmente genérico (`js/admin-content-cms.js:1163-1180`; `firestore.rules:1455-1457`). **Conclusão:** nenhum deles deve ser forçado a virar o contrato do microsite neste primeiro ciclo; não há necessidade comprovada de backend novo.

### 2.3 Catálogo exato de referências rastreadas

A busca case-insensitive por `AgroSamas`, `Agro Samas`, `5º AgroSamas`, `V AgroSamas` e variantes encontrou referências em **38 arquivos de texto rastreados**:

**Runtime público/configuração — 12 arquivos:**

- `config.js:56-65,145-154` — configuração e ativação do banner legado;
- `css/eventos.css:542-606` — estilos do card de destaque ativo em Eventos;
- `css/index.css:2634-2825,2936,3032` — banner legado órfão e card da Home;
- `eventos-2026.json:167-171` — cinco ocorrências;
- `eventos.html:177-188` — card de destaque;
- `index.html:20,461,542-572` — keyword, imagem e card;
- `js/chatbot.js:124-132,190-191,232-233,273-274` — respostas em PT/EN/ES/PL;
- `js/cms.js:86-100` — fallback de notícia;
- `js/data/eventos.js:1-22` — resumo consumido por busca/mapa;
- `js/locais-data.js:54-70,255` — Rua do Mathe e Arena Cultural;
- `onde-ficar.html:251` — alerta de demanda;
- `translations.js:128,442-451,516-517,770-772,787-788,910` e blocos equivalentes EN/ES/PL — card, banner legado, Eventos e hospedagem.

**Testes — 3 arquivos:**

- `tests/agrosamas-location-data.test.mjs` — contrato de local, coordenadas, busca, mapa e preservação do calendário;
- `tests/event-occurrence-adapter.test.mjs` — identidade/série no adaptador;
- `tests/admin-finalization.structure.test.mjs:137` — asserção estrutural de que o dataset de eventos contém AgroSamas.

**Documentação, relatórios históricos e artefatos de auditoria — 23 arquivos:**

- raiz: `CHANGELOG_AI.md`, `CLAUDE.md`, `TASKS.md`;
- docs: `docs/atualizacao-empreendimentos.md`, `docs/auditoria-dados.md`, `docs/auditoria-geral-site.md`, `docs/auditoria-seguranca.md`, `docs/auditoria-site-publico-pos-4h.md`, `docs/bloco-4-banners-popups.md`, `docs/bloco-4f-exibicao-publica-banners.md`, `docs/bloco-s15-validacao-geral-pos-blocos.md`, `docs/bloco-s17-filtro-erva-mate-sabores.md`, `docs/cms-establishments-seed-preview.json`, `docs/otimizacao-imagens.md`, `docs/pendencias-mapa.md`, `docs/plano-admin-cms-completo.md`, `docs/qa-pos-rodadas-portal-turismo.md`, `docs/tarefa-5-auditoria-eventos-locais.md`;
- auditorias geradas: `docs/auditoria-output/assets-report.json`, `assets-report.md`, `interaction-playwright-report.json`, `project-report.json`, `project-report.md`.

Esses 23 arquivos não são fonte runtime. Devem permanecer como histórico, salvo tarefa documental específica. O ponto de maior risco é `docs/cms-establishments-seed-preview.json:4321-4343`, que ainda descreve Parque de Exposições como sede do V AgroSamas, menciona dinossauros e usa número histórico como se fosse atual; a entrada canônica da Rua do Mathe aparece a partir de `:7003`.

## 3. Inconsistências encontradas

| Prioridade | Divergência | Onde está | Baseline correta/estado | Ação futura |
| --- | --- | --- | --- | --- |
| P0 | `17–21 de setembro` e “cinco dias” | `index.html:558-563`; `translations.js:443-447,1385-1389,2327-2331,3269-3273`; card `eventos.html:181-186`; `translations.js:770-772` e equivalentes | 18–21/09/2026, quatro dias | Corrigir todas as cópias no AGRO-02 antes de publicar as rotas. |
| P0 | Miss São Mateus do Sul em 19/09 | `eventos-2026.json:169` | Prefeitura confirma 18/09 | Corrigir data e testar a ocorrência após aprovação do bloco de implementação. |
| P0 | Fallback anuncia “Programação Completa Revelada” e 17–21 | `js/cms.js:86-100` | Programação oficial ainda aparece como “em breve” | Substituir por fallback neutro ou remover esse registro demonstrativo em bloco autorizado. |
| P1 | Entrada gratuita afirmada como fato de 2026 | Home, Eventos, chatbot e traduções | Política final de entrada não localizada nas fontes 2026 auditadas | Não exibir até fonte oficial explícita; conteúdo 2025 não prova 2026. |
| P1 | Parque dos Dinossauros e parque de diversões | Home e quatro idiomas; seed histórico | Não confirmados para 2026; aparecem em notícia de 2025 | Classificar como legado 2025 e retirar da edição 2026 até anúncio oficial. |
| P1 | Horários 19h30, 9h, 9h e 19h; “show nacional” e “premiação” | `eventos-2026.json:167-171` | Não localizados na programação oficial, ainda não divulgada | Marcar horários como “a confirmar” e descrições como neutras até fonte verificável. |
| P1 | Afirmações genéricas de shows nacionais, feira e exposição como grade confirmada | chatbot, Home, calendário e resumo | O site oficial confirma eixos/promessas gerais, mas não nomes nem grade | Redigir como escopo do evento, nunca como programação fechada. |
| P1 | Instagram `@agrosamas2026` | `config.js:65` | Site oficial exibe `@agrosamas2025` no rodapé na data de corte | Não publicar handle até confirmação editorial; preferir link do site oficial. |
| P1 | URLs públicas vão apenas para `/eventos` ou site externo | `js/data/eventos.js:14`, Home e Eventos | Rotas internas ainda inexistentes | Após criar as rotas, usar `/agrosamas` e `/agrosamas-2026` conforme intenção. |
| P2 | Arena Cultural indicada como palco de parte da programação | `js/locais-data.js:255` | Não há confirmação oficial 2026 auditada | Não importar essa relação para o hub sem fonte. |
| P2 | Banner legado configurado com início 17/09 e sem elemento na Home | `config.js:59-65,145-154`; `css/index.css:2634-2825` | Mecanismo inativo/órfão; banners públicos dinâmicos já existem | Não reutilizar. Tratar limpeza em tarefa separada, após prova de órfão. |
| P2 | Não há rota, busca fixa, sitemap ou SEO dedicado | `sitemap.xml`, `js/search-index.js`, `js/nav-shared.js` | Hub/edição inexistentes | Criar junto às rotas, com gate de descoberta e indexação. |
| P2 | Formas `5º` e `V` coexistem | Home/Eventos versus calendário/chatbot | Marca pública usa `5º AgroSamas` | Padronizar interface como `5º AgroSamas`; aceitar `V AgroSamas` apenas como termo de busca/legado. |

Nenhuma dessas divergências foi corrigida neste bloco.

## 4. Inventário de assets

### 4.1 Assets AgroSamas rastreados

| Caminho | Formato e dimensões | Tamanho | Edição/proveniência observável | Reutilização potencial | Risco |
| --- | --- | ---: | --- | --- | --- |
| `images/agrosamas-publico-show-noturno.webp` | WebP, 1600×900 | 262.578 B | Foto de evento já realizado; edição exata não comprovada no repositório | Boa candidata a atmosfera/retrospectiva e placeholder editorial; já usada na Home, busca e mapa | Médio/alto: não apresentar como registro de 2026 nem como atração confirmada. |
| `images/empreendimentos/agrosamas/agrosamas-01.jpg` | JPEG, 4000×2250 | 4.275.247 B | Vista diurna aérea, tratores e área urbana; edição exata não comprovada | Recorte histórico/“Mundo Agro”, depois de autorização editorial e derivação otimizada | Alto: arquivo pesado e possivelmente legado até 2025. |
| `images/empreendimentos/agrosamas/agrosamas-02.jpg` | JPEG, 4000×2250 | 4.811.831 B | Registro com balão; edição exata não comprovada | Retrospectiva/atmosfera, com legenda temporal | Alto: é o maior arquivo, sem derivado web e sem prova de 2026. |
| `images/empreendimentos/agrosamas/agrosamas-03.jpeg` | JPEG, 4000×2250 | 3.102.073 B | Público/show noturno; provável fonte visual próxima do WebP acima | Arquivo-mestre histórico, não para carregamento direto | Alto: duplicação visual, peso e edição não identificada. |

Os quatro arquivos foram versionados no mesmo período, mas o Git não fornece por si só data, edição, autoria ou direito de publicação da cena. Como retratam um evento concluído antes de setembro de 2026, devem ser classificados provisoriamente como **legado até 2025** até confirmação de acervo. O repositório não contém diretório AgroSamas 2026, vídeo, mapa operacional, cartaz/programação, lista de expositores ou banner 2026 rastreado.

### 4.2 Logo fornecida com o briefing

| Origem | Formato e dimensões | Tamanho | Situação | Tratamento recomendado |
| --- | --- | ---: | --- | --- |
| `D:\PREFEITURA\AGROSAMAS\LOGO 5º AGROSAMAS.png` | PNG RGBA, 1287×1222, fundo transparente | 1.360.280 B | Fora do repositório; identidade visual da 5ª edição fornecida pelo solicitante | No AGRO-03, confirmar autoria/direito e versão oficial; preservar mestre; gerar WebP/AVIF e PNG reduzido; registrar crédito/proveniência e contraste mínimo. |

A logo tem alto potencial como assinatura da edição, mas não deve ser usada como fotografia de hero nem convertida em evidência de atrações. Ela **não foi copiada ou alterada** nesta auditoria.

### 4.3 Lacunas do acervo

- fotografia oficial horizontal 2026 com crédito e termo de uso;
- variações monocromática/negativa da marca e guia de área de proteção;
- imagem social 1200×630;
- mapa operacional acessível;
- cartaz/programação final e sua versão em HTML;
- fotos identificadas por edição, data, autoria e legenda;
- imagens oficiais de expositores/atrações 2026;
- arquivos leves e responsivos (`srcset`) derivados dos JPEGs mestres.

## 5. Auditoria do Mês Polonês

### 5.1 Arquitetura encontrada

| Dimensão | `/mes-polones` | `/mes-polones-2026` |
| --- | --- | --- |
| Função | Hub permanente, identitário e editorial | Arquivo/experiência da 32ª edição |
| Estrutura | Hero fotográfico, patrimônio vivo, capital polonesa, edição vigente, retrospectiva, galeria e arquivo | Hero de campanha, introdução, galeria extensa, programação, cartaz, Polskie Smaki, exposição, ações, social e créditos |
| Chrome | Nav, barra de acessibilidade, breadcrumb e footer compartilhados | Mesmo sistema compartilhado |
| SEO | Canonical, Open Graph/Twitter, `WebPage` e `BreadcrumbList` | Canonical, Open Graph/Twitter e dados da edição |
| Descoberta | Link permanente no menu “Sobre”, busca fixa e sitemap | Busca fixa, sitemap e links do hub |
| JS | Quase toda a experiência é editorial/estática | `js/mes-polones-2026.js`: status de itens por data, lightbox com foco/teclado e interações |
| Responsividade | Breakpoints próprios em 900/620 px, redução de movimento | Breakpoints em 820/560 px, redução de movimento e galeria adaptativa |
| Estado temporal | Hub já apresenta retrospectiva da edição concluída | Status por item (“realizado”, “hoje”, “próximo”, “programado”), sem estado global PRE/LIVE/POST |

A inspeção visual pública confirmou a força do hero fotográfico imersivo do hub e a preservação inequívoca do Portal. Na edição, o banner gráfico vermelho domina a primeira dobra; a galeria de 20 imagens vem antes da programação. A leitura fica rica, mas a tarefa “o que acontece, quando e onde” demora a aparecer.

Na Home, a integração do Mês Polonês é indireta: acesso pelo menu compartilhado e por notícia externa, sem um card próprio do hub. A descoberta forte vem do item permanente em “Sobre”, de duas entradas fixas na busca, das duas URLs no sitemap e dos links hub↔edição. Esse padrão é útil, mas o AgroSamas precisa de integração mais orientada ao período do evento, sem transformar a Home em uma segunda página da edição.

O conjunto `images/mes-polones-2026/` tem **33 arquivos e 16.242.250 bytes**: 26 WebP, quatro PNG, dois JPEG e um MP4. Há carregamento preguiçoso, dimensões explícitas e vídeo com `preload="none"`, mas o acervo inclui um MP4 de 2.048.471 B, um cartaz PNG de 1.978.263 B e diversas imagens entre aproximadamente 500 e 758 KB. É uma referência funcional, não um orçamento a repetir.

### 5.2 A. O que reutilizar

- separação permanente hub + edição anual;
- nav, acessibilidade, breadcrumb, footer e identidade global compartilhados;
- canonicals, metadados sociais, JSON-LD e presença explícita na busca/sitemap;
- estrutura editorial por blocos e arquivo de edições;
- HTML acessível como fonte primária da programação, com cartaz apenas complementar;
- imagens com dimensões declaradas, lazy loading abaixo da dobra e vídeo sem preload agressivo;
- lightbox acessível, foco contido, fechamento por `Escape` e retorno de foco;
- `prefers-reduced-motion` e estados de foco visíveis;
- edição ligando de volta ao hub e hub conduzindo à edição mais recente.

### 5.3 B. O que melhorar

- colocar status, data, CTAs e programação antes de galerias longas;
- oferecer barra de atalhos persistente no mobile e navegação por dia;
- implementar estado global PRE/LIVE/POST e fallbacks por disponibilidade de conteúdo;
- diferenciar claramente informação confirmada, “em breve” e registro histórico;
- fazer “planeje sua visita” atravessar hospedagem, gastronomia, mapa e rotas reais;
- reduzir peso inicial, limitar a seleção editorial e gerar variantes responsivas;
- exibir fonte/data de atualização para conteúdos operacionais;
- criar arquivo crescente de edições, não apenas um único card;
- tratar mapa e cartaz como complementos acessíveis, nunca como única fonte.

### 5.4 C. O que não repetir

- página longa orientada à narrativa antes das tarefas do visitante;
- galeria extensa antes da programação;
- hero baseado apenas em peça gráfica horizontal;
- duplicação integral de programação em HTML e PNG pesado acima da dobra;
- acervo de cerca de 16 MB por edição sem orçamento de carregamento;
- hardcode de conteúdo sem flags de prontidão e fonte editorial;
- lógica apenas por evento individual, sem estado global da edição;
- efeitos ou variações visuais que façam a página parecer outro site.

## 6. Conteúdo oficial disponível

### 6.1 Fontes auditadas

- [Site oficial do 5º AgroSamas](https://www.agrosamas.com.br/)
- [Mídia Kit Oficial 2026](https://www.agrosamas.com.br/midia-kit)
- [Prefeitura — chamamento para comercialização de chope, 22/07/2026](https://www.saomateusdosul.pr.gov.br/portal/noticias/0/3/3565/prefeitura-de-sao-mateus-do-sul-abre-inscricoes-para-chamamento-publico-para-comercializacao-de-chopp-no-5-agrosamas)
- [Prefeitura — Feira Gastronômica, 30/07/2026](https://www.saomateusdosul.pr.gov.br/portal/noticias/0/3/3241/inscricoes-para-a-feira-gastronomica-do-5-agrosamas-iniciam-no-dia-30-de-julho-de-2026/)
- [Prefeitura — Miss São Mateus do Sul 2026, 06/08/2026](https://www.saomateusdosul.pr.gov.br/portal/noticias/0/3/3591/inscricoes-abertas-para-o-miss-sao-mateus-do-sul-2026/)
- [Portal de Turismo — Home](https://turismo.saomateusdosul.pr.gov.br/)
- [Portal de Turismo — Eventos](https://turismo.saomateusdosul.pr.gov.br/eventos)

Consulta realizada em 09/09/2026. Fontes públicas podem mudar; a implementação deverá repetir a checagem antes de publicar conteúdo.

### 6.2 Matriz de verdade editorial

| Informação | Fonte | Status | Confiança | Ação necessária |
| --- | --- | --- | --- | --- |
| Nome “5º AgroSamas” | Site oficial e Prefeitura | CONFIRMADO | Alta | Usar como nome público; manter `V AgroSamas` apenas como alias de busca. |
| 18 a 21/09/2026, quatro dias | Site oficial; Prefeitura em 22/07 | CONFIRMADO | Alta | Fixar no contrato e corrigir superfícies divergentes no AGRO-02. |
| Rua do Mathe/entorno, São Mateus do Sul/PR | Site oficial | CONFIRMADO | Alta | Preservar vínculo canônico já existente no Portal. |
| Promoção da Prefeitura/Secretaria e integração ao 118º aniversário | Prefeitura em 22/07; Mídia Kit | CONFIRMADO | Alta | Informar organizador e contexto institucional com redação objetiva. |
| Música, gastronomia, agro, feira, família e atrações regionais/nacionais como eixos | Site oficial | CONFIRMADO | Alta para os eixos; não para nomes/horários | Usar como categorias de experiência, não como grade fechada. |
| Feira Gastronômica | Prefeitura em 30/07 | CONFIRMADO | Alta para realização/intenção | Não publicar participantes ou cardápios até lista oficial. |
| Miss São Mateus do Sul em 18/09 | Prefeitura em 06/08 | CONFIRMADO | Alta | Corrigir a ocorrência local atualmente em 19/09. Horário permanece a confirmar. |
| Programação completa por dia/horário/palco | Site oficial mostra “em breve” | AINDA NÃO DIVULGADO | Alta | Renderizar estado vazio útil e link oficial; não criar itens. |
| Nomes de shows e atrações 2026 | Site oficial mostra “em breve” | AINDA NÃO DIVULGADO | Alta | Não publicar nomes, horários ou imagens de artistas. |
| Lista de expositores 2026 | Site oficial informa que será divulgada e mostra edição anterior | AINDA NÃO DIVULGADO | Alta | Não transportar expositores anteriores. |
| Entrada gratuita em 2026 | Portal afirma; fontes 2026 auditadas não fecham política geral | DIVERGENTE | Média/alta | Exigir confirmação oficial explícita antes de usar “gratuito” ou `offers.price=0`. |
| 17–21 e cinco dias | Portal de Turismo | DIVERGENTE | Alta | Corrigir para 18–21 e quatro dias. |
| Miss em 19/09 | Calendário local | DIVERGENTE | Alta | Corrigir para 18/09. |
| Parque dos Dinossauros/parque de diversões | Portal atual; notícia oficial de 2025 | LEGADO 2025 | Alta quanto à origem histórica | Não associar à edição 2026 sem novo anúncio. |
| Aproximadamente 100 mil visitantes/edição, mais de 60 expositores e 10 milhões de visualizações | Mídia Kit 2026, como números promocionais/históricos | LEGADO 2025 | Média: declaração oficial, sem validação independente | Se usados, rotular “segundo o Mídia Kit” e “edições anteriores”; nunca como resultado 2026. |
| Mapa do evento, trânsito, estacionamento, acessibilidade, banheiros, primeiros socorros e política final de acesso | Não localizados nas fontes auditadas | AINDA NÃO DIVULGADO | Alta sobre a lacuna | Manter seções indisponíveis/ocultas com CTA oficial; publicar só após fonte operacional. |

## 7. Lacunas de conteúdo

### Bloqueiam uma programação operacional

- grade final com título, categoria, data, início, fim, palco/área e status de confirmação;
- horário oficial de abertura/encerramento de cada dia;
- mapa operacional e lista oficial de áreas;
- trânsito, interdições, estacionamento, embarque/desembarque e transporte;
- acessibilidade física e atendimento a pessoas com deficiência;
- política de entrada, controle de acesso e itens permitidos/proibidos;
- primeiros socorros, segurança, banheiros, fraldário, água e contatos durante o evento.

### Bloqueiam módulos editoriais específicos

- atrações e expositores 2026 identificados;
- fotos oficiais 2026, créditos e direitos;
- mapa e programação em formatos acessíveis;
- métricas pós-evento verificadas e com fonte;
- retrospectiva, galeria e notícias de encerramento;
- versão oficial da marca e regras de uso.

As seções sem dados não devem receber texto genérico que pareça confirmação. O contrato precisa distinguir `ready`, `coming_soon`, `not_applicable` e `archived` por bloco.

## 8. Arquitetura proposta para `/agrosamas`

### Função

Hub permanente e indexável, independente do calendário anual. Responde “o que é o AgroSamas, por que ele importa e qual edição devo abrir?” sem tentar substituir o site oficial.

### Ordem recomendada

1. **Breadcrumb e hero fotográfico:** marca AgroSamas, posicionamento curto e CTAs “Ver edição 2026” e “Site oficial”.
2. **Próxima/última edição:** card dinâmico apontando à edição vigente, com data/local confirmados e estado temporal.
3. **O encontro:** música, gastronomia, agro, empreendedorismo e família como eixos permanentes.
4. **AgroSamas e São Mateus do Sul:** relação com a economia, cultura, turismo e aniversário municipal, sem números não contextualizados.
5. **Planeje a viagem:** hospedagem, sabores, mapa, como chegar, atrativos e rotas, todos por links/deep links canônicos.
6. **Memória do evento:** arquivo de edições em ordem reversa; 2026 passa de edição vigente a retrospectiva sem trocar URL.
7. **Em imagens:** seleção pequena, legendada por edição e com crédito.
8. **Fontes e realização:** Prefeitura/Secretaria e link inequívoco para o site oficial.

### Regras do hub

- conteúdo evergreen separado do conteúdo anual;
- edição mais recente definida por configuração, não por texto espalhado;
- nenhum countdown permanente no hub;
- sem programação detalhada duplicada: apenas resumo e link para a edição;
- arquivo preparado para `/agrosamas-2027` sem reescrever a arquitetura.

## 9. Arquitetura proposta para `/agrosamas-2026`

### Primeira dobra

- breadcrumb e chrome do Portal;
- hero fotográfico com logo oficial em camada separada;
- selo de estado (`Faltam X dias`, `Acontece hoje` ou `Edição encerrada`);
- 18–21/09/2026, Rua do Mathe, São Mateus do Sul/PR;
- CTA primário dependente do estado e CTA permanente para o site oficial;
- barra de atalhos: `Programação`, `Como chegar`, `Informações úteis`, `Planeje sua visita`.

### Jornada da página

1. **Status e resumo factual.** O que é, quando, onde e última atualização.
2. **Programação por dia.** Quatro abas/botões de data, lista cronológica, filtros simples por tema/área e estado vazio explícito.
3. **AgroSamas Agora.** Somente durante o evento e somente se existirem início/fim confiáveis; caso contrário, “Programação de hoje” sem alegar atividade em andamento.
4. **Como chegar e mapa.** Rua do Mathe canônica, rota externa segura e deep link para o mapa turístico. Mapa operacional aparece apenas se publicado.
5. **Informações úteis.** Cards com disponibilidade individual; nada de preencher lacunas por inferência.
6. **Experiências do evento.** Mundo Agro, gastronomia, feira/expositores e família, exibidos apenas com conteúdo oficial suficiente.
7. **Aniversário do município.** Contexto do 118º aniversário e link para conteúdo institucional confirmado.
8. **Você vem para o AgroSamas?** Planejador turístico: onde ficar, onde comer, atrativos, erva-mate, cultura polonesa, Rio Iguaçu, rotas e mapa.
9. **Notícias.** Curadoria de links oficiais com data/fonte; sem fallback fabricado.
10. **Galeria/retrospectiva.** No PRE, imagens históricas explicitamente legendadas; no POST, registros 2026 com crédito.
11. **Realização e fonte oficial.** Separação clara entre Portal de Turismo e site oficial do evento.

### Contrato frontend proposto

Criar uma configuração de edição pequena e versionada, por exemplo `js/data/agrosamas-2026.js`, com:

- identidade: `editionId`, `seriesId`, `name`, `editionNumber`, `officialUrl`;
- período: `timezone`, `startAt`, `endAt`, `dates`;
- local: referência a `localId: "rua-do-mathe"`, sem recadastrar coordenadas;
- disponibilidade por seção: `status`, `sourceUrl`, `verifiedAt`;
- programação: itens com IDs estáveis, data, início/fim opcionais, área, título, categoria, status e fonte;
- links editoriais e assets com edição/crédito/alt;
- nenhuma string de UI fora do sistema central de `translations.js`.

`eventos-2026.json` permanece como fonte de ocorrências do calendário, ganha `seriesId: "agrosamas-2026"` e mantém apenas dados confirmados. Um teste de contrato deve provar que o período/local da configuração e as ocorrências não divergem. Não criar coleção Firestore específica no primeiro ciclo.

## 10. Direção visual

### Conceito

**“A cidade encontra o campo.”** Um microsite editorial de grande evento, com matéria, textura e energia, assentado sobre a identidade sóbria do Portal.

O visitante deve reconhecer o AgroSamas pela fotografia, logo, cor de acento e composição; reconhecer o Turismo pelo nav, tipografia-base, breadcrumbs, footer, padrões de foco e módulos de planejamento.

### Sistema visual recomendado

- **Base Portal:** verde floresta `#0A3D2E`, creme `#F8F6F0`, branco e tipografia institucional já existente;
- **paleta Agro provisória:** verde campo, verde profundo, creme palha, marrom-terra e amarelo-trator como acento; valores finais devem ser extraídos da marca oficial e testados por contraste;
- **hero:** fotografia horizontal forte, logo sobre área calma, gradiente controlado, números “18—21” grandes e legíveis;
- **composição:** alternância de blocos claros/escuros, linhas topográficas ou sulcos muito sutis, cartões com recortes amplos e sem excesso de bordas;
- **números:** usar para datas, dias e métricas devidamente contextualizadas; nunca transformar projeção histórica em resultado;
- **programação:** tipografia funcional, hora alinhada, dia muito evidente, densidade confortável e sem cards ornamentais demais;
- **microinterações:** mudança de estado, seleção de dia, expansão de detalhes e feedback de foco; duração curta e versão sem movimento;
- **fotografia:** pessoas, campo, gastronomia e cidade em cenas autênticas; não usar imagens históricas como se fossem 2026.

### Antiobjetivos

- não copiar a estética do site oficial;
- não transformar a página em colagem de logos, emojis ou cores saturadas;
- não esconder tarefas sob animações;
- não remover o nav institucional nem criar um segundo sistema de navegação global;
- não usar a logo grande como substituto de conteúdo ou fotografia.

## 11. Estados `PRE_EVENT`, `EVENT_LIVE` e `POST_EVENT`

### 11.1 Transições propostas

Enquanto horários oficiais de abertura/encerramento não forem publicados:

```text
PRE_EVENT   agora < 2026-09-18T00:00:00-03:00
EVENT_LIVE  2026-09-18T00:00:00-03:00 <= agora < 2026-09-22T00:00:00-03:00
POST_EVENT  agora >= 2026-09-22T00:00:00-03:00
```

Timezone obrigatório: `America/Sao_Paulo`. As fronteiras de meia-noite são provisórias e seguras para dias inteiros; quando horários oficiais forem confirmados, `startAt`/`endAt` devem ser atualizados na configuração, sem mudar o código.

### 11.2 Matriz de comportamento

| Elemento | PRE_EVENT | EVENT_LIVE | POST_EVENT |
| --- | --- | --- | --- |
| Hero | “5º AgroSamas · 18–21 set” + contagem regressiva | “AgroSamas acontece hoje” + dia atual | “A 5ª edição aconteceu” + retrospectiva |
| CTA primário | `Planejar minha visita` | `Ver programação de hoje` | `Ver retrospectiva` |
| CTA secundário | Site oficial | Como chegar/mapa + site oficial | Arquivo de notícias + site oficial |
| Programação | Dias e itens confirmados; senão “em breve” | Dia atual primeiro; nunca “agora” sem faixa horária | Registro integral, marcado como realizado |
| Informações úteis | Checklist de preparação | Atalhos operacionais prioritários | Ocultar alertas efêmeros; manter memória útil |
| Galeria | Acervo histórico explicitamente rotulado | Poucas imagens oficiais se autorizadas | Galeria 2026 creditada |
| Notícias | Anúncios oficiais | Comunicados operacionais | Resultado e retrospectiva |

### 11.3 Regras de segurança editorial

- função pura `resolveEventState(now, startAt, endAt)` e testes nos limites, sem depender da timezone do dispositivo;
- se data/configuração for inválida, estado `UNKNOWN`: esconder contador e afirmações de “ao vivo”, mostrar datas estáticas confirmadas e site oficial;
- contador visual atualizado no máximo por minuto; não anunciar cada mudança a leitor de tela;
- “AgroSamas Agora” só existe quando um item tem data, início e fim confirmados e o relógio está dentro da faixa;
- se houver apenas itens do dia, usar “Programação de hoje”; se não houver programação, mostrar mensagem útil e link oficial;
- conteúdo operacional precisa exibir `Atualizado em` e fonte;
- a virada POST deve ser automática, mas módulos pós-evento só aparecem como conteúdo publicado; enquanto vazios, usar “Registros em preparação”.

## 12. Integrações

| Área | Integração recomendada | Fonte canônica | Gate |
| --- | --- | --- | --- |
| Home — destaque | CTA principal para `/agrosamas-2026`; secundário “Site oficial” | Configuração da edição | Data/local/texto iguais ao contrato; quatro idiomas. |
| Home — próximos eventos | Agrupar/relacionar ocorrências por `seriesId`; detalhes levam à edição | `eventos-2026.json` + adaptador | Sem duplicação indevida e sem quebrar outras ocorrências. |
| Eventos | Card interno e ocorrências confirmadas | Mesmas fontes acima | Calendário, modal e filtros preservados. |
| Busca | Entradas fixas para hub e edição; resumo dinâmico aponta ao hub | `js/search-index.js` e `TURISMO_EVENTOS` | Buscar “Agro Samas”, “AgroSamas”, “5º” e “V” encontra a rota correta. |
| Sitemap | Incluir as duas URLs | `sitemap.xml` | Canonicals e URLs públicas retornam 200 antes de indexar. |
| Menu | “AgroSamas” dentro de Agenda | `js/nav-shared.js` + `translations.js` | Desktop/mobile/teclado e quatro idiomas. |
| Mapa turístico | Link para evento/Rua do Mathe e retorno à edição | `TURISMO_EVENTOS` + `localId` | Coordenadas e relação canônica preservadas. |
| Locais | CTA “Conheça a Rua do Mathe” | `/local?id=rua-do-mathe` | Não associar Parque/Arena sem confirmação. |
| Notícias | Curadoria de URLs oficiais; depois avaliar `relatedEventId` genérico | CMS `noticias` ou config editorial | Sem notícia fallback falsa e com estado vazio. |
| Hospedagem | Link contextual a `/onde-ficar` | Catálogo existente | Não copiar nomes, contatos ou disponibilidade. |
| Gastronomia | Link/deep link a `/sabores` e mapa | Dados públicos existentes | Sem confundir inscritos na feira com catálogo permanente. |
| Atrativos/erva-mate/cultura/Rio Iguaçu | Cards de descoberta com links canônicos | Mapa/pontos/rotas | Seleção editorial sem duplicar conteúdo factual. |
| Rotas | Deep links para rotas relevantes | Fonte canônica de rotas | Preservar filtros e rotas existentes. |
| Banners | Campanha via mecanismo público de banners, se autorizada | `cms_banners`/loader público atual | Bloco separado de conteúdo; não reativar `CONFIG.agrosamas`. |
| i18n | Acrescentar chaves ao `translations.js` | Sistema central existente | PT/EN/ES/PL completos; sem sistema paralelo. |

## 13. SEO

### `/agrosamas`

- `title`, description, canonical absoluto, Open Graph e Twitter próprios;
- `WebPage` e `BreadcrumbList` em JSON-LD;
- H1 único, texto evergreen e links internos para edição/planejamento;
- imagem social com proveniência confirmada;
- entrada no sitemap com atualização coerente quando o arquivo de edições mudar.

### `/agrosamas-2026`

- canonical absoluto, title/description com edição, datas, cidade e função turística;
- JSON-LD `Event` somente com campos confirmados: nome, `startDate`, `endDate`, modo presencial, local Rua do Mathe/São Mateus do Sul/PR, organizador, URL, imagem autorizada e `eventStatus: EventScheduled`;
- não declarar preço zero, disponibilidade, artistas, `subEvent`, capacidade ou horários enquanto não houver fonte;
- manter informação histórica após o evento; não inventar um status Schema.org “concluído” inexistente;
- atualizar `dateModified`/sitemap somente quando o conteúdo realmente mudar.

Como os idiomas são client-side e não têm URLs distintas, não criar `hreflang` artificial. Não usar `FAQPage` sem FAQ visível equivalente. O site oficial e o Portal devem se linkar conceitualmente sem canonicals cruzados: são experiências com funções distintas.

## 14. Acessibilidade

- reutilizar skip links, barra de acessibilidade, nav, breadcrumbs e footer do Portal;
- hierarquia de headings sem saltos; datas em `<time datetime>`;
- programação utilizável como lista antes de qualquer tabela/cartaz e compreensível sem cor;
- botões de dia com estado textual/`aria-pressed`; não usar semântica de tabs incompleta;
- área clicável mínima de 44×44 px e foco claramente visível;
- contraste WCAG AA para texto, marca sobre hero e todos os estados;
- contador com texto estático acessível; mudanças frequentes fora de `aria-live`;
- status realmente relevante em região `aria-live="polite"`, sem interromper leitura;
- modal/lightbox com nome acessível, contenção e retorno de foco, `Escape` e navegação por teclado;
- mapas acompanhados de endereço, instrução textual e link externo; nenhuma informação apenas em pin;
- alt descreve a função/cena e informa quando a imagem é de edição anterior; logo com nome da marca, decoração com `alt=""`;
- respeitar `prefers-reduced-motion`, zoom 200%, reflow a 320 CSS px e fonte ampliada;
- testar PT/EN/ES/PL e não deixar strings hardcoded em idioma diferente do selecionado.

## 15. Performance

### Estratégia

- hero em AVIF/WebP responsivo, `srcset`/`sizes`, dimensões explícitas e preload apenas do LCP; não usar `loading="lazy"` no hero;
- JPEGs de 3–4,8 MB ficam como mestres e nunca entram no carregamento público direto;
- galeria curta inicialmente, restante sob lazy loading; cartaz e vídeo abaixo da dobra;
- vídeo sem autoplay e com `preload="none"` ou `metadata` conforme necessidade;
- zero embeds de terceiros acima da dobra; links para o site oficial em vez de widget pesado;
- JS da edição pequeno, sem framework/dependência nova, com listeners delegados e estado puro;
- CSS próprio da marca sem duplicar toda a folha global;
- fontes já utilizadas pelo Portal, evitando novas famílias/pesos;
- cache-bust versionado conforme padrão do projeto e teste de assets 404.

### Orçamento proposto para o gate

- imagem LCP idealmente até 250 KB e total de imagens iniciais até 500 KB em mobile;
- CLS ≤ 0,10, INP ≤ 200 ms e LCP ≤ 2,5 s no perfil mobile de QA;
- Lighthouse mobile ≥ 90 em Performance, Acessibilidade e SEO, registrado como evidência, não como substituto de teste real;
- nenhuma imagem original acima de 1 MB solicitada no carregamento inicial;
- nenhuma regressão de console, rota ou asset em desktop e 390×844.

## 16. Plano de execução por milestones

### AGRO-02 — Arquitetura, contrato e verdade editorial

- **Objetivo:** congelar modelo de dados, rotas, estados, fontes e baseline 2026; corrigir divergências factuais autorizadas.
- **Arquivos/áreas prováveis:** `js/data/agrosamas-2026.js` (novo), `eventos-2026.json`, `js/data/eventos.js`, `index.html`, `eventos.html`, `js/chatbot.js`, `js/cms.js`, `translations.js`, testes AgroSamas.
- **Dependências:** aprovação do contrato; rechecagem oficial; decisão editorial sobre entrada/horários; nenhuma dependência npm nova.
- **Resultado verificável:** uma fonte de edição com readiness/fonte/data; cinco ocorrências associadas por `seriesId`; zero cópia pública 17–21/cinco dias/Miss 19; nenhum fato não confirmado.
- **Riscos:** corrigir histórico em vez de runtime; quebrar calendário multilíngue; transformar conteúdo provisório em verdade.
- **Gate:** testes de contrato e ocorrência passam; busca rastreada não encontra divergências nas superfícies runtime; diff integral aprovado. **Não iniciar AGRO-03 automaticamente.**

### AGRO-03 — Foundation visual e pipeline de assets

- **Objetivo:** definir tokens Agro, componentes-base e acervo aprovado sem montar a página inteira.
- **Arquivos/áreas prováveis:** `css/agrosamas.css`, diretório `images/agrosamas/2026/`, manifesto/créditos de mídia, testes de assets.
- **Dependências:** confirmação de uso da logo e fotos; originais oficiais; paleta derivada da marca; orçamento de performance.
- **Resultado verificável:** hero/componentes em fixture, variantes responsivas, derivados otimizados e proveniência registrada.
- **Riscos:** identidade competir com o Portal; contraste insuficiente; asset histórico parecer 2026.
- **Gate:** revisão visual humana desktop/mobile, contraste AA, assets dentro do orçamento e geráveis/reproduzíveis. **Não iniciar AGRO-04 automaticamente.**

### AGRO-04 — Página `/agrosamas-2026`

- **Objetivo:** implementar a edição com PRE_EVENT e estados vazios seguros.
- **Arquivos/áreas prováveis:** `agrosamas-2026.html`, `css/agrosamas-2026.css`, `js/agrosamas-2026.js`, configuração e traduções.
- **Dependências:** AGRO-02/03 aprovados; conteúdo mínimo oficial.
- **Resultado verificável:** rota funcional, hero, atalhos, programação/readiness, informações práticas e planejamento turístico em quatro idiomas.
- **Riscos:** página longa, programação inacessível, claims não confirmados e relógio local incorreto.
- **Gate:** testes de estado/DOM, teclado, 320–1440 px, JS/console/links/assets e revisão editorial. **Não iniciar AGRO-05 automaticamente.**

### AGRO-05 — Hub permanente `/agrosamas`

- **Objetivo:** criar a camada evergreen e o arquivo de edições.
- **Arquivos/áreas prováveis:** `agrosamas.html`, `css/agrosamas.css`, configuração de edições, traduções.
- **Dependências:** linguagem visual aprovada e edição 2026 navegável.
- **Resultado verificável:** hub independente do ano, com edição vigente/arquivo, narrativa e CTA turístico.
- **Riscos:** duplicação com a edição e texto institucional não verificável.
- **Gate:** navegação hub↔edição, canonical/JSON-LD, arquivo extensível por configuração e revisão de conteúdo. **Não iniciar AGRO-06 automaticamente.**

### AGRO-06 — Integração turística

- **Objetivo:** conectar a jornada “venho ao evento” às fontes do Portal.
- **Arquivos/áreas prováveis:** módulos das duas páginas e links/deep links para mapa, local, hospedagem, sabores, pontos e rotas.
- **Dependências:** contratos públicos atuais e seleção editorial aprovada.
- **Resultado verificável:** visitante alcança Rua do Mathe, mapa, onde ficar, onde comer e roteiros sem dados copiados.
- **Riscos:** deep links frágeis e associações não comprovadas (Arena/Parque).
- **Gate:** testes de destinos, retorno de navegação e preservação dos contratos canônicos. **Não iniciar AGRO-07 automaticamente.**

### AGRO-07 — Estados temporais

- **Objetivo:** ativar PRE/LIVE/POST automático e conteúdo “Agora” condicional.
- **Arquivos/áreas prováveis:** `js/agrosamas-2026.js`, configuração, testes temporais/fixtures.
- **Dependências:** horários oficiais para precisão intradiária; readiness da programação.
- **Resultado verificável:** fronteiras determinísticas em `America/Sao_Paulo`, fallback `UNKNOWN` e viradas testadas.
- **Riscos:** relógio do cliente, horário oficial alterado, live falso e pós-evento vazio.
- **Gate:** matriz de testes antes/no limite/depois, sem claim live sem faixa válida e revisão dos três estados. **Não iniciar AGRO-08 automaticamente.**

### AGRO-08 — Integrações globais

- **Objetivo:** tornar as rotas descobríveis em Home, Eventos, busca, menu, sitemap e SEO.
- **Arquivos/áreas prováveis:** `index.html`, `eventos.html`, `js/search-index.js`, `js/nav-shared.js`, `sitemap.xml`, `translations.js`, metadados das páginas.
- **Dependências:** rotas aprovadas e estáveis.
- **Resultado verificável:** links internos corretos, busca por aliases, sitemap, canonicals e JSON-LD válidos.
- **Riscos:** cache/versionamento, menu mobile, duplicação de resultados e regressão SEO.
- **Gate:** testes de rotas/busca, validação de structured data, links, idiomas e sitemap. **Não iniciar AGRO-09 automaticamente.**

### AGRO-09 — QA integral

- **Objetivo:** provar conteúdo, interação, acessibilidade, responsividade e performance.
- **Arquivos/áreas prováveis:** testes e evidências de QA; correções somente dentro de bloco autorizado.
- **Dependências:** AGRO-02 a 08 integrados; assets finais.
- **Resultado verificável:** suíte relevante limpa, comparação visual, console sem erros, navegação real e budgets atendidos.
- **Riscos:** confundir servidor local com produção; aprovar apenas por screenshot; teste de data dependente do dia real.
- **Gate:** desktop/mobile, teclado, reduced motion, quatro idiomas, estados temporais congelados, links/assets, SEO e performance aprovados. **Não iniciar AGRO-10 automaticamente.**

### AGRO-10 — Freeze e release

- **Objetivo:** congelar candidato aprovado e, somente com autorização separada, publicar.
- **Arquivos/áreas prováveis:** conjunto explicitamente auditado do milestone; configuração de cache/release se necessária.
- **Dependências:** QA integral, aprovação humana visual/editorial e autorização explícita para commit/push/deploy.
- **Resultado verificável:** SHA/blob/árvore coerentes; release remoto correspondente; smoke público nas duas rotas e integrações.
- **Riscos:** publicar conteúdo ainda “em breve”, cache antigo, produção divergente e ação remota não autorizada.
- **Gate:** sequência limpa completa, staging por paths nomeados, aprovação humana e prova do artefato publicado. Rollback documentado. Nenhuma ação remota faz parte do AGRO-01.

## 17. Riscos

| Risco | Probabilidade/impacto | Mitigação |
| --- | --- | --- |
| Programação oficial chegar perto do evento | Alta/alta | Contrato com readiness, fonte e atualização pontual; página útil mesmo sem grade. |
| Conteúdo 2025 ser apresentado como 2026 | Alta/alta | Metadados de edição/crédito e revisão factual obrigatória por asset/bloco. |
| Divergências entre configuração, calendário, Home e traduções | Alta/alta | `seriesId`, fonte de edição e teste cross-source/i18n. |
| “Agora” mostrar informação falsa | Média/alta | Exigir início/fim/fonte; fallback para “programação de hoje”. |
| Informações operacionais mudarem durante o evento | Alta/alta | `verifiedAt`, fonte oficial, cards independentes e CTA permanente ao site oficial. |
| Página excessivamente pesada | Média/alta | Budgets, derivados, seleção editorial curta e gate mobile. |
| Microsite romper identidade do Portal | Média/média | Chrome compartilhado, tokens-base, revisão humana e nenhum nav global paralelo. |
| Backend/Admin ser expandido sem necessidade | Baixa/alta | Começar frontend versionado; reavaliar CMS somente após demanda recorrente comprovada. |
| SEO publicar claims não confirmados | Média/alta | JSON-LD mínimo, sem `offers`, artistas ou horários não oficiais. |
| Limpeza de CSS/config legado contaminar o escopo | Média/média | Tratar dívida órfã em tarefa independente; não aproveitar o hub como pretexto. |
| Estado baseado no relógio do dispositivo | Média/média | ISO com offset, timezone explícita, fallback `UNKNOWN` e conteúdo factual sempre visível. |
| Direitos/proveniência de imagem insuficientes | Média/alta | Manifesto de mídia e aprovação antes de promover qualquer asset. |

## 18. Recomendação de próximo passo

Executar **AGRO-02 — Arquitetura, contrato e verdade editorial** como bloco fechado e revisável.

Antes de qualquer foundation visual, o AGRO-02 deve:

1. revalidar as fontes oficiais no dia da execução;
2. congelar a configuração da edição e o vocabulário de readiness;
3. introduzir `seriesId` e testes de consistência;
4. corrigir somente as divergências runtime autorizadas (18–21, quatro dias, Miss em 18/09 e remoção de claims não comprovados);
5. definir os fallbacks “em breve” e `UNKNOWN`;
6. apresentar diff e resultado factual para aprovação humana.

Depois do gate do AGRO-02, parar. A logo e o acervo visual entram apenas no AGRO-03, após confirmação de proveniência/direitos. A construção das páginas começa no AGRO-04 e não deve ser antecipada.

---

### Verificações realizadas no AGRO-01

- `node scripts/check-agent-harness.mjs --check` — PASS;
- `node --test --test-concurrency=1 tests/agrosamas-location-data.test.mjs` — 11/11 PASS;
- `node --check` em `js/mes-polones-2026.js`, `js/search-index.js`, `js/data/eventos.js`, `js/event-occurrence-adapter.js` e `js/home-eventos.js` — 5/5 PASS;
- parse de `eventos-2026.json` — válido; cinco ocorrências AgroSamas em quatro datas (18, 19, 20 e 21/09);
- auditoria visual pública de `/mes-polones` e `/mes-polones-2026` em desktop;
- pesquisa pública oficial em 09/09/2026;
- nenhuma suíte de Rules/Emulators executada: não houve mudança de Rules/contrato e o bloco proíbe qualquer escrita;
- nenhum Firestore write, alteração de Admin, commit, push, deploy, preview ou mutação de produção.
