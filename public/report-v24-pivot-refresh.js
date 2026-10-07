/* 2W Market Analysis v24 — refresh last 12 months from Patentamiento (68).xls */
const V24_VERSION='20261007-pivot-l12m-refresh';
let V24_PIVOT=null;

const V24_GROUP_BY_BRAND={
  HONDA:'HONDA', MOTOMEL:'LA EMILIA', SUZUKI:'LA EMILIA', BENELLI:'LA EMILIA', KEEWAY:'LA EMILIA',
  CORVEN:'IRAOLA', ZANELLA:'IRAOLA', MONDIAL:'IRAOLA', BAJAJ:'IRAOLA', CFMOTO:'IRAOLA', KAWASAKI:'IRAOLA', KYMCO:'IRAOLA',
  GILERA:'GILERA', HERO:'GILERA', VOGE:'GILERA',
  KELLER:'KELLER', IKA:'MAGNY', TVS:'MAGNY', KOVE:'MAGNY',
  YAMAHA:'YAMAHA', SIAM:'NEWSAN', GUERRERO:'GUERRERO', 'BAJAJ-GUERRERO':'GUERRERO',
  BETA:'BETA', ZONTES:'BETA', BRAVA:'BRAVA', BMW:'BMW',
  'ROYAL ENFIELD':'SIMPA', KTM:'SIMPA', 'MOTO MORINI':'SIMPA', PIAGGIO:'SIMPA', APRILIA:'SIMPA'
};

function v24norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim()}
function v24rawBrand(name){
  const s=String(name||'').trim();
  for(const b of ['ROYAL ENFIELD','MOTO MORINI','HARLEY DAVIDSON','MOTO GUZZI','MV AGUSTA']) if(s.startsWith(b+' ')) return b;
  return s.split(/\s+/)[0]||'OTHERS';
}
function v24groupForBrand(brand){return V24_GROUP_BY_BRAND[brand]||'OTHERS'}
function v24canonical(raw){
  const s=v24norm(raw);
  const rules=[
    [/^HONDA WAVE 110S/,'HONDA WAVE 110'],[/^GILERA SMASH/,'GILERA SMASH 110'],[/^KELLER KN110 8/,'KELLER CRONO 110'],
    [/^MOTOMEL B110/,'MOTOMEL BLITZ 110'],[/^MONDIAL LD 110/,'MONDIAL LD 110'],[/^ZANELLA ZB 110/,'ZANELLA ZB 110'],
    [/^MOTOMEL S2 150/,'MOTOMEL S 150'],[/^HONDA GLH 150/,'HONDA GLH150'],[/^IKA IKA P110/,'IKA P110'],
    [/^HONDA XR150L/,'HONDA XR 150'],[/^GUERRERO G110 TRIP/,'GUERRERO G 110'],[/^HONDA XR300L TORNADO/,'HONDA XR 300L'],
    [/^HONDA XR190L/,'HONDA XR 190'],[/^MOTOMEL C110 DLX/,'MOTOMEL DLX 110'],[/^HONDA CB125F TWISTER/,'HONDA CB 125'],
    [/^YAMAHA FZ S FI/,'YAMAHA FZ FI'],[/^KELLER KN150GY/,'KELLER MIRACLE 150'],[/^BAJAJ ROUSER P 150/,'BAJAJ ROUSER 150'],
    [/^BAJAJ ROUSER 125 LS/,'BAJAJ ROUSER 125'],[/^ZANELLA RX 150/,'ZANELLA RX 150'],[/^YAMAHA XTZ 125/,'YAMAHA XTZ 125'],
    [/^HONDA CB300F TWISTER/,'HONDA CB 300F'],[/^CFMOTO 450MT/,'CFMOTO 450 MT'],[/^ZANELLA DUE 125/,'ZANELLA DUE 125'],
    [/^ZANELLA DUE/,'ZANELLA DUE 110'],[/^KELLER KN150 13/,'KELLER STRATUS 150'],[/^IKA IKA S150/,'IKA S150'],
    [/^ROYAL ENFIELD HIMALAYAN 452/,'ROYAL ENFIELD HIMALAYAN 450'],[/^YAMAHA MT03 ABS/,'YAMAHA MT 03'],
    [/^GILERA VOGE DS525X/,'VOGE VOGE 525DSX'],[/^GILERA VOGE 300DS/,'VOGE VOGE 300DS'],
    [/^GILERA VOGE DS900X/,'VOGE VOGE DS 900 X'],[/^GILERA VOGE DS800X RALLY/,'VOGE DS800X RALLY'],[/^GILERA VOGE 300 RALLY/,'VOGE 300 RALLY'],
    [/^BAJAJ ROUSER NS 160/,'BAJAJ ROUSER 160'],[/^BAJAJ ROUSER NS 400 Z/,'BAJAJ ROUSER 400'],[/^BAJAJ DOMINAR D400/,'BAJAJ DOMINAR 400'],
    [/^BAJAJ ROUSER N 250/,'BAJAJ ROUSER 250'],[/^PIAGGIO VESPA VXL 150/,'PIAGGIO VESPA 150'],
    [/^TVS TVS RAIDER/,'TVS RAIDER 125'],[/^TVS TVS NEO/,'TVS NEO NX 110'],[/^GUERRERO G125 TRIP/,'GUERRERO G 125'],
    [/^GUERRERO GC150 URBAN/,'GUERRERO GC 150'],[/^GUERRERO GXL 150 TUNDRA/,'GUERRERO GXL 150']
  ];
  for(const [re,name] of rules) if(re.test(s)) return name;
  return String(raw||'').trim();
}
function v24add(row,key,period,value){if(!row[key])row[key]=0;row[key]+=Number(value)||0;row.period=period}

