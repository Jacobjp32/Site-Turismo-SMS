# HEADER-02 — Global Header Structural Hardening

Data da validação local: 10/09/2026  
Baseline confirmada antes da implementação: `4254b5a34e9397821df34cce720ffc100448cceb`  
Branch: `main`  
Escopo: implementação local e QA, sem commit, push, deploy ou acesso ao Firebase.

## Resultado

`classification=HEADER-02 STRUCTURAL HARDENING READY FOR HUMAN REVIEW`

Essa classificação registra que os gates locais deste bloco passaram. Ela não
autoriza commit, publicação ou qualquer mutação em produção.

## Preflight

Antes da edição foi confirmado:

- `HEAD = origin/main = 4254b5a34e9397821df34cce720ffc100448cceb`;
- branch `main`;
- índice vazio;
- zero alteração rastreada residual;
- untracked preexistentes preservados sem limpeza, stage ou alteração.

## Arquitetura anterior

O header compartilhado era injetado por `js/nav-shared.js` sem um wrapper único.
Sua geometria funcional dependia de números fixos distribuídos entre regras:

| Superfície | Contrato anterior |
| --- | --- |
| Desktop | `.nav top: 52px`; `body padding-top: 180px` |
| Mobile até 768 px | `.nav top: 34px`; shortcuts e drawer em `120px`; `body padding-top: 164px` |
| Mobile até 420 px | `.nav top: 33px`; shortcuts e drawer em `115px`; `body padding-top: 159px` |
| AgroSamas desktop | local nav em `180px`; scroll padding em `246px` |
| AgroSamas mobile | local nav em `164px`; scroll padding em `226px` |

Esses valores não acompanhavam automaticamente wrap, fonte, contraste ou
mudanças reais de altura. Em 1024 x 768, por exemplo, o header medido chegava a
aproximadamente `189,05px`, enquanto a navegação local AgroSamas ainda assumia
`180px`.

O breadcrumb buscava o primeiro `nav`, `header` ou `.header` no `body`. Como o
header compartilhado contém múltiplos elementos `nav`, esse seletor não definia
inequivocamente o limite do bloco global.

## Nova arquitetura

### Fonte única da geometria vertical

O conteúdo completo do header compartilhado passou a ficar em
`#sms-global-header`. Após injetar o CSS e o HTML, o runtime mede:

- barra de progresso;
- barra de acessibilidade;
- navegação principal;
- shortcuts mobile, quando visíveis.

As medidas reais são publicadas em propriedades CSS:

- `--sms-progress-height`;
- `--sms-accessibility-height`;
- `--sms-main-nav-height`;
- `--sms-mobile-shortcuts-height`.

Delas derivam `--sms-main-nav-top`, `--sms-mobile-shortcuts-top` e
`--sms-header-offset`. Navegação principal, shortcuts, drawer, `body` e
`scroll-padding-top` consomem esse mesmo contrato. A Home conserva o tratamento
full-bleed no desktop; sua geometria interna continua derivada das variáveis.

Os números CSS remanescentes nas declarações de `:root` e media queries são
somente fallbacks de pré-paint. As propriedades inline medidas no runtime os
substituem e são a fonte de verdade após a injeção.

### Startup e recálculo

A ordem agora é:

1. injetar `NAV_CSS`;
2. injetar o wrapper e `NAV_HTML`;
3. medir sincronicamente no mesmo task;
4. só então registrar observadores e eventos diferidos.

Assim, o primeiro paint após a injeção já recebe o offset real, sem aguardar um
frame do `ResizeObserver`. Alterações posteriores são agrupadas em um único
`requestAnimationFrame`.

Um `ResizeObserver` observa os quatro componentes geométricos. Também há
revalidação após `document.fonts.ready`, `load`, ações A-/A/A+ e contraste. O
listener de `resize` fica restrito ao fallback para navegadores sem
`ResizeObserver`; não há polling.

### Contrato do breadcrumb

`js/breadcrumbs.js` agora:

- usa `#sms-global-header` como limite explícito do header compartilhado;
- insere o breadcrumb imediatamente depois de todo esse wrapper;
- mantém `#main-content` somente como âncora inequívoca para páginas legadas;
- falha fechado se nenhuma dessas âncoras existir;
- não usa seletor genérico e não adiciona breadcrumb às páginas que não o
  carregavam.

