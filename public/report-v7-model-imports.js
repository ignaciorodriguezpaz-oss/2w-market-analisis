/* 2W Market Analysis v7 — source forecast methodology + imports as supply intelligence */
const V7_VERSION='20261007-model-imports';
let V7_MODEL=null;
const V7_BASE_STRUCTURE=structure;
const V7_BASE_FORECAST=forecast;
const V7_BASE_SYNC=syncUserScenario;

function v7sum(rows,key='value'){return (rows||[]).reduce((a,r)=>a+(Number(r?.[key])||0),0)}
function v7avg(a){return a?.length?v7sum(a.map(value=>({value})))/a.length:0}
function v7model(){return V7_MODEL||{}}
function v7calibrationTone(){const c=v7model().calibration||{};return Math.abs((c.live_workbook_multiplier||0)-(c.dedicated_calibration_sheet_multiplier||0))>.0001?'amber':'green'}

/* The user's KI target is reverse-calculated with the source workbook's KI profile.
   Closed actual months stay locked; only Oct-Mar are distributed. */
syncUserScenario=function(){
  if(!DATA)return;
  const weights=v7model().seasonality?.remaining_ki_26_27_weights;
  if(!weights){V7_BASE_SYNC();return;}
  const actualM=v3actualMarketKI(),remainM=Math.max(0,Number(V3_PLAN.marketKI||0)-actualM),rows=DATA.forecast.rows||[];
  const raw=rows.map(r=>({r,w:Number(weights[r.period])||0})),ws=v7sum(raw,'w');
  if(ws>0){
    let used=0;
    raw.forEach((x,i)=>{const exact=remainM*x.w/ws;x.r.user=i===raw.length-1?Math.max(0,Math.round(remainM-used)):Math.max(0,Math.floor(exact));used+=Number(x.r.user)||0});
  }else v3applyExact(rows,'user',remainM,'base');
  rows.forEach(r=>r.expected=scenarioExpected(r));
  (DATA.forecast.segments||[]).forEach((r,i)=>{const total=rows[i]?.user||r.total.base,alloc=applyLargestRemainder(r.segments,total);r.total.user=total;r.total.expected=scenarioExpected(r.total);r.segments.forEach(s=>{s.user=alloc[s.name];s.expected=scenarioExpected(s)})});
  const hf=DATA.honda?.forecast||[],actualH=v3actualHondaKI(),remainH=Math.max(0,Number(V3_PLAN.hondaKI||0)-actualH);
  v3applyExact(hf,'user',remainH,'base');hf.forEach(r=>r.expected=scenarioExpected(r));
};

