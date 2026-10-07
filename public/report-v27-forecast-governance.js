/* 2W Market Analysis v27F — forecast governance: imports, bias, backtest and controls */
const V27F_VERSION='20261007-forecast-governance-imports-bias-backtest-v2';

function v27importsRows(){
  const signals=(DATA.imports?.new_model_signals||[]).map(x=>({
    name:x.name||x.model||'Modelo detectado',
    units:Number(x.units)||0,
    segment:x.segment||x.mtp||'PENDING',
    status:x.status||'EARLY SIGNAL',
    source:x.source||DATA.imports?.source||'Importaciones / archivo cargado',
    impact:x.units>=500?'HIGH':x.units>=100?'MEDIUM':'LOW'
  }));
  const base=[
    {name:'Supply coverage',units:null,segment:'Mercado total',status:'PENDING · USER INPUT',source:'Stock terminal / dealer no cargado',impact:'CONTROL'},
    {name:'Imports / registrations',units:null,segment:'Total y segmento',status:'PENDING · requiere serie alineada',source:'Importaciones separadas de patentamientos',impact:'CONTROL'},
    {name:'Nuevos modelos aún no patentados',units:null,segment:'Producto',status:'EARLY SIGNAL',source:'Aduana + noticias + homologaciones',impact:'WATCH'}
  ];
  return signals.length?signals:base;
}
function v27backtestSource(){
  const src=DATA?.validation?.backtest||DATA?.forecast?.backtest||DATA?.backtest||null;
  return Array.isArray(src)?src:[];
}
function v27backtestRows(){
  const raw=v27backtestSource();
  if(raw.length){
    return raw.map(r=>({
      h:r.h||r.horizon||r.period||'—',
      mape:Number.isFinite(Number(r.mape))?Number(r.mape):null,
      mae:Number.isFinite(Number(r.mae_rel??r.mae))?Number(r.mae_rel??r.mae):null,
      rmse:Number.isFinite(Number(r.rmse_rel??r.rmse))?Number(r.rmse_rel??r.rmse):null,
      bias:Number.isFinite(Number(r.bias))?Number(r.bias):null,
      note:r.note||r.status||'OBSERVED BACKTEST'
    }));
  }
  return ['1M','3M','6M','KI','Segmentos'].map(h=>({h,mape:null,mae:null,rmse:null,bias:null,note:'PENDING · falta historial de versiones forecast vs actual'}));
}
function v27metric(v){return Number.isFinite(Number(v))?pct(Number(v)):'PENDING'}
function v27backtestTable(){
  const rows=v27backtestRows();
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Horizonte</th><th>MAPE</th><th>MAE rel.</th><th>RMSE rel.</th><th>Bias</th><th>Lectura</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.h}</b></td><td>${v27metric(r.mape)}</td><td>${v27metric(r.mae)}</td><td>${v27metric(r.rmse)}</td><td class="${Number.isFinite(r.bias)?(Math.abs(r.bias)>.03?'amber-txt':'green-txt'):''}">${v27metric(r.bias)}</td><td>${r.note}</td></tr>`).join('')}</tbody></table></div>`;
}
function v27importsTable(){
  const rows=v27importsRows();
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Señal</th><th>Unidades</th><th>Segmento</th><th>Estado</th><th>Impacto</th><th>Fuente</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.name}</b></td><td>${r.units==null?'—':fmt(r.units)}</td><td>${r.segment}</td><td>${r.status}</td><td>${r.impact}</td><td>${r.source}</td></tr>`).join('')}</tbody></table></div>`;
}
function v27biasControls(){
  const controls=[
    ['CAFAM vs Pivot','Mostrar diferencia; no corregir silenciosamente','FACT / CONTROL'],
    ['SIOMAA daily','Usar para MTD, mismo estadio y pace','FACT si archivo vigente'],
    ['Importaciones','Supply signal separado; no sumar a patentamientos','EARLY SIGNAL / USER INPUT'],
    ['Bias histórico','Calcular sólo contra versiones guardadas del forecast; recalibrar con changelog','MODEL CONTROL'],
    ['Backtest','MAPE/MAE/RMSE/Bias reales por horizonte; nunca valores de referencia inventados','VALIDATION'],
    ['Segmentos','Largest remainder para reconciliar al total','CONTROL'],
    ['Down/Base/Up','Down ≤ Base ≤ Up siempre','HARD CHECK'],
    ['KI/CY','Abr–Mar y Ene–Dic deben cerrar contra sus totales','HARD CHECK']
  ];
  return `<div class="v27-control-grid">${controls.map(([a,b,c])=>`<div><b>${a}</b><span>${c}</span><p>${b}</p></div>`).join('')}</div>`;
}
function v27forecastGovernanceBlock(){
  const imp=v27importsRows();
  const high=imp.filter(x=>x.impact==='HIGH').length, med=imp.filter(x=>x.impact==='MEDIUM').length;
  const bt=v27backtestRows().filter(x=>Number.isFinite(x.mape));
  const avg=bt.length?bt.reduce((s,x)=>s+x.mape,0)/bt.length:null;
  const biasRaw=DATA?.validation?.bias??DATA?.forecast?.bias??null;
  const bias=Number.isFinite(Number(biasRaw))?Number(biasRaw):null;
  return `<section class="card v27-governance"><div class="card-head"><div><span class="eyebrow">FORECAST GOVERNANCE · IMPORTS / BIAS / BACKTEST</span><h2>Controles obligatorios del forecast</h2><p>Importaciones explican oferta potencial y presión competitiva; nunca se mezclan con patentamientos. Bias y backtest sólo se publican cuando provienen de versiones históricas observables.</p></div>${badge('MODEL CONTROL','purple')}</div>
    <section class="kpis">${kpi('IMPORT SIGNALS',`${high} high / ${med} med`,'no modifican Base solos',COLORS.amber,'SUPPLY')}${kpi('BACKTEST MAPE',avg===null?'PENDING':pct(avg),avg===null?'falta history forecast vs actual':'promedio observado',COLORS.blue,'VALIDATION')}${kpi('BIAS WATCH',bias===null?'PENDING':pct(bias),bias===null?'sin serie histórica suficiente':'bias observado',COLORS.amber,'MODEL')}${kpi('RECONCILIATION','ACTIVE','segmentos ↔ total',COLORS.green,'CONTROL')}</section>
    <div class="grid two">${card('Importaciones y supply','Señales cargadas o pendientes. Sirven para presión de oferta, nuevos modelos y riesgo de stock.',v27importsTable(),'SUPPLY SIGNAL')}${card('Backtesting y bias','Si todavía no existe historial suficiente, la métrica queda PENDING en vez de inventar precisión.',v27backtestTable(),'VALIDATION')}</div>
    ${card('Checklist de control antes de aceptar un forecast','Si falla alguno, el escenario queda observado o se mueve a revisión, no se recalibra silenciosamente.',v27biasControls(),'GOVERNANCE')}
  </section>`;
}

if(typeof forecast==='function'){
  const V27F_BASE_FORECAST=forecast;
  forecast=function(){
    const html=V27F_BASE_FORECAST();
    const block=v27forecastGovernanceBlock();
    return html.replace('</section>',`${block}</section>`);
  };
}

(function v27fboot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof forecast==='function'){try{render()}catch(e){console.error('V27F forecast governance render',e)}}else setTimeout(ready,100)};ready()})();
