# ADMIN-E2E-01 — Fechamento do contrato de publicação

Data da execução: 2026-09-11\
Atualização de fechamento em produção: 2026-09-12\
Projeto local: `D:\PROJETOS CODEX\SITE-TURISMO-SMS-mainv2`\
Projeto Firebase auditado: `turismo-sms`\
Classificação: `ADMIN E2E PUBLICATION CLOSURE COMPLETE — PRODUCTION VERIFIED`

> **Escopo deste documento.** As seções 1 a 14 descrevem o bloco original de
> 2026-09-11, executado integralmente em ambiente local e Emulator, sem escrita
> em produção. As seções 15 a 18 foram atualizadas em 2026-09-12 para registrar
> o fechamento real em produção. Onde o texto histórico afirma que nenhuma
> escrita foi feita em produção, a afirmação se refere **ao bloco original de
> 2026-09-11**, não ao fechamento de 2026-09-12.

## 1. Resultado executivo

O contrato editorial foi unificado localmente e provado no Emulator:

```text
AdminEstablishmentsModule
  -> cms_establishments / Storage
  -> Firestore Rules
  -> CMSPublicEstablishmentsAdapter
  -> TURISMO_DATA
  -> Home / mapa / busca / filtros / Sabores / Onde Ficar / detalhe
```

O comportamento canônico é:

- `draft`: privado e visível somente no Admin;
- `published`: fonte editorial pública autoritativa;
- `archived`: fora das superfícies públicas e bloqueado para edição até restauração como rascunho.

Edições aprovadas de nome, conteúdo, contato, localização, imagem principal,
galeria, rotas, exibição e SEO agora percorrem o mesmo fluxo e, quando o
documento era publicado, terminam republicadas. O fallback estático permanece
somente para falha técnica do domínio correspondente.

Nenhuma escrita foi feita em produção. Também não houve deploy, commit, push,
exclusão de mídia ou alteração dos arquivos não rastreados preexistentes.

## 2. Baseline read-only de produção

A coleta foi concluída em 2026-09-11 às 15:23:16 UTC (12:23:16 BRT), antes das
alterações locais. O utilitário fez somente leituras de Firestore e Storage e
registrou `firestoreWrites=0` e `storageWrites=0`. Uma tentativa posterior de
revalidação foi bloqueada pelo ambiente e não foi contornada; portanto, os
números abaixo correspondem à coleta bem-sucedida desta mesma execução, não a
uma alegação de estado atual após aquele instante.

| Métrica | Resultado |
|---|---:|
| Documentos em `cms_establishments` | 67 |
| `draft` | 1 |
| `published` | 66 |
| `archived` | 0 |
| Outros status | 0 |
| Publicados avaliados por `normalizeDocument()` | 66 |
| Publicados incluídos | 66 |
| Publicados rejeitados | 0 |
| Publicados sem objeto `media.mainImage` | 0 |
| Publicados com `media.mainImage` sem URL pública válida | 42 |
| Publicados com `routeIds` desconhecidos | 11 |
| Referências quebradas para objetos `cms-media` | 0 |
| Objetos `cms-media` possivelmente órfãos no inventário global | 4 |

Os quatro candidatos a órfão não foram excluídos nem modificados. A contagem é
um sinal para reconciliação operacional posterior, não prova suficiente para
remoção.

### 2.1 Imagem principal inválida para consumo público

Os 42 documentos abaixo possuem o grupo/objeto de imagem principal, mas a
normalização não encontrou uma URL pública ativa válida. Eles continuam sendo
incluídos pelo adapter e recebem fallback visual; não são rejeitados como
documentos públicos.

`armazem-campestre`, `bierherr`, `cabana-campo-de-telha`, `canil-sao-jose`,
`churrascaria-dallas`, `dalety`, `ervateira-baldo`, `ervateira-rei-verde`,
`ervateira-taquaral`, `frigorifico-3m`, `hotel-dom-leopoldo`, `hotel-moro`,
`hotel-nora`, `mag-verduras`, `parada-do-chimarrao`, `parada-pinoli`,
`pesqueiro-da-joana`, `pesqueiro-do-kiko`, `pesqueiro-do-luizao`,
`pesqueiro-do-pedrao`, `pesqueiro-tio-ivo`, `pitayas-dragao`, `posto-pelanda`,
`pousadas-rurais`, `prop-antonia-gabriel`, `prop-da-sabrina`, `prop-do-beto`,
`prop-do-tico`, `prop-eduardo-pachek`, `prop-ines-lucival`, `prop-seu-luiz`,
`queijos-cleonice`, `rancho-samas`, `restaurante-dallas`, `sitio-ludevico`,
`sitio-pica-pau-vermelho`, `sitio-sapopema`, `ulbrich`, `viveiro-fluviopolis`,
`viveiro-mk`, `viveiro-santana` e `vivenda-do-mate`.

