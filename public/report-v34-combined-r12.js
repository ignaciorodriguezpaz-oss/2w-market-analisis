/* 2W Market Analysis v34 — combined Rolling 12M market + Honda + competitive share */
const V34_VERSION='20261008-combined-r12-v1';
let V34_MODE=(()=>{try{return localStorage.getItem('2w.r12.mode')||'brand'}catch{return 'brand'}})();
let V34_RANGE=(()=>{try{return Number(localStorage.getItem('2w.r12.range')||60)}catch{return 60}})();
const V34_MODES={brand:'Marcas',group:'Grupos',segment:'Segmentos'};
const V34_SERIES_COLORS=['#2b69c9','#16a085','#b97916','#8a5bd1','#536271','#00a6a6'];

function v34save(){try{localStorage.setItem('2w.r12.mode',V34_MODE);localStorage.setItem('2w.r12.range',String(V34_RANGE))}catch{}}
function v34esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function v34monthLabel(p){const m=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];const [y,mm]=String(p||'').split('-');return y&&mm?`${m[Number(mm)-1]||mm} ${String(y).slice(-2)}`:String(p||'')}
function v34k(v){const n=Number(v)||0;return `${(n/1000).toLocaleString('es-AR',{minimumFractionDigits:n>=100000?0:1,maximumFractionDigits:1})}k`}
function v34p(v){return `${((Number(v)||0)*100).toLocaleString('es-AR',{minimumFractionDigits:1,maximumFractionDigits:1})}%`}
function v34sum(a){return (a||[]).reduce((s,v)=>s+(Number(v)||0),0)}
function v34marketMap(){return new Map((DATA?.market_history||[]).map(r=>[r.period,Number(r.value)||0]))}
function v34marketR12All(){
  const h=DATA?.market_history||[],out=[];
  for(let i=11;i<h.length;i++)out.push({period:h[i].period,market:v34sum(h.slice(i-11,i+1).map(r=>r.value))});
  return out;
}
function v34segmentMonthly(){
  const rows=DATA?.segment_history||[];
  return rows.map(r=>{
    const out={period:r.period};
    (r.segments||[]).forEach(s=>{out[s.name]=(Number(s.value)||0)});
    return out;
  });
}
function v34monthly(type){
  if(type==='brand')return (typeof V3_ROLL!=='undefined'&&V3_ROLL?.brand_history)||[];
  if(type==='group')return (typeof V3_ROLL!=='undefined'&&V3_ROLL?.group_history)||[];
  return v34segmentMonthly();
}
function v34availableNames(type){
  if(type==='brand')return (typeof V3_ROLL!=='undefined'&&V3_ROLL?.brands)||[];
  if(type==='group')return (typeof V3_ROLL!=='undefined'&&V3_ROLL?.groups)||[];
  const last=v34segmentMonthly().at(-1)||{};return Object.keys(last).filter(k=>k!=='period');
}
function v34rollingEntities(type){
  const rows=v34monthly(type),market=v34marketMap(),names=v34availableNames(type),out=[];
  for(let i=11;i<rows.length;i++){
    const win=rows.slice(i-11,i+1),den=v34sum(win.map(r=>market.get(r.period)||0));
    const row={period:rows[i].period,market:den};
    names.forEach(n=>{const volume=v34sum(win.map(r=>r[n]));row[n]=volume;row[`${n}__share`]=den?volume/den:0});
    out.push(row);
  }
  return out;
}
function v34latestRank(type,limit=5){
  const strict=v34rollingEntities(type),last=strict.at(-1),names=v34availableNames(type);
  let ranked=[];
  if(last)ranked=names.map(name=>({name,value:Number(last[name])||0})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
  else {
    const m=v34monthly(type).at(-1)||{};
    ranked=names.map(name=>({name,value:Number(m[name])||0})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
  }
  let picked=ranked.slice(0,limit).map(x=>x.name);
  if(type!=='segment'&&names.includes('HONDA')&&!picked.includes('HONDA'))picked=[...picked.slice(0,Math.max(0,limit-1)),'HONDA'];
  return picked;
}
function v34seriesColor(name,index){return name==='HONDA'?(typeof COLORS!=='undefined'?COLORS.red:'#e40521'):V34_SERIES_COLORS[index%V34_SERIES_COLORS.length]}
function v34monthlyShares(type,names){
  const rows=v34monthly(type),market=v34marketMap();
  return rows.map(r=>{const den=market.get(r.period)||0,out={period:r.period};names.forEach(n=>out[n]=den?(Number(r[n])||0)/den:null);return out});
}
function v34hondaStrict(){
  const rows=v34rollingEntities('brand');return rows.map(r=>({period:r.period,honda:Number(r.HONDA)||0,share:Number(r['HONDA__share'])||0}));
}
function v34path(points,x,y){return points.map((p,i)=>`${i?'L':'M'} ${x(p).toFixed(1)} ${y(p).toFixed(1)}`).join(' ')}
function v34areaPath(points,x,yTop,yBottom){if(!points.length)return '';const top=points.map((p,i)=>`${i?'L':'M'} ${x(p).toFixed(1)} ${yTop(p).toFixed(1)}`).join(' ');const bot=points.slice().reverse().map(p=>`L ${x(p).toFixed(1)} ${yBottom(p).toFixed(1)}`).join(' ');return `${top} ${bot} Z`}
function v34controls(){
  return `<div class="v34-controls"><div class="v34-switch"><span>Comparar</span>${Object.entries(V34_MODES).map(([k,v])=>`<button data-v34-mode="${k}" class="${V34_MODE===k?'active':''}">${v}</button>`).join('')}</div><div class="v34-switch"><span>Historia</span>${[24,36,60].map(n=>`<button data-v34-range="${n}" class="${V34_RANGE===n?'active':''}">${n}M</button>`).join('')}</div></div>`;
}
function v34combinedChart(){
  const all=v34marketR12All();if(!all.length)return '<div class="empty">Historia insuficiente para Rolling 12M.</div>';
  const rows=all.slice(-Math.max(12,V34_RANGE));
  const names=v34latestRank(V34_MODE,5),strict=v34rollingEntities(V34_MODE),monthly=v34monthlyShares(V34_MODE,names),honda=v34hondaStrict();
  const strictBy=new Map(strict.map(r=>[r.period,r])),monthlyBy=new Map(monthly.map(r=>[r.period,r])),hondaBy=new Map(honda.map(r=>[r.period,r]));
  const data=rows.map(r=>({...r,strict:strictBy.get(r.period)||null,monthly:monthlyBy.get(r.period)||null,honda:hondaBy.get(r.period)||null}));
  const W=1180,H=430,L=76,R=100,T=26,B=46,PW=W-L-R,PH=H-T-B;
  const maxMarket=Math.max(...data.map(r=>r.market),1),leftMax=Math.ceil(maxMarket/100000)*100000;
  let maxShare=.30;strict.forEach(r=>names.forEach(n=>{maxShare=Math.max(maxShare,Number(r[`${n}__share`])||0)}));monthly.forEach(r=>names.forEach(n=>{maxShare=Math.max(maxShare,Number(r[n])||0)}));
  const rightMax=Math.max(.30,Math.ceil(maxShare*20)/20);
  const xIndex=i=>L+(data.length<=1?0:i/(data.length-1))*PW;
  const xPeriod=p=>{const i=data.findIndex(r=>r.period===p);return i<0?L:xIndex(i)};
  const yL=v=>T+PH-(Math.max(0,Number(v)||0)/leftMax)*PH;
  const yR=v=>T+PH-(Math.max(0,Number(v)||0)/rightMax)*PH;
  const marketArea=v34areaPath(data,(p)=>xPeriod(p.period),(p)=>yL(p.market),()=>T+PH);
  const marketLine=v34path(data,(p)=>xPeriod(p.period),(p)=>yL(p.market));
  const hPts=data.filter(r=>r.honda?.honda>0).map(r=>({period:r.period,value:r.honda.honda}));
  const hondaArea=v34areaPath(hPts,(p)=>xPeriod(p.period),(p)=>yL(p.value),()=>T+PH);
  const hondaLine=v34path(hPts,(p)=>xPeriod(p.period),(p)=>yL(p.value));
  const grid=Array.from({length:5},(_,i)=>{const v=leftMax*i/4,y=yL(v);return `<line x1="${L}" y1="${y}" x2="${W-R}" y2="${y}" class="v34-grid"/><text x="${L-12}" y="${y+4}" text-anchor="end" class="v34-axis">${v34k(v)}</text>`}).join('');
  const rAxis=Array.from({length:4},(_,i)=>{const v=rightMax*i/3,y=yR(v);return `<text x="${W-R+12}" y="${y+4}" class="v34-axis v34-axis-right">${Math.round(v*100)}%</text>`}).join('');
  const tickCount=Math.min(7,data.length),ticks=Array.from({length:tickCount},(_,i)=>Math.round(i*(data.length-1)/Math.max(1,tickCount-1))).filter((v,i,a)=>a.indexOf(v)===i).map(i=>`<text x="${xIndex(i)}" y="${H-15}" text-anchor="middle" class="v34-axis">${v34monthLabel(data[i].period)}</text>`).join('');
  let monthlyPaths='',strictPaths='',endLabels=[];
  names.forEach((n,i)=>{
    const c=v34seriesColor(n,i);
    const mPts=data.filter(r=>r.monthly&&r.monthly[n]!=null).map(r=>({period:r.period,value:r.monthly[n]}));
    if(mPts.length>1)monthlyPaths+=`<path d="${v34path(mPts,p=>xPeriod(p.period),p=>yR(p.value))}" fill="none" stroke="${c}" stroke-width="1.4" stroke-dasharray="4 5" opacity=".28"/>`;
    const sPts=data.filter(r=>r.strict&&r.strict[`${n}__share`]!=null).map(r=>({period:r.period,value:r.strict[`${n}__share`]}));
    if(sPts.length>1)strictPaths+=`<path d="${v34path(sPts,p=>xPeriod(p.period),p=>yR(p.value))}" fill="none" stroke="${c}" stroke-width="${n==='HONDA'?4:2.5}" stroke-linecap="round" stroke-linejoin="round"/>`;
    sPts.forEach(p=>{if(p.period===data.at(-1)?.period)strictPaths+=`<circle cx="${xPeriod(p.period)}" cy="${yR(p.value)}" r="${n==='HONDA'?4.7:3.6}" fill="${c}"/>`});
    const last=sPts.at(-1);if(last)endLabels.push({name:n,value:last.value,color:c,y:yR(last.value)});
  });
  endLabels.sort((a,b)=>a.y-b.y);for(let i=1;i<endLabels.length;i++)if(endLabels[i].y-endLabels[i-1].y<17)endLabels[i].y=endLabels[i-1].y+17;
  if(endLabels.length){const over=endLabels.at(-1).y-(T+PH);if(over>0)endLabels.forEach(x=>x.y-=over);const under=T-endLabels[0].y;if(under>0)endLabels.forEach(x=>x.y+=under)}
  const labels=endLabels.map(x=>`<text x="${W-R+9}" y="${x.y+4}" class="v34-end" fill="${x.color}">${v34esc(x.name)} ${v34p(x.value)}</text>`).join('');
  const latest=data.at(-1),hLatest=hondaBy.get(latest.period);
  const marketLabel=`<g><rect x="${W-R-144}" y="${Math.max(T+2,yL(latest.market)-26)}" width="137" height="22" rx="7" class="v34-label-bg"/><text x="${W-R-75}" y="${Math.max(T+17,yL(latest.market)-10)}" text-anchor="middle" class="v34-market-label">Market ${v34k(latest.market)}</text></g>`;
  const hondaLabel=hLatest?`<g><rect x="${W-R-144}" y="${Math.min(T+PH-26,yL(hLatest.honda)+7)}" width="137" height="22" rx="7" class="v34-honda-label-bg"/><text x="${W-R-75}" y="${Math.min(T+PH-11,yL(hLatest.honda)+23)}" text-anchor="middle" class="v34-honda-label">Honda ${v34k(hLatest.honda)}</text></g>`:'';
  const firstStrict=data.find(r=>r.strict),coverage=firstStrict?`<rect x="${xPeriod(firstStrict.period)}" y="${T}" width="${Math.max(0,W-R-xPeriod(firstStrict.period))}" height="${PH}" class="v34-coverage"/><text x="${xPeriod(firstStrict.period)+8}" y="${T+16}" class="v34-coverage-label">R12 competitivo disponible</text>`:'';
  const hits=data.map((r,i)=>{
    const next=i<data.length-1?xIndex(i+1):W-R,prev=i?xIndex(i-1):L,a=(prev+xIndex(i))/2,b=(xIndex(i)+next)/2;
    const entity=r.strict?names.map(n=>`${v34esc(n)} R12: ${v34p(r.strict[`${n}__share`]||0)}`).join(' · '):'';
    const monthlyTxt=r.monthly?names.map(n=>r.monthly[n]!=null?`${v34esc(n)} mensual: ${v34p(r.monthly[n])}`:'').filter(Boolean).join(' · '):'';
    const tip=`<b>${v34monthLabel(r.period)}</b><br>Market R12: ${v34k(r.market)}${r.honda?`<br>Honda R12: ${v34k(r.honda.honda)} · ${v34p(r.honda.share)}`:''}${entity?`<br>${entity}`:''}${monthlyTxt?`<br><span class='muted'>${monthlyTxt}</span>`:''}`;
    return `<rect x="${a}" y="${T}" width="${Math.max(1,b-a)}" height="${PH}" fill="transparent" data-v34-tip="${v34esc(tip)}"/>`;
  }).join('');
  const legend=names.map((n,i)=>`<span><i style="background:${v34seriesColor(n,i)}"></i>${v34esc(n)}</span>`).join('');
  const strictCount=strict.filter(r=>data.some(d=>d.period===r.period)).length;
  return `<div class="v34-chart-shell"><div class="v34-legend"><span class="v34-market-key"><i></i>Market R12</span><span class="v34-honda-key"><i></i>Honda R12</span>${legend}</div><svg class="v34-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Mercado Rolling 12 meses y market share competitivo"><defs><linearGradient id="v34MarketFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#667085" stop-opacity=".28"/><stop offset="100%" stop-color="#667085" stop-opacity=".04"/></linearGradient><linearGradient id="v34HondaFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#e40521" stop-opacity=".40"/><stop offset="100%" stop-color="#e40521" stop-opacity=".10"/></linearGradient></defs>${grid}${coverage}<path d="${marketArea}" fill="url(#v34MarketFill)"/><path d="${marketLine}" fill="none" stroke="#202a36" stroke-width="3" stroke-linecap="round"/>${hondaArea?`<path d="${hondaArea}" fill="url(#v34HondaFill)"/><path d="${hondaLine}" fill="none" stroke="#e40521" stroke-width="3.4" stroke-linecap="round"/>`:''}${monthlyPaths}${strictPaths}${rAxis}${ticks}${marketLabel}${hondaLabel}${labels}${hits}</svg><div class="v34-chart-caption"><span>Eje izq. · volumen R12</span><span>Eje der. · market share</span><span>Línea sólida · MS R12</span><span>Línea punteada · MS mensual de referencia</span></div><div class="v34-data-note ${strictCount<6?'warn':''}"><b>Integridad:</b> la curva competitiva R12 sólo aparece donde existen 12 meses completos de historia estructural. Con la base cargada hoy hay ${strictCount} punto${strictCount===1?'':'s'} R12 competitivo${strictCount===1?'':'s'} dentro de esta vista; la historia faltante no se imputa.</div></div>`;
}

function v34totalCompetition(){
  const marketRoll=v34marketR12All(),latest=DATA?.market_history?.at(-1),marketR12=marketRoll.at(-1)?.market||v34sum((DATA?.market_history||[]).slice(-12).map(r=>r.value));
  const hondaR12=(typeof v32entityR12==='function'?v32entityR12('brand','HONDA'):0),hondaR12Share=marketR12?hondaR12/marketR12:0;
  const brandTop=typeof v32topNames==='function'?v32topNames('brand',5):[],brandR12=typeof v32r12Bars==='function'?v32r12Bars('brand',typeof v32ensureHonda==='function'?v32ensureHonda(brandTop,5):brandTop):[];
  const groupTop=typeof v32topNames==='function'?v32topNames('group',5):[],groupNames=[...new Set([...groupTop,'HONDA'])].sort((a,b)=>(typeof v32entityR12==='function'?v32entityR12('group',b)-v32entityR12('group',a):0)).slice(0,5),groupR12=typeof v32r12Bars==='function'?v32r12Bars('group',groupNames):[];
  return chapter('competition-total','07','Mercado total · Rolling 12M & Top 5','Mercado, Honda y competencia se leen ahora en una sola visual: tamaño del mercado a la izquierda y market share a la derecha, sin inventar historia faltante.',`
    <section class="kpis">${kpi('MERCADO R12',fmt(marketR12),'últimos 12 meses oficiales',COLORS.actual,'ROLLING 12M')}${kpi('HONDA R12',fmt(hondaR12),`MS R12 ${pct(hondaR12Share)}`,COLORS.red,'ROLLING 12M')}${kpi('HONDA MS R12',pct(hondaR12Share),`${fmt(hondaR12)} / ${fmt(marketR12)}`,COLORS.red,'SHARE')}${kpi('ÚLTIMO CIERRE',fmt(latest?.value||0),latest?`${pct(latest.mom)} MoM · ${pct(latest.yoy)} YoY`:'',COLORS.blue,'FACT')}</section>
    <section class="card v34-hero"><div class="card-head v34-head"><div><span class="eyebrow">MARKET R12 · COMPETITIVE SHARE</span><h2>Mercado total + Honda + competencia</h2><p>La lectura tipo Market Information integra volumen Rolling 12M y market share en un solo gráfico. Honda queda resaltada; las demás series se mantienen secundarias.</p></div>${v34controls()}</div>${v34combinedChart()}</section>
    <div class="grid two">${card('Rolling 12M · Honda + Top marcas','Comparación por volumen acumulado de los últimos 12 meses.',barChart(brandR12,{limit:5,color:r=>r.name==='HONDA'?COLORS.red:COLORS.blue}),'BRANDS R12')}${card('Rolling 12M · Honda + Top grupos','Misma lectura por grupo empresario.',barChart(groupR12,{limit:5,color:r=>r.name==='HONDA'?COLORS.red:COLORS.actual}),'GROUPS R12')}</div>
    <div class="grid three">${card('Top 5 grupos · mercado total','Actual, MS, MoM, YoY y rolling acumulado.',v4rankTable('group',5),'TOP 5')}${card('Top 5 marcas · mercado total','Ranking general antes de abrir por segmento.',v4rankTable('brand',5),'TOP 5')}${card('Top 5 modelos · mercado total','Los modelos de mayor volumen del mercado total.',v4rankTable('model',5),'TOP 5')}</div>
    ${card('Posicionamiento Honda · mercado total','Lectura ejecutiva antes del drill-down por segmento.',typeof v32marketPositioning==='function'?v32marketPositioning():'','HONDA POSITION')}
  `);
}

if(typeof v32totalCompetition==='function')v32totalCompetition=v34totalCompetition;

document.addEventListener('click',e=>{
  const mode=e.target.closest?.('[data-v34-mode]');if(mode){V34_MODE=mode.dataset.v34Mode||'brand';v34save();if(typeof render==='function')render();return}
  const range=e.target.closest?.('[data-v34-range]');if(range){V34_RANGE=Math.max(12,Number(range.dataset.v34Range)||60);v34save();if(typeof render==='function')render()}
});
document.addEventListener('pointermove',e=>{
  const hit=e.target.closest?.('[data-v34-tip]'),tip=document.getElementById('tooltip');if(!tip)return;
  if(hit){tip.innerHTML=hit.dataset.v34Tip||'';tip.hidden=false;tip.style.left=`${Math.min(window.innerWidth-300,e.clientX+14)}px`;tip.style.top=`${Math.max(10,e.clientY-22)}px`}
});
document.addEventListener('pointerout',e=>{if(e.target.closest?.('[data-v34-tip]')){const tip=document.getElementById('tooltip');if(tip)tip.hidden=true}});

(function v34boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof render==='function'){try{render()}catch(e){console.error('V34 combined R12 render',e)}}else setTimeout(ready,120)};ready()})();
