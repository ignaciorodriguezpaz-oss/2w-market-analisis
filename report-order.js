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
let busy=false;
const nn=i=>String(i+1).padStart(2,'0');
function order(){
  if(busy)return; const content=document.getElementById('content'),nav=document.getElementById('navigation');
  if(!content||!nav||!FLOW.every(([id])=>document.getElementById(id)))return;
  const now=[...content.querySelectorAll('.single-chapter[id]')].map(x=>x.id).join('|'),want=FLOW.map(x=>x[0]).join('|');
  busy=true;
  if(now!==want)FLOW.forEach(([id])=>content.appendChild(document.getElementById(id)));
  FLOW.forEach(([id,title],i)=>{
    const n=nn(i),sec=document.getElementById(id),head=sec?.querySelector(':scope > header');
    if(head){const badge=head.querySelector(':scope > i');if(badge)badge.textContent=n;const cap=head.querySelector('span');if(cap&&/^CAPÍTULO/i.test(cap.textContent||''))cap.textContent=`CAPÍTULO ${n}`}
    const b=nav.querySelector(`[data-anchor="${id}"]`); if(b){const bi=b.querySelector('i');if(bi)bi.textContent=n;const bs=b.querySelector('span');if(bs)bs.textContent=title;nav.appendChild(b)}
  });
  busy=false;
}
function start(){const content=document.getElementById('content');if(content)new MutationObserver(()=>queueMicrotask(order)).observe(content,{childList:true,subtree:false});const nav=document.getElementById('navigation');if(nav)new MutationObserver(()=>queueMicrotask(order)).observe(nav,{childList:true,subtree:false});order()}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
