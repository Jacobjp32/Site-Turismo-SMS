import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import test from 'node:test';
import vm from 'node:vm';

function read(relativePath) {
    return readFileSync(new URL(`../${relativePath}`, import.meta.url), 'utf8');
}

const CONTRACT_SOURCE = read('js/data/agrosamas.js');
const BINDINGS_SOURCE = read('js/agrosamas-contract-bindings.js');
const INDEX_SOURCE = read('index.html');
const EVENTS_PAGE_SOURCE = read('eventos.html');
const MAP_PAGE_SOURCE = read('mapa-turistico.html');
const LOCAL_PAGE_SOURCE = read('local.html');
const NEWS_PAGE_SOURCE = read('noticias.html');
const NEWS_DETAIL_SOURCE = read('noticia.html');
const TRANSLATIONS_SOURCE = read('translations.js');
const CHATBOT_SOURCE = read('js/chatbot.js');
const CMS_SOURCE = read('js/cms.js');
const CONFIG_SOURCE = read('config.js');
const EVENT_SUMMARY_SOURCE = read('js/data/eventos.js');
const LOCATION_SOURCE = read('js/locais-data.js');
const CALENDAR = JSON.parse(read('eventos-2026.json'));
const SEED_PREVIEW = JSON.parse(read('docs/cms-establishments-seed-preview.json'));

function loadContract() {
    const context = vm.createContext({ console, Date, Intl });
    vm.runInContext(CONTRACT_SOURCE, context, { filename: 'js/data/agrosamas.js' });
    return { context, api: context.AgroSamasContract };
}

function loadEventSummaries() {
    const context = vm.createContext({ window: {} });
    vm.runInContext(EVENT_SUMMARY_SOURCE, context, { filename: 'js/data/eventos.js' });
    return context.window.TURISMO_EVENTOS;
}

function bindingElement(key) {
    const attributes = new Map(key ? [['data-agrosamas-bind', key]] : []);
    return {
        textContent: '',
        getAttribute(name) { return attributes.get(name) || null; },
        setAttribute(name, value) { attributes.set(name, String(value)); },
        attribute(name) { return attributes.get(name) || null; }
    };
}

test('canonical contract has stable, immutable series and edition identities', () => {
    const { context, api } = loadContract();
    const descriptor = Object.getOwnPropertyDescriptor(context, 'AgroSamasContract');

    assert.equal(api.contract.schemaVersion, 2);
    assert.deepEqual(Array.from(api.contract.sourceHierarchy), [
        'CONTENT_OWNER_USER_PROVIDED',
        'MUNICIPALITY_OFFICIAL',
        'EVENT_OFFICIAL',
        'TOURISM_PORTAL'
    ]);
    assert.equal(api.contract.series.id, 'agrosamas');
    assert.equal(api.contract.edition.id, 'agrosamas-2026');
    assert.equal(api.contract.edition.seriesId, api.contract.series.id);
    assert.equal(api.contract.activeEditionId, api.contract.edition.id);
    assert.equal(api.contract.edition.name, '5º AgroSamas');
    assert.equal(Object.isFrozen(api.contract), true);
    assert.equal(Object.isFrozen(api.contract.edition.facts), true);
    assert.equal(descriptor.writable, false);
    assert.equal(descriptor.configurable, false);
});

test('confirmed 2026 facts are 18-21 September, four days, Rua do Mathe and Miss on the 18th', () => {
    const { api } = loadContract();
    const edition = api.contract.edition;

    assert.equal(edition.startDate, '2026-09-18');
    assert.equal(edition.endDate, '2026-09-21');
    assert.equal(edition.durationDays, 4);
    assert.equal(edition.location.name, 'Rua do Mathe');
    assert.equal(edition.location.scope, 'Rua do Mathe e entorno');
    assert.equal(edition.location.city, 'São Mateus do Sul');
    assert.equal(edition.location.state, 'PR');
    assert.equal(edition.facts.missDate.value, '2026-09-18');
    assert.equal(edition.facts.anniversaryIntegration.status, 'CONFIRMED');
    assert.equal(edition.facts.anniversaryIntegration.value.years, 118);
    assert.match(api.formatDateRange('pt'), /18/);
    assert.match(api.formatDateRange('pt'), /21/);
    assert.match(api.formatDateRange('pt'), /2026/);
});

