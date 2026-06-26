// Sends today's plan to WhatsApp via CallMeBot (free). Run by GitHub Actions each morning.
// Needs env: CALLMEBOT_PHONE (your WhatsApp number incl. country code), CALLMEBOT_APIKEY
import { readFile } from "node:fs/promises";

const PHONE = process.env.CALLMEBOT_PHONE;
const APIKEY = process.env.CALLMEBOT_APIKEY;
if (!PHONE || !APIKEY) { console.error("Missing CALLMEBOT_PHONE / CALLMEBOT_APIKEY"); process.exit(1); }

const data = JSON.parse(await readFile(new URL("../curriculum.json", import.meta.url)));
const { days, meta } = data;

const tz = meta.timezone || "Asia/Kolkata";
const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); // YYYY-MM-DD
const dayIdx = Math.round((Date.parse(todayStr) - Date.parse(meta.startDate)) / 86400000);

const TAG = { dsa:"DSA", fe:"FE", mc:"BUILD", fsd:"FE-SD", sd:"BACKEND", beh:"STORY", ai:"AI", task:"TASK", mock:"MOCK" };

let msg;
if (dayIdx < 0) {
  msg = `🌅 *Switch Plan*\nStarts ${new Date(Date.parse(meta.startDate)).toDateString()}. Rest up — the grind begins soon. 💪`;
} else if (dayIdx >= days.length) {
  msg = `🎉 *Plan complete.* You're interview-ready. Go get the offer.`;
} else {
  const D = days[dayIdx];
  const lines = D.it.map(([cat, text]) => `• *[${TAG[cat] || cat}]* ${text}`);
  msg = `🌅 *Day ${dayIdx + 1} · Week ${D.w} · ${D.d}*\n_${D.th}_\n\n${lines.join("\n")}\n\n` +
        `▶ Open tracker (links + check-off): ${meta.appUrl}`;
}

const url = `https://api.callmebot.com/whatsapp.php?phone=${encodeURIComponent(PHONE)}&text=${encodeURIComponent(msg)}&apikey=${encodeURIComponent(APIKEY)}`;
const r = await fetch(url);
const body = await r.text();
if (!r.ok) { console.error("CallMeBot HTTP", r.status, body.slice(0, 300)); process.exit(1); }
console.log("Sent day", dayIdx + 1, "-", body.slice(0, 120));
