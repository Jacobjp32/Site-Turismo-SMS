import { createRequire } from "node:module";

const projectId = process.env.GCLOUD_PROJECT;
if (!projectId?.startsWith("demo-") || !process.env.FIRESTORE_EMULATOR_HOST || !process.env.FIREBASE_AUTH_EMULATOR_HOST) {
  throw new Error("Seed E2E exige projeto demo-* e Auth/Firestore Emulator comprovados.");
}

const requireFromFunctions = createRequire(new URL("../functions/package.json", import.meta.url));
const { initializeApp, deleteApp } = requireFromFunctions("firebase-admin/app");
const { getAuth } = requireFromFunctions("firebase-admin/auth");
const { getFirestore } = requireFromFunctions("firebase-admin/firestore");

const app = initializeApp({ projectId }, `admin-public-e2e-seed-${Date.now()}`);
const auth = getAuth(app);
const db = getFirestore(app);
const uid = "admin-public-e2e-local";
const email = "admin.public.e2e.local@example.invalid";
const password = "AdminLocal-E2E-2026!";
const id = "e2e-establishment";
const groups = [
  "core", "content", "contact", "location", "media",
  "relationshipsRouteIds", "relationshipsRelatedPlaceIds", "relationshipsRelatedEventIds",
  "display", "seo", "review", "source", "lifecycle",
];
const validatedGroups = Object.fromEntries(groups.map((group) => [group, 2]));

try {
  try {
    await auth.getUser(uid);
    await auth.updateUser(uid, { email, password, displayName: "Admin E2E Local" });
  } catch (error) {
    if (error.code !== "auth/user-not-found") throw error;
    await auth.createUser({ uid, email, password, displayName: "Admin E2E Local", emailVerified: true });
  }

  await db.collection("usuarios").doc(uid).set({
    nome: "Admin E2E Local", email, role: "admin", tipo: "admin", ativo: true,
  });
  await db.collection("cms_establishments").doc(id).set({
    id,
    slug: id,
    name: "Empreendimento E2E — antes",
    categoryId: "gastronomia",
    categoryLabel: "Gastronomia",
    status: "published",
    content: {
      summary: "Texto público antes da edição no Admin.", description: "", longDescription: "",
      accessibility: "", openingHours: "Todos os dias", tags: ["e2e"], notesInternal: "",
    },
    contact: { phone: "", whatsapp: "", email: "", website: "", instagram: "", facebook: "" },
    location: {
      address: "Rua da QA Local", neighborhood: "Centro", city: "São Mateus do Sul", state: "PR",
      postalCode: "", coordinates: { lat: -25.874, lng: -50.382 }, mapsUrl: "", coordStatus: "verified", coordNote: "",
    },
    media: {
      mainImage: {
        url: "http://127.0.0.1:4173/images/FOTO_GERAL_SAO_MATEUS_DO_SUL.jpg",
        path: "", alt: "Imagem anterior do fixture E2E", caption: "", credit: "",
        source: "cms-media", status: "active",
      },
      gallery: [{
        url: "http://127.0.0.1:4173/images/FOTO_GERAL_SAO_MATEUS_DO_SUL.jpg",
        path: "", alt: "Galeria anterior", caption: "", credit: "",
        source: "cms-media", status: "active", position: 1,
      }],
      videoUrl: "", sourceCredits: "",
    },
    relationships: { routeIds: [], relatedPlaceIds: [], relatedEventIds: [], legacyRoute: "", legacyRouteName: "" },
    display: { featured: true, priority: 999, mapVisible: true, claimable: true },
    seo: { title: "Empreendimento E2E antes", description: "Fixture sintético local.", canonicalPath: `/local?id=${id}` },
    publishing: { publishedAt: new Date(), publishedBy: uid, archivedAt: null, archivedBy: "", archiveReason: "" },
    review: {
      lastAppliedRequestId: "", lastAppliedAt: null, lastAppliedBy: "", lastReviewNotes: "",
      lastMediaEditedAt: null, lastMediaEditedBy: "", mediaEditReason: "",
    },
    source: {
      origin: "admin", sourceFile: "", originalId: id, originalCategory: "",
      legacyIds: [], seededAt: new Date(), sourceUpdatedAt: null,
    },
    createdAt: new Date(), createdBy: uid, updatedAt: new Date(), updatedBy: uid,
    schemaVersion: 2, validatedGroups, revision: 1,
  });

  console.log(JSON.stringify({ projectId, syntheticUsers: 1, syntheticEstablishments: 1, status: "published" }));
} finally {
  await deleteApp(app);
}
