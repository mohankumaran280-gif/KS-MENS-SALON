// GET /api/offers  →  [{ id, image_url, title, caption, expires_on, created_at }]
// Public. Expired offers are hidden unless the owner is asking.
import { json, cloudinary, isOwnerRequest, TAG, FOLDER } from "../lib/core.mjs";

const todayIST = () => new Date(Date.now() + 5.5 * 3600000).toISOString().slice(0, 10);

export default async req => {
  if (req.method !== "GET") return json(405, { error: "Method not allowed" });
  const owner = isOwnerRequest(req);

  try {
    const c = cloudinary();
    const res = await fetch(`${c.api}/resources/image/tags/${TAG}?context=true&max_results=100`, {
      headers: { authorization: c.basicAuth },
    });
    if (!res.ok) throw new Error(`Cloudinary list failed: ${res.status} ${await res.text()}`);
    const { resources = [] } = await res.json();

    const today = todayIST();
    const offers = resources
      .filter(r => r.public_id.startsWith(FOLDER + "/"))
      .map(r => {
        const ctx = r.context?.custom || {};
        return {
          id: r.public_id,
          // Serve a resized, auto-format, auto-quality version to visitors.
          image_url: r.secure_url.replace("/upload/", "/upload/f_auto,q_auto,c_limit,w_1200/"),
          title: ctx.title || null,
          caption: ctx.caption || null,
          expires_on: /^\d{4}-\d{2}-\d{2}$/.test(ctx.expires || "") ? ctx.expires : null,
          created_at: r.created_at,
        };
      })
      .filter(o => owner || !o.expires_on || o.expires_on >= today)
      .sort((a, b) => b.created_at.localeCompare(a.created_at));

    return json(200, offers, owner ? {} : {
      // Let Netlify's CDN cache the public list briefly (keeps Cloudinary API usage low).
      "cache-control": "public, max-age=0, must-revalidate",
      "netlify-cdn-cache-control": "public, s-maxage=60, stale-while-revalidate=300",
    });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Could not load offers." });
  }
};

export const config = { path: "/api/offers" };