### 2.2 Relacionamentos de rota não resolvidos

| Documento | `routeId` desconhecido |
|---|---|
| `arena-cultural` | `centro` |
| `casa-da-memoria` | `cultura-polonesa-centro-historico` |
| `ginasio-polacao` | `centro` |
| `igreja-agua-branca` | `rota-polonesa-turismo-de-fe` |
| `igreja-matriz` | `turismo-de-fe` |
| `miss-sao-mateus` | `eventos-anuais` |
| `natal-ouro-verde` | `eventos-anuais` |
| `paco-municipal` | `centro-historico` |
| `parque-exposicoes` | `centro` |
| `predio-historico` | `centro-historico` |
| `prefeitura-municipal` | `centro-historico` |

Esses documentos são publicáveis e foram incluídos. O problema é de integridade
referencial: o filtro de uma rota inexistente não pode associá-los até que os
IDs editoriais sejam reconciliados.

### 2.3 Prova por documento publicado

`Incluído=sim` significa que o mesmo contrato de `normalizeDocument()` usado
pelo site retornou um item público. `Mídia=inválida` descreve somente a imagem
principal; o documento não foi rejeitado. A coluna Rota registra o problema
encontrado, quando existente.

| Documento | Incluído | Mídia | Rota |
|---|---|---|---|
| `all-garden` | sim | válida | — |
| `ancestral-gastronomia` | sim | válida | — |
| `arena-cultural` | sim | válida | `centro` desconhecida |
| `armazem-campestre` | sim | inválida | — |
| `bierherr` | sim | inválida | — |
| `cabana-campo-de-telha` | sim | inválida | — |
| `canil-sao-jose` | sim | inválida | — |
| `casa-da-memoria` | sim | válida | `cultura-polonesa-centro-historico` desconhecida |
| `chimarrodromo` | sim | válida | — |
| `churrascaria-dallas` | sim | inválida | — |
| `dalety` | sim | inválida | — |
| `delicias-da-bernardina` | sim | válida | — |
| `ervateira-baldo` | sim | inválida | — |
| `ervateira-rei-verde` | sim | inválida | — |
| `ervateira-taquaral` | sim | inválida | — |
| `frigorifico-3m` | sim | inválida | — |
| `ginasio-polacao` | sim | válida | `centro` desconhecida |
| `hotel-dom-leopoldo` | sim | inválida | — |
| `hotel-moro` | sim | inválida | — |
| `hotel-nora` | sim | inválida | — |
| `hotel-sao-mateus` | sim | válida | — |
| `igreja-agua-branca` | sim | válida | `rota-polonesa-turismo-de-fe` desconhecida |
| `igreja-matriz` | sim | válida | `turismo-de-fe` desconhecida |
| `mag-verduras` | sim | inválida | — |
| `marina-barra-iguacu` | sim | válida | — |
| `miss-sao-mateus` | sim | válida | `eventos-anuais` desconhecida |
| `natal-ouro-verde` | sim | válida | `eventos-anuais` desconhecida |
| `nova-esperanca` | sim | válida | — |
| `paco-municipal` | sim | válida | `centro-historico` desconhecida |
| `parada-do-chimarrao` | sim | inválida | — |
| `parada-pinoli` | sim | inválida | — |
| `parque-exposicoes` | sim | válida | `centro` desconhecida |
| `pesqueiro-da-joana` | sim | inválida | — |
| `pesqueiro-do-kiko` | sim | inválida | — |
| `pesqueiro-do-luizao` | sim | inválida | — |
| `pesqueiro-do-pedrao` | sim | inválida | — |
| `pesqueiro-tio-ivo` | sim | inválida | — |
| `pitayas-dragao` | sim | inválida | — |
| `ponte-rio-iguacu` | sim | válida | — |
| `posto-pelanda` | sim | inválida | — |
| `pousadas-rurais` | sim | inválida | — |
| `praca-rio-iguacu` | sim | válida | — |
| `predio-historico` | sim | válida | `centro-historico` desconhecida |
| `prefeitura-municipal` | sim | válida | `centro-historico` desconhecida |
| `prop-antonia-gabriel` | sim | inválida | — |
| `prop-da-sabrina` | sim | inválida | — |
| `prop-do-beto` | sim | inválida | — |
| `prop-do-tico` | sim | inválida | — |
| `prop-eduardo-pachek` | sim | inválida | — |
| `prop-ines-lucival` | sim | inválida | — |
| `prop-seu-luiz` | sim | inválida | — |
| `queijos-cleonice` | sim | inválida | — |
| `rancho-samas` | sim | inválida | — |
| `restaurante-dallas` | sim | inválida | — |
| `ribeiro-pesca` | sim | válida | — |
| `rua-do-mathe` | sim | válida | — |
| `sawe-parque` | sim | válida | — |
| `sitio-ludevico` | sim | inválida | — |
| `sitio-pica-pau-vermelho` | sim | inválida | — |
| `sitio-sapopema` | sim | inválida | — |
| `ulbrich` | sim | inválida | — |
| `vapor-pery` | sim | válida | — |
| `viveiro-fluviopolis` | sim | inválida | — |
| `viveiro-mk` | sim | inválida | — |
| `viveiro-santana` | sim | inválida | — |
| `vivenda-do-mate` | sim | inválida | — |