test('content status distinguishes confirmed, not-yet-announced, legacy and rejected facts', () => {
    const { api } = loadContract();
    const facts = Object.values(api.contract.edition.facts);
    const statuses = new Set(facts.map(fact => fact.status));

    assert.deepEqual([...statuses].sort(), [
        api.CONTENT_STATUS.CONFIRMED,
        api.CONTENT_STATUS.LEGACY,
        api.CONTENT_STATUS.NOT_YET_ANNOUNCED,
        api.CONTENT_STATUS.REJECTED
    ].sort());
    assert.equal(api.CONTENT_STATUS.PENDING, undefined);
    assert.equal(api.contract.edition.facts.legacy2025Attractions.publicForEdition, false);
    assert.equal(api.contract.edition.facts.rejectedDateRange.publicForEdition, false);
    assert.equal(api.contract.edition.facts.programming.status, api.CONTENT_STATUS.CONFIRMED);
    assert.equal(api.contract.edition.facts.programming.value, api.PROGRAMMING_AVAILABILITY.PARTIAL);
    for (const key of ['admission', 'remainingAttractions', 'exhibitors2026', 'operationalInformation']) {
        assert.equal(api.contract.edition.facts[key].status, api.CONTENT_STATUS.NOT_YET_ANNOUNCED);
        assert.equal(api.contract.edition.facts[key].value, null);
    }
});

test('approved identity and confirmed Roupa Nova item preserve the exact supplied scope', () => {
    const { api } = loadContract();
    const edition = api.contract.edition;
    const programming = api.getPublicProgramming();

    assert.equal(edition.brand.status, 'USER_PROVIDED_APPROVED');
    assert.equal(edition.brand.publicPath, '/images/agrosamas/2026/logo-5-agrosamas.png');
    assert.equal(edition.brand.mimeType, 'image/png');
    assert.equal(edition.brand.width, 1287);
    assert.equal(edition.brand.height, 1222);
    assert.equal(edition.brand.sha256, '5ceb3d4ffba413d88f2e157d8202916f206c049c04bdb505ee5629043990b839');
    assert.equal(programming.availability, api.PROGRAMMING_AVAILABILITY.PARTIAL);
    assert.equal(programming.items.length, 1);
    assert.deepEqual({
        id: programming.items[0].id,
        title: programming.items[0].title,
        date: programming.items[0].date,
        contentStatus: programming.items[0].contentStatus,
        featured: programming.items[0].featured
    }, {
        id: 'roupa-nova-2026-09-20',
        title: 'Roupa Nova',
        date: '2026-09-20',
        contentStatus: 'CONFIRMED',
        featured: true
    });
    assert.equal('time' in programming.items[0], false);
    assert.equal('venue' in programming.items[0], false);
});

test('temporal state changes automatically at São Mateus do Sul boundaries', () => {
    const { api } = loadContract();

    assert.equal(api.contract.edition.temporal.timezone, 'America/Sao_Paulo');
    assert.equal(api.resolveTemporalState('2026-09-17T23:59:59-03:00'), api.TEMPORAL_STATE.PRE_EVENT);
    assert.equal(api.resolveTemporalState('2026-09-18T00:00:00-03:00'), api.TEMPORAL_STATE.EVENT_LIVE);
    assert.equal(api.resolveTemporalState('2026-09-21T23:59:59-03:00'), api.TEMPORAL_STATE.EVENT_LIVE);
    assert.equal(api.resolveTemporalState('2026-09-22T00:00:00-03:00'), api.TEMPORAL_STATE.POST_EVENT);
    assert.equal(api.resolveTemporalState('invalid'), api.TEMPORAL_STATE.UNKNOWN);
    assert.deepEqual(
        Object.keys(api.contract.edition.temporal.states).sort(),
        ['EVENT_LIVE', 'POST_EVENT', 'PRE_EVENT']
    );
});

