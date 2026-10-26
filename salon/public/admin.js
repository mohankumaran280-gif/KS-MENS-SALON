/* =========================================================
   OWNER LOGIN & FESTIVAL OFFERS
   The password check and Cloudinary keys live in Netlify Functions
   (netlify/functions). Nothing secret is in this file. See SETUP.md.
   ========================================================= */
(() => {
  const $ = s => document.querySelector(s);
  const OWNER = "mohankumaran280@gmail.com";
  const TOKEN_KEY = "ks_owner_token";

  let isOwner = false;
  let offers = [];

  const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const todayISO = () => { const d = new Date(); return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10); };
  const isExpired = o => o.expires_on && o.expires_on < todayISO();
  const prettyDate = iso => new Date(iso + "T00:00").toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

  /* ---------- Saved login (stays on this phone until it expires) ---------- */
  const getToken = () => { try { return localStorage.getItem(TOKEN_KEY); } catch { return null; } };
  const saveToken = t => { try { t ? localStorage.setItem(TOKEN_KEY, t) : localStorage.removeItem(TOKEN_KEY); } catch { /* private mode */ } };
  function tokenValid(t) {
    try { return JSON.parse(atob(t.split(".")[0].replace(/-/g, "+").replace(/_/g, "/"))).exp > Date.now(); }
    catch { return false; }
  }

  /* ---------- Talking to the server ---------- */
  class ApiError extends Error { constructor(msg, status) { super(msg); this.status = status; } }
  async function api(path, { method = "GET", body } = {}) {
    const headers = {};
    const t = getToken();
    if (t) headers.authorization = `Bearer ${t}`;
    if (body) headers["content-type"] = "application/json";
    let res;
    try {
      res = await fetch(`/api/${path}`, { method, headers, body: body ? JSON.stringify(body) : undefined });
    } catch {
      throw new ApiError("No internet connection. Please try again.", 0);
    }
    const data = await res.json().catch(() => null);
    if (!res.ok || data === null) {
      if (res.status === 401 && !["login", "verify-otp"].includes(path)) logoutExpired();
      throw new ApiError(data?.error || "Owner tools only work on the live website.", res.status);
    }
    return data;
  }

  /* ---------- Toast ---------- */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 3000);
  }

  /* ---------- 3-dots menu ---------- */
  const dotsBtn = $("#dotsBtn"), dotsMenu = $("#dotsMenu");
  const setDots = open => { dotsMenu.hidden = !open; dotsBtn.setAttribute("aria-expanded", open); };
  dotsBtn.addEventListener("click", e => { e.stopPropagation(); setDots(dotsMenu.hidden); });
  document.addEventListener("click", e => { if (!e.target.closest(".owner-menu")) setDots(false); });
  document.addEventListener("keydown", e => { if (e.key === "Escape") setDots(false); });
  dotsMenu.addEventListener("click", e => {
    const b = e.target.closest("[data-action]");
    if (!b) return;
    setDots(false);
    if (b.dataset.action === "login") openDialog($("#loginDlg"));
    if (b.dataset.action === "add") openOfferDialog();
    if (b.dataset.action === "logout") logout();
    if (b.dataset.action === "edit-services") openEditor("services");
    if (b.dataset.action === "edit-combos") openEditor("combos");
  });

  /* ---------- Dialog helpers ---------- */
  function openDialog(dlg) {
    const err = dlg.querySelector(".modal-error");
    if (err) err.textContent = "";
    dlg.showModal();
    dlg.querySelector("input")?.focus();
  }
  // (The Services/Combos editor is excluded: it asks before closing with unsaved changes.)
  document.querySelectorAll("dialog.modal:not(.editor)").forEach(dlg => {
    dlg.addEventListener("click", e => {
      if (e.target === dlg || e.target.closest("[data-close]")) dlg.close();
    });
  });
  function busy(form, on, label) {
    const btn = form.querySelector('[type="submit"]');
    btn.disabled = on;
    if (on) { btn.dataset.label = btn.textContent; btn.textContent = label; }
    else if (btn.dataset.label) btn.textContent = btn.dataset.label;
  }

  /* ---------- Login ---------- */
  const loginForm = $("#loginForm");
  loginForm.querySelector(".pw-toggle").addEventListener("click", e => {
    const inp = loginForm.password;
    const show = inp.type === "password";
    inp.type = show ? "text" : "password";
    e.target.textContent = show ? "Hide" : "Show";
    e.target.setAttribute("aria-label", show ? "Hide password" : "Show password");
  });
  // Step 1: email + password → server emails a 6-digit code
  const otpForm = $("#otpForm");
  let pending = null; // { email, password, otpToken } — kept only while the dialog is open
  let resendTimer = null;
  const tooMany = ex => ex.status === 429 ? "Too many attempts. Please wait a minute and try again." : ex.message;

  function showStep(step) {
    loginForm.hidden = step !== "password";
    otpForm.hidden = step !== "otp";
    (step === "otp" ? otpForm.code : loginForm.email).focus();
  }

  function startResendCooldown(seconds = 60) {
    const btn = $("#otpResend");
    clearInterval(resendTimer);
    btn.disabled = true;
    let left = seconds;
    btn.textContent = `Resend code (${left}s)`;
    resendTimer = setInterval(() => {
      left -= 1;
      if (left > 0) { btn.textContent = `Resend code (${left}s)`; return; }
      clearInterval(resendTimer);
      btn.disabled = false;
      btn.textContent = "Resend code";
    }, 1000);
  }

  async function requestCode(email, password) {
    const { otpToken, sentTo } = await api("login", { method: "POST", body: { email, password } });
    pending = { email, password, otpToken };
    $("#otpSentTo").textContent = sentTo;
    otpForm.reset();
    otpForm.querySelector(".modal-error").textContent = "";
    startResendCooldown();
  }

  loginForm.addEventListener("submit", async e => {
    e.preventDefault();
    const err = loginForm.querySelector(".modal-error");
    err.textContent = "";
    const email = loginForm.email.value.trim().toLowerCase();
    const password = loginForm.password.value;
    if (!email || !password) { err.textContent = "Please enter your email and password."; return; }
    if (email !== OWNER) { err.textContent = "This email is not allowed. Only the salon owner can log in."; return; }

    busy(loginForm, true, "Checking…");
    try {
      await requestCode(email, password);
      showStep("otp");
    } catch (ex) {
      err.textContent = tooMany(ex);
    } finally {
      busy(loginForm, false);
    }
  });

  // Step 2: the emailed code → owner session
  otpForm.code.addEventListener("input", () => {
    otpForm.code.value = otpForm.code.value.replace(/\D/g, "").slice(0, 6);
  });
  otpForm.addEventListener("submit", async e => {
    e.preventDefault();
    const err = otpForm.querySelector(".modal-error");
    err.textContent = "";
    const code = otpForm.code.value;
    if (!/^\d{6}$/.test(code)) { err.textContent = "Please enter the 6-digit code from your email."; return; }
    if (!pending) { showStep("password"); return; }

    busy(otpForm, true, "Verifying…");
    try {
      const { token } = await api("verify-otp", { method: "POST", body: { otpToken: pending.otpToken, code } });
      saveToken(token);
      $("#loginDlg").close();
      setOwner(true);
      toast("Welcome! Tap ⋮ → Add Picture to post an offer.");
    } catch (ex) {
      err.textContent = tooMany(ex);
      otpForm.code.select();
    } finally {
      busy(otpForm, false);
    }
  });

  $("#otpResend").addEventListener("click", async () => {
    if (!pending) return;
    const err = otpForm.querySelector(".modal-error");
    try {
      await requestCode(pending.email, pending.password);
      toast("A new code was sent to your email.");
    } catch (ex) {
      err.textContent = tooMany(ex);
    }
  });
  $("#otpBack").addEventListener("click", () => showStep("password"));

  // Forget the typed password as soon as the login box closes.
  $("#loginDlg").addEventListener("close", () => {
    pending = null;
    clearInterval(resendTimer);
    loginForm.reset();
    otpForm.reset();
    loginForm.hidden = false;
    otpForm.hidden = true;
  });

  function logout() {
    saveToken(null);
    setOwner(false);
    toast("Logged out.");
  }

  function logoutExpired() {
    if (!isOwner) return;
    saveToken(null);
    setOwner(false);
    toast("Your login expired. Please log in again.");
  }

  function setOwner(on) {
    isOwner = on;
    dotsMenu.querySelector('[data-action="login"]').hidden = on;
    dotsMenu.querySelector('[data-action="add"]').hidden = !on;
    dotsMenu.querySelector('[data-action="logout"]').hidden = !on;
    dotsMenu.querySelectorAll('[data-action^="edit-"]').forEach(b => { b.hidden = !on; });
    document.querySelectorAll(".owner-edit").forEach(b => { b.hidden = !on; });
    $("#ownerLabel").hidden = !on;
    dotsBtn.classList.toggle("is-owner", on);
    if (!on && $("#menuEditDlg").open) $("#menuEditDlg").close();
    loadOffers();
  }

  /* ---------- Offers: load & show ---------- */
  async function loadOffers() {
    try {
      // The owner skips the short public cache so changes show immediately.
      offers = await api(isOwner ? `offers?fresh=${Date.now()}` : "offers");
    } catch (ex) {
      console.warn("Could not load offers:", ex.message);
      offers = [];
    }
    renderOffers();
  }

  function renderOffers() {
    const list = isOwner ? offers : offers.filter(o => !isExpired(o));
    if (!list.length) {
      $("#offersGrid").innerHTML = `<p class="offers-empty">No festival offers right now — check back soon!</p>`;
      return;
    }
    $("#offersGrid").innerHTML = list.map(o => `
      <article class="offer${isExpired(o) ? " expired" : ""}">
        <button class="offer-img" type="button" data-view="${esc(o.id)}" aria-label="View ${esc(o.title || "offer")} picture">
          <img src="${esc(o.image_url)}" alt="${esc(o.title || "Festival offer")}" loading="lazy">
          ${isExpired(o) ? `<span class="offer-flag">Expired – hidden from visitors</span>` : ""}
        </button>
        ${o.title || o.caption || o.expires_on || isOwner ? `
        <div class="offer-body">
          ${o.title ? `<h3>${esc(o.title)}</h3>` : ""}
          ${o.caption ? `<p>${esc(o.caption)}</p>` : ""}
          ${o.expires_on ? `<span class="offer-date">Valid till ${prettyDate(o.expires_on)}</span>` : ""}
          ${isOwner ? `<button class="offer-del" type="button" data-del="${esc(o.id)}">Delete</button>` : ""}
        </div>` : ""}
      </article>`).join("");
  }

  $("#offersGrid").addEventListener("click", e => {
    const view = e.target.closest("[data-view]");
    const del = e.target.closest("[data-del]");
    if (view) {
      const o = offers.find(x => x.id === view.dataset.view);
      $("#viewImg").src = o.image_url;
      $("#viewImg").alt = o.title || "Festival offer";
      $("#viewCap").textContent = [o.title, o.caption].filter(Boolean).join(" — ");
      $("#viewDlg").showModal();
    }
    if (del) deleteOffer(del.dataset.del);
  });

  /* ---------- Offers: add ---------- */
  const offerForm = $("#offerForm");
  const preview = $("#offerPreview");
  function openOfferDialog() {
    offerForm.reset();
    preview.hidden = true;
    $("#dropHint").hidden = false;
    offerForm.expires.min = todayISO();
    openDialog($("#offerDlg"));
  }

  offerForm.image.addEventListener("change", () => {
    const f = offerForm.image.files[0];
    if (preview.src) URL.revokeObjectURL(preview.src);
    if (!f) { preview.hidden = true; $("#dropHint").hidden = false; return; }
    preview.src = URL.createObjectURL(f);
    preview.hidden = false;
    $("#dropHint").hidden = true;
  });

  // Shrink big phone photos so they upload fast and load fast for visitors.
  function compress(file, max = 1600, quality = 0.85) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        const s = Math.min(1, max / Math.max(img.width, img.height));
        const c = document.createElement("canvas");
        c.width = Math.round(img.width * s);
        c.height = Math.round(img.height * s);
        const ctx = c.getContext("2d");
        ctx.fillStyle = "#1f1f21";
        ctx.fillRect(0, 0, c.width, c.height);
        ctx.drawImage(img, 0, 0, c.width, c.height);
        URL.revokeObjectURL(url);
        c.toBlob(b => b ? resolve(b) : reject(new Error("Could not process this picture.")), "image/jpeg", quality);
      };
      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("This picture format isn't supported. Please use a JPG or PNG.")); };
      img.src = url;
    });
  }

  offerForm.addEventListener("submit", async e => {
    e.preventDefault();
    const err = offerForm.querySelector(".modal-error");
    const file = offerForm.image.files[0];
    err.textContent = "";
    if (!file) { err.textContent = "Please choose a picture."; return; }
    if (!file.type.startsWith("image/")) { err.textContent = "Please choose a picture file."; return; }
    if (!isOwner) { err.textContent = "Please log in as the owner first."; return; }

    busy(offerForm, true, "Posting…");
    try {
      const blob = await compress(file);
      // 1. Ask our server for a one-time signed upload (checks the owner login).
      const { uploadUrl, fields } = await api("sign-upload", {
        method: "POST",
        body: {
          title: offerForm.title.value,
          caption: offerForm.caption.value,
          expires: offerForm.expires.value,
        },
      });
      // 2. Send the picture straight to Cloudinary with that signature.
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", blob, "offer.jpg");
      const up = await fetch(uploadUrl, { method: "POST", body: fd });
      const result = await up.json().catch(() => null);
      if (!up.ok || !result?.public_id) {
        const msg = result?.error?.message;
        throw new Error("Upload failed" + (msg ? `: ${msg}` : ". Please try again."));
      }
      $("#offerDlg").close();
      toast("Offer posted! Everyone can see it now.");
      await loadOffers();
      // Cloudinary's search can lag a few seconds behind a fresh upload — show it right away.
      if (!offers.some(o => o.id === result.public_id)) {
        offers.unshift({
          id: result.public_id,
          image_url: result.secure_url,
          title: offerForm.title.value.trim() || null,
          caption: offerForm.caption.value.trim() || null,
          expires_on: offerForm.expires.value || null,
          created_at: result.created_at,
        });
        renderOffers();
      }
      $("#offers").scrollIntoView({ behavior: "smooth" });
    } catch (ex) {
      err.textContent = ex.message;
    } finally {
      busy(offerForm, false);
    }
  });

  /* ---------- Offers: delete ---------- */
  async function deleteOffer(id) {
    const o = offers.find(x => x.id === id);
    if (!o || !confirm(`Delete "${o.title || "this offer"}"? Visitors will no longer see it.`)) return;
    try {
      await api("delete-offer", { method: "POST", body: { id } });
      toast("Offer deleted.");
      offers = offers.filter(x => x.id !== id);
      renderOffers();
    } catch (ex) {
      toast(ex.message);
    }
  }

  /* =========================================================
     OWNER EDITOR — Services & Combos
     Edits a copy of the menu; nothing changes on the site until "Save changes".
     ========================================================= */
  const editorDlg = $("#menuEditDlg");
  const editorBody = $("#editorBody");
  const editorTabs = $("#editorTabs");
  const editorStatus = $("#editorStatus");
  const photoInput = $("#editorPhotoInput");
  let editMode = null;          // "services" | "combos"
  let draft = null;             // working copy of the menu
  let draftCat = 0;             // selected service category
  let dirty = false;
  let photoTarget = null;       // the item whose photo is being chosen
  let sessionUploads = [];      // Cloudinary IDs uploaded while the editor was open
  let uploading = 0;            // photos still uploading (Save waits for them)

  // Cloudinary photo URL → its public ID (only the owner's menu photos).
  const cloudId = url => (String(url || "").match(/\/upload\/(?:[^/]+\/)*?(?:v\d+\/)?(ks-menu\/photo-[A-Za-z0-9-]+)\.\w+$/) || [])[1] || null;
  const photoIds = menu => new Set([...menu.services.flatMap(g => g.items), ...menu.combos].map(x => cloudId(x.photo)).filter(Boolean));

  document.addEventListener("click", e => {
    const b = e.target.closest(".owner-edit");
    if (b) openEditor(b.dataset.edit);
  });

  function openEditor(mode) {
    if (!isOwner || !window.KS) return;
    editMode = mode;
    draft = window.KS.getMenu();
    draftCat = Math.max(0, draft.services.findIndex(g => g.category === document.querySelector('.tab[aria-selected="true"]')?.dataset.cat));
    dirty = false;
    sessionUploads = [];
    editorStatus.textContent = "";
    $("#editorTitle").textContent = mode === "services" ? "Edit Services" : "Edit Combos";
    renderEditor();
    editorDlg.showModal();
    editorBody.scrollTop = 0;
  }

  function closeEditor(force = false) {
    if (!force && dirty && !confirm("Close without saving your changes?")) return;
    // Photos uploaded but never saved are removed from Cloudinary again.
    const keep = force ? photoIds(window.KS.getMenu()) : new Set();
    sessionUploads.filter(id => !keep.has(id)).forEach(id => api("delete-offer", { method: "POST", body: { id } }).catch(() => {}));
    sessionUploads = [];
    editorDlg.close();
  }
  $("#editorClose").addEventListener("click", () => closeEditor());
  $("#editorCancel").addEventListener("click", () => closeEditor());
  editorDlg.addEventListener("cancel", e => { e.preventDefault(); closeEditor(); });

  const photoBox = (item, i) => `
    <div class="ed-photo${item.photo ? " has" : ""}">
      ${item.photo ? `<img src="${esc(window.KS.photoSrc(item.photo, 160))}" alt="">` : `<span>No photo</span>`}
      <div class="ed-photo-btns">
        <button type="button" class="ed-mini" data-photo="${i}">${item.photo ? "Change photo" : "+ Add photo"}</button>
        ${item.photo ? `<button type="button" class="ed-mini ed-danger" data-unphoto="${i}">Remove photo</button>` : ""}
      </div>
    </div>`;

  const field = (label, i, key, value, attrs = "") =>
    `<label class="ed-field"><span>${label}</span><input data-i="${i}" data-k="${key}" value="${esc(value ?? "")}" ${attrs}></label>`;

  function renderEditor() {
    if (editMode === "services") {
      editorTabs.hidden = false;
      editorTabs.innerHTML = draft.services.map((g, i) =>
        `<button type="button" class="tab" data-cat="${i}" aria-selected="${i === draftCat}">${esc(g.category)}</button>`).join("");
      const items = draft.services[draftCat]?.items || [];
      editorBody.innerHTML = items.map((s, i) => `
        <div class="ed-item">
          ${photoBox(s, i)}
          <div class="ed-fields">
            ${field("Service name", i, "name", s.name, 'maxlength="60" placeholder="e.g. Fade Cut"')}
            <div class="ed-row">
              ${field("Price ₹", i, "price", s.price, 'type="number" inputmode="numeric" min="0" step="1"')}
              ${field("Up to ₹ (optional)", i, "to", s.to, 'type="number" inputmode="numeric" min="0" step="1" placeholder="—"')}
            </div>
            <label class="ed-check"><input type="checkbox" data-i="${i}" data-k="from" ${s.from ? "checked" : ""}> Show as “from” price</label>
            ${field("Details (optional)", i, "desc", s.desc, 'maxlength="140" placeholder="e.g. With steamer"')}
            ${field("Small badge (optional)", i, "tag", s.tag, 'maxlength="20" placeholder="e.g. Best Price"')}
          </div>
          <button type="button" class="ed-remove" data-remove="${i}" aria-label="Remove ${esc(s.name)}">Remove</button>
        </div>`).join("") + `<button type="button" class="ed-add" data-addnew>+ Add service to “${esc(draft.services[draftCat]?.category || "")}”</button>`;
    } else {
      editorTabs.hidden = true;
      editorBody.innerHTML = draft.combos.map((c, i) => `
        <div class="ed-item">
          ${photoBox(c, i)}
          <div class="ed-fields">
            <p class="ed-num">Combo ${i + 1}</p>
            ${field("Combo name", i, "name", c.name, 'maxlength="40" placeholder="e.g. Combo 8"')}
            ${field("Short description (optional)", i, "sub", c.sub, 'maxlength="80" placeholder="e.g. Cut, shave & facial"')}
            <div class="ed-row">
              ${field("Offer price ₹", i, "price", c.price, 'type="number" inputmode="numeric" min="0" step="1"')}
              ${field("Total price ₹ (optional)", i, "worth", c.worth, 'type="number" inputmode="numeric" min="0" step="1" placeholder="—"')}
            </div>
            <label class="ed-field"><span>What's included (one per line)</span><textarea data-i="${i}" data-k="items" rows="3" placeholder="Hair Cut&#10;Shaving&#10;Facial">${esc((c.items || []).join("\n"))}</textarea></label>
            ${field("Badge (optional)", i, "badge", c.badge, 'maxlength="20" placeholder="e.g. Best Value"')}
          </div>
          <button type="button" class="ed-remove" data-remove="${i}" aria-label="Remove ${esc(c.name)}">Remove</button>
        </div>`).join("") + `<button type="button" class="ed-add" data-addnew>+ Add combo</button>`;
    }
  }

  const listNow = () => editMode === "services" ? draft.services[draftCat].items : draft.combos;
  const markDirty = () => { dirty = true; editorStatus.textContent = "Unsaved changes"; editorStatus.className = "editor-status"; };

  editorTabs.addEventListener("click", e => {
    const b = e.target.closest(".tab");
    if (!b) return;
    draftCat = Number(b.dataset.cat);
    renderEditor();
    editorBody.scrollTop = 0;
  });

  editorBody.addEventListener("input", e => {
    const el = e.target.closest("[data-k]");
    if (!el) return;
    const item = listNow()[Number(el.dataset.i)];
    const k = el.dataset.k;
    if (k === "from") item.from = el.checked;
    else if (k === "items") item.items = el.value.split("\n").map(s => s.trim()).filter(Boolean);
    else if (["price", "to", "worth"].includes(k)) item[k] = el.value === "" ? undefined : Number(el.value);
    else item[k] = el.value;
    markDirty();
  });
  editorBody.addEventListener("change", e => { if (e.target.matches('[data-k="from"]')) e.target.dispatchEvent(new Event("input", { bubbles: true })); });

  editorBody.addEventListener("click", e => {
    const t = e.target;
    if (t.closest("[data-addnew]")) {
      listNow().push(editMode === "services" ? { name: "", price: undefined } : { name: `Combo ${draft.combos.length + 1}`, price: undefined, items: [] });
      markDirty();
      renderEditor();
      const items = editorBody.querySelectorAll(".ed-item");
      items[items.length - 1]?.scrollIntoView({ block: "center" });
      items[items.length - 1]?.querySelector("input")?.focus();
      return;
    }
    const rem = t.closest("[data-remove]");
    if (rem) {
      const i = Number(rem.dataset.remove);
      const item = listNow()[i];
      if (!confirm(`Remove “${item.name || "this item"}”?`)) return;
      listNow().splice(i, 1);
      markDirty();
      renderEditor();
      return;
    }
    const ph = t.closest("[data-photo]");
    if (ph) { photoTarget = listNow()[Number(ph.dataset.photo)]; photoInput.value = ""; photoInput.click(); return; }
    const un = t.closest("[data-unphoto]");
    if (un) { delete listNow()[Number(un.dataset.unphoto)].photo; markDirty(); renderEditor(); }
  });

  photoInput.addEventListener("change", async () => {
    const file = photoInput.files[0];
    const item = photoTarget;
    if (!file || !item) return;
    if (!file.type.startsWith("image/")) { toast("Please choose a picture file."); return; }
    editorStatus.textContent = "Uploading photo… please wait";
    editorStatus.className = "editor-status";
    uploading++;
    $("#editorSave").disabled = true;          // don't save until the photo has arrived
    try {
      const blob = await compress(file, 1200, 0.85);
      const { uploadUrl, fields } = await api("sign-upload", { method: "POST", body: { kind: "menu" } });
      const fd = new FormData();
      Object.entries(fields).forEach(([k, v]) => fd.append(k, v));
      fd.append("file", blob, "photo.jpg");
      const up = await fetch(uploadUrl, { method: "POST", body: fd });
      const result = await up.json().catch(() => null);
      if (!up.ok || !result?.secure_url) throw new Error(result?.error?.message || "Upload failed. Please try again.");
      if (!editorDlg.open) {                   // editor was closed while uploading — tidy up
        api("delete-offer", { method: "POST", body: { id: result.public_id } }).catch(() => {});
        return;
      }
      sessionUploads.push(result.public_id);
      item.photo = result.secure_url;
      markDirty();
      renderEditor();
      editorStatus.textContent = "Photo added — tap Save changes to publish.";
    } catch (ex) {
      editorStatus.textContent = ex.message;
      editorStatus.className = "editor-status error";
    } finally {
      uploading--;
      if (!uploading) $("#editorSave").disabled = false;
    }
  });

  $("#editorSave").addEventListener("click", async () => {
    if (uploading) { editorStatus.textContent = "Please wait — a photo is still uploading."; return; }
    // Check the fields the visitor will see.
    const problems = [];
    draft.services.forEach(g => g.items.forEach(s => {
      if (!String(s.name || "").trim()) problems.push(`A service in “${g.category}” has no name.`);
      else if (!(s.price >= 0)) problems.push(`“${s.name}” needs a price.`);
    }));
    draft.combos.forEach((c, i) => {
      if (!String(c.name || "").trim()) problems.push(`Combo ${i + 1} has no name.`);
      else if (!(c.price >= 0)) problems.push(`“${c.name}” needs an offer price.`);
    });
    if (problems.length) {
      editorStatus.textContent = problems[0];
      editorStatus.className = "editor-status error";
      return;
    }

    const btn = $("#editorSave");
    btn.disabled = true;
    editorStatus.textContent = "Saving…";
    editorStatus.className = "editor-status";
    try {
      const before = photoIds(window.KS.getMenu());
      const saved = await api("menu", { method: "POST", body: draft });
      window.KS.setMenu(saved);
      // Delete photos that are no longer used anywhere.
      const used = photoIds(saved);
      [...before, ...sessionUploads].filter(id => !used.has(id))
        .forEach(id => api("delete-offer", { method: "POST", body: { id } }).catch(() => {}));
      sessionUploads = [];
      dirty = false;
      editorDlg.close();
      toast("Saved! Everyone can see the changes now.");
    } catch (ex) {
      editorStatus.textContent = ex.message;
      editorStatus.className = "editor-status error";
    } finally {
      btn.disabled = false;
    }
  });

  /* ---------- Start ---------- */
  const saved = getToken();
  if (saved && tokenValid(saved)) setOwner(true);
  else { saveToken(null); loadOffers(); }
})();
