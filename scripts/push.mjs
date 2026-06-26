// Sends today's plan items to Telegram. Run by GitHub Actions every morning.
// Needs env: TELEGRAM_TOKEN, TELEGRAM_CHAT_ID
import { readFile } from "node:fs/promises";

const TOKEN = process.env.TELEGRAM_TOKEN;
const CHAT = process.env.TELEGRAM_CHAT_ID;
if (!TOKEN || !CHAT) { console.error("Missing TELEGRAM_TOKEN / TELEGRAM_CHAT_ID"); process.exit(1); }

const data = JSON.parse(await readFile(new URL("../curriculum.json", import.meta.url)));
const { days, res, meta } = data;

const tz = meta.timezone || "Asia/Kolkata";
const todayStr = new Intl.DateTimeFormat("en-CA", { timeZone: tz }).format(new Date()); // YYYY-MM-DD
const dayIdx = Math.round((Date.parse(todayStr) - Date.parse(meta.startDate)) / 86400000);

const TAG = { dsa:"DSA", fe:"FE", mc:"BUILD", fsd:"FE-SD", sd:"BACKEND", beh:"STORY", ai:"AI", task:"TASK", mock:"MOCK" };
const esc = s => s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");

let msg;
if (dayIdx < 0) {
  const d = new Date(Date.parse(meta.startDate)).toDateString();
  msg = `🌅 <b>Switch Plan</b>\nStarts on <b>${d}</b>. Rest up — the grind begins soon. 💪`;
} else if (dayIdx >= days.length) {
  msg = `🎉 <b>Plan complete.</b> You're interview-ready. Go get the offer.`;
} else {
  const D = days[dayIdx];
  let lines = D.it.map(([cat, text, key]) => {
    const r = res[key];
    const link = r ? ` — <a href="${r.u}">${esc(r.l)}</a>` : "";
    return `• <b>[${TAG[cat] || cat}]</b> ${esc(text)}${link}`;
  });
  msg = `🌅 <b>Day ${dayIdx + 1} · Week ${D.w} · ${D.d}</b>\n<i>${esc(D.th)}</i>\n\n${lines.join("\n")}\n\n` +
        `Open the tracker to check these off ✅`;
}

const r = await fetch(`https://api.telegram.org/bot${TOKEN}/sendMessage`, {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ chat_id: CHAT, text: msg, parse_mode: "HTML", disable_web_page_preview: true })
});
const out = await r.json();
if (!out.ok) { console.error("Telegram error:", out); process.exit(1); }
console.log("Sent day", dayIdx + 1);
