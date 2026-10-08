(()=>{
const SESSION_MARKER='session-auth';
function apply(){
  const role=window.APP_AUTH?.role;if(!role)return;
  const canUpload=role==='admin'||role==='analyst';
  if(canUpload)localStorage.setItem('2w.datahub.uploadKey',SESSION_MARKER);
  if(!canUpload){document.querySelector('#datahub')?.remove();document.querySelector('#navigation [data-anchor="datahub"]')?.remove()}
  const key=document.querySelector('#dataHubKey');if(key&&canUpload){key.value=SESSION_MARKER;const field=key.closest('.data-hub-field');if(field)field.hidden=true}
  document.querySelectorAll('[data-min-role="analyst"]').forEach(el=>el.hidden=!canUpload);
  document.querySelectorAll('[data-min-role="admin"]').forEach(el=>el.hidden=role!=='admin');
}
function watch(){apply();const c=document.getElementById('content'),n=document.getElementById('navigation');if(c)new MutationObserver(apply).observe(c,{childList:true,subtree:true});if(n)new MutationObserver(apply).observe(n,{childList:true,subtree:true})}
document.addEventListener('2w:auth-ready',watch,{once:true});window.__2W_AUTH_READY__?.then(watch).catch(()=>{});
})();