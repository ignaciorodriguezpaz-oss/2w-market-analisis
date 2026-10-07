/* 2W Market Analysis v14 — UIO + saturation structural brake, PR=6 */
const V14_VERSION='20261007-uio-pr6';
const V14_BASE_MARKET_INDEPENDENT=v8marketIndependent;
const V14_BASE_FORECAST=forecast;
let V14_UIO=null;
let V14_LAST_CURVE=[];

function v14clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function v14sourceYear(ki,index,data){
  const exact=data.years?.[ki];
  if(exact)return exact;
  const keys=Object.keys(data.years||{}),last=data.years?.[keys.at(-1)]||{};
  const pop=(Number(last.population)||Number(data.initial_population_2026_27)||0)*Math.pow(1+Number(data.population_growth||0.0009),Math.max(1,index-keys.length+1));
  const mortalityRate=(Number(last.source_uio_start)>0)?Number(last.expected_deaths||0)/Number(last.source_uio_start):0.105;
  return {population:pop,source_uio_start:null,expected_deaths:null,mortality_rate:mortalityRate};
}
function v14curve(){
  const raw=V14_BASE_MARKET_INDEPENDENT();
  if(!V14_UIO||!raw?.length){V14_LAST_CURVE=raw||[];return raw||[]}
  const pr=Number(V14_UIO.pr_target)||6,capture=Number(V14_UIO.headroom_capture)||0.06,lambda=Number(V14_UIO.blend_lambda)||0.35;
  let uioStart=Number(V14_UIO.initial_uio_end_2025_26)||0;
  const out=[];
  raw.forEach((r,i)=>{
    const src=v14sourceYear(r.ki,i,V14_UIO),pop=Number(src.population)||0;
    const sourceMortalityRate=Number(src.source_uio_start)>0?Number(src.expected_deaths||0)/Number(src.source_uio_start):Number(src.mortality_rate)||0.105;
    const deaths=Math.max(0,uioStart*sourceMortalityRate);
    const saturationUIO=pop/pr;
    const headroom=Math.max(0,saturationUIO-uioStart);
    const structuralFlow=Math.max(deaths,deaths+capture*headroom);
    const weight=i===0?0:v14clamp(1-Math.exp(-lambda*i),0,0.88);
    const rawBase=Number(r.base)||0;
    const adjusted=i===0?rawBase:Math.round(rawBase*(1-weight)+structuralFlow*weight);
    const rawDownRatio=rawBase?Number(r.down||rawBase)/rawBase:0.9;
    const rawUpRatio=rawBase?Number(r.up||rawBase)/rawBase:1.1;
    const widening=Math.min(0.06,0.008*i);
    const downRatio=v14clamp(rawDownRatio-widening,0.72,0.99);
    const upRatio=v14clamp(rawUpRatio+widening,1.01,1.35);
    const down=Math.min(adjusted,Math.round(adjusted*downRatio));
    const up=Math.max(adjusted,Math.round(adjusted*upRatio));
    const uioEnd=Math.max(0,uioStart-deaths+adjusted);
    const motos1000=pop?uioEnd/pop*1000:null;
    const impliedPR=uioEnd?pop/uioEnd:null;
    out.push({...r,raw_base:rawBase,base:adjusted,down,up,uio_start:uioStart,uio_end:uioEnd,population:pop,expected_deaths:deaths,saturation_uio:saturationUIO,headroom,structural_flow:structuralFlow,structural_weight:weight,motos_per_1000:motos1000,implied_pr:impliedPR,source:`${r.source||'MODEL'} + UIO/PR6`});
    uioStart=uioEnd;
  });
  V14_LAST_CURVE=out;
  return out;
}

v8marketIndependent=function(){return v14curve()};

