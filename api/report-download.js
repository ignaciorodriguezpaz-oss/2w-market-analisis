const { Readable } = require('node:stream');
const { pipeline } = require('node:stream/promises');

const SITE = 'https://argentina-motorcycle-intelligence.proudgull17.chatgpt.site/api/integrations/reports';
const SUPABASE_URL = 'https://ijaqabjjhsuvovtfffit.supabase.co';
const SUPABASE_KEY = 'sb_publishable_uCbjOGhQR-efd9Fi_6et2w_6olQoisr';

async function authorized(req) {
  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  if (!token) return false;
  const userRes = await fetch(`${SUPABASE_URL}/auth/v1/user`, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${token}` } });
  if (!userRes.ok) return false;
  const user = await userRes.json();
  const profileRes = await fetch(`${SUPABASE_URL}/rest/v1/app_users?select=active,must_change_password&id=eq.${encodeURIComponent(user.id)}&limit=1`, { headers: { apikey: SUPABASE_KEY, authorization: `Bearer ${token}` } });
  if (!profileRes.ok) return false;
  const [profile] = await profileRes.json();
  return !!profile?.active && !profile?.must_change_password;
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido.' }); }
  try {
    if (!(await authorized(req))) return res.status(401).json({ error: 'Tu sesión no está autorizada. Volvé a ingresar.' });
    const { runId, fileId } = req.query;
    if (typeof runId !== 'string' || !/^[0-9a-f-]{36}$/i.test(runId) || typeof fileId !== 'string' || !/^[a-z0-9-]{1,80}$/i.test(fileId)) return res.status(400).json({ error: 'Descarga inválida.' });
    const url = new URL(SITE);
    url.searchParams.set('run', runId);
    url.searchParams.set('file', fileId);
    const response = await fetch(url, { headers: { 'x-ami-report-secret': process.env.AMI_REPORT_SYNC_SECRET || '', 'OAI-Sites-Authorization': `Bearer ${process.env.AMI_SITE_BYPASS_TOKEN || ''}` } });
    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      return res.status(response.status).json(body);
    }
    res.statusCode = 200;
    for (const name of ['content-type', 'content-disposition', 'content-length', 'x-content-type-options']) {
      const value = response.headers.get(name);
      if (value) res.setHeader(name, value);
    }
    await pipeline(Readable.fromWeb(response.body), res);
  } catch (error) {
    console.error('report-download error', error instanceof Error ? error.message : 'unknown');
    if (!res.headersSent) res.status(502).json({ error: 'No se pudo descargar el archivo. Actualizá el reporte e intentá otra vez.' });
  }
}

module.exports = handler;