## 3. Artur Biergarten — diagnóstico do incidente

### 3.1 Estado observado

| Pergunta | Evidência read-only |
|---|---|
| Documento existe? | Sim, `cms_establishments/artur-biergarten` |
| Status | `draft` |
| Criação | 2026-07-07 18:18:29.675 UTC |
| Última atualização Firestore | 2026-09-10 18:49:36.974 UTC |
| `updatedAt` editorial | 2026-09-10 18:49:36.948 UTC |
| Imagem principal | ativa, `source=cms-media`, URL presente |
| Galeria | vazia |
| Fachada enviada | referenciada pelo documento |
| Objeto Storage | existe, WebP, 68.016 bytes |
| Criação/atualização do objeto | 2026-09-10 18:49:33.257 UTC |
| Correspondência em `media_library` | nenhuma |
| Objeto órfão | não; está referenciado |

O path foi sanitizado nesta documentação como
`cms-media/<uid>/establishments/artur-biergarten/main/<uuid>-ARTUR-BIERGARTEN.webp`.

### 3.2 Linha do tempo de auditoria

- 18:49:34.869 UTC: `unpublish`, de `published` para `draft`;
- 18:49:35.016 a 18:49:36.974 UTC: 12 atualizações sequenciais, todas
  permanecendo em `draft`;
- não existe ação posterior de `publish` nessa sequência.

### 3.3 Por que sumiu do site

O fluxo antigo de edição de um publicado executava uma saga em três etapas:
despublicar, gravar grupos e republicar. A etapa inicial criava
`editSession.startedAt` com um sentinel local de `serverTimestamp()`. Após o
readback, o Firestore devolvia um `Timestamp` real. O caminho duplicado de
`submitForm()` continuava comparando o sentinel local com o timestamp remoto e
interpretava a diferença do próprio write como concorrência externa. O fluxo
parava antes da republicação.

Consequência: a fachada foi salva e vinculada corretamente, mas o documento
ficou em `draft`; como o adapter público filtra estritamente `published`, Artur
deixou de aparecer.

Classificações comprovadas:

- incidente editorial: `DRAFT`;
- upload/save: `SAVE_SUCCEEDED`;
- não é `ARCHIVED`, `MISSING`, `INVALID_PUBLIC_DOCUMENT`, `CUTOVER_BUG`,
  `UPLOAD_SUCCEEDED_DOCUMENT_FAILED`, `ORPHAN_MEDIA` ou `NO_UPLOAD`.

## 4. Gaps encontrados

1. O Admin ainda descrevia o CMS como catálogo interno, apesar do cutover já
   consumir Firestore.
2. `submitForm()` duplicava fases já representadas por `resumeSagaWorkflow()` e
   gerava falso conflito entre sentinel e timestamp do próprio fluxo.
3. Upload seguido de falha não tinha reconciliação suficientemente explícita
   para distinguir objeto confirmado, referência persistida e tracking da
   solicitação.
4. Aplicações de solicitações textuais e de mídia podiam contornar o workflow
   canônico do módulo de empreendimentos.
5. `publicCutoverAllowed` acoplava a autoridade de empreendimentos ao estado de
   rotas: uma falha/ausência de rotas podia derrubar todos os empreendimentos.
6. Resultado autoritativo vazio podia ressuscitar conteúdo estático.
7. O adapter descartava campos públicos escritos pelo Admin: conteúdo longo,
   horário, acessibilidade, contatos, localização detalhada, `display` e SEO.
