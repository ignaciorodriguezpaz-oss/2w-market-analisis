/* 2W Market Analysis v39 — historical records 2010+ + Pivot-driven active lineup */
const V39_VERSION='20261008-historical-records-pivot-lineup-v1';

function v39num(v){return Number(v)||0}
function v39hist(){
  return (DATA?.market_history||[])
    .filter(r=>r?.period&&r.period>='2010-01'&&Number.isFinite(Number(r.value)))
    .map(r=>({...r,value:v39num(r.value)}))
    .sort((a,b)=>a.period.localeCompare(b.period));
}
function v39max(rows){
  return (rows||[]).reduce((best,r)=>!best||v39num(r.value)>v39num(best.value)?r:best,null);
}
function v39yearMonth(period){
  const [y,m]=String(period||'').split('-').map(Number);return {y,m};
}
function v39monthName(m){return ['ENE','FEB','MAR','ABR','MAY','JUN','JUL','AGO','SEP','OCT','NOV','DIC'][m-1]||''}
function v39rank(current,rows){return 1+(rows||[]).filter(r=>v39num(r.value)>v39num(current)).length}
function v39gapText(current,record){
  if(!record?.value)return 'sin benchmark';
  const diff=v39num(current)-v39num(record.value),ratio=diff/v39num(record.value);
  return `${diff>=0?'+':'−'}${fmt(Math.abs(diff))} · ${diff>=0?'+':'−'}${Math.abs(ratio*100).toFixed(1).replace('.',',')}%`;
}
function v39recordState(current,record){
  if(!record)return {tone:'amber',status:'SIN HISTORIA',detail:'Sin benchmark completo'};
  if(v39num(current)>v39num(record.value))return {tone:'green',status:'NUEVO RÉCORD',detail:`Anterior récord: ${record.label} · ${fmt(record.value)} · superado ${v39gapText(current,record)}`};
  if(v39num(current)===v39num(record.value))return {tone:'green',status:'IGUALA RÉCORD',detail:`Récord previo: ${record.label} · ${fmt(record.value)}`};
  return {tone:'amber',status:'BAJO RÉCORD',detail:`Récord vigente: ${record.label} · ${fmt(record.value)} · gap ${v39gapText(current,record)}`};
}

function v39sameMonthBenchmark(){
  const h=v39hist(),latest=h.at(-1);if(!latest)return null;
  const {y,m}=v39yearMonth(latest.period);
  const prior=h.filter(r=>{const p=v39yearMonth(r.period);return p.m===m&&p.y<y}).map(r=>({...r,label:`${v39monthName(m)} ${v39yearMonth(r.period).y}`}));
  const record=v39max(prior),rank=v39rank(latest.value,prior);
  return {name:`${v39monthName(m)} ${y}`,scope:'MES VS MISMO MES',value:latest.value,record,rank};
}
function v39allTimeMonthBenchmark(){
  const h=v39hist(),latest=h.at(-1);if(!latest)return null;
  const prior=h.slice(0,-1).map(r=>({...r,label:`${v39monthName(v39yearMonth(r.period).m)} ${v39yearMonth(r.period).y}`}));
  const record=v39max(prior),rank=v39rank(latest.value,prior);
  return {name:'Último mes vs todos los meses',scope:'RÉCORD MENSUAL ABSOLUTO',value:latest.value,record,rank};
}
function v39ytdBenchmark(){
  const h=v39hist(),latest=h.at(-1);if(!latest)return null;
  const {y,m}=v39yearMonth(latest.period);
  const currentRows=h.filter(r=>{const p=v39yearMonth(r.period);return p.y===y&&p.m<=m});
  const current=v39num(currentRows.reduce((s,r)=>s+r.value,0));
  const prior=[];
  for(let yr=2010;yr<y;yr++){
    const rows=h.filter(r=>{const p=v39yearMonth(r.period);return p.y===yr&&p.m<=m});
    if(rows.length===m)prior.push({label:`ENE–${v39monthName(m)} ${yr}`,value:v39num(rows.reduce((s,r)=>s+r.value,0))});
  }
  const record=v39max(prior),rank=v39rank(current,prior);
  return {name:`YTD ${y}`,scope:`ENE–${v39monthName(m)} VS MISMO PERÍODO`,value:current,record,rank};
}
function v39rolling12Benchmark(){
  const h=v39hist();if(h.length<12)return null;
  const rolls=[];
  for(let i=11;i<h.length;i++){
    const value=v39num(h.slice(i-11,i+1).reduce((s,r)=>s+r.value,0));
    const p=v39yearMonth(h[i].period);
    rolls.push({label:`R12 a ${v39monthName(p.m)} ${p.y}`,value,period:h[i].period});
  }
  const current=rolls.at(-1),prior=rolls.slice(0,-1),record=v39max(prior),rank=v39rank(current.value,prior);
  return {name:'Rolling 12M',scope:'R12 VS TODOS LOS R12',value:current.value,record,rank};
}
function v39kiHistory(){
  const h=v39hist(),out=[];
  for(let start=2010;start<=2025;start++){
    const rows=h.filter(r=>r.period>=`${start}-04`&&r.period<=`${start+1}-03`);
    if(rows.length===12)out.push({label:`KI ${String(start).slice(-2)}/${String(start+1).slice(-2)}`,value:v39num(rows.reduce((s,r)=>s+r.value,0)),start});
  }
  return out;
}
function v39kiBenchmark(){
  if(typeof currentKI!=='function')return null;
  const cur=currentKI(),current=v39num(cur.expected||cur.base),prior=v39kiHistory(),record=v39max(prior),rank=v39rank(current,prior);
  return {name:cur.label||'KI actual',scope:'KI ESPERADO VS KI HISTÓRICOS',value:current,record,rank,forecast:true};
}
function v39recordRow(x){
  if(!x)return '';
  const s=v39recordState(x.value,x.record);
  return `<tr><td><b>${x.name}</b><small>${x.scope}</small></td><td><b>${fmt(x.value)}</b>${x.forecast?'<small>actual + forecast</small>':'<small>actual</small>'}</td><td><b>#${x.rank}</b><small>desde 2010</small></td><td>${badge(s.status,s.tone)}<small>${s.detail}</small></td></tr>`;
}
function v39historicalRecordsBlock(){
  const rows=[v39sameMonthBenchmark(),v39allTimeMonthBenchmark(),v39ytdBenchmark(),v39rolling12Benchmark(),v39kiBenchmark()].filter(Boolean);
  if(!rows.length)return '';
  return `<section class="card v39-history-records"><div class="card-head"><div><span class="eyebrow">HISTORICAL BENCHMARK · 2010 → ACTUAL</span><h2>Actual vs récord histórico</h2><p>El resumen no se queda en MoM/YoY: ubica el dato actual dentro de toda la serie. Cuando se supera un máximo, el récord anterior queda siempre visible con el período, volumen y cuánto fue superado.</p></div>${badge('PIVOT 2010+','green')}</div><div class="table-wrap"><table class="table"><thead><tr><th>Indicador</th><th>Actual / FCST</th><th>Posición histórica</th><th>Récord histórico</th></tr></thead><tbody>${rows.map(v39recordRow).join('')}</tbody></table></div><div class="note"><b>Regla de lectura:</b> si Actual/KI marca un nuevo récord, se muestra explícitamente el <b>récord anterior</b>; si no lo supera, se muestra el récord vigente y el gap para alcanzarlo.</div></section>`;
}

