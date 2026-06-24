// Cloudflare Pages Function: nimmt gemeldete Fehler entgegen und legt sie im KV-Store ab.
// Eingang der automatisierten Triage-Pipeline (siehe output/_tools/REPORTS_AGENT.md).
const CORS = { 'Access-Control-Allow-Origin': '*', 'Content-Type': 'application/json' };
function s(v, n) { return (v == null ? '' : String(v)).slice(0, n).trim(); }

export async function onRequestOptions() {
  return new Response(null, { headers: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type'
  }});
}

export async function onRequestPost({ request, env }) {
  try {
    if (!env.REPORTS) return new Response(JSON.stringify({ ok: false, error: 'no-store' }), { status: 500, headers: CORS });
    const d = await request.json().catch(() => ({}));
    const message = s(d.message, 4000);
    if (!message) return new Response(JSON.stringify({ ok: false, error: 'empty' }), { status: 400, headers: CORS });
    if (s(d.hp, 50)) return new Response(JSON.stringify({ ok: true }), { headers: CORS }); // Honeypot -> still ok
    const rec = {
      ts: new Date().toISOString(),
      sem: s(d.sem, 8) || 's1',
      qid: s(d.qid, 40), mod: s(d.mod, 8), mw: s(d.mw, 8), lz: s(d.lz, 40),
      q: s(d.q, 600), src: s(d.src, 200),
      message, mail: s(d.mail, 120),
      status: 'new'
    };
    const key = 'report:' + rec.ts + ':' + Math.random().toString(36).slice(2, 8);
    await env.REPORTS.put(key, JSON.stringify(rec), { metadata: { status: 'new', qid: rec.qid } });
    return new Response(JSON.stringify({ ok: true }), { headers: CORS });
  } catch (e) {
    return new Response(JSON.stringify({ ok: false, error: 'server' }), { status: 500, headers: CORS });
  }
}
