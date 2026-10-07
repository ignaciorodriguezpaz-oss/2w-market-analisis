/* 2W Market Analysis v12 — Plan User is a separate sheet + monthly PRB/1Q/2Q/3Q history */
const V12_VERSION='20261007-user-sheet-monthly-revisions';
let V12_PAGE='analysis';
let V12_STAGE='2QFCST';
const V12_PERIODS=['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12','2027-01','2027-02','2027-03'];
const V12_STAGE_PLAN_START={PRB:'2026-04','1QFCST':'2026-07','2QFCST':'2026-10','3QFCST':'2027-01'};
const V12_STAGE_RESULT_END={PRB:null,'1QFCST':'2026-06','2QFCST':'2026-09','3QFCST':'2026-12'};
let V12_MONTHLY=(()=>{try{return JSON.parse(localStorage.getItem('2w.plan.monthly.v12')||'{}')||{}}catch{return {}}})();

function v12saveMonthly(){try{localStorage.setItem('2w.plan.monthly.v12',JSON.stringify(V12_MONTHLY))}catch{}}
function v12monthlyCell(stage,field,period){return Number(V12_MONTHLY?.[stage]?.[field]?.[period])||null}
function v12setMonthly(stage,field,period,val){
  V12_MONTHLY[stage]=V12_MONTHLY[stage]||{};V12_MONTHLY[stage][field]=V12_MONTHLY[stage][field]||{};
  const n=Number(val);if(Number.isFinite(n)&&n>0)V12_MONTHLY[stage][field][period]=n;else delete V12_MONTHLY[stage][field][period];
  if(!Object.keys(V12_MONTHLY[stage][field]).length)delete V12_MONTHLY[stage][field];
  if(!Object.keys(V12_MONTHLY[stage]).length)delete V12_MONTHLY[stage];
}
function v12isResult(stage,period){const end=V12_STAGE_RESULT_END[stage];return !!end&&period<=end}
function v12planPeriods(stage){return V12_PERIODS.filter(p=>!v12isResult(stage,p))}
function v12actual(field,period){
  if(field==='market')return Number((DATA.market_history||[]).find(r=>r.period===period)?.value)||null;
  return Number((DATA.honda?.history||[]).find(r=>r.period===period)?.honda)||null;
}
function v12openActual(field,period){
  if(period!=='2026-10')return v12actual(field,period);
  if(field==='market'){const d=v5dailyStats?.();return Number(d?.currentMtd)||null}
  return null;
}
function v12seasonWeight(period){
  const m=Number(String(period).slice(5,7));return Number(DATA?.seasonality?.market?.monthly_index?.[m-1])||1;
}
function v12stageTotal(stage,field){
  const e=v8effectivePlan(),r=e.stages.find(x=>x.id===stage);
  return Number(r?.[field])||0;
}
function v12monthlyEffective(stage,field){
  const total=v12stageTotal(stage,field),resultPeriods=V12_PERIODS.filter(p=>v12isResult(stage,p)),planPeriods=v12planPeriods(stage);
  const resultVals=Object.fromEntries(resultPeriods.map(p=>[p,v12actual(field,p)]));
  const knownResult=resultPeriods.reduce((s,p)=>s+(Number(resultVals[p])||0),0);
  const explicit=Object.fromEntries(planPeriods.map(p=>[p,v12monthlyCell(stage,field,p)]));
  const explicitSum=planPeriods.reduce((s,p)=>s+(Number(explicit[p])||0),0);
  const blanks=planPeriods.filter(p=>!explicit[p]);
  const residual=Math.max(0,total-knownResult-explicitSum);
  const weightSum=blanks.reduce((s,p)=>s+v12seasonWeight(p),0)||1;
  const out={};
  V12_PERIODS.forEach(p=>{
    if(v12isResult(stage,p)){out[p]={value:resultVals[p],mode:resultVals[p]?'RESULT':'PENDING RESULT',locked:true};return}
    if(explicit[p]){out[p]={value:explicit[p],mode:'USER INPUT',locked:false};return}
    out[p]={value:Math.round(residual*v12seasonWeight(p)/weightSum),mode:'AUTO',locked:false};
  });
  return out;
}
function v12completeAndSyncStage(stage,field){
  const plan=v12planPeriods(stage),allPlan=plan.every(p=>!!v12monthlyCell(stage,field,p));
  const results=V12_PERIODS.filter(p=>v12isResult(stage,p)),allResults=results.every(p=>!!v12actual(field,p));
  if(!allPlan||!allResults)return false;
  const total=V12_PERIODS.reduce((s,p)=>s+(v12isResult(stage,p)?Number(v12actual(field,p)||0):Number(v12monthlyCell(stage,field,p)||0)),0);
  V8_PLAN_MATRIX[stage]=V8_PLAN_MATRIX[stage]||{};V8_PLAN_MATRIX[stage][field]=Math.round(total);return true;
}
function v12captureMonthlyInputs(){
  $$('.v12-month-input').forEach(el=>v12setMonthly(el.dataset.stage,el.dataset.field,el.dataset.period,el.value));
  v12saveMonthly();
}
function v12saveAndSync(){
  v12captureMonthlyInputs();
  ['market','honda'].forEach(field=>v12completeAndSyncStage(V12_STAGE,field));
  v8save();v8syncActive();render();
}
function v12stageStatus(stage){const meta=v9stageMeta(stage);return `${meta.result} → Plan ${meta.plan}`}

