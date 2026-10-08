// Serves index.html and forwards its AI prompts to Claude, so the API key never reaches the browser.
import http from 'node:http';
import { readFile } from 'node:fs/promises';
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

http.createServer(async (req, res) => {
  const send = (status, type, body) => { res.writeHead(status, { 'Content-Type': type }); res.end(body); };
  try {
    if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
      return send(200, 'text/html; charset=utf-8', await readFile(new URL('./index.html', import.meta.url)));
    }
    if (req.method === 'POST' && req.url === '/api/ask') {
      let body = '';
      for await (const chunk of req) { body += chunk; if (body.length > 100_000) return send(413, 'application/json', '{"error":"Request too large"}'); }
      const { prompt } = JSON.parse(body);
      if (typeof prompt !== 'string' || !prompt) return send(400, 'application/json', '{"error":"Missing prompt"}');
      return send(200, 'application/json', JSON.stringify({ text: await ask(prompt) }));
    }
    send(404, 'text/plain', 'Not found');
  } catch (e) {
    console.error(e);
    const msg = e instanceof Anthropic.AuthenticationError ? 'API key missing or invalid. Check ANTHROPIC_API_KEY in .env.'
      : e instanceof Anthropic.RateLimitError ? 'Rate limited by the Claude API. Wait a minute and try again.'
      : e.message;
    send(e.status || 500, 'application/json', JSON.stringify({ error: msg }));
  }
}).listen(PORT, '127.0.0.1', () => console.log(`MK App running at http://localhost:${PORT}`));