8. Home, Sabores, Onde Ficar e detalhe ainda tinham renderização editorial
   estática própria, embora mapa e busca já usassem `TURISMO_DATA`.
9. A atualização real de galeria podia exceder o limite de expressões das Rules
   por passar pelo validador V2 amplo.
10. Em cache quente, o Admin podia perder o evento de readiness e deixar a
    navegação lateral sem ação.

## 5. Arquitetura anterior e final

### 5.1 Antes

```text
Admin -> cms_establishments / Storage
        -> edição published: unpublish -> grupos -> [falso conflito]

Firestore routes + establishments
        -> condição global acoplada
        -> TURISMO_DATA
             -> mapa/busca

arquivos estáticos -----------------> Home/Sabores/Onde Ficar/detalhe
```

Esse desenho mantinha duas fontes editoriais concorrentes e permitia que um
write válido no CMS não chegasse a várias páginas.

### 5.2 Depois desta alteração local

```text
Admin / solicitação aprovada
        -> workflow canônico transacional por grupos
        -> Storage confirmado/reconciliado
        -> cms_establishments
        -> Rules por grupo, incluindo caminho estreito de mídia

CMSPublicRoutesAdapter -----------> autoridade somente de rotas
CMSPublicEstablishmentsAdapter ---> autoridade somente de empreendimentos
                                      |
                                      v
                                  TURISMO_DATA
                                      |
                  +-------------------+-------------------+
                  |          |        |       |           |
                 Home       mapa    busca   filtros    diretórios/detalhe
```

## 6. Contrato canônico de publicação

### `draft`

- não é retornado pela consulta pública;
- é editável no Admin;
- só entra no portal após a ação explícita de publicar.

### `published`

- é consultado e normalizado pelo adapter público;
- edição aprovada inicia uma sessão de edição, grava somente os grupos
  necessários e conclui com republicação;
- `revision` e o valor base de cada grupo protegem contra concorrência real;
- o readback remoto real é carregado entre fases, inclusive timestamps.

### `archived`

- não é retornado publicamente;
- não pode ser editado ou publicado diretamente;
- deve ser restaurado como rascunho antes de nova edição/publicação.

## 7. Mídia e reconciliação

O fluxo provado é:

```text
arquivo selecionado
  -> upload Storage
  -> confirmação/reconciliação do objeto determinístico
  -> URL confirmada
  -> media.mainImage ou media.gallery no documento
  -> marcador do grupo media + revision
  -> republicação quando o estado original era published
  -> adapter filtra galeria removida e expõe mídia ativa
  -> superfície pública renderiza a nova URL
```

Os destinos de aplicação de mídia revisada são determinísticos por solicitação
e índice. Em retry, um objeto já confirmado é reutilizado. Se a referência já
estiver no catálogo, o tracking é reconciliado sem novo upload. Mensagens
diferentes informam falha de vínculo no documento e falha posterior de tracking.
Nenhuma dessas falhas altera silenciosamente a intenção de publicação.

As Rules ganharam um ramo restrito para atualização do grupo `media`, com o
mesmo envelope de rascunho e validação do grupo, evitando a avaliação ampla que
estourava o limite de expressões no Emulator.

## 8. Concorrência

A proteção não foi removida. Cada transação exige a `revision` esperada e
equivalência semântica do grupo base. Uma edição externa real produz
`establishment-conflict` e impede sobrescrita. Um retry idempotente reconhece um
grupo já aplicado e avança. O falso conflito foi eliminado ao transportar para
a fase seguinte `status`, `publishing` e `editSession` lidos realmente do
Firestore, em vez do sentinel local.

O teste permanente diferencia explicitamente:

- concorrência externa: conflito seguro;
- retry do próprio fluxo: conclusão sem segunda mídia nem perda da referência.

## 9. Cutover e fallback

Rotas e empreendimentos agora têm autoridade independente.

| Estado do adapter do domínio | Comportamento |
|---|---|
| `SUCCESS` | substitui o domínio estático pelos itens Firestore |
| `AUTHORITATIVE_EMPTY` | substitui por lista vazia; não ressuscita estático |
| `AUTHORITATIVE_PARTIAL` | usa somente os documentos Firestore válidos e expõe rejeições |
| `AUTHORITATIVE_INVALID` | resultado vazio autoritativo; não mascara com estático |
| `TECHNICAL_FAILURE` | permite fallback estático somente para aquele domínio |

