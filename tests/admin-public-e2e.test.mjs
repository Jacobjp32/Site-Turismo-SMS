import { strict as assert } from "node:assert";
import { readFile } from "node:fs/promises";
import { after, before, test } from "node:test";
import vm from "node:vm";

import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  collection,
  deleteField,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from "firebase/firestore";

const PROJECT_ID = "demo-turismo-sms-admin-finalization";
const UID = "admin-e2e";
const OTHER_UID = "admin-e2e-concurrent";
const ID = "e2e-establishment";
const RECOVERY_ID = "e2e-recovery-establishment";
const GROUPS = [
  "core", "content", "contact", "location", "media",
  "relationshipsRouteIds", "relationshipsRelatedPlaceIds", "relationshipsRelatedEventIds",
  "display", "seo", "review", "source", "lifecycle",
];
const MARKERS = Object.fromEntries(GROUPS.map((group) => [group, 2]));

const [adminSource, adapterSource, dataSource] = await Promise.all([
  readFile(new URL("../js/admin/modules/empreendimentos.js", import.meta.url), "utf8"),
  readFile(new URL("../js/cms-public-establishments-adapter.js", import.meta.url), "utf8"),
  readFile(new URL("../js/data/turismo-data.js", import.meta.url), "utf8"),
]);

let testEnv;
let adminDb;
let adminCompat;
let otherDb;
let storage;
let module;

function fixture() {
  return {
    id: ID,
    slug: ID,
    name: "E2E antes",
    categoryId: "gastronomia",
    categoryLabel: "Gastronomia",
    status: "draft",
    content: {
      summary: "Texto antes", description: "", longDescription: "", accessibility: "",
      openingHours: "", tags: ["e2e"], notesInternal: "",
    },
    contact: { phone: "", whatsapp: "", email: "", website: "", instagram: "", facebook: "" },
    location: {
      address: "Rua E2E", neighborhood: "", city: "São Mateus do Sul", state: "PR",
      postalCode: "", coordinates: { lat: -25.87, lng: -50.38 }, mapsUrl: "", coordStatus: "", coordNote: "",
    },
    media: {
      mainImage: { url: "https://example.test/old.webp", path: "", alt: "Antes", caption: "", credit: "", source: "cms-media", status: "active" },
      gallery: [], videoUrl: "", sourceCredits: "",
    },
    relationships: { routeIds: [], relatedPlaceIds: [], relatedEventIds: [], legacyRoute: "", legacyRouteName: "" },
    display: { featured: true, priority: 10, mapVisible: true, claimable: true },
    seo: { title: "", description: "", canonicalPath: `/local?id=${ID}` },
    publishing: { publishedAt: null, publishedBy: "", archivedAt: null, archivedBy: "", archiveReason: "" },
    review: {
      lastAppliedRequestId: "", lastAppliedAt: null, lastAppliedBy: "", lastReviewNotes: "",
      lastMediaEditedAt: null, lastMediaEditedBy: "", mediaEditReason: "",
    },
    source: {
      origin: "admin", sourceFile: "", originalId: ID, originalCategory: "",
      legacyIds: [], seededAt: null, sourceUpdatedAt: null,
    },
    createdAt: new Date("2026-09-11T12:00:00Z"),
    createdBy: UID,
    updatedAt: new Date("2026-09-11T12:00:00Z"),
    updatedBy: UID,
    schemaVersion: 2,
    validatedGroups: { ...MARKERS },
    revision: 1,
  };
}

function recoveryFixture() {
  const item = fixture();
  item.id = RECOVERY_ID;
  item.slug = RECOVERY_ID;
  item.status = "published";
  item.content.tags = Array.from({ length: 11 }, (_, index) => `tag-${index}`);
  item.media.gallery = Array.from({ length: 4 }, (_, index) => ({
    ...item.media.mainImage,
    url: `https://example.test/gallery-${index}.webp`,
    position: index + 1,
  }));
  item.review = {
    lastAppliedRequestId: "", lastAppliedAt: null, lastAppliedBy: "", lastReviewNotes: "",
  };
  item.publishing = {
    publishedAt: new Date("2026-09-11T12:00:00Z"), publishedBy: UID,
    archivedAt: null, archivedBy: "", archiveReason: "",
  };
  delete item.schemaVersion;
  delete item.validatedGroups;
  delete item.revision;
  return item;
}

