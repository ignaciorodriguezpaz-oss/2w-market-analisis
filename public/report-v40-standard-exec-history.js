/* 2W Market Analysis v40 — market + Honda historical rankings inside governed Standard Report executive summary */
const V40_VERSION='20261008-standard-exec-history-v2';
const V40_BASE_EXEC=typeof exec==='function'?exec:null;

function v40num(v){return Number(v)||0}
function v40hondaHist(){
  const map=new Map();
  try{(DATA?.honda?.history||[]).forEach(r=>{const v=Number(r.honda??r.value);if(r.period&&Number.isFinite(v)&&v>0)map.set(r.period,v)})}catch{}
  try{((typeof V3_ROLL!=='undefined'&&V3_ROLL?.brand_history)||[]).forEach(r=>{const v=Number(r.HONDA);if(r.period&&Number.isFinite(v)&&v>0)map.set(r.period,v)})}catch{}
  return [...map.entries()].map(([period,value])=>({period,value})).sort((a,b)=>a.period.localeCompare(b.period));
}
function v40max(rows){return (rows||[]).reduce((best,r)=>!best||v40num(r.value)>v40num(best.value)?r:best,null)}
function v40rank(value,rows){return 1+(rows||[]).filter(r=>v40num(r.value)>v40num(value)).length}
function v40ym(period){const [y,m]=String(period||'').split('-').map(Number);return {y,m}}
function v40month(m){return ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][m-1]||''}
function v40gap(current,record){if(!record?.value)return 'sin benchmark';const d=v40num(current)-v40num(record.value),p=d/v40num(record.value);return `${d>=0?'+':'−'}${fmt(Math.abs(d))} · ${d>=0?'+':'−'}${Math.abs(p*100).toFixed(1).replace('.',',')}%`}
function v40state(current,record){
  if(!record)return {tone:'amber',status:'SIN HISTORIA COMPLETA',detail:'No hay un período previo comparable completo en la base Honda.'};
  if(v40num(current)>v40num(record.value))return {tone:'green',status:'NUEVO RÉCORD',detail:`Récord anterior: ${record.label} · ${fmt(record.value)} · superado ${v40gap(current,record)}`};
  if(v40num(current)===v40num(record.value))return {tone:'green',status:'IGUALA RÉCORD',detail:`Récord previo: ${record.label} · ${fmt(record.value)}`};
  return {tone:'amber',status:'BAJO RÉCORD',detail:`Récord vigente: ${record.label} · ${fmt(record.value)} · gap ${v40gap(current,record)}`};
}
function v40hondaSameMonth(){
  const h=v40hondaHist(),latest=h.at(-1);if(!latest)return null;const {y,m}=v40ym(latest.period);
  const prior=h.filter(r=>{const p=v40ym(r.period);return p.m===m&&p.y<y}).map(r=>({...r,label:`${v40month(m)} ${v40ym(r.period).y}`}));
  return {name:`Honda · ${v40month(m)} ${y}`,scope:'MES VS MISMO MES',value:latest.value,record:v40max(prior),rank:v40rank(latest.value,prior)};
}
function v40hondaAllTime(){
  const h=v40hondaHist(),latest=h.at(-1);if(!latest)return null;
  const prior=h.slice(0,-1).map(r=>({...r,label:`${v40month(v40ym(r.period).m)} ${v40ym(r.period).y}`}));
  return {name:'Honda · récord mensual',scope:'ÚLTIMO CIERRE VS TODOS LOS MESES DISPONIBLES',value:latest.value,record:v40max(prior),rank:v40rank(latest.value,prior)};
}
function v40hondaR12(){
  const h=v40hondaHist();if(h.length<12)return null;const rolls=[];
  for(let i=11;i<h.length;i++){const p=v40ym(h[i].period);rolls.push({label:`R12 a ${v40month(p.m)} ${p.y}`,value:h.slice(i-11,i+1).reduce((s,r)=>s+r.value,0),period:h[i].period})}
  const current=rolls.at(-1),prior=rolls.slice(0,-1);return {name:'Honda · Rolling 12M',scope:'R12 VS R12 HISTÓRICOS DISPONIBLES',value:current.value,record:v40max(prior),rank:v40rank(current.value,prior)};
}
function v40hondaKIHistory(){
  const h=v40hondaHist(),years=[...new Set(h.map(r=>v40ym(r.period).y))],min=years.length?Math.min(...years):2026,out=[];
  for(let start=min;start<=2025;start++){
    const rows=h.filter(r=>r.period>=`${start}-04`&&r.period<=`${start+1}-03`);
    if(rows.length===12)out.push({label:`KI ${String(start).slice(-2)}/${String(start+1).slice(-2)}`,value:rows.reduce((s,r)=>s+r.value,0)});
  }
  return out;
}
function v40hondaCurrentKI(){
  const h=v40hondaHist(),actual=h.filter(r=>r.period>='2026-04'&&r.period<='2026-09').reduce((s,r)=>s+r.value,0);
  const f=(DATA?.honda?.forecast||[]).filter(r=>r.period>='2026-10'&&r.period<='2027-03').reduce((s,r)=>s+v40num(r.expected??r.base),0);
  return actual+f>0?{label:'Honda KI 26/27',value:actual+f,forecast:true}:null;
}
function v40hondaKI(){
  const cur=v40hondaCurrentKI(),prior=v40hondaKIHistory();if(!cur)return null;
  return {name:cur.label,scope:'KI ESPERADO VS KI HONDA HISTÓRICOS DISPONIBLES',value:cur.value,record:v40max(prior),rank:v40rank(cur.value,prior),forecast:true};
}
function v40hondaRecordRow(x,startLabel){
  if(!x)return '';const s=v40state(x.value,x.record);
  return `<tr><td><b>${x.name}</b><small>${x.scope}</small></td><td><b>${fmt(x.value)}</b>${x.forecast?'<small>actual + forecast</small>':'<small>actual</small>'}</td><td><b>#${x.rank}</b><small>${startLabel}</small></td><td>${badge(s.status,s.tone)}<small>${s.detail}</small></td></tr>`;
}
function v40hondaRanking(){
  const h=v40hondaHist(),latest=h.at(-1);if(!latest)return [];
  return h.map(r=>({label:`${v40month(v40ym(r.period).m)} ${v40ym(r.period).y}`,value:r.value,current:r.period===latest.period})).sort((a,b)=>b.value-a.value);
}
function v40hondaRecordsBlock(){
  const h=v40hondaHist();if(!h.length)return '';
  const rows=[v40hondaSameMonth(),v40hondaAllTime(),v40hondaR12(),v40hondaKI()].filter(Boolean),first=v40ym(h[0].period).y;
  const ranking=v40hondaRanking(),currentIndex=ranking.findIndex(r=>r.current),visible=ranking.slice(0,5);if(currentIndex>=5)visible.push(ranking[currentIndex]);
  return `<section class="v40-honda-history" data-v40-honda-history="1"><div class="card"><div class="card-head"><div><span class="eyebrow">HONDA · HISTORICAL BENCHMARK</span><h2>Récords históricos Honda</h2><p>Misma lógica del mercado aplicada a Honda: último cierre, récord mensual, Rolling 12M y KI cuando existe historia comparable suficiente.</p></div>${badge(`HONDA · DESDE ${first}`,'red')}</div><div class="table-wrap"><table class="table"><thead><tr><th>Indicador</th><th>Actual / FCST</th><th>Ranking</th><th>Récord</th></tr></thead><tbody>${rows.map(x=>v40hondaRecordRow(x,`desde ${first}`)).join('')}</tbody></table></div></div><div class="card"><div class="card-head"><div><span class="eyebrow">HONDA · RANKING MENSUAL</span><h3>Top meses Honda</h3></div></div><div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Período</th><th>Volumen</th></tr></thead><tbody>${visible.map(r=>`<tr${r.current?' style="font-weight:800"':''}><td>#${ranking.indexOf(r)+1}</td><td>${r.label}${r.current?' · ACTUAL':''}</td><td>${fmt(r.value)}</td></tr>`).join('')}</tbody></table></div></div></section>`;
}
function v40historicalBlock(){
  let market='',honda='';
  try{if(typeof v39historicalRecordsBlock==='function')market=v39historicalRecordsBlock()}catch(e){console.error('v40 market historical block',e)}
  try{honda=v40hondaRecordsBlock()}catch(e){console.error('v40 Honda historical block',e)}
  return `${market}${honda}`;
}

if(V40_BASE_EXEC){
  exec=function(...args){
    const html=V40_BASE_EXEC.apply(this,args),block=v40historicalBlock();
    if(!block||html.includes('data-v40-honda-history'))return html;
    const kpiStart=html.indexOf('<section class="kpis');
    if(kpiStart>=0){const kpiClose=html.indexOf('</section>',kpiStart);if(kpiClose>=0)return `${html.slice(0,kpiClose+10)}${block}${html.slice(kpiClose+10)}`}
    return `${html}${block}`;
  };
}

(function v40boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof render==='function'&&typeof v39historicalRecordsBlock==='function'){
      try{render()}catch(e){console.error('v40 Standard Report historical render',e)}
    }else setTimeout(ready,80);
  };ready();
})();