/* Active lineup must be read from Pivot, not from a hand-curated planning list. */
function v39pivotHondaNames(segment){
  if(typeof v32segmentHistory!=='function'||typeof v33isHondaModel!=='function')return [];
  const hist=v32segmentHistory(segment)||[];
  for(let i=hist.length-1;i>=0;i--){
    const names=Object.entries(hist[i]?.models||{})
      .filter(([name,value])=>v39num(value)>0&&v33isHondaModel(name))
      .map(([name])=>name);
    if(names.length)return [...new Set(names)];
  }
  return [];
}
function v39installPivotLineup(){
  if(typeof v33segmentHondaEntries!=='function')return false;
  v33segmentHondaEntries=function(segment){
    return v39pivotHondaNames(segment).map(name=>({
      label:String(name).replace(/^HONDA\s+/i,''),segment,aliases:[name],model:name,dynamic:true,pivot:true
    }));
  };
  if(typeof v33hondaLineupBlock==='function'){
    v33hondaLineupBlock=function(segment){
      const entries=v33segmentHondaEntries(segment),active=entries.length;
      if(!active)return '';
      return `<section class="card v33-honda-lineup"><div class="card-head"><div><span class="eyebrow">HONDA · ACTIVE LINE UP · PIVOT</span><h2>${segment} · lineup activo según Pivot</h2><p>El lineup activo se deriva automáticamente de los modelos Honda con patentamientos en el último corte estructural disponible de la Pivot. No se usa una lista manual ni se agregan modelos futuros sin registro.</p></div>${badge(`${active} ACTIVOS`,'green')}</div>${v33hondaLineupTable(segment)}<div class="note"><b>Fuente:</b> Pivot / tabla maestra. La composición cambia automáticamente con el último período con registros del segmento.</div></section>`;
    };
  }
  return true;
}

function v39installOverview(){
  if(typeof renderOverview!=='function'||renderOverview.__v39)return false;
  const base=renderOverview;
  const wrapped=function(){
    const html=base();
    const block=v39historicalRecordsBlock();
    if(!block)return html;
    const kpiStart=html.indexOf('<section class="kpis">');
    if(kpiStart>=0){
      const close=html.indexOf('</section>',kpiStart);
      if(close>=0)return html.slice(0,close+10)+block+html.slice(close+10);
    }
    return block+html;
  };
  wrapped.__v39=true;renderOverview=wrapped;return true;
}

(function v39boot(){
  let attempts=0;
  const ready=()=>{
    attempts++;
    const a=v39installPivotLineup(),b=v39installOverview();
    if((a||typeof v33segmentHondaEntries!=='function')&&(b||renderOverview?.__v39)){
      try{if(typeof render==='function')render()}catch(e){console.error('v39 render',e)}
      return;
    }
    if(attempts<80)setTimeout(ready,100);
  };
  ready();
})();
