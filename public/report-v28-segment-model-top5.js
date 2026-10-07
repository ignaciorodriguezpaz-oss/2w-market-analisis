/* 2W Market Analysis v28 — model analysis by segment, Top 5 first */
const V28_VERSION='20261007-models-by-segment-top5';
let V28_SEGMENT=(()=>{try{return localStorage.getItem('2w.v28.segment')||'CUB'}catch{return 'CUB'}})();
let V28_SEGMENT_MODE=(()=>{try{return localStorage.getItem('2w.v28.mode')||'segment1'}catch{return 'segment1'}})();
function v28save(){try{localStorage.setItem('2w.v28.segment',V28_SEGMENT);localStorage.setItem('2w.v28.mode',V28_SEGMENT_MODE)}catch{}}
function v28modelSegment(name){
  if(typeof v23seg==='function')return v23seg(name);
  const m=typeof v7fModelMeta==='function'?v7fModelMeta(name):{};
  return {segment1:m?.segment1||m?.segment||'OTHERS',segment2:m?.segment2||m?.segment||'OTHERS'};
}
function v28segmentValues(mode){
  const vals=new Set();
  (typeof v3names==='function'?v3names('model'):[]).forEach(n=>{const s=v28modelSegment(n);vals.add(s[mode]||'OTHERS')});
  return [...vals].filter(Boolean).sort((a,b)=>String(a).localeCompare(String(b),'es'));
}
function v28filteredModelNames(limit=5){
  const all=typeof v3names==='function'?v3names('model'):[];
  const names=all.filter(n=>{const s=v28modelSegment(n);return (s[V28_SEGMENT_MODE]||'OTHERS')===V28_SEGMENT});
  return names.map(n=>({name:n,m:typeof v3entityMetrics==='function'?v3entityMetrics('model',n):{current:0,share:0,r3:0,r6:0,r12:0,mom:0,yoy:0,kiBase:0,f:[]}})).sort((a,b)=>b.m.current-a.m.current).slice(0,limit);
}
function v28controls(){
  const vals=v28segmentValues(V28_SEGMENT_MODE);if(!vals.includes(V28_SEGMENT))V28_SEGMENT=vals[0]||'OTHERS';
  return `<div class="v28-controls"><label><span>Filtro</span><select id="v28Mode"><option value="segment1" ${V28_SEGMENT_MODE==='segment1'?'selected':''}>Segmento 1</option><option value="segment2" ${V28_SEGMENT_MODE==='segment2'?'selected':''}>Segmento 2</option></select></label><label><span>Segmento</span><select id="v28Segment">${vals.map(v=>`<option value="${v}" ${V28_SEGMENT===v?'selected':''}>${v}</option>`).join('')}</select></label><span class="v28-chip">Top 5 inicial · drill-down mantiene Top 10/15</span></div>`;
}
function v28modelRows(){
  return v28filteredModelNames(5).map((x,i)=>{
    const meta=typeof v7fModelMeta==='function'?v7fModelMeta(x.name):{};
    const seg=v28modelSegment(x.name);
    return `<tr><td>${i+1}</td><td><b>${x.name}</b><small>${meta.brand||''}</small></td><td>${seg.segment1}</td><td>${seg.segment2}</td><td>${fmt(x.m.current)}</td><td>${pct(x.m.share)}</td><td class="${ratioTone(x.m.mom)}-txt">${pct(x.m.mom)}</td><td class="${ratioTone(x.m.yoy)}-txt">${pct(x.m.yoy)}</td><td>${fmt(x.m.r3)}</td><td>${fmt(x.m.kiBase)}</td></tr>`;
  }).join('');
}
function v28forecastChart(){
  const top=v28filteredModelNames(5),series=top.map((x,i)=>({key:x.name,name:x.name,color:x.name.includes('HONDA')?COLORS.red:V6_PALETTE?.[i%V6_PALETTE.length]||COLORS.blue}));
  const hist=(typeof v3hist==='function'?v3hist('model'):[]).slice(-9).map(r=>{const row={period:r.period};top.forEach(x=>row[x.name]=Number(r[x.name])||0);return row});
  const fut=(DATA.forecast?.rows||[]).map((r,i)=>{const row={period:r.period};top.forEach(x=>row[x.name]=Number(x.m.f?.[i]?.base)||0);return row});
  return lineChart([...hist,...fut],series,{zero:true});
}
function v28segmentModelBlock(){
  const top=v28filteredModelNames(5);
  return `<section class="card v28-segment-models"><div class="card-head"><div><span class="eyebrow">PRODUCT PLANNING · MODELOS POR SEGMENTO</span><h2>Análisis inicial Top 5 por segmento</h2><p>Elegí Segmento 1 o Segmento 2. El ranking inicial queda en Top 5 para decisión rápida; Top 10/15 sigue disponible en rankings generales.</p></div>${badge('TOP 5','green')}</div>${v28controls()}
    <div class="grid two">${card(`Top 5 · ${V28_SEGMENT}`,`Volumen, share, MoM, YoY, rolling y KI Base para ${V28_SEGMENT_MODE}.`,`<div class="table-wrap"><table class="table"><thead><tr><th>#</th><th>Modelo</th><th>Seg.1</th><th>Seg.2</th><th>Actual</th><th>MS</th><th>MoM</th><th>YoY</th><th>R3M</th><th>KI Base</th></tr></thead><tbody>${v28modelRows()||'<tr><td colspan="10">Sin modelos para este filtro</td></tr>'}</tbody></table></div>`,'SEGMENT TOP 5')}${card('Forecast Top 5 modelos','Historia reciente + Base forecast. Sirve para detectar amenaza, oportunidad y canibalización por segmento.',top.length?v28forecastChart():pending('Modelos','Sin modelos para el segmento seleccionado.'),'MODEL FCST')}</div>
    <div class="note"><b>Uso recomendado:</b> primero mirar Top 5 del segmento, luego entrar a Modelo / Product Intelligence para ficha, competencia, precio, elasticidad, forecast de volumen y share.</div></section>`;
}

if(typeof structure==='function'){
  const V28_BASE_STRUCTURE=structure;
  structure=function(){
    const html=V28_BASE_STRUCTURE();
    return html.replace('</section>',`${v28segmentModelBlock()}</section>`);
  };
}
const V28_BASE_BIND=bindSingle;
bindSingle=function(){
  V28_BASE_BIND();
  const mode=$('#v28Mode'),seg=$('#v28Segment');
  if(mode)mode.onchange=()=>{V28_SEGMENT_MODE=mode.value;V28_SEGMENT=(v28segmentValues(V28_SEGMENT_MODE)[0]||'OTHERS');v28save();render()};
  if(seg)seg.onchange=()=>{V28_SEGMENT=seg.value;v28save();render()};
};
(function v28boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof structure==='function'){try{render()}catch(e){console.error('V28 segment models render',e)}}else setTimeout(ready,100)};ready()})();
