/* 2W Market Analysis v3 — single report, daily evolution, plan lab, entity rolling + forecasts */
const V3_INDEX=[
  ['context','01','Argentina hoy'],['executive','02','Resumen ejecutivo'],['consumer','03','Consumidor & movilidad'],
  ['market','04','Mercado + Daily'],['structure','05','Competencia + Rolling'],['forecast','06','Forecast CY / KI'],
  ['user','07','Plan usuario'],['planning','08','Honda & Commercial'],['actions','09','Noticias / rumores / reportes'],
  ['method','10','Metodología & datos']
];
let V3_DAILY=null,V3_ROLL=null;
let V3_PLAN=(()=>{try{return {...{marketKI:850000,hondaKI:190000},...JSON.parse(localStorage.getItem('2w.plan')||'{}')}}catch{return {marketKI:850000,hondaKI:190000}}})();
const V3_PURPLE='#7c3aed';
function v3save(){localStorage.setItem('2w.plan',JSON.stringify(V3_PLAN))}
function v3avg(a){return a.length?a.reduce((x,y)=>x+(Number(y)||0),0)/a.length:0}
function v3sum(a){return a.reduce((x,y)=>x+(Number(y)||0),0)}
function v3pct(a,b){return b? a/b-1:null}
function v3actualMarketKI(){return v3sum(DATA.market_history.filter(r=>r.period>='2026-04'&&r.period<='2026-09').map(r=>r.value))}
function v3actualHondaKI(){return v3sum((DATA.honda?.history||[]).filter(r=>r.period>='2026-04'&&r.period<='2026-09').map(r=>r.honda))}
function v3applyExact(rows,key,target,baseKey='base'){
  const base=v3sum(rows.map(r=>r[baseKey])); if(!rows.length||!base)return;
  const raw=rows.map(r=>({r,x:(Number(r[baseKey])||0)/base*target}));
  raw.forEach(x=>x.r[key]=Math.floor(x.x)); let left=Math.round(target-v3sum(raw.map(x=>x.r[key])));
  raw.sort((a,b)=>(b.x-Math.floor(b.x))-(a.x-Math.floor(a.x)));
  for(let i=0;i<left;i++)raw[i%raw.length].r[key]++;
}

syncUserScenario=function(){
  if(!DATA)return;
  const actualM=v3actualMarketKI(),remainM=Math.max(0,Number(V3_PLAN.marketKI||0)-actualM);
  v3applyExact(DATA.forecast.rows,'user',remainM,'base');
  DATA.forecast.rows.forEach(r=>r.expected=scenarioExpected(r));
  (DATA.forecast.segments||[]).forEach((r,i)=>{
    const total=DATA.forecast.rows[i]?.user||r.total.base;
    const alloc=applyLargestRemainder(r.segments,total);r.total.user=total;r.total.expected=scenarioExpected(r.total);
    r.segments.forEach(s=>{s.user=alloc[s.name];s.expected=scenarioExpected(s)});
  });
  const hf=DATA.honda?.forecast||[],actualH=v3actualHondaKI(),remainH=Math.max(0,Number(V3_PLAN.hondaKI||0)-actualH);
  v3applyExact(hf,'user',remainH,'base');hf.forEach(r=>r.expected=scenarioExpected(r));
};

nav=function(){return V3_INDEX.map(([id,n,t])=>`<button data-anchor="${id}"><i>${n}</i><span>${t}</span></button>`).join('')};
function v3refreshNav(){const n=$('#navigation');if(!n)return;n.innerHTML=nav();$$('[data-anchor]').forEach(b=>b.addEventListener('click',()=>{const el=document.getElementById(b.dataset.anchor);if(el)el.scrollIntoView({behavior:'smooth',block:'start'});$('#sidebar')?.classList.remove('open')}))}

