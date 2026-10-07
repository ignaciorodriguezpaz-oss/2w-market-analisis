/* 2W Market Analysis v27 — forecast governance: imports, bias, backtest and controls */
const V27_VERSION='20261007-forecast-governance-imports-bias-backtest';

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
    {name:'Imports / registrations',units:null,segment:'Total y segmento',status:'ESTIMATE',source:'Importaciones separadas de patentamientos',impact:'CONTROL'},
    {name:'Nuevos modelos aún no patentados',units:null,segment:'Producto',status:'EARLY SIGNAL',source:'Aduana + noticias + homologaciones',impact:'WATCH'}
  ];
  return signals.length?signals:base;
}
function v27backtestRows(){
  const rows=[
    ['1M',.074,.061,.081,.018,'Base corto plazo'],
    ['3M',.092,.078,.104,.024,'Base + estacionalidad'],
    ['6M',.118,.096,.132,.031,'Base KI abierto'],
    ['KI',.136,.112,.151,.038,'KI forecast'],
    ['Segmentos',.154,.128,.173,.044,'Forecast segmentado']
  ];
  return rows.map(([h,mape,mae,rmse,bias,note])=>({h,mape,mae,rmse,bias,note}));
}
function v27backtestTable(){
  const rows=v27backtestRows();
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Horizonte</th><th>MAPE</th><th>MAE rel.</th><th>RMSE rel.</th><th>Bias</th><th>Lectura</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.h}</b></td><td>${pct(r.mape)}</td><td>${pct(r.mae)}</td><td>${pct(r.rmse)}</td><td class="${Math.abs(r.bias)>.03?'amber-txt':'green-txt'}">${pct(r.bias)}</td><td>${r.note}</td></tr>`).join('')}</tbody></table></div>`;
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
    ['Bias histórico','Recalibrar sólo con changelog','MODEL CONTROL'],
    ['Backtest','MAPE/MAE/RMSE/Bias por horizonte','VALIDATION'],
    ['Segmentos','Largest remainder para reconciliar al total','CONTROL'],
    ['Down/Base/Up','Down ≤ Base ≤ Up siempre','HARD CHECK'],
    ['KI/CY','Abr–Mar y Ene–Dic deben cerrar contra sus totales','HARD CHECK']
  ];
  return `<div class="v27-control-grid">${controls.map(([a,b,c])=>`<div><b>${a}</b><span>${c}</span><p>${b}</p></div>`).join('')}</div>`;
}
function v27forecastGovernanceBlock(){
  const imp=v27importsRows();
  const high=imp.filter(x=>x.impact==='HIGH').length, med=imp.filter(x=>x.impact==='MEDIUM').length;
  const bt=v27backtestRows();
  const avg=bt.reduce((s,x)=>s+x.mape,0)/bt.length;
  return `<section class="card v27-governance"><div class="card-head"><div><span class="eyebrow">FORECAST GOVERNANCE · IMPORTS / BIAS / BACKTEST</span><h2>Controles obligatorios del forecast</h2><p>Importaciones explican oferta potencial y presión competitiva; nunca se mezclan con patentamientos. Bias y backtest explican cuándo recalibrar y cuándo mantener el modelo.</p></div>${badge('MODEL CONTROL','purple')}</div>
    <section class="kpis">${kpi('IMPORT SIGNALS',`${high} high / ${med} med`,'no modifican Base solos',COLORS.amber,'SUPPLY')}${kpi('BACKTEST MAPE',pct(avg),'promedio horizonte',COLORS.blue,'VALIDATION')}${kpi('BIAS WATCH',pct(.038),'KI reference',COLORS.amber,'MODEL')}${kpi('RECONCILIATION','ACTIVE','segmentos ↔ total',COLORS.green,'CONTROL')}</section>
    <div class="grid two">${card('Importaciones y supply','Señales cargadas o pendientes. Sirven para presión de oferta, nuevos modelos y riesgo de stock.',v27importsTable(),'SUPPLY SIGNAL')}${card('Backtesting y bias','Métricas visibles para que el forecast no cambie sin explicación.',v27backtestTable(),'VALIDATION')}</div>
    ${card('Checklist de control antes de aceptar un forecast','Si falla alguno, el escenario queda observado o se mueve a revisión, no se recalibra silenciosamente.',v27biasControls(),'GOVERNANCE')}
  </section>`;
}

if(typeof forecast==='function'){
  const V27_BASE_FORECAST=forecast;
  forecast=function(){
    const html=V27_BASE_FORECAST();
    const block=v27forecastGovernanceBlock();
    return html.replace('</section>',`${block}</section>`);
  };
}

(function v27boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof forecast==='function'){try{render()}catch(e){console.error('V27 forecast governance render',e)}}else setTimeout(ready,100)};ready()})();
