/* 2W Market Analysis v13 — full active Pivot models + contextual period filters */
const V13_VERSION='20261007-context-filters-full-models';
let V13_MODEL_DATA=null,V13_MODEL_HISTORY=null,V13_MODEL_META=new Map();
let V13_MARKET_MONTHS=(()=>{try{return localStorage.getItem('2w.v13.marketMonths')||'24'}catch{return '24'}})();
let V13_FORECAST_SCOPE=(()=>{try{return localStorage.getItem('2w.v13.forecastScope')||'KI'}catch{return 'KI'}})();
let V13_MODEL_BRAND=(()=>{try{return localStorage.getItem('2w.v13.modelBrand')||'ALL'}catch{return 'ALL'}})();
let V13_MODEL_QUERY=(()=>{try{return localStorage.getItem('2w.v13.modelQuery')||''}catch{return ''}})();
const V13_ROLL_WINDOW={
  brand:(()=>{try{return Number(localStorage.getItem('2w.v13.roll.brand')||3)}catch{return 3}})(),
  group:(()=>{try{return Number(localStorage.getItem('2w.v13.roll.group')||3)}catch{return 3}})(),
  model:(()=>{try{return Number(localStorage.getItem('2w.v13.roll.model')||3)}catch{return 3}})()
};
try{V4_LIMITS.model=30}catch{}

function v13save(){
  try{
    localStorage.setItem('2w.v13.marketMonths',V13_MARKET_MONTHS);
    localStorage.setItem('2w.v13.forecastScope',V13_FORECAST_SCOPE);
    localStorage.setItem('2w.v13.modelBrand',V13_MODEL_BRAND);
    localStorage.setItem('2w.v13.modelQuery',V13_MODEL_QUERY);
    Object.entries(V13_ROLL_WINDOW).forEach(([k,v])=>localStorage.setItem(`2w.v13.roll.${k}`,String(v)));
  }catch{}
}
function v13norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim()}
function v13sum(a){return (a||[]).reduce((s,v)=>s+(Number(v)||0),0)}
function v13buttons(kind,current,values){return `<div class="v13-local-controls"><span>PERÍODO</span>${values.map(([v,l])=>`<button data-v13-${kind}="${v}" class="${String(current)===String(v)?'active':''}">${l}</button>`).join('')}</div>`}
function v13slice(rows,months){if(months==='all')return rows;const n=Number(months)||24;return (rows||[]).slice(-n)}

/* Full active model universe from Pivot Master. The payload contains every Marca+Modelo with activity Sep-25→Sep-26. */
const V13_BASE_HIST=v3hist,V13_BASE_NAMES=v3names;
v3hist=function(type){return type==='model'&&V13_MODEL_HISTORY?V13_MODEL_HISTORY:V13_BASE_HIST(type)};
v3names=function(type){return type==='model'&&V13_MODEL_DATA?V13_MODEL_DATA.active.map(r=>r[0]):V13_BASE_NAMES(type)};
if(typeof v7fModelMeta==='function'){
  const V13_BASE_MODEL_META=v7fModelMeta;
  v7fModelMeta=function(name){const m=V13_MODEL_META.get(name);return m?{brand:m.brand,model:m.model,group:m.group,segment:'SIN CLASIFICAR',source:'PIVOT MASTER'}:V13_BASE_MODEL_META(name)};
}
async function v13loadModels(){
  try{
    const [p1,p2]=await Promise.all([
      fetch('/data/models-active.part1',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`models part1 ${r.status}`);return r.text()}),
      fetch('/data/models-active.part2',{cache:'no-store'}).then(r=>{if(!r.ok)throw new Error(`models part2 ${r.status}`);return r.text()})
    ]);
    if(!('DecompressionStream' in window))throw new Error('DecompressionStream gzip no disponible');
    const b64=(p1+p2).replace(/\s+/g,''),bytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    V13_MODEL_DATA=JSON.parse(await new Response(stream).text());
    V13_MODEL_META=new Map(V13_MODEL_DATA.active.map(r=>[r[0],{brand:r[1]||'OTHERS',model:r[2]||'',group:r[3]||'OTHERS'}]));
    V13_MODEL_HISTORY=(V13_MODEL_DATA.periods||[]).map((period,i)=>{const row={period};V13_MODEL_DATA.active.forEach(r=>{const v=Number(r[4]?.[i])||0;if(v)row[r[0]]=v});return row});
    render();
  }catch(err){console.error('V13 Pivot model universe',err)}
}