function recoveryCheckpointFixture(id = RECOVERY_ID) {
  const item = recoveryFixture();
  item.id = id;
  item.slug = id;
  item.status = "draft";
  item.publishing = {
    publishedAt: null, publishedBy: "", archivedAt: null, archivedBy: "", archiveReason: "",
  };
  item.editSession = {
    resumeStatus: "published", startedAt: new Date("2026-09-11T12:01:00Z"), startedBy: UID,
  };
  item.schemaVersion = 2;
  item.validatedGroups = Object.fromEntries(GROUPS.slice(0, 8).concat("lifecycle").map((group) => [group, 2]));
  item.revision = 9;
  return item;
}

function loadAdminModule() {
  const sandbox = {
    console,
    document: { getElementById: () => null },
    window: {
      AdminContext: { db: adminCompat, storage, currentUser: { uid: UID } },
      AdminUI: { showToast() {} },
      crypto: globalThis.crypto,
      firebase: { firestore: { FieldValue: {
        serverTimestamp: () => serverTimestamp(),
        delete: () => deleteField(),
      } } },
    },
  };
  vm.runInNewContext(adminSource, sandbox);
  return sandbox.window.AdminEstablishmentsModule;
}

function plainRealm(value) {
  if (value == null || typeof value !== "object") return value;
  if (value instanceof Date || typeof value.toMillis === "function" || value._methodName) return value;
  if (Array.isArray(value)) return value.map(plainRealm);
  return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, plainRealm(item)]));
}

function compatDb(db) {
  function compatRef(name, id) {
    const raw = db.collection(name).doc(id);
    return { id, raw, get: () => raw.get() };
  }
  return {
    collection(name) {
      return { doc: (id) => compatRef(name, id) };
    },
    runTransaction(callback) {
      return db.runTransaction((transaction) => callback({
        get: (ref) => transaction.get(ref.raw),
        update: (ref, patch) => transaction.update(ref.raw, plainRealm(patch)),
      }));
    },
  };
}

function loadAdapter() {
  const document = { readyState: "complete", addEventListener() {} };
  const window = {
    document,
    console,
    location: { search: "", hostname: "localhost" },
    localStorage: { getItem: () => null },
    setTimeout,
    clearTimeout,
  };
  window.window = window;
  vm.runInNewContext(adapterSource, { window, document, console, URLSearchParams, setTimeout, clearTimeout, Date, Promise, isFinite });
  return window.CMSPublicEstablishmentsAdapter;
}

async function publicResult() {
  const publicDb = testEnv.unauthenticatedContext().firestore();
  const adapter = loadAdapter();
  return adapter.readPublished({
    force: true,
    reader: async () => {
      const snapshot = await getDocs(query(collection(publicDb, "cms_establishments"), where("status", "==", "published")));
      return snapshot.docs.map((entry) => ({ id: entry.id, data: entry.data() }));
    },
  });
}

async function current() {
  const snapshot = await getDoc(doc(adminDb, "cms_establishments", ID));
  assert.equal(snapshot.exists(), true);
  return module._normalizeDoc(snapshot.data(), snapshot.id);
}

async function writeSaga(desired, groups) {
  const base = await current();
  const ref = adminCompat.collection("cms_establishments").doc(ID);
  return module._executeSaga(adminCompat, module._buildSaga(ref, desired(base), base, UID, groups));
}

async function publish() {
  await writeSaga((base) => module._lifecyclePublished(base, UID), ["lifecycle"]);
}

async function unpublish() {
  await writeSaga((base) => module._lifecycleDraft(base), ["lifecycle"]);
}

function loadPublicData(routesResult, establishmentsResult) {
  const listeners = {};
  const document = { readyState: "complete", addEventListener() {}, querySelectorAll: () => [] };
  const window = {
    document,
    console,
    setTimeout,
    clearTimeout,
    TURISMO_PONTOS: [{ id: "static-establishment", nome: "Fallback estático", categoria: "Gastronomia" }],
    TURISMO_ROTAS: [{ id: "static-route", nome: "Rota fallback" }],
    TURISMO_HOSPEDAGENS: [], TURISMO_RESTAURANTES: [], TURISMO_EVENTOS: [], TURISMO_INFORMACOES_ESSENCIAIS: [],
    CMSPublicRoutesAdapter: { readPublished: async () => routesResult },
    CMSPublicEstablishmentsAdapter: { readPublished: async () => establishmentsResult },
    addEventListener(type, listener) { (listeners[type] ||= []).push(listener); },
    dispatchEvent(event) { (listeners[event.type] || []).forEach((listener) => listener(event)); },
    CustomEvent: class CustomEvent { constructor(type, init) { this.type = type; this.detail = init?.detail; } },
  };
  window.window = window;
  vm.runInNewContext(dataSource, { window, document, console, setTimeout, clearTimeout, Promise, Date, isFinite });
  return window.TURISMO_DATA_READY.then(() => window);
}

