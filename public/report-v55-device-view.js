/* v55 · manual PC / Phone interface selector */
(()=>{
const KEY='2w.ui.mode';
const viewport=document.querySelector('meta[name="viewport"]');
function preferred(){
  try{const saved=localStorage.getItem(KEY);if(saved==='pc'||saved==='phone')return saved}catch{}
  return window.matchMedia('(max-width:760px)').matches?'phone':'pc';
}
function viewportFor(mode){
  if(!viewport)return;
  viewport.setAttribute('content',mode==='pc'?'width=1280,initial-scale=1,viewport-fit=cover':'width=device-width,initial-scale=1,viewport-fit=cover');
}
function syncButtons(mode){
  document.querySelectorAll('[data-device-view]').forEach(b=>{
    const on=b.dataset.deviceView===mode;
    b.classList.toggle('active',on);
    b.setAttribute('aria-pressed',on?'true':'false');
  });
}
function apply(mode,persist=true){
  if(mode!=='pc'&&mode!=='phone')return;
  document.body.dataset.uiMode=mode;
  document.documentElement.dataset.uiMode=mode;
  viewportFor(mode);
  if(mode==='pc')document.getElementById('sidebar')?.classList.remove('open');
  if(persist){try{localStorage.setItem(KEY,mode)}catch{}}
  syncButtons(mode);
  requestAnimationFrame(()=>{window.dispatchEvent(new Event('resize'));window.dispatchEvent(new Event('scroll'))});
}
function build(){
  if(document.querySelector('.device-view-switch'))return;
  const actions=document.querySelector('.top-actions');if(!actions)return;
  const wrap=document.createElement('div');wrap.className='device-view-switch';wrap.setAttribute('role','group');wrap.setAttribute('aria-label','Elegir visual de la aplicación');
  wrap.innerHTML='<button type="button" data-device-view="pc" title="Ver interfaz de PC"><span class="dv-icon">▣</span><span class="dv-label">PC</span></button><button type="button" data-device-view="phone" title="Ver interfaz de teléfono"><span class="dv-icon">▯</span><span class="dv-label">TELÉFONO</span></button>';
  actions.prepend(wrap);
  wrap.addEventListener('click',e=>{const b=e.target.closest('[data-device-view]');if(b)apply(b.dataset.deviceView,true)});
  syncButtons(document.body.dataset.uiMode||preferred());
}
function init(){
  const mode=preferred();
  viewportFor(mode);
  document.body.dataset.uiMode=mode;
  document.documentElement.dataset.uiMode=mode;
  build();syncButtons(mode);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