function v13rollScore(type,name){const h=v3hist(type),n=V13_ROLL_WINDOW[type]||3;return v13sum(h.slice(-n).map(r=>r?.[name]))}
function v13modelBrands(){return [...new Set((V13_MODEL_DATA?.active||[]).map(r=>r[1]).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'))}
function v13modelFilteredNames(){
  const q=v13norm(V13_MODEL_QUERY);
  return (v3names('model')||[]).filter(name=>{
    const m=V13_MODEL_META.get(name),brand=m?.brand||String(name).split(' ')[0];
    return (V13_MODEL_BRAND==='ALL'||brand===V13_MODEL_BRAND)&&(!q||v13norm(name).includes(q)||v13norm(m?.model).includes(q));
  });
}
const V13_BASE_RANKED=v4rankedNames;
v4rankedNames=function(type,limit){
  let names=type==='model'&&V13_MODEL_DATA?v13modelFilteredNames():(v3names(type)||[]).slice();
  if(!names.length&&type!=='model')return V13_BASE_RANKED(type,limit);
  return names.sort((a,b)=>v13rollScore(type,b)-v13rollScore(type,a)).slice(0,limit);
};

function v13limitSwitch(type){
  const current=V4_LIMITS[type]||10,vals=type==='model'?[15,30,50]:[5,10,15];
  return `<div class="v4-switch"><span>Vista</span>${vals.map(v=>`<button data-v13-limit-type="${type}" data-v13-limit="${v}" class="${current===v?'active':''}">Top ${v}</button>`).join('')}</div>`;
}
v4limitSwitch=v13limitSwitch;
function v13rollButtons(type){const n=V13_ROLL_WINDOW[type]||3;return `<div class="v13-local-controls"><span>RANKING / HISTORIA</span>${[3,6,12].map(v=>`<button data-v13-roll="${type}" data-v13-roll-value="${v}" class="${n===v?'active':''}">${v}M</button>`).join('')}</div>`}
function v13modelControls(){
  const brands=v13modelBrands(),count=v13modelFilteredNames().length;
  return `<div class="v13-local-controls"><span>MODELOS</span><label><span>MARCA</span><select id="v13ModelBrand"><option value="ALL">Todas las marcas</option>${brands.map(b=>`<option value="${b}" ${V13_MODEL_BRAND===b?'selected':''}>${b}</option>`).join('')}</select></label><label><span>BUSCAR MODELO</span><input id="v13ModelSearch" value="${safe(V13_MODEL_QUERY)}" placeholder="Wave, Tornado, Rouser…"></label><button id="v13ModelApply">Aplicar</button><button id="v13ModelClear">Limpiar</button><div class="v13-universe"><b>${count}</b><small>de ${V13_MODEL_DATA?.active_count||v3names('model').length} activos</small></div></div>`;
}
function v13forecastTable(type,limit){
  const names=v4rankedNames(type,limit);
  return `<div class="table-wrap"><table class="table v4-fcst"><thead><tr><th>${type==='brand'?'Marca':type==='group'?'Grupo':'Modelo'}</th><th>Sep A</th><th>Oct B</th><th>Nov B</th><th>Dic B</th><th>Ene B</th><th>Feb B</th><th>Mar B</th><th>KI Down</th><th>KI Base</th><th>KI Up</th></tr></thead><tbody>${names.map(n=>{const r=v4entityKI(type,n);return `<tr><td><strong>${n}</strong></td><td>${fmt(r.current)}</td>${r.f.map(x=>`<td>${fmt(x.base)}</td>`).join('')}<td>${fmt(r.kiDown)}</td><td><strong>${fmt(r.kiBase)}</strong></td><td>${fmt(r.kiUp)}</td></tr>`}).join('')}</tbody></table></div>`;
}
function v13entityBlock(type){
  const l=V4_LIMITS[type]||10,names=v4rankedNames(type,l),chartLimit=Math.min(l,10),period=V13_ROLL_WINDOW[type]||3;
  const extra=type==='model'?v13modelControls():'';
  const status=type==='model'?`${V13_MODEL_DATA?.active_count||v3names('model').length} ACTIVOS · PIVOT MASTER`:`RANKING ${period}M`;
  return `<section class="card v4-entity ${type==='model'?'v13-model-block':''}"><div class="card-head"><div><span class="eyebrow">PIVOT MASTER · REGISTRATIONS</span><h2>${V4_LABELS[type]}</h2><p>El período se filtra acá porque modifica este ranking y este gráfico, no el resto del reporte.</p></div>${badge(status,type==='model'?'green':'purple')}</div>${v13rollButtons(type)}${extra}<div class="card-head"><div><span class="eyebrow">COMPARATIVO</span><h3>${type==='model'&&l>10?'Top 10 del universo filtrado':`Top ${l}`}</h3></div>${v13limitSwitch(type)}</div>${names.length?v6comparisonChart(type,chartLimit,period):'<div class="empty">Sin coincidencias para el filtro seleccionado.</div>'}${names.length?v4rankTable(type,l):''}<div class="v4-subhead"><b>Forecast ${V4_LABELS[type].toLowerCase()}</b><span>Oct-26 → Mar-27 · Down/Base/Up independientes</span></div>${names.length?v13forecastTable(type,l):''}${type==='model'?`<p class="v13-source-note">Universo activo: modelos Marca+Modelo con al menos un patentamiento entre Sep-25 y Sep-26 en la hoja Registrations del Pivot Master. Ya no se limita a los 25 modelos precalculados anteriores.</p>`:''}</section>`;
}
v4entityBlock=v13entityBlock;

function v13groupChart(){
  if(!V3_ROLL)return pending('Grupos','Historia Pivot no disponible.');
  const names=['IRAOLA','HONDA','LA EMILIA','GILERA','KELLER'].filter(n=>V3_ROLL.groups.includes(n)),metrics=Object.fromEntries(names.map(n=>[n,v3entityMetrics('group',n)])),months=V13_ROLL_WINDOW.group||3;
  const hist=V3_ROLL.group_history.slice(-months).map(r=>{const row={period:r.period},total=v6pivotTotal(r.period);names.forEach(n=>row[n]=V6_METRIC==='share'?(total?100*(Number(r[n])||0)/total:0):(Number(r[n])||0));return row});
  const future=DATA.forecast.rows.map((f,i)=>{const row={period:f.period};names.forEach(n=>row[n]=V6_METRIC==='share'?100*(metrics[n]?.f[i]?.share||0):(metrics[n]?.f[i]?.base||0));return row});
  return `<div class="v6-chart-label">${V6_METRIC==='share'?'MARKET SHARE (%)':'VOLUMEN (UNIDADES)'} · ${months}M actual + Base forecast</div>${lineChart([...hist,...future],v6chartSeries('group',names),{zero:true})}`;
}

/* Market: local history selector. Daily keeps its exact fixed window. */
market=function(){
  const hist=periodRows(DATA.market_history),shown=v13slice(hist,V13_MARKET_MONTHS),last=hist.at(-1),d=v5dailyStats(),r=n=>v3avg(DATA.market_history.slice(-n).map(x=>x.value));
  return chapter('market','04','Mercado actual, Daily 2025/26 & momentum','Cada filtro vive al lado del gráfico que realmente modifica. La ventana Daily conserva las fechas exactas del archivo.',`${v13buttons('market',V13_MARKET_MONTHS,[['12','12M'],['24','24M'],['48','48M'],['84','7 años'],['all','Histórico']])}<section class="kpis">${kpi('OCT MTD',d?fmt(d.currentMtd):'PENDING',d?`${pct(d.mtdVs)} vs mismas fechas 2025`:'',COLORS.red,'FACT')}${kpi('26/09→06/10',d?fmt(d.currentWindow):'PENDING',d?`${pct(d.windowVs)} YoY`:'',COLORS.blue,'FACT')}${kpi('R3M',fmt(r(3)),'promedio mensual',COLORS.red,'FACT')}${kpi('R6M',fmt(r(6)),'promedio mensual',COLORS.blue,'FACT')}${kpi('R12M',fmt(r(12)),'promedio mensual',COLORS.green,'FACT')}${kpi('ÚLTIMO YoY',pct(last.yoy),`MoM ${pct(last.mom)}`,COLORS.amber,'FACT')}</section><div class="grid two">${card('Daily cumulative',d?`26 Sep → ${v5dayLabel(d.cutoff)} · 2026 vs 2025`:'Cargando',v3dailyChart(),'OPEN WINDOW')}${card(`Historia mercado · ${V13_MARKET_MONTHS==='all'?'completa':V13_MARKET_MONTHS+'M'}`,'Este selector modifica únicamente esta serie histórica.',lineChart(shown.map(x=>({...x,actual:x.value})),[{key:'actual',name:'Actual',color:COLORS.actual}],{zero:true}),'HISTORY')}</div><div class="note">El filtro de período no altera Daily, forecast, KI ni otras hojas. Cada gráfico con horizonte editable tiene su propio control.</div>`);
};

/* Structure: no hidden global segment/period state; local rolling controls drive the relevant blocks. */
structure=function(){
  const row=DATA.segment_history?.at(-1),segs=(row?.segments||[]).slice().sort((a,b)=>b.value-a.value),iraola=v3entityMetrics('group','IRAOLA'),honda=v3entityMetrics('group','HONDA');
  const core=chapter('structure','05','Segmentos, marcas, grupos y modelos','La Pivot maestra gobierna la estructura. Los períodos se eligen dentro de cada ranking y los modelos usan el universo activo completo.',`${v6metricSwitch()}<section class="kpis">${kpi('IRAOLA R3M',fmt(iraola.r3),`MS ${pct(iraola.r3Share)}`,COLORS.blue,'FACT')}${kpi('HONDA R3M',fmt(honda.r3),`MS ${pct(honda.r3Share)}`,COLORS.red,'FACT')}${kpi('MODELOS ACTIVOS',V13_MODEL_DATA?fmt(V13_MODEL_DATA.active_count):'CARGANDO','Sep-25 → Sep-26 · Pivot Master',COLORS.green,'PIVOT')}${kpi('PIVOT CUT',V3_ROLL?.cutoff||'—','estructura',COLORS.amber,'SOURCE')}</section><div class="grid two">${card('Segmentos','Último corte estructural; no necesita selector temporal.',barChart(segs.map(x=>({name:x.name,value:x.value,share:x.share})),{showShare:true,color:r=>COLORS[r.name]||COLORS.blue}),'ACTUAL')}${card(`Grupos · ${V6_METRIC==='share'?'Market Share':'Volumen'}`,`Historia ${V13_ROLL_WINDOW.group}M + Base forecast.`,v13groupChart(),'GROUP OUTLOOK')}</div>${v13entityBlock('brand')}${v13entityBlock('group')}${v13entityBlock('model')}<div class="note"><b>Fuente:</b> Pivot Master / Registrations para apertura estructural. CAFAM continúa gobernando el total oficial; importaciones siguen separadas como señal de supply.</div>`);
  return `${core}${typeof v11ProductBlock==='function'?v11ProductBlock():''}`;
};

/* Forecast: horizon selector only inside forecast. User remains separate except Executive 4-scenario summary. */
forecast=function(){
  const actual=DATA.market_history.filter(r=>r.period>='2026-01'&&r.period<='2026-09').map(r=>({period:r.period,actual:r.value,down:null,base:null,up:null})),future=DATA.forecast.rows.map(r=>({period:r.period,actual:null,down:r.down,base:r.base,up:r.up})),all=[...actual,...future];
  const from=V13_FORECAST_SCOPE==='CY'?'2026-01':'2026-04',to=V13_FORECAST_SCOPE==='CY'?'2026-12':'2027-03',rows=all.filter(r=>r.period>=from&&r.period<=to);
  const sums={down:0,base:0,up:0};rows.forEach(r=>{if(r.actual!==null){sums.down+=r.actual;sums.base+=r.actual;sums.up+=r.actual}else{['down','base','up'].forEach(k=>sums[k]+=Number(r[k])||0)}});
  const label=V13_FORECAST_SCOPE==='CY'?'CY 2026 · Ene–Dic':'KI 26/27 · Abr–Mar';
  return chapter('forecast','06','Forecast independiente · mensual, CY & KI','Down / Base / Up permanecen independientes. El horizonte se filtra acá; Plan User vive en su hoja propia.',`${v13buttons('fscope',V13_FORECAST_SCOPE,[['CY','CY 2026'],['KI','KI 26/27']])}<div class="grid two">${card(`Actual + forecast · ${label}`,'Actuals cerrados + forecast restante.',lineChart(rows,[{key:'actual',name:'Actual',color:COLORS.actual},{key:'down',name:'Down',color:COLORS.down},{key:'base',name:'Base',color:COLORS.red},{key:'up',name:'Up',color:COLORS.blue}],{zero:true}),'MARKET PATH')}${card(`Escenarios · ${label}`,'Total del período seleccionado.',barChart([{name:'Down',value:sums.down},{name:'Base',value:sums.base},{name:'Up',value:sums.up}],{color:r=>r.name==='Down'?COLORS.down:r.name==='Up'?COLORS.blue:COLORS.red,limit:3}),'DOWN / BASE / UP')}</div>${typeof v8fcstLongTable==='function'?v8fcstLongTable():''}`);
};

const V13_BASE_BIND=bindSingle;
bindSingle=function(){
  V13_BASE_BIND();
  $$('[data-v13-market]').forEach(b=>b.onclick=()=>{V13_MARKET_MONTHS=b.dataset.v13Market;v13save();render()});
  $$('[data-v13-fscope]').forEach(b=>b.onclick=()=>{V13_FORECAST_SCOPE=b.dataset.v13Fscope;v13save();render()});
  $$('[data-v13-roll]').forEach(b=>b.onclick=()=>{const t=b.dataset.v13Roll;V13_ROLL_WINDOW[t]=Number(b.dataset.v13RollValue)||3;v13save();render()});
  $$('[data-v13-limit]').forEach(b=>b.onclick=()=>{V4_LIMITS[b.dataset.v13LimitType]=Number(b.dataset.v13Limit)||10;render()});
  const brand=$('#v13ModelBrand'),search=$('#v13ModelSearch'),apply=$('#v13ModelApply'),clear=$('#v13ModelClear');
  if(brand)brand.onchange=()=>{V13_MODEL_BRAND=brand.value;v13save();render()};
  if(apply)apply.onclick=()=>{V13_MODEL_QUERY=search?.value||'';v13save();render()};
  if(search)search.onkeydown=e=>{if(e.key==='Enter')apply?.click()};
  if(clear)clear.onclick=()=>{V13_MODEL_QUERY='';V13_MODEL_BRAND='ALL';v13save();render()};
};

v13loadModels();
