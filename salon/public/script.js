/* =========================================================
   K S MEN'S SALON — EDIT YOUR DETAILS & PRICES HERE
   ========================================================= */
const SALON = {
  // Opening hours: 0 = Sunday ... 6 = Saturday. Use 24h "HH:MM". Set null for closed.
  hours: {
    1: ["07:30", "21:00"],
    2: ["07:30", "21:00"],
    3: ["07:30", "21:00"],
    4: ["07:30", "21:00"],
    5: ["07:30", "21:00"],
    6: ["07:30", "21:00"],
    0: ["07:30", "21:00"],
  },

  // Service menu — each heading becomes a tab.
  //   price: 199            → ₹199
  //   price: 199, to: 499   → ₹199 – ₹499
  //   price: 2999, from: true → from ₹2,999
  //   desc (optional) shows a small line under the name. tag (optional) adds a badge.
  //   photo: Unsplash photo ID (free licence, loaded from Unsplash's servers), or
  //          a file of your own, e.g. photo: "assets/services/fade.jpg"
  services: {
    "Haircuts": [
      { name: "Haircut", price: 99, tag: "Best Price", photo: "1647140655214-e4a2d914971f" },
      { name: "Fade Cut", price: 120, photo: "1493256338651-d82f7acb2b38" },
      { name: "Buzz Cut", price: 120, photo: "1644199161554-f9e84cd64b7b" },
      { name: "High Fade Cut", price: 120, photo: "1635273051937-a0ddef9573b6" },
      { name: "Low Fade Cut", price: 120, photo: "1635273051839-003bf06a8751" },
    ],
    "Kids": [
      { name: "Kids Haircut", price: 99, photo: "1704072650662-76df3af134a7" },
      { name: "Baby Haircut", price: 120, photo: "1561087385-0ef90642f75a" },
      { name: "Mushroom Cut", price: 120, photo: "1758782213545-51784a6cce5b" },
      { name: "Low Fade Cut", price: 120, photo: "1703792685152-d13e206924d8" },
      { name: "High Fade Cut", price: 120, photo: "1788930045572-5be1e03c1433" },
      { name: "Stylish Cut", price: 120, photo: "1645876719529-7a699f6c7358" },
    ],
    "Shave & Beard": [
      { name: "Clean Shave", price: 49, photo: "1599351431202-1e0f0137899a" },
      { name: "Beard Trim", price: 49, photo: "1599011176306-4a96f1516d4d" },
      { name: "Italian Beard", price: 49, photo: "1630827020718-3433092696e7" },
      { name: "Beard Shape", price: 49, photo: "1517832606299-7ae9b720a186" },
    ],
    "Hair Colour": [
      { name: "Natural Black", price: 199, photo: "1757689373248-a6cd07328ba5" },
      { name: "Garnier Black", price: 249, photo: "1562004760-aceed7bb0fe3" },
      { name: "Streax Black", price: 449, photo: "1629189784191-9afdcbcb0398" },
      { name: "Raga Black", price: 499, photo: "1568339434343-2a640a1a9946" },
      { name: "L'Oréal Black", price: 499, photo: "1578390432942-d323db577792" },
      { name: "Highlights", desc: "Flame Red · Cherry Red · Gold · Pink · Blue · Green · Blonde", price: 199, to: 499, photo: "1596800574167-e501fcb433a9" },
    ],
    "Facial": [
      { name: "Face Clean-Up", price: 199, photo: "1728949202477-bad2935775cb" },
      { name: "Face Scrub", price: 199, photo: "1722351153083-e32ff83a0c8a" },
      { name: "Fruit Facial", price: 399, photo: "1722351351063-eb7491e36635" },
      { name: "Gold Facial", price: 499, photo: "1611169035510-f9af52e6dbe2" },
      { name: "Nature's Facial", price: 499, photo: "1722351053599-fd3adf134c61" },
      { name: "Skin Whitening", price: 799, photo: "1734120273696-596f96658db9" },
      { name: "Wine Facial", price: 899, photo: "1474722883778-792e7990302f" },
    ],
    "Bleach & De-Tan": [
      { name: "Normal Bleach", price: 199, photo: "1590322739578-fb3d9ff41465" },
      { name: "Lacto Bleach", price: 249, photo: "1648203276014-20f97ba1f817" },
      { name: "Fruit Bleach", price: 299, photo: "1563298998-c743b38848b0" },
      { name: "Gold Bleach", price: 349, photo: "1768729340164-7d83fe18384d" },
      { name: "De-Tan Removal", price: 399, photo: "1465400325222-409b0b34be7c" },
    ],
    "Hair Wash & Massage": [
      { name: "Hair Wash", desc: "Shampoo & conditioner wash", price: 100, photo: "1672642150262-6edcbffa463e" },
      { name: "Head Massage – Coconut Oil", desc: "With massager", price: 199, photo: "1560769680-ba2f3767c785" },
      { name: "Head Massage – Navratna Oil", desc: "With massager", price: 199, photo: "1789182249805-eff75edb8f9c" },
      { name: "Head Massage – Olive Oil", desc: "With massager", price: 249, photo: "1474979266404-7eaacbcd87c5" },
      { name: "Head Massage – Almond Oil", desc: "With massager", price: 299, photo: "1608797178974-15b35a64ede9" },
    ],
    "Hair Spa & Care": [
      { name: "Classic Hair Spa", desc: "With steamer", price: 499, photo: "1717160675158-fdd75b8595cf" },
      { name: "Dandruff Treatment", price: 599, photo: "1767953829433-1e405b6889de" },
      { name: "Hair Fall Treatment", price: 599, photo: "1773078280516-df823e1c9d78" },
      { name: "Frizzy Hair Treatment", price: 599, photo: "1694714892034-82950a6f68c7" },
      { name: "Hair Smoothening", price: 799, photo: "1580618672591-eb180b1a973f" },
    ],
    "Premium Treatments": [
      { name: "Hair Straightening", price: 2999, from: true, photo: "1712641966879-63f3bc1a47e4" },
      { name: "Keratin Treatment", price: 3999, from: true, photo: "1779492907379-0894f8807533" },
      { name: "Botox Treatment", price: 5999, from: true, photo: "1713768704571-6aeb0d0e5105" },
    ],
  },

  // photo: Unsplash photo ID shown at the top of the combo card (or your own "assets/..." file)
  combos: [
    { name: "Combo 1", sub: "Cut, shave & face wash", price: 249, worth: 350, photo: "1571166883992-16ff9304b5c7",
      items: ["Hair Cut", "Shaving", "Face Wash"] },
    { name: "Combo 2", sub: "Cut, shave & de-tan", price: 399, worth: 450, photo: "1728949202477-bad2935775cb",
      items: ["Hair Cut", "Shaving", "De-Tan"] },
    { name: "Combo 3", sub: "Cut, shave & face scrub", price: 249, worth: 300, featured: true, badge: "Best Value", photo: "1722351153083-e32ff83a0c8a",
      items: ["Hair Cut", "Shaving", "Face Scrub"] },
    { name: "Combo 4", sub: "Cut, shave & black mask", price: 399, worth: 450, photo: "1590322739578-fb3d9ff41465",
      items: ["Hair Cut", "Shaving", "Black Mask"] },
    { name: "Combo 5", sub: "Cut, shave & hair dye", price: 350, worth: 400, photo: "1757689373248-a6cd07328ba5",
      items: ["Hair Cut", "Shaving", "Hair Dye"] },
    { name: "Combo 6", sub: "Cut, shave & facial", price: 549, worth: 600, featured: true, badge: "Popular", photo: "1734120273696-596f96658db9",
      items: ["Hair Cut", "Shaving", "Facial"] },
    { name: "Combo 7", sub: "Cut, shave & head oil massage", price: 349, worth: 400, photo: "1542848285-4777eb2a621e",
      items: ["Hair Cut", "Shaving", "Head Oil Massage"] },
  ],
};

