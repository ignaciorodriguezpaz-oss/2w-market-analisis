/* v57 · single-source scrollspy for every report index item */
(()=>{
let raf=0,current='';
const nav=()=>document.getElementById('navigation');
const buttons=()=>[...(nav()?.querySelectorAll('[data-anchor]')||[])];
function probe(){
  const top=document.querySelector('.topbar')?.getBoundingClientRect().height||0;
  const filters=document.querySelector('.filters')?.getBoundingClientRect().height||0;
  return Math.min(innerHeight*.40,top+filters+32);
}
function candidates(){
  return buttons().map((button,index)=>{
    const id=button.dataset.anchor,el=id?document.getElementById(id):null;
    if(!el)return null;
    const r=el.getBoundingClientRect();
    return {id,button,el,r,index};
  }).filter(Boolean);
}
function pick(){
  const p=probe(),items=candidates();if(!items.length)return null;
  const inside=items.filter(x=>x.r.top<=p&&x.r.bottom>p);
  if(inside.length){
    /* Nested anchors (Data Hub inside Methodology): the one whose start is closest to the probe wins. */
    inside.sort((a,b)=>b.r.top-a.r.top||(a.r.height-b.r.height));
    return inside[0];
  }
  const previous=items.filter(x=>x.r.top<=p).sort((a,b)=>b.r.top-a.r.top);
  if(previous.length)return previous[0];
  return items.sort((a,b)=>a.r.top-b.r.top)[0];
}
function apply(item){
  if(!item)return;
  buttons().forEach(b=>{
    const on=b===item.button;
    b.dataset.scrollCurrent=on?'true':'false';
    if(on)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');
  });
  const label=item.button.querySelector('span')?.textContent?.trim();
  const title=document.getElementById('viewTitle');if(label&&title)title.textContent=label;
  document.body.dataset.currentChapter=item.id;
  if(current!==item.id){item.button.scrollIntoView({block:'nearest'});current=item.id}
}
function detect(){raf=0;apply(pick())}
function schedule(){if(!raf)raf=requestAnimationFrame(detect)}
function go(id){const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(schedule,80);setTimeout(schedule,300);setTimeout(schedule,700)}
function bind(){
  document.addEventListener('click',e=>{const b=e.target.closest?.('#navigation [data-anchor]');if(!b)return;const id=b.dataset.anchor;if(!id)return;e.preventDefault();go(id);document.getElementById('sidebar')?.classList.remove('open')},true);
  window.addEventListener('scroll',schedule,{passive:true,capture:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('hashchange',schedule);
  const n=nav();if(n)new MutationObserver(()=>{current='';schedule()}).observe(n,{childList:true,subtree:true});
  const c=document.getElementById('content');if(c)new MutationObserver(()=>{current='';schedule()}).observe(c,{childList:true,subtree:true});
  schedule();setTimeout(schedule,120);setTimeout(schedule,600);setTimeout(schedule,1400);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',bind,{once:true});else bind();
})();