test('programming contract publishes only confirmed current-edition items', () => {
    const { api } = loadContract();
    const candidates = [
        {
            id: 'confirmed-current',
            seriesId: 'agrosamas',
            editionId: 'agrosamas-2026',
            date: '2026-09-18',
            contentStatus: 'CONFIRMED',
            title: 'Item confirmado',
            time: '19:00',
            venue: 'Rua do Mathe',
            category: 'cultural',
            featured: true,
            source: 'https://example.test/official'
        },
        { id: 'not-announced', seriesId: 'agrosamas', editionId: 'agrosamas-2026', date: '2026-09-19', contentStatus: 'NOT_YET_ANNOUNCED' },
        { id: 'old-pending', seriesId: 'agrosamas', editionId: 'agrosamas-2026', date: '2026-09-19', contentStatus: 'PENDING' },
        { id: 'legacy', seriesId: 'agrosamas', editionId: 'agrosamas-2025', date: '2025-09-20', contentStatus: 'LEGACY' },
        { id: 'wrong-edition', seriesId: 'agrosamas', editionId: 'agrosamas-2025', date: '2026-09-20', contentStatus: 'CONFIRMED' },
        { id: 'outside-range', seriesId: 'agrosamas', editionId: 'agrosamas-2026', date: '2026-09-22', contentStatus: 'CONFIRMED' },
        { id: 'malformed', seriesId: 'agrosamas', editionId: 'agrosamas-2026', date: '2026-09-20', contentStatus: 'CONFIRMED' }
    ];

    const unavailable = api.getPublicProgramming({
        availability: 'UNAVAILABLE',
        fallbackKey: 'agrosamas-programming-fallback',
        items: candidates
    });
    const partial = api.getPublicProgramming({ availability: 'PARTIAL', items: candidates });
    const complete = api.getPublicProgramming({ availability: 'COMPLETE', items: candidates });

    assert.equal(unavailable.availability, api.PROGRAMMING_AVAILABILITY.UNAVAILABLE);
    assert.equal(unavailable.items.length, 0);
    assert.deepEqual(Array.from(partial.items, item => item.id), ['confirmed-current']);
    assert.deepEqual(Array.from(complete.items, item => item.id), ['confirmed-current']);
    assert.equal(Object.isFrozen(partial.items), true);
    assert.equal(Object.isFrozen(partial.items[0]), true);
    assert.equal(api.contract.edition.programming.fallbackKey, 'agrosamas-programming-fallback');
    assert.equal(api.contract.edition.fallbacks.programmingKey, 'agrosamas-programming-fallback');
});

test('calendar occurrences share the canonical identity and confirmed dates', () => {
    const occurrences = CALENDAR.filter(item => item.seriesId === 'agrosamas');
    const miss = occurrences.find(item => item.id === 201);

    assert.equal(occurrences.length, 5);
    assert.ok(occurrences.every(item => item.editionId === 'agrosamas-2026'));
    assert.deepEqual([...new Set(occurrences.map(item => item.data))].sort(), [
        '2026-09-18',
        '2026-09-19',
        '2026-09-20',
        '2026-09-21'
    ]);
    assert.ok(occurrences.every(item => item.local === 'Rua do Mathe'));
    assert.ok(occurrences.every(item => item.horario === 'A confirmar'));
    assert.equal(miss.data, '2026-09-18');
    assert.doesNotMatch(JSON.stringify(occurrences), /show nacional|parque de diversões|dinossaur|premiação/i);
});

test('Home and Eventos bind canonical values and activate the built hub and edition routes', () => {
    for (const source of [INDEX_SOURCE, EVENTS_PAGE_SOURCE]) {
        assert.match(source, /js\/data\/agrosamas\.js\?v=agro-05-20260910/);
        assert.match(source, /js\/agrosamas-contract-bindings\.js\?v=agro-05-20260910/);
        assert.match(source, /data-agrosamas-bind="name"/);
        assert.match(source, /data-agrosamas-bind="date-range(?:-short)?"/);
        assert.match(source, /data-agrosamas-bind="location"/);
        assert.match(source, /data-agrosamas-bind="duration-days"/);
        assert.match(source, /href="\/agrosamas-2026"/);
        assert.match(source, /href="\/agrosamas"/);
    }
});

