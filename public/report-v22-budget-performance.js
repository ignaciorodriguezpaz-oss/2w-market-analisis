/* 2W Market Analysis v22 — monthly budget performance vs actual inside Plan User */
const V22_VERSION='20261007-budget-performance';
const V22_BASE_USER_SHEET=v12userSheet;

function v22stageSeries(field){
  return Object.fromEntries(V8_STAGE_KEYS.map(s=>[s,v12monthlyEffective(s,field)]));
}
function v22actualValue(field,p){return Number(v12actual(field,p))||null}
function v22performance(field,stage){
  const start=V12_STAGE_PLAN_START[stage],series=v12monthlyEffective(stage,field);
  const periods=V12_PERIODS.filter(p=>p>=start&&v22actualValue(field,p));
  if(!periods.length)return {stage,n:0};
  const actual=periods.reduce((s,p)=>s+v22actualValue(field,p),0);
  const plan=periods.reduce((s,p)=>s+(Number(series[p]?.value)||0),0);
  const mape=periods.reduce((s,p)=>s+Math.abs((Number(series[p]?.value)||0)/v22actualValue(field,p)-1),0)/periods.length;
  return {stage,n:periods.length,actual,plan,bias:actual?plan/actual-1:null,mape};
}
function v22revisionRows(field){
  const series=v22stageSeries(field);
  return V12_PERIODS.map(p=>({
    period:p,
    actual:v22actualValue(field,p),
    prb:Number(series.PRB?.[p]?.value)||null,
    q1:Number(series['1QFCST']?.[p]?.value)||null,
    q2:Number(series['2QFCST']?.[p]?.value)||null,
    q3:Number(series['3QFCST']?.[p]?.value)||null
  }));
}
function v22performanceTable(field){
  const rows=V8_STAGE_KEYS.map(s=>v22performance(field,s));
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Revisión</th><th>Meses evaluados</th><th>Plan comparable</th><th>Real comparable</th><th>Bias</th><th>MAPE</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${V8_STAGE_LABELS[r.stage]}</b></td>${r.n?`<td>${r.n}</td><td>${fmt(r.plan)}</td><td>${fmt(r.actual)}</td><td>${pct(r.bias)}</td><td>${pct(r.mape)}</td>`:`<td colspan="5">PENDING · todavía no hay meses reales posteriores a esta revisión</td>`}</tr>`).join('')}</tbody></table></div>`;
}
function v22budgetPerformanceBlock(){
  const market=v22revisionRows('market'),honda=v22revisionRows('honda');
  const mNow=V8_STAGE_KEYS.map(s=>v22performance('market',s)).filter(x=>x.n).at(-1);
  const hNow=V8_STAGE_KEYS.map(s=>v22performance('honda',s)).filter(x=>x.n).at(-1);
  return `<section class="card v22-budget-performance"><div class="card-head"><div><span class="eyebrow">BUDGET PERFORMANCE · PLAN vs REAL</span><h2>Cómo rindió cada presupuesto</h2><p>Cada línea conserva la versión PRB / 1Q / 2Q / 3Q. El Real se superpone mes a mes; cuando cambia la revisión se ve el salto del nuevo presupuesto y cómo quedó contra el resultado.</p></div>${badge('MONTHLY TRACKING','green')}</div>
  <section class="kpis">${kpi('ÚLTIMA REVISIÓN EVALUABLE',mNow?V8_STAGE_LABELS[mNow.stage]:'PENDING',mNow?`${mNow.n} meses con real`:'sin meses posteriores',V3_PURPLE,'BUDGET')}${kpi('ERROR MKT',mNow?pct(mNow.bias):'—',mNow?`MAPE ${pct(mNow.mape)}`:'',COLORS.amber,'PLAN vs REAL')}${kpi('ERROR HONDA',hNow?pct(hNow.bias):'—',hNow?`MAPE ${pct(hNow.mape)}`:'',COLORS.red,'PLAN vs REAL')}</section>
  <div class="grid two">${card('Mercado · presupuestos vs Real','Abr–Mar. Las revisiones posteriores incorporan resultados cerrados y recalculan el tramo todavía abierto.',lineChart(market,[{key:'actual',name:'Real',color:COLORS.actual},{key:'prb',name:'PRB',color:COLORS.previous},{key:'q1',name:'1Q FCST',color:COLORS.blue},{key:'q2',name:'2Q FCST',color:V3_PURPLE},{key:'q3',name:'3Q FCST',color:COLORS.amber}],{zero:true}),'PLAN / ACTUAL')}${card('Honda · presupuestos vs Real','Misma lectura para volumen Honda.',lineChart(honda,[{key:'actual',name:'Real Honda',color:COLORS.red},{key:'prb',name:'PRB',color:COLORS.previous},{key:'q1',name:'1Q FCST',color:COLORS.blue},{key:'q2',name:'2Q FCST',color:V3_PURPLE},{key:'q3',name:'3Q FCST',color:COLORS.amber}],{zero:true}),'PLAN / ACTUAL')}</div>
  <div class="grid two">${card('Performance Mercado','El error se mide sólo en meses que eran futuros al momento de emitir esa revisión.',v22performanceTable('market'),'BUDGET ACCURACY')}${card('Performance Honda','No se evalúan como forecast los meses que ya eran Result dentro de la revisión.',v22performanceTable('honda'),'BUDGET ACCURACY')}</div>
  <div class="note"><b>Lectura:</b> PRB se evalúa contra los reales desde abril; 1Q FCST contra los reales desde julio; 2Q FCST empezará a acumular error cuando cierre octubre; 3Q FCST desde enero. Así no mezclamos un Result conocido con la precisión del presupuesto.</div></section>`;
}

v12userSheet=function(){
  const html=V22_BASE_USER_SHEET();
  const marker='<div class="note"><b>Separación:</b>';
  return html.includes(marker)?html.replace(marker,`${v22budgetPerformanceBlock()}${marker}`):`${html}${v22budgetPerformanceBlock()}`;
};

(function v22boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof v12monthlyEffective==='function'){render()}else setTimeout(ready,100)};ready()})();
