// Step 1 of owner login.
// POST /api/login  { email, password }
//   → checks the password, emails a 6-digit code, returns { otpToken, sentTo }
// Step 2 is /api/verify-otp.
import crypto from "node:crypto";
import { json, safeEqual, ownerEmail, signToken, otpHash } from "../lib/core.mjs";

const OTP_MINUTES = 5;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mask = e => e.replace(/^(.)(.*)(.@.*)$/, (_, a, b, c) => a + "•".repeat(Math.min(b.length, 8)) + c);

async function sendCode(to, code) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { authorization: `Bearer ${process.env.RESEND_API_KEY}`, "content-type": "application/json" },
    body: JSON.stringify({
      from: process.env.OTP_FROM || "K S Men's Salon <onboarding@resend.dev>",
      to: [to],
      subject: `${code} is your K S Men's Salon login code`,
      text: `Your owner login code is ${code}\n\nIt expires in ${OTP_MINUTES} minutes.\nIf you didn't try to log in, change your OWNER_PASSWORD on Netlify.`,
      html: `
        <div style="font-family:Arial,sans-serif;max-width:420px;margin:auto;padding:24px;background:#1f1f21;color:#f1ece3;border-radius:14px">
          <h2 style="margin:0 0 4px;color:#e6d3b0">K S Men's Salon</h2>
          <p style="margin:0 0 20px;color:#a8a299">Owner login code</p>
          <p style="font-size:34px;letter-spacing:10px;font-weight:bold;margin:0 0 20px;color:#c9b38c">${code}</p>
          <p style="margin:0;color:#a8a299;font-size:14px">This code expires in ${OTP_MINUTES} minutes.<br>
          If you didn't try to log in, change your password on Netlify.</p>
        </div>`,
    }),
  });
  if (!res.ok) throw new Error(`Resend failed: ${res.status} ${await res.text()}`);
}

export default async req => {
  if (req.method !== "POST") return json(405, { error: "Method not allowed" });
  let body;
  try { body = await req.json(); } catch { return json(400, { error: "Bad request" }); }

  const email = String(body?.email ?? "").trim().toLowerCase();
  const password = String(body?.password ?? "");

  try {
    // Evaluate both checks every time so timing doesn't reveal which one failed.
    const emailOk = safeEqual(email, ownerEmail());
    const passwordOk = safeEqual(password, process.env.OWNER_PASSWORD ?? crypto.randomUUID());
    if (!(emailOk && passwordOk) || !process.env.OWNER_PASSWORD) {
      await sleep(1000); // slow down password guessing
      return json(401, { error: "Wrong email or password." });
    }
    if (!process.env.RESEND_API_KEY) throw new Error("RESEND_API_KEY is not set");

    const code = String(crypto.randomInt(0, 1_000_000)).padStart(6, "0");
    const nonce = crypto.randomBytes(12).toString("base64url");
    await sendCode(ownerEmail(), code);

    const otpToken = signToken({ typ: "otp", n: nonce, h: otpHash(code, nonce) }, OTP_MINUTES * 60000);
    return json(200, { otpToken, sentTo: mask(ownerEmail()), minutes: OTP_MINUTES });
  } catch (err) {
    console.error(err);
    return json(500, { error: "Couldn't send the login code. Please try again in a minute." });
  }
};

export const config = {
  path: "/api/login",
  rateLimit: { windowLimit: 10, windowSize: 60, aggregateBy: ["ip", "domain"] },
};
