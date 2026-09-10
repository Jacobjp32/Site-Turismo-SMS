# AGRO-03 — Relatório da foundation visual do AgroSamas 2026

**Classificação:** `AGRO-03 VISUAL FOUNDATION COMPLETE`

**Rota física:** `/agrosamas-2026` (`agrosamas-2026.html`)

**Escopo desta entrega:** microsite da edição 2026, comportamento temporal, programação preparada para evolução, conexão com o destino e QA local. A entrega não ativa a rota permanente `/agrosamas`, não integra menu, busca, sitemap ou Home e não altera Firestore/Admin.

## 1. Direção visual

A direção adotada é **território em movimento**: uma composição editorial inspirada em terra, colheita, produção e encontro, com base mineral, palha, carvão e ferrugem. O verde profundo aparece de forma controlada para manter o vínculo com o Portal de Turismo.

A página não usa estética country/rodeio, neon ou linguagem de produto SaaS. O ritmo visual é construído por tipografia de alto impacto, data tratada como elemento gráfico, recortes fotográficos, blocos assimétricos e alternância de densidade entre narrativa, utilidade e destino.

Não foi criada nem simulada uma logo oficial do AgroSamas. A futura marca oficial possui espaço de integração, mas depende de proveniência e direitos aprovados.

## 2. Arquitetura e contrato

- `AgroSamasContract` é carregado antes do controlador da página.
- Nome, edição, datas, duração, local, URL oficial, estado temporal e disponibilidade da programação são obtidos do contrato AGRO-02.
- As fronteiras PRE/LIVE/POST são resolvidas por `resolveTemporalState`; não existe flag manual.
- O countdown usa o instante de início fornecido pelo contrato, atualiza uma vez por minuto e é removido fora de PRE.
- A programação falha fechada: conteúdo ausente ou inválido não promove dados legados nem produz cards vazios.
- Metadados estáticos de descoberta e o JSON-LD dinâmico descrevem a edição sem criar uma segunda fonte editorial para datas e local no corpo da página.

## 3. Componentes implementados

1. **Hero editorial:** edição, data, localização, estado temporal, CTA primário contextual e CTA de planejamento.
2. **Countdown:** dias, horas e minutos, com região acessível e atualização não agressiva.
3. **Navegação local:** seis atalhos, estado ativo por seção e comportamento fixo abaixo da navegação global, inclusive no mobile.
4. **Abertura editorial:** posicionamento curto do evento sem métricas ou atrações não confirmadas.
5. **Programação:** seletor dos quatro dias, estado indisponível finalizado e renderer preparado para dados parciais/completos.
6. **Universo AgroSamas:** composição editorial para campo, sabores, negócios, música, família e São Mateus do Sul.
7. **Planeje sua visita:** acesso às rotas existentes de hospedagem, gastronomia, mapa, atrações, roteiros, cultura, erva-mate e Rio Iguaçu, sem duplicar cadastros.
8. **Como chegar:** Rua do Mathe e entorno, cidade/UF e link para o local canônico já existente.
9. **Informações úteis:** somente data, duração e local confirmados.
10. **Site oficial e fechamento:** CTA contextual para `agrosamas.com.br` e continuidade da visita no destino.
11. **SEO:** title, description, canonical, OG, Twitter, headings e schema de evento seguro.

## 4. Estados temporais validados

| Estado | Hero e CTA | Countdown | Programação |
| --- | --- | --- | --- |
| `PRE_EVENT` | “Vem aí o 5º AgroSamas”; CTA para programação/fallback | Visível | Quatro dias confirmados e fallback intencional quando indisponível |
| `EVENT_LIVE` | “AgroSamas está acontecendo”; CTA “AgroSamas Agora” | Removido | Seleciona o dia corrente quando houver itens; preserva fallback sem invenção |
| `POST_EVENT` | Mensagem de arquivo/retrospectiva; CTA para explorar o destino | Removido | Mantém a edição consultável e preparada para futura retrospectiva |