/* =========================================================
   SITE LOGIC (no need to edit below)
   ========================================================= */
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const inr = n => "₹" + n.toLocaleString("en-IN");
const DAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const toMin = t => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
const fmt12 = mins => {
  const h = Math.floor(mins / 60), m = mins % 60, ap = h >= 12 ? "PM" : "AM";
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${ap}`;
};

/* ---------- Header / nav ---------- */
const header = $(".header");
const toggle = $("#menuToggle");
const navLinks = $("#navLinks");
const setMenu = open => {
  navLinks.classList.toggle("open", open);
  header.classList.toggle("menu-open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
};
toggle.addEventListener("click", () => setMenu(!navLinks.classList.contains("open")));
$$("a", navLinks).forEach(a => a.addEventListener("click", () => setMenu(false)));
const onScroll = () => header.classList.toggle("scrolled", scrollY > 30);
addEventListener("scroll", onScroll, { passive: true });
onScroll();

// highlight active section in nav
const sectionObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    $$(".nav-links a:not(.btn)").forEach(a => a.classList.toggle("active", a.getAttribute("href") === "#" + e.target.id));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
$$("main section[id]").forEach(s => sectionObs.observe(s));

/* ---------- Services & Combos (the "menu") ----------
   The prices above are the starting menu. After the owner edits Services or
   Combos on the live site, the saved menu (stored in Cloudinary) is loaded from
   /api/menu and replaces them. */
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const tabsEl = $("#serviceTabs");
const gridEl = $("#priceGrid");

let MENU = {
  services: Object.entries(SALON.services).map(([category, items]) => ({ category, items })),
  combos: SALON.combos,
};
let currentCat = null;

// Photos: an Unsplash ID, a Cloudinary URL (owner uploads) or a file in assets/.
const photoSrc = (p, w, h = w) => {
  if (p.includes("res.cloudinary.com/")) return p.replace("/upload/", `/upload/c_fill,g_auto,w_${w},h_${h},f_auto,q_auto/`);
  if (p.includes("/")) return p;
  return `https://images.unsplash.com/photo-${p}?w=${w}&h=${h}&fit=crop&crop=faces,entropy&auto=format&q=60`;
};