test('changed editorial sources have cache-busted references in every active consumer', () => {
    assert.match(INDEX_SOURCE, /translations\.js\?v=agro-05-20260910/);
    assert.match(INDEX_SOURCE, /config\.js\?v=agro-02-20260909/);
    assert.match(INDEX_SOURCE, /js\/locais-data\.js\?v=agro-02-20260909/);
    assert.match(INDEX_SOURCE, /js\/data\/eventos\.js\?v=agro-04-20260909/);
    assert.match(INDEX_SOURCE, /js\/event-occurrence-adapter\.js\?v=agro-02-20260909/);
    assert.match(EVENTS_PAGE_SOURCE, /translations\.js\?v=agro-05-20260910/);
    assert.match(EVENTS_PAGE_SOURCE, /config\.js\?v=agro-02-20260909/);
    assert.match(MAP_PAGE_SOURCE, /js\/locais-data\.js\?v=agro-02-20260909/);
    assert.match(MAP_PAGE_SOURCE, /js\/data\/eventos\.js\?v=agro-04-20260909/);
    assert.match(LOCAL_PAGE_SOURCE, /js\/locais-data\.js\?v=agro-02-20260909/);
    assert.match(NEWS_PAGE_SOURCE, /js\/cms\.js\?v=agro-02-20260909/);
    assert.match(NEWS_DETAIL_SOURCE, /js\/cms\.js\?v=agro-02-20260909/);
});

test('binding adapter renders contract values and localized duration without literal copies', () => {
    const elements = [
        bindingElement('name'),
        bindingElement('date-range'),
        bindingElement('date-range-short'),
        bindingElement('location'),
        bindingElement('duration-days'),
        bindingElement('month'),
        bindingElement('year'),
        bindingElement('series-name'),
        bindingElement('miss-date'),
        bindingElement('anniversary-years'),
        bindingElement('featured-program-title'),
        bindingElement('featured-program-date')
    ];
    const officialLink = bindingElement();
    const logo = bindingElement();
    const featuredProgram = bindingElement();
    const confirmedFacts = [bindingElement(), bindingElement()];
    confirmedFacts[0].setAttribute('data-agrosamas-confirmed-fact', 'missDate');
    confirmedFacts[1].setAttribute('data-agrosamas-confirmed-fact', 'anniversaryIntegration');
    const listeners = new Map();
    const document = {
        documentElement: { lang: 'en' },
        addEventListener(type, listener) { listeners.set(type, listener); },
        querySelectorAll(selector) {
            if (selector === '[data-agrosamas-bind]') return elements;
            if (selector === '[data-agrosamas-official-url]') return [officialLink];
            if (selector === '[data-agrosamas-logo]') return [logo];
            if (selector === '[data-agrosamas-featured-program]') return [featuredProgram];
            if (selector === '[data-agrosamas-confirmed-fact]') return confirmedFacts;
            return [];
        }
    };
    const context = vm.createContext({ console, Date, Intl, document });
    vm.runInContext(CONTRACT_SOURCE, context, { filename: 'js/data/agrosamas.js' });
    vm.runInContext(BINDINGS_SOURCE, context, { filename: 'js/agrosamas-contract-bindings.js' });

    assert.equal(context.AgroSamasContractBindings.bind('en-US'), true);
    assert.equal(elements[0].textContent, '5º AgroSamas');
    assert.match(elements[1].textContent, /18/);
    assert.match(elements[1].textContent, /21/);
    assert.equal(elements[3].textContent, 'Rua do Mathe');
    assert.equal(elements[4].textContent, '4 days');
    assert.equal(elements[5].textContent, 'SEPTEMBER');
    assert.equal(elements[6].textContent, '2026');
    assert.equal(elements[7].textContent, 'AgroSamas');
    assert.match(elements[8].textContent, /18/);
    assert.equal(elements[9].textContent, '118');
    assert.equal(elements[10].textContent, 'Roupa Nova');
    assert.equal(elements[11].textContent, '20 SEP');
    assert.equal(officialLink.attribute('href'), 'https://www.agrosamas.com.br/');
    assert.equal(logo.attribute('src'), '/images/agrosamas/2026/logo-5-agrosamas.png');
    assert.equal(logo.attribute('width'), '1287');
    assert.equal(logo.attribute('height'), '1222');
    assert.equal(featuredProgram.hidden, false);
    assert.ok(confirmedFacts.every(element => element.hidden === false));

    assert.equal(context.AgroSamasContractBindings.bind('pl'), true);
    assert.equal(elements[4].textContent, '4 dni');
    assert.ok(listeners.has('DOMContentLoaded'));
    assert.ok(listeners.has('translationsApplied'));
});

