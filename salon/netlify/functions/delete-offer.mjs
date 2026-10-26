// POST /api/delete-offer  (owner only)  { id }  →  { ok: true }
// Deletes a festival-offer picture or a service/combo photo the owner uploaded.
import { json, cloudinary, isOwnerRequest, OFFER_ID, MENU_PHOTO_ID } from "../lib/core.mjs";

export default async req => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  if (!isOwnerRequest(req)) return json(401, { error: "Please log in again." });

  let id = "";
  try { id = String((await req.json())?.id ?? ""); } catch { /* handled below */ }
  // Only the owner's own uploads (offers and menu photos) can ever be deleted here.
  if (!OFFER_ID.test(id) && !MENU_PHOTO_ID.test(id)) return json(400, { error: "Unknown picture." });

  try {
    const c = cloudinary();
    const url = `${c.api}/resources/image/upload?public_ids[]=${encodeURIComponent(id)}&invalidate=true`;
    const res = await fetch(url, { method: "DELETE", headers: { authorization: c.basicAuth } });
    if (!res.ok) throw new Error(`Cloudinary delete failed: ${res.status} ${await res.text()}`);
    return json(200, { ok: true });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Could not delete the offer. Please try again." });
  }
};

export const config = { path: "/api/delete-offer" };
