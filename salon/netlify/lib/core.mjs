// Shared server-side helpers for the owner login and festival offers.
// Runs only on Netlify's servers — nothing here is sent to visitors' browsers.
//
// Netlify environment variables (Site settings → Environment variables):
//   OWNER_PASSWORD   the owner's login password                       (required)
//   CLOUDINARY_URL   cloudinary://API_KEY:API_SECRET@CLOUD_NAME          (required)
//   RESEND_API_KEY   key from resend.com, used to email the login code   (required)
//   OWNER_EMAIL      defaults to mohankumaran280@gmail.com               (optional)
import crypto from "node:crypto";

export const FOLDER = "ks-offers";
export const TAG = "festival-offer";
const TOKEN_DAYS = 30;

export function ownerEmail() {
  return (process.env.OWNER_EMAIL || "mohankumaran280@gmail.com").trim().toLowerCase();
}

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Server is missing the ${name} setting.`);
  return v;
}

export function cloudinary() {
  const raw = requireEnv("CLOUDINARY_URL").trim().replace(/^CLOUDINARY_URL=/, "");
  const m = raw.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (!m) throw new Error("CLOUDINARY_URL is not in the form cloudinary://key:secret@cloud");
  const [, apiKey, apiSecret, cloudName] = m;
  return {
    apiKey, apiSecret, cloudName,
    basicAuth: "Basic " + Buffer.from(`${apiKey}:${apiSecret}`).toString("base64"),
    api: `https://api.cloudinary.com/v1_1/${cloudName}`,
  };
}

export function json(status, body, headers = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "content-type": "application/json", "cache-control": "no-store", ...headers },
  });
}

// Constant-time comparison that also hides the length of the secret.
export function safeEqual(a, b) {
  const h = s => crypto.createHash("sha256").update(String(s)).digest();
  return crypto.timingSafeEqual(h(a), h(b));
}

/* ---------- Login tokens ----------
   A token is base64url(payload).base64url(HMAC). The signing key is derived from
   the owner's password, so changing OWNER_PASSWORD logs out every device. */
const b64url = buf => Buffer.from(buf).toString("base64url");

function signingKey() {
  return crypto.createHash("sha256")
    .update("ks-owner-session|" + requireEnv("OWNER_PASSWORD") + "|" + cloudinary().apiSecret)
    .digest();
}

const hmac = data => b64url(crypto.createHmac("sha256", signingKey()).update(data).digest());

// typ "otp"     = password was correct, waiting for the emailed code (short-lived)
// typ "session" = fully logged in owner
export function signToken(fields, ttlMs) {
  const payload = b64url(JSON.stringify({ ...fields, sub: ownerEmail(), exp: Date.now() + ttlMs }));
  return `${payload}.${hmac(payload)}`;
}

export function readToken(token, typ) {
  const m = String(token || "").match(/^([\w-]+)\.([\w-]+)$/);
  if (!m || !safeEqual(m[2], hmac(m[1]))) return null;
  try {
    const data = JSON.parse(Buffer.from(m[1], "base64url").toString());
    return data.typ === typ && data.sub === ownerEmail() && data.exp > Date.now() ? data : null;
  } catch {
    return null;
  }
}

export const createSession = () => signToken({ typ: "session" }, TOKEN_DAYS * 86400000);

export function isOwnerRequest(req) {
  const m = (req.headers.get("authorization") || "").match(/^Bearer (.+)$/);
  return !!(m && readToken(m[1], "session"));
}

// The emailed code is never stored — only an HMAC of it, bound to a random nonce.
export const otpHash = (code, nonce) => hmac(`otp|${nonce}|${code}`);

/* ---------- Cloudinary signing ----------
   https://cloudinary.com/documentation/authentication_signatures */
export function signParams(params, apiSecret) {
  const toSign = Object.keys(params).sort()
    .filter(k => params[k] !== undefined && params[k] !== "")
    .map(k => `${k}=${params[k]}`).join("&");
  return crypto.createHash("sha1").update(toSign + apiSecret).digest("hex");
}

// Cloudinary context values must escape "|" and "=".
export const escapeContext = v => String(v).replace(/([|=\\])/g, "\\$1");

export const OFFER_ID = new RegExp(`^${FOLDER}/offer-[A-Za-z0-9-]+$`);

// Services & combos menu (owner-editable), stored as a small JSON file in Cloudinary.
export const MENU_FOLDER = "ks-menu";
export const MENU_FILE = `${MENU_FOLDER}/menu.json`;
export const MENU_PHOTO_ID = new RegExp(`^${MENU_FOLDER}/photo-[A-Za-z0-9-]+$`);
