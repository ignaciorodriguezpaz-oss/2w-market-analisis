/* v59 · authoritative scrollspy based on live positions of every index target */
(()=>{
let raf=0,current='',muting=false;
const navButtons=()=>[...document.querySelectorAll('#navigation [data-anchor]')];
function probe(){
  const top=document.querySelector('.topbar')?.getBoundingClientRect().height||0;
  const filters=document.querySelector('.filters')?.getBoundingClientRect().height||0;
  return Math.min(window.innerHeight*.42,top+filters+30);
}
function targetRows(){
  return navButtons().map(button=>{
    const id=button.dataset.anchor;
    const el=id?document.getElementById(id):null;
    return el?{id,button,top:el.getBoundingClientRect().top}:null;
  }).filter(Boolean).sort((a,b)=>a.top-b.top);
}
function setLegacyOff(button){
  if(button.classList.contains('active'))button.classList.remove('active');
  if(button.classList.contains('viewing'))button.classList.remove('viewing');
  if(button.hasAttribute('data-v53-active'))button.removeAttribute('data-v53-active');
}
function apply(id){
  if(!id)return;
  muting=true;
  let selected=null;
  navButtons().forEach(button=>{
    setLegacyOff(button);
    const on=button.dataset.anchor===id;
    if(on){
      if(button.getAttribute('data-scroll-current')!=='true')button.setAttribute('data-scroll-current','true');
      if(button.getAttribute('aria-current')!=='location')button.setAttribute('aria-current','location');
      selected=button;
    }else{
      if(button.hasAttribute('data-scroll-current'))button.removeAttribute('data-scroll-current');
      if(button.hasAttribute('aria-current'))button.removeAttribute('aria-current');
    }
  });
  muting=false;
  if(!selected)return;
  const label=selected.querySelector('span')?.textContent?.trim();
  if(label){const title=document.getElementById('viewTitle');if(title&&title.textContent!==label)title.textContent=label}
  document.body.dataset.currentChapter=id;
  if(id!==current){selected.scrollIntoView({block:'nearest'});current=id}
}
function detect(){
  raf=0;
  const rows=targetRows();
  if(!rows.length)return;
  const y=probe();
  let chosen=rows[0];
  for(const row of rows){if(row.top<=y)chosen=row;else break}
  apply(chosen.id);
}
function schedule(){if(!raf)raf=requestAnimationFrame(detect)}
function enforce(){if(muting)return;schedule()}
document.addEventListener('click',e=>{
  const b=e.target.closest?.('#navigation [data-anchor]');
  if(!b)return;
  const id=b.dataset.anchor;if(!id)return;
  apply(id);
  setTimeout(schedule,80);setTimeout(schedule,300);setTimeout(schedule,700);
},true);
function start(){
  const nav=document.getElementById('navigation');
  if(nav)new MutationObserver(enforce).observe(nav,{subtree:true,childList:true,attributes:true,attributeFilter:['class','data-v53-active','data-scroll-current']});
  const content=document.getElementById('content');
  if(content)new MutationObserver(()=>{current='';schedule();setTimeout(schedule,60)}).observe(content,{subtree:true,childList:true});
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('hashchange',schedule);
  setInterval(schedule,700);
  schedule();setTimeout(schedule,100);setTimeout(schedule,500);setTimeout(schedule,1400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