Os três estados foram exercitados em um harness local que deriva os instantes de teste do próprio contrato. O harness não contém datas literais da edição, flags manuais nem persistência em `localStorage`.

## 5. Programação

O componente aceita `UNAVAILABLE`, `PARTIAL` e `COMPLETE`:

- `UNAVAILABLE`: exibe mensagem editorial completa e os dias 18, 19, 20 e 21 derivados do intervalo canônico; não cria atrações.
- `PARTIAL`: permite filtrar por dia e renderiza horário, atração, categoria, local/palco opcional e destaque.
- `COMPLETE`: usa a mesma estrutura navegável por dia, sem troca de componente ou de contrato.
- Durante `EVENT_LIVE`, o dia do evento é selecionado automaticamente quando está presente no conjunto disponível.
- Dados ausentes, fora da edição ou com formato inesperado mantêm o fallback seguro.

## 6. Responsividade e QA visual

QA executado em navegador real com servidor HTTP local e inspeção visual por screenshots.

| Viewport | Evidência principal | Resultado |
| --- | --- | --- |
| 390 × 844 | hero, data, countdown PRE, título da programação, navegação local fixa | aprovado; título dentro do viewport e sem overflow horizontal |
| 430 × 932 | hero, CTAs, seção de programação e harness PRE/LIVE/POST | aprovado; hierarquia e alvos de toque preservados |
| 768 × 1024 | composição intermediária, cards e navegação | aprovado; sem overflow horizontal |
| 1280 × 900 | hero, planejamento, chegada e contraste | aprovado; imagens carregadas e sem overflow horizontal |
| 1440 × 900 | composição desktop ampla e ritmo editorial | aprovado; hero e grids estáveis |

Medições observadas em cada viewport confirmaram `scrollWidth === clientWidth`. O hero permaneceu legível em todos os tamanhos, inclusive 390 px. A navegação local manteve posição abaixo das barras globais e o estado ativo acompanhou a seção corrente. Não houve mudança de layout evidente durante a inspeção; esta evidência é visual e não substitui uma medição de Core Web Vitals em produção.

## 7. Acessibilidade

- landmarks e hierarquia de headings preservados;
- link de salto global é o primeiro foco por `Tab` e aparece com contorno visível;
- navegação local, tabs de programação e CTAs são operáveis por teclado;
- tabs possuem papéis, seleção e relacionamento de painel explícitos;
- countdown usa descrição acessível e não anuncia a cada segundo;
- conteúdo da programação não depende apenas de cor;
- foco visível dedicado para links e botões;
- `prefers-reduced-motion` remove reveal, transformações, animação LIVE e smooth scroll;
- alto contraste global foi alternado e conferido com paleta preto/amarelo; o modo padrão foi restaurado;
- controle A+ foi exercitado: fonte do corpo passou de 16 px para 19,2 px sem overflow horizontal; depois foi restaurada;
- a navegação local usa uma camada inferior às barras globais, evitando conflito de stacking.

## 8. Performance e assets

- nenhum framework, biblioteca, fonte externa ou nova dependência foi adicionado;
- JavaScript em arquivo dedicado, sem animação por frame e com timer de um minuto apenas no PRE;
- imagens de fundo usam arquivos locais já rastreados; a imagem de chegada tem dimensões declaradas, `loading="lazy"` e `decoding="async"`;
- hero pré-carrega somente sua imagem crítica;
- efeitos visuais são CSS e respeitam reduced motion;
- o servidor local respondeu com HTTP 200/304 para documento, CSS, JavaScript e imagens usados; não houve 404 na sessão de QA;
- console final após navegação e controles de acessibilidade: zero erros e zero avisos.

Assets usados:

- `images/RUA_DO_MATHE.jpg`;
- `images/WEBP/RUA-DO-MATHE-_1_.webp`;
- `images/WEBP/RUA-DO-MATHE-_2_.webp`;
- `images/rotas/rota-sabores-memorias.webp`;
- `images/praca_rio_iguacu.jpg`;
- `images/PONTE_SOB_O_RIO_IGUACU.jpg`;
- identidade global já existente do Portal de Turismo.

Assets deliberadamente não usados:

- logo externa ainda sem aprovação de proveniência/direitos;
- fotografias do AgroSamas 2025 como se fossem registro da edição 2026;
- downloads externos, vídeos autoplay e fontes adicionais.

## 9. Validação automatizada

| Comando | Resultado |
| --- | --- |
| `node --check js/agrosamas-2026.js` | PASS |
| `node --test --test-concurrency=1 tests/agrosamas-visual-foundation.test.mjs` | PASS — 9/9 |
| `npm.cmd run test:agrosamas` | PASS — 99/99 |
| `npm.cmd run test:rotas:public` | PASS — 16/16 |
| `npm.cmd run test:admin-finalization` | PASS — 15/15 |
| `node scripts/check-agent-harness.mjs --check` | PASS |
| `git diff --check` no arquivo rastreado e `git diff --no-index --check` nos novos arquivos | PASS; somente aviso informativo de conversão LF/CRLF em `package.json` |

A suíte AGRO cobre o contrato AGRO-02, adapter compartilhado, Home/Eventos e as novas invariantes visuais/temporais. A suíte de Rotas cobre o consumo público usado pelo Mapa; a suíte de finalização cobre a estrutura do Admin e os contratos públicos de Galeria/configuração. Nenhum teste de Rules foi executado porque este bloco não altera Firestore, Storage Rules ou o contrato Admin/CMS.

## 10. Pendências e recomendação para AGRO-04

Pendências reais, sem bloquear o AGRO-03:

- obter e aprovar proveniência/direitos da identidade oficial antes de incorporá-la;
- publicar dados oficiais de programação pelo contrato quando estiverem confirmados;
- adicionar informações operacionais como estacionamento, bloqueios, acessos e horários somente após fonte oficial;
- decidir a retrospectiva POST (fotografias, notícias e resultados) com assets e conteúdo aprovados;
- executar a integração global de descoberta — menu, busca, sitemap e Home — em bloco separado;
- validar Core Web Vitals e comportamento público somente quando houver autorização de preview/deploy.

Recomendação: o AGRO-04 deve tratar **conteúdo oficial + integração de descoberta**, preservando esta rota como consumidora do contrato e mantendo separados os gates de assets, programação, integração global e publicação.

## 11. Limites respeitados

- sem commit, push, deploy ou preview externo;
- sem escrita em Firestore;
- sem alteração de Admin;
- sem implementação da rota permanente `/agrosamas`;
- sem integração global em menu, busca, sitemap ou Home;
- sem uso de credenciais, secrets ou material externo não aprovado.

## 12. Adendo AGRO-05 — decisão superveniente de 10/09/2026

Este adendo preserva o relato histórico do AGRO-03 e substitui apenas as
decisões editoriais que mudaram depois dele:

- a logo oficial foi identificada no material fornecido pelo usuário, aprovada
  como `USER_PROVIDED_APPROVED` e integrada sem alteração do binário;
- `Roupa Nova`, em 20 de setembro de 2026, passou a ser o primeiro item
  `CONFIRMED`; horário e palco continuam omitidos;
- a programação passou de `UNAVAILABLE` para `PARTIAL`;
- demais atrações, expositores e informações operacionais passam a
  `NOT_YET_ANNOUNCED`;
- a ausência desses dados é uma condição editorial normal de atualização futura
  e não bloqueia publicação.

A foundation “território em movimento” permanece válida. A marca foi acomodada
por escala, respiro e responsividade, e o destaque de Roupa Nova usa somente
tipografia e composição abstrata da própria página, sem mídia externa da banda.
