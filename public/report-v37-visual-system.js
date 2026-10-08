/* 2W Market Analysis v37 — unified visual language for actuals, forecast, user plan, Honda, brands and groups */
const V37_VERSION='20261008-visual-system-v1';
const V37={
  actual:'#5B6470',previous:'#AEB4BD',forecastArea:'#FF8FAE',
  down:'#D92D20',base:'#D6A300',up:'#16855B',user:'#FF2BD6',honda:'#E40521'
};
const V37_BRANDS={
  HONDA:'#E40521',MOTOMEL:'#161A20',GILERA:'#C91C25',KELLER:'#F28C28',CORVEN:'#215EA6',ZANELLA:'#D71920',
  BAJAJ:'#005EB8',YAMAHA:'#D71920',SUZUKI:'#1D4E9E',KAWASAKI:'#69BE28',CFMOTO:'#00A9B7',BENELLI:'#007A4D',
  KEEWAY:'#E31E24',HERO:'#E1262F',VOGE:'#D71920',TVS:'#1D4F91',IKA:'#6B7280',SIAM:'#2B67B1',GUERRERO:'#C8202F',
  BETA:'#D71920',ZONTES:'#D71920',BRAVA:'#B6252A','ROYAL ENFIELD':'#B31D28',KTM:'#F47B20',BMW:'#1C69D4',
  PIAGGIO:'#1F3A5F',APRILIA:'#D71920',KYMCO:'#C8202F',KIMKO:'#C8202F',KOVE:'#E2352C',RVM:'#303846',
  OKINOI:'#4E5968',CERRO:'#5E6875',MONDIAL:'#364152'
};
const V37_GROUP_FALLBACK={HONDA:V37.honda,IRAOLA:V37_BRANDS.BAJAJ,'LA EMILIA':V37_BRANDS.MOTOMEL,GILERA:V37_BRANDS.GILERA,KELLER:V37_BRANDS.KELLER,MAGNY:V37_BRANDS.TVS,YAMAHA:V37_BRANDS.YAMAHA,NEWSAN:V37_BRANDS.SIAM,GUERRERO:V37_BRANDS.GUERRERO,BETA:V37_BRANDS.BETA,SIMPA:V37_BRANDS['ROYAL ENFIELD'],BMW:V37_BRANDS.BMW};
function v37n(v){return String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim()}
function v37brandColor(name){const n=v37n(name);return V37_BRANDS[n]||null}
function v37groupColor(name){
  const group=v37n(name);if(group==='HONDA')return V37.honda;
  try{
    const rows=(typeof V3_ROLL!=='undefined'&&V3_ROLL?.brand_history)||[];const last=rows.at(-1)||{};
    const map=typeof V24_GROUP_BY_BRAND!=='undefined'?V24_GROUP_BY_BRAND:{};
    const candidates=Object.keys(last).filter(k=>k!=='period'&&v37n(map[k])===group).sort((a,b)=>(Number(last[b])||0)-(Number(last[a])||0));
    if(candidates.length)return v37brandColor(candidates[0])||V37_GROUP_FALLBACK[group]||null;
  }catch{}
  return V37_GROUP_FALLBACK[group]||null;
}
function v37entityColor(name){return v37brandColor(name)||v37groupColor(name)}
function v37seriesColor(item,index=0){
  const token=v37n(`${item?.key||''} ${item?.name||''}`),name=v37n(item?.name||item?.key||'');
  if(token.includes('HONDA'))return V37.honda;
  if(/(^| )USER( |$)|PLAN USUARIO|USER INPUT/.test(token))return V37.user;
  if(/DOWNSIDE|(^| )DOWN( |$)|NEGATIVO|NEGATIVE/.test(token))return V37.down;
  if(/(^| )BASE( |$)|CONSERVADOR|CONSERVATIVE/.test(token))return V37.base;
  if(/UPSIDE|(^| )UP( |$)|POSITIVO|POSITIVE/.test(token))return V37.up;
  if(/ACTUAL|REAL|OBSERVADO|OBSERVED/.test(token))return V37.actual;
  if(/PREVIOUS|ANTERIOR|AÑO ANTERIOR|YEAR AGO/.test(token))return V37.previous;
  return v37entityColor(name)||item?.color||['#667085','#98A2B3','#344054','#7F8C9A'][index%4];
}
function v37forecastIndex(rows){
  const cutoff=DATA?.meta?.market_cutoff||DATA?.honda?.period||'';
  let i=(rows||[]).findIndex(r=>r?.period&&cutoff&&String(r.period)>String(cutoff));
  if(i>=0)return i;
  i=(rows||[]).findIndex(r=>/FORECAST|FCST|ESTIMATE/i.test(String(r?.status||'')));
  if(i>=0)return i;
  return (rows||[]).findIndex(r=>r?.actual==null&&['forecast','down','base','up','user'].some(k=>Number.isFinite(Number(r?.[k]))));
}
function v37applyPalette(){
  if(typeof COLORS==='undefined')return false;
  Object.assign(COLORS,{actual:V37.actual,previous:V37.previous,forecast:V37.base,down:V37.down,base:V37.base,up:V37.up,user:V37.user,green:V37.up,amber:V37.base,red:V37.honda,HONDA:V37.honda,...V37_BRANDS});
  return true;
}

