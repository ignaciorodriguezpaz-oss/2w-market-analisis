/* 2W Market Analysis v39 — historical rankings 2010+ + Pivot-driven active lineup */
const V39_VERSION='20261008-historical-rankings-dom-v2';

function v39num(v){return Number(v)||0}
function v39hist(){
  return (typeof DATA!=='undefined'&&DATA?.market_history?DATA.market_history:[])
    .filter(r=>r?.period&&r.period>='2010-01'&&Number.isFinite(Number(r.value)))
    .map(r=>({...r,value:v39num(r.value)}))
    .sort((a,b)=>a.period.localeCompare(b.period));
}
function v39max(rows){return (rows||[]).reduce((best,r)=>!best||v39num(r.value)>v39num(best.value)?r:best,null)}
function v39yearMonth(period){const [y,m]=String(period||'').split('-').map(Number);return {y,m}}
function v39monthName(m){return ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][m-1]||''}
function v39rank(current,rows){return 1+(rows||[]).filter(r=>v39num(r.value)>v39num(current)).length}
function v39gapText(current,record){
  if(!record?.value)return 'sin benchmark';
  const diff=v39num(current)-v39num(record.value),ratio=diff/v39num(record.value);
  return `${diff>=0?'+':'−'}${fmt(Math.abs(diff))} · ${diff>=0?'+':'−'}${Math.abs(ratio*100).toFixed(1).replace('.',',')}%`;
}
function v39recordState(current,record){
  if(!record)return {tone:'amber',status:'SIN HISTORIA',detail:'Sin benchmark completo'};
  if(v39num(current)>v39num(record.value))return {tone:'green',status:'NUEVO RÉCORD',detail:`Récord anterior: ${record.label} · ${fmt(record.value)} · superado ${v39gapText(current,record)}`};
  if(v39num(current)===v39num(record.value))return {tone:'green',status:'IGUALA RÉCORD',detail:`Récord previo: ${record.label} · ${fmt(record.value)}`};
  return {tone:'amber',status:'BAJO RÉCORD',detail:`Récord vigente: ${record.label} · ${fmt(record.value)} · gap ${v39gapText(current,record)}`};
}

