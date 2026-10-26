// Step 2 of owner login.
// POST /api/verify-otp  { otpToken, code }  →  { token }  (the 30-day owner session)
import { json, safeEqual, readToken, otpHash, createSession } from "../lib/core.mjs";

const sleep = ms => new Promise(r => setTimeout(r, ms));

export default async req => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Bad request" }); }

  try {
    const pending = readToken(body?.otpToken, "otp");
    if (!pending) return json(401, { error: "This code has expired. Please log in again.", expired: true });

    const code = String(body?.code ?? "").replace(/\D/g, "");
    if (code.length !== 6 || !safeEqual(otpHash(code, pending.n), pending.h)) {
      await sleep(800); // slow down code guessing (also rate-limited below)
      return json(401, { error: "Wrong code. Please check your email and try again." });
    }
    return json(200, { token: createSession() });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Login is not configured on the server yet." });
  }
};

export const config = {
  path: "/api/verify-otp",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
