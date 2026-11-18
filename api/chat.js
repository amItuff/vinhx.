// Chat box backend: one endpoint, three providers (Gemini, ChatGPT, Claude).
// GET  /api/chat                          -> { gemini: true, openai: false, claude: false }  (which keys are set)
// POST /api/chat { provider, messages }   -> { text }
// Keys live only in environment variables (GEMINI_API_KEY, OPENAI_API_KEY, ANTHROPIC_API_KEY); the browser never sees them.

const { over } = require('./_limit');

const MAX_MSGS = 12;
const MAX_CHARS = 2000;
const SYSTEM = 'Bạn là trợ lý trên website cá nhân của vinhx (lập trình viên Discord bot, script Python, web tối giản). Trả lời ngắn gọn, thân thiện, cùng ngôn ngữ với người dùng.';

const KEYS = {
  gemini: () => process.env.GEMINI_API_KEY,
  openai: () => process.env.OPENAI_API_KEY,
  claude: () => process.env.ANTHROPIC_API_KEY
};

async function post(url, headers, body) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 25000);
  try {
    const r = await fetch(url, { method: 'POST', signal: ctl.signal, headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });
    if (!r.ok) throw new Error('upstream ' + r.status);
    return await r.json();
  } finally { clearTimeout(timer); }
}

const CALL = {
  async gemini(msgs) {
    const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash';
    const j = await post(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
      { 'x-goog-api-key': KEYS.gemini() },
      { systemInstruction: { parts: [{ text: SYSTEM }] }, contents: msgs.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })) });
    return ((j.candidates || [])[0]?.content?.parts || []).map((p) => p.text || '').join('');
  },
  async openai(msgs) {
    const j = await post('https://api.openai.com/v1/chat/completions',
      { Authorization: 'Bearer ' + KEYS.openai() },
      { model: process.env.OPENAI_MODEL || 'gpt-4o-mini', messages: [{ role: 'system', content: SYSTEM }, ...msgs] });
    return j.choices?.[0]?.message?.content || '';
  },
  async claude(msgs) {
    const j = await post('https://api.anthropic.com/v1/messages',
      { 'x-api-key': KEYS.claude(), 'anthropic-version': '2023-06-01' },
      { model: process.env.ANTHROPIC_MODEL || 'claude-haiku-5-5', max_tokens: 1024, system: SYSTEM, messages: msgs });
    return (j.content || []).map((c) => c.text || '').join('');
  }
};

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method === 'GET') {
    return res.end(JSON.stringify({ gemini: !!KEYS.gemini(), openai: !!KEYS.openai(), claude: !!KEYS.claude() }));
  }
  if (req.method !== 'POST') { res.statusCode = 405; res.setHeader('Allow', 'GET, POST'); return res.end('{}'); }

  let data = req.body;
  if (typeof data === 'string') { try { data = JSON.parse(data); } catch (_) { data = null; } }
  const provider = data && data.provider;
  let msgs = data && data.messages;
  if (!CALL[provider] || !Array.isArray(msgs) || !msgs.length) { res.statusCode = 400; return res.end('{"error":"bad"}'); }
  msgs = msgs.slice(-MAX_MSGS);
  if (msgs.some((m) => !m || (m.role !== 'user' && m.role !== 'assistant') || typeof m.content !== 'string' || !m.content.trim() || m.content.length > MAX_CHARS) || msgs[msgs.length - 1].role !== 'user') {
    res.statusCode = 400; return res.end('{"error":"bad"}');
  }
  if (!KEYS[provider]()) { res.statusCode = 503; return res.end('{"error":"off"}'); }
  if (await over(req, 'chat', 12, 60)) { res.statusCode = 429; return res.end('{"error":"rate"}'); }

  try {
    const text = (await CALL[provider](msgs.map((m) => ({ role: m.role, content: m.content })))).trim();
    return res.end(JSON.stringify({ text: text || '…' }));
  } catch (_) {
    res.statusCode = 502;
    return res.end('{"error":"upstream"}');
  }
};