function v37lineChart(rows,series,{height=245,percent=false,zero=true,maxValue=null,minValue=null}={}){
  if(!rows?.length)return `<div class="empty">Sin datos para los filtros seleccionados.</div>`;
  const themed=(series||[]).map((item,i)=>({...item,color:v37seriesColor(item,i)}));
  const width=760,pad={l:54,r:16,t:16,b:34};
  const values=themed.flatMap(item=>rows.map(row=>Number(row[item.key])).filter(Number.isFinite));
  if(!values.length)return `<div class="empty">Sin datos para los filtros seleccionados.</div>`;
  let min=minValue!==null?minValue:Math.min(...values),max=maxValue!==null?maxValue:Math.max(...values);
  if(zero&&!percent)min=0;if(percent&&min>0)min=0;if(min===max)max=min+1;const range=max-min||1;
  const x=index=>pad.l+index*(width-pad.l-pad.r)/Math.max(1,rows.length-1),y=value=>pad.t+(max-value)/range*(height-pad.t-pad.b);
  const fIdx=v37forecastIndex(rows);let forecastZone='';
  if(fIdx>=0){const start=fIdx===0?pad.l:(x(fIdx-1)+x(fIdx))/2;forecastZone=`<rect class="v37-forecast-zone" x="${start}" y="${pad.t}" width="${Math.max(0,width-pad.r-start)}" height="${height-pad.t-pad.b}" rx="5"/><text class="v37-forecast-label" x="${start+8}" y="${pad.t+13}">FORECAST</text>`}
  const grid=Array.from({length:5},(_,index)=>{const value=max-range*index/4,yy=y(value);return `<g><line class="chart-grid" x1="${pad.l}" x2="${width-pad.r}" y1="${yy}" y2="${yy}"/><text class="chart-axis" x="${pad.l-7}" y="${yy+3}" text-anchor="end">${percent?pct(value):fmt(value)}</text></g>`}).join('');
  const paths=themed.map(item=>{const points=rows.map((row,index)=>({value:Number(row[item.key]),index,row})).filter(point=>Number.isFinite(point.value));const d=points.map((point,index)=>`${index?'L':'M'}${x(point.index).toFixed(1)},${y(point.value).toFixed(1)}`).join(' ');const dots=points.filter((_,index)=>index%Math.max(1,Math.floor(points.length/12))===0||index===points.length-1).map(point=>`<circle class="chart-dot" data-tip="${label(point.row.period)}|${item.name}|${percent?pct(point.value):fmt(point.value)}" cx="${x(point.index)}" cy="${y(point.value)}" r="4" fill="${item.color}"/>`).join('');return `<path class="chart-line" d="${d}" stroke="${item.color}"/>${dots}`}).join('');
  const step=Math.max(1,Math.floor(rows.length/6));const ticks=rows.map((row,index)=>({row,index})).filter(({index})=>index%step===0||index===rows.length-1).map(({row,index})=>`<text class="chart-axis" x="${x(index)}" y="${height-8}" text-anchor="middle">${label(row.period)}</text>`).join('');
  return `${legend(themed)}<div class="chart-shell"><svg viewBox="0 0 ${width} ${height}" role="img">${forecastZone}${grid}${paths}${ticks}</svg></div>`;
}
function v37barChart(rows,{nameKey='name',valueKey='value',max=null,percent=false,limit=15,color=COLORS.blue,showShare=false}={}){
  const data=(rows||[]).slice(0,limit);if(!data.length)return `<div class="empty">Sin datos.</div>`;const ceiling=max||Math.max(...data.map(x=>Number(x[valueKey])||0),1);
  return `<div class="bars">${data.map((row,index)=>{const value=Number(row[valueKey])||0,w=Math.max(1,value/ceiling*100),labelValue=percent?pct(value):fmt(value);const resolved=v37entityColor(row[nameKey])||(typeof color==='function'?color(row,index):color)||V37.actual;return `<div class="bar-row"><div class="bar-label"><span><i>${String(index+1).padStart(2,'0')}</i>${safe(row[nameKey])}</span><b>${labelValue}${showShare&&Number.isFinite(row.share)?` <small>${pct(row.share)}</small>`:''}</b></div><div class="hbar"><i style="width:${w}%;background:${resolved}"></i></div>${row.mom!==undefined?`<div class="bar-meta"><span>MoM ${pct(row.mom)}</span>${row.yoy!==undefined?`<span>YoY ${pct(row.yoy)}</span>`:''}</div>`:''}</div>`}).join('')}</div>`;
}

