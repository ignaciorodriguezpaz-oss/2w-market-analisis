/* 2W Market Analysis v11 — model vs competition, price evolution, volume/share forecast and elasticity */
const V11_VERSION='20261007-product-elasticity';
let V11_PRODUCT=null;
let V11_SELECTED=(()=>{try{return localStorage.getItem('2w.productModel')||'HONDA WAVE 110'}catch{return 'HONDA WAVE 110'}})();
let V11_PRICE_DELTA=(()=>{try{return Number(localStorage.getItem('2w.priceDelta')||0)}catch{return 0}})();

function v11save(){try{localStorage.setItem('2w.productModel',V11_SELECTED);localStorage.setItem('2w.priceDelta',String(V11_PRICE_DELTA))}catch{}}
function v11data(name){return V11_PRODUCT?.models?.[name]||null}
function v11modelNames(){
  if(typeof v7filteredModels==='function'){
    const filtered=v7filteredModels().map(x=>x.name);
    if(filtered.length)return filtered;
  }
  return typeof v3names==='function'?(v3names('model')||[]):Object.keys(V11_PRODUCT?.models||{});
}
function v11ensureSelected(){const names=v11modelNames();if(!names.includes(V11_SELECTED))V11_SELECTED=names[0]||'HONDA WAVE 110';return names}
function v11metric(name){try{return typeof v3entityMetrics==='function'?v3entityMetrics('model',name):null}catch{return null}}
function v11money(v){return Number.isFinite(Number(v))?money(v):'PENDING'}
function v11confTone(c){return c==='HIGH'?'green':c==='MEDIUM'?'amber':c==='LOW'?'red':'amber'}
function v11periodPriceRows(d){return (d?.price_series||[]).map(x=>({period:x[0],price:x[1]}))}
function v11currentShare(name){const m=v11metric(name),d=v11data(name);return Number.isFinite(m?.share)?m.share:Number(d?.market_share)||0}
function v11peerRows(name){
  const d=v11data(name);if(!d)return [];
  return [name,...(d.competitors||[])].map(n=>{const p=v11data(n);const m=v11metric(n);return {name:n,brand:p?.brand||n.split(' ')[0],price:p?.latest_price??null,cc:p?.cc??null,origin:p?.origin||'—',group:p?.group||'—',volume:Number.isFinite(m?.current)?m.current:(p?.current_volume||0),share:Number.isFinite(m?.share)?m.share:(p?.market_share||0),segmentShare:p?.segment_share??null,priceIndex:p?.price_index_segment??null,priceYoy:p?.price_yoy??null,elasticity:p?.elasticity??null,confidence:p?.elasticity_confidence||'PENDING'} } );
}
function v11forecastRows(name){
  const m=v11metric(name);if(!m?.f?.length)return [];
  const hist=(typeof v3hist==='function'?v3hist('model'):[]).slice(-12).map(r=>{const total=typeof v6pivotTotal==='function'?v6pivotTotal(r.period):0;const v=Number(r[name])||0;return {period:r.period,actual:v,down:null,base:null,up:null,shareActual:total?v/total:null,shareForecast:null}});
  const last=hist.at(-1);const future=m.f.map(x=>({period:x.period,actual:null,down:x.down,base:x.base,up:x.up,shareActual:null,shareForecast:x.share}));
  return last?[...hist,{...last,down:last.actual,base:last.actual,up:last.actual,shareForecast:last.shareActual},...future]:future;
}
function v11priceSimulator(d){
  const beta=Number(d?.elasticity),delta=Number(V11_PRICE_DELTA)/100,valid=Number.isFinite(beta)&&beta<0&&delta>-0.95;
  const impact=valid?Math.exp(beta*Math.log(1+delta))-1:null;
  const newShare=valid&&Number.isFinite(Number(d.segment_share))?Number(d.segment_share)*(1+impact):null;
  const newVol=valid&&Number.isFinite(Number(d.current_volume))?Math.max(0,Math.round(Number(d.current_volume)*(1+impact))):null;
  const reason=!Number.isFinite(beta)?'No hay observaciones suficientes para estimar elasticidad.':beta>=0?'El signo observado es positivo: la relación está dominada por otros factores y no se usa como causalidad de precio.':d.elasticity_confidence==='LOW'?'La señal es débil; usar sólo como sensibilidad exploratoria.':'Sensibilidad indicativa, manteniendo constantes mercado, producto, financiación y supply.';
  return `<div class="v11-sim"><div class="v11-sim-head"><div><span class="eyebrow">PRICE SENSITIVITY</span><h3>Simulador de precio</h3></div><label><span>Δ PRECIO</span><input id="v11PriceDelta" type="number" min="-30" max="30" step="1" value="${V11_PRICE_DELTA}"><b>%</b></label></div><div class="v11-sim-grid"><div><span>Elasticidad observada</span><b>${Number.isFinite(beta)?beta.toFixed(2):'PENDING'}</b></div><div><span>Impacto indicativo share</span><b>${impact!==null?pct(impact):'—'}</b></div><div><span>Share segmento resultante</span><b>${newShare!==null?pct(newShare):'—'}</b></div><div><span>Volumen equivalente</span><b>${newVol!==null?fmt(newVol):'—'}</b></div></div><p>${reason}</p></div>`;
}
function v11comparisonTable(name){
  const rows=v11peerRows(name);if(!rows.length)return `<div class="empty">Sin ficha de precio comparable para este modelo.</div>`;
  return `<div class="table-wrap"><table class="table v11-compare"><thead><tr><th>Modelo</th><th>Precio</th><th>Price index</th><th>Volumen</th><th>MS mercado</th><th>MS segmento</th><th>CC</th><th>Origen</th><th>Grupo</th><th>Precio YoY</th><th>Elasticidad</th></tr></thead><tbody>${rows.map((r,i)=>`<tr class="${i===0?'v11-selected-row':''}"><td><strong>${r.name}</strong>${i===0?' '+badge('SELECTED','green'):''}</td><td>${v11money(r.price)}</td><td>${r.priceIndex!==null?(r.priceIndex*100).toFixed(0)+'%':'—'}</td><td>${fmt(r.volume)}</td><td>${pct(r.share)}</td><td>${r.segmentShare!==null?pct(r.segmentShare):'—'}</td><td>${safe(r.cc)}</td><td>${safe(r.origin)}</td><td>${safe(r.group)}</td><td>${r.priceYoy!==null?pct(r.priceYoy):'—'}</td><td>${r.elasticity!==null?`${Number(r.elasticity).toFixed(2)} ${badge(r.confidence,v11confTone(r.confidence))}`:'PENDING'}</td></tr>`).join('')}</tbody></table></div>`;
}
function v11ProductBlock(){
  const names=v11ensureSelected(),d=v11data(V11_SELECTED),m=v11metric(V11_SELECTED),fc=v11forecastRows(V11_SELECTED);
  const opts=names.map(n=>`<option value="${n}" ${n===V11_SELECTED?'selected':''}>${n}</option>`).join('');
  const priceRows=v11periodPriceRows(d);
  const forecastReady=fc.length>0;
  const kiBase=Number(m?.kiBase)||null;
  const latestFc=m?.f?.at(-1);
  const priceStatus=d?'FACT / ESTIMATE':'PENDING';
  const desc=d?`${d.brand} · ${d.group} · ${d.honda_planning||d.segment} · ${d.cc||'—'} cc · ${d.origin||'—'}`:'Modelo con forecast estructural disponible; Price Evolution todavía no empata este nombre.';
  return `<section class="card v11-product"><div class="card-head"><div><span class="eyebrow">MODEL INTELLIGENCE · PRICE EVOLUTION + PIVOT</span><h2>Ficha vs competencia · Forecast volumen & share</h2><p>Seleccioná un modelo. La ficha integra precio, posición competitiva, volumen, market share, forecast y elasticidad observada.</p></div>${badge(priceStatus,d?'green':'amber')}</div>
  <div class="v11-picker"><label><span>MODELO</span><select id="v11Model">${opts}</select></label><div><b>${V11_SELECTED}</b><span>${desc}</span></div></div>
  <section class="kpis">${kpi('PRECIO',d?v11money(d.latest_price):'PENDING',d?`corte ${d.latest_price_period}`:'Price Evolution sin match',COLORS.amber,'PRICE')}${kpi('VOL SEP',fmt(m?.current??d?.current_volume??0),'Pivot · actual',COLORS.actual,'FACT')}${kpi('MS SEP',pct(v11currentShare(V11_SELECTED)),'share mercado Pivot',COLORS.blue,'FACT')}${kpi('KI BASE',kiBase!==null?fmt(kiBase):'PENDING','actual + Base forecast',COLORS.red,'FORECAST')}${kpi('ELASTICIDAD',d&&Number.isFinite(Number(d.elasticity))?Number(d.elasticity).toFixed(2):'PENDING',d?`R² ${Number(d.elasticity_r2||0).toFixed(2)} · n=${d.elasticity_n||0}`:'sin precio comparable',COLORS.green,d?.elasticity_confidence||'PENDING')}</section>
  <div class="grid two">${card('Evolución de precio','Serie del Price Evolution Report; precio nominal.',priceRows.length?lineChart(priceRows,[{key:'price',name:V11_SELECTED,color:COLORS.amber}],{zero:false}):`<div class="empty">Precio histórico PENDING.</div>`,'PRICE EVO')}${card('Forecast de volumen','Actuales + Down/Base/Up; no reemplaza actuals cerrados.',forecastReady?lineChart(fc,[{key:'actual',name:'Actual',color:COLORS.actual},{key:'down',name:'Down',color:COLORS.down},{key:'base',name:'Base',color:COLORS.red},{key:'up',name:'Up',color:COLORS.blue}],{zero:true}):`<div class="empty">Forecast PENDING para este modelo.</div>`,'MODEL FCST')}</div>
  <div class="grid two">${card('Forecast de market share','Share observado y trayectoria Base derivada del forecast del modelo.',forecastReady?lineChart(fc,[{key:'shareActual',name:'Actual MS',color:COLORS.actual},{key:'shareForecast',name:'Base MS',color:COLORS.red}],{percent:true,zero:true}):`<div class="empty">Share forecast PENDING.</div>`,'MARKET SHARE')}${card('Ficha comercial','Datos comparables disponibles sin inventar specs.',`<div class="v11-specs"><div><span>Marca</span><b>${safe(d?.brand)}</b></div><div><span>Grupo</span><b>${safe(d?.group)}</b></div><div><span>Segmento</span><b>${safe(d?.honda_planning||d?.segment)}</b></div><div><span>Cilindrada</span><b>${d?.cc?`${d.cc} cc`:'PENDING'}</b></div><div><span>Origen</span><b>${safe(d?.origin)}</b></div><div><span>Price Position Index</span><b>${d?.price_index_segment?`${(d.price_index_segment*100).toFixed(0)}%`:'PENDING'}</b></div></div><div class="note">Potencia, torque, frenos, ABS/CBS y equipamiento quedan <b>PENDING</b> cuando la fuente cargada no los contiene; no se completan por inferencia.</div>`,'MODEL CARD')}</div>
  ${card('Modelo vs Top competidores','Competidores del mismo segmento con precio, volumen, share y posición relativa.',v11comparisonTable(V11_SELECTED),'TOP COMPETITORS')}
  ${d?v11priceSimulator(d):`<div class="note"><b>Elasticidad:</b> PENDING hasta disponer de serie de precio emparejada para este modelo.</div>`}
  <div class="v11-method"><b>Elasticidad observada</b><span>Δln(share del segmento) vs Δln(precio del modelo / mediana de precios del segmento), Sep-25→Sep-26. Es una relación estadística, no prueba causal. El forecast oficial no se modifica automáticamente por esta elasticidad.</span></div></section>`;
}

const V11_BASE_STRUCTURE=structure;
structure=function(){return `${V11_BASE_STRUCTURE()}${v11ProductBlock()}`};
const V11_BASE_BIND=bindSingle;
bindSingle=function(){
  V11_BASE_BIND();
  const sel=$('#v11Model'),delta=$('#v11PriceDelta');
  if(sel)sel.onchange=()=>{V11_SELECTED=sel.value;v11save();render()};
  if(delta)delta.onchange=()=>{V11_PRICE_DELTA=Math.max(-30,Math.min(30,Number(delta.value)||0));v11save();render()};
};
fetch(`/data/product-elasticity.json?v=${V11_VERSION}`,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(x=>{if(!x)return;V11_PRODUCT=x;const ready=()=>{if(typeof DATA!=='undefined'&&DATA){render()}else setTimeout(ready,80)};ready()}).catch(err=>console.error('product elasticity',err));
