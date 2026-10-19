(() => {
  const client = window.supabase.createClient('https://ijaqabjjhsuvovtfffit.supabase.co', 'sb_publishable_uCbjOGhQR-efd9Fi_6et2w_6olQoisr');
  const $ = (id) => document.getElementById(id);
  const loginPane = $('loginPane'), appPane = $('appPane'), loginMessage = $('loginMessage'), updateMessage = $('updateMessage');
  let accessToken = '';
  const setMessage = (el, message, error = false) => { el.textContent = message; el.classList.toggle('error', error); };
  const profileFor = async (user) => {
    const { data, error } = await client.from('app_users').select('active,must_change_password').eq('id', user.id).maybeSingle();
    if (error || !data?.active || data.must_change_password) throw new Error('El usuario no está habilitado para acceder a los reportes.');
  };
  const showApp = async (session) => {
    if (!session) return;
    await profileFor(session.user);
    accessToken = session.access_token;
    loginPane.hidden = true; appPane.hidden = false; $('logout').hidden = false;
    await loadLatest();
  };
  async function request(path, options = {}) {
    const response = await fetch(path, { ...options, headers: { ...(options.headers || {}), authorization: `Bearer ${accessToken}`, ...(options.body ? { 'content-type': 'application/json' } : {}) } });
    if (!response.ok) { const body = await response.json().catch(() => ({})); throw new Error(body.error || 'No se pudo completar la solicitud.'); }
    return response;
  }
  function renderManifest(manifest) {
    $('downloads').hidden = false;
    $('manifestTitle').textContent = manifest.title || 'Reporte actualizado';
    $('stamp').textContent = `ACTUALIZADO · ${manifest.date || ''}`;
    const details = [`Base ${manifest.version || 'vigente'}`, manifest.cutoff ? `Corte ${manifest.cutoff}` : '', manifest.uploadsApplied != null ? `${manifest.uploadsApplied} archivos incorporados` : ''].filter(Boolean);
    $('cutoff').textContent = details.join('  ·  ');
    const list = $('fileList'); list.replaceChildren();
    for (const file of manifest.files || []) {
      const card = document.createElement('article'); card.className = 'file-card';
      const icon = document.createElement('span'); icon.className = 'file-icon'; icon.textContent = file.filename.split('.').pop().toUpperCase();
      const details = document.createElement('div'); details.className = 'file-copy';
      const name = document.createElement('b'); name.textContent = file.label || file.filename;
      const meta = document.createElement('span'); meta.textContent = `${file.filename} · ${Math.max(1, Math.round((file.size || 0) / 1024))} KB`;
      details.append(name, meta);
      const button = document.createElement('button'); button.className = 'download'; button.textContent = 'Descargar';
      button.addEventListener('click', async () => {
        button.disabled = true; button.textContent = 'Preparando…';
        try {
          const response = await request(`/api/report-download?runId=${encodeURIComponent(manifest.runId)}&fileId=${encodeURIComponent(file.id)}`);
          const blob = await response.blob(), link = document.createElement('a');
          link.href = URL.createObjectURL(blob); link.download = file.filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 2000);
        } catch (error) { setMessage(updateMessage, error.message, true); }
        finally { button.disabled = false; button.textContent = 'Descargar'; }
      });
      card.append(icon, details, button); list.append(card);
    }
  }
  async function loadLatest() {
    try { const response = await request('/api/report-sync'); renderManifest(await response.json()); }
    catch (error) { if (!/Todavía no hay reportes/.test(error.message)) setMessage(updateMessage, error.message, true); }
  }
  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); setMessage(loginMessage, 'Validando acceso…');
    const username = $('username').value.trim().toLowerCase();
    const password = $('password').value;
    const email = username.includes('@') ? username : `${username}@2w.local`;
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session) return setMessage(loginMessage, 'Usuario o contraseña incorrectos.', true);
    try { await showApp(data.session); setMessage(loginMessage, ''); }
    catch (e) { await client.auth.signOut(); setMessage(loginMessage, e.message, true); }
  });
  $('updateButton').addEventListener('click', async () => {
    const button = $('updateButton'); button.disabled = true;
    setMessage(updateMessage, 'Consultando el Site y generando Excel, PDF y PowerPoint…');
    try {
      const response = await request('/api/report-sync', { method: 'POST', body: JSON.stringify({ kind: $('reportKind').value }) });
      const manifest = await response.json();
      renderManifest(manifest);
      setMessage(updateMessage, 'Armando ZIP para descargar…');
      const bundle = await request(`/api/report-bundle?runId=${encodeURIComponent(manifest.runId)}`);
      const blob = await bundle.blob(), link = document.createElement('a');
      link.href = URL.createObjectURL(blob); link.download = `AMI_reportes_${manifest.date || 'actualizados'}.zip`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 3000);
      setMessage(updateMessage, 'Listo: descargué un ZIP con todos los archivos. También podés bajar cada uno por separado.');
    } catch (error) { setMessage(updateMessage, error.message, true); }
    finally { button.disabled = false; }
  });
  $('logout').addEventListener('click', async () => { await client.auth.signOut(); accessToken = ''; appPane.hidden = true; loginPane.hidden = false; $('logout').hidden = true; });
  client.auth.getSession().then(({ data }) => showApp(data.session).catch(() => client.auth.signOut()));
})();