function v12stageEditor(stage){
  const m=v12monthlyEffective(stage,'market'),h=v12monthlyEffective(stage,'honda'),meta=v9stageMeta(stage);
  const marketTotal=V12_PERIODS.reduce((s,p)=>s+(Number(m[p]?.value)||0),0),hondaTotal=V12_PERIODS.reduce((s,p)=>s+(Number(h[p]?.value)||0),0);
  return `<section class="card v12-revision-editor"><div class="card-head"><div><span class="eyebrow">MONTHLY FORECAST VERSION</span><h2>${meta.label} · detalle mensual</h2><p>${meta.result} queda como Result; ${meta.plan} corresponde al plan de esa revisión.</p></div>${badge(v12stageStatus(stage),stage===v9activeStageKey()?'green':'purple')}</div>
  <div class="v12-stage-tabs">${V8_STAGE_KEYS.map(k=>`<button data-v12-stage="${k}" class="${k===stage?'active':''}">${V8_STAGE_LABELS[k]}</button>`).join('')}</div>
  <div class="table-wrap"><table class="table v12-month-grid"><thead><tr><th>Serie</th>${V12_PERIODS.map(p=>`<th>${v10monthLabel(p)}</th>`).join('')}<th>Total</th></tr></thead><tbody>
    ${['market','honda'].map(field=>{const map=field==='market'?m:h;return `<tr><td><b>${field==='market'?'MERCADO':'HONDA'}</b></td>${V12_PERIODS.map(p=>{const c=map[p];if(c.locked)return `<td class="v12-result-cell"><strong>${c.value?fmt(c.value):'PENDING'}</strong><small>${c.mode}</small></td>`;const exp=v12monthlyCell(stage,field,p);return `<td><input class="v12-month-input" data-stage="${stage}" data-field="${field}" data-period="${p}" type="number" min="0" step="100" value="${exp||''}" placeholder="${fmt(c.value||0)}"><small>${c.mode}</small></td>`}).join('')}<td><strong>${fmt(field==='market'?marketTotal:hondaTotal)}</strong></td></tr>`}).join('')}
  </tbody></table></div>
  <div class="v12-actions"><button id="v12SaveMonthly">Guardar detalle mensual</button><span>Si completás todos los meses Plan de la revisión, el total anual se recalcula desde la suma mensual + Result.</span></div></section>`;
}

function v12revisionTable(field){
  const stages=V8_STAGE_KEYS,series=Object.fromEntries(stages.map(s=>[s,v12monthlyEffective(s,field)]));
  const d=v5dailyStats?.();
  return `<section class="card"><div class="card-head"><div><span class="eyebrow">VERSION HISTORY · ${field==='market'?'MARKET':'HONDA'}</span><h2>${field==='market'?'Mercado':'Honda'} · PRB vs 1Q vs 2Q vs 3Q</h2><p>Permite ver cómo fue cambiando el plan mensual y compararlo con el resultado actual.</p></div>${badge('FORECAST HISTORY','purple')}</div><div class="table-wrap"><table class="table v12-version-table"><thead><tr><th>Mes</th><th>Actual / MTD</th>${stages.map(s=>`<th>${V8_STAGE_LABELS[s]}</th>`).join('')}<th>FCST independiente</th></tr></thead><tbody>${V12_PERIODS.map(p=>{
    const actual=p==='2026-10'?(field==='market'?Number(d?.currentMtd)||null:null):v12actual(field,p);
    const independent=field==='market'?Number((DATA.forecast?.rows||[]).find(r=>r.period===p)?.base)||null:Number((DATA.honda?.forecast||[]).find(r=>r.period===p)?.base)||null;
    return `<tr><td><b>${v10monthLabel(p)}</b></td><td>${actual?`<strong>${fmt(actual)}</strong>${p==='2026-10'?'<small>MTD</small>':''}`:'—'}</td>${stages.map(s=>{const c=series[s][p];return `<td class="${c.mode==='USER INPUT'?'v12-user-cell':''}">${c.value?fmt(c.value):'—'}<small>${c.mode}</small></td>`}).join('')}<td>${independent?fmt(independent):'—'}</td></tr>`}).join('')}</tbody></table></div></section>`;
}

