/* 2W Market Analysis v53 · live operational refresh */
(()=>{
const VERSION='UI 08.10 · B';
const FLOW=[['executive','Resumen ejecutivo'],['context','Argentina hoy'],['market','Mercado, momentum & estacionalidad'],['structure','Segmentos, competencia & supply'],['consumer','Consumidor & movilidad'],['forecast','Forecast CY / KI'],['user','Probabilidad & User Scenario'],['planning','Honda & Planning'],['actions','Riesgos, acciones & Safety'],['method','Metodología, validación & reportes']];
const SEGMENTS=['CUB','LMC','SC','FUN','ATV','OTHERS'];
const COLORS=['#e0182d','#2b69c9','#18845b','#b97916','#7a66c7','#607586'];
let busy=false,raf=0,lastId='';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=v=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(n(v));
const pc=v=>v==null?'—':`${v>=0?'+':''}${(v*100).toFixed(Math.abs(v)>=1?0:1)}%`;
const pp=v=>v==null?'—':`${v>=0?'+':''}${(v*100).toFixed(1)} pp`;
function modelHistory(){return (typeof V13_MODEL_HISTORY!=='undefined'&&Array.isArray(V13_MODEL_HISTORY))?V13_MODEL_HISTORY:[]}
function segOf(model){try{const x=typeof v41seg==='function'?v41seg(model):(typeof v23seg==='function'?v23seg(model):null);return String(x?.segment1||'OTHERS').toUpperCase()}catch{return 'OTHERS'}}
function brandOf(model){try{return String(typeof v41brand==='function'?v41brand(model):(typeof v32modelMeta==='function'?v32modelMeta(model)?.brand:'')||String(model).split(' ')[0]||'OTHER').toUpperCase()}catch{return String(model).split(' ')[0].toUpperCase()}}
function aggregate(){
  const hist=modelHistory();
  return hist.map(r=>{
    const out={period:r.period,segments:{}};SEGMENTS.forEach(s=>out.segments[s]={total:0,brands:{}});
    Object.keys(r||{}).filter(k=>!['period','total','value'].includes(k)).forEach(model=>{
      const q=n(r[model]);if(q<=0)return;let s=segOf(model);if(!SEGMENTS.includes(s))s='OTHERS';const b=brandOf(model);
      out.segments[s].total+=q;out.segments[s].brands[b]=(out.segments[s].brands[b]||0)+q;
    });return out
  })
}
function visibleMonths(rows){
  const v=String(document.getElementById('periodFilter')?.value||'24');
  const limit=v==='24'?24:48;return rows.slice(-Math.min(limit,rows.length))
}
function brandColor(name,i){return name==='HONDA'?'#e0182d':COLORS[(i+1)%COLORS.length]}
function smooth(points){
  if(!points.length)return '';if(points.length===1)return `M${points[0][0]},${points[0][1]}`;
  let d=`M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for(let i=0;i<points.length-1;i++){
    const p0=points[i-1]||points[i],p1=points[i],p2=points[i+1],p3=points[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`
  }return d
}
function currentRanking(rows,seg){
  const last=rows.at(-1)?.segments?.[seg];if(!last)return [];
  return Object.entries(last.brands).map(([brand,value])=>({brand,value:n(value),share:last.total?n(value)/last.total:0})).sort((a,b)=>b.value-a.value)
}
function metricAt(rows,seg,brand,i){const s=rows[i]?.segments?.[seg];return {v:n(s?.brands?.[brand]),total:n(s?.total)}}
function outsiders(rows,seg,top5){
  if(rows.length<4)return [];
  const rank=currentRanking(rows,seg),top=new Set(top5),lastI=rows.length-1,latest=rows[lastI].segments[seg],minVolume=Math.max(20,n(latest.total)*.01);
  return rank.filter(x=>!top.has(x.brand)&&x.value>=minVolume).map(x=>{
    const cur=metricAt(rows,seg,x.brand,lastI),yoyI=lastI-12,old=yoyI>=0?metricAt(rows,seg,x.brand,yoyI):null;
    const yoy=old&&old.v>0?cur.v/old.v-1:null;
    const a3=[lastI-2,lastI-1,lastI].filter(i=>i>=0).map(i=>metricAt(rows,seg,x.brand,i).v),p3=[lastI-5,lastI-4,lastI-3].filter(i=>i>=0).map(i=>metricAt(rows,seg,x.brand,i).v);
    const av=a=>a.length?a.reduce((s,v)=>s+v,0)/a.length:0,now3=av(a3),prev3=av(p3),growth3=prev3>0?now3/prev3-1:null;
    const refI=Math.max(0,lastI-3),ref=metricAt(rows,seg,x.brand,refI),share=cur.total?cur.v/cur.total:0,shareRef=ref.total?ref.v/ref.total:0,shareGain=share-shareRef;
    const score=Math.max(0,growth3||0)*.35+Math.max(0,yoy||0)*.25+Math.max(0,shareGain)*15;
    return {...x,yoy,growth3,shareGain,score}
  }).filter(x=>(x.growth3!=null&&x.growth3>=.30)||(x.yoy!=null&&x.yoy>=.50)||x.shareGain>=.0075).sort((a,b)=>b.score-a.score).slice(0,3)
}
function chart(rows,seg,leaders){
  const W=760,H=270,L=48,R=14,T=16,B=34,PW=W-L-R,PH=H-T-B;
  const totals=rows.map(r=>n(r.segments?.[seg]?.total));const series=leaders.map(b=>rows.map(r=>n(r.segments?.[seg]?.brands?.[b])));const max=Math.max(1,...totals,...series.flat())*1.08;
  const xy=(i,v)=>[L+(i/Math.max(1,rows.length-1))*PW,T+PH-v/max*PH];
  const grid=[0,.25,.5,.75,1].map(q=>{const y=T+PH-q*PH;return `<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" class="v53-gridline"/><text x="${L-8}" y="${y+3}" text-anchor="end" class="v53-axis">${nf(max*q)}</text>`}).join('');
  const totalPts=totals.map((v,i)=>xy(i,v));
  const brands=leaders.map((b,bi)=>{const vals=series[bi],pts=vals.map((v,i)=>xy(i,v)),c=brandColor(b,bi);return `<path d="${smooth(pts)}" class="v53-brand-line" style="stroke:${c}"/><circle cx="${pts.at(-1)?.[0]||0}" cy="${pts.at(-1)?.[1]||0}" r="3" fill="${c}"><title>${esc(b)} · ${nf(vals.at(-1))}</title></circle>`}).join('');
  const ticks=[0,Math.floor((rows.length-1)/4),Math.floor((rows.length-1)/2),Math.floor((rows.length-1)*3/4),rows.length-1].filter((x,i,a)=>x>=0&&a.indexOf(x)===i).map(i=>{const x=xy(i,0)[0],p=String(rows[i]?.period||'').slice(2).replace('-','/');return `<text x="${x}" y="${H-9}" text-anchor="${i===0?'start':i===rows.length-1?'end':'middle'}" class="v53-axis">${p}</text>`}).join('');
  const legend=[`<span><i style="background:#182331"></i>Mercado ${seg}</span>`,...leaders.map((b,i)=>`<span><i style="background:${brandColor(b,i)}"></i>${esc(b)}</span>`)].join('');
  return `<div class="v53-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución mensual ${seg} y top cinco marcas">${grid}<path d="${smooth(totalPts)}" class="v53-market-line"/>${brands}${ticks}</svg><div class="v53-legend">${legend}</div></div>`
}
function alertHtml(list){
  if(!list.length)return `<div class="v53-no-alert">Sin outsider fuera del Top 5 superando los umbrales de aceleración en el último corte.</div>`;
  return `<div class="v53-outsiders">${list.map(x=>{const trigger=x.shareGain>=.0075?`${pp(x.shareGain)} share`:x.yoy!=null&&x.yoy>=.5?`${pc(x.yoy)} YoY`:x.growth3!=null?`${pc(x.growth3)} ritmo 3M`:'aceleración';return `<div class="v53-outsider"><div><span>OUTSIDER · #${currentRankNumber(x)}</span><b>${esc(x.brand)}</b></div><strong>${nf(x.value)} u.</strong><small>${trigger} · share ${(x.share*100).toFixed(1)}%</small></div>`}).join('')}</div>`
}
function currentRankNumber(x){return x._rank||'6+'}
function card(rows,seg){
  const ranking=currentRanking(rows,seg),leaders=ranking.slice(0,5).map(x=>x.brand),alerts=outsiders(rows,seg,leaders);alerts.forEach(a=>a._rank=ranking.findIndex(r=>r.brand===a.brand)+1);
  const total=n(rows.at(-1)?.segments?.[seg]?.total),lead=ranking[0]?.brand||'—';
  return `<article class="v53-seg-card"><div class="v53-seg-top"><div><span class="eyebrow">MONTHLY SEGMENT PULSE</span><h3>${seg}</h3><p>Volumen mensual real + Top 5 actual dentro del segmento.</p></div><div class="v53-seg-kpi"><b>${nf(total)}</b><small>${esc(rows.at(-1)?.period||'—')} · líder ${esc(lead)}</small></div></div>${chart(rows,seg,leaders)}<div class="v53-outsider-head"><b>Outsider watch</b><span>Fuera del Top 5 · 3M / YoY / share</span></div>${alertHtml(alerts)}</article>`
}
function addSegmentPulse(){
  const host=document.getElementById('structure');if(!host||host.querySelector('#v53SegmentPulse'))return;
  const all=aggregate();if(!all.length)return;const rows=visibleMonths(all);if(!rows.length)return;
  const selected=String(document.getElementById('segmentFilter')?.value||'TOTAL'),segs=selected==='TOTAL'?SEGMENTS:[selected].filter(s=>SEGMENTS.includes(s));
  const wrap=document.createElement('section');wrap.id='v53SegmentPulse';wrap.className='v53-segment-block';
  wrap.innerHTML=`<div class="v53-segment-head"><div><span class="eyebrow">SEGMENT INTELLIGENCE · PIVOT</span><h2>Mercado mes a mes por segmento + Top 5</h2><p>Sin rolling: curvas suavizadas sobre patentamientos mensuales reales para ver el tamaño de cada segmento y cómo se mueve su Top 5 competitivo. El radar outsider detecta aceleraciones antes de entrar al Top 5.</p></div><span class="v53-cutoff">CORTE ${esc(rows.at(-1)?.period||'—')}</span></div><div class="v53-segment-grid ${segs.length===1?'one':''}">${segs.map(s=>card(rows,s)).join('')}</div><div class="v53-method"><b>Outsider:</b> marca fuera del Top 5 con volumen material y al menos una señal: ritmo 3M ≥30%, YoY ≥50% o ganancia de share ≥0,75 pp.</div>`;
  const grids=host.querySelectorAll(':scope > .grid');if(grids.length)grids[0].insertAdjacentElement('afterend',wrap);else host.appendChild(wrap)
}
function orderReport(){
  const content=document.getElementById('content'),nav=document.getElementById('navigation');if(!content||!nav)return;
  const existing=FLOW.filter(([id])=>document.getElementById(id));if(existing.length<5)return;
  const want=existing.map(x=>x[0]).join('|'),now=[...content.querySelectorAll(':scope > .single-chapter[id]')].map(x=>x.id).join('|');
  if(now!==want)existing.forEach(([id])=>{const s=document.getElementById(id);if(s)content.appendChild(s)});
  const navNow=[...nav.querySelectorAll('[data-anchor]')].map(x=>x.dataset.anchor).filter(id=>existing.some(e=>e[0]===id)).join('|');
  if(navNow!==want)existing.forEach(([id])=>{const b=nav.querySelector(`[data-anchor="${id}"]`);if(b)nav.appendChild(b)});
  existing.forEach(([id,title],i)=>{const num=String(i+1).padStart(2,'0'),s=document.getElementById(id),h=s?.querySelector(':scope > header');const hi=h?.querySelector(':scope > i');if(hi)hi.textContent=num;const cap=h?.querySelector('span');if(cap&&/^CAPÍTULO/i.test(cap.textContent||''))cap.textContent=`CAPÍTULO ${num}`;const b=nav.querySelector(`[data-anchor="${id}"]`);if(b){const bi=b.querySelector('i'),bs=b.querySelector('span');if(bi)bi.textContent=num;if(bs)bs.textContent=title}})
}
function buildBadge(){
  if(document.querySelector('.v53-build'))return;const actions=document.querySelector('.top-actions');if(!actions)return;const badge=document.createElement('span');badge.className='v53-build';badge.textContent=VERSION;badge.title='Versión visual operativa activa';actions.prepend(badge)
}
function setActive(id){
  if(!id)return;document.querySelectorAll('#navigation [data-anchor]').forEach(b=>{const on=b.dataset.anchor===id;b.dataset.v53Active=on?'true':'false';b.classList.toggle('viewing',on);if(on)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current')});
  const b=document.querySelector(`#navigation [data-anchor="${id}"]`),label=b?.querySelector('span')?.textContent?.trim();if(label){const t=document.getElementById('viewTitle');if(t)t.textContent=label}if(id!==lastId){b?.scrollIntoView({block:'nearest'});lastId=id}
}
function detect(){
  raf=0;const secs=[...document.querySelectorAll('.single-chapter[id]')];if(!secs.length)return;const top=(document.querySelector('.topbar')?.getBoundingClientRect().height||0)+(document.querySelector('.filters')?.getBoundingClientRect().height||0)+28;let cur=secs[0];for(const s of secs){const r=s.getBoundingClientRect();if(r.top<=top)cur=s;if(r.top<=top&&r.bottom>top){cur=s;break}}if(innerHeight+scrollY>=document.documentElement.scrollHeight-18)cur=secs.at(-1);setActive(cur.id)
}
function scheduleDetect(){if(!raf)raf=requestAnimationFrame(detect)}
function patch(){if(busy)return;busy=true;try{buildBadge();orderReport();addSegmentPulse();scheduleDetect()}finally{busy=false}}
function start(){
  buildBadge();patch();
  const content=document.getElementById('content');if(content)new MutationObserver(()=>queueMicrotask(patch)).observe(content,{childList:true,subtree:false});
  window.addEventListener('scroll',scheduleDetect,{passive:true});window.addEventListener('resize',scheduleDetect,{passive:true});window.addEventListener('hashchange',scheduleDetect);
  document.addEventListener('change',e=>{if(e.target?.matches?.('#periodFilter,#segmentFilter'))setTimeout(()=>{document.getElementById('v53SegmentPulse')?.remove();addSegmentPulse()},0)},true);
  document.addEventListener('click',e=>{const b=e.target.closest?.('#navigation [data-anchor]');if(b){setActive(b.dataset.anchor);setTimeout(scheduleDetect,250)}},true);
  setTimeout(patch,120);setTimeout(patch,700);setTimeout(patch,1800)
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