function v3business(rows){
  const out=[];
  rows.forEach(r=>{const d=new Date(`${r.date}T12:00:00Z`),w=d.getUTCDay();if((w===0||w===6)&&out.length){out[out.length-1].value+=r.value}else if(w!==0&&w!==6){out.push({date:r.date,value:r.value})}});
  let s=0;return out.map((r,i)=>({period:`D${i+1}`,value:r.value,cum:(s+=r.value)}));
}
function v3dailyStats(){
  if(!V3_DAILY)return null;const c=v3business(V3_DAILY.current),p=v3business(V3_DAILY.previous_month_comparable),n=Math.min(c.length,p.length),cc=c[n-1]?.cum||0,pc=p[n-1]?.cum||0;
  const sep=DATA.market_history.find(r=>r.period==='2026-09')?.value||0,pace=pc?Math.round(sep*cc/pc):null;
  return {c,p,n,current:cc,previous:pc,vs:v3pct(cc,pc),pace};
}
function v3dailyChart(){const s=v3dailyStats();if(!s)return pending('Daily evolution','Cargando snapshot SIOMAA.');const rows=Array.from({length:s.n},(_,i)=>({period:`D${i+1}`,current:s.c[i]?.cum,previous:s.p[i]?.cum}));return lineChart(rows,[{key:'current',name:'Oct-26 MTD',color:COLORS.red},{key:'previous',name:'Sep-26 mismo estadio',color:COLORS.previous}],{zero:true})}

function v3forecastFull(){
  const actual=DATA.market_history.filter(r=>r.period>='2026-01'&&r.period<='2026-09').map(r=>({period:r.period,actual:r.value,down:null,base:null,up:null,user:null}));
  const last=actual.at(-1);if(last){last.down=last.actual;last.base=last.actual;last.up=last.actual;last.user=last.actual}
  return [...actual,...DATA.forecast.rows.map(r=>({period:r.period,actual:null,down:r.down,base:r.base,up:r.up,user:r.user}))];
}
function v3currentKI(){return currentKI()}
function v3planFit(){const k=v3currentKI(),p=Number(V3_PLAN.marketKI)||0,span=Math.max(1,k.up-k.base,k.base-k.down),z=Math.abs(p-k.base)/span,compat=Math.max(1,Math.min(99,Math.round(100*Math.exp(-.75*z*z))));let zone='CONDICIONAL';if(p>=k.down&&p<=k.up)zone=p<k.base?'ENTRE DOWN Y BASE':p>k.base?'ENTRE BASE Y UP':'BASE';else if(p>k.up)zone='SOBRE UPSIDE';else zone='BAJO DOWNSIDE';const share=p?Number(V3_PLAN.hondaKI||0)/p:0;return {k,p,compat,zone,share,gapBase:p-k.base,gapUp:p-k.up,gapDown:p-k.down}}

