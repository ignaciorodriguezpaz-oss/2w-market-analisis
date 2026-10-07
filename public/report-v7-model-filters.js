/* 2W Market Analysis v7F — model forecast filters by brand and segment */
const V7F_VERSION='20261007-model-filter-brand-segment';
const V7F_MODEL_META={
  'HONDA WAVE 110':{brand:'HONDA',segment:'CUB'},
  'GILERA SMASH 110':{brand:'GILERA',segment:'CUB'},
  'KELLER CRONO 110':{brand:'KELLER',segment:'CUB'},
  'MOTOMEL BLITZ 110':{brand:'MOTOMEL',segment:'CUB'},
  'MONDIAL LD 110':{brand:'MONDIAL',segment:'CUB'},
  'CORVEN ENERGY 110':{brand:'CORVEN',segment:'CUB'},
  'ZANELLA ZB 110':{brand:'ZANELLA',segment:'CUB'},
  'MOTOMEL S 150':{brand:'MOTOMEL',segment:'BUSINESS'},
  'HONDA GLH150':{brand:'HONDA',segment:'BUSINESS'},
  'IKA P110':{brand:'IKA',segment:'CUB'},
  'SIAM QU 110':{brand:'SIAM',segment:'CUB'},
  'CORVEN TRIAX 150':{brand:'CORVEN',segment:'ON/OFF <200'},
  'MOTOMEL SKUA 150':{brand:'MOTOMEL',segment:'ON/OFF <200'},
  'CORVEN MIRAGE 110':{brand:'CORVEN',segment:'CUB'},
  'HONDA XR 150':{brand:'HONDA',segment:'ON/OFF <200'},
  'GUERRERO G 110':{brand:'GUERRERO',segment:'CUB'},
  'HONDA XR 300L':{brand:'HONDA',segment:'ON/OFF ≥200'},
  'ZANELLA ZR 150':{brand:'ZANELLA',segment:'ON/OFF <200'},
  'HONDA NAVI':{brand:'HONDA',segment:'SCOOTER'},
  'HONDA XR 190':{brand:'HONDA',segment:'ON/OFF <200'},
  'GILERA SAHEL 150':{brand:'GILERA',segment:'ON/OFF <200'},
  'BAJAJ BOXER CT 100':{brand:'BAJAJ',segment:'BUSINESS'},
  'MOTOMEL DLX 110':{brand:'MOTOMEL',segment:'CUB'},
  'HONDA CB 125':{brand:'HONDA',segment:'SPORT <200'},
  'BAJAJ ROUSER 200':{brand:'BAJAJ',segment:'SPORT ≥200'}
};
let V7F_MODEL_FILTER=(()=>{try{return {...{brand:'ALL',segment:'ALL'},...JSON.parse(localStorage.getItem('2w.modelFilter')||'{}')}}catch{return {brand:'ALL',segment:'ALL'}}})();
function v7fSaveModelFilter(){try{localStorage.setItem('2w.modelFilter',JSON.stringify(V7F_MODEL_FILTER))}catch{}}
function v7fModelMeta(name){
  const fromData=V3_ROLL?.model_meta?.[name];
  if(fromData)return {brand:fromData.brand||'OTHERS',segment:fromData.honda_planning||fromData.segment||'OTHERS',...fromData};
  if(V7F_MODEL_META[name])return V7F_MODEL_META[name];
  const brand=String(name||'').split(' ')[0]||'OTHERS';
  return {brand,segment:'SIN CLASIFICAR'};
}
function v7fModelUniverse(){return (v3names('model')||[]).map(name=>({name,...v7fModelMeta(name)}))}
function v7fBrands(){return [...new Set(v7fModelUniverse().map(x=>x.brand).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'))}
function v7fSegments(){return [...new Set(v7fModelUniverse().map(x=>x.segment).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'))}
function v7fFilteredModels(){
  const last=v3hist('model').at(-1)||{};
  return v7fModelUniverse().filter(x=>(V7F_MODEL_FILTER.brand==='ALL'||x.brand===V7F_MODEL_FILTER.brand)&&(V7F_MODEL_FILTER.segment==='ALL'||x.segment===V7F_MODEL_FILTER.segment)).sort((a,b)=>(Number(last[b.name])||0)-(Number(last[a.name])||0));
}
function v7fModelFilterBar(){
  const matches=v7fFilteredModels().length;
  const brands=v7fBrands().map(v=>`<option value="${v}" ${V7F_MODEL_FILTER.brand===v?'selected':''}>${v}</option>`).join('');
  const segments=v7fSegments().map(v=>`<option value="${v}" ${V7F_MODEL_FILTER.segment===v?'selected':''}>${v}</option>`).join('');
  return `<div class="v7-model-filters"><label><span>MARCA</span><select id="v7ModelBrand"><option value="ALL" ${V7F_MODEL_FILTER.brand==='ALL'?'selected':''}>Todas las marcas</option>${brands}</select></label><label><span>SEGMENTO · HONDA PLANNING</span><select id="v7ModelSegment"><option value="ALL" ${V7F_MODEL_FILTER.segment==='ALL'?'selected':''}>Todos los segmentos</option>${segments}</select></label><button id="v7ClearModelFilters" class="v7-clear">Limpiar</button><div class="v7-match"><b>${matches}</b><span>modelos disponibles</span></div></div>`;
}

const V7F_BASE_RANKED=v4rankedNames;
v4rankedNames=function(type,limit){
  if(type!=='model')return V7F_BASE_RANKED(type,limit);
  return v7fFilteredModels().slice(0,limit).map(x=>x.name);
};

const V7F_BASE_ENTITY_BLOCK=v4entityBlock;
v4entityBlock=function(type){
  if(type!=='model')return V7F_BASE_ENTITY_BLOCK(type);
  const l=V4_LIMITS.model,names=v4rankedNames('model',l);
  const empty=names.length===0?`<div class="empty">No hay modelos para la combinación Marca + Segmento seleccionada.</div>`:'';
  return `<section class="card v4-entity v7-model-block"><div class="card-head"><div><span class="eyebrow">PIVOT MASTER · REGISTRATIONS</span><h2>Modelos</h2><p>Filtrá por marca y/o segmento. Ranking, Rolling, gráfico Volumen/MS y forecast usan exactamente el mismo universo filtrado.</p></div>${v4limitSwitch('model')}</div>${v7fModelFilterBar()}${empty||`${v6comparisonChart('model',l)}${v4rankTable('model',l)}<div class="v4-subhead"><b>Forecast modelos</b><span>Oct-26 → Mar-27 · Down/Base/Up/Plan a KI</span></div>${v4forecastTable('model',l)}`}<div class="note"><b>Segmentación:</b> Categoría Honda Planning de la Pivot maestra. Podés combinar filtros, por ejemplo HONDA + ON/OFF &lt;200, o dejar una dimensión en “Todas”.</div></section>`;
};

const V7F_BASE_BIND_SINGLE=bindSingle;
bindSingle=function(){
  V7F_BASE_BIND_SINGLE();
  const brand=$('#v7ModelBrand'),segment=$('#v7ModelSegment'),clear=$('#v7ClearModelFilters');
  if(brand)brand.onchange=()=>{V7F_MODEL_FILTER.brand=brand.value;v7fSaveModelFilter();render()};
  if(segment)segment.onchange=()=>{V7F_MODEL_FILTER.segment=segment.value;v7fSaveModelFilter();render()};
  if(clear)clear.onclick=()=>{V7F_MODEL_FILTER={brand:'ALL',segment:'ALL'};v7fSaveModelFilter();render()};
};