function v24rebuild(){
  if(!V24_PIVOT || typeof V13_MODEL_DATA==='undefined' || !V13_MODEL_DATA) return false;
  const periods=V24_PIVOT.periods||[];
  const existingMeta=new Map((V13_MODEL_DATA.active||[]).map(r=>[r[0],{brand:r[1]||'OTHERS',model:r[2]||'',group:r[3]||'OTHERS'}]));
  const agg=new Map();
  (V24_PIVOT.models||[]).forEach(r=>{
    const canonical=v24canonical(r.name), vals=(r.values||[]).map(Number);
    if(!agg.has(canonical))agg.set(canonical,new Array(periods.length).fill(0));
    const a=agg.get(canonical); vals.forEach((v,i)=>a[i]+=(Number(v)||0));
  });
  const active=[...agg.entries()].map(([name,vals])=>{
    const old=existingMeta.get(name), brand=old?.brand||v24rawBrand(name), group=old?.group||v24groupForBrand(brand);
    const model=old?.model||String(name).replace(new RegExp('^'+brand.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')+'\\s*','i'),'');
    return [name,brand,model,group,vals];
  }).sort((a,b)=>(b[4]?.at(-1)||0)-(a[4]?.at(-1)||0));
  V13_MODEL_DATA={...V13_MODEL_DATA,source:'Patentamiento (68).xls',cutoff:V24_PIVOT.cutoff,periods,active,active_count:active.length};
  V13_MODEL_META=new Map(active.map(r=>[r[0],{brand:r[1]||'OTHERS',model:r[2]||'',group:r[3]||'OTHERS'}]));
  V13_MODEL_HISTORY=periods.map((period,i)=>{const row={period};active.forEach(r=>{const v=Number(r[4]?.[i])||0;if(v)row[r[0]]=v});return row});

  const brandHistory=periods.map(period=>({period})), groupHistory=periods.map(period=>({period}));
  (V24_PIVOT.models||[]).forEach(r=>{
    const brand=v24rawBrand(r.name),group=v24groupForBrand(brand);
    (r.values||[]).forEach((v,i)=>{v24add(brandHistory[i],brand,periods[i],v);v24add(groupHistory[i],group,periods[i],v)});
  });
  const lastBrand=brandHistory.at(-1)||{},lastGroup=groupHistory.at(-1)||{};
  const brands=Object.keys(lastBrand).filter(k=>k!=='period').sort((a,b)=>(lastBrand[b]||0)-(lastBrand[a]||0));
  const groups=Object.keys(lastGroup).filter(k=>k!=='period').sort((a,b)=>(lastGroup[b]||0)-(lastGroup[a]||0));
  if(typeof V3_ROLL!=='undefined')V3_ROLL={...(V3_ROLL||{}),source:'Patentamiento (68).xls · SIOMAA structure',cutoff:V24_PIVOT.cutoff,months:periods,brands,groups,brand_history:brandHistory,group_history:groupHistory,pivot_total_sep_2026:Number(V24_PIVOT.market_total_raw?.at(-1))||0};
  return true;
}

if(typeof v6pivotTotal==='function'){
  const V24_BASE_PIVOT_TOTAL=v6pivotTotal;
  v6pivotTotal=function(period){
    const official=typeof DATA!=='undefined'&&DATA?.market_history?.find(r=>r.period===period)?.value;
    return Number(official)||V24_BASE_PIVOT_TOTAL(period);
  };
}

async function v24load(){
  try{
    if(!window.V24_PIVOT_B64)throw new Error('pivot v24 payload missing');
    if(!('DecompressionStream' in window))throw new Error('DecompressionStream gzip no disponible');
    const bytes=Uint8Array.from(atob(window.V24_PIVOT_B64),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    V24_PIVOT=JSON.parse(await new Response(stream).text());
    const apply=()=>{
      if(v24rebuild()){
        try{render()}catch(e){console.error('v24 render',e)}
      }else setTimeout(apply,120);
    };
    apply();
  }catch(err){console.error('V24 Pivot L12M refresh',err)}
}
v24load();
