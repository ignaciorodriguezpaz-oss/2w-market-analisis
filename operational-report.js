(()=>{
const SEGMENT_DATA=window.SEGMENT_TRENDS_DATA;
const ORDER=["CUB","LMC","SC","FUN","ATV","OTHERS"];
const PALETTE=["#e0182d","#2b69c9","#18845b","#b97916","#8a5bd1","#667085"];
const esc=s=>String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]));
const fmt=n=>new Intl.NumberFormat("es-AR",{maximumFractionDigits:0}).format(Number(n)||0);
const pct=v=>v==null?"—":`${v>=0?"+":""}${(v*100).toFixed(Math.abs(v)>=1?0:1)}%`;
const pp=v=>v==null?"—":`${v>=0?"+":""}${(v*100).toFixed(1)} pp`;
function periodLimit(){
  try{
    const v=String(state?.period||"48");
    if(v==="24")return 24;
    return 48;
  }catch{return 48}
}
function selectedSegments(){
  try{return state?.segment&&state.segment!=="TOTAL"?[state.segment]:ORDER}catch{return ORDER}
}
function pointPath(points){
  if(!points.length)return "";
  if(points.length===1)return `M${points[0][0]},${points[0][1]}`;
  let d=`M${points[0][0].toFixed(1)},${points[0][1].toFixed(1)}`;
  for(let i=0;i<points.length-1;i++){
    const p0=points[i-1]||points[i],p1=points[i],p2=points[i+1],p3=points[i+2]||p2;
    const c1x=p1[0]+(p2[0]-p0[0])/6,c1y=p1[1]+(p2[1]-p0[1])/6;
    const c2x=p2[0]-(p3[0]-p1[0])/6,c2y=p2[1]-(p3[1]-p1[1])/6;
    d+=` C${c1x.toFixed(1)},${c1y.toFixed(1)} ${c2x.toFixed(1)},${c2y.toFixed(1)} ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
  }
  return d
}
function chart(seg){
  const src=SEGMENT_DATA?.segments?.[seg]; if(!src)return "";
  const limit=Math.min(periodLimit(),SEGMENT_DATA.periods.length),start=SEGMENT_DATA.periods.length-limit;
  const periods=SEGMENT_DATA.periods.slice(start), total=src.total.slice(start);
  const leaders=Object.entries(src.leaders).map(([name,vals])=>({name,values:vals.slice(start)}));
  const all=[total,...leaders.map(x=>x.values)], max=Math.max(1,...all.flat())*1.08;
  const W=760,H=270,L=48,R=12,T=16,B=34,iw=W-L-R,ih=H-T-B;
  const xy=(i,v)=>[L+(i/(Math.max(1,periods.length-1)))*iw,T+ih-(v/max)*ih];
  const grid=[0,.25,.5,.75,1].map(q=>{
    const y=T+ih-q*ih,val=max*q;
    return `<line x1="${L}" y1="${y}" x2="${W-R}" y2="${y}" class="seg-grid"/><text x="${L-8}" y="${y+3}" text-anchor="end" class="seg-axis">${fmt(val)}</text>`
  }).join("");
  const totalPts=total.map((v,i)=>xy(i,v));
  const leaderPaths=leaders.map((s,idx)=>{
    const pts=s.values.map((v,i)=>xy(i,v)), color=s.name==="HONDA"?"#e0182d":PALETTE[(idx+1)%PALETTE.length];
    return `<path d="${pointPath(pts)}" class="seg-line brand" style="stroke:${color}"/><circle cx="${pts.at(-1)[0]}" cy="${pts.at(-1)[1]}" r="3.2" fill="${color}" class="seg-end"><title>${esc(s.name)} · ${fmt(s.values.at(-1))}</title></circle>`
  }).join("");
  const tickIdx=[0,Math.floor((periods.length-1)/4),Math.floor((periods.length-1)/2),Math.floor((periods.length-1)*3/4),periods.length-1].filter((v,i,a)=>a.indexOf(v)===i);
  const ticks=tickIdx.map(i=>`<text x="${xy(i,0)[0]}" y="${H-9}" text-anchor="${i===0?"start":i===periods.length-1?"end":"middle"}" class="seg-axis">${esc(periods[i].slice(2).replace("-","/"))}</text>`).join("");
  const legend=[`<span><i style="background:#101722"></i>Mercado ${seg}</span>`,...leaders.map((s,idx)=>`<span><i style="background:${s.name==="HONDA"?"#e0182d":PALETTE[(idx+1)%PALETTE.length]}"></i>${esc(s.name)}</span>`)].join("");
  return `<div class="segment-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolución mensual ${seg} y top cinco marcas">${grid}<path d="${pointPath(totalPts)}" class="seg-line market"/>${leaderPaths}${ticks}</svg><div class="segment-legend">${legend}</div></div>`
}
function alerts(seg){
  const a=SEGMENT_DATA?.segments?.[seg]?.alerts||[];
  if(!a.length)return `<div class="outsider-empty"><b>Sin alerta outsider</b><span>No aparece una marca fuera del Top 5 superando los umbrales de aceleración.</span></div>`;
  return `<div class="outsider-list">${a.map(x=>{
    const trigger=x.shareGain>=.0075?`${pp(x.shareGain)} share`:x.yoy!=null&&x.yoy>=.5?`${pct(x.yoy)} YoY`:x.mom3!=null?`${pct(x.mom3)} ritmo 3M`:"aceleración";
    return `<div class="outsider-alert"><div><span>OUTSIDER · #${x.rank}</span><b>${esc(x.brand)}</b></div><strong>${fmt(x.current)} u.</strong><small>${trigger} · share ${(x.share*100).toFixed(1)}%</small></div>`
  }).join("")}</div>`
}
function segmentCard(seg){
  const src=SEGMENT_DATA?.segments?.[seg], latest=src?.total?.at(-1)||0;
  const leader=src?Object.entries(src.leaders).sort((a,b)=>b[1].at(-1)-a[1].at(-1))[0]:null;
  return `<article class="segment-pulse-card"><header><div><span class="eyebrow">MONTHLY SEGMENT PULSE</span><h3>${seg}</h3><p>Volumen real mes a mes + trayectoria del Top 5 actual.</p></div><div class="segment-kpis"><b>${fmt(latest)}</b><small>${SEGMENT_DATA.cutoff} · líder ${esc(leader?.[0]||"—")}</small></div></header>${chart(seg)}<div class="outsider-head"><b>Outsider watch</b><span>Fuera del Top 5 · aceleración / share / YoY</span></div>${alerts(seg)}</article>`
}
function patchStructure(){
  const host=document.getElementById("structure"); if(!host||host.querySelector("#segmentMonthlyPulse")||!SEGMENT_DATA)return;
  const wrap=document.createElement("section"); wrap.id="segmentMonthlyPulse"; wrap.className="segment-pulse-block";
  const selected=selectedSegments();
  wrap.innerHTML=`<div class="segment-pulse-title"><div><span class="eyebrow">SEGMENT INTELLIGENCE · PIVOT / AUTOMATIC</span><h2>Mercado mensual por segmento + Top 5</h2><p>Sin rolling: volumen mensual observado y líneas suavizadas para ver cómo se mueve cada líder dentro de su segmento. La alerta outsider busca marcas fuera del Top 5 con aceleración rápida.</p></div><span class="segment-cutoff">CORTE ${SEGMENT_DATA.cutoff}</span></div><div class="segment-pulse-grid ${selected.length===1?"one":""}">${selected.map(segmentCard).join("")}</div><div class="segment-method"><b>Criterio outsider:</b> fuera del Top 5 y con volumen material, activado por aceleración 3M ≥30%, YoY ≥50% o ganancia de share ≥0,75 pp. La visual usa hasta 48 meses para conservar lectura operativa.</div>`;
  const firstGrid=host.querySelector(".grid.two"); if(firstGrid)firstGrid.insertAdjacentElement("afterend",wrap); else host.appendChild(wrap);
}
function markFilterUsefulness(){
  const f=document.querySelector(".filters"); if(!f)return;
  f.dataset.operational="true";
  const period=document.getElementById("periodFilter")?.closest("label"),segment=document.getElementById("segmentFilter")?.closest("label");
  if(period)period.classList.add("filter-core");
  if(segment)segment.classList.add("filter-core");
  ["calendarFilter","scenarioFilter"].forEach(id=>document.getElementById(id)?.closest("label")?.classList.add("filter-contextual-hidden"));
}
function patch(){markFilterUsefulness();patchStructure()}
function observe(){
  const content=document.getElementById("content");
  if(content)new MutationObserver(()=>queueMicrotask(patch)).observe(content,{childList:true,subtree:false});
  document.addEventListener("change",e=>{if(e.target?.matches?.("#periodFilter,#segmentFilter"))setTimeout(patch,0)},true);
  patch();
}
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",observe);else observe();
})();
