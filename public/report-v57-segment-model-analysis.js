/* 2W v57 · segment market total + Top 5 MODELS monthly analysis */
(()=>{
const SEGMENTS=['CUB','LMC','SC','FUN','ATV','OTHERS'];
const COLORS=['#e0182d','#315d7f','#18845b','#b97916','#7a66c7','#607586'];
let WINDOW=(()=>{try{return localStorage.getItem('2w.v57.segmentModelWindow')||'24'}catch{return '24'}})();
let timer=null,lastKey='';
const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const nf=v=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(n(v));
const pct=v=>v==null?'—':`${v>=0?'+':''}${(v*100).toFixed(1)}%`;
function hist(){try{return (typeof V13_MODEL_HISTORY!=='undefined'&&Array.isArray(V13_MODEL_HISTORY))?V13_MODEL_HISTORY:[]}catch{return []}}
function segOf(model){try{return String(typeof v41seg==='function'?v41seg(model)?.segment1:(typeof v23seg==='function'?v23seg(model)?.segment1:'OTHERS')||'OTHERS').toUpperCase()}catch{return 'OTHERS'}}
function brandOf(model){try{return String(typeof v41brand==='function'?v41brand(model):(typeof v32modelMeta==='function'?v32modelMeta(model)?.brand:'')||String(model).split(' ')[0]).toUpperCase()}catch{return String(model).split(' ')[0].toUpperCase()}}
function modelLabel(model){const b=brandOf(model),raw=String(model||'').trim();return raw.toUpperCase().startsWith(b+' ')?raw.slice(b.length+1):raw}
function modelKeys(rows){return [...new Set(rows.flatMap(r=>Object.keys(r||{}).filter(k=>!['period','total','value'].includes(k))))]}
function aggregate(){
  const rows=hist(); if(!rows.length)return null;
  const models=modelKeys(rows), meta=new Map(models.map(m=>[m,{seg:segOf(m),brand:brandOf(m)}]));
  const out=rows.map(r=>{const o={period:r.period,segments:{}};SEGMENTS.forEach(s=>o.segments[s]={total:0,models:{}});for(const m of models){const q=n(r?.[m]);if(q<=0)continue;let s=meta.get(m)?.seg||'OTHERS';if(!SEGMENTS.includes(s))s='OTHERS';o.segments[s].total+=q;o.segments[s].models[m]=q}return o});
  return {rows:out,models,meta};
}
function avg(a){return a.length?a.reduce((s,v)=>s+n(v),0)/a.length:0}
function ranking(data,seg){
  const rows=data.rows,look=rows.slice(-Math.min(12,rows.length)),scores={};
  for(const r of look)for(const [m,v] of Object.entries(r.segments?.[seg]?.models||{}))scores[m]=(scores[m]||0)+n(v);
  return Object.entries(scores).map(([model,r12])=>({model,r12,brand:data.meta.get(model)?.brand||brandOf(model),current:n(rows.at(-1)?.segments?.[seg]?.models?.[model])})).sort((a,b)=>b.r12-a.r12);
}
function availableWindow(rows){const want=WINDOW==='all'?rows.length:Math.max(1,Number(WINDOW)||24);return rows.slice(-Math.min(want,rows.length))}
function smooth(points){if(!points.length)return '';if(points.length===1)return `M${points[0][0]},${points[0][1]}`;let d=`M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;for(let i=0;i<points.length-1;i++){const p0=points[i-1]||points[i],p1=points[i],p2=points[i+1],p3=points[i+2]||p2,c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6,c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;d+=` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`}return d}
function lineColor(item,i){return item.brand==='HONDA'?'#e0182d':COLORS[(i+1)%COLORS.length]}
function chart(data,seg,top){
  const rows=availableWindow(data.rows),W=900,H=330,L=58,R=18,T=20,B=42,PW=W-L-R,PH=H-T-B;
  const totals=rows.map(r=>n(r.segments?.[seg]?.total));
  const modelSeries=top.map(x=>({item:x,vals:rows.map(r=>n(r.segments?.[seg]?.models?.[x.model]))}));
  const max=Math.max(1,...totals,...modelSeries.flatMap(x=>x.vals))*1.08,xy=(i,v)=>[L+(i/Math.max(1,rows.length-1))*PW,T+PH-n(v)/max*PH];
  const grid=[0,.25,.5,.75,1].map(q=>{const y=T+PH-q*PH;return `<line x1="${L}" x2="${W-R}" y1="${y}" y2="${y}" class="v54-gridline"/><text x="${L-9}" y="${y+3}" text-anchor="end" class="v54-axis">${nf(max*q)}</text>`}).join('');
  const totalPath=smooth(totals.map((v,i)=>xy(i,v)));
  const paths=modelSeries.map((s,i)=>{const pts=s.vals.map((v,j)=>xy(j,v)),c=lineColor(s.item,i),lab=`${s.item.brand} ${modelLabel(s.item.model)}`;return `<path d="${smooth(pts)}" class="v57-model-line" style="stroke:${c}"/><circle cx="${pts.at(-1)?.[0]||0}" cy="${pts.at(-1)?.[1]||0}" r="3.4" fill="${c}"><title>${esc(lab)} · ${nf(s.vals.at(-1))}</title></circle>`}).join('');
  const tickIds=[0,Math.floor((rows.length-1)/4),Math.floor((rows.length-1)/2),Math.floor((rows.length-1)*3/4),rows.length-1].filter((x,i,a)=>x>=0&&a.indexOf(x)===i);
  const ticks=tickIds.map(i=>{const x=xy(i,0)[0],lab=String(rows[i]?.period||'').slice(2).replace('-','/');return `<text x="${x}" y="${H-12}" text-anchor="${i===0?'start':i===rows.length-1?'end':'middle'}" class="v54-axis">${lab}</text>`}).join('');
  const legend=[`<span><i style="background:#182331"></i><b>Mercado ${seg}</b></span>`,...top.map((x,i)=>`<span><i style="background:${lineColor(x,i)}"></i>${esc(x.brand)} ${esc(modelLabel(x.model))}</span>`)].join('');
  return `<div class="v54-chart v57-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="${seg}: mercado total mensual y Top 5 modelos"><path d="${totalPath}" class="v54-market-line"/>${grid}${paths}${ticks}</svg><div class="v54-legend v57-legend">${legend}</div></div>`
}
function outsider(data,seg,top){
  const rank=ranking(data,seg),topSet=new Set(top.map(x=>x.model)),rows=data.rows,last=rows.length-1;
  return rank.filter(x=>!topSet.has(x.model)).map(x=>{const vals=rows.map(r=>n(r.segments?.[seg]?.models?.[x.model])),now3=avg(vals.slice(-3)),prev3=avg(vals.slice(-6,-3)),mom3=prev3>0?now3/prev3-1:null,yoy=vals.length>=13&&n(vals.at(-13))>0?n(vals.at(-1))/n(vals.at(-13))-1:null;return {...x,mom3,yoy}}).filter(x=>(x.mom3!=null&&x.mom3>=.30)||(x.yoy!=null&&x.yoy>=.50)).slice(0,3)
}
function card(data,seg){
  const rows=data.rows,rank=ranking(data,seg),top=rank.slice(0,5),lastTotal=n(rows.at(-1)?.segments?.[seg]?.total),prevTotal=rows.length>=13?n(rows.at(-13)?.segments?.[seg]?.total):0,yoy=prevTotal?lastTotal/prevTotal-1:null;
  const topSum=top.reduce((s,x)=>s+x.r12,0),seg12=rows.slice(-12).reduce((s,r)=>s+n(r.segments?.[seg]?.total),0),share12=seg12?topSum/seg12:0,alerts=outsider(data,seg,top);
  return `<article class="v54-seg-card v57-seg-card"><div class="v54-card-head"><div><span class="eyebrow">SEGMENT MONTHLY · TOP 5 MODELS</span><h3>${seg}</h3><p>Línea gruesa = suma de todos los modelos del segmento. Líneas finas = Top 5 modelos por acumulado 12M.</p></div><div class="v54-main-kpi"><b>${nf(lastTotal)}</b><small>${esc(rows.at(-1)?.period||'—')} · mercado segmento</small></div></div><div class="v54-mini-kpis"><span><small>YoY segmento</small><b class="${yoy!=null&&yoy<0?'down':'up'}">${pct(yoy)}</b></span><span><small>Top 5 · share 12M</small><b>${(share12*100).toFixed(1)}%</b></span><span><small>Líder 12M</small><b>${top[0]?esc(top[0].brand+' '+modelLabel(top[0].model)):'—'}</b><em>${top[0]?nf(top[0].r12)+' u.':'—'}</em></span></div>${chart(data,seg,top)}<div class="v57-ranking">${top.map((x,i)=>`<div><span>#${i+1}</span><b>${esc(x.brand)} ${esc(modelLabel(x.model))}</b><strong>${nf(x.r12)}</strong><small>acum. 12M</small></div>`).join('')}</div><div class="v54-alert-title"><b>Model outsider watch</b><span>fuera del Top 5 · aceleración 3M / YoY</span></div>${alerts.length?`<div class="v54-outsiders">${alerts.map(x=>`<div class="v54-outsider"><span>OUTSIDER</span><b>${esc(x.brand)} ${esc(modelLabel(x.model))}</b><strong>${nf(x.current)} u.</strong><small>${x.mom3!=null&&x.mom3>=.30?pct(x.mom3)+' ritmo 3M':pct(x.yoy)+' YoY'}</small></div>`).join('')}</div>`:'<div class="v54-no-alert">Sin modelos fuera del Top 5 con aceleración material en el último corte.</div>'}</article>`
}
function selected(){const v=String(document.getElementById('segmentFilter')?.value||'TOTAL').toUpperCase();return v!=='TOTAL'&&SEGMENTS.includes(v)?[v]:SEGMENTS}
function controls(total){const vals=[['12','12M'],['24','24M'],['48','48M'],['all','TODO']].filter(([v])=>v==='all'||Number(v)<=Math.max(12,total));return vals.map(([v,l])=>`<button data-v57-window="${v}" class="${WINDOW===v?'active':''}">${l}</button>`).join('')}
function html(data){const segs=selected(),cut=data.rows.at(-1)?.period||'—';return `<div class="v54-segment-head"><div><span class="eyebrow">SEGMENT INTELLIGENCE · PIVOT MODEL HISTORY</span><h2>Volumen de mercado del segmento + Top 5 modelos</h2><p>Sin rolling. Cada punto es el patentamiento real de ese mes. El mercado del segmento es la suma de todos sus modelos; el Top 5 se define por acumulado de los últimos 12 meses disponibles.</p></div><div class="v54-head-side"><span>CORTE ${esc(cut)}</span><div class="v54-window">${controls(data.rows.length)}</div></div></div><div class="v54-segment-grid ${segs.length===1?'one':''}">${segs.map(s=>card(data,s)).join('')}</div><div class="v54-method"><b>Lectura:</b> la línea de mercado no es rolling ni una marca: es el volumen total mensual del segmento. Las otras cinco líneas son modelos. <b>Fuente:</b> Pivot Master / Registrations + segmentación maestra.</div>`}
function bind(root){root.querySelectorAll('[data-v57-window]').forEach(b=>b.onclick=()=>{WINDOW=b.dataset.v57Window;try{localStorage.setItem('2w.v57.segmentModelWindow',WINDOW)}catch{};mount(true)})}
function mount(force=false){
  const host=document.getElementById('structure');if(!host)return false;
  const data=aggregate();if(!data||!data.rows.length)return false;
  const old54=host.querySelector('#v54SegmentPulse');if(old54)old54.style.display='none';const old53=host.querySelector('#v53SegmentPulse');if(old53)old53.style.display='none';
  const key=`${data.rows.length}|${data.rows.at(-1)?.period}|${WINDOW}|${document.getElementById('segmentFilter')?.value||'TOTAL'}`;let root=host.querySelector('#v57SegmentModelPulse');if(root&&!force&&lastKey===key)return true;if(root)root.remove();
  root=document.createElement('section');root.id='v57SegmentModelPulse';root.className='v54-segment-block v57-segment-block';root.innerHTML=html(data);const firstGrid=host.querySelector(':scope > .grid');if(firstGrid)firstGrid.insertAdjacentElement('afterend',root);else host.prepend(root);bind(root);lastKey=key;const badge=document.querySelector('.v53-build');if(badge)badge.textContent='UI 08.10 · E';window.dispatchEvent(new Event('scroll'));return true
}
function start(){
  const host=document.getElementById('structure');if(host&&!host.querySelector('#v57SegmentWaiting')){const w=document.createElement('div');w.id='v57SegmentWaiting';w.className='v57-waiting';w.innerHTML='<b>Segment Intelligence</b><span>Cargando historia de modelos de la Pivot…</span>';const first=host.querySelector(':scope > .grid');if(first)first.insertAdjacentElement('afterend',w)}
  const tryMount=()=>{if(mount()){document.getElementById('v57SegmentWaiting')?.remove()}};tryMount();timer=setInterval(tryMount,700);
  const content=document.getElementById('content');if(content)new MutationObserver(()=>queueMicrotask(tryMount)).observe(content,{childList:true,subtree:false});document.addEventListener('change',e=>{if(e.target?.id==='segmentFilter')setTimeout(()=>mount(true),0)});window.addEventListener('beforeunload',()=>timer&&clearInterval(timer),{once:true})
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
