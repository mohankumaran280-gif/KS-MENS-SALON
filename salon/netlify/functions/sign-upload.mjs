// POST /api/sign-upload  (owner only)  { title, caption, expires }  or  { kind: "menu" }
//   →  signed parameters the browser uses to upload ONE picture straight to Cloudinary.
// The picture's name, tag and details are fixed here on the server, so the signature
// can't be reused to upload anything else.
import crypto from "node:crypto";
import { json, cloudinary, isOwnerRequest, signParams, escapeContext, FOLDER, TAG, MENU_FOLDER } from "../lib/core.mjs";

const clean = (v, max) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, max);

export default async req => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  if (!isOwnerRequest(req)) return json(401, { error: "Please log in again." });

  let body = {};
  try { body = await req.json(); } catch { /* details are optional */ }

  const title = clean(body.title, 80);
  const caption = clean(body.caption, 300);
  const expires = /^\d{4}-\d{2}-\d{2}$/.test(body.expires || "") ? body.expires : "";
  const context = [["title", title], ["caption", caption], ["expires", expires]]
    .filter(([, v]) => v)
    .map(([k, v]) => `${k}=${escapeContext(v)}`)
    .join("|");

  try {
    const c = cloudinary();
    const id = `${Date.now()}-${crypto.randomBytes(3).toString("hex")}`;
    // kind "menu" = a photo for a service or combo (not shown in Festival Offers).
    const params = body.kind === "menu" ? {
      public_id: `${MENU_FOLDER}/photo-${id}`,
      tags: "menu-photo",
      allowed_formats: "jpg,jpeg,png,webp",
      timestamp: Math.floor(Date.now() / 1000),
    } : {
      public_id: `${FOLDER}/offer-${id}`,
      tags: TAG,
      context: context || undefined,
      allowed_formats: "jpg,jpeg,png,webp",
      timestamp: Math.floor(Date.now() / 1000),
    };
    const signature = signParams(params, c.apiSecret);
    const fields = Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined));
    return json(200, {
      uploadUrl: `${c.api}/image/upload`,
      fields: { ...fields, api_key: c.apiKey, signature },
    });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Uploads are not configured on the server yet." });
  }
};

export const config = { path: "/api/sign-upload" };