function v12userSheet(){
  const e=v8effectivePlan(),a=e.active,meta=v9stageMeta(e.activeKey);
  return `<div class="single-report v12-user-page"><div class="report-cover v12-user-cover"><span>2W MARKET ANALYSIS · SEPARATE SHEET</span><h1>Plan User</h1><p>Budget y revisiones Honda en una hoja independiente del análisis de mercado.</p></div>${updateBand()}${v9quarterCalendar()}
  <section class="kpis">${kpi('REVISIÓN VIGENTE',meta.label,`${meta.result} → ${meta.plan}`,V3_PURPLE,'PLAN VERSION')}${kpi('MERCADO USER',fmt(a.market),`FCST independiente ${fmt(e.ind[0].base)}`,V3_PURPLE,a.explicit?'USER INPUT':'AUTO')}${kpi('HONDA USER',fmt(a.honda),`MS ${pct(a.share)}`,COLORS.red,a.explicit?'USER INPUT':'AUTO')}${kpi('GAP MKT KI',fmt(Math.max(0,a.market-(v3actualMarketKI()+(v5dailyStats?.()?.currentMtd||0)))),'incluye Oct MTD',COLORS.amber,'TO DELIVER')}</section>
  ${card('Totales KI / OB','Carga anual simple de Mercado y Honda. El detalle mensual de PRB/1Q/2Q/3Q está debajo.',v8editorTable(),'USER INPUT · KI / OB')}
  <div class="v8-actions"><button id="v8ApplyPlan">Guardar totales</button><button id="v8ClearPlan" class="secondary">Vaciar inputs y volver a FCST</button></div>
  ${v12stageEditor(V12_STAGE)}
  ${v12revisionTable('market')}
  ${v12revisionTable('honda')}
  ${typeof v10userMonthlyTable==='function'?v10userMonthlyTable():''}
  ${card('Trayectoria plurianual','Único gráfico del Plan User: KI vigente + próximos OB contra el forecast independiente.',v8planCharts(),'USER SHEET')}
  <div class="note"><b>Separación:</b> esta hoja guarda Plan User, versiones PRB/1Q/2Q/3Q y OB. El reporte principal conserva solamente el análisis independiente; el User aparece allí únicamente como cuarto escenario resumido en el Executive Summary.</div></div>`;
}

function v12analysisForecast(){
  const actual=DATA.market_history.filter(r=>r.period>='2026-01'&&r.period<='2026-09').map(r=>({period:r.period,actual:r.value,down:null,base:null,up:null}));
  const last=actual.at(-1);if(last){last.down=last.actual;last.base=last.actual;last.up=last.actual}
  const rows=[...actual,...DATA.forecast.rows.map(r=>({period:r.period,actual:null,down:r.down,base:r.base,up:r.up}))];
  const ki=v3currentKI(),actCY=v3sum(DATA.market_history.filter(r=>r.period>='2026-01'&&r.period<='2026-09').map(r=>r.value)),cy={down:actCY,base:actCY,up:actCY};
  DATA.forecast.rows.filter(r=>r.period<='2026-12').forEach(r=>['down','base','up'].forEach(k=>cy[k]+=Number(r[k]||0)));
  return chapter('forecast','06','Forecast independiente · mensual, CY & KI','El análisis principal muestra Down / Base / Up. El detalle User vive exclusivamente en la hoja Plan User.',`<div class="grid two">${card('Actual + forecast independiente','Ene-26 → Mar-27.',lineChart(rows,[{key:'actual',name:'Actual',color:COLORS.actual},{key:'down',name:'Down',color:COLORS.down},{key:'base',name:'Base',color:COLORS.red},{key:'up',name:'Up',color:COLORS.blue}],{zero:true}),'MARKET PATH')}${card('CY 2026','Actual Jan–Sep + forecast Oct–Dic.',`<div class="scenario-strip"><span>Down <b>${fmt(cy.down)}</b></span><span>Base <b>${fmt(cy.base)}</b></span><span>Up <b>${fmt(cy.up)}</b></span></div><div class="big-number">${fmt(ki.base)}<small>KI 26/27 Base</small></div>`,'CY / KI')}</div>${card('KI 26/27 · rango independiente','User se compara en Resumen Ejecutivo y se administra en su hoja propia.',barChart([{name:'Down',value:ki.down},{name:'Base',value:ki.base},{name:'Up',value:ki.up}],{color:r=>r.name==='Down'?COLORS.down:r.name==='Up'?COLORS.blue:COLORS.red,limit:3}),'DOWN / BASE / UP')}${typeof v8fcstLongTable==='function'?v8fcstLongTable():''}`);
}
forecast=v12analysisForecast;