function v37forecastSvg(rows){
  if(!rows?.length)return '<div class="empty">Forecast no disponible.</div>';
  const W=1120,H=390,L=70,R=28,T=35,B=54,PW=W-L-R,PH=H-T-B;const vals=[];rows.forEach(r=>['actual','down','base','up','user'].forEach(k=>{const n=r[k];if(n!==null&&Number.isFinite(Number(n)))vals.push(Number(n))}));
  const max=Math.max(...vals,1),yMax=Math.ceil(max*1.12/10000)*10000,x=i=>L+i*PW/(rows.length-1),y=v=>T+PH-(Number(v)||0)/yMax*PH;
  const grid=Array.from({length:5},(_,i)=>{const v=yMax*i/4,yy=y(v);return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" class="v36-grid"/><text x="${L-10}" y="${yy+4}" text-anchor="end" class="v36-axis">${fmt(v)}</text>`}).join('');
  const barW=Math.min(48,PW/rows.length*.58),bars=rows.map((r,i)=>r.actual!==null?`<g><rect x="${x(i)-barW/2}" y="${y(r.actual)}" width="${barW}" height="${T+PH-y(r.actual)}" rx="5" class="v36-actual-bar"><title>${label(r.period)} · Actual ${fmt(r.actual)}</title></rect>${i===5?`<text x="${x(i)}" y="${y(r.actual)-9}" text-anchor="middle" class="v36-value">${fmt(r.actual)}</text>`:''}</g>`:'').join('');
  const paths=[['down','Down',V37.down,''],['base','Base',V37.base,''],['up','Up',V37.up,''],['user',`User · ${typeof v36userLabel==='function'?v36userLabel():'Plan usuario'}`,V37.user,'6 5']].map(([key,name,color,dash])=>{const pts=rows.map((r,i)=>({i,v:r[key],p:r.period})).filter(p=>p.v!==null&&Number.isFinite(Number(p.v))&&Number(p.v)>0);if(pts.length<2)return '';const d=pts.map((p,j)=>`${j?'L':'M'} ${x(p.i).toFixed(1)} ${y(p.v).toFixed(1)}`).join(' ');const dots=pts.slice(1).map(p=>`<circle cx="${x(p.i)}" cy="${y(p.v)}" r="${key==='user'?4.2:3.4}" fill="${color}" class="v36-dot"><title>${label(p.p)} · ${name} ${fmt(p.v)}</title></circle>`).join('');return `<path d="${d}" fill="none" stroke="${color}" stroke-width="${key==='base'?4:key==='user'?3.4:2.5}" ${dash?`stroke-dasharray="${dash}"`:''} stroke-linecap="round" stroke-linejoin="round"/>${dots}`}).join('');
  const sepX=(x(5)+x(6))/2,ticks=rows.map((r,i)=>`<text x="${x(i)}" y="${H-18}" text-anchor="middle" class="v36-axis">${label(r.period).replace(' ','\n')}</text>`).join('');
  return `<div class="v36-chart-scroll"><svg class="v36-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Actual mensual y forecast Down Base Up y User"><rect x="${sepX}" y="${T}" width="${W-R-sepX}" height="${PH}" class="v36-future-bg"/>${grid}${bars}<line x1="${sepX}" x2="${sepX}" y1="${T-6}" y2="${T+PH+8}" class="v36-separator"/><text x="${sepX-12}" y="${T-14}" text-anchor="end" class="v36-zone actual">ACTUAL</text><text x="${sepX+12}" y="${T-14}" class="v36-zone forecast">FORECAST</text>${paths}${ticks}</svg></div>`;
}
function v37forecastHero(){
  const rows=v36rows(),ki=v3currentKI(),userKI=v36userKI(),actualKI=v36actualKI(),remaining=Math.max(0,userKI-actualKI),futureCount=rows.filter(r=>r.period>='2026-10').length,avgReq=futureCount?Math.round(remaining/futureCount):0,userOpen=rows.find(r=>r.period==='2026-10')?.user||0,baseOpen=rows.find(r=>r.period==='2026-10')?.base||0,labelUser=v36userLabel();
  return `<section class="card v36-hero"><div class="card-head v36-head"><div><span class="eyebrow">MARKET PATH · ACTUAL + FORECAST</span><h2>Cómo viene y cómo quedaría el KI</h2><p>Actual cerrado en gris. Desde octubre el área rosada identifica forecast; Down es rojo, Base amarillo, Up verde y User rosa flúor.</p></div>${badge(`USER · ${v36esc(labelUser)}`,'purple')}</div><section class="kpis v36-kpis">${kpi('ÚLTIMO CIERRE',fmt(rows.find(r=>r.period==='2026-09')?.actual||0),'Sep-26 · Reporte oficial',V37.actual,'ACTUAL')}${kpi('KI BASE',fmt(ki.base),`Down ${fmt(ki.down)} · Up ${fmt(ki.up)}`,V37.base,'MODEL')}${kpi('USER KI',fmt(userKI),`${labelUser} activo`,V37.user,'USER')}${kpi('GAP USER vs BASE',v36gap(userKI-ki.base),`Oct User ${fmt(userOpen)} vs Base ${fmt(baseOpen)}`,userKI>=ki.base?V37.up:V37.base,'GAP')}${kpi('SALDO USER',fmt(remaining),`promedio requerido ${fmt(avgReq)}/mes`,V37.actual,'OCT–MAR')}</section><div class="v36-legend"><span class="actual"><i></i>Actual</span><span class="down"><i></i>Down</span><span class="base"><i></i>Base</span><span class="up"><i></i>Up</span><span class="user"><i></i>User · ${v36esc(labelUser)}</span></div>${v37forecastSvg(rows)}<div class="v36-read"><div><b>Corte claro</b><span>Abr–Sep = resultado cerrado. Oct–Mar = proyección.</span></div><div><b>User activo</b><span>Se toma automáticamente por fecha/cierre; hoy corresponde ${v36esc(labelUser)}.</span></div><div><b>Gobernanza</b><span>El User sirve para medir gap y plausibilidad; no modifica Down/Base/Up.</span></div></div>${v36forecastTable(rows)}</section>`;
}

(function v37boot(){
  const ready=()=>{
    if(!v37applyPalette()){setTimeout(ready,80);return}
    try{lineChart=v37lineChart;barChart=v37barChart}catch{}
    try{if(typeof v34seriesColor==='function')v34seriesColor=(name,index)=>V34_MODE==='segment'?(COLORS[name]||['#667085','#98A2B3','#475467','#7F8C8D'][index%4]):(v37entityColor(name)||['#667085','#98A2B3','#475467','#7F8C8D'][index%4])}catch{}
    try{if(typeof v36forecastSvg==='function')v36forecastSvg=v37forecastSvg;if(typeof v36forecastHero==='function')v36forecastHero=v37forecastHero}catch{}
    try{if(typeof render==='function'&&typeof DATA!=='undefined'&&DATA)render()}catch(e){console.error('V37 visual system render',e)}
  };ready();
})();