Uma falha técnica de rotas não derruba empreendimentos. Uma falha técnica de
empreendimentos não substitui uma leitura saudável de rotas. O metadata público
expõe fonte, estado, autoridade e quantidade de rejeições por domínio.

## 10. Superfícies públicas

| Superfície | Fonte/resultado final |
|---|---|
| Mapa turístico | `TURISMO_DATA`; respeita `display.mapVisible=false` |
| Cards e filtros do mapa | mesmo snapshot e `relationships.routeIds` |
| Busca global | reconstrói o índice no evento `turismo:data-ready` |
| Home — destaques | renderer canônico; respeita `display.featured` e prioridade |
| Home — atrações | renderer canônico de `TURISMO_DATA.pontos` |
| Home — hospedagem | renderer canônico de `TURISMO_DATA.hospedagens` |
| `sabores.html` | renderer canônico de `TURISMO_DATA.restaurantes` |
| `onde-ficar.html` | renderer canônico de `TURISMO_DATA.hospedagens` |
| `/sabores/` e `/onde-ficar/` | páginas-ponte que redirecionam aos filtros do mapa canônico |
| `local.html` | resolve detalhe, relacionados, mídia, contatos e SEO no snapshot canônico |
| Portal do Usuário | catálogo autenticado de vínculo/solicitação; writes aprovados passam pelo workflow canônico |

Fronteiras verificadas:

- `chatbot.js` e `tourism-mascot.js` contêm respostas textuais/editoriais fixas e
  não consomem uma lista de empreendimentos; portanto não são renderizadores do
  catálogo e não entram no cutover;
- `roteiro-ia.html` é `noindex` e usa uma base editorial própria de experiências
  com duração, público, interesse e ritmo — campos que não pertencem ao schema
  de `cms_establishments`. Ele não é uma listagem do catálogo. Misturar essa base
  com o CMS sem um contrato específico criaria inferências editoriais não
  autorizadas;
- galerias de eventos, notícias e conteúdo institucional são outros domínios e
  não foram convertidos em empreendimentos.

Os cards estáticos ainda presentes no HTML são conteúdo inicial/progressivo; o
renderer os substitui após a resolução do datasource. Em falha técnica, o
snapshot estático é preservado pelo próprio `TURISMO_DATA`; em resultado
autoritativo vazio, o renderer mostra estado vazio.

## 11. E2E permanente em Emulator

Foi criado o gate `npm run test:admin-public-e2e`, usando Firestore + Storage
Emulator no projeto demo `demo-turismo-sms-admin-finalization`. O teste usa o
núcleo transacional real do módulo Admin, o mesmo adapter público e a mesma
regra de composição de `TURISMO_DATA`.

Fixture: `e2e-establishment`.

| # | Fluxo obrigatório | Resultado |
|---:|---|---|
| 1 | `draft` não aparece | PASS |
| 2 | publicar aparece | PASS |
| 3 | editar nome publicado aparece com novo nome | PASS |
| 4 | trocar `mainImage` via Storage aparece | PASS |
| 5 | adicionar item de galeria aparece | PASS |
| 6 | remover item não exibe | PASS |
| 7 | restaurar volta a exibir | PASS |
| 8 | alterar `routeIds` acompanha filtro público | PASS |
| 9 | concorrência externa real conflita com segurança | PASS |
| 10 | retry/reconciliação não perde nem duplica mídia | PASS |
| 11 | despublicar para `draft` desaparece | PASS |
| 12 | publicar novamente retorna | PASS |
| 13 | arquivar desaparece | PASS |
| 14 | falha técnica usa fallback estático | PASS |
| 15 | resultado autoritativo não é sobrescrito pelo estático | PASS |

O arquivo contém 16 subtestes Node porque o cenário de mídia/reconciliação é
separado em verificações adicionais; os 15 requisitos acima estão cobertos.

## 12. QA humano local

Ambiente: Admin e site reais servidos localmente, conectados a Auth, Firestore e
Storage Emulator; usuário e empreendimento sintéticos. Para manter a CSP de
produção sem endpoints locais, o servidor temporário de QA removeu apenas a
meta CSP no transporte localhost. Nenhum arquivo de produção teve a CSP
enfraquecida para esse fim.

Evidência observada:

1. Antes: detalhe exibiu `Empreendimento E2E — antes`, texto antigo e imagem
   antiga.
2. No Admin real: o documento publicado foi editado para
   `Empreendimento E2E — depois`, recebeu novo texto e upload de uma nova imagem
   principal no Storage Emulator.
