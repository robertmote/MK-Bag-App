// Serves index.html and forwards its AI prompts to Claude, so the API key never reaches the browser.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname } from 'node:path';
import Anthropic from '@anthropic-ai/sdk';

const PORT = 3000;
const MODEL = 'claude-opus-5-5';
const client = new Anthropic(); // reads ANTHROPIC_API_KEY (from .env via `npm start`)

async function ask(prompt) {
  if (!process.env.ANTHROPIC_API_KEY) throw new Error('No API key yet. Copy .env.example to .env, add your key, then restart with "npm start".');
  const messages = [{ role: 'user', content: prompt }];
  for (let i = 0; i < 5; i++) {
    const res = await client.beta.messages.create({
      model: MODEL,
      max_tokens: 16000,
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default', // if Claude declines, the API retries on a fallback model
      tools: [{ type: 'web_search_20260209', name: 'web_search', max_uses: 10 }],
      messages,
    });
    // Long web-search turns pause; re-send to let the server resume.
    if (res.stop_reason === 'pause_turn') { messages.push({ role: 'assistant', content: res.content }); continue; }
    if (res.stop_reason === 'refusal') throw new Error('Claude declined this request.');
    return res.content.filter(b => b.type === 'text').map(b => b.text).join('');
  }
  throw new Error('The search took too long. Please try again.');
}

// Only the front end is public. The pattern has no "." in folder names, so ../ can't escape to server.mjs or .env.
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml', '.png': 'image/png' };
const TOP_LEVEL = new Set(['/styles.css', '/icon.svg', '/apple-touch-icon.png']);
function publicFile(p) {
  if (p === '/' || p === '/index.html') return 'index.html';
  if (TOP_LEVEL.has(p) || /^\/js\/[\w/-]+\.js$/.test(p)) return p.slice(1);
}

// DNS rebinding defence: a hostile page re-pointed at 127.0.0.1 still sends its own domain as Host/Origin.
const ALLOWED_HOSTS = new Set([`localhost:${PORT}`, `127.0.0.1:${PORT}`]);
const ALLOWED_ORIGINS = new Set([...ALLOWED_HOSTS].map(h => `http://${h}`));
let inFlight = 0; // caps simultaneous Claude calls, so a runaway loop can't pile up cost

http.createServer(async (req, res) => {
  const send = (status, type, body) => { res.writeHead(status, { 'Content-Type': type, 'X-Content-Type-Options': 'nosniff' }); res.end(body); };
  if (!ALLOWED_HOSTS.has(req.headers.host)) return send(421, 'text/plain', 'Misdirected request');
  try {
    const file = req.method === 'GET' && publicFile(new URL(req.url, 'http://x').pathname);
    if (file) return send(200, TYPES[extname(file)], await readFile(new URL('./' + file, import.meta.url)));
    if (req.method === 'POST' && req.url === '/api/ask') {
      // Other websites can't send a JSON content type here without a CORS preflight (which we never answer),
      // so this blocks them from spending your API credits via a hidden form in your browser.
      if (!req.headers['content-type']?.startsWith('application/json')) return send(415, 'application/json', '{"error":"Expected JSON"}');
      if (req.headers.origin && !ALLOWED_ORIGINS.has(req.headers.origin)) return send(403, 'application/json', '{"error":"Forbidden origin"}');
      let body = '';
      // The app's real prompts are under 3 KB
      for await (const chunk of req) { body += chunk; if (body.length > 20_000) return send(413, 'application/json', '{"error":"Request too large"}'); }
      let prompt;
      try { ({ prompt } = JSON.parse(body)); } catch { return send(400, 'application/json', '{"error":"Invalid JSON"}'); }
      if (typeof prompt !== 'string' || !prompt) return send(400, 'application/json', '{"error":"Missing prompt"}');
      if (inFlight >= 2) return send(429, 'application/json', '{"error":"Busy with another AI request. Try again shortly."}');
      inFlight++;
      try { return send(200, 'application/json', JSON.stringify({ text: await ask(prompt) })); }
      finally { inFlight--; }
    }
    send(404, 'text/plain', 'Not found');
  } catch (e) {
    if (e.code === 'ENOENT') return send(404, 'text/plain', 'Not found');
    console.error(e);
    const msg = e instanceof Anthropic.AuthenticationError ? 'API key missing or invalid. Check ANTHROPIC_API_KEY in .env.'
      : e instanceof Anthropic.RateLimitError ? 'Rate limited by the Claude API. Wait a minute and try again.'
      : e.message;
    send(e.status || 500, 'application/json', JSON.stringify({ error: msg }));
  }
}).listen(PORT, '127.0.0.1', () => console.log(`MK App running at http://localhost:${PORT}`));
