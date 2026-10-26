# Owner Login & Festival Offers – One-time Setup

**How it works**
- **Cloudinary** (free) stores the festival offer pictures.
- **Netlify Functions** (free) check the owner's email and password and approve
  every upload and delete. The password and Cloudinary secret are kept on Netlify's
  server as settings and never appear in the website code.
- The website must be hosted on **Netlify** for this to work. On any other host, or
  when opening `index.html` directly, the site works but owner login does not.

**Folder layout**
```
salon\
├── public\             ← the website (index.html, styles.css, script.js, admin.js, assets\)
├── netlify\functions\  ← server code: login, offers, sign-upload, delete-offer
├── netlify\lib\        ← shared server code
├── netlify.toml        ← tells Netlify where everything is
└── SETUP.md
```

---

## 1. Create a free Cloudinary account
1. Go to <https://cloudinary.com> → **Sign up for free**.
2. After signing in, open **Settings (gear icon) → API Keys**
   (or the **Dashboard / Programmable Media** page).
3. Find **API environment variable**. It looks like
   `CLOUDINARY_URL=cloudinary://123456789012345:AbCdEf...@your-cloud-name`
4. Click to reveal/copy it. Keep it private — it contains the API **secret**.

## 2. Create a free Netlify account
1. Go to <https://app.netlify.com/signup> and sign up (email or GitHub).

## 3. Put the website online (first time)
Open **PowerShell** and run:

```bash
cd C:\Users\Thenm\salon
```
```bash
npx netlify-cli login
```
(A browser window opens — click **Authorize**.)
```bash
npx netlify-cli deploy --prod
```
- Choose **Create & configure a new project**, pick your team, and type a site
  name such as `ks-mens-salon`.
- If asked for the publish directory, type `public`.
- At the end it prints your live address, e.g. `https://ks-mens-salon.netlify.app`.

## 4a. Create a free Resend account (sends the login code by email)
1. Go to <https://resend.com/signup> and sign up **with `mohankumaran280@gmail.com`**.
   (On the free plan without your own domain, Resend can only send to the email
   address the account was created with — which is exactly the owner's email.)
2. Open **API Keys → Create API Key**, name it `ks-salon`, permission
   **Sending access**, click **Add**.
3. Copy the key (starts with `re_`). It is shown only once.

## 4. Add the secret settings on Netlify
1. Open <https://app.netlify.com> → your site → **Site configuration →
   Environment variables → Add a variable**.
2. Add these two (Scopes: **Functions**, or all scopes):

| Key | Value |
|---|---|
| `OWNER_PASSWORD` | the owner's password (only this password will work) |
| `CLOUDINARY_URL` | the `cloudinary://…` value from step 1 (without `CLOUDINARY_URL=`) |
| `RESEND_API_KEY` | the `re_…` key from step 4a (emails the login code) |

Tick **Contains secret values** for all three.

3. Deploy again so the functions pick up the settings:
```bash
npx netlify-cli deploy --prod
```

## 5. Test it
1. Open the live address on your phone.
2. Tap **⋮ → Owner Login**, enter `mohankumaran280@gmail.com` and the password,
   tap **Continue**.
   - Wrong password → "Wrong email or password." (no email is sent)
   - Any other email → "This email is not allowed."
   - Too many wrong tries in a minute → "Too many attempts…"
3. A 6-digit code arrives at `mohankumaran280@gmail.com` (check Spam/Promotions the
   first time). Enter it and tap **Verify & Log In**. The code works for 5 minutes;
   **Resend code** sends a new one after 60 seconds.
4. Tap **⋮ → + Add Picture**, choose a picture, add a title / details / "Show until"
   date (all optional), tap **Post Offer**.
5. The picture appears under **Festival Offers** for everyone. Each offer has a
   **Delete** button that only the logged-in owner sees.

The phone remembers the login for 30 days. To log out, tap **⋮ → Log Out**
(only shown to the logged-in owner).

## Editing Services and Combos (owner)
After logging in, tap **⋮ → ✎ Edit Services** or **✎ Edit Combos**
(or the gold **✎ Edit** button under each section's heading).

- **Services:** pick a category tab, then rename, change the price (and optional
  "up to" price / "from" label), add a short detail or badge, **+ Add photo /
  Change photo / Remove photo**, **Remove** a service, or **+ Add service**.
- **Combos:** rename, short description, offer price, total price, what's included
  (one item per line), optional badge, photo, **Remove**, or **+ Add combo**.
- Nothing changes until you tap **Save changes**. **Cancel** throws the edits away.
- Changes appear for everyone straight away — **no deploy needed, no credits used.**
- The edited menu is saved in Cloudinary (`ks-menu/menu.json`), photos you upload in
  `ks-menu/`. Photos you remove are deleted from Cloudinary automatically.

**Important:** once the owner has saved the menu, the saved menu is what the website
shows. The prices written in `public/script.js` are only the starting menu, so later
price changes should be made through **Edit Services / Edit Combos**, not in the file.

## Changing the password later
Netlify → Environment variables → edit `OWNER_PASSWORD` → deploy again
(`npx netlify-cli deploy --prod`). This also logs out every phone that was logged in.

## Updating the website later
After changing any file, run `npx netlify-cli deploy --prod` from
`C:\Users\Thenm\salon` again.

## Notes
- Visitors see new offers within about a minute (the list is cached briefly to stay
  within Cloudinary's free limits). The owner sees changes immediately.
- Offers past their "Show until" date are hidden from visitors automatically, and
  stay visible to the owner (marked "Expired") so they can be deleted.
- Pictures are stored in Cloudinary under the `ks-offers` folder.
