(()=>{
function apply(){const role=window.APP_AUTH?.role;if(!role)return;const canUpload=role==='admin'||role==='analyst';if(!canUpload){document.querySelector('#datahub')?.remove();document.querySelector('#navigation [data-anchor="datahub"]')?.remove()}document.querySelectorAll('[data-min-role="analyst"]').forEach(el=>el.hidden=!canUpload);document.querySelectorAll('[data-min-role="admin"]').forEach(el=>el.hidden=role!=='admin')}
function watch(){apply();const c=document.getElementById('content'),n=document.getElementById('navigation');if(c)new MutationObserver(apply).observe(c,{childList:true});if(n)new MutationObserver(apply).observe(n,{childList:true})}
document.addEventListener('2w:auth-ready',watch,{once:true});window.__2W_AUTH_READY__?.then(watch).catch(()=>{});
})();