3. O Admin confirmou `Alteracoes salvas e publicadas no portal` e manteve o
   status `published`.
4. Depois: o detalhe público mostrou o novo nome, o novo texto e a URL da nova
   imagem no Storage Emulator.
5. Galeria: remoção levou a zero botões públicos; restauração levou novamente a
   um botão, sem erros no console.
6. Despublicar: o site retornou `Local não encontrado`.
7. Publicar novamente: nome, texto, nova imagem e galeria reapareceram.
8. Uma aba de Admin com cache quente também navegou corretamente depois da
   correção do binding idempotente.

Os serviços e o servidor temporário foram encerrados após o QA.

## 13. Validações executadas

Últimos gates aprovados antes do release. Não houve execução posterior de
suíte funcional; estes são os resultados vigentes no momento do fechamento.

| Comando | Resultado |
|---|---|
| `node --test tests/admin-media-reference-validation.test.mjs` | PASS, 13/13 |
| `npm.cmd run test:admin-public-e2e` | PASS, 19/19 |
| `npm.cmd run test:admin-finalization` | PASS, 16/16 |
| `npm.cmd run test:rules` | PASS, Firestore 364/364 e Storage 57/57 |
| `npm.cmd run test:rotas:model` | PASS, 29/29 |
| `npm.cmd run test:rotas:public` | PASS, 21/21 |
| `npm.cmd run test:agrosamas` | PASS, 112/112 |
| `npm.cmd run test:header-structural` | PASS, 8/8 |
| `npm.cmd run test:media-reference-safety` | PASS, 11/11 |
| `node scripts/check-agent-harness.mjs --check` | PASS |
| `node --check` nos JS/MJS alterados | PASS |
| `git diff --check` | PASS; somente avisos de política EOL do Git |

Observação: no bloco original de 2026-09-11, `test:admin-public-e2e` registrava
16/16. A suíte evoluiu para 19/19 com a inclusão dos cenários de recovery
(republicação de saga abandonada e conflito por alteração externa).

## 14. Arquivos alterados

### Contrato Admin, autenticação e Rules

- `admin-firebase.html`
- `js/admin/modules/empreendimentos.js`
- `js/firebase-auth.js`
- `firestore.rules`

### Datasource e superfícies públicas

- `js/cms-public-establishments-adapter.js`
- `js/cms-public-routes-adapter.js`
- `js/data/turismo-data.js`
- `js/public-establishments-renderer.js` (novo)
- `js/nav-shared.js`
- `js/mapa-turistico.js`
- `index.html`
- `mapa-turistico.html`
- `local.html`
- `sabores.html`
- `onde-ficar.html`
- `css/index.css`
- `css/onde-ficar.css`
- `css/shared.css`
- `sw.js`

### Testes e suporte local

- `package.json`
- `tests/admin-public-e2e.test.mjs` (novo)
- `tests/admin-finalization.structure.test.mjs`
- `tests/public-routes-adapter.test.mjs`
- `scripts/admin-public-e2e-emulator-seed.mjs` (novo)
- `ADMIN-END-TO-END-PUBLICATION-CLOSURE.md` (este relatório)

## 15. Reparo em produção concluído — Artur Biergarten

### 15.1 Diagnóstico original (2026-09-11)

A evidência mostra que a intenção editorial imediatamente anterior era
`published`, que o upload foi concluído e que o objeto existente é válido e já
está referenciado. Portanto, o reparo mínimo não precisava de novo upload nem de
alteração de mídia.

Write necessário, ainda **não executado** no bloco original:

1. abrir uma única transação no documento
   `cms_establishments/artur-biergarten`;
2. falhar fechado se o documento não existir, não estiver em `draft`, tiver
   mudado de `revision` desde a leitura da própria transação, ou se a referência
   da fachada não for mais a mesma/válida;
3. validar todos os grupos não-lifecycle antes de publicar;
4. atualizar somente o lifecycle e envelope transacional:
   - `status = "published"`;
   - `publishing.publishedAt = serverTimestamp()`;
   - `publishing.publishedBy = <uid do administrador autenticado e autorizado>`;
   - `publishing.archivedAt = null`;
   - `publishing.archivedBy = ""`;
   - `publishing.archiveReason = ""`;
   - remover `editSession`, se ainda existir;
   - `validatedGroups.lifecycle = 2`;
   - `revision = revision_atual + 1`;
   - `updatedAt = serverTimestamp()`;
   - `updatedBy = <mesmo uid autorizado>`.

Não escrever no Storage, não criar nova mídia, não editar conteúdo, não apagar
o objeto existente e não alterar os outros 66 documentos.

