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

## 3. Turn on the morning WhatsApp push — Meta WhatsApp Cloud API (free, reliable)

**A. Create the app + WhatsApp product**
1. [developers.facebook.com](https://developers.facebook.com) → log in → **My Apps → Create App**.
2. Use case **Other** → type **Business** → name it `switch-plan` → Create.
3. In the dashboard, find **WhatsApp → Set up** (create/select a Meta Business account if asked).

**B. Test sender + your number**
4. **WhatsApp → API Setup.** Copy the **Phone number ID** (under the test "From" number).
5. Under "To", **add your WhatsApp number** and verify the code Meta sends you.

**C. Create the message template**
6. **WhatsApp → Message templates → Create template:**
   - Name: `daily_plan` · Category: **Utility** · Language: **English (en)**
   - Body: `🌅 Day {{1}} of your Switch Plan — {{2}}. Open your tracker for today's tasks + video links and check them off. Let's go 💪`
   - Button → **Visit website**: text `Open tracker`, URL `https://yashhhguptaaa.github.io/switch-plan/`
   - Sample values: {{1}}=`1`, {{2}}=`JS foundations`. **Submit** (approves in minutes).

**D. Permanent access token**
7. [business.facebook.com](https://business.facebook.com) → **Business settings → Users → System users → Add** → role **Admin**.
8. **Generate new token** → select your app → permissions **whatsapp_business_messaging** + **whatsapp_business_management** → Generate → copy it (shown once).

**E. Three secrets** (repo **Settings → Secrets and variables → Actions**):
- `WA_TOKEN` = the token from step 8
- `WA_PHONE_ID` = the Phone number ID from step 4
- `WA_TO` = your number, country code + digits only, e.g. `9198XXXXXXXX`

Then test: **Actions → Morning push → Run workflow**.

Daily time: edit the `cron` in `.github/workflows/morning-push.yml`
(`30 1 * * *` = 07:00 IST). Start date / timezone / app URL: edit `meta` in `curriculum.json`.

---

## Editing the plan
Everything lives in `curriculum.json` — change items, swap resources, shift the start date.
The app and the morning push both read from it.