O gate automatizado percorre as 17 páginas HTML rastreadas que carregam
`js/breadcrumbs.js`, valida uma âncora inequívoca e preserva explicitamente as
páginas sem breadcrumb.

### Composição AgroSamas

A navegação local não replica mais o breakpoint global em JavaScript. Ela lê o
`padding-top` efetivamente resolvido do `body`, usa `--sms-header-offset` no CSS,
mede a própria altura em `--agro-local-nav-height` e soma os dois valores no
`scroll-padding-top`. Um `ResizeObserver` local mantém essa segunda parcela
sincronizada.

Nenhum conteúdo, local, identidade, programação ou estado editorial AgroSamas
foi alterado.

## Arquivos alterados

- `js/nav-shared.js`: wrapper, contrato de medição e consumo das variáveis;
- `js/breadcrumbs.js`: âncora estrutural explícita e falha fechada;
- `css/agrosamas-2026.css`: composição dos offsets global e local;
- `js/agrosamas-2026.js`: leitura do offset resolvido e medição da nav local;
- `tests/header-structural-hardening.test.mjs`: sete gates de regressão;
- `package.json`: comando `test:header-structural`;
- `HEADER-02-STRUCTURAL-HARDENING-REPORT.md`: este relatório.

## QA em Chrome real

Foi usado Chrome do sistema `152.0.7977.83`, zoom 100% e DPR 1 nas capturas.
As validações ocorreram contra servidor local com conexões externas bloqueadas,
sem Firebase e sem mutação remota.

### Viewports

`390x844`, `430x932`, `768x1024`, `1024x768`, `1238x867`, `1280x900`,
`1440x900` e `1920x1080`.

### Páginas e padrões

| Grupo | Rotas/páginas | Resultado |
| --- | --- | --- |
| Matriz principal | `/`, `/local?id=rua-do-mathe`, `/eventos`, `/galeria`, `/sabores`, `/onde-ficar`, `/o-que-fazer`, `/noticias`, `/noticia` com slug local válido, `/rotas-completas`, `/portal-usuario`, `/transparencia`, `/agrosamas`, `/agrosamas-2026`, `/mes-polones`, `/mes-polones-2026`, `/privacidade`, `/mapa-3d` | `144/144 PASS` |
| Breadcrumbs ativos adicionais | `/para-o-trade`, `/reservas`, `/roteiro-ia` | `24/24 PASS` |
| Ponte legada | `/mapa-completo` | oito redirecionamentos esperados para `/mapa-turistico?grupo=roteiros`; não há breadcrumb persistente para medir |

Total de páginas ativas com contrato geométrico medido: `168/168 PASS`. Em cada
caso foram verificados ordem DOM, unicidade do wrapper/breadcrumb, continuidade
vertical, ausência de overlap, offset do primeiro conteúdo e geometria medida
marcada como ativa.

As páginas Home, Mapa Turístico, Mês Polonês, Mês Polonês 2026, AgroSamas e
AgroSamas 2026 permaneceram sem breadcrumb.

## Medidas representativas depois da alteração

Valores em pixels, com tolerância subpixel nas asserções:

| Página / viewport | Accessibility `top / height / bottom` | Main nav `top / height / bottom` | Shortcuts `top / height / bottom` | Próxima superfície |
| --- | --- | --- | --- | --- |
| Home `1440x900` | `4 / 48,19 / 52,19` | `52,19 / 128 / 180,19` | oculto | hero full-bleed preservado |
| Home `390x844` | `4 / 35,47 / 39,47` | `39,47 / 82 / 121,47` | `121,47 / 49,22 / 170,69` | conteúdo inicia sem overlap |
| Local `1280x900` | `4 / 48,19 / 52,19` | `52,19 / 128 / 180,19` | oculto | breadcrumb `top 180,19`, `height 35,19` |
| Local `390x844` | `4 / 35,47 / 39,47` | `39,47 / 82 / 121,47` | `121,47 / 49,22 / 170,69` | breadcrumb `top 170,69`, `height 32` |
| Eventos `1280x900` | `4 / 48,19 / 52,19` | `52,19 / 128 / 180,19` | oculto | breadcrumb `top 180,19`, `height 41,19` |
| Eventos `390x844` | `4 / 35,47 / 39,47` | `39,47 / 82 / 121,47` | `121,47 / 49,22 / 170,69` | breadcrumb `top 170,69`, `height 38` |
| AgroSamas 2026 `1280x900` | `4 / 48,19 / 52,19` | `52,19 / 128 / 180,19` | oculto | nav local `top 180,19`, `height 60,19` |

