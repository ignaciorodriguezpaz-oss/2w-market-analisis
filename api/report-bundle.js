const { zipBuffer } = require('../lib/zip');

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

async function siteRequest(url) {
  return fetch(url, { headers: {
    'x-ami-report-secret': process.env.AMI_REPORT_SYNC_SECRET || '',
    'OAI-Sites-Authorization': `Bearer ${process.env.AMI_SITE_BYPASS_TOKEN || ''}`
  } });
}

async function handler(req, res) {
  res.setHeader('Cache-Control', 'private, no-store');
  if (req.method !== 'GET') { res.setHeader('Allow', 'GET'); return res.status(405).json({ error: 'Método no permitido.' }); }
  try {
    if (!(await authorized(req))) return res.status(401).json({ error: 'Tu sesión no está autorizada. Volvé a ingresar.' });
    const runId = req.query.runId;
    if (typeof runId !== 'string' || !/^[0-9a-f-]{36}$/i.test(runId)) return res.status(400).json({ error: 'Descarga inválida.' });

    const manifestResponse = await siteRequest(new URL(SITE));
    if (!manifestResponse.ok) return res.status(manifestResponse.status).json(await manifestResponse.json().catch(() => ({ error: 'No se encontró el reporte.' })));
    const manifest = await manifestResponse.json();
    if (manifest.runId !== runId || !Array.isArray(manifest.files) || manifest.files.length === 0) return res.status(404).json({ error: 'El reporte ya no está disponible. Actualizalo otra vez.' });

    const files = await Promise.all(manifest.files.map(async (file) => {
      if (!/^[a-z0-9-]{1,80}$/i.test(file.id) || !/^[a-zA-Z0-9_.-]{1,180}$/.test(file.filename)) throw new Error('Invalid report file metadata.');
      const url = new URL(SITE);
      url.searchParams.set('run', runId);
      url.searchParams.set('file', file.id);
      const response = await siteRequest(url);
      if (!response.ok) throw new Error(`Report file fetch failed (${response.status}).`);
      return { name: file.filename, data: Buffer.from(await response.arrayBuffer()) };
    }));

    const archive = zipBuffer(files);
    const date = String(manifest.date || '').replace(/[^0-9-]/g, '') || 'reporte';
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="AMI_reportes_${date}.zip"`);
    res.setHeader('Content-Length', String(archive.length));
    res.setHeader('X-Content-Type-Options', 'nosniff');
    return res.status(200).send(archive);
  } catch (error) {
    console.error('report-bundle error', error instanceof Error ? error.message : 'unknown');
    return res.status(502).json({ error: 'No se pudo preparar el ZIP. Los archivos individuales siguen disponibles.' });
  }
}

module.exports = handler;
