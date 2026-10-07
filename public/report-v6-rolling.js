/* 2W Market Analysis v6 — correct rolling sums + Volume / Market Share comparison toggle */
const V6_VERSION='20261007-rolling-sum-ms';
let V6_METRIC=(()=>{try{return localStorage.getItem('2w.compareMetric')||'volume'}catch{return 'volume'}})();
const V6_PALETTE=['#2b69c9','#16a085','#b97916','#8a5bd1','#536271','#00a6a6','#cc5a71','#6b8e23','#5c6bc0','#9c6ade'];

function v6saveMetric(){try{localStorage.setItem('2w.compareMetric',V6_METRIC)}catch{}}
function v6pivotTotal(period){
  const row=(V3_ROLL?.group_history||[]).find(r=>r.period===period);
  if(row){
    const total=Object.entries(row).reduce((a,[k,v])=>k==='period'?a:a+(Number(v)||0),0);
    if(total>0)return total;
  }
  return v3structTotal(period);
}
function v6sameMonthLastYear(period){
  const [y,m]=String(period||'').split('-');
  if(!y||!m)return null;
  return `${Number(y)-1}-${m}`;
}

/* Rolling means trailing cumulative volume. Share rolling = cumulative entity volume / cumulative Pivot market. */
v3entityMetrics=function(type,name){
  const h=v3hist(type),last=h.at(-1),prev=h.at(-2),yoyPeriod=v6sameMonthLastYear(last?.period),yoyRow=h.find(r=>r.period===yoyPeriod),cur=Number(last?.[name])||0;
  const roll=n=>v3sum(h.slice(-n).map(r=>Number(r[name])||0));
  const share=n=>{
    const rows=h.slice(-n),num=v3sum(rows.map(r=>Number(r[name])||0)),den=v3sum(rows.map(r=>v6pivotTotal(r.period)));
    return den?num/den:0;
  };
  const totalNow=v6pivotTotal(last?.period),s0=totalNow?cur/totalNow:0,s3=share(3),s6=share(6),s12=share(12);
  let s=.55*s0+.30*s3+.15*s6;const drift=s3-s6;s=Math.max(0,s+drift*.45);
  const f=DATA.forecast.rows.map((r,i)=>{const ss=Math.max(0,s+drift*Math.pow(.55,i+1));return {period:r.period,share:ss,down:Math.round(r.down*ss),base:Math.round(r.base*ss),up:Math.round(r.up*ss)}});
  const actualKI=v3sum(h.filter(r=>r.period>='2026-04'&&r.period<='2026-09').map(r=>Number(r[name])||0)),kiBase=actualKI+v3sum(f.map(x=>x.base));
  return {name,current:cur,mom:v3pct(cur,Number(prev?.[name])||0),yoy:v3pct(cur,Number(yoyRow?.[name])||0),r3:roll(3),r6:roll(6),r12:roll(12),share:s0,r3Share:s3,r6Share:s6,r12Share:s12,f,kiBase};
};

function v6metricSwitch(){
  return `<div class="v4-switch v6-metric"><span>Métrica gráficos</span><button data-v6-metric="volume" class="${V6_METRIC==='volume'?'active':''}">Volumen</button><button data-v6-metric="share" class="${V6_METRIC==='share'?'active':''}">Market Share</button></div>`;
}
function v6chartSeries(type,names){
  return names.map((n,i)=>({key:n,name:n,color:n==='HONDA'?COLORS.red:V6_PALETTE[i%V6_PALETTE.length]}));
}
function v6comparisonChart(type,limit,months=12){
  if(!V3_ROLL)return pending('Comparativo','Historia Pivot no disponible.');
  const names=v4rankedNames(type,limit),metrics=Object.fromEntries(names.map(n=>[n,v3entityMetrics(type,n)]));
  const hist=v3hist(type).slice(-months).map(r=>{
    const row={period:r.period},total=v6pivotTotal(r.period);
    names.forEach(n=>row[n]=V6_METRIC==='share'?(total?100*(Number(r[n])||0)/total:0):(Number(r[n])||0));
    return row;
  });
  const future=DATA.forecast.rows.map((r,i)=>{
    const row={period:r.period};
    names.forEach(n=>row[n]=V6_METRIC==='share'?100*(metrics[n]?.f[i]?.share||0):(metrics[n]?.f[i]?.base||0));
    return row;
  });
  return `<div class="v6-chart-label">${V6_METRIC==='share'?'MARKET SHARE (%) · PIVOT TOTAL':'VOLUMEN (UNIDADES)'} · actual + Base forecast</div>${lineChart([...hist,...future],v6chartSeries(type,names),{zero:true})}`;
}

v3groupChart=function(){
  if(!V3_ROLL)return pending('Grupos','Historia Pivot no disponible.');
  const names=['IRAOLA','HONDA','LA EMILIA','GILERA','KELLER'].filter(n=>V3_ROLL.groups.includes(n));
  const metrics=Object.fromEntries(names.map(n=>[n,v3entityMetrics('group',n)]));
  const hist=V3_ROLL.group_history.slice(-12).map(r=>{const row={period:r.period},total=v6pivotTotal(r.period);names.forEach(n=>row[n]=V6_METRIC==='share'?(total?100*(Number(r[n])||0)/total:0):(Number(r[n])||0));return row});
  const future=DATA.forecast.rows.map((f,i)=>{const row={period:f.period};names.forEach(n=>row[n]=V6_METRIC==='share'?100*(metrics[n]?.f[i]?.share||0):(metrics[n]?.f[i]?.base||0));return row});
  return `<div class="v6-chart-label">${V6_METRIC==='share'?'MARKET SHARE (%)':'VOLUMEN (UNIDADES)'} · Rolling source Pivot / Base forecast</div>${lineChart([...hist,...future],v6chartSeries('group',names),{zero:true})}`;
};

