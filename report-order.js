(()=>{
const FLOW=[
  ['executive','Resumen ejecutivo'],
  ['context','Argentina hoy'],
  ['consumer','Consumidor & movilidad'],
  ['market','Mercado, momentum & estacionalidad'],
  ['structure','Segmentos, competencia & supply'],
  ['forecast','Forecast CY / KI'],
  ['user','Probabilidad & User Scenario'],
  ['planning','Honda & Planning'],
  ['actions','Riesgos, acciones & Safety'],
  ['method','Metodología, validación & reportes']
];
let busy=false,queued=false;
const nn=i=>String(i+1).padStart(2,'0');
const navMarkup=()=>FLOW.map(([id,title],i)=>`<button type="button" data-anchor="${id}"><i>${nn(i)}</i><span>${title}</span></button>`).join('');
function schedule(){if(queued)return;queued=true;queueMicrotask(()=>{queued=false;apply()})}
function apply(){
  if(busy)return;
  const content=document.getElementById('content'),nav=document.getElementById('navigation');
  if(!content||!nav||!FLOW.every(([id])=>document.getElementById(id)))return;
  busy=true;
  try{
    const wanted=FLOW.map(([id])=>id);
    const current=[...content.querySelectorAll(':scope > .single-chapter[id]')].map(x=>x.id).filter(id=>wanted.includes(id));
    if(current.join('|')!==wanted.join('|'))FLOW.forEach(([id])=>{const el=document.getElementById(id);if(el&&el.parentElement===content)content.appendChild(el)});
    FLOW.forEach(([id,,],i)=>{
      const sec=document.getElementById(id),head=sec?.querySelector(':scope > header'),n=nn(i);
      if(!head)return;
      const badge=head.querySelector(':scope > i');if(badge)badge.textContent=n;
      const cap=head.querySelector('span');if(cap&&/^CAPÍTULO/i.test(cap.textContent||''))cap.textContent=`CAPÍTULO ${n}`;
    });
    const signature=[...nav.querySelectorAll('[data-anchor]')].map(b=>`${b.dataset.anchor}:${b.querySelector('span')?.textContent||''}`).join('|');
    const wantedSig=FLOW.map(([id,title])=>`${id}:${title}`).join('|');
    if(signature!==wantedSig)nav.innerHTML=navMarkup();
    window.dispatchEvent(new CustomEvent('2w:index-rebuilt'));
  }finally{busy=false}
}
function start(){
  const content=document.getElementById('content');
  if(content)new MutationObserver(schedule).observe(content,{childList:true,subtree:false});
  apply();setTimeout(apply,120);setTimeout(apply,500);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();