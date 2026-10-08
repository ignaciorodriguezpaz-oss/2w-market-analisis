/* 2W Market Analysis v32 — narrative priority + total market / segment rolling & Top 5 */
const V32_VERSION='20261008-narrative-competition-v1';
const V32_SEG_ORDER=['CUB','LMC','SC','FUN','ATV','OTHERS'];

function v32sum(arr){return (arr||[]).reduce((s,v)=>s+(Number(v)||0),0)}
function v32share(a,b){return b?Number(a)/Number(b):0}
function v32periods(){
  if(typeof V13_MODEL_HISTORY!=='undefined'&&Array.isArray(V13_MODEL_HISTORY)&&V13_MODEL_HISTORY.length)return V13_MODEL_HISTORY.map(r=>r.period);
  if(typeof V3_ROLL!=='undefined'&&Array.isArray(V3_ROLL?.brand_history))return V3_ROLL.brand_history.map(r=>r.period);
  return [];
}
function v32marketRolling(){
  const h=DATA?.market_history||[];if(h.length<12)return [];
  const out=[];
  for(let i=11;i<h.length;i++)out.push({period:h[i].period,market:v32sum(h.slice(i-11,i+1).map(r=>r.value))});
  return out.slice(-12);
}
function v32hondaMonthly(){
  const hh=DATA?.honda?.history;
  if(Array.isArray(hh)&&hh.length){
    const rows=hh.map(r=>({period:r.period,honda:Number(r.honda??r.value)||0})).filter(r=>r.period&&r.honda>=0);
    if(rows.length)return rows;
  }
  return (typeof V3_ROLL!=='undefined'&&V3_ROLL?.brand_history||[]).map(r=>({period:r.period,honda:Number(r.HONDA)||0}));
}
function v32rollingFromMonthly(rows,key){
  if(!rows?.length)return [];
  const out=[];for(let i=11;i<rows.length;i++)out.push({period:rows[i].period,value:v32sum(rows.slice(i-11,i+1).map(r=>r[key]))});
  return out;
}
function v32entityR12(type,name){
  try{return Number(v3entityMetrics(type,name)?.r12)||0}catch{return 0}
}
function v32topNames(type,limit=5){
  try{return v4rankedNames(type,limit)||[]}catch{return []}
}
function v32ensureHonda(names,limit=5){
  const arr=[...names];
  if(!arr.includes('HONDA'))arr.push('HONDA');
  return [...new Set(arr)].sort((a,b)=>v32entityR12('brand',b)-v32entityR12('brand',a)).slice(0,limit);
}
function v32r12Bars(type,names){
  return names.map(name=>({name,value:v32entityR12(type,name)})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value);
}
function v32marketPositioning(){
  const brandNames=v32topNames('brand',10), groupNames=v32topNames('group',10);
  const brandRank=Math.max(1,brandNames.indexOf('HONDA')+1||brandNames.length+1),groupRank=Math.max(1,groupNames.indexOf('HONDA')+1||groupNames.length+1);
  const hm=v3entityMetrics('brand','HONDA'),hg=v3entityMetrics('group','HONDA');
  const leader=brandNames[0]||'—',lm=leader!=='—'?v3entityMetrics('brand',leader):null;
  const trend=(hm.share-hm.r12Share)*100;
  const tone=trend>.5?'fortaleciendo':trend<-.5?'cediendo':'estable';
  return `<div class="narrative"><h3>Honda: #${brandRank} en marcas · #${groupRank} en grupos</h3><p>Honda cierra con <b>${pct(hm.share)}</b> de MS mensual y <b>${pct(hm.r12Share)}</b> en Rolling 12M. La señal de participación está <b>${tone}</b> frente a su promedio móvil (${trend>=0?'+':''}${trend.toFixed(1).replace('.',',')} pp).</p><p>${leader==='HONDA'?`Honda lidera marcas; la atención pasa a sostener share y mix.`:`El líder actual es <b>${leader}</b> con ${pct(lm?.share)}; el gap de Honda es ${((hm.share-(lm?.share||0))*100).toFixed(1).replace('.',',')} pp.`} Como grupo, Honda suma ${fmt(hg.r12)} unidades R12.</p></div>`;
}
function v32totalCompetition(){
  const marketRoll=v32marketRolling();
  const hRoll=v32rollingFromMonthly(v32hondaMonthly(),'honda').slice(-12);
  const brandTop=v32topNames('brand',5),brandR12=v32r12Bars('brand',v32ensureHonda(brandTop,5));
  const groupTop=v32topNames('group',5),groupNames=[...new Set([...groupTop,'HONDA'])].sort((a,b)=>v32entityR12('group',b)-v32entityR12('group',a)).slice(0,5),groupR12=v32r12Bars('group',groupNames);
  const latest=DATA?.market_history?.at(-1),marketR12=marketRoll.at(-1)?.market||v32sum((DATA?.market_history||[]).slice(-12).map(r=>r.value));
  const hondaR12=v32entityR12('brand','HONDA'),hondaR12Share=v32share(hondaR12,marketR12);
  return chapter('competition-total','07','Mercado total · Rolling 12M & Top 5','Primero se entiende el mercado completo; después se baja a segmentos. Rolling 12M evita sobrerreaccionar a un solo mes y los Top 5 muestran concentración competitiva.',`
    <section class="kpis">${kpi('MERCADO R12',fmt(marketR12),'últimos 12 meses oficiales',COLORS.actual,'ROLLING 12M')}${kpi('HONDA R12',fmt(hondaR12),`MS R12 ${pct(hondaR12Share)}`,COLORS.red,'ROLLING 12M')}${kpi('ÚLTIMO CIERRE',fmt(latest?.value||0),latest?`${pct(latest.mom)} MoM · ${pct(latest.yoy)} YoY`:'',COLORS.blue,'FACT')}</section>
    <div class="grid two">${card('Mercado total · evolución Rolling 12M','Suma móvil de 12 meses; el cierre más reciente usa el reporte oficial.',lineChart(marketRoll,[{key:'market',name:'Mercado R12',color:COLORS.actual}],{zero:true}),'MARKET R12')}${card('Honda · evolución Rolling 12M','Suma móvil Honda cuando existe historia suficiente; si la base competitiva es más corta, el ranking R12 de la derecha sigue siendo el control principal.',hRoll.length?lineChart(hRoll.map(r=>({period:r.period,honda:r.value})),[{key:'honda',name:'Honda R12',color:COLORS.red}],{zero:true}):`<div class="empty">Historia Honda insuficiente para una curva R12 completa.</div>`,'HONDA R12')}</div>
    <div class="grid two">${card('Rolling 12M · Honda + Top marcas','Comparación por volumen acumulado de los últimos 12 meses.',barChart(brandR12,{limit:5,color:r=>r.name==='HONDA'?COLORS.red:COLORS.blue}),'BRANDS R12')}${card('Rolling 12M · Honda + Top grupos','Misma lectura por grupo empresario.',barChart(groupR12,{limit:5,color:r=>r.name==='HONDA'?COLORS.red:COLORS.actual}),'GROUPS R12')}</div>
    <div class="grid three">${card('Top 5 grupos · mercado total','Actual, MS, MoM, YoY y rolling acumulado.',v4rankTable('group',5),'TOP 5')}${card('Top 5 marcas · mercado total','Ranking general antes de abrir por segmento.',v4rankTable('brand',5),'TOP 5')}${card('Top 5 modelos · mercado total','Los modelos de mayor volumen del mercado total.',v4rankTable('model',5),'TOP 5')}</div>
    ${card('Posicionamiento Honda · mercado total','Lectura ejecutiva antes del drill-down por segmento.',v32marketPositioning(),'HONDA POSITION')}
  `);
}

