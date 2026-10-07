/* 2W Market Analysis v23 — replace text search with governed Segment 1 / Segment 2 filters */
const V23_VERSION='20261007-model-segment1-segment2';
let V23_SEGMENTS=null;
let V23_SEG1=(()=>{try{return localStorage.getItem('2w.v23.segment1')||'ALL'}catch{return 'ALL'}})();
let V23_SEG2=(()=>{try{return localStorage.getItem('2w.v23.segment2')||'ALL'}catch{return 'ALL'}})();
const V23_BASE_META=v7fModelMeta;

function v23save(){try{localStorage.setItem('2w.v23.segment1',V23_SEG1);localStorage.setItem('2w.v23.segment2',V23_SEG2);localStorage.removeItem('2w.v13.modelQuery')}catch{}}
function v23seg(name){
  const r=V23_SEGMENTS?.[String(name||'').toUpperCase()];
  if(r)return {segment1:r[0]||'OTHERS',segment2:r[1]||'OTHERS'};
  const m=typeof V23_BASE_META==='function'?V23_BASE_META(name):{};
  return {segment1:'OTHERS',segment2:m?.segment||'SIN CLASIFICAR'};
}
function v23segValues(which){
  const vals=new Set();
  (v3names('model')||[]).forEach(n=>{const s=v23seg(n);if(s[which])vals.add(s[which])});
  return [...vals].sort((a,b)=>a.localeCompare(b,'es'));
}

v13modelFilteredNames=function(){
  return (v3names('model')||[]).filter(name=>{
    const m=V13_MODEL_META.get(name),brand=m?.brand||String(name).split(' ')[0],s=v23seg(name);
    return (V13_MODEL_BRAND==='ALL'||brand===V13_MODEL_BRAND)&&(V23_SEG1==='ALL'||s.segment1===V23_SEG1)&&(V23_SEG2==='ALL'||s.segment2===V23_SEG2);
  });
};

v13modelControls=function(){
  const brands=v13modelBrands(),s1=v23segValues('segment1'),s2=v23segValues('segment2'),count=v13modelFilteredNames().length,total=V13_MODEL_DATA?.active_count||v3names('model').length;
  return `<div class="v13-local-controls"><span>MODELOS</span>
    <label><span>MARCA</span><select id="v13ModelBrand"><option value="ALL">Todas las marcas</option>${brands.map(b=>`<option value="${b}" ${V13_MODEL_BRAND===b?'selected':''}>${b}</option>`).join('')}</select></label>
    <label><span>SEGMENTO 1</span><select id="v23Segment1"><option value="ALL">Todos</option>${s1.map(v=>`<option value="${v}" ${V23_SEG1===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <label><span>SEGMENTO 2</span><select id="v23Segment2"><option value="ALL">Todos</option>${s2.map(v=>`<option value="${v}" ${V23_SEG2===v?'selected':''}>${v}</option>`).join('')}</select></label>
    <button id="v23ModelClear">Limpiar</button><div class="v13-universe"><b>${count}</b><small>de ${total} activos</small></div></div>
    <div class="note"><b>Segmentación:</b> Segmento 1 = apertura amplia CUB / LMC / SC / FUN / ATV / Others. Segmento 2 = apertura de producto CUB / Business / On-Off / Sport / Scooter / Fun +300, etc. Podés usar cualquiera de los dos filtros por separado o combinarlos con Marca.</div>`;
};

v7fModelMeta=function(name){const b=V23_BASE_META(name),s=v23seg(name);return {...b,segment:s.segment2,segment1:s.segment1,segment2:s.segment2}};

const V23_BASE_BIND=bindSingle;
bindSingle=function(){
  V23_BASE_BIND();
  const brand=$('#v13ModelBrand'),s1=$('#v23Segment1'),s2=$('#v23Segment2'),clear=$('#v23ModelClear');
  if(brand)brand.onchange=()=>{V13_MODEL_BRAND=brand.value;v13save();render()};
  if(s1)s1.onchange=()=>{V23_SEG1=s1.value;v23save();render()};
  if(s2)s2.onchange=()=>{V23_SEG2=s2.value;v23save();render()};
  if(clear)clear.onclick=()=>{V13_MODEL_BRAND='ALL';V23_SEG1='ALL';V23_SEG2='ALL';V13_MODEL_QUERY='';v13save();v23save();render()};
};

async function v23loadSegments(){
  try{
    if(!window.V23_SEGMENTS_B64)throw new Error('segment payload missing');
    if(!('DecompressionStream' in window))throw new Error('DecompressionStream gzip no disponible');
    const bytes=Uint8Array.from(atob(window.V23_SEGMENTS_B64),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    V23_SEGMENTS=JSON.parse(await new Response(stream).text());
    render();
  }catch(err){console.error('V23 Segment 1/2 classification',err)}
}
v23loadSegments();
