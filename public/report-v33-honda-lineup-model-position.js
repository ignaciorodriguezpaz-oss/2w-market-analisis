/* 2W Market Analysis v33 — Honda full lineup by segment + model positioning */
const V33_VERSION='20261008-honda-lineup-model-position-v1';

/* Planning lineup is kept visible even when a model has no current Pivot registration row.
   Aliases are only used to reconcile naming; no volume is invented. */
const V33_HONDA_LINEUP=[
  {label:'Wave 110',segment:'CUB',aliases:['HONDA WAVE 110','HONDA WAVE 110S','HONDA WAVE']},
  {label:'Biz 110',segment:'CUB',aliases:['HONDA BIZ 110','HONDA BIZ']},
  {label:'GLH150',segment:'LMC',aliases:['HONDA GLH150','HONDA GLH 150']},
  {label:'XR150L',segment:'LMC',aliases:['HONDA XR 150','HONDA XR150','HONDA XR150L']},
  {label:'XR190L',segment:'LMC',aliases:['HONDA XR 190','HONDA XR190','HONDA XR190L']},
  {label:'CB125F',segment:'LMC',aliases:['HONDA CB 125','HONDA CB125','HONDA CB125F']},
  {label:'NAVI',segment:'SC',aliases:['HONDA NAVI']},
  {label:'PCX160',segment:'SC',aliases:['HONDA PCX160','HONDA PCX 160']},
  {label:'NEW SC 350',segment:'SC',aliases:['HONDA ADV350','HONDA FORZA 350','HONDA SC 350']},
  {label:'XR300L Tornado',segment:'FUN',aliases:['HONDA XR 300L','HONDA XR300L','HONDA XR300 TORNADO']},
  {label:'CB300',segment:'FUN',aliases:['HONDA CB 300','HONDA CB300','HONDA CB300F']},
  {label:'CB350',segment:'FUN',aliases:['HONDA CB350','HONDA CB 350']},
  {label:"CB500 H'ness",segment:'FUN',aliases:['HONDA CB500 HNESS','HONDA CB 500 HNESS','HONDA HNESS']},
  {label:'NX e-clutch',segment:'FUN',aliases:['HONDA NX','HONDA NX500']},
  {label:'XL750 e-clutch',segment:'FUN',aliases:['HONDA XL750','HONDA TRANSALP']},
  {label:'Hornet e-clutch',segment:'FUN',aliases:['HONDA HORNET','HONDA CB750 HORNET']},
  {label:'CB1000R',segment:'FUN',aliases:['HONDA CB1000R','HONDA CB 1000R']},
  {label:'CRF1100 / Africa Twin',segment:'FUN',aliases:['HONDA CRF1100','HONDA AFRICA TWIN']},
  {label:'NEW OFF 300 / CRF300',segment:'FUN',aliases:['HONDA CRF300','HONDA CRF 300']},
  {label:'TRX420FM',segment:'ATV',aliases:['HONDA TRX420','HONDA TRX 420','HONDA TRX420FM']}
];

