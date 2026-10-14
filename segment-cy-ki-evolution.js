/* 2W · Segment volume evolution by Calendar Year / KI, using governed actuals + reconciled forecast */
(()=>{
  const SEGMENTS=['CUB','LMC','SC','FUN','ATV','OTHERS'];
  const COLORS={CUB:'#e0182d',LMC:'#2b69c9',SC:'#8a5bd1',FUN:'#18845b',ATV:'#b97916',OTHERS:'#7f8a99'};
  const SCENARIO_LABEL={base:'Base',down:'Downside',up:'Upside',user:'Usuario'};
  let mounting=false;

  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
  const finite=v=>Number.isFinite(Number(v));
  const fmt=v=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(n(v));
  const pct=v=>Number.isFinite(v)?`${v>=0?'+':''}${(v*100).toFixed(1).replace('.',',')}%`:'—';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#39;'}[c]));
  const current=(id,fallback)=>String(document.getElementById(id)?.value||fallback);
  const scenario=()=>current('scenarioFilter','base').toLowerCase();
  const calendar=()=>current('calendarFilter','CY').toUpperCase()==='KI'?'KI':'CY';
  const selectedSegment=()=>{const x=current('segmentFilter','TOTAL').toUpperCase();return SEGMENTS.includes(x)?x:'TOTAL'};

  function emptySegments(){return Object.fromEntries(SEGMENTS.map(s=>[s,0]))}
  function largestRemainder(weights,total){
    const target=Math.max(0,Math.round(n(total))),entries=SEGMENTS.map(s=>[s,Math.max(0,n(weights[s]))]);
    const wsum=entries.reduce((a,[,v])=>a+v,0)||1;
    const raw=entries.map(([s,w])=>({s,x:target*w/wsum}));
    const out=emptySegments();let used=0;
    raw.forEach(r=>{out[r.s]=Math.floor(r.x);used+=out[r.s]});
    raw.sort((a,b)=>(b.x-Math.floor(b.x))-(a.x-Math.floor(a.x))).slice(0,Math.max(0,target-used)).forEach(r=>out[r.s]++);
    return out;
  }
  function trendActuals(){
    const src=window.SEGMENT_TRENDS_DATA;if(!src?.periods?.length)return new Map();
    const map=new Map();
    src.periods.forEach((period,i)=>{const segments=emptySegments();SEGMENTS.forEach(s=>segments[s]=n(src.segments?.[s]?.total?.[i]));map.set(period,{period,segments,status:'actual',source:'Pivot / AUTOMATIC'})});
    return map;
  }
  function recentWeights(map,before){
    const rows=[...map.values()].filter(r=>r.period<before).sort((a,b)=>a.period.localeCompare(b.period)).slice(-3);
    const weights=emptySegments();rows.forEach(r=>SEGMENTS.forEach(s=>weights[s]+=n(r.segments[s])));
    if(!rows.length)SEGMENTS.forEach(s=>weights[s]=1);
    return weights;
  }
  function fillClosedStructureGaps(map){
    if(typeof DATA==='undefined'||!DATA?.market_history?.length||!map.size)return;
    const cutoff=[...map.keys()].sort().at(-1);
    DATA.market_history.filter(r=>r.period>cutoff).sort((a,b)=>a.period.localeCompare(b.period)).forEach(r=>{
      if(map.has(r.period))return;
      const weights=recentWeights(map,r.period),segments=largestRemainder(weights,r.value);
      map.set(r.period,{period:r.period,segments,status:'estimated-mix',source:'Total real CAFAM + mix estructural estimado'});
    });
  }
  function forecastSegmentValue(segRow,key,totalRow){
    if(finite(segRow?.[key]))return n(segRow[key]);
    if(key==='user'&&finite(segRow?.base)&&finite(totalRow?.user)&&finite(totalRow?.base)&&n(totalRow.base)>0)return n(segRow.base)*n(totalRow.user)/n(totalRow.base);
    if(finite(segRow?.base))return n(segRow.base);
    return 0;
  }
  function addForecast(map){
    if(typeof DATA==='undefined'||!DATA?.forecast?.rows?.length)return;
    const key=scenario(),rows=DATA.forecast.rows,segRows=DATA.forecast.segments||[];
    rows.forEach((r,i)=>{
      if(map.has(r.period))return;
      const target=n(r[key]??r.base),pack=segRows[i],raw=emptySegments();
      (pack?.segments||[]).forEach(s=>{const name=String(s.name||'').toUpperCase();if(SEGMENTS.includes(name))raw[name]=forecastSegmentValue(s,key,r)});
      let segments=raw,sum=SEGMENTS.reduce((a,s)=>a+n(raw[s]),0),fallback=false;
      if(!sum){segments=largestRemainder(recentWeights(map,r.period),target);fallback=true}
      else if(target&&Math.abs(sum-target)>1)segments=largestRemainder(raw,target);
      map.set(r.period,{period:r.period,segments,status:fallback?'forecast-fallback':'forecast',source:fallback?'Forecast total + mix reciente':'Forecast segmentado reconciliado'});
    });
  }
  function monthlyData(){const map=trendActuals();fillClosedStructureGaps(map);addForecast(map);return [...map.values()].sort((a,b)=>a.period.localeCompare(b.period))}
  function periodKey(period,cal){
    const [y,m]=String(period).split('-').map(Number);if(!y||!m)return null;
    if(cal==='CY')return {id:`CY-${y}`,sort:y,label:`CY ${y}`};
    const start=m>=4?y:y-1;return {id:`KI-${start}`,sort:start,label:`KI ${String(start).slice(-2)}/${String(start+1).slice(-2)}`};
  }
  function aggregate(rows,cal){
    const groups=new Map();
    rows.forEach(r=>{const key=periodKey(r.period,cal);if(!key)return;let g=groups.get(key.id);if(!g){g={...key,segments:emptySegments(),months:new Set(),forecastMonths:0,estimatedMonths:0};groups.set(key.id,g)}
      g.months.add(r.period);SEGMENTS.forEach(s=>g.segments[s]+=n(r.segments[s]));if(r.status.startsWith('forecast'))g.forecastMonths++;if(r.status==='estimated-mix')g.estimatedMonths++;
    });
    let out=[...groups.values()].filter(g=>g.months.size===12).sort((a,b)=>a.sort-b.sort);
    out.forEach(g=>{g.total=SEGMENTS.reduce((a,s)=>a+g.segments[s],0);g.status=g.forecastMonths?'ACTUAL + FCST':g.estimatedMonths?'ACTUAL + MIX EST.':'ACTUAL'});
    const limit=current('periodFilter','24'),count=limit==='all'?999:limit==='84'?8:limit==='48'?5:3;
    return out.slice(-count);
  }
  function growth(rows,index,seg='TOTAL'){
    if(index<=0)return null;const a=seg==='TOTAL'?rows[index].total:rows[index].segments[seg],b=seg==='TOTAL'?rows[index-1].total:rows[index-1].segments[seg];return b?a/b-1:null;
  }
  function statusClass(g){return g.forecastMonths?'forecast':g.estimatedMonths?'estimate':'actual'}
  function chart(rows,seg){
    if(!rows.length)return '<div class="syk-empty">Sin períodos completos para los filtros actuales.</div>';
    const W=920,H=350,L=64,R=18,T=32,B=52,iw=W-L-R,ih=H-T-B;
    const values=rows.map(g=>seg==='TOTAL'?g.total:g.segments[seg]),max=Math.max(1,...values)*1.12;
    const y=v=>T+ih-(n(v)/max)*ih,slot=iw/Math.max(1,rows.length),bw=Math.min(112,slot*.54);
    const grid=[0,.25,.5,.75,1].map(q=>{const val=max*q,yy=y(val);return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" class="syk-grid"/><text x="${L-9}" y="${yy+4}" text-anchor="end" class="syk-axis">${fmt(val)}</text>`}).join('');
    const bars=rows.map((g,i)=>{const x=L+slot*i+(slot-bw)/2,base=T+ih,val=values[i],top=y(val);let body='';
      if(seg==='TOTAL'){
        let cursor=base;SEGMENTS.forEach(s=>{const h=n(g.segments[s])/max*ih;cursor-=h;body+=`<rect x="${x}" y="${cursor}" width="${bw}" height="${Math.max(0,h)}" rx="2" fill="${COLORS[s]}"><title>${g.label} · ${s}: ${fmt(g.segments[s])}</title></rect>`});
      }else body=`<rect x="${x}" y="${top}" width="${bw}" height="${Math.max(0,base-top)}" rx="6" fill="${COLORS[seg]}"><title>${g.label} · ${seg}: ${fmt(val)}</title></rect>`;
      const outline=(g.forecastMonths||g.estimatedMonths)?`<rect x="${x-3}" y="${top-3}" width="${bw+6}" height="${Math.max(0,base-top)+6}" rx="8" class="syk-outline ${statusClass(g)}"/>`:'';
      const gr=growth(rows,i,seg),delta=gr==null?'':`<text x="${x+bw/2}" y="${Math.max(13,top-20)}" text-anchor="middle" class="syk-delta ${gr>=0?'up':'down'}">${pct(gr)}</text>`;
      return `${body}${outline}<text x="${x+bw/2}" y="${Math.max(27,top-7)}" text-anchor="middle" class="syk-value">${fmt(val)}</text>${delta}<text x="${x+bw/2}" y="${H-20}" text-anchor="middle" class="syk-xlabel">${esc(g.label)}</text>`;
    }).join('');
    return `<div class="syk-chart-wrap"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Volumen ${seg==='TOTAL'?'por segmento':seg} por ${calendar()==='KI'?'KI':'año calendario'}">${grid}${bars}</svg></div>`;
  }
  function legend(seg){
    if(seg!=='TOTAL')return `<div class="syk-legend"><span><i style="background:${COLORS[seg]}"></i>${seg}</span><span class="syk-legend-note">Borde punteado = período con mix estimado y/o forecast</span></div>`;
    return `<div class="syk-legend">${SEGMENTS.map(s=>`<span><i style="background:${COLORS[s]}"></i>${s==='OTHERS'?'Others':s}</span>`).join('')}<span class="syk-legend-note">Borde punteado = período con mix estimado y/o forecast</span></div>`;
  }
  function kpis(rows,seg){
    const last=rows.at(-1),prev=rows.at(-2);if(!last)return '';
    const main=seg==='TOTAL'?last.total:last.segments[seg],gr=prev?(seg==='TOTAL'?main/prev.total-1:main/prev.segments[seg]-1):null;
    const leader=SEGMENTS.map(s=>({s,v:last.segments[s]})).sort((a,b)=>b.v-a.v)[0],fast=prev?SEGMENTS.map(s=>({s,g:prev.segments[s]?last.segments[s]/prev.segments[s]-1:null})).filter(x=>x.g!==null).sort((a,b)=>b.g-a.g)[0]:null;
    return `<div class="syk-kpis"><div><span>${seg==='TOTAL'?'Mercado del período':seg+' volumen'}</span><b>${fmt(main)}</b><small>${esc(last.label)} · ${last.status}</small></div><div><span>Vs período anterior</span><b class="${gr!=null&&gr<0?'neg':'pos'}">${pct(gr)}</b><small>${prev?`${prev.label} → ${last.label}`:'sin comparación'}</small></div><div><span>Segmento líder</span><b>${leader?.s||'—'}</b><small>${leader?`${fmt(leader.v)} · ${(leader.v/Math.max(1,last.total)*100).toFixed(1).replace('.',',')}%`:'—'}</small></div><div><span>Mayor aceleración</span><b>${fast?.s||'—'}</b><small>${fast?pct(fast.g):'sin comparación'}</small></div></div>`;
  }
  function table(rows,seg){
    if(seg!=='TOTAL')return `<div class="syk-table-wrap"><table class="syk-table"><thead><tr><th>Período</th><th>${seg}</th><th>Vs ant.</th><th>Share</th><th>Mercado</th><th>Estado</th></tr></thead><tbody>${rows.map((g,i)=>{const v=g.segments[seg],share=g.total?v/g.total:0;return `<tr><td><b>${esc(g.label)}</b></td><td>${fmt(v)}</td><td class="${growth(rows,i,seg)!=null&&growth(rows,i,seg)<0?'neg':'pos'}">${pct(growth(rows,i,seg))}</td><td>${(share*100).toFixed(1).replace('.',',')}%</td><td>${fmt(g.total)}</td><td><span class="syk-status ${statusClass(g)}">${g.status}</span></td></tr>`}).join('')}</tbody></table></div>`;
    return `<div class="syk-table-wrap"><table class="syk-table wide"><thead><tr><th>Período</th>${SEGMENTS.map(s=>`<th>${s==='OTHERS'?'Others':s}</th>`).join('')}<th>Total</th><th>Vs ant.</th><th>Estado</th></tr></thead><tbody>${rows.map((g,i)=>`<tr><td><b>${esc(g.label)}</b></td>${SEGMENTS.map(s=>{const share=g.total?g.segments[s]/g.total:0,gr=growth(rows,i,s);return `<td><b>${fmt(g.segments[s])}</b><small>${(share*100).toFixed(1).replace('.',',')}%${gr==null?'':` · ${pct(gr)}`}</small></td>`}).join('')}<td><b>${fmt(g.total)}</b></td><td class="${growth(rows,i)!=null&&growth(rows,i)<0?'neg':'pos'}">${pct(growth(rows,i))}</td><td><span class="syk-status ${statusClass(g)}">${g.status}</span></td></tr>`).join('')}</tbody></table></div>`;
  }
  function html(){
    const cal=calendar(),seg=selectedSegment(),rows=aggregate(monthlyData(),cal),sc=scenario();
    if(!rows.length)return '<div class="syk-empty">No hay datos suficientes para construir períodos completos.</div>';
    return `<div class="syk-head"><div><span class="eyebrow">SEGMENT FORECAST EVOLUTION</span><h3>Volumen por segmento · ${cal==='CY'?'año a año':'KI x KI'}</h3><p>Comparación estructural del mercado por segmento. Actuals gobernados + cierre de gap estructural + forecast segmentado del mismo escenario que usa 2W Market.</p></div><div class="syk-controls"><div class="syk-toggle" role="group" aria-label="Calendario"><button data-syk-cal="CY" class="${cal==='CY'?'active':''}">CY · Ene–Dic</button><button data-syk-cal="KI" class="${cal==='KI'?'active':''}">KI · Abr–Mar</button></div><span class="syk-scenario">ESCENARIO · ${esc(SCENARIO_LABEL[sc]||sc)}</span></div></div>${kpis(rows,seg)}<div class="syk-card"><div class="syk-card-title"><div><b>${seg==='TOTAL'?'Mix y volumen total':'Volumen '+seg}</b><span>${cal==='CY'?'Calendar Year vs Calendar Year':'KI vs KI · abril a marzo'}</span></div><span>${rows.at(-1).status}</span></div>${legend(seg)}${chart(rows,seg)}</div><div class="syk-card"><div class="syk-card-title"><div><b>Detalle comparativo</b><span>Volumen, share, variación y condición del dato</span></div></div>${table(rows,seg)}</div><div class="syk-method"><b>Gobernanza:</b> hasta el corte estructural se usa Pivot/AUTOMATIC. Si CAFAM ya cerró un mes y todavía no existe mix por segmento, el total real se distribuye con el mix de los últimos 3 meses y se marca <b>MIX EST.</b>. Los meses futuros toman <b>${esc(SCENARIO_LABEL[sc]||sc)}</b> desde el forecast segmentado reconciliado. No se presenta como Actual ningún mix que todavía no esté cerrado por fuente estructural.</div>`;
  }
  function bindLocal(root){root.querySelectorAll('[data-syk-cal]').forEach(btn=>btn.addEventListener('click',()=>{const sel=document.getElementById('calendarFilter');if(!sel)return;sel.value=btn.dataset.sykCal;sel.dispatchEvent(new Event('change',{bubbles:true}))}))}
  function key(){return [calendar(),scenario(),selectedSegment(),current('periodFilter','24'),window.SEGMENT_TRENDS_DATA?.cutoff||'',typeof DATA!=='undefined'?DATA?.meta?.market_cutoff||'':'',typeof STORY!=='undefined'?STORY.userAdj:''].join('|')}
  function mount(force=false){
    if(mounting||typeof DATA==='undefined'||!DATA||!window.SEGMENT_TRENDS_DATA)return;const host=document.getElementById('forecast');if(!host)return;
    const fingerprint=key(),old=host.querySelector('#segmentCyKiEvolution');if(old?.dataset.key===fingerprint&&!force)return;mounting=true;
    try{const node=document.createElement('section');node.id='segmentCyKiEvolution';node.className='syk-block';node.dataset.key=fingerprint;node.innerHTML=html();if(old)old.replaceWith(node);else{const note=host.querySelector('.note');if(note)host.insertBefore(node,note);else host.appendChild(node)}bindLocal(node)}finally{mounting=false}
  }
  function start(){mount(true);const content=document.getElementById('content');if(content)new MutationObserver(()=>queueMicrotask(()=>mount())).observe(content,{childList:true,subtree:false});document.addEventListener('change',e=>{if(['calendarFilter','scenarioFilter','segmentFilter','periodFilter'].includes(e.target?.id))setTimeout(()=>mount(true),0)},true);document.addEventListener('input',e=>{if(e.target?.id==='uAdj')setTimeout(()=>mount(true),0)},true);setInterval(()=>mount(),1400)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();