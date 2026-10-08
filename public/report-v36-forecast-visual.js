/* 2W Market Analysis v36 — executive forecast visual: actual columns + scenario paths + active User FCST */
const V36_VERSION='20261008-forecast-visual-v1';
const V36_BASE_FORECAST=typeof forecast==='function'?forecast:null;

function v36esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function v36periods(){return ['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12','2027-01','2027-02','2027-03']}
function v36actualMap(){return new Map((DATA?.market_history||[]).map(r=>[r.period,Number(r.value)||0]))}
function v36active(){try{return typeof v18activeBudget==='function'?v18activeBudget():null}catch{return null}}
function v36userFor(period,active){
  const direct=Number(active?.marketMonthly?.[period]?.value);
  if(Number.isFinite(direct)&&direct>0)return Math.round(direct);
  const row=(DATA?.forecast?.rows||[]).find(r=>r.period===period);
  return Number(row?.user)||Number(row?.base)||0;
}
function v36rows(){
  const actual=v36actualMap(),active=v36active(),lastActual='2026-09',lastValue=actual.get(lastActual)||0;
  return v36periods().map(period=>{
    const f=(DATA?.forecast?.rows||[]).find(r=>r.period===period);
    const isActual=period<=lastActual;
    return {
      period,
      actual:isActual?(actual.get(period)||0):null,
      down:period===lastActual?lastValue:(!isActual?Number(f?.down)||0:null),
      base:period===lastActual?lastValue:(!isActual?Number(f?.base)||0:null),
      up:period===lastActual?lastValue:(!isActual?Number(f?.up)||0:null),
      user:period===lastActual?lastValue:(!isActual?v36userFor(period,active):null)
    };
  });
}
function v36userLabel(){const a=v36active();return a?.meta?.label||a?.key||'User FCST activo'}
function v36userKI(){const a=v36active();return Number(a?.stage?.market)||Number(V3_PLAN?.marketKI)||0}
function v36actualKI(){return (DATA?.market_history||[]).filter(r=>r.period>='2026-04'&&r.period<='2026-09').reduce((s,r)=>s+(Number(r.value)||0),0)}
function v36gap(v){const n=Number(v)||0;return `${n>=0?'+':''}${fmt(n)}`}

