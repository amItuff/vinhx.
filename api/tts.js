// Read-aloud voice for /library, backed by a VieNeu-TTS server (https://github.com/pnnbao97/VieNeu-TTS,
// Apache 2.0). That server speaks the OpenAI "/v1/audio/speech" format; this function sits in front of it
// so the server address and key stay in environment variables and visitors are rate limited.
//
//   VIENEU_TTS_URL   https://your-server (no path). Unset = the feature is off and the library keeps
//                    using the voices built into the visitor's browser.
//   VIENEU_API_KEY   optional Bearer key, if the server was started with VIENEU_API_KEY
//   VIENEU_VOICE     optional default voice name (see GET /v1/voices on the server)
//
// GET  /api/tts            -> { configured, voices: [...] }
// POST /api/tts {text,voice} -> audio/wav (mono, 24 kHz)

const { hit } = require('./_limit');

const BASE = (process.env.VIENEU_TTS_URL || '').replace(/\/+$/, '');
const KEY = process.env.VIENEU_API_KEY || '';
const DEFAULT_VOICE = process.env.VIENEU_VOICE || '';
const MODEL = 'vieneu-v3-turbo';
const RATE = 24000;
const MAX_CHARS = 400;
const MAX_PCM = 4000000; // stays under the 4.5 MB response limit once the WAV header is added
const MINUTE = [30, 60];  // requests per IP per minute
const DAY = [1500, 86400]; // and per day

const authHeaders = () => (KEY ? { Authorization: `Bearer ${KEY}` } : {});
let voiceCache = { at: 0, list: [] };

async function voices() {
  if (Date.now() - voiceCache.at < 10 * 60 * 1000 && voiceCache.list.length) return voiceCache.list;
  try {
    const r = await fetch(BASE + '/v1/voices', { headers: authHeaders(), signal: AbortSignal.timeout(6000) });
    if (!r.ok) throw new Error(String(r.status));
    const j = await r.json();
    const rows = Array.isArray(j) ? j : Array.isArray(j.voices) ? j.voices : Array.isArray(j.data) ? j.data : [];
    const list = rows.map((v) => (typeof v === 'string' ? v : v && (v.name || v.id || v.voice))).filter((n) => typeof n === 'string' && n.length < 60).slice(0, 60);
    voiceCache = { at: Date.now(), list };
    return list;
  } catch (_) {
    return voiceCache.list;
  }
}

function wav(pcm, rate) {
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + pcm.length, 4); h.write('WAVE', 8);
  h.write('fmt ', 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(1, 22);
  h.writeUInt32LE(rate, 24); h.writeUInt32LE(rate * 2, 28); h.writeUInt16LE(2, 32); h.writeUInt16LE(16, 34);
  h.write('data', 36); h.writeUInt32LE(pcm.length, 40);
  return Buffer.concat([h, pcm]);
}

function body(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  if (typeof req.body === 'string') return JSON.parse(req.body);
  return {};
}

module.exports = async (req, res) => {
  res.setHeader('Cache-Control', 'no-store');
  const json = (code, obj) => res.status(code).json(obj);

  if (req.method === 'GET') {
    if (!BASE) return json(200, { configured: false, voices: [] });
    return json(200, { configured: true, voices: await voices(), default: DEFAULT_VOICE });
  }
  if (req.method !== 'POST') { res.setHeader('Allow', 'GET, POST'); return json(405, { error: 'method' }); }
  if (!BASE) return json(503, { error: 'not_configured' });

  try {
    const minute = await hit(req, 'tts-m', MINUTE[0], MINUTE[1]);
    const day = minute ? 0 : await hit(req, 'tts-d', DAY[0], DAY[1]);
    const wait = minute || day;
    if (wait) { res.setHeader('Retry-After', String(wait)); return json(429, { error: 'rate_limited', retry: wait }); }

    const b = body(req);
    const text = String(b.text || '').replace(/\s+/g, ' ').trim();
    if (!text) return json(400, { error: 'empty' });
    if (text.length > MAX_CHARS) return json(400, { error: 'too_long' });
    let voice = typeof b.voice === 'string' ? b.voice.trim() : '';
    if (voice) {
      const known = await voices();
      if (known.length && !known.includes(voice)) voice = ''; // never forward arbitrary names to the server
    }
    voice = voice || DEFAULT_VOICE;

    const payload = { model: MODEL, input: text, response_format: 'pcm', sample_rate: RATE };
    if (voice) payload.voice = voice;
    const up = await fetch(BASE + '/v1/audio/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(40000)
    });
    if (!up.ok) return json(up.status === 429 ? 503 : 502, { error: 'upstream', status: up.status });
    const pcm = Buffer.from(await up.arrayBuffer());
    if (!pcm.length || pcm.length > MAX_PCM) return json(502, { error: 'upstream' });

    res.setHeader('Content-Type', 'audio/wav');
    res.status(200).end(wav(pcm.subarray(0, pcm.length - (pcm.length % 2)), RATE));
  } catch (_) {
    return json(504, { error: 'timeout' });
  }
};
