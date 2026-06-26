# Switch Plan — Senior Frontend (8 weeks)

A personal interview-prep tracker. Opens to **today's items**, you check them off
(✓ Done or ↻ redo-in-3-days), progress **syncs across phone + laptop**, and a
**Telegram bot pings you every morning** with the day's plan.

- `index.html` — the app (loads `curriculum.json`)
- `curriculum.json` — the 8-week plan + resource links (single source of truth)
- `scripts/push.mjs` + `.github/workflows/morning-push.yml` — the morning Telegram push

---

## 1. It's hosted automatically (GitHub Pages)

Once pushed, enable Pages: repo **Settings → Pages → Source: deploy from branch `main` / root**.
Your URL: `https://<user>.github.io/<repo>/`. Open it on laptop **and** phone
(on phone: Share → *Add to Home Screen* for an app icon).

---

## 2. Turn on sync (phone ↔ laptop) — ~5 min, free

1. Go to [console.firebase.google.com](https://console.firebase.google.com) → **Add project** (defaults are fine).
2. **Build → Authentication → Get started → Sign-in method → enable Google.**
3. **Build → Firestore Database → Create database** (production mode, any region).
4. Firestore → **Rules** tab → paste and publish:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{db}/documents {
       match /plans/{uid} {
         allow read, write: if request.auth != null && request.auth.uid == uid;
       }
     }
   }
   ```
5. Project settings (⚙) → **Your apps → Web (</>)** → register → copy the `firebaseConfig` values.
6. Paste them into the `firebaseConfig` block at the top of the `<script>` in `index.html`,
   commit & push. Then click **Sign in to sync** in the app on each device (same Google account).

> The Firebase web config is meant to be public — security is enforced by the rules above.

---

## 3. Turn on the morning WhatsApp push (CallMeBot) — ~3 min, free

CallMeBot is a free service that lets a script send WhatsApp messages to **your own** number.

1. Save **+34 684 72 39 62** to your phone contacts (e.g. as "CallMeBot").
2. From WhatsApp, send that contact: **`I allow callmebot to send me messages`**
   Wait for the reply: *"API Activated…"* — it contains your **apikey**.
3. In the GitHub repo: **Settings → Secrets and variables → Actions → New repository secret**:
   - `CALLMEBOT_PHONE` = your WhatsApp number with country code, e.g. `+9198XXXXXXXX`
   - `CALLMEBOT_APIKEY` = the apikey from step 2
4. Test it now: **Actions → Morning push → Run workflow**. You should get a WhatsApp message.

Daily time: edit the `cron` in `.github/workflows/morning-push.yml`
(`30 1 * * *` = 07:00 IST). Start date / timezone / app URL: edit `meta` in `curriculum.json`.

> CallMeBot is a free personal-use service. If a message ever doesn't arrive, just re-run the
> workflow. The tracker itself never depends on it.

---

## Editing the plan
Everything lives in `curriculum.json` — change items, swap resources, shift the start date.
The app and the morning push both read from it.
