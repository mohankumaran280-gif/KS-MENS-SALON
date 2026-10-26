// Services & combos menu.
//   GET  /api/menu                → the saved menu, or 404 if the owner never saved one
//   POST /api/menu  (owner only)  → { services, combos }  validates and saves it
// Stored as a small JSON file in Cloudinary (ks-menu/menu.json) — no database needed.
import { json, cloudinary, isOwnerRequest, signParams, MENU_FILE, MENU_FOLDER } from "../lib/core.mjs";

const MAX_BYTES = 200_000;

/* ---------- Reading ---------- */
async function readMenu(c) {
  // The Admin API returns the current version's URL, so we never get a stale copy.
  const meta = await fetch(`${c.api}/resources/raw/upload/${MENU_FILE}`, { headers: { authorization: c.basicAuth } });
  if (meta.status === 404) return null;
  if (!meta.ok) throw new Error(`Cloudinary menu lookup failed: ${meta.status} ${await meta.text()}`);
  const { secure_url } = await meta.json();
  const file = await fetch(secure_url);
  if (!file.ok) throw new Error(`Cloudinary menu download failed: ${file.status}`);
  return file.json();
}

/* ---------- Validation (never trust what the browser sends) ---------- */
const text = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);
const money = v => {
  const n = Math.round(Number(v));
  return Number.isFinite(n) && n >= 0 && n <= 1_000_000 ? n : null;
};

function cleanPhoto(p, cloudName) {
  if (typeof p !== "string" || !p) return null;
  if (/^\d{9,14}-[0-9a-f]{8,16}$/.test(p)) return p;                       // Unsplash photo ID
  const own = new RegExp(`^https://res\\.cloudinary\\.com/${cloudName}/image/upload/(v\\d+/)?${MENU_FOLDER}/photo-[A-Za-z0-9-]+\\.(jpg|jpeg|png|webp)$`);
  return own.test(p) ? p : null;                                            // owner's own upload
}

function cleanMenu(input, cloudName) {
  const services = (Array.isArray(input?.services) ? input.services : []).slice(0, 20).map(g => ({
    category: text(g?.category, 40),
    items: (Array.isArray(g?.items) ? g.items : []).slice(0, 80).map(s => {
      const price = money(s?.price);
      const to = money(s?.to);
      const item = { name: text(s?.name, 60), price };
      if (to && price !== null && to > price) item.to = to;
      if (s?.from) item.from = true;
      const desc = text(s?.desc, 140); if (desc) item.desc = desc;
      const tag = text(s?.tag, 20); if (tag) item.tag = tag;
      const photo = cleanPhoto(s?.photo, cloudName); if (photo) item.photo = photo;
      return item;
    }).filter(s => s.name && s.price !== null),
  })).filter(g => g.category);

  const combos = (Array.isArray(input?.combos) ? input.combos : []).slice(0, 30).map(c => {
    const price = money(c?.price);
    const worth = money(c?.worth);
    const combo = {
      name: text(c?.name, 40),
      price,
      items: (Array.isArray(c?.items) ? c.items : []).map(i => text(i, 40)).filter(Boolean).slice(0, 12),
    };
    const sub = text(c?.sub, 80); if (sub) combo.sub = sub;
    if (worth && price !== null && worth > price) combo.worth = worth;
    const badge = text(c?.badge, 20); if (badge) { combo.badge = badge; combo.featured = true; }
    const photo = cleanPhoto(c?.photo, cloudName); if (photo) combo.photo = photo;
    return combo;
  }).filter(c => c.name && c.price !== null);

  return { services, combos, updated: new Date().toISOString() };
}

/* ---------- Saving ---------- */
async function saveMenu(c, menu) {
  const params = { public_id: MENU_FILE, overwrite: "true", invalidate: "true", timestamp: Math.floor(Date.now() / 1000) };
  const fd = new FormData();
  Object.entries(params).forEach(([k, v]) => fd.append(k, String(v)));
  fd.append("api_key", c.apiKey);
  fd.append("signature", signParams(params, c.apiSecret));
  fd.append("file", new Blob([JSON.stringify(menu)], { type: "application/json" }), "menu.json");
  const res = await fetch(`${c.api}/raw/upload`, { method: "POST", body: fd });
  if (!res.ok) throw new Error(`Cloudinary menu save failed: ${res.status} ${await res.text()}`);
}

export default async req => {
  try {
    const c = cloudinary();

    if (req.method === "GET") {
      const owner = isOwnerRequest(req);
      const menu = await readMenu(c);
      if (!menu) return json(404, { error: "No saved menu yet." });
      return json(200, menu, owner ? {} : {
        // Short CDN cache for visitors (keeps Cloudinary API use low); the owner always gets it fresh.
        "cache-control": "public, max-age=0, must-revalidate",
        "netlify-cdn-cache-control": "public, s-maxage=30, stale-while-revalidate=120",
      });
    }

    if (req.method === "POST") {
      if (!isOwnerRequest(req)) return json(401, { error: "Please log in again." });
      const raw = await req.text();
      if (raw.length > MAX_BYTES) return json(413, { error: "The menu is too large." });
      let body;
      try { body = JSON.parse(raw); } catch { return json(400, { error: "Bad request" }); }
      const menu = cleanMenu(body, c.cloudName);
      if (!menu.services.length) return json(400, { error: "Keep at least one service category." });
      await saveMenu(c, menu);
      return json(200, menu);
    }

    return json(405, { error: "Method not allowed" });
  } catch (err) {
    console.error(err);
    return json(500, { error: req.method === "POST" ? "Couldn't save the changes. Please try again." : "Could not load the menu." });
  }
};

export const config = { path: "/api/menu" };