function v14uioBlock(){
  const rows=v14curve();
  if(!V14_UIO||!rows.length)return '';
  const first=rows[0],last=rows.at(-1),chartRows=rows.map(r=>({period:r.ki,raw:r.raw_base,adjusted:r.base,structural:Math.round(r.structural_flow)}));
  const currentPR=first.population&&first.uio_start?first.population/first.uio_start:null;
  return `<section class="card v14-uio"><div class="card-head"><div><span class="eyebrow">UIO · SATURATION · REPLACEMENT</span><h2>Freno estructural con PR = ${V14_UIO.pr_target}</h2><p>El forecast libre conserva el corto plazo; desde los KI siguientes aumenta el peso de UIO, bajas de cohortes y headroom remanente para evitar extrapolar una línea de crecimiento indefinida.</p></div>${badge('ASSUMPTION · PR 6','amber')}</div>
  <section class="kpis">${kpi('UIO START',fmt(first.uio_start),'fin KI 25/26 · source model',COLORS.actual,'UIO')}${kpi('PR ACTUAL',currentPR?currentPR.toFixed(1):'—','personas por moto en uso',COLORS.blue,'CALC')}${kpi('PR OBJETIVO','6,0',`${(1000/Number(V14_UIO.pr_target)).toFixed(1).replace('.',',')} motos / 1.000 hab.`,COLORS.amber,'ASSUMPTION')}${kpi('HEADROOM ACTUAL',fmt(first.headroom),'hasta PR 6',COLORS.green,'CALC')}${kpi('PESO ESTRUCTURAL 2031/32',pct(last.structural_weight),'crece con horizonte',COLORS.red,'MODEL')}</section>
  <div class="grid two">${card('Forecast libre vs UIO/PR6','La capa estructural curva el forecast a medida que aumenta el horizonte.',lineChart(chartRows,[{key:'raw',name:'FCST libre',color:COLORS.previous},{key:'adjusted',name:'Base con UIO/PR6',color:COLORS.red},{key:'structural',name:'Replacement + expansión estructural',color:COLORS.green}],{zero:true}),'MULTI-YEAR')}${card('Cómo entra UIO','Separa stock, reemplazo y expansión.',`<div class="decision-grid"><div><b>1</b><h3>Replacement</h3><p>Bajas esperadas de las cohortes existentes generan demanda de reposición.</p></div><div><b>2</b><h3>Expansion</h3><p>Se captura 6% anual del headroom entre UIO actual y Población/6.</p></div><div><b>3</b><h3>Saturation brake</h3><p>El peso estructural aumenta como 1−e<sup>−λh</sup>; no se aplica como corte brusco al mes corriente.</p></div></div>`,'METHODOLOGY')}</div>
  ${card('Trayectoria KI con saturación','Actuals cerrados no cambian. El UIO se actualiza año a año con ventas menos bajas esperadas.',`<div class="table-wrap"><table class="table"><thead><tr><th>KI</th><th>FCST libre</th><th>Base PR6</th><th>Structural flow</th><th>UIO fin</th><th>Motos/1.000</th><th>PR implícito</th><th>Peso UIO</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.ki}</b></td><td>${fmt(r.raw_base)}</td><td><strong>${fmt(r.base)}</strong></td><td>${fmt(r.structural_flow)}</td><td>${fmt(r.uio_end)}</td><td>${r.motos_per_1000?.toFixed(1).replace('.',',')||'—'}</td><td>${r.implied_pr?.toFixed(1).replace('.',',')||'—'}</td><td>${pct(r.structural_weight)}</td></tr>`).join('')}</tbody></table></div>`,'UIO COHORT CONTROL')}
  <div class="note"><b>Gobernanza:</b> PR 6 es una ASSUMPTION visible. UIO no se suma a patentamientos. Esta capa modifica la trayectoria KI/estructural, no los actuals cerrados ni un mes individual de forma mecánica.</div></section>`;
}

forecast=function(){return `${V14_BASE_FORECAST()}${v14uioBlock()}`};

fetch(`/data/uio-saturation-pr6.json?v=${V14_VERSION}`,{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error(`UIO PR6 HTTP ${r.status}`)))
  .then(x=>{V14_UIO=x;const ready=()=>{if(typeof DATA!=='undefined'&&DATA){render()}else setTimeout(ready,100)};ready()})
  .catch(err=>console.error('UIO saturation layer unavailable',err));