const V12_ANALYSIS_INDEX=[
  ['context','01','Argentina hoy'],['executive','02','Resumen ejecutivo'],['consumer','03','Consumidor & movilidad'],['market','04','Mercado + Daily'],['structure','05','Competencia + Rolling'],['forecast','06','Forecast CY / KI'],['planning','07','Honda & Commercial'],['actions','08','Noticias / rumores / reportes'],['method','09','Metodología & datos']
];
function v12nav(){
  return `<button class="v12-page-switch ${V12_PAGE==='analysis'?'active':''}" data-v12-page="analysis"><i>A</i><span>ANÁLISIS</span></button>${V12_ANALYSIS_INDEX.map(([id,n,t])=>`<button data-anchor="${id}" class="${V12_PAGE==='analysis'?'':'v12-muted'}"><i>${n}</i><span>${t}</span></button>`).join('')}<div class="v12-nav-sep"></div><button class="v12-page-switch ${V12_PAGE==='user'?'active':''}" data-v12-page="user"><i>U</i><span>PLAN USER</span></button>`;
}
nav=v12nav;

function v12analysisFull(){return `<div class="report-cover"><span>2W MARKET ANALYSIS · ARGENTINA</span><h1>Argentina Motorcycle Intelligence</h1><p>Análisis independiente: contexto → mercado → forecast → decisión. Plan User vive en una hoja aparte.</p></div>${updateBand()}${ctx()}${exec()}${consumer()}${market()}${structure()}${forecast()}${planning()}${actions()}${method()}`}
full=v12analysisFull;

const V12_BASE_BIND_SINGLE=bindSingle;
bindSingle=function(){
  V12_BASE_BIND_SINGLE();
  $$('[data-v12-page]').forEach(b=>b.onclick=()=>{v12captureMonthlyInputs();V12_PAGE=b.dataset.v12Page;render();window.scrollTo({top:0,behavior:'smooth'})});
  $$('[data-v12-stage]').forEach(b=>b.onclick=()=>{v12captureMonthlyInputs();V12_STAGE=b.dataset.v12Stage;render()});
  const save=$('#v12SaveMonthly');if(save)save.onclick=v12saveAndSync;
};

render=function(){
  if(!DATA)return;syncUserScenario();
  const filters=document.querySelector('.filters');if(filters)filters.style.display=V12_PAGE==='user'?'none':'';
  const crumb=document.querySelector('.breadcrumbs span');if(crumb)crumb.textContent=V12_PAGE==='user'?'2W MARKET ANALYSIS · PLAN USER':'2W MARKET ANALYSIS · INDEPENDENT ANALYSIS';
  $('#viewTitle').textContent=V12_PAGE==='user'?'Plan User · Budget / FCST versions':'Reporte integral';
  $('#navigation').innerHTML=v12nav();
  $('#content').innerHTML=V12_PAGE==='user'?v12userSheet():v12analysisFull();
  bindSingle();bindChartTips();if(V12_PAGE==='analysis')observe();else if(robs)robs.disconnect();
  $('#sidebar')?.classList.remove('open');
};

(function v12boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof V8_PLAN_MATRIX!=='undefined'&&typeof V3_DAILY!=='undefined'){render()}else setTimeout(ready,100)};ready()})();
