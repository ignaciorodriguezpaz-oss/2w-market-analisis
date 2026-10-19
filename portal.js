(() => {
  const client = window.supabase.createClient('https://ijaqabjjhsuvovtfffit.supabase.co', 'sb_publishable_uCbjOGhQR-efd9Fi_6et2w_6olQoisr');
  const $ = (id) => document.getElementById(id);
  const loginPane = $('loginPane'), appPane = $('appPane'), loginMessage = $('loginMessage'), updateMessage = $('updateMessage');
  const copy = {
    es: {
      page_title: 'Reportes · Argentina Motorcycle Intelligence', report_center: 'CENTRO DE REPORTES', logout: 'Salir',
      private_access: 'ACCESO PRIVADO', login_title: 'Ingresá para preparar tus reportes.', username: 'Usuario', password: 'Contraseña', login_button: 'Ingresar',
      market_eyebrow: 'MERCADO ARGENTINO DE MOTOCICLETAS', app_title_first: 'Actualizá y descargá', app_title_second: 'desde acá.',
      intro: 'El botón consulta la base vigente del Site y prepara solo el formato que elijas para descargarlo.', report_type: 'Tipo de reporte',
      kind_executive: 'Executive Committee · 5 slides', kind_monthly: 'Monthly Review', kind_weekly: 'Weekly Registration · última semana cerrada',
      kind_ki: 'KI Outlook / MTP', kind_commercial: 'Commercial Planning', kind_supply: 'Supply & Market Outlook',
      download_format: 'Formato de descarga', format_excel: 'Excel completo · base y tablas', format_pdf: 'PDF del reporte', format_pptx: 'PowerPoint del reporte',
      update_report: 'Actualizar reporte', files_ready: 'ARCHIVOS LISTOS', report_updated: 'Reporte actualizado', privacy_note: 'Datos leídos del Site · los archivos quedan disponibles acá hasta la próxima actualización.',
      footer_note: 'Descargas fechadas · fuente única: Site', validating: 'Validando acceso…', invalid_login: 'Usuario o contraseña incorrectos.',
      checking_site: 'Consultando el Site y preparando {format}…', fetching_site: 'Trayendo la información del Site y generando {format}…',
      downloading: 'Descargando {format}…', update_done: '{format} actualizado desde el Site y descargado. También queda disponible en esta pantalla.',
      download: 'Descargar', preparing: 'Preparando…', updated_stamp: 'ACTUALIZADO · {date}', base: 'Base {version}', cutoff: 'Corte {date}',
      files_added: '{count} archivos incorporados', no_download_file: 'El Site terminó la actualización, pero no devolvió un archivo para descargar.',
      disabled_user: 'El usuario no está habilitado para acceder a los reportes.', request_failed: 'No se pudo completar la solicitud.',
      unauthorized: 'Tu sesión no está autorizada. Volvé a ingresar.', no_reports: 'Todavía no hay reportes disponibles.',
      site_error: 'No se pudo consultar el Site. Probá de nuevo en unos minutos.', download_error: 'No se pudo descargar el archivo. Actualizá el reporte e intentá otra vez.',
      zip_error: 'No se pudo preparar el ZIP. Los archivos individuales siguen disponibles.', invalid_download: 'Descarga inválida.', report_expired: 'El reporte ya no está disponible. Actualizalo otra vez.',
      method_error: 'Método no permitido.', format_error: 'Elegí Excel, PDF o PowerPoint.'
    },
    en: {
      page_title: 'Reports · Argentina Motorcycle Intelligence', report_center: 'REPORT CENTER', logout: 'Sign out',
      private_access: 'PRIVATE ACCESS', login_title: 'Sign in to prepare your reports.', username: 'Username', password: 'Password', login_button: 'Sign in',
      market_eyebrow: 'ARGENTINE MOTORCYCLE MARKET', app_title_first: 'Refresh and download', app_title_second: 'right here.',
      intro: 'This button checks the latest data on the Site and prepares only the format you choose to download.', report_type: 'Report type',
      kind_executive: 'Executive Committee · 5 slides', kind_monthly: 'Monthly Review', kind_weekly: 'Weekly Registration · last closed week',
      kind_ki: 'KI Outlook / MTP', kind_commercial: 'Commercial Planning', kind_supply: 'Supply & Market Outlook',
      download_format: 'Download format', format_excel: 'Full Excel · database and tables', format_pdf: 'PDF report', format_pptx: 'PowerPoint report',
      update_report: 'Refresh report', files_ready: 'FILES READY', report_updated: 'Report updated', privacy_note: 'Data retrieved from the Site · files stay available here until the next refresh.',
      footer_note: 'Dated downloads · single source: Site', validating: 'Checking access…', invalid_login: 'Incorrect username or password.',
      checking_site: 'Checking the Site and preparing {format}…', fetching_site: 'Retrieving Site data and generating {format}…',
      downloading: 'Downloading {format}…', update_done: '{format} refreshed from the Site and downloaded. It is also available on this page.',
      download: 'Download', preparing: 'Preparing…', updated_stamp: 'UPDATED · {date}', base: 'Dataset {version}', cutoff: 'Cutoff {date}',
      files_added: '{count} files included', no_download_file: 'The Site finished refreshing but did not return a file to download.',
      disabled_user: 'This user is not enabled to access the reports.', request_failed: 'The request could not be completed.',
      unauthorized: 'Your session is not authorized. Please sign in again.', no_reports: 'No reports are available yet.',
      site_error: 'Could not reach the Site. Please try again in a few minutes.', download_error: 'Could not download the file. Refresh the report and try again.',
      zip_error: 'Could not prepare the ZIP. Individual files are still available.', invalid_download: 'Invalid download request.', report_expired: 'This report is no longer available. Refresh it again.',
      method_error: 'Method not allowed.', format_error: 'Choose Excel, PDF, or PowerPoint.'
    }
  };
  let language = localStorage.getItem('ami-language') === 'en' ? 'en' : 'es';
  const t = (key, values = {}) => (copy[language][key] || key).replace(/\{(\w+)\}/g, (_, name) => values[name] ?? '');
  function applyLanguage(next) {
    language = next;
    localStorage.setItem('ami-language', language);
    document.documentElement.lang = language;
    document.title = t('page_title');
    document.querySelector('meta[name="description"]').content = language === 'en'
      ? 'Refresh and download Argentina Motorcycle Intelligence reports.'
      : 'Actualizá y descargá los reportes de Argentina Motorcycle Intelligence.';
    document.querySelectorAll('[data-i18n]').forEach((element) => { element.textContent = t(element.dataset.i18n); });
    document.querySelectorAll('[data-language]').forEach((button) => {
      const active = button.dataset.language === language;
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(active));
    });
  }
  function localizedError(message) {
    if (language === 'es') return message;
    const exact = {
      'Usuario o contraseña incorrectos.': 'invalid_login',
      'No se pudo completar la solicitud.': 'request_failed',
      'Tu sesión no está autorizada. Volvé a ingresar.': 'unauthorized',
      'El usuario no está habilitado para acceder a los reportes.': 'disabled_user',
      'No se pudo consultar el Site. Probá de nuevo en unos minutos.': 'site_error',
      'No se pudo descargar el archivo. Actualizá el reporte e intentá otra vez.': 'download_error',
      'No se pudo preparar el ZIP. Los archivos individuales siguen disponibles.': 'zip_error',
      'Descarga inválida.': 'invalid_download',
      'El reporte ya no está disponible. Actualizalo otra vez.': 'report_expired',
      'Método no permitido.': 'method_error',
      'Elegí Excel, PDF o PowerPoint.': 'format_error'
    };
    return exact[message] ? t(exact[message]) : message;
  }
  let accessToken = '';
  const setMessage = (el, message, error = false) => { el.textContent = message; el.classList.toggle('error', error); };
  const profileFor = async (user) => {
    const { data, error } = await client.from('app_users').select('active,must_change_password').eq('id', user.id).maybeSingle();
    if (error || !data?.active || data.must_change_password) throw new Error(t('disabled_user'));
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
    $('manifestTitle').textContent = manifest.title || t('report_updated');
    $('stamp').textContent = t('updated_stamp', { date: manifest.date || '' });
    const details = [t('base', { version: manifest.version || (language === 'en' ? 'current' : 'vigente') }), manifest.cutoff ? t('cutoff', { date: manifest.cutoff }) : '', manifest.uploadsApplied != null ? t('files_added', { count: manifest.uploadsApplied }) : ''].filter(Boolean);
    $('cutoff').textContent = details.join('  ·  ');
    const list = $('fileList'); list.replaceChildren();
    for (const file of manifest.files || []) {
      const card = document.createElement('article'); card.className = 'file-card';
      const icon = document.createElement('span'); icon.className = 'file-icon'; icon.textContent = file.filename.split('.').pop().toUpperCase();
      const details = document.createElement('div'); details.className = 'file-copy';
      const name = document.createElement('b'); name.textContent = file.label || file.filename;
      const meta = document.createElement('span'); meta.textContent = `${file.filename} · ${Math.max(1, Math.round((file.size || 0) / 1024))} KB`;
      details.append(name, meta);
      const button = document.createElement('button'); button.className = 'download'; button.textContent = t('download');
      button.addEventListener('click', async () => {
        button.disabled = true; button.textContent = t('preparing');
        try {
          const response = await request(`/api/report-download?runId=${encodeURIComponent(manifest.runId)}&fileId=${encodeURIComponent(file.id)}`);
          const blob = await response.blob(), link = document.createElement('a');
          link.href = URL.createObjectURL(blob); link.download = file.filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 2000);
        } catch (error) { setMessage(updateMessage, localizedError(error.message), true); }
        finally { button.disabled = false; button.textContent = t('download'); }
      });
      card.append(icon, details, button); list.append(card);
    }
  }
  async function loadLatest() {
    try { const response = await request('/api/report-sync'); renderManifest(await response.json()); }
    catch (error) { if (!/Todavía no hay reportes|No reports are available/.test(error.message)) setMessage(updateMessage, localizedError(error.message), true); }
  }
  $('loginForm').addEventListener('submit', async (event) => {
    event.preventDefault(); setMessage(loginMessage, t('validating'));
    const username = $('username').value.trim().toLowerCase();
    const password = $('password').value;
    const email = username.includes('@') ? username : `${username}@2w.local`;
    const { data, error } = await client.auth.signInWithPassword({ email, password });
    if (error || !data.session) return setMessage(loginMessage, t('invalid_login'), true);
    try { await showApp(data.session); setMessage(loginMessage, ''); }
    catch (e) { await client.auth.signOut(); setMessage(loginMessage, localizedError(e.message), true); }
  });
  $('updateButton').addEventListener('click', async () => {
    const button = $('updateButton'); button.disabled = true;
    const format = $('outputFormat').value;
    const formatLabel = { excel: 'Excel', pdf: 'PDF', pptx: 'PowerPoint' }[format];
    setMessage(updateMessage, t('checking_site', { format: formatLabel }));
    try {
      setMessage(updateMessage, t('fetching_site', { format: formatLabel }));
      const response = await request('/api/report-sync', { method: 'POST', body: JSON.stringify({ kind: $('reportKind').value, format }) });
      const manifest = await response.json();
      renderManifest(manifest);
      const file = manifest.files?.[0];
      if (!file) throw new Error(t('no_download_file'));
      setMessage(updateMessage, t('downloading', { format: formatLabel }));
      const download = await request(`/api/report-download?runId=${encodeURIComponent(manifest.runId)}&fileId=${encodeURIComponent(file.id)}`);
      const blob = await download.blob(), link = document.createElement('a');
      link.href = URL.createObjectURL(blob); link.download = file.filename; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(link.href), 3000);
      setMessage(updateMessage, t('update_done', { format: formatLabel }));
    } catch (error) { setMessage(updateMessage, localizedError(error.message), true); }
    finally { button.disabled = false; }
  });
  document.querySelectorAll('[data-language]').forEach((button) => button.addEventListener('click', () => applyLanguage(button.dataset.language)));
  applyLanguage(language);
  $('logout').addEventListener('click', async () => { await client.auth.signOut(); accessToken = ''; appPane.hidden = true; loginPane.hidden = false; $('logout').hidden = true; });
  client.auth.getSession().then(({ data }) => showApp(data.session).catch(() => client.auth.signOut()));
})();