test('planned routes are permanent metadata while the current event link remains compatible', () => {
    const { api } = loadContract();
    const summaries = loadEventSummaries();
    const summary = summaries.find(item => item.id === 'agrosamas');

    assert.equal(api.contract.series.route, '/agrosamas');
    assert.equal(api.contract.series.role, 'PERMANENT_HUB');
    assert.equal(api.contract.edition.route, '/agrosamas-2026');
    assert.equal(api.contract.edition.role, 'EDITION_ARCHIVE');
    assert.equal(api.contract.routing.archivePolicy, 'KEEP_EDITION_ROUTE_PERMANENT');
    assert.equal(api.contract.routing.nextEditionPathTemplate, '/agrosamas-{year}');
    assert.equal(summary.seriesId, 'agrosamas');
    assert.equal(summary.activeEditionId, 'agrosamas-2026');
    assert.equal(summary.url, '/agrosamas');
    assert.equal(summary.hubUrl, '/agrosamas');
    assert.equal(summary.editionUrl, '/agrosamas-2026');
});

test('all locales expose the safe programming fallback and no duplicate canonical literals', () => {
    assert.equal((TRANSLATIONS_SOURCE.match(/'agrosamas-programming-fallback':/g) || []).length, 4);
    assert.equal((TRANSLATIONS_SOURCE.match(/'agrosamas-badge':/g) || []).length, 0);
    assert.equal((TRANSLATIONS_SOURCE.match(/'agrosamas-nome':|'agrosamas-data':|'agrosamas-local':/g) || []).length, 0);
    assert.equal((TRANSLATIONS_SOURCE.match(/'ev-agrosamas-h':|'ev-agrosamas-data':/g) || []).length, 0);
    assert.equal((TRANSLATIONS_SOURCE.match(/'agrosamas-entrada':|'ev-gratuito':/g) || []).length, 0);
});

test('active editorial surfaces contain no catalogued 2026 misinformation', () => {
    const activeSources = [
        INDEX_SOURCE,
        EVENTS_PAGE_SOURCE,
        TRANSLATIONS_SOURCE,
        CHATBOT_SOURCE,
        CMS_SOURCE,
        CONFIG_SOURCE,
        EVENT_SUMMARY_SOURCE,
        LOCATION_SOURCE,
        JSON.stringify(CALENDAR),
        JSON.stringify(SEED_PREVIEW)
    ].join('\n');

    assert.doesNotMatch(activeSources, /17 a 21 de setembro|September 17[–-]21|17 al 21 de septiembre|17[–-]21 września/i);
    assert.doesNotMatch(activeSources, /cinco dias|five days|pięć dni/i);
    assert.doesNotMatch(activeSources, /Parque dos Dinossauros|Dinosaur Park|Parque de los Dinosaurios|Parku Dinozaurów/i);
    assert.doesNotMatch(activeSources, /AgroSamas[^\n]{0,220}(?:entrada gratuita|free entry|wstęp wolny)/i);
    assert.doesNotMatch(CONFIG_SOURCE, /CONFIG\.agrosamas|agrosamas-banner-closed|dataInicio:\s*'2026-09-17'/);
    assert.match(CMS_SOURCE, /Roupa Nova está confirmado para 20 de setembro/);
    assert.doesNotMatch(CMS_SOURCE + CHATBOT_SOURCE, /programação completa será divulgada em breve/i);
});

test('staging seed no longer associates AgroSamas with the wrong venue', () => {
    const park = SEED_PREVIEW.records.find(record => record.id === 'parque-exposicoes');
    const arena = SEED_PREVIEW.records.find(record => record.id === 'arena-cultural');

    assert.ok(park);
    assert.ok(arena);
    assert.doesNotMatch(JSON.stringify(park), /AgroSamas|dinossaur/i);
    assert.doesNotMatch(JSON.stringify(arena), /AgroSamas/i);
});