before(async () => {
  const [firestoreRules, storageRules] = await Promise.all([
    readFile(new URL("../firestore.rules", import.meta.url), "utf8"),
    readFile(new URL("../storage.rules", import.meta.url), "utf8"),
  ]);
  testEnv = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules: firestoreRules, host: "127.0.0.1", port: 8080 },
    storage: { rules: storageRules, host: "127.0.0.1", port: 9199 },
  });
  await testEnv.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await Promise.all([
      setDoc(doc(db, "usuarios", UID), { role: "admin", ativo: true }),
      setDoc(doc(db, "usuarios", OTHER_UID), { role: "admin", ativo: true }),
      setDoc(doc(db, "cms_establishments", ID), fixture()),
    ]);
  });
  adminDb = testEnv.authenticatedContext(UID).firestore();
  adminCompat = compatDb(adminDb);
  otherDb = testEnv.authenticatedContext(OTHER_UID).firestore();
  storage = testEnv.authenticatedContext(UID).storage();
  module = loadAdminModule();
});

after(async () => {
  await testEnv?.cleanup();
});

test("ADMIN -> Firestore/Storage -> adapter -> TURISMO_DATA cobre o contrato editorial completo", async (t) => {
  await t.test("1 draft não é público", async () => {
    assert.equal((await publicResult()).count, 0);
  });

  await t.test("2 publish aparece no adapter", async () => {
    await publish();
    const result = await publicResult();
    assert.equal(result.state, "SUCCESS");
    assert.equal(result.items[0].id, ID);
  });

  await t.test("3 edição de nome em published republica sem falso conflito", async () => {
    await module._applyCanonicalFields(ID, { name: "E2E depois" }, { groups: ["core"], flow: "e2e-name" });
    const result = await publicResult();
    assert.equal(result.items[0].nome, "E2E depois");
    assert.equal((await current()).status, "published");
  });

  let uploadedImage;
  let uploadCount = 0;
  const originalRef = storage.ref.bind(storage);
  const storageProbe = {
    ref(path) {
      const target = originalRef(path);
      return {
        put(file) { uploadCount += 1; return target.put(file); },
        getDownloadURL: () => target.getDownloadURL(),
        getMetadata: () => target.getMetadata(),
      };
    },
  };
  const mainFile = new File([new Uint8Array([82, 73, 70, 70, 1, 2, 3, 4])], "e2e-main.webp", { type: "image/webp", lastModified: 1 });

  await t.test("4 mainImage passa pelo Storage e chega ao público", async () => {
    const base = await current();
    const payload = module._normalizeDoc(base, ID);
    await module._prepareUploads(storageProbe, UID, payload, mainFile, []);
    uploadedImage = payload.media.mainImage;
    await module._applyCanonicalFields(ID, { media: payload.media }, { groups: ["media"], flow: "e2e-main-image" });
    const result = await publicResult();
    assert.equal(result.items[0].imagem, uploadedImage.url);
    assert.equal(uploadedImage.path.startsWith(`cms-media/${UID}/establishments/${ID}/main/`), true);
  });

  const galleryImage = {
    url: "https://example.test/gallery.webp", path: `cms-media/${UID}/establishments/${ID}/gallery/gallery.webp`,
    alt: "Galeria E2E", caption: "", credit: "", source: "cms-media", status: "active", position: 1,
  };

  await t.test("5 adicionar galeria aparece", async () => {
    const base = await current();
    await module._applyCanonicalFields(ID, { media: { ...base.media, gallery: [galleryImage] } }, { groups: ["media"] });
    assert.deepEqual(Array.from((await publicResult()).items[0].galeria), [galleryImage.url]);
  });

  await t.test("6 remover galeria oculta sem apagar referência", async () => {
    const base = await current();
    const removed = {
      ...base.media.gallery[0], status: "removed",
      removedAt: "2026-09-11T12:01:00.000Z", removedBy: UID,
      updatedAt: "2026-09-11T12:01:00.000Z", updatedBy: UID,
    };
    await module._applyCanonicalFields(ID, { media: { ...base.media, gallery: [removed] } }, { groups: ["media"] });
    assert.deepEqual(Array.from((await publicResult()).items[0].galeria), []);
  });

  await t.test("7 restaurar galeria reaparece", async () => {
    const base = await current();
    const restored = {
      ...base.media.gallery[0], status: "active", removedAt: "", removedBy: "",
      updatedAt: "2026-09-11T12:02:00.000Z", updatedBy: UID,
    };
    await module._applyCanonicalFields(ID, { media: { ...base.media, gallery: [restored] } }, { groups: ["media"] });
    assert.deepEqual(Array.from((await publicResult()).items[0].galeria), [galleryImage.url]);
  });

  await t.test("8 routeIds alimenta filtro público", async () => {
    await module._applyCanonicalFields(ID, { "relationships.routeIds": ["rota-e2e"] }, { groups: ["relationshipsRouteIds"] });
    const item = (await publicResult()).items[0];
    assert.deepEqual(Array.from(item.routeIds), ["rota-e2e"]);
  });

  await t.test("9 concorrência real conflita sem sobrescrever", async () => {
    await writeSaga((base) => module._lifecycleEditDraft(base, UID), ["lifecycle"]);
    const stale = await current();
    assert.equal(stale.status, "draft");
    assert.equal(module._hasResumeEditSession(stale), true);
    const ref = adminCompat.collection("cms_establishments").doc(ID);
    const desired = module._normalizeDoc(stale, ID);
    desired.content.summary = "Tentativa obsoleta";
    const saga = module._buildSaga(ref, desired, stale, UID, ["content"]);
    const raw = (await getDoc(doc(otherDb, "cms_establishments", ID))).data();
    await updateDoc(doc(otherDb, "cms_establishments", ID), {
      content: { ...raw.content, summary: "Edição concorrente" },
      schemaVersion: 2,
      validatedGroups: { ...raw.validatedGroups, content: 2 },
      revision: raw.revision + 1,
      updatedAt: serverTimestamp(),
      updatedBy: OTHER_UID,
    });
    await assert.rejects(module._executeSaga(adminCompat, saga), { code: "establishment-conflict" });
    assert.equal((await current()).content.summary, "Edição concorrente");
  });

  await t.test("10 retry reutiliza upload e reconcilia sem perda", async () => {
    const payload = await current();
    await module._prepareUploads(storageProbe, UID, payload, mainFile, []);
    assert.equal(uploadCount, 1);
    await module._applyCanonicalFields(ID, { media: payload.media }, { groups: ["media"], flow: "e2e-retry" });
    assert.equal((await current()).media.mainImage.path, uploadedImage.path);
    assert.equal((await publicResult()).items[0].imagem, uploadedImage.url);
  });

  await t.test("11 unpublish volta a draft e desaparece", async () => {
    await unpublish();
    assert.equal((await current()).status, "draft");
    assert.equal((await publicResult()).count, 0);
  });

  await t.test("12 publish novamente retorna", async () => {
    await publish();
    assert.equal((await publicResult()).items[0].id, ID);
  });

  await t.test("13 archive desaparece", async () => {
    await writeSaga((base) => {
      const desired = module._normalizeDoc(base, ID);
      desired.status = "archived";
      desired.publishing = {
        ...desired.publishing, publishedAt: null, publishedBy: "",
        archivedAt: serverTimestamp(), archivedBy: UID, archiveReason: "E2E",
      };
      return desired;
    }, ["lifecycle"]);
    assert.equal((await current()).status, "archived");
    assert.equal((await publicResult()).count, 0);
  });

  await t.test("14 falha técnica usa estático", async () => {
    const window = await loadPublicData(
      { state: "TECHNICAL_FAILURE", source: "static-fallback", items: [] },
      { state: "TECHNICAL_FAILURE", source: "static-fallback", items: [], fallbackReason: "network-unavailable" },
    );
    assert.equal(window.TURISMO_DATA.pontos[0].id, "static-establishment");
  });

  await t.test("15 resultado authoritative não é sobrescrito pelo estático", async () => {
    const window = await loadPublicData(
      { state: "AUTHORITATIVE_EMPTY", source: "firestore", authoritativeCount: 0, items: [] },
      { state: "AUTHORITATIVE_EMPTY", source: "firestore", authoritativeCount: 0, count: 0, items: [] },
    );
    assert.equal(window.TURISMO_DATA.pontos.length, 0);
    assert.equal(window.PUBLIC_CUTOVER_ALLOWED, true);
  });
});