function v39latestClosed(){const h=v39hist();return h.length?h[h.length-1]:null}
function v39sameMonthBenchmark(){
  const h=v39hist(),latest=v39latestClosed();if(!latest)return null;
  const {y,m}=v39yearMonth(latest.period);
  const prior=h.filter(r=>{const p=v39yearMonth(r.period);return p.m===m&&p.y<y}).map(r=>({...r,label:`${v39monthName(m)} ${v39yearMonth(r.period).y}`}));
  return {name:`${v39monthName(m)} ${y}`,scope:'MES VS MISMO MES',value:latest.value,record:v39max(prior),rank:v39rank(latest.value,prior)};
}
function v39allTimeMonthBenchmark(){
  const h=v39hist(),latest=v39latestClosed();if(!latest)return null;
  const prior=h.slice(0,-1).map(r=>({...r,label:`${v39monthName(v39yearMonth(r.period).m)} ${v39yearMonth(r.period).y}`}));
  return {name:`${v39monthName(v39yearMonth(latest.period).m)} ${v39yearMonth(latest.period).y}`,scope:'MES VS TODOS LOS MESES',value:latest.value,record:v39max(prior),rank:v39rank(latest.value,prior)};
}
function v39ytdBenchmark(){
  const h=v39hist(),latest=v39latestClosed();if(!latest)return null;
  const {y,m}=v39yearMonth(latest.period);
  const currentRows=h.filter(r=>{const p=v39yearMonth(r.period);return p.y===y&&p.m<=m});
  const current=v39num(currentRows.reduce((s,r)=>s+r.value,0));
  const prior=[];
  for(let yr=2010;yr<y;yr++){
    const rows=h.filter(r=>{const p=v39yearMonth(r.period);return p.y===yr&&p.m<=m});
    if(rows.length===m)prior.push({label:`ENE–${v39monthName(m)} ${yr}`,value:v39num(rows.reduce((s,r)=>s+r.value,0))});
  }
  return {name:`YTD ${y}`,scope:`ENE–${v39monthName(m)} VS MISMO PERÍODO`,value:current,record:v39max(prior),rank:v39rank(current,prior)};
}
function v39rolling12Benchmark(){
  const h=v39hist();if(h.length<12)return null;
  const rolls=[];
  for(let i=11;i<h.length;i++){
    const value=v39num(h.slice(i-11,i+1).reduce((s,r)=>s+r.value,0));
    const p=v39yearMonth(h[i].period);
    rolls.push({label:`R12 a ${v39monthName(p.m)} ${p.y}`,value,period:h[i].period});
  }
  const current=rolls.at(-1),prior=rolls.slice(0,-1);
  return {name:'Rolling 12M',scope:'R12 VS TODOS LOS R12',value:current.value,record:v39max(prior),rank:v39rank(current.value,prior)};
}
function v39kiHistory(){
  const h=v39hist(),out=[];
  for(let start=2010;start<=2025;start++){
    const rows=h.filter(r=>r.period>=`${start}-04`&&r.period<=`${start+1}-03`);
    if(rows.length===12)out.push({label:`KI ${String(start).slice(-2)}/${String(start+1).slice(-2)}`,value:v39num(rows.reduce((s,r)=>s+r.value,0)),start});
  }
  return out;
}
function v39currentKI(){
  try{if(typeof currentKI==='function'){const x=currentKI();return {label:x.label||'KI 26/27',value:v39num(x.expected||x.base),forecast:true}}}catch{}
  const h=v39hist();
  const actual=h.filter(r=>r.period>='2026-04'&&r.period<='2026-09').reduce((s,r)=>s+r.value,0);
  const f=(DATA?.forecast?.rows||[]).filter(r=>r.period>='2026-10'&&r.period<='2027-03').reduce((s,r)=>s+v39num(r.expected||r.base),0);
  return {label:'KI 26/27',value:v39num(actual+f),forecast:true};
}
function v39kiBenchmark(){
  const cur=v39currentKI(),prior=v39kiHistory();if(!cur?.value||!prior.length)return null;
  return {name:cur.label,scope:'KI ESPERADO VS KI HISTÓRICOS',value:cur.value,record:v39max(prior),rank:v39rank(cur.value,prior),forecast:true};
}
function v39recordRow(x){
  if(!x)return '';
  const s=v39recordState(x.value,x.record);
  return `<tr><td><b>${x.name}</b><small>${x.scope}</small></td><td><b>${fmt(x.value)}</b>${x.forecast?'<small>actual + forecast</small>':'<small>actual</small>'}</td><td><b>#${x.rank}</b><small>desde 2010</small></td><td>${badge(s.status,s.tone)}<small>${s.detail}</small></td></tr>`;
}
function v39sameMonthRanking(){
  const latest=v39latestClosed();if(!latest)return [];
  const {m}=v39yearMonth(latest.period);
  return v39hist().filter(r=>v39yearMonth(r.period).m===m).map(r=>({label:`${v39monthName(m)} ${v39yearMonth(r.period).y}`,value:r.value,current:r.period===latest.period})).sort((a,b)=>b.value-a.value);
}
function v39kiRanking(){
  const cur=v39currentKI();
  return [...v39kiHistory().map(r=>({...r,current:false})),{label:cur.label,value:cur.value,current:true,forecast:true}].filter(r=>r.value>0).sort((a,b)=>b.value-a.value);
}
function v39rankingList(title,rows){
  const currentIndex=rows.findIndex(r=>r.current);
  const visible=rows.slice(0,5);
  if(currentIndex>=5)visible.push(rows[currentIndex]);
  return `<div class="card"><div class="card-head"><div><span class="eyebrow">RANKING HISTÓRICO</span><h3>${title}</h3></div></div><div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Período</th><th>Volumen</th></tr></thead><tbody>${visible.map(r=>`<tr${r.current?' style="font-weight:800"':''}><td>#${rows.indexOf(r)+1}</td><td>${r.label}${r.current?' · ACTUAL':''}${r.forecast?' · FCST':''}</td><td>${fmt(r.value)}</td></tr>`).join('')}</tbody></table></div></div>`;
}
function v39historicalRecordsBlock(){
  const rows=[v39sameMonthBenchmark(),v39allTimeMonthBenchmark(),v39ytdBenchmark(),v39rolling12Benchmark(),v39kiBenchmark()].filter(Boolean);
  if(!rows.length)return '';
  const latest=v39latestClosed(),m=latest?v39yearMonth(latest.period).m:null;
  return `<section class="v39-history-records" data-v39-history="1"><div class="card"><div class="card-head"><div><span class="eyebrow">HISTORICAL BENCHMARK · 2010 → ACTUAL</span><h2>Ranking y récords históricos</h2><p>Ubica el dato actual contra toda la serie. Si se supera un máximo, conserva el récord anterior, el período, el volumen y cuánto se lo superó.</p></div>${badge('HISTÓRICO 2010+','green')}</div><div class="table-wrap"><table class="table"><thead><tr><th>Indicador</th><th>Actual / FCST</th><th>Ranking</th><th>Récord</th></tr></thead><tbody>${rows.map(v39recordRow).join('')}</tbody></table></div></div><div class="grid two">${v39rankingList(`Top histórico · ${v39monthName(m)}`,v39sameMonthRanking())}${v39rankingList('Top histórico · KI',v39kiRanking())}</div></section>`;
}

