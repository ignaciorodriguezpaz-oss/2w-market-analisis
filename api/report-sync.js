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
  if (!['GET', 'POST'].includes(req.method)) { res.setHeader('Allow', 'GET, POST'); return res.status(405).json({ error: 'Método no permitido.' }); }
  try {
    if (!(await authorized(req))) return res.status(401).json({ error: 'Tu sesión no está autorizada. Volvé a ingresar.' });
    const headers = { 'x-ami-report-secret': process.env.AMI_REPORT_SYNC_SECRET || '', 'OAI-Sites-Authorization': `Bearer ${process.env.AMI_SITE_BYPASS_TOKEN || ''}` };
    const url = new URL(SITE);
    if (req.method === 'POST') {
      const body = typeof req.body === 'string' ? JSON.parse(req.body || '{}') : (req.body || {});
      const response = await fetch(url, { method: 'POST', headers: { ...headers, 'content-type': 'application/json' }, body: JSON.stringify({ kind: body.kind }) });
      const data = await response.json();
      return res.status(response.status).json(data);
    }
    const response = await fetch(url, { headers });
    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('report-sync error', error instanceof Error ? error.message : 'unknown');
    return res.status(502).json({ error: 'No se pudo consultar el Site. Probá de nuevo en unos minutos.' });
  }
}

module.exports = handler;
