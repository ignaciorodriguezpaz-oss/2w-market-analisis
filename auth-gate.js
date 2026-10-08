(()=>{
const SUPABASE_URL='https://ijaqabjjhsuvovtfffit.supabase.co';
const PUBLISHABLE_KEY='sb_publishable_uCbjOGhQR-efd9Fi_6et2w_6olQoisr';
const SETUP_URL=SUPABASE_URL+'/functions/v1/first-user-setup';
let authResolve;
window.__2W_AUTH_READY__=new Promise(r=>authResolve=r);
const supa=window.supabase?.createClient(SUPABASE_URL,PUBLISHABLE_KEY,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false}});
window.APP_AUTH={client:supa,session:null,user:null,profile:null,role:null,ready:false,getAccessToken:()=>window.APP_AUTH.session?.access_token||''};
document.documentElement.classList.add('auth-locked');

const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
const emailFor=u=>`${String(u||'').trim().toLowerCase()}@2w.local`;
function shell(title,copy,body,note=''){
  let el=document.getElementById('authShell');
  if(!el){el=document.createElement('div');el.id='authShell';el.className='auth-shell';document.body.appendChild(el)}
  el.innerHTML=`<section class="auth-card"><div class="auth-brand"><span>2W</span><div><b>ARGENTINA</b><small>MARKET ANALYSIS · ACCESO PROTEGIDO</small></div></div><h1>${title}</h1><p>${copy}</p>${body}${note?`<div class="auth-note">${note}</div>`:''}</section>`;
  return el;
}
function errorText(e){return String(e?.message||e||'Error').replace('Invalid login credentials','Usuario o contraseña incorrectos.')}
async function fetchProfile(user){
  const {data,error}=await supa.from('app_users').select('id,username,display_name,role,active,must_change_password,created_at,updated_at').eq('id',user.id).maybeSingle();
  if(error)throw error;if(!data)throw new Error('Este usuario no tiene acceso habilitado.');return data;
}
function applyRole(){
  const p=window.APP_AUTH.profile;if(!p)return;
  document.body.dataset.appRole=p.role;
  document.body.dataset.appUser=p.username;
  document.querySelectorAll('[data-min-role="analyst"]').forEach(el=>{el.hidden=!['admin','analyst'].includes(p.role)});
  document.querySelectorAll('[data-min-role="admin"]').forEach(el=>{el.hidden=p.role!=='admin'});
}
function finish(session,profile){
  window.APP_AUTH.session=session;window.APP_AUTH.user=session.user;window.APP_AUTH.profile=profile;window.APP_AUTH.role=profile.role;window.APP_AUTH.ready=true;
  applyRole();
  document.documentElement.classList.remove('auth-locked');
  document.getElementById('authShell')?.remove();
  authResolve(window.APP_AUTH);
  document.dispatchEvent(new CustomEvent('2w:auth-ready',{detail:{user:session.user,profile}}));
}
async function requirePasswordChange(session,profile,oldPassword=''){
  const box=shell('Cambiar contraseña','Este es tu primer ingreso. Antes de abrir el reporte tenés que definir una contraseña nueva.',`<form class="auth-form" id="passwordChangeForm"><label>Nueva contraseña<input id="newPassword" type="password" autocomplete="new-password" minlength="8" required></label><label>Repetir contraseña<input id="confirmPassword" type="password" autocomplete="new-password" minlength="8" required></label><button class="auth-primary" type="submit">Guardar y entrar</button><div class="auth-error" id="authError"></div></form>`,'Mínimo 8 caracteres. No compartas la contraseña entre usuarios.');
  box.querySelector('#passwordChangeForm').addEventListener('submit',async e=>{
    e.preventDefault();const err=box.querySelector('#authError'),p1=box.querySelector('#newPassword').value,p2=box.querySelector('#confirmPassword').value;err.textContent='';
    if(p1.length<8){err.textContent='La nueva contraseña debe tener al menos 8 caracteres.';return}
    if(p1!==p2){err.textContent='Las contraseñas no coinciden.';return}
    if(oldPassword&&p1===oldPassword){err.textContent='Elegí una contraseña distinta de la temporal.';return}
    try{
      const {error}=await supa.auth.updateUser({password:p1});if(error)throw error;
      const {error:rpcError}=await supa.rpc('finish_first_login');if(rpcError)throw rpcError;
      const fresh=await fetchProfile(session.user);finish((await supa.auth.getSession()).data.session,fresh);
    }catch(ex){err.textContent=errorText(ex)}
  });
}
async function acceptSession(session,oldPassword=''){
  if(!session?.user){showLogin();return}
  try{
    const profile=await fetchProfile(session.user);
    if(!profile.active){await supa.auth.signOut();throw new Error('Usuario desactivado. Contactá a un administrador.')}
    window.APP_AUTH.session=session;window.APP_AUTH.user=session.user;window.APP_AUTH.profile=profile;window.APP_AUTH.role=profile.role;
    if(profile.must_change_password){await requirePasswordChange(session,profile,oldPassword);return}
    finish(session,profile);
  }catch(e){showLogin(errorText(e))}
}
function showLogin(message=''){
  const box=shell('Ingresar','Acceso exclusivo a usuarios autorizados de 2W Market Analysis.',`<form class="auth-form" id="loginForm"><label>Usuario<input id="loginUser" autocomplete="username" required></label><label>Contraseña<input id="loginPassword" type="password" autocomplete="current-password" required></label><button class="auth-primary" type="submit">Entrar</button><div class="auth-error" id="authError">${esc(message)}</div></form>`,'Los permisos dependen del rol asignado: Admin, Analyst o Viewer.');
  box.querySelector('#loginForm').addEventListener('submit',async e=>{
    e.preventDefault();const err=box.querySelector('#authError'),username=box.querySelector('#loginUser').value.trim().toLowerCase(),password=box.querySelector('#loginPassword').value;err.textContent='';
    try{
      const {data,error}=await supa.auth.signInWithPassword({email:emailFor(username),password});if(error)throw error;
      await acceptSession(data.session,password);
    }catch(ex){err.textContent=errorText(ex)}
  });
}
function showSetupPending(){
  const box=shell('Administrador pendiente','La capa de seguridad ya está instalada, pero el primer usuario todavía debe crearse de forma segura en Supabase Authentication.',`<div class="auth-form"><label>Usuario reservado<input value="admin" disabled></label><button class="auth-primary" id="retrySetup" type="button">Ya lo creé · volver a comprobar</button><div class="auth-error" id="authError"></div></div>`,'Una vez creado el usuario admin, esta pantalla desaparece y el primer ingreso obliga a cambiar la contraseña temporal.');
  box.querySelector('#retrySetup').addEventListener('click',()=>location.reload());
}
async function start(){
  if(!supa){shell('Error de seguridad','No se pudo iniciar el módulo de autenticación.','<div class="auth-error">Supabase Auth no está disponible.</div>');return}
  try{
    const r=await fetch(SETUP_URL,{headers:{apikey:PUBLISHABLE_KEY},cache:'no-store'});const setup=await r.json().catch(()=>({}));
    if(setup.manual_admin_creation_required){showSetupPending();return}
  }catch{}
  const {data}=await supa.auth.getSession();
  if(data.session)await acceptSession(data.session);else showLogin();
}
window.APP_LOGOUT=async()=>{await supa.auth.signOut();location.reload()};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();