function v3structTotal(period){const r=DATA.segment_history?.find(x=>x.period===period);if(r)return v3sum((r.segments||[]).map(x=>x.value));return DATA.market_history.find(x=>x.period===period)?.value||0}
function v3hist(type){return V3_ROLL?.[`${type}_history`]||[]}
function v3names(type){return V3_ROLL?.[type==='brand'?'brands':type==='group'?'groups':'models']||[]}
function v3entityMetrics(type,name){
  const h=v3hist(type),last=h.at(-1),prev=h.at(-2),yoy=h[0],cur=Number(last?.[name])||0;
  const roll=n=>v3avg(h.slice(-n).map(r=>Number(r[name])||0));
  const share=n=>{const rows=h.slice(-n),num=v3sum(rows.map(r=>Number(r[name])||0)),den=v3sum(rows.map(r=>v3structTotal(r.period)));return den?num/den:0};
  const s0=v3structTotal(last?.period)?cur/v3structTotal(last.period):0,s3=share(3),s6=share(6);let s=.55*s0+.30*s3+.15*s6;const drift=s3-s6;s=Math.max(0,s+drift*.45);
  const f=DATA.forecast.rows.map((r,i)=>{const ss=Math.max(0,s+drift*Math.pow(.55,i+1));return {period:r.period,share:ss,down:Math.round(r.down*ss),base:Math.round(r.base*ss),up:Math.round(r.up*ss)}});
  const actualKI=v3sum(h.filter(r=>r.period>='2026-04'&&r.period<='2026-09').map(r=>Number(r[name])||0)),kiBase=actualKI+v3sum(f.map(x=>x.base));
  return {name,current:cur,mom:v3pct(cur,Number(prev?.[name])||0),yoy:v3pct(cur,Number(yoy?.[name])||0),r3:roll(3),r6:roll(6),r12:roll(12),share:s0,f,kiBase};
}
function v3entityTable(type,limit){const names=v3names(type).slice(0,limit);if(!names.length)return pending('Rolling / forecast','Cargando historia estructural.');const rows=names.map(n=>v3entityMetrics(type,n));return `<div class="table-wrap"><table class="table entity-table"><thead><tr><th>${type==='brand'?'Marca':type==='group'?'Grupo':'Modelo'}</th><th>Sep</th><th>MoM</th><th>YoY</th><th>R3M</th><th>R6M</th><th>R12M</th><th>Oct Base</th><th>KI Base</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${r.name}</strong></td><td>${fmt(r.current)}</td><td class="${ratioTone(r.mom)}-txt">${pct(r.mom)}</td><td class="${ratioTone(r.yoy)}-txt">${pct(r.yoy)}</td><td>${fmt(r.r3)}</td><td>${fmt(r.r6)}</td><td>${fmt(r.r12)}</td><td>${fmt(r.f[0]?.base)}</td><td><strong>${fmt(r.kiBase)}</strong></td></tr>`).join('')}</tbody></table></div>`}
function v3groupChart(){if(!V3_ROLL)return pending('Grupos','Cargando historia.');const names=['IRAOLA','HONDA','LA EMILIA','GILERA','KELLER'].filter(n=>V3_ROLL.groups.includes(n));const hist=V3_ROLL.group_history.slice(-7).map(r=>({...r}));const future=DATA.forecast.rows.map((f,i)=>{const row={period:f.period};names.forEach(n=>row[n]=v3entityMetrics('group',n).f[i]?.base);return row});const series=names.map((n,i)=>({key:n,name:n,color:n==='HONDA'?COLORS.red:[COLORS.blue,COLORS.green,COLORS.amber,'#8a5bd1'][i%4]}));return lineChart([...hist,...future],series,{zero:true})}

updateBand=function(){const d=V3_DAILY?.current_cutoff||'PENDING';return `<div class="update-band"><div><span>CIERRE</span><b>${DATA.meta.market_cutoff}</b></div><div><span>DAILY</span><b>${d}</b></div><div><span>IMPORTS</span><b>${DATA.meta.imports_cutoff||DATA.imports?.cutoff||'—'}</b></div><div><span>ESTRUCTURA</span><b>${V3_ROLL?.cutoff||DATA.meta.structure_cutoff||'—'}</b></div><div><span>FORECAST</span><b>${DATA.forecast.version}</b></div></div>`};

exec=function(){
  const e=DATA.executive,h=DATA.honda,ki=v3currentKI(),d=v3dailyStats(),fit=v3planFit();
  return chapter('executive','02','Resumen ejecutivo','Mes en curso, cierre anterior, KI, escenarios y decisión en una sola lectura.',`<section class="kpis">
  ${kpi('OCT MTD',d?fmt(d.current):'PENDING',d?`${d.n} días hábiles comparables · ${pct(d.vs)} vs Sep`:'SIOMAA',COLORS.red,d?'EARLY SIGNAL':'PENDING')}
  ${kpi('NOWCAST PACE',d&&d.pace?fmt(d.pace):'PENDING',d?`Base Oct ${fmt(DATA.forecast.rows[0].base)} · señal por pace`:'',COLORS.green,'EARLY SIGNAL')}
  ${kpi('SEP CERRADO',fmt(e.market),`${pct(e.mom)} MoM · ${pct(e.yoy)} YoY`,COLORS.actual,'FACT')}
  ${kpi('KI 26/27 BASE',fmt(ki.base),`Down ${fmt(ki.down)} · Up ${fmt(ki.up)}`,COLORS.blue,'FORECAST')}
  ${kpi('PLAN USUARIO',fmt(V3_PLAN.marketKI),`${fmt(V3_PLAN.hondaKI)} Honda · share ${pct(fit.share)}`,V3_PURPLE,'USER INPUT')}</section>
  <div class="grid two">${card('Daily evolution','Cumulado por igual cantidad de días hábiles; sábado/domingo se agrega al día hábil previo sólo para la comparación.',v3dailyChart(),'SIOMAA')}${card('Lectura del mes abierto','No se reemplaza Base por una señal diaria.',`<div class="narrative"><h3>${d&&d.vs>0?'Ritmo inicial por encima de septiembre':'Ritmo inicial por debajo de septiembre'}</h3><p>${d?`Octubre acumula ${fmt(d.current)} unidades en ${d.n} días hábiles comparables, ${pct(d.vs)} vs el mismo estadio de septiembre. El pace simple implicaría ~${fmt(d.pace)}, mientras el Base oficial es ${fmt(DATA.forecast.rows[0].base)}.`:'Daily pendiente.'}</p><div>${badge('BASE NO SE MUEVE AUTOMÁTICAMENTE','amber')}${badge('YOY DAILY OCT-25 PENDING','amber')}</div></div>`,'DIAGNOSIS')}</div>
  <div class="storyline"><div><b>Qué pasó</b><p>Sep cerró ${fmt(e.market)} con ${pct(e.yoy)} YoY.</p></div><div><b>Qué está pasando</b><p>El Daily de octubre ya entra al reporte como señal temprana.</p></div><div><b>Qué comparar</b><p>Plan usuario vs Down/Base/Up, más grupos, marcas y modelos.</p></div></div>`)
};

market=function(){const hist=periodRows(DATA.market_history),last=hist.at(-1);const r=n=>v3avg(DATA.market_history.slice(-n).map(x=>x.value));return chapter('market','04','Mercado actual, Daily & momentum','Actual cerrado + mes abierto + rolling. MoM y YoY permanecen visibles.',`<section class="kpis">${kpi('ROLLING 3M',fmt(r(3)),'promedio mensual',COLORS.red,'FACT')}${kpi('ROLLING 6M',fmt(r(6)),'promedio mensual',COLORS.blue,'FACT')}${kpi('ROLLING 12M',fmt(r(12)),'promedio mensual',COLORS.green,'FACT')}${kpi('ÚLTIMO YoY',pct(last.yoy),`MoM ${pct(last.mom)}`,COLORS.amber,'FACT')}</section><div class="grid two">${card('Daily evolution',V3_DAILY?`Corte ${V3_DAILY.current_cutoff}`:'Cargando',v3dailyChart(),'OPEN MONTH')}${card('Actual + perspectiva','El cierre histórico sigue visible antes del forecast.',lineChart(hist.slice(-18).map(x=>({...x,actual:x.value})),[{key:'actual',name:'Actual',color:COLORS.actual}],{zero:true}),'HISTORY')}</div>`)};

structure=function(){
  const row=DATA.segment_history?.at(-1);let segs=(row?.segments||[]).slice().sort((a,b)=>b.value-a.value);if(state.segment!=='TOTAL')segs=segs.filter(x=>x.name===state.segment);
  return chapter('structure','05','Segmentos, marcas, grupos y modelos','Actual, MoM, YoY, Rolling y forecast competitivo juntos; Iraola se compara directamente contra Honda y otros grupos.',`<div class="grid two">${card('Segmentos','Último corte estructural.',barChart(segs.map(x=>({name:x.name,value:x.value,share:x.share})),{showShare:true,color:r=>COLORS[r.name]||COLORS.blue}),'ACTUAL')}${card('Grupos: actual + forecast Base','Línea continua para Iraola, Honda, La Emilia, Gilera y Keller.',v3groupChart(),'GROUP OUTLOOK')}</div>
  ${card('Marcas · Rolling + forecast','Rolling real desde Registrations. Forecast = share estabilizado × mercado libre.',v3entityTable('brand',8),'BRANDS')}
  ${card('Grupos · Rolling + forecast','Comparativa explícita contra Iraola y principales grupos.',v3entityTable('group',8),'GROUPS')}
  ${card('Modelos · Rolling + forecast','Top estructural con MoM/YoY y KI Base estimado.',v3entityTable('model',15),'MODELS')}
  <div class="note">Forecast por entidad: participación reciente estabilizada (actual + Rolling 3M/6M) aplicada al forecast independiente de mercado. Es <b>ESTIMATE</b>, no stock ni plan comercial.</div>`)
};

forecast=function(){
  const rows=v3forecastFull(),ki=v3currentKI(),fit=v3planFit();const actCY=v3sum(DATA.market_history.filter(r=>r.period>='2026-01'&&r.period<='2026-09').map(r=>r.value));
  const cy={down:actCY,base:actCY,up:actCY,user:actCY};DATA.forecast.rows.filter(r=>r.period<='2026-12').forEach(r=>['down','base','up','user'].forEach(k=>cy[k]+=Number(r[k]||0)));
  return chapter('forecast','06','Cómo viene y cómo quedaría: mensual, CY & KI','El gráfico arranca en los actuals; no empieza en octubre. Down/Base/Up y Plan continúan desde el cierre observado.',`<div class="grid two">${card('Actual + forecast','Ene-26 → Mar-27.',lineChart(rows,[{key:'actual',name:'Actual',color:COLORS.actual},{key:'down',name:'Down',color:COLORS.down},{key:'base',name:'Base',color:COLORS.red},{key:'up',name:'Up',color:COLORS.blue},{key:'user',name:'Plan usuario',color:V3_PURPLE}],{zero:true}),'MARKET PATH')}${card('CY 2026','Actual Jan–Sep + forecast Oct–Dic.',`<div class="scenario-strip"><span>Down <b>${fmt(cy.down)}</b></span><span>Base <b>${fmt(cy.base)}</b></span><span>Up <b>${fmt(cy.up)}</b></span><span>Plan <b>${fmt(cy.user)}</b></span></div><div class="big-number">${fmt(ki.base)}<small>KI 26/27 Base</small></div>`,'CY / KI')}</div>
  ${card('KI 26/27 · escenarios vs plan','El plan no modifica el forecast libre.',barChart([{name:'Down',value:ki.down},{name:'Base',value:ki.base},{name:'Up',value:ki.up},{name:'Plan usuario',value:V3_PLAN.marketKI}],{color:(r)=>r.name==='Plan usuario'?V3_PURPLE:r.name==='Down'?COLORS.down:r.name==='Up'?COLORS.blue:COLORS.red,limit:4}),'SCENARIO GAP')}
  <div class="analysis-line"><b>Plan usuario:</b> ${fmt(V3_PLAN.marketKI)} · ${fit.zone} · gap vs Base ${fmt(fit.gapBase)} · compatibilidad indicativa ${fit.compat}%.</div>`)
};

userBlock=function(){const fit=v3planFit(),k=fit.k;return chapter('user','07','Plan usuario: mercado + Honda','Acá ingresás directamente el mercado KI y el volumen Honda. La app lo compara contra el forecast libre; no altera Base.',`<div class="plan-inputs"><label><span>MERCADO KI 26/27</span><input id="planMarket" type="number" step="1000" min="0" value="${V3_PLAN.marketKI}"><small>USER INPUT</small></label><label><span>HONDA KI 26/27</span><input id="planHonda" type="number" step="1000" min="0" value="${V3_PLAN.hondaKI}"><small>USER INPUT</small></label><button id="applyPlan">Aplicar plan</button></div>
  <section class="kpis">${kpi('PLAN MERCADO',fmt(V3_PLAN.marketKI),`vs Base ${fmt(fit.gapBase)}`,V3_PURPLE,'USER INPUT')}${kpi('PLAN HONDA',fmt(V3_PLAN.hondaKI),`share requerido ${pct(fit.share)}`,COLORS.red,'USER INPUT')}${kpi('COMPATIBILIDAD',`${fit.compat}%`,fit.zone,COLORS.amber,'ESTIMATE')}${kpi('PROB. BASE',`${RPROB.base}%`,`Down ${RPROB.down}% · Up ${RPROB.up}%`,COLORS.green,'ASSUMPTION')}</section>
  <div class="grid two">${card('Plan vs forecast libre','Down/Base/Up son mutuamente excluyentes y suman 100%. El plan queda aparte.',barChart([{name:'Down',value:k.down},{name:'Base',value:k.base},{name:'Up',value:k.up},{name:'Plan',value:V3_PLAN.marketKI}],{color:r=>r.name==='Plan'?V3_PURPLE:r.name==='Down'?COLORS.down:r.name==='Up'?COLORS.blue:COLORS.red,limit:4}),'KI 26/27')}${card('Qué exige el plan','Lectura operativa.',`<div class="signals"><div class="signal"><div class="signal-top"><h3>Mercado</h3>${badge(fit.zone,fit.p>=k.down&&fit.p<=k.up?'green':'amber')}</div><p>${fmt(V3_PLAN.marketKI)} vs Base ${fmt(k.base)} y Upside ${fmt(k.up)}.</p></div><div class="signal"><div class="signal-top"><h3>Honda</h3>${badge(`${pct(fit.share)} SHARE`,'amber')}</div><p>${fmt(V3_PLAN.hondaKI)} unidades requieren ${pct(fit.share)} del mercado planteado.</p></div><div class="signal"><div class="signal-top"><h3>Probabilidades oficiales</h3>${badge('PROVISIONALES','amber')}</div><p>Down ${RPROB.down}% · Base ${RPROB.base}% · Up ${RPROB.up}%. Se mantienen como ASSUMPTION hasta cerrar backtesting.</p></div></div>`,'PLAN CHECK')}</div>
  <div class="note">La “compatibilidad” del plan mide distancia al rango Down/Base/Up. No se presenta como probabilidad estadística validada hasta incorporar backtesting, error histórico y distribución del modelo.</div>`)};

planning=function(){const h=DATA.honda,fit=v3planFit();return chapter('planning','08','Honda & Commercial Planning','Honda actual, plan del usuario y trayectoria estratégica al 30% en la misma lectura.',`<section class="kpis">${kpi('HONDA SEP',fmt(h.volume),`${pct(h.share)} share`,COLORS.red,'FACT')}${kpi('PLAN HONDA KI',fmt(V3_PLAN.hondaKI),`${pct(fit.share)} share sobre plan mercado`,V3_PURPLE,'USER INPUT')}${kpi('TARGET 2030','30%',`gap actual ${pp(.30-h.share)}`,COLORS.red,'TARGET')}</section><div class="grid two">${card('Share actual vs 30%','Target comparado, nunca incorporado silenciosamente al mercado.',lineChart(h.target_path.map(x=>({period:`${x.year}-12`,share:x.target_share})),[{key:'share',name:'Target',color:COLORS.red}],{percent:true,zero:true,maxValue:.32}),'STRATEGY')}${card('Portfolio Honda','Actual por modelo.',barChart(h.models.slice(0,10).map(x=>({name:x.model,value:x.value,share:x.share_honda})),{showShare:true,color:COLORS.red,limit:10}),'PRODUCT')}</div>${pending('WS / RS / stock / presupuesto','Se habilita sólo como USER INPUT protegido o fuente interna autorizada.')}`)};

actions=function(){const news=(DATA.news_radar||[]).filter(n=>!String(n.category).toLowerCase().includes('safety')),signals=DATA.imports?.new_model_signals||[];return chapter('actions','09','Noticias, rumores, señales & reportes','Safety fue removido. Este bloque concentra hechos, early signals, rumores y salidas ejecutivas.',`<div class="news-grid">${news.map(n=>`<article class="news-card"><div><span class="eyebrow">${n.date} · ${n.category}</span>${badge(n.source?.toLowerCase().includes('honda')?'CONFIRMADO':'REPORTE',n.impact==='high'?'green':'amber')}</div><h2>${n.title}</h2><p>${n.detail}</p><a href="${n.url}" target="_blank" rel="noreferrer">${n.source} ↗</a></article>`).join('')}</div>
  ${card('Rumor / amenaza watch','No se confirma una llegada sólo por una importación.',`<div class="intel-list">${signals.slice(0,8).map(x=>`<div>${badge('EARLY SIGNAL','amber')}<b>${x.name}</b><span>${fmt(x.units)} uds importadas</span></div>`).join('')}</div>`,'RUMOR / SIGNAL')}
  ${card('Informes y reportes','Misma narrativa, distinta frecuencia.',`<div class="report-types"><span>Morning Context</span><span>Weekly Market Intelligence</span><span>Monthly Close</span><span>Current Month Outlook</span><span>Scenario Review</span><span>KI Budget & Forecast</span><span>Product Planning</span><span>Honda & Competition</span><span>Changelog</span></div><div class="export-actions"><button data-export="pdf">↧ PDF</button><button data-export="ppt">↧ PowerPoint</button><button data-export="csv">↧ Excel / CSV</button></div>`,'REPORT CENTER')}`)};

renderSingleReport=function(){syncUserScenario();return `<div class="single-report">${updateBand()}${ctx()}${exec()}${consumer()}${market()}${structure()}${forecast()}${userBlock()}${planning()}${actions()}${renderData()}</div>`};

function v3bindInputs(){const a=$('#applyPlan');if(a)a.addEventListener('click',()=>{V3_PLAN.marketKI=Math.max(0,Number($('#planMarket')?.value)||0);V3_PLAN.hondaKI=Math.max(0,Number($('#planHonda')?.value)||0);v3save();syncUserScenario();render()})}
const V3_BASE_BIND=bindReportEvents;bindReportEvents=function(){V3_BASE_BIND();v3bindInputs()};

Promise.all([
  fetch('/data/daily-open-month.json',{cache:'no-store'}).then(r=>r.ok?r.json():null),
  fetch('/data/rolling-entities.json',{cache:'no-store'}).then(r=>r.ok?r.json():null)
]).then(([d,r])=>{V3_DAILY=d;V3_ROLL=r;const ready=()=>{if(typeof DATA!=='undefined'&&DATA){v3refreshNav();syncUserScenario();render()}else setTimeout(ready,100)};ready()}).catch(console.error);
setTimeout(v3refreshNav,0);