O valor anterior de `159px` no mobile pequeno foi substituído, no cenário
medido de 390 px, por `170,69px`: a mudança corresponde à soma real das barras,
não a um novo número mágico. Da mesma forma, a posição desktop nominal de
`180px` passou a acompanhar valores subpixel como `180,19px` e `189,05px`.

## Acessibilidade e interações

Em `390x844`, `768x1024` e `1280x900`, a sequência A, A-, restauração, A+,
A+ com alto contraste, restauração do contraste e reset total passou em
`21/21` estados. O `body padding-top` acompanhou o `headerVisualBottom` em todos
eles:

| Viewport | Normal / A+ | A+ com contraste |
| --- | --- | --- |
| `390x844` | `170,90 / 170,90` | `171,35 / 171,35` |
| `768x1024` | `230,21 / 230,21` | `231,32 / 231,32` |
| `1280x900` | `180,24 / 180,24` | `181,35 / 181,35` |

Também foram confirmados:

- dropdown desktop aberto por Enter, fechado por Escape após a transição,
  `aria-expanded=false` e foco devolvido ao botão;
- busca aberta com foco em `#search` e fechada corretamente;
- idioma alterado para EN e restaurado para PT;
- exatamente um badge sazonal de clima;
- drawer mobile com overlay, lock do `body`, cinco shortcuts e topo dinâmico;
- Escape fecha o drawer e devolve foco a `#navToggle`;
- barra de progresso e shortcuts sem sobreposição com as demais barras.

## Regressão AgroSamas

`/agrosamas` e `/agrosamas-2026` foram incluídas na matriz completa. O clique em
`#programacao` foi repetido em `390x844`, `768x1024`, `1024x768` e `1280x900`:

- `4/4 PASS`;
- `clickedItem === activeItem === #programacao`;
- `localNav.top === headerVisualBottom` com tolerância subpixel;
- alvo abaixo das barras dentro da tolerância existente de 8 px;
- hero, logo e countdown presentes;
- estado temporal `PRE_EVENT` preservado.

## Testes locais

| Comando | Resultado |
| --- | --- |
| `npm.cmd run test:header-structural` | `7/7 PASS` |
| `npm.cmd run test:agrosamas` | `112/112 PASS` |
| `node scripts/check-agent-harness.mjs --check` | PASS |
| `node --check js/nav-shared.js` | PASS |
| `node --check js/breadcrumbs.js` | PASS |
| `node --check js/agrosamas-2026.js` | PASS |
| `git diff --check` | PASS; apenas avisos informativos de futura conversão LF/CRLF |

## Evidências visuais

Diretório local de screenshots:
`C:\Users\jacob\.codex\visualizations\2026\09\10\01a08cb2-ba46-7f50-bb0a-034e89e306b7\header-02-screenshots`

- `home-desktop-1440x900.png`;
- `home-mobile-390x844.png`;
- `local-desktop-1280x900.png`;
- `local-mobile-390x844.png`;
- `breadcrumb-eventos-desktop-1280x900.png`;
- `breadcrumb-eventos-mobile-390x844.png`;
- `local-a-plus-1280x900.png`;
- `agrosamas-2026-programacao-1280x900.png`.

As oito capturas foram inspecionadas: header contínuo, ausência de overlap,
breadcrumb após todo o header, Home full-bleed e nav local AgroSamas alinhada ao
header global. O banner de cookies aparece na porção inferior de algumas
capturas, sem cobrir header ou breadcrumb.

## Findings residuais e limites da prova

- `/mapa-completo` é uma ponte preexistente com redirect imediato; por isso não
  mantém DOM de breadcrumb em runtime. O destino consolidado foi validado e a
  ponte não foi alterada.
- O ambiente de QA bloqueou backends externos para garantir o limite sem
  Firebase. Estrutura e fallback do clima foram validados, mas a resposta de
  rede do provedor não integra esta prova local.
- A validação demonstra comportamento local no Chrome e não equivale a smoke de
  produção, deploy ou aprovação visual humana.
- A revisão humana das screenshots continua sendo o próximo gate. Nenhuma etapa
  posterior foi iniciada.
