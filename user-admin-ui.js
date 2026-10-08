(()=>{
const ENDPOINT='https://ijaqabjjhsuvovtfffit.supabase.co/functions/v1/user-admin';
const KEY='sb_publishable_uCbjOGhQR-efd9Fi_6et2w_6olQoisr';
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
async function call(action,payload={}){
  const token=window.APP_AUTH?.getAccessToken?.();if(!token)throw new Error('Sesión vencida.');
  const r=await fetch(ENDPOINT,{method:'POST',headers:{'content-type':'application/json','authorization':`Bearer ${token}`,'apikey':KEY},body:JSON.stringify({action,...payload})});
  const out=await r.json();if(!r.ok)throw new Error(out.error||out.detail||'Error de usuarios');return out;
}
function buttons(){
  const top=document.querySelector('.top-actions');if(!top||document.getElementById('logoutTrigger'))return;
  if(window.APP_AUTH.role==='admin'){
    const u=document.createElement('button');u.id='userAdminTrigger';u.className='user-admin-trigger';u.textContent='👥 Usuarios';u.addEventListener('click',open);top.prepend(u);
  }
  const l=document.createElement('button');l.id='logoutTrigger';l.className='logout-trigger';l.textContent=`Salir · ${window.APP_AUTH.profile?.username||''}`;l.addEventListener('click',()=>window.APP_LOGOUT?.());top.appendChild(l);
}
async function open(){
  let modal=document.getElementById('userAdminModal');if(modal)modal.remove();
  modal=document.createElement('div');modal.id='userAdminModal';modal.className='user-admin-modal';
  modal.innerHTML=`<section class="user-admin-panel"><div class="user-admin-head"><div><span class="eyebrow">ADMINISTRACIÓN</span><h2>Usuarios y roles</h2><p>Admin administra usuarios · Analyst puede analizar/cargar · Viewer es sólo lectura.</p></div><button class="user-admin-close" id="userAdminClose">Cerrar</button></div><div class="user-admin-grid"><form class="auth-form" id="newUserForm"><h3>Nuevo usuario</h3><label>Usuario<input id="newUsername" required pattern="[a-zA-Z0-9._-]{3,40}"></label><label>Nombre visible<input id="newDisplayName" required></label><label>Rol<select id="newRole"><option value="viewer">Viewer</option><option value="analyst">Analyst</option><option value="admin">Admin</option></select></label><label>Contraseña temporal<input id="newTempPassword" type="password" minlength="8" required></label><button class="auth-primary" type="submit">Crear usuario</button><div class="auth-error" id="newUserError"></div><div class="auth-note">La contraseña temporal se cambia obligatoriamente en el primer ingreso.</div></form><div><div id="userList" class="user-list"><div class="auth-copy">Cargando usuarios…</div></div></div></div></section>`;
  document.body.appendChild(modal);modal.querySelector('#userAdminClose').onclick=()=>modal.remove();modal.addEventListener('click',e=>{if(e.target===modal)modal.remove()});
  modal.querySelector('#newUserForm').addEventListener('submit',async e=>{e.preventDefault();const err=modal.querySelector('#newUserError');err.textContent='';try{await call('create',{username:modal.querySelector('#newUsername').value,displayName:modal.querySelector('#newDisplayName').value,role:modal.querySelector('#newRole').value,initialPassword:modal.querySelector('#newTempPassword').value});e.target.reset();await load(modal)}catch(ex){err.textContent=ex.message}});
  await load(modal);
}
async function load(modal){
  const list=modal.querySelector('#userList');try{const {users}=await call('list');list.innerHTML=users.map(u=>`<div class="user-row" data-id="${u.id}"><div><b>${esc(u.display_name||u.username)} <span class="auth-role role-${u.role}">${u.role}</span></b><small>@${esc(u.username)} · ${u.active?'Activo':'Desactivado'}${u.must_change_password?' · cambio de contraseña pendiente':''}</small></div><div class="user-actions"><button data-act="role">Cambiar rol</button><button data-act="reset">Reset clave</button><button data-act="active">${u.active?'Desactivar':'Activar'}</button></div></div>`).join('')||'<div class="auth-copy">Sin usuarios.</div>';
    list.querySelectorAll('.user-row').forEach(row=>{const u=users.find(x=>x.id===row.dataset.id);row.querySelector('[data-act="role"]').onclick=async()=>{const role=prompt('Nuevo rol: admin / analyst / viewer',u.role);if(!role)return;try{await call('update',{id:u.id,role:role.toLowerCase()});await load(modal)}catch(e){alert(e.message)}};row.querySelector('[data-act="reset"]').onclick=async()=>{const temporaryPassword=prompt('Contraseña temporal (mínimo 8 caracteres). Se pedirá cambiarla al ingresar.');if(!temporaryPassword)return;try{await call('reset_password',{id:u.id,temporaryPassword});alert('Contraseña temporal actualizada.');await load(modal)}catch(e){alert(e.message)}};row.querySelector('[data-act="active"]').onclick=async()=>{try{await call('update',{id:u.id,active:!u.active});await load(modal)}catch(e){alert(e.message)}}});
  }catch(e){list.innerHTML=`<div class="auth-error">${esc(e.message)}</div>`}
}
document.addEventListener('2w:auth-ready',buttons,{once:true});window.__2W_AUTH_READY__?.then(buttons).catch(()=>{});
})();