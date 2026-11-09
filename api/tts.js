// Neural read-aloud for the library reader: GET /api/tts?v=<voice>&t=<text> -> audio/mpeg
// Talks to the same read-aloud service the Edge browser uses (unofficial; it can change or stop
// without notice, so the reader falls back to the device voice when this answers an error).
// Responses are cached by the CDN, so each sentence is only synthesized once.

const crypto = require('crypto');
const WebSocket = require('ws');
const { over } = require('./_limit');

const TOKEN = '6A5AA1D4EAFF4E9FB37E23D68491D6F4';
const CHROMIUM = '130.0.2849.68';
const WIN_EPOCH = 11644473600;
const VOICES = {
  'vi-HoaiMy': 'vi-VN-HoaiMyNeural',
  'vi-NamMinh': 'vi-VN-NamMinhNeural',
  'en-Aria': 'en-US-AriaNeural',
  'en-Andrew': 'en-US-AndrewNeural',
  'en-Sonia': 'en-GB-SoniaNeural',
  'en-Ryan': 'en-GB-RyanNeural'
};
const MAX_CHARS = 400;

function gec(skewSec) {
  let t = Math.floor(Date.now() / 1000) + (skewSec || 0) + WIN_EPOCH;
  t -= t % 300;
  return crypto.createHash('sha256').update(`${t * 1e7}${TOKEN}`, 'ascii').digest('hex').toUpperCase();
}

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const stamp = () => new Date().toUTCString().replace('GMT', 'GMT+0000 (Coordinated Universal Time)');
const uuid = () => crypto.randomUUID().replace(/-/g, '');

function synth(voice, text, skewSec) {
  return new Promise((resolve, reject) => {
    const url = `wss://speech.platform.bing.com/consumer/speech/synthesize/readaloud/edge/v1?TrustedClientToken=${TOKEN}` +
      `&Sec-MS-GEC=${gec(skewSec)}&Sec-MS-GEC-Version=1-${CHROMIUM}&ConnectionId=${uuid()}`;
    const ws = new WebSocket(url, {
      headers: {
        Pragma: 'no-cache',
        'Cache-Control': 'no-cache',
        Origin: 'chrome-extension://jdiccldimpdaibmpdkjnbmckianbfold',
        'User-Agent': `Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/${CHROMIUM.split('.')[0]}.0.0.0 Safari/537.36 Edg/${CHROMIUM.split('.')[0]}.0.0.0`,
        'Accept-Language': 'en-US,en;q=0.9'
      }
    });
    const parts = [];
    const timer = setTimeout(() => { try { ws.terminate(); } catch (_) {} reject(new Error('timeout')); }, 9000);
    const fail = (e) => { clearTimeout(timer); reject(e); };
    ws.on('error', fail);
    ws.on('unexpected-response', (_req, res) => {
      const err = new Error('http ' + res.statusCode);
      err.status = res.statusCode;
      err.date = res.headers && res.headers.date;
      fail(err);
    });
    ws.on('open', () => {
      ws.send(`X-Timestamp:${stamp()}\r\nContent-Type:application/json; charset=utf-8\r\nPath:speech.config\r\n\r\n` +
        '{"context":{"synthesis":{"audio":{"metadataoptions":{"sentenceBoundaryEnabled":"false","wordBoundaryEnabled":"false"},"outputFormat":"audio-24khz-48kbitrate-mono-mp3"}}}}');
      const lang = voice.slice(0, 5);
      ws.send(`X-RequestId:${uuid()}\r\nContent-Type:application/ssml+xml\r\nX-Timestamp:${stamp()}Z\r\nPath:ssml\r\n\r\n` +
        `<speak version='1.0' xmlns='http://www.w3.org/2001/10/synthesis' xml:lang='${lang}'><voice name='${voice}'>` +
        `<prosody pitch='+0Hz' rate='+0%' volume='+0%'>${esc(text)}</prosody></voice></speak>`);
    });
    ws.on('message', (data, isBinary) => {
      if (isBinary) {
        const buf = Buffer.from(data);
        const headLen = buf.readUInt16BE(0);
        const head = buf.slice(2, 2 + headLen).toString();
        if (/Path:audio/.test(head)) parts.push(buf.slice(2 + headLen));
      } else if (/Path:turn\.end/.test(data.toString())) {
        clearTimeout(timer);
        try { ws.close(); } catch (_) {}
        const audio = Buffer.concat(parts);
        audio.length ? resolve(audio) : reject(new Error('empty'));
      }
    });
    ws.on('close', () => { if (!parts.length) fail(new Error('closed')); });
  });
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') { res.statusCode = 405; res.setHeader('Allow', 'GET'); return res.end('Method Not Allowed'); }
  const q = req.query || {};
  const voice = VOICES[String(q.v || '')];
  const text = String(q.t || '').replace(/\s+/g, ' ').trim();
  if (!voice || !text || text.length > MAX_CHARS) { res.statusCode = 400; return res.end('Bad request'); }
  if (await over(req, 'tts', 90, 60)) { res.statusCode = 429; return res.end('Too many requests'); }

  try {
    let audio;
    try { audio = await synth(voice, text, 0); }
    catch (e) {
      // 403 usually means our clock is off from the service's: retry once using its Date header
      if (e.status === 403 && e.date) audio = await synth(voice, text, Math.round((Date.parse(e.date) - Date.now()) / 1000));
      else throw e;
    }
    res.statusCode = 200;
    res.setHeader('Content-Type', 'audio/mpeg');
    res.setHeader('Content-Length', String(audio.length));
    res.setHeader('Cache-Control', 'public, max-age=86400, s-maxage=31536000, immutable');
    return res.end(audio);
  } catch (_) {
    res.statusCode = 502;
    res.setHeader('Cache-Control', 'no-store');
    return res.end('TTS unavailable');
  }
};
