(()=>{
const FLOW=['executive','context','consumer','market','structure','forecast','user','planning','actions','method'];
let raf=0,current='';
const nav=()=>document.getElementById('navigation');
const btn=id=>nav()?.querySelector(`[data-anchor="${id}"]`);
function stickyTop(){
  const top=document.querySelector('.topbar')?.getBoundingClientRect().height||0;
  const filters=document.querySelector('.filters')?.getBoundingClientRect().height||0;
  return top+filters;
}
function visibleScore(el){
  const r=el.getBoundingClientRect(),top=stickyTop(),bottom=window.innerHeight;
  const visible=Math.max(0,Math.min(r.bottom,bottom)-Math.max(r.top,top));
  const available=Math.max(1,bottom-top);
  const ratio=visible/Math.max(1,Math.min(r.height,available));
  const center=(Math.max(r.top,top)+Math.min(r.bottom,bottom))/2;
  const viewportCenter=top+(available/2);
  const centerPenalty=Math.abs(center-viewportCenter)/Math.max(1,available);
  return visible>0 ? visible+(ratio*available*.35)-(centerPenalty*20) : -Math.abs(r.top-viewportCenter);
}
function pick(){
  const rows=FLOW.map(id=>({id,el:document.getElementById(id),button:btn(id)})).filter(x=>x.el&&x.button);
  if(!rows.length)return null;
  let best=rows[0],bestScore=-Infinity;
  for(const row of rows){const score=visibleScore(row.el);if(score>bestScore){best=row;bestScore=score}}
  return best;
}
function mobileIndicator(){
  let el=document.getElementById('mobileSectionIndicator');
  if(el)return el;
  el=document.createElement('button');el.id='mobileSectionIndicator';el.className='mobile-section-indicator';el.type='button';
  el.setAttribute('aria-label','Abrir índice en la sección actual');
  el.innerHTML='<i>01</i><span>Resumen ejecutivo</span><b>Índice</b>';
  el.addEventListener('click',()=>document.getElementById('sidebar')?.classList.add('open'));
  document.body.appendChild(el);return el;
}
function paint(row){
  if(!row)return;
  FLOW.forEach(id=>{
    const b=btn(id);if(!b)return;const on=id===row.id;
    b.classList.toggle('viewing',on);b.classList.toggle('active',on);b.toggleAttribute('data-current',on);
    if(on)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');
  });
  const label=row.button.querySelector('span')?.textContent?.trim()||'';
  const num=row.button.querySelector('i')?.textContent?.trim()||'';
  const title=document.getElementById('viewTitle');if(title&&label)title.textContent=label;
  const mob=mobileIndicator();if(mob){mob.querySelector('i').textContent=num;mob.querySelector('span').textContent=label}
  document.body.dataset.currentChapter=row.id;
  if(current!==row.id){row.button.scrollIntoView({block:'nearest'});current=row.id}
}
function detect(){raf=0;paint(pick())}
function schedule(){if(!raf)raf=requestAnimationFrame(detect)}
function go(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(schedule,50);setTimeout(schedule,220);setTimeout(schedule,600)}
function bindIndex(){
  const n=nav();if(!n||n.dataset.liveBound==='1')return;n.dataset.liveBound='1';
  n.addEventListener('click',e=>{const b=e.target.closest?.('[data-anchor]');if(!b||!FLOW.includes(b.dataset.anchor))return;e.preventDefault();go(b.dataset.anchor);document.getElementById('sidebar')?.classList.remove('open')});
}
function start(){
  mobileIndicator();bindIndex();
  window.addEventListener('scroll',schedule,{passive:true});
  document.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('hashchange',schedule);
  window.addEventListener('2w:index-rebuilt',()=>{current='';bindIndex();schedule()});
  const content=document.getElementById('content');if(content)new MutationObserver(schedule).observe(content,{childList:true,subtree:false});
  setInterval(schedule,350);
  schedule();setTimeout(schedule,120);setTimeout(schedule,600);setTimeout(schedule,1200);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();