/* Active lineup must be read from Pivot, not from a hand-curated planning list. */
function v39pivotHondaNames(segment){
  if(typeof v32segmentHistory!=='function'||typeof v33isHondaModel!=='function')return [];
  const hist=v32segmentHistory(segment)||[];
  for(let i=hist.length-1;i>=0;i--){
    const names=Object.entries(hist[i]?.models||{}).filter(([name,value])=>v39num(value)>0&&v33isHondaModel(name)).map(([name])=>name);
    if(names.length)return [...new Set(names)];
  }
  return [];
}
function v39installPivotLineup(){
  if(typeof v33segmentHondaEntries!=='function')return false;
  v33segmentHondaEntries=function(segment){return v39pivotHondaNames(segment).map(name=>({label:String(name).replace(/^HONDA\s+/i,''),segment,aliases:[name],model:name,dynamic:true,pivot:true}))};
  if(typeof v33hondaLineupBlock==='function'){
    v33hondaLineupBlock=function(segment){
      const entries=v33segmentHondaEntries(segment),active=entries.length;if(!active)return '';
      return `<section class="card v33-honda-lineup"><div class="card-head"><div><span class="eyebrow">HONDA · ACTIVE LINE UP · PIVOT</span><h2>${segment} · lineup activo según Pivot</h2><p>El lineup activo se deriva automáticamente de los modelos Honda con patentamientos en el último corte estructural disponible de la Pivot.</p></div>${badge(`${active} ACTIVOS`,'green')}</div>${v33hondaLineupTable(segment)}<div class="note"><b>Fuente:</b> Pivot / tabla maestra.</div></section>`;
    };
  }
  return true;
}

function v39injectOverview(){
  try{
    if(typeof state==='undefined'||state.view!=='overview'||typeof DATA==='undefined'||!DATA)return;
    const content=document.querySelector('#content');if(!content||content.querySelector('[data-v39-history]'))return;
    const block=v39historicalRecordsBlock();if(!block)return;
    const kpis=content.querySelector('.kpis');
    if(kpis)kpis.insertAdjacentHTML('afterend',block);else content.insertAdjacentHTML('afterbegin',block);
  }catch(e){console.error('v39 historical rankings injection',e)}
}
function v39installRenderHook(){
  if(typeof render!=='function'||render.__v39HistoryHook)return false;
  const base=render;
  const wrapped=function(...args){const result=base.apply(this,args);v39injectOverview();setTimeout(v39injectOverview,0);return result};
  wrapped.__v39HistoryHook=true;render=wrapped;return true;
}

(function v39boot(){
  let attempts=0;
  const ready=()=>{
    attempts++;
    const lineup=v39installPivotLineup();
    const hook=v39installRenderHook();
    if(typeof DATA!=='undefined'&&DATA){v39injectOverview();try{if(hook)render()}catch(e){console.error('v39 render',e)}}
    if((!lineup&&typeof v33segmentHondaEntries==='function')||(!hook&&typeof render!=='function')){if(attempts<100)setTimeout(ready,100)}
  };
  ready();
})();