function v33allModelNames(){try{return v3names('model')||[]}catch{return []}}
function v33isHondaModel(name){return v32modelMeta(name)?.brand==='HONDA'||norm(name).startsWith('HONDA ')}
function v33matchLineup(entry){
  const names=v33allModelNames().filter(v33isHondaModel);
  const exact=entry.aliases.map(norm);
  return names.find(n=>exact.includes(norm(n)))||names.find(n=>entry.aliases.some(a=>norm(n).includes(norm(a))||norm(a).includes(norm(n))))||null;
}
function v33segmentHondaEntries(segment){
  const planned=V33_HONDA_LINEUP.filter(x=>x.segment===segment).map(x=>({...x,model:v33matchLineup(x)}));
  const seen=new Set(planned.map(x=>x.model).filter(Boolean));
  const dynamic=v33allModelNames().filter(n=>v33isHondaModel(n)&&v32segForModel(n)===segment&&!seen.has(n)).map(n=>({label:n.replace(/^HONDA\s+/i,''),segment,aliases:[n],model:n,dynamic:true}));
  return [...planned,...dynamic];
}
function v33rankRows(map){return Object.entries(map||{}).map(([name,value])=>({name,value:Number(value)||0})).filter(x=>x.value>0).sort((a,b)=>b.value-a.value)}
function v33lineupMetrics(segment,entry){
  const hist=v32segmentHistory(segment),cur=hist.at(-1)?.models||{},py=hist.length>=13?(hist.at(-13)?.models||{}):{},r12=v32aggregateR12(hist,'models'),segNow=Number(hist.at(-1)?.total)||0,segR12=v32sum(hist.slice(-12).map(r=>r.total));
  const model=entry.model,current=model?(Number(cur[model])||0):0,r12v=model?(Number(r12[model])||0):0;
  const ranks=v33rankRows(cur),r12Ranks=v33rankRows(r12);
  const rank=current>0?ranks.findIndex(x=>x.name===model)+1:null,r12Rank=r12v>0?r12Ranks.findIndex(x=>x.name===model)+1:null;
  const above=rank&&rank>1?ranks[rank-2]:null,below=rank&&rank<ranks.length?ranks[rank]:null;
  const yoy=model&&Number(py[model])>0?current/Number(py[model])-1:null;
  return {model,label:entry.label,current,r12:r12v,rank,r12Rank,share:v32share(current,segNow),r12Share:v32share(r12v,segR12),yoy,above,below,hasData:!!model&&(current>0||r12v>0)};
}
function v33hondaLineupTable(segment){
  const rows=v33segmentHondaEntries(segment).map(e=>v33lineupMetrics(segment,e)).sort((a,b)=>{
    if(a.rank&&b.rank)return a.rank-b.rank;if(a.rank)return -1;if(b.rank)return 1;if(a.r12Rank&&b.r12Rank)return a.r12Rank-b.r12Rank;if(a.r12Rank)return -1;if(b.r12Rank)return 1;return a.label.localeCompare(b.label,'es');
  });
  if(!rows.length)return '<div class="empty">Sin lineup Honda configurado para este segmento.</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Modelo Honda</th><th>Pos. actual</th><th>Actual</th><th>MS seg.</th><th>YoY</th><th>R12</th><th>Pos. R12</th><th>Lectura</th></tr></thead><tbody>${rows.map(r=>{
    const top=r.rank&&r.rank<=5;
    let read='';
    if(!r.model)read=`${badge('SIN MATCH PIVOT','amber')} Sin volumen inventado`;
    else if(!r.hasData)read=`${badge('SIN REGISTRO','amber')} Está en lineup, sin posición activa`;
    else if(top)read=`${badge('TOP 5','green')} ${r.above?`arriba: ${r.above.name} · gap ${fmt(r.above.value-r.current)}`:'líder del segmento'}`;
    else read=`${badge('FUERA TOP 5','amber')} ${r.above?`inmediato arriba: ${r.above.name} (#${r.rank-1}) · gap ${fmt(r.above.value-r.current)}`:`posición #${r.rank}`}`;
    return `<tr><td><b>${r.label}</b>${r.model&&norm(r.model)!==norm('HONDA '+r.label)?`<small>${r.model}</small>`:''}</td><td>${r.rank?`#${r.rank}`:'—'}</td><td>${r.hasData?fmt(r.current):'—'}</td><td>${r.hasData?pct(r.share):'—'}</td><td class="${ratioTone(r.yoy)}-txt">${r.yoy!==null?pct(r.yoy):'—'}</td><td>${r.r12?fmt(r.r12):'—'}</td><td>${r.r12Rank?`#${r.r12Rank}`:'—'}</td><td>${read}</td></tr>`;
  }).join('')}</tbody></table></div>`;
}
function v33hondaLineupBlock(segment){
  const entries=v33segmentHondaEntries(segment),active=entries.filter(e=>v33lineupMetrics(segment,e).hasData).length,total=entries.length;
  return `<section class="card v33-honda-lineup"><div class="card-head"><div><span class="eyebrow">HONDA · FULL LINEUP</span><h2>${segment} · todo el lineup Honda y su posición</h2><p>No se oculta un Honda por quedar fuera del Top 5. Cada modelo muestra su ranking real dentro del segmento; si no tiene match/registro en la base, queda explícitamente sin posición.</p></div>${badge(`${active}/${total} CON DATA`,active===total?'green':'amber')}</div>${v33hondaLineupTable(segment)}<div class="note"><b>Regla:</b> Top 5 sirve para leer el mercado; el lineup Honda se muestra completo aparte. Un modelo Honda fuera del Top 5 conserva su posición exacta y el gap contra el modelo inmediatamente superior.</div></section>`;
}

const V33_BASE_SEGMENT_BLOCK=typeof v32segmentBlock==='function'?v32segmentBlock:null;
if(V33_BASE_SEGMENT_BLOCK){
  v32segmentBlock=function(segment){return `${V33_BASE_SEGMENT_BLOCK(segment)}${v33hondaLineupBlock(segment)}`};
}

function v33modelCompetitiveRows(name){
  const segment=v32segForModel(name),hist=v32segmentHistory(segment),cur=hist.at(-1)?.models||{},py=hist.length>=13?(hist.at(-13)?.models||{}):{},r12=v32aggregateR12(hist,'models'),segNow=Number(hist.at(-1)?.total)||0,segR12=v32sum(hist.slice(-12).map(r=>r.total));
  const ranks=v33rankRows(cur),r12Ranks=v33rankRows(r12),rank=(Number(cur[name])||0)>0?ranks.findIndex(x=>x.name===name)+1:null,r12Rank=(Number(r12[name])||0)>0?r12Ranks.findIndex(x=>x.name===name)+1:null;
  const current=Number(cur[name])||0,r12v=Number(r12[name])||0,above=rank&&rank>1?ranks[rank-2]:null,leader=ranks.find(x=>x.name!==name)||null;
  const yoy=Number(py[name])>0?current/Number(py[name])-1:null,share=v32share(current,segNow),r12Share=v32share(r12v,segR12),delta=(share-r12Share)*100;
  let display=ranks.slice(0,5);if(rank&&rank>5&&!display.some(x=>x.name===name))display=[...display,{name,value:current,selected:true}];
  return {segment,hist,cur,py,r12,segNow,segR12,ranks,r12Ranks,rank,r12Rank,current,r12v,above,leader,yoy,share,r12Share,delta,display};
}
function v33modelTopTable(name){
  const x=v33modelCompetitiveRows(name);if(!x.hist.length)return '<div class="empty">Historia de segmento no disponible.</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Modelo</th><th>Actual</th><th>MS seg.</th><th>YoY</th><th>R12</th><th>Pos. R12</th></tr></thead><tbody>${x.display.map(r=>{const rr=Number(x.r12[r.name])||0,yr=Number(x.py[r.name])>0?r.value/Number(x.py[r.name])-1:null,rank=x.ranks.findIndex(z=>z.name===r.name)+1,r12Rank=rr>0?x.r12Ranks.findIndex(z=>z.name===r.name)+1:null;return `<tr class="${r.name===name?'v11-selected-row':''}"><td>#${rank}</td><td><b>${r.name}</b>${r.name===name?' '+badge('SELECTED','green'):''}</td><td>${fmt(r.value)}</td><td>${pct(v32share(r.value,x.segNow))}</td><td class="${ratioTone(yr)}-txt">${yr!==null?pct(yr):'—'}</td><td>${fmt(rr)}</td><td>${r12Rank?`#${r12Rank}`:'—'}</td></tr>`}).join('')}</tbody></table></div>`;
}
function v33modelPositionBlock(name){
  const x=v33modelCompetitiveRows(name);if(!x.hist.length)return '';
  const r12Bars=x.display.map(r=>({name:r.name,value:Number(x.r12[r.name])||0})).filter(r=>r.value>0).sort((a,b)=>b.value-a.value);
  const state=x.delta>.5?'ganando share':x.delta<-.5?'cediendo share':'estable';
  const nearest=x.above?`${x.above.name} (#${x.rank-1}) · gap ${fmt(x.above.value-x.current)} uds`:x.rank===1?'líder del segmento':'sin referencia inmediata';
  return `<section class="card v33-model-position"><div class="card-head"><div><span class="eyebrow">MODEL POSITIONING · ${x.segment}</span><h2>${name} · posición competitiva dentro del segmento</h2><p>La misma lógica del análisis por segmento, ahora aplicada a un modelo: ranking, share, Rolling 12M, Top 5 y gap contra el competidor inmediatamente superior.</p></div>${badge(x.rank?`#${x.rank} ACTUAL`:'SIN POSICIÓN',x.rank&&x.rank<=5?'green':'amber')}</div>
    <section class="kpis">${kpi('RANK ACTUAL',x.rank?`#${x.rank}`:'—',`segmento ${x.segment}`,COLORS.red,'MODEL')}${kpi('MS SEGMENTO',pct(x.share),`${state} · ${x.delta>=0?'+':''}${x.delta.toFixed(1).replace('.',',')} pp vs R12`,COLORS.blue,'POSITION')}${kpi('R12',fmt(x.r12v),x.r12Rank?`posición R12 #${x.r12Rank}`:'sin ranking R12',COLORS.actual,'ROLLING 12M')}${kpi('GAP INMEDIATO',x.above?fmt(x.above.value-x.current):'0',nearest,COLORS.amber,'COMPETITION')}</section>
    <div class="grid two">${card(`Rolling 12M · Top 5 ${x.segment}${x.rank&&x.rank>5?' + seleccionado':''}`,'Comparación acumulada de 12 meses dentro del segmento.',barChart(r12Bars,{limit:6,color:r=>r.name===name?COLORS.red:COLORS.blue}),'MODEL R12')}${card('Lectura de posición',`Dónde está ${name} y qué necesita para escalar.`,`<div class="narrative"><h3>${x.rank?`#${x.rank} en ${x.segment}`:'Sin posición actual'}</h3><p>${x.rank===1?'Es el líder actual del segmento.':x.rank?`El competidor inmediatamente superior es <b>${x.above?.name||'—'}</b>; el gap es <b>${fmt((x.above?.value||0)-x.current)}</b> unidades en el último cierre.`:'No registra volumen actual en la base cargada.'}</p><p>Share actual <b>${pct(x.share)}</b> vs R12 <b>${pct(x.r12Share)}</b>. YoY ${x.yoy!==null?`<b>${pct(x.yoy)}</b>`:'sin comparable'}. La lectura está <b>${state}</b>.</p></div>`,'MODEL READ')}</div>
    ${card(`Top 5 modelos · ${x.segment}`,'Si el seleccionado queda fuera del Top 5 se agrega igual con su ranking real.',v33modelTopTable(name),'TOP 5 + SELECTED')}
  </section>`;
}

const V33_BASE_PRODUCT=typeof v11ProductBlock==='function'?v11ProductBlock:null;
if(V33_BASE_PRODUCT){
  v11ProductBlock=function(){return `${V33_BASE_PRODUCT()}${v33modelPositionBlock(V11_SELECTED)}`};
}

(function v33boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof render==='function'){try{render()}catch(e){console.error('v33 Honda lineup/model position',e)}}else setTimeout(ready,120)};ready()})();