function renderCategory(cat) {
  const group = MENU.services.find(g => g.category === cat) || MENU.services[0];
  if (!group) { gridEl.innerHTML = ""; return; }
  currentCat = group.category;
  $$(".tab", tabsEl).forEach(t => t.setAttribute("aria-selected", t.dataset.cat === currentCat));
  gridEl.innerHTML = group.items.length ? group.items.map((s, i) => `
    <div class="price-item${s.photo ? " has-photo" : ""}" style="animation-delay:${i * 40}ms">
      ${s.photo ? `<img class="svc-photo" src="${esc(photoSrc(s.photo, 144))}" srcset="${esc(photoSrc(s.photo, 288))} 2x" alt="${esc(s.name)}" width="72" height="72" loading="lazy" decoding="async">` : ""}
      <h3>${esc(s.name)}${s.tag ? ` <span class="tag">${esc(s.tag)}</span>` : ""}</h3>
      <span class="price">${s.from ? "<small>from</small>" : ""}${inr(s.price)}${s.to ? `<span class="price-to"> – ${inr(s.to)}</span>` : ""}</span>
      ${s.desc ? `<p>${esc(s.desc)}</p>` : ""}
    </div>`).join("") : `<p class="offers-empty">No services in this category yet.</p>`;
}

function renderServices() {
  tabsEl.innerHTML = MENU.services.map(g =>
    `<button class="tab" role="tab" data-cat="${esc(g.category)}">${esc(g.category)}</button>`).join("");
  renderCategory(MENU.services.some(g => g.category === currentCat) ? currentCat : MENU.services[0]?.category);
}
tabsEl.addEventListener("click", e => {
  const b = e.target.closest(".tab");
  if (!b) return;
  renderCategory(b.dataset.cat);
  // On phones the tabs are one swipeable row — bring the tapped tab to the middle.
  tabsEl.scrollTo({ left: b.offsetLeft - (tabsEl.clientWidth - b.offsetWidth) / 2, behavior: "smooth" });
});

function renderCombos(revealed = false) {
  $("#comboGrid").innerHTML = MENU.combos.map((c, i) => `
  <article class="combo reveal${revealed ? " in" : ""}${c.featured ? " featured" : ""}${c.photo ? " has-photo" : ""}">
    ${c.badge ? `<span class="combo-badge">${esc(c.badge)}</span>` : ""}
    ${c.photo ? `
    <div class="combo-media">
      <img src="${esc(photoSrc(c.photo, 480, 270))}" srcset="${esc(photoSrc(c.photo, 960, 540))} 2x" alt="${esc(c.name)}${c.sub ? ": " + esc(c.sub) : ""}" loading="lazy" decoding="async">
      <span class="combo-num"><small>COMBO</small>${i + 1}</span>
    </div>` : ""}
    <h3>${esc(c.name)}</h3>
    ${c.sub ? `<p class="sub">${esc(c.sub)}</p>` : ""}
    <div class="combo-price"><strong>${inr(c.price)}</strong>${c.worth > c.price ? `<s>${inr(c.worth)}</s>` : ""}</div>
    ${c.worth > c.price ? `<span class="save">You save ${inr(c.worth - c.price)}</span>` : ""}
    <ul>${(c.items || []).map(it => `<li>${esc(it)}</li>`).join("")}</ul>
  </article>`).join("") || `<p class="offers-empty">No combo offers right now.</p>`;
  setupComboDots();
}

renderServices();
renderCombos();

// For the owner tools in admin.js.
window.KS = {
  getMenu: () => JSON.parse(JSON.stringify(MENU)),
  setMenu(menu) { MENU = menu; renderServices(); renderCombos(true); },
  photoSrc, esc, inr,
};

// Load the owner's saved menu (live site only — locally there is no /api).
fetch("/api/menu")
  .then(r => r.ok ? r.json() : null)
  .then(m => { if (m && Array.isArray(m.services) && Array.isArray(m.combos)) window.KS.setMenu(m); })
  .catch(() => { /* keep the built-in menu */ });