function v36forecastSvg(rows){
  if(!rows.length)return '<div class="empty">Forecast no disponible.</div>';
  const W=1120,H=390,L=70,R=28,T=35,B=54,PW=W-L-R,PH=H-T-B;
  const vals=[];rows.forEach(r=>['actual','down','base','up','user'].forEach(k=>{const n=r[k];if(n!==null&&Number.isFinite(Number(n)))vals.push(Number(n))}));
  const max=Math.max(...vals,1),yMax=Math.ceil(max*1.12/10000)*10000;
  const x=i=>L+i*PW/(rows.length-1),y=v=>T+PH-(Number(v)||0)/yMax*PH;
  const grid=Array.from({length:5},(_,i)=>{const v=yMax*i/4,yy=y(v);return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" class="v36-grid"/><text x="${L-10}" y="${yy+4}" text-anchor="end" class="v36-axis">${fmt(v)}</text>`}).join('');
  const barW=Math.min(48,PW/rows.length*.58);
  const bars=rows.map((r,i)=>r.actual!==null?`<g><rect x="${x(i)-barW/2}" y="${y(r.actual)}" width="${barW}" height="${T+PH-y(r.actual)}" rx="5" class="v36-actual-bar"><title>${label(r.period)} · Actual ${fmt(r.actual)}</title></rect>${i===5?`<text x="${x(i)}" y="${y(r.actual)-9}" text-anchor="middle" class="v36-value">${fmt(r.actual)}</text>`:''}</g>`:'').join('');
  const paths=[
    ['down','Down',COLORS.down,''],['base','Base',COLORS.red,''],['up','Up',COLORS.blue,''],['user',`User · ${v36userLabel()}`,V3_PURPLE,'6 5']
  ].map(([key,name,color,dash])=>{
    const pts=rows.map((r,i)=>({i,v:r[key],p:r.period})).filter(p=>p.v!==null&&Number.isFinite(Number(p.v))&&Number(p.v)>0);
    if(pts.length<2)return '';
    const d=pts.map((p,j)=>`${j?'L':'M'} ${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');
    const dots=pts.slice(1).map(p=>`<circle cx="${x(p.i)}" cy="${y(p.v)}" r="${key==='user'?4.2:3.4}" fill="${color}" class="v36-dot"><title>${label(p.p)} · ${name} ${fmt(p.v)}</title></circle>`).join('');
    return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${key==='base'?4:key==='user'?3.4:2.5}" ${dash?`stroke-dasharray="${dash}"`:''} stroke-linecap="round" stroke-linejoin="round"/>${dots}`;
  }).join('');
  const sepX=(x(5)+x(6))/2;
  const ticks=rows.map((r,i)=>`<text x="${x(i)}" y="${H-18}" text-anchor="middle" class="v36-axis">${label(r.period).replace(' ','\n')}</text>`).join('');
  const futureBg=`<rect x="${sepX}" y="${T}" width="${W-R-sepX}" height="${PH}" class="v36-future-bg"/>`;
  const sep=`<line x1="${sepX}" x2="${sepX}" y1="${T-6}" y2="${T+PH+8}" class="v36-separator"/><text x="${sepX-12}" y="${T-14}" text-anchor="end" class="v36-zone actual">ACTUAL</text><text x="${sepX+12}" y="${T-14}" class="v36-zone forecast">FORECAST</text>`;
  return `<div class="v36-chart-scroll"><svg class="v36-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Actual mensual y forecast Down Base Up y User">${futureBg}${grid}${bars}${sep}${paths}${ticks}</svg></div>`;
}

function v36forecastTable(rows){
  const future=rows.filter(r=>r.period>='2026-10');
  return `<div class="table-wrap"><table class="table v36-table"><thead><tr><th>Mes</th><th>Down</th><th>Base</th><th>Up</th><th>${v36esc(v36userLabel())}</th><th>User vs Base</th></tr></thead><tbody>${future.map(r=>`<tr><td><b>${label(r.period)}</b></td><td>${fmt(r.down)}</td><td><b>${fmt(r.base)}</b></td><td>${fmt(r.up)}</td><td class="v36-user-cell"><b>${fmt(r.user)}</b></td><td class="${r.user-r.base>=0?'green-txt':'amber-txt'}">${v36gap(r.user-r.base)}</td></tr>`).join('')}</tbody></table></div>`;
}

function v36forecastHero(){
  const rows=v36rows(),ki=v3currentKI(),userKI=v36userKI(),actualKI=v36actualKI(),remaining=Math.max(0,userKI-actualKI),futureCount=rows.filter(r=>r.period>='2026-10').length,avgReq=futureCount?Math.round(remaining/futureCount):0;
  const userOpen=rows.find(r=>r.period==='2026-10')?.user||0,baseOpen=rows.find(r=>r.period==='2026-10')?.base||0;
  return `<section class="card v36-hero"><div class="card-head v36-head"><div><span class="eyebrow">MARKET PATH · ACTUAL + FORECAST</span><h2>Cómo viene y cómo quedaría el KI</h2><p>Actual cerrado en columnas. Desde octubre continúan Down / Base / Up y el último FCST de usuario vigente por fecha, sin mezclarlo con el forecast independiente.</p></div>${badge(`USER · ${v36esc(v36userLabel())}`,'purple')}</div>
    <section class="kpis v36-kpis">
      ${kpi('ÚLTIMO CIERRE',fmt(rows.find(r=>r.period==='2026-09')?.actual||0),'Sep-26 · Reporte oficial',COLORS.actual,'ACTUAL')}
      ${kpi('KI BASE',fmt(ki.base),`Down ${fmt(ki.down)} · Up ${fmt(ki.up)}`,COLORS.red,'MODEL')}
      ${kpi('USER KI',fmt(userKI),`${v36userLabel()} activo`,V3_PURPLE,'USER')}
      ${kpi('GAP USER vs BASE',v36gap(userKI-ki.base),`Oct User ${fmt(userOpen)} vs Base ${fmt(baseOpen)}`,userKI>=ki.base?COLORS.green:COLORS.amber,'GAP')}
      ${kpi('SALDO USER',fmt(remaining),`promedio requerido ${fmt(avgReq)}/mes`,COLORS.blue,'OCT–MAR')}
    </section>
    <div class="v36-legend"><span class="actual"><i></i>Actual</span><span class="down"><i></i>Down</span><span class="base"><i></i>Base</span><span class="up"><i></i>Up</span><span class="user"><i></i>User · ${v36esc(v36userLabel())}</span></div>
    ${v36forecastSvg(rows)}
    <div class="v36-read"><div><b>Corte claro</b><span>Abr–Sep = resultado cerrado. Oct–Mar = proyección.</span></div><div><b>User activo</b><span>Se toma automáticamente por fecha/cierre; hoy corresponde ${v36esc(v36userLabel())}.</span></div><div><b>Gobernanza</b><span>El User sirve para medir gap y plausibilidad; no modifica Down/Base/Up.</span></div></div>
    ${v36forecastTable(rows)}
  </section>`;
}

function v36legacyGrid(){
  try{
    const rows=v3forecastFull(),ki=v3currentKI();
    const actCY=v3sum(DATA.market_history.filter(r=>r.period>='2026-01'&&r.period<='2026-09').map(r=>r.value));
    const cy={down:actCY,base:actCY,up:actCY,user:actCY};
    DATA.forecast.rows.filter(r=>r.period<='2026-12').forEach(r=>['down','base','up','user'].forEach(k=>cy[k]+=Number(r[k]||0)));
    return `<div class="grid two">${card('Actual + forecast','Ene-26 → Mar-27.',lineChart(rows,[{key:'actual',name:'Actual',color:COLORS.actual},{key:'down',name:'Down',color:COLORS.down},{key:'base',name:'Base',color:COLORS.red},{key:'up',name:'Up',color:COLORS.blue},{key:'user',name:'Plan usuario',color:V3_PURPLE}],{zero:true}),'MARKET PATH')}${card('CY 2026','Actual Jan–Sep + forecast Oct–Dic.',`<div class="scenario-strip"><span>Down <b>${fmt(cy.down)}</b></span><span>Base <b>${fmt(cy.base)}</b></span><span>Up <b>${fmt(cy.up)}</b></span><span>Plan <b>${fmt(cy.user)}</b></span></div><div class="big-number">${fmt(ki.base)}<small>KI 26/27 Base</small></div>`,'CY / KI')}</div>`;
  }catch{return ''}
}

if(V36_BASE_FORECAST){
  forecast=function(){
    const html=V36_BASE_FORECAST(),legacy=v36legacyGrid(),hero=v36forecastHero();
    if(legacy&&html.includes(legacy))return html.replace(legacy,hero);
    /* Fallback: if another layer altered the legacy block, inject the clean executive visual after the forecast chapter header. */
    const marker='<div class="grid two">';
    const i=html.indexOf(marker);
    return i>=0?`${html.slice(0,i)}${hero}${html.slice(i)}`:`${html}${hero}`;
  };
}

(function v36boot(){
  const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof forecast==='function'){try{render()}catch(e){console.error('v36 forecast visual',e)}}else setTimeout(ready,120)};
  ready();
})();