v4rankTable=function(type,limit){
  if(!V3_ROLL)return pending('Ranking Pivot','Historia Pivot no disponible.');
  const total=v6pivotTotal(V3_ROLL.cutoff||'2026-09')||Number(V3_ROLL.pivot_total_sep_2026)||80925;
  const names=v4rankedNames(type,limit);
  return `<div class="table-wrap"><table class="table v4-rank"><thead><tr><th>#</th><th>${type==='brand'?'Marca':type==='group'?'Grupo':'Modelo'}</th><th>Sep</th><th>MS</th><th>MoM</th><th>YoY</th><th>R3M</th><th>R6M</th><th>R12M</th></tr></thead><tbody>${names.map((n,i)=>{const r=v3entityMetrics(type,n);return `<tr><td>${i+1}</td><td><strong>${n}</strong></td><td>${fmt(r.current)}</td><td>${pct(r.share)}</td><td class="${ratioTone(r.mom)}-txt">${pct(r.mom)}</td><td class="${ratioTone(r.yoy)}-txt">${pct(r.yoy)}</td><td title="MS R3M ${pct(r.r3Share)}">${fmt(r.r3)}</td><td title="MS R6M ${pct(r.r6Share)}">${fmt(r.r6)}</td><td title="MS R12M ${pct(r.r12Share)}">${fmt(r.r12)}</td></tr>`}).join('')}</tbody></table></div>`;
};

v4entityBlock=function(type){
  const l=V4_LIMITS[type];
  return `<section class="card v4-entity"><div class="card-head"><div><span class="eyebrow">PIVOT MASTER · REGISTRATIONS</span><h2>${V4_LABELS[type]}</h2><p>Top ${l}, MoM, YoY, rolling acumulado y forecast. El selector Volumen/MS controla todos los gráficos comparativos.</p></div>${v4limitSwitch(type)}</div>${v6comparisonChart(type,l)}${v4rankTable(type,l)}<div class="v4-subhead"><b>Forecast ${V4_LABELS[type].toLowerCase()}</b><span>Oct-26 → Mar-27 · Down/Base/Up/Plan a KI</span></div>${v4forecastTable(type,l)}</section>`;
};

structure=function(){
  const row=DATA.segment_history?.at(-1);let segs=(row?.segments||[]).slice().sort((a,b)=>b.value-a.value);if(state.segment!=='TOTAL')segs=segs.filter(x=>x.name===state.segment);
  const iraola=v3entityMetrics('group','IRAOLA'),honda=v3entityMetrics('group','HONDA');
  return chapter('structure','05','Segmentos, marcas, grupos y modelos','La Pivot maestra gobierna la lectura competitiva. Rolling = volumen acumulado móvil; MS rolling = participación sobre el total Pivot del mismo período.',`${v6metricSwitch()}<section class="kpis">${kpi('IRAOLA R3M',fmt(iraola.r3),`MS ${pct(iraola.r3Share)}`,COLORS.blue,'FACT')}${kpi('HONDA R3M',fmt(honda.r3),`MS ${pct(honda.r3Share)}`,COLORS.red,'FACT')}${kpi('IRAOLA R12M',fmt(iraola.r12),`MS ${pct(iraola.r12Share)}`,COLORS.blue,'FACT')}${kpi('HONDA R12M',fmt(honda.r12),`MS ${pct(honda.r12Share)}`,COLORS.red,'FACT')}</section><div class="grid two">${card('Segmentos','Último corte estructural.',barChart(segs.map(x=>({name:x.name,value:x.value,share:x.share})),{showShare:true,color:r=>COLORS[r.name]||COLORS.blue}),'ACTUAL')}${card(`Grupos · ${V6_METRIC==='share'?'Market Share':'Volumen'}`,'Iraola, Honda, La Emilia, Gilera y Keller; actual + Base con la misma métrica.',v3groupChart(),'GROUP OUTLOOK')}</div>${v4entityBlock('brand')}${v4entityBlock('group')}${v4entityBlock('model')}<div class="note"><b>Definición corregida:</b> R3M = suma de los últimos 3 meses, R6M = suma de los últimos 6 y R12M = suma de los últimos 12. El Market Share rolling se calcula como Σ volumen entidad / Σ mercado Pivot de la misma ventana. Ejemplo de control R3M Jul–Sep: IRAOLA ${fmt(20206+21296+23311)} · Honda ${fmt(15209+15581+16675)}.</div>`);
};

const V6_BASE_BIND_SINGLE=bindSingle;
bindSingle=function(){
  V6_BASE_BIND_SINGLE();
  $$('[data-v6-metric]').forEach(b=>b.onclick=()=>{V6_METRIC=b.dataset.v6Metric||'volume';v6saveMetric();render()});
};
