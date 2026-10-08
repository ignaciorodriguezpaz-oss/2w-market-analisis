(()=>{
const FLOW=[
  ['executive','Resumen ejecutivo'],
  ['context','Argentina hoy'],
  ['market','Mercado, momentum & estacionalidad'],
  ['structure','Segmentos, competencia & supply'],
  ['consumer','Consumidor & movilidad'],
  ['forecast','Forecast CY / KI'],
  ['user','Probabilidad & User Scenario'],
  ['planning','Honda & Planning'],
  ['actions','Riesgos, acciones & Safety'],
  ['method','Metodología, validación & reportes']
];
let busy=false,queued=false;
const nn=i=>String(i+1).padStart(2,'0');
function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;order()})}
function order(){
  if(busy)return;
  const content=document.getElementById('content'),nav=document.getElementById('navigation');
  if(!content||!nav||!FLOW.every(([id])=>document.getElementById(id)))return;
  busy=true;
  try{
    const want=FLOW.map(x=>x[0]);
    const chapterNow=[...content.querySelectorAll(':scope > .single-chapter[id]')].map(x=>x.id).filter(id=>want.includes(id));
    if(chapterNow.join('|')!==want.join('|')){
      FLOW.forEach(([id])=>{const el=document.getElementById(id);if(el&&el.parentElement===content)content.appendChild(el)});
    }

    FLOW.forEach(([id,title],i)=>{
      const n=nn(i),sec=document.getElementById(id),head=sec?.querySelector(':scope > header');
      if(head){
        const badge=head.querySelector(':scope > i');if(badge&&badge.textContent!==n)badge.textContent=n;
        const cap=head.querySelector('span');if(cap&&/^CAPÍTULO/i.test(cap.textContent||'')&&cap.textContent!==`CAPÍTULO ${n}`)cap.textContent=`CAPÍTULO ${n}`;
      }
      const b=nav.querySelector(`[data-anchor="${id}"]`);
      if(b){
        const bi=b.querySelector('i'),bs=b.querySelector('span');
        if(bi&&bi.textContent!==n)bi.textContent=n;
        if(bs&&bs.textContent!==title)bs.textContent=title;
      }
    });

    const navNow=[...nav.querySelectorAll('[data-anchor]')].map(x=>x.dataset.anchor).filter(id=>want.includes(id));
    if(navNow.join('|')!==want.join('|')){
      FLOW.forEach(([id])=>{const b=nav.querySelector(`[data-anchor="${id}"]`);if(b)nav.appendChild(b)});
    }
  }finally{busy=false}
}
function start(){
  const content=document.getElementById('content');
  if(content)new MutationObserver(schedule).observe(content,{childList:true,subtree:false});
  const nav=document.getElementById('navigation');
  if(nav)new MutationObserver(schedule).observe(nav,{childList:true,subtree:false});
  order();
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();