function v7importRows(){
  const im=DATA.imports||{},hist=DATA.market_history||[];
  return (im.monthly||[]).map(x=>{const m=hist.find(r=>r.period===x.period);return {period:x.period,imports:Number(x.value)||0,registrations:Number(m?.value)||0}});
}
function v7importSignal(){
  const rows=v7importRows(),last=rows.at(-1),prev=rows.at(-2),prior=rows.slice(0,-1),avg=v7avg(prior.map(x=>x.imports));
  const reference=v7model().imports_reference||{};
  return {rows,last,prev,avg,mom:prev?.imports?last.imports/prev.imports-1:null,vsAvg:avg?last.imports/avg-1:null,aprJulYoY:reference.presentation_apr_jul_yoy};
}
function v7importsBlock(){
  const im=DATA.imports||{},s=v7importSignal(),honda=(im.top_brands||[]).find(x=>x.name==='HONDA'),china=(im.origins||[]).find(x=>x.name==='China'),total=v7sum(im.monthly||[]),regTotal=v7sum(s.rows.filter(x=>x.registrations>0),'registrations'),coverage=regTotal?total/regTotal:null;
  const signals=(im.new_model_signals||[]).slice(0,10);
  return `<section class="card v7-imports"><div class="card-head"><div><span class="eyebrow">SUPPLY INTELLIGENCE · IMPORTACIONES</span><h2>Importaciones incorporadas al análisis</h2><p>Se usan como señal adelantada de oferta, modelos y presión competitiva. Nunca se suman a patentamientos.</p></div>${badge(`CORTE ${im.cutoff||'—'}`,'amber')}</div>
  <section class="kpis">${kpi('IMPORTS JAN–JUL',fmt(total),'unidades declaradas',COLORS.blue,'FACT')}${kpi('JUL IMPORTS',s.last?fmt(s.last.imports):'—',s.mom!==null?`${pct(s.mom)} vs Jun`:'',COLORS.green,'FACT')}${kpi('HONDA IMPORTS',fmt(honda?.value||0),'Jan–Jul',COLORS.red,'FACT')}${kpi('CHINA ORIGIN',fmt(china?.value||0),'principal origen',COLORS.amber,'FACT')}${kpi('IMPORT/REG PROXY',coverage!==null?pct(coverage):'—','no es conversión 1:1',COLORS.actual,'SUPPLY PROXY')}</section>
  <div class="grid two">${card('Importaciones vs patentamientos','Misma escala mensual para leer pipeline; la diferencia temporal refleja inventario/ensamble/venta.',lineChart(s.rows,[{key:'imports',name:'Importaciones',color:COLORS.blue},{key:'registrations',name:'Patentamientos',color:COLORS.red}],{zero:true}),'JAN–JUL 2026')}${card('Lectura de supply','Las importaciones no reemplazan el forecast de demanda.',`<div class="v7-supply-read"><div>${badge(s.vsAvg>=0?'PIPELINE ALTO':'PIPELINE BAJO',s.vsAvg>=0?'green':'amber')}<b>Julio vs promedio Jan–Jun</b><strong>${s.vsAvg!==null?pct(s.vsAvg):'—'}</strong><p>El repunte de julio mejora la capacidad de abastecimiento, pero no implica por sí solo patentamientos futuros.</p></div><div>${badge('HISTÓRICO PRESENTACIÓN','amber')}<b>Abr–Jul vs año anterior</b><strong>${s.aprJulYoY!==undefined?pct(s.aprJulYoY):'—'}</strong><p>La presentación usaba esta caída como argumento conservador. En el live model se mantiene como referencia histórica, no como ajuste automático.</p></div></div>`,'FORECAST DRIVER')}</div>
  <div class="grid two">${card('Top marcas importadas','Volumen acumulado del archivo de importaciones.',barChart((im.top_brands||[]).slice(0,10),{limit:10,color:r=>r.name==='HONDA'?COLORS.red:COLORS.blue}),'BRANDS')}${card('Top modelos importados','Detecta presión de inventario y posibles amenazas antes del patentamiento.',barChart((im.top_models||[]).slice(0,12),{limit:12,color:r=>String(r.name).startsWith('HONDA')?COLORS.red:COLORS.actual}),'MODELS')}</div>
  ${card('Señales de modelos / amenazas','Importación relevante con baja presencia relativa en el cierre actual.',`<div class="intel-list">${signals.map(x=>`<div>${badge('EARLY SIGNAL','amber')}<b>${x.name}</b><span>${fmt(x.units||0)} uds · ${x.signal||''}</span></div>`).join('')}</div>`,'MODEL WATCH')}
  <div class="v7-driver-rule"><b>Regla para el forecast:</b><span>Imports ↑ + registros acompañando con rezago + stock sano = confirma capacidad de Upside. Imports ↓ sostenidas + faltantes/stock bajo = refuerza Downside. Imports solas nunca cambian Base.</span></div></section>`;
}

function v7engineBlock(){
  const m=v7model(),r=m.regression||{},cal=m.calibration||{},sea=m.seasonality||{},rev=m.reverse_calculator||{},aff=m.affordability||{},sat=m.saturation||{},ref=m.reference_ki||{},live=v3currentKI?.();
  const calGap=(Number(cal.dedicated_calibration_sheet_multiplier)||0)-(Number(cal.live_workbook_multiplier)||0);
  const profile=(sea.months||[]).map((month,i)=>({name:month,value:Number(sea.final_profile?.[i])||0}));
  return `<section class="card v7-model"><div class="card-head"><div><span class="eyebrow">SOURCE MODEL · ${m.meta?.source_workbook||'FORECAST WORKBOOK'}</span><h2>Motor del forecast: teoría, controles y reversión</h2><p>La metodología original queda visible y auditable; el live model conserva actuals nuevos y separa demanda, supply y controles estructurales.</p></div>${badge('REFERENCE MODEL','green')}</div>
  <div class="v7-engine-flow"><div><i>01</i><b>Macro T-3</b><span>Salary · FX · Rate</span></div><div><i>02</i><b>Regression</b><span>Base mensual</span></div><div><i>03</i><b>Error</b><span>± ${fmt(r.standard_error||0)}</span></div><div><i>04</i><b>Momentum</b><span>3 paths</span></div><div><i>05</i><b>Average</b><span>6 escenarios</span></div><div><i>06</i><b>Calibration</b><span>Bias</span></div><div><i>07</i><b>Seasonality</b><span>KI Apr–Mar</span></div><div><i>08</i><b>Affordability</b><span>T-3</span></div><div><i>09</i><b>Event / PR</b><span>Guardrails</span></div></div>
  <section class="kpis">${kpi('R²',pct(r.r2),`${r.observations||0} observaciones`,COLORS.green,'BACKTEST')}${kpi('STD ERROR',fmt(r.standard_error),'regresión mensual',COLORS.amber,'MODEL')}${kpi('NEW MAPE',pct(m.validation?.new_mape),`N-5 ${pct(m.validation?.n5_mape)}`,COLORS.blue,'BACKTEST')}${kpi('WORKBOOK KI 26/27',fmt(ref['2026/27']||0),live?`Live Base ${fmt(live.base)}`:'referencia',COLORS.red,'REFERENCE')}${kpi('PR',sat.selected_pr||'—','escenario estructural',COLORS.actual,'CONTROL')}</section>
  <div class="grid two">${card('Ecuación macro','Regresión del workbook.',`<div class="v7-equation">${r.equation||'—'}</div><div class="v7-mini"><span>Salary <b>${Number(r.salary_coef||0).toFixed(2)}</b></span><span>FX <b>${Number(r.fx_coef||0).toFixed(2)}</b></span><span>Rate <b>${Number(r.rate_coef||0).toFixed(0)}</b></span><span>Lag <b>T-${r.lag_months||0}</b></span></div>`,'REGRESSION')}${card('Control de calibración','El archivo tiene dos multiplicadores distintos y se preservan ambos.',`<div class="v7-calibration">${badge(cal.status||'CHECK',v7calibrationTone())}<div><span>Usado por FCST COMPLETE</span><b>${Number(cal.live_workbook_multiplier||0).toFixed(6)}</b></div><div><span>Hoja CALIBRATION</span><b>${Number(cal.dedicated_calibration_sheet_multiplier||0).toFixed(6)}</b></div><small>Gap ${(calGap*100).toFixed(3)} pp de multiplicador. No se corrige silenciosamente.</small></div>`,'MODEL CONTROL')}</div>
  <div class="grid two">${card('KI seasonality','Perfil normalizado; cambia la forma mensual pero no el total KI.',barChart(profile,{limit:12,color:COLORS.blue}),'APR–MAR')}${card('Reverse calculator','El escenario Usuario ahora usa la lógica de reversión del Excel.',`<div class="v7-reverse"><p><b>Target KI → Actual cerrado bloqueado → saldo Oct–Mar → perfil estacional.</b></p><div><span>Conservative</span><b>× ${rev.conservative_factor||.9}</b></div><div><span>Upside</span><b>× ${rev.upside_factor||1.1}</b></div><div><span>Affordability weight</span><b>${pct(aff.weight)}</b></div><div><span>UIO mortality</span><b>${pct(sat.cohort_mortality)} / ${sat.mortality_step_months}m</b></div></div>`,'REVERSION')}</div>
  <div class="v7-driver-rule"><b>Separación de roles:</b><span>calibración corrige bias; seasonality distribuye; affordability modera demanda; importaciones miden supply; eventos alteran timing; PR/UIO limita expansión estructural. Ninguna capa debe duplicar el efecto de otra.</span></div></section>`;
}

structure=function(){return `${V7_BASE_STRUCTURE()}${v7importsBlock()}`};
forecast=function(){return `${V7_BASE_FORECAST()}${v7engineBlock()}`};

fetch(`/data/forecast-reference.json?v=${V7_VERSION}`,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(x=>{if(!x)return;V7_MODEL=x;const ready=()=>{if(typeof DATA!=='undefined'&&DATA){syncUserScenario();render()}else setTimeout(ready,100)};ready()}).catch(console.error);