### 15.2 Pre-flight final (2026-09-12)

| Verificação | Valor observado |
|---|---|
| `status` | `draft` |
| `revision` | `13` |
| `schemaVersion` | `2` |
| `editSession` | presente |
| `editSession.resumeStatus` | `published` |
| `editSession.startedAt` | `2026-09-10T18:49:34Z` |
| `validatedGroups` | 13/13 == 2 |
| `media.mainImage` | ativa, mesma referência existente, caption `Fachada`, source `cms-media` |
| `audit_logs` antes do reparo | 13, todos dentro da janela original `2026-09-10 18:49:34–18:49:36`, nenhum posterior |

Classificação da `editSession`: `KNOWN_ABANDONED_EDIT_SAGA`. A sessão não
representava uma nova mudança de produção; era parte do incidente original já
documentado na seção 3.

### 15.3 Método de recovery

Workflow canônico do Admin publicado, executado **uma única vez**:

```text
AdminEstablishmentsModule.publish('artur-biergarten')
```

Rótulo na UI: **"Concluir e republicar"**.

Não foi usado Admin SDK, REST privilegiado, patch manual ou novo upload. Nenhum
campo foi editado antes da ação.

### 15.4 Resultado final

| Campo | Antes | Depois |
|---|---|---|
| `status` | `draft` | `published` |
| `revision` | `13` | `14` |
| `editSession` | presente | removida |
| `updatedAt` | `2026-09-10T18:49:36Z` | `2026-09-12T12:54:23Z` |

- `media.mainImage`: preservada exatamente (mesmo `path`, caption `Fachada`,
  `status` active, `source` cms-media).
- `gallery`: 0 itens, inalterada.
- Demais grupos editoriais (`core`, `content`, `contact`, `location`, `media`,
  `relationships`, `display`, `seo`, `review`, `source`): nenhuma mudança.
- `validatedGroups`: 13/13 == 2, inalterado.

### 15.5 Auditoria

Novo log único:

| Campo | Valor |
|---|---|
| `action` | `publish` |
| `timestamp` | `2026-09-12T12:54:23Z` |
| `summary` | `publish: cms_establishments/artur-biergarten` |
| `source` | `firestore-auth-context-v2` |

Total final de logs do Artur: **14** (13 do incidente + 1 de publish).

`storageWrites = 0`. Escritas em outros empreendimentos: **0**.

### 15.6 Smoke final do Artur

| Verificação | Resultado |
|---|---|
| `PUBLIC_CATALOG_VISIBLE` | YES — presente em Sabores |
| `PUBLIC_SEARCH_VISIBLE` | YES — busca "Artur" retorna Artur Biergarten |
| `PUBLIC_DETAIL_VISIBLE` | YES — `/local.html?id=artur-biergarten` HTTP 200, `h1` = "Artur Biergarten" |
| `PUBLIC_IMAGE_OK` | YES — fachada HTTP 200, `Content-Type: image/webp`, `naturalWidth=678`, mesma referência de mídia |
| Console | 0 erros atribuíveis ao projeto |

## 16. Pendências e riscos reais

Resolvidas no fechamento de 2026-09-12:

- ~~Produção continua executando o código anterior~~ — release publicado via
  GitHub Pages (seção 17).
- ~~Artur continua `draft`~~ — restaurado para `published` (seção 15).
- ~~Revisão visual humana final pendente~~ — smoke final público executado em
  desktop e viewport representativo (seção 17).

Dívida editorial remanescente, **não bloqueante** para o fechamento do
ADMIN-E2E-01:

- Os 42 documentos com imagem principal inválida precisam de saneamento
  editorial próprio; eles não impedem a publicação, mas recebem fallback.
- Os 11 relacionamentos de rota desconhecidos precisam ser reconciliados com o
  catálogo canônico de rotas.
- Os quatro candidatos a mídia órfã exigem prova individual antes de qualquer
  exclusão.

Essas pendências **não bloqueiam** o fechamento ADMIN-E2E-01.

## 17. Incidente de Firestore Rules e release público

### 17.1 Gap de ruleset em produção

Descoberta posterior ao relatório original: o ruleset Firestore publicado estava
atrás do ruleset local. A diferença relevante era o **narrow branch para
atualização do grupo `media`**.

Captura real em produção: `permission-denied` / "Missing or insufficient
permissions" na escrita do grupo `media`.

Prova diferencial no Emulator:

