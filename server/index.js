// Minimal Node.js backend for the WebLSH lead form.
// - Accepts POST /api/contact
// - Validates + rate-limits submissions
// - Appends every lead to server/leads.json (simple durable log you can open anytime)
// - Notifies you on Telegram instantly (free, no mail server needed) if TELEGRAM_* env vars are set
// - Optionally also emails the lead via SMTP (nodemailer), if SMTP_* env vars are set
// - Serves the built frontend (dist/) too, so one Node process is the whole app —
//   this is what lets it run as a single Azure App Service.
//
// Run with:  npm run server   (after `npm install` and copying .env.example to .env)

import 'dotenv/config';
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DIST_DIR = path.join(__dirname, '..', 'dist');
const LEADS_FILE = path.join(__dirname, 'leads.json');
const PORT = process.env.PORT || 8787;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || '*';

const MIME = {
  '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg',
  '.woff2': 'font/woff2', '.json': 'application/json',
};

// --- tiny in-memory rate limiter: 5 submissions / 10 minutes / IP ---
const hits = new Map();
function isRateLimited(ip) {
  const now = Date.now();
  const windowMs = 10 * 60 * 1000;
  const arr = (hits.get(ip) || []).filter((t) => now - t < windowMs);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 5;
}

async function appendLead(lead) {
  let existing = [];
  try {
    existing = JSON.parse(await fs.readFile(LEADS_FILE, 'utf-8'));
  } catch (e) { /* file doesn't exist yet */ }
  existing.push(lead);
  await fs.writeFile(LEADS_FILE, JSON.stringify(existing, null, 2));
}

// Escape characters that have special meaning in Telegram's (legacy) Markdown
// parse mode, so a visitor typing "_test_" or "*bold*" can't break the message.
function escMd(text) {
  return String(text ?? '').replace(/([_*`\[\]])/g, '\\$1');
}

function leadText(lead) {
  const name = lead.name || [lead.firstName, lead.lastName].filter(Boolean).join(' ');
  const when = lead.submittedAt || lead.receivedAt || new Date().toISOString();
  return [
    '📩 *New Request*',
    '',
    `👤 *Name:* ${escMd(name) || '—'}`,
    `📧 *Email:* ${escMd(lead.email) || '—'}`,
    `📱 *Phone:* ${escMd(lead.phone) || '—'}`,
    `🛠 *Service:* ${escMd(lead.service) || '—'}`,
    `💬 *Message:* ${escMd(lead.message) || '(none)'}`,
    `⏰ *Date:* ${escMd(when)}`,
    lead.reference ? `\n🔖 *Ref:* ${escMd(lead.reference)}` : '',
  ].filter(Boolean).join('\n');
}

// --- Telegram: free, instant push notification, no mail server required ---
// Setup: message @BotFather on Telegram -> /newbot -> copy the token into
// TELEGRAM_BOT_TOKEN. Then message your new bot once, and open
// https://api.telegram.org/bot<TOKEN>/getUpdates in a browser to find your
// numeric chat id -> put it in TELEGRAM_CHAT_ID.
async function sendTelegram(lead) {
  const { TELEGRAM_BOT_TOKEN, TELEGRAM_CHAT_ID } = process.env;
  if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
    console.log('[telegram] not configured — skipping. Lead saved to leads.json only.');
    return;
  }
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: TELEGRAM_CHAT_ID, text: leadText(lead), parse_mode: 'Markdown' }),
  });
  if (!res.ok) throw new Error(`Telegram API responded ${res.status}`);
}

async function sendEmail(lead) {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, LEAD_TO_EMAIL } = process.env;
  if (!SMTP_HOST || !LEAD_TO_EMAIL) return; // optional channel, silently skip if unset
  // Lazy-import so the server still runs if nodemailer isn't installed yet.
  const nodemailer = await import('nodemailer').then((m) => m.default);
  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: Number(SMTP_PORT) || 587,
    secure: Number(SMTP_PORT) === 465,
    auth: SMTP_USER ? { user: SMTP_USER, pass: SMTP_PASS } : undefined,
  });

  await transporter.sendMail({
    from: `"WebLSH Website" <${SMTP_USER || 'no-reply@weblsh.com'}>`,
    to: LEAD_TO_EMAIL,
    replyTo: lead.email,
    subject: `New lead: ${lead.service} — ${lead.name}`,
    text: leadText(lead),
  });
}

function setCors(res) {
  res.setHeader('Access-Control-Allow-Origin', ALLOWED_ORIGIN);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
}

async function serveStatic(req, res) {
  try {
    let reqPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(DIST_DIR, reqPath);
    // SPA fallback: unknown non-file routes -> index.html
    try {
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) filePath = path.join(filePath, 'index.html');
    } catch {
      filePath = path.join(DIST_DIR, 'index.html');
    }
    const data = await fs.readFile(filePath);
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  } catch (err) {
    res.writeHead(404); res.end('Not found');
  }
}

const server = http.createServer(async (req, res) => {
  setCors(res);

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }

  if (req.method === 'POST' && req.url === '/api/contact') {
    const ip = req.socket.remoteAddress || 'unknown';
    if (isRateLimited(ip)) {
      res.writeHead(429, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Too many requests. Please try again later.' }));
      return;
    }

    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', async () => {
      try {
        const lead = JSON.parse(body || '{}');

        // honeypot: bots fill hidden fields, humans never see them
        if (lead.company) { res.writeHead(200); res.end(JSON.stringify({ ok: true })); return; }

        const hasName = lead.name || lead.firstName || lead.lastName;
        if (!hasName || !lead.email) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'Name and email are required.' }));
          return;
        }

        await appendLead({ ...lead, ip, receivedAt: new Date().toISOString() });
        sendTelegram(lead).catch((err) => console.error('[telegram] failed:', err.message));
        sendEmail(lead).catch((err) => console.error('[email] failed:', err.message));

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (err) {
        console.error(err);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Server error.' }));
      }
    });
    return;
  }

  if (req.method === 'GET') { await serveStatic(req, res); return; }

  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => console.log(`WebLSH server listening on http://localhost:${PORT}`));