/* ---------- Hours & open status ---------- */
const order = [1, 2, 3, 4, 5, 6, 0];
const now = new Date();
$("#hoursTable tbody").innerHTML = order.map(d => {
  const h = SALON.hours[d];
  return `<tr class="${d === now.getDay() ? "today" : ""}"><td>${DAYS[d]}</td><td>${h ? `${fmt12(toMin(h[0]))} – ${fmt12(toMin(h[1]))}` : "Closed"}</td></tr>`;
}).join("");

(function status() {
  const el = $("#openStatus");
  const h = SALON.hours[now.getDay()];
  const mins = now.getHours() * 60 + now.getMinutes();
  if (h && mins >= toMin(h[0]) && mins < toMin(h[1])) {
    el.textContent = `Open now · until ${fmt12(toMin(h[1]))}`;
  } else {
    el.classList.add("closed");
    // find next opening
    for (let i = 0; i < 8; i++) {
      const d = (now.getDay() + i) % 7, nh = SALON.hours[d];
      if (!nh) continue;
      if (i === 0 && mins >= toMin(nh[0])) continue;
      el.textContent = `Closed now · opens ${i === 0 ? "today" : i === 1 ? "tomorrow" : DAYS[d]} at ${fmt12(toMin(nh[0]))}`;
      break;
    }
  }
})();

/* ---------- Reveal on scroll ---------- */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); revealObs.unobserve(e.target); } });
}, { threshold: 0.12 });
$$(".reveal").forEach((el, i) => { el.style.transitionDelay = `${(i % 4) * 70}ms`; revealObs.observe(el); });

/* ---------- Combo swipe dots ----------
   No automatic movement: visitors swipe the combos themselves (phone).
   The dots show which combo is in view; tapping a dot scrolls to it. */
function setupComboDots() {
  const grid = $("#comboGrid");
  const dots = $("#comboDots");
  if (!grid || !dots) return;
  const cards = () => $$(".combo", grid);
  dots.innerHTML = cards().map(c =>
    `<button type="button" aria-label="Show ${esc(c.querySelector("h3").textContent)}"></button>`).join("");
  markDot(0);
  if (grid.dataset.dotsReady) return;          // listeners are added only once
  grid.dataset.dotsReady = "1";

  grid.addEventListener("scroll", () => {
    const mid = grid.scrollLeft + grid.clientWidth / 2;
    let best = 0, bestDist = Infinity;
    cards().forEach((c, i) => {
      const d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
      if (d < bestDist) { bestDist = d; best = i; }
    });
    markDot(best);
  }, { passive: true });

  dots.addEventListener("click", e => {
    const b = e.target.closest("button");
    if (!b) return;
    const c = cards()[[...dots.children].indexOf(b)];
    if (!c) return;
    const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
    grid.scrollTo({ left: c.offsetLeft - (grid.clientWidth - c.offsetWidth) / 2, behavior: reduce ? "auto" : "smooth" });
  });
}
function markDot(i) {
  [...$("#comboDots").children].forEach((d, k) => d.classList.toggle("on", k === i));
}
/* ---------- Light / dark mode ----------
   Dark is the default. The choice is remembered on this phone/computer. */
(function themeToggle() {
  const btn = $("#themeBtn");
  if (!btn) return;
  const root = document.documentElement;
  const meta = $('meta[name="theme-color"]');
  const sync = () => {
    const light = root.dataset.theme === "light";
    btn.setAttribute("aria-label", light ? "Switch to dark mode" : "Switch to light mode");
    btn.setAttribute("aria-pressed", light);
    if (meta) meta.content = light ? "#f7f3ec" : "#1f1f21";
  };
  btn.addEventListener("click", () => {
    const light = root.dataset.theme !== "light";
    root.classList.add("theme-anim");                 // smooth colour change
    if (light) root.dataset.theme = "light"; else delete root.dataset.theme;
    try { localStorage.setItem("ks_theme", light ? "light" : "dark"); } catch { /* private mode */ }
    sync();
    setTimeout(() => root.classList.remove("theme-anim"), 450);
  });
  sync();
})();

/* ---------- Back to top ----------
   The header (#top) is position:fixed, so the browser won't scroll to it on its own. */
document.addEventListener("click", e => {
  const a = e.target.closest('a[href="#top"]');
  if (!a) return;
  e.preventDefault();
  window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
  history.replaceState(null, "", location.pathname + location.search);
});

/* ---------- Google review QR code ---------- */
(function reviewQr() {
  const box = $("#reviewQr");
  const link = $(".greview-actions .btn-gold");
  if (!box || !link) return;
  if (!window.qrcode) { box.closest(".greview-qr").hidden = true; return; }
  const qr = qrcode(0, "M");
  qr.addData(link.href);
  qr.make();
  box.innerHTML = qr.createSvgTag({ cellSize: 4, margin: 2, scalable: true });
})();

$("#year").textContent = new Date().getFullYear();