test("recovery published legado atravessa revision 9 e conclui display sem falso conflito", async () => {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "cms_establishments", RECOVERY_ID), recoveryFixture());
  });
  const ref = adminCompat.collection("cms_establishments").doc(RECOVERY_ID);
  const initialSnapshot = await getDoc(doc(adminDb, "cms_establishments", RECOVERY_ID));
  const initial = module._normalizeDoc(initialSnapshot.data(), initialSnapshot.id);
  const payload = module._normalizeDoc(initial, RECOVERY_ID);
  payload.display = { ...payload.display, featured: true, priority: 600 };
  payload.status = "draft";
  payload.publishing = module._lifecycleDraft(payload).publishing;
  const first = module._buildSaga(ref, module._lifecycleEditDraft(initial, UID), initial, UID, ["lifecycle"]);
  first.flow = "recovery-e2e";
  first.resumePhase = "groups";
  first.resumePayload = payload;
  first.resumeWasPublished = true;
  await module._executeSaga(adminCompat, first);
  await module._resumeSagaWorkflow(adminCompat, first);
  const finalSnapshot = await getDoc(doc(adminDb, "cms_establishments", RECOVERY_ID));
  const final = module._normalizeDoc(finalSnapshot.data(), finalSnapshot.id);
  assert.equal(final.status, "published");
  assert.equal(final.display.featured, true);
  assert.equal(final.display.priority, 600);
  assert.equal("editSession" in finalSnapshot.data(), false);
  assert.equal(final.revision, 14);
});