function v32segForModel(name){
  try{return (typeof v23seg==='function'?v23seg(name):null)?.segment1||'OTHERS'}catch{return 'OTHERS'}
}
function v32modelMeta(name){
  const m=(typeof V13_MODEL_META!=='undefined'&&V13_MODEL_META?.get)?V13_MODEL_META.get(name):null;
  if(m)return {brand:m.brand||String(name).split(' ')[0],group:m.group||'OTHERS'};
  try{const x=v7fModelMeta(name);return {brand:x?.brand||String(name).split(' ')[0],group:x?.group||'OTHERS'}}catch{return {brand:String(name).split(' ')[0]||'OTHERS',group:'OTHERS'}}
}
function v32segmentHistory(segment){
  const hist=(typeof V13_MODEL_HISTORY!=='undefined'&&Array.isArray(V13_MODEL_HISTORY))?V13_MODEL_HISTORY:[];
  const modelNames=(typeof v3names==='function'?v3names('model'):[]).filter(n=>v32segForModel(n)===segment);
  return hist.map(r=>{
    const row={period:r.period,total:0,brands:{},groups:{},models:{}};
    modelNames.forEach(n=>{const v=Number(r[n])||0;if(!v)return;const meta=v32modelMeta(n);row.total+=v;row.models[n]=(row.models[n]||0)+v;row.brands[meta.brand]=(row.brands[meta.brand]||0)+v;row.groups[meta.group]=(row.groups[meta.group]||0)+v});
    return row;
  });
}
function v32aggregateR12(hist,key){
  const rows=hist.slice(-12),out={};rows.forEach(r=>Object.entries(r[key]||{}).forEach(([n,v])=>out[n]=(out[n]||0)+(Number(v)||0)));return out;
}
function v32currentMap(hist,key){return hist.at(-1)?.[key]||{}}
function v32prevYearMap(hist,key){return hist.length>=13?(hist.at(-13)?.[key]||{}):{}}
function v32rankMap(map,limit=5){return Object.entries(map).map(([name,value])=>({name,value:Number(value)||0})).sort((a,b)=>b.value-a.value).slice(0,limit)}
function v32segmentTable(segment,type){
  const hist=v32segmentHistory(segment),key=type==='brand'?'brands':type==='group'?'groups':'models',cur=v32currentMap(hist,key),py=v32prevYearMap(hist,key),r12=v32aggregateR12(hist,key),segNow=Number(hist.at(-1)?.total)||0,segR12=v32sum(hist.slice(-12).map(r=>r.total));
  const top=v32rankMap(cur,5);
  const title=type==='brand'?'Marca':type==='group'?'Grupo':'Modelo';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>${title}</th><th>Actual</th><th>MS seg.</th><th>YoY</th><th>R12</th><th>MS R12</th></tr></thead><tbody>${top.map((x,i)=>{const yoy=py[x.name]?x.value/py[x.name]-1:null;const rr=Number(r12[x.name])||0;return `<tr><td>${i+1}</td><td><b>${x.name}</b></td><td>${fmt(x.value)}</td><td>${pct(v32share(x.value,segNow))}</td><td class="${ratioTone(yoy)}-txt">${pct(yoy)}</td><td>${fmt(rr)}</td><td>${pct(v32share(rr,segR12))}</td></tr>`}).join('')||'<tr><td colspan="7">Sin datos suficientes</td></tr>'}</tbody></table></div>`;
}
function v32segmentR12Brands(segment){
  const hist=v32segmentHistory(segment),r12=v32aggregateR12(hist,'brands');let rows=v32rankMap(r12,5);
  if((r12.HONDA||0)>0&&!rows.some(x=>x.name==='HONDA'))rows=[...rows.slice(0,4),{name:'HONDA',value:r12.HONDA}].sort((a,b)=>b.value-a.value);
  return rows;
}
function v32segmentPosition(segment){
  const hist=v32segmentHistory(segment),cur=v32currentMap(hist,'brands'),r12=v32aggregateR12(hist,'brands'),models=v32currentMap(hist,'models'),segNow=Number(hist.at(-1)?.total)||0,segR12=v32sum(hist.slice(-12).map(r=>r.total));
  const ranks=v32rankMap(cur,99),hrank=ranks.findIndex(x=>x.name==='HONDA')+1,leader=ranks[0],hNow=Number(cur.HONDA)||0,hR12=Number(r12.HONDA)||0,sNow=v32share(hNow,segNow),sR12=v32share(hR12,segR12),delta=(sNow-sR12)*100;
  const hModels=Object.entries(models).filter(([n])=>v32modelMeta(n).brand==='HONDA').map(([name,value])=>({name,value})).sort((a,b)=>b.value-a.value),topHonda=hModels[0];
  const stateTxt=delta>.5?'ganando participación':delta<-.5?'perdiendo participación':'estable';
  const gap=leader&&leader.name!=='HONDA'?(sNow-v32share(leader.value,segNow))*100:0;
  return `<div class="narrative"><h3>${segment} · Honda ${hrank?`#${hrank}`:'sin posición'} · ${pct(sNow)} MS</h3><p>Honda está <b>${stateTxt}</b> contra su Rolling 12M: ${pct(sNow)} actual vs ${pct(sR12)} R12 (${delta>=0?'+':''}${delta.toFixed(1).replace('.',',')} pp).</p><p>${leader?leader.name==='HONDA'?`Honda lidera el segmento con ${fmt(hNow)} unidades en el último cierre.`:`El líder es <b>${leader.name}</b> con ${pct(v32share(leader.value,segNow))}; Honda está ${Math.abs(gap).toFixed(1).replace('.',',')} pp ${gap<0?'por debajo':'por encima'}.`:''}${topHonda?` El principal Honda es <b>${topHonda.name}</b> con ${fmt(topHonda.value)} unidades.`:''}</p></div>`;
}
function v32segmentBlock(segment){
  const hist=v32segmentHistory(segment);if(!hist.length)return '';
  const latest=hist.at(-1),segR12=v32sum(hist.slice(-12).map(r=>r.total)),marketR12=v32sum((DATA?.market_history||[]).slice(-12).map(r=>r.value)),r12Brands=v32segmentR12Brands(segment);
  if(!(latest?.total>0||segR12>0))return '';
  return `<section class="card v32-segment-block"><div class="card-head"><div><span class="eyebrow">SEGMENTO 1 · ${segment}</span><h2>${segment} · Rolling 12M, Top 5 & Honda</h2><p>La misma lectura del mercado total aplicada al segmento: volumen móvil, concentración y posición Honda.</p></div>${badge(`R12 ${fmt(segR12)}`,'green')}</div>
    <section class="kpis">${kpi('ACTUAL SEGMENTO',fmt(latest.total),`share mercado ${pct(v32share(latest.total,Number(DATA?.market_history?.at(-1)?.value)||0))}`,COLORS[segment]||COLORS.blue,'FACT')}${kpi('SEGMENTO R12',fmt(segR12),`share mercado R12 ${pct(v32share(segR12,marketR12))}`,COLORS.blue,'ROLLING 12M')}${kpi('HONDA R12',fmt(r12Brands.find(x=>x.name==='HONDA')?.value||0),`MS seg. ${pct(v32share(r12Brands.find(x=>x.name==='HONDA')?.value||0,segR12))}`,COLORS.red,'HONDA')}</section>
    <div class="grid two">${card(`Rolling 12M · ${segment}`,'Honda + principales marcas del segmento.',barChart(r12Brands,{limit:5,color:r=>r.name==='HONDA'?COLORS.red:COLORS.blue}),'BRANDS R12')}${card(`Posicionamiento Honda · ${segment}`,'Lectura automática de ranking, share y momentum.',v32segmentPosition(segment),'HONDA POSITION')}</div>
    <div class="grid three">${card(`Top 5 grupos · ${segment}`,'Ranking dentro del segmento.',v32segmentTable(segment,'group'),'TOP 5')}${card(`Top 5 marcas · ${segment}`,'Ranking dentro del segmento.',v32segmentTable(segment,'brand'),'TOP 5')}${card(`Top 5 modelos · ${segment}`,'Ranking de modelos del segmento.',v32segmentTable(segment,'model'),'TOP 5')}</div>
  </section>`;
}
function v32segmentsCompetition(){
  const available=V32_SEG_ORDER.filter(s=>{const h=v32segmentHistory(s);return h.some(r=>r.total>0)});
  return chapter('segments-honda','08','Segmentos · Rolling 12M & posicionamiento Honda','Después del mercado total, el análisis baja por Segmento 1. Cada segmento repite la misma lógica: Rolling 12M, Top 5 grupos/marcas/modelos y una lectura ejecutiva de Honda.',`${available.map(v32segmentBlock).join('')}<div class="note"><b>Criterio:</b> esta hoja usa Segmento 1 para mantener una narrativa ejecutiva comparable. Segmento 2 y filtros más finos siguen disponibles en Herramientas.</div>`);
}

/* Narrative priority: what matters -> why -> what is happening -> what comes next -> who wins -> where Honda stands -> what to do. */
if(typeof V31_ANALYSIS_INDEX!=='undefined'&&Array.isArray(V31_ANALYSIS_INDEX)){
  V31_ANALYSIS_INDEX.splice(0,V31_ANALYSIS_INDEX.length,
    ['executive','01','Resumen ejecutivo'],
    ['context','02','Argentina hoy'],
    ['argentina-future','03','Argentina futuro'],
    ['market','04','Mercado + Daily'],
    ['consumer','05','Consumidor & movilidad'],
    ['forecast','06','Forecast CY / KI'],
    ['competition-total','07','Mercado total + Rolling'],
    ['segments-honda','08','Segmentos + Honda'],
    ['planning','09','Honda + Commercial'],
    ['actions','10','Noticias / señales'],
    ['method','11','Metodología & datos']
  );
}

v31analysisPage=function(){
  return v31withFixedCriteria(()=>`<div class="single-report v31-static-report v32-narrative-report">
    <div class="report-cover"><span>2W MARKET ANALYSIS · PRIORITY NARRATIVE</span><h1>Argentina Motorcycle Intelligence</h1><p>Qué importa → por qué → qué está pasando → qué viene → quién gana → dónde está Honda → qué decisión tomar.</p>
      <div class="v31-cover-note"><span>1 · Executive</span><span>2 · Contexto</span><span>3 · Mercado</span><span>4 · Forecast</span><span>5 · Competencia</span><span>6 · Segmentos</span><span>7 · Honda</span></div>
    </div>
    ${updateBand()}${exec()}${ctx()}${market()}${consumer()}${forecast()}${v32totalCompetition()}${v32segmentsCompetition()}${planning()}${typeof v29planCausalBlock==='function'?v29planCausalBlock():''}${actions()}${method()}
  </div>`);
};

(function v32boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v31analysisPage==='function'&&typeof render==='function'){
      try{render()}catch(e){console.error('V32 narrative competition render',e)}
    }else setTimeout(ready,120);
  };ready();
})();
