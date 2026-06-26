// Sends today's plan to WhatsApp via Meta WhatsApp Cloud API (template message).
// Env: WA_TOKEN, WA_PHONE_ID, WA_TO   (optional: WA_TEMPLATE=daily_plan, WA_LANG=en)
import { readFile } from "node:fs/promises";

const { WA_TOKEN, WA_PHONE_ID, WA_TO } = process.env;
const TEMPLATE = process.env.WA_TEMPLATE || "daily_plan";
const LANG = process.env.WA_LANG || "en";
if (!WA_TOKEN || !WA_PHONE_ID || !WA_TO) { console.error("Missing WA_TOKEN / WA_PHONE_ID / WA_TO"); process.exit(1); }

const data = JSON.parse(await readFile(new URL("../curriculum.json", import.meta.url)));
const { days, meta } = data;

const tz = meta.timezone || "Asia/Kolkata";
const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); // YYYY-MM-DD
const dayIdx = Math.round((Date.parse(todayStr) - Date.parse(meta.startDate)) / 86400000);
if (dayIdx < 0 || dayIdx >= days.length) { console.log("No plan day for today (idx", dayIdx, ") — skipping."); process.exit(0); }
const D = days[dayIdx];

// Template body has two variables: {{1}} = day number, {{2}} = theme. The "Open tracker"
// URL button is static in the template, so no button params are sent here.
const body = {
  messaging_product: "whatsapp",
  to: WA_TO,
  type: "template",
  template: {
    name: TEMPLATE,
    language: { code: LANG },
    components: [{
      type: "body",
      parameters: [
        { type: "text", text: String(dayIdx + 1) },
        { type: "text", text: D.th }
      ]
    }]
  }
};

const r = await fetch(`https://graph.facebook.com/v21.0/${WA_PHONE_ID}/messages`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${WA_TOKEN}`, "Content-Type": "application/json" },
  body: JSON.stringify(body)
});
const out = await r.json();
if (!r.ok) { console.error("WhatsApp API error:", JSON.stringify(out)); process.exit(1); }
console.log("Sent day", dayIdx + 1, "- message id:", out.messages?.[0]?.id);