| Rules | Payload | Resultado |
|---|---|---|
| publicadas antigas | `media` com 4 itens de galeria **e metadados** | **DENY** |
| locais | mesmo payload | **ALLOW** |
| publicadas antigas | sem os metadados | ALLOW |
| locais | sem os metadados | ALLOW |

Diagnóstico do Emulator no caso DENY:

```text
Unable to evaluate the expression as the maximum of 1000 expressions
to evaluate has been reached.
```

Causa: a validação V2 ampla excedia o limite de 1000 expressões em documentos
com mídia/metadados suficientes. Correção: narrow media branch.

Deploy final das Rules:

| Campo | Valor |
|---|---|
| ruleset publicado | `32f68b15-69ed-428f-b373-e89cd42f1fba` |
| `createTime` | `2026-09-12T11:05:34Z` |
| conteúdo publicado | byte-idêntico ao `firestore.rules` local testado |

### 17.2 Migração editorial de Destaques

Migração concluída. Estado final por prioridade:

| Prioridade | Empreendimento |
|---|---|
| 800 | Delícias da Bernardina |
| 700 | Marina Barra do Iguaçu |
| 600 | Ancestral Gastronomia |
| 500 | Hotel São Mateus |
| 400 | Ribeiro Pesca e Turismo |
| 300 | Sawe Parque Aquático |
| 200 | Rua do Mathe |
| 100 | Casa da Memória Padre Bauer |

Resultado: `featured=true` em 8 documentos; ordem pública PASS.

Ancestral Gastronomia: houve incidente durante a migração e recovery após o
deploy das Rules. Estado final:

```text
status=published
revision=18
display.featured=true
display.priority=600
editSession ausente
```

### 17.3 Correção de validação de mídia legada

Bug de formulário encontrado durante o QA: o campo de mídia usava
`input type="url"`, e paths legados válidos como
`images/empreendimentos/ribeiro-pesca/ribeiro-pesca-01.jpeg` eram bloqueados
pelo navegador com "Insira um URL.".

Correção aplicada:

- `est_mainImageUrl`: `type="url"` → `type="text"`;
- `est_videoUrl`: `type="url"` → `type="text"`;
- validação JS explícita: `isValidMediaReference()`.

`Site` e `Google Maps URL` continuam `type="url"`.

Resultado: path relativo legado preservado verbatim; nenhuma migração ou rewrite
de URL; teste focado 13/13 PASS.

### 17.4 Release GitHub Pages

O frontend **não** usa Firebase Hosting. O Firebase é usado apenas como backend
(Authentication, Firestore, Storage, Security Rules).

| Campo | Valor |
|---|---|
| Frontend | GitHub Pages |
| Repositório | `Jacobjp32/SITE-TURISMO-SMS` |
| Source | `main` / root |
| Custom domain | `turismo.saomateusdosul.pr.gov.br` |
| Commit de release | `432c8eb5029d52b9c096e17d703b57879e521212` |
| Mensagem | `fix: fechar publicação end-to-end do catálogo turístico` |

Resultado:

- push `main` PASS;
- GitHub Pages build PASS;
- `public-establishments-renderer.js`: antes 404, depois HTTP 200;
- `sw.js`: `turismo-sms-v23`, com o novo renderer no precache.

### 17.5 Smoke final público

| Superfície | Resultado |
|---|---|
| Home | 75 pontos no mapa, 91 locais cadastrados, 6 categorias, 6 rotas |
| Destaques | 8, ordem correta — PASS |
| Mapa | 75 markers; filtro Gastronomia 75 → 30 — PASS |
| Sabores | 18 cards dinâmicos — PASS |
| Onde Ficar | 7 cards dinâmicos — PASS |
| Ancestral | detail PASS; 4/4 imagens PASS |
| Ribeiro | detail PASS; 8/8 imagens legadas relativas PASS |
| Admin bundle | legacy media fix publicado — PASS |
| Console | 0 erros atribuíveis ao projeto |

## 18. Fechamento final em produção — 2026-09-12

- Firestore Rules atualizadas (narrow media branch publicado);
- Featured migration concluída (8 destaques, ordem correta);
- Ancestral recuperado (`published`, `featured=true`, `priority=600`);
- GitHub Pages release concluído (`432c8eb`);
- legacy media path fix publicado;
- Artur Biergarten restaurado (`published`, `revision=14`, `editSession` removida);
- smoke final PASS;
- nenhum blocker conhecido do ADMIN-E2E-01.

Classificação final:

```text
ADMIN E2E PUBLICATION CLOSURE COMPLETE — PRODUCTION VERIFIED
```