test("recovery após reload lógico retoma revision 9 e preserva mídia", async () => {
  const checkpoint = recoveryCheckpointFixture();
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "cms_establishments", RECOVERY_ID), checkpoint);
  });
  const ref = adminCompat.collection("cms_establishments").doc(RECOVERY_ID);
  const base = module._normalizeDoc(checkpoint, RECOVERY_ID);
  const desired = module._normalizeDoc(checkpoint, RECOVERY_ID);
  desired.display = { ...desired.display, featured: true, priority: 600 };
  const saga = module._buildSaga(ref, desired, base, UID, module._groupsToWrite(base, desired));
  saga.resumePhase = "publish";
  await module._executeSaga(adminCompat, saga);
  await module._resumeSagaWorkflow(adminCompat, saga);
  const finalSnapshot = await getDoc(doc(adminDb, "cms_establishments", RECOVERY_ID));
  const final = module._normalizeDoc(finalSnapshot.data(), finalSnapshot.id);
  assert.equal(final.status, "published");
  assert.equal(final.display.featured, true);
  assert.equal(final.display.priority, 600);
  assert.equal("editSession" in finalSnapshot.data(), false);
  assert.equal(final.revision, 14);
  assert.deepEqual(final.media, module._normalizeDoc(checkpoint, RECOVERY_ID).media);
});

test("alteração externa real antes de display continua gerando establishment-conflict", async () => {
  const conflictId = `${RECOVERY_ID}-conflict`;
  const checkpoint = recoveryCheckpointFixture(conflictId);
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await setDoc(doc(context.firestore(), "cms_establishments", conflictId), checkpoint);
  });
  const ref = adminCompat.collection("cms_establishments").doc(conflictId);
  const base = module._normalizeDoc(checkpoint, conflictId);
  const desired = module._normalizeDoc(checkpoint, conflictId);
  desired.display = { ...desired.display, featured: true, priority: 600 };
  const saga = module._buildSaga(ref, desired, base, UID, ["display"]);
  await updateDoc(doc(otherDb, "cms_establishments", conflictId), {
    display: { ...checkpoint.display, featured: true, priority: 999 },
    schemaVersion: 2,
    validatedGroups: { ...checkpoint.validatedGroups, display: 2 },
    revision: 10,
    updatedAt: serverTimestamp(),
    updatedBy: OTHER_UID,
  });
  await assert.rejects(module._executeSaga(adminCompat, saga), { code: "establishment-conflict" });
  const remote = (await getDoc(doc(adminDb, "cms_establishments", conflictId))).data();
  assert.equal(remote.display.priority, 999);
  assert.equal(remote.revision, 10);
});
