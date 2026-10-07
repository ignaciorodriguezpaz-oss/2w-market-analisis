/* 2W Market Analysis v14.2 — UIO + saturation knee, PR=6 */
const V14_VERSION='20261007-uio-pr6-knee';
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

/* PR=6 is a saturation knee, not an early brake.
   - While the unconstrained path remains above PR 6, UIO does not reduce the forecast.
   - In the KI where the unconstrained path would cross PR 6, the curve bends to the volume needed to reach saturation.
   - Once saturated, sustainable flow converges to cohort replacement + population-driven expansion.
   Macro / momentum can still reduce the unconstrained forecast before PR6; saturation itself cannot. */
function v14curve(){
  const raw=V14_BASE_MARKET_INDEPENDENT();
  if(!V14_UIO||!raw?.length){V14_LAST_CURVE=raw||[];return raw||[]}
  const pr=Number(V14_UIO.pr_target)||6;
  const popGrowth=Number(V14_UIO.population_growth)||0.0009;
  let uioStart=Number(V14_UIO.initial_uio_end_2025_26)||0;
  let saturated=false;
  const out=[];

  raw.forEach((r,i)=>{
    const src=v14sourceYear(r.ki,i,V14_UIO),pop=Number(src.population)||0;
    const sourceMortalityRate=Number(src.source_uio_start)>0
      ? Number(src.expected_deaths||0)/Number(src.source_uio_start)
      : Number(src.mortality_rate)||0.105;
    const deaths=Math.max(0,uioStart*sourceMortalityRate);
    const saturationUIO=pop/pr;
    const headroom=Math.max(0,saturationUIO-uioStart);
    const rawBase=Number(r.base)||0;
    const rawUIOEnd=Math.max(0,uioStart-deaths+rawBase);
    const rawImpliedPR=rawUIOEnd?pop/rawUIOEnd:null;

    // Sales required to arrive exactly at PR6 this KI, including replacement of cohort deaths.
    const salesToPR6=Math.max(deaths, saturationUIO-(uioStart-deaths));
    // Once mature, new-unit demand is replacement plus the small expansion created by population growth.
    const populationExpansion=Math.max(0,(pop*popGrowth)/pr);
    const matureFlow=Math.max(deaths,deaths+populationExpansion);

    let adjusted=rawBase;
    let regime='PRE-SATURATION · FREE FCST';
    let structuralWeight=0;

    if(!saturated && rawImpliedPR!==null && rawImpliedPR>pr){
      // No saturation penalty before PR6.
      adjusted=rawBase;
    }else if(!saturated){
      // Knee year: bend only when the free path actually reaches/crosses PR6.
      saturated=true;
      adjusted=Math.round(Math.min(rawBase,salesToPR6));
      structuralWeight=rawBase>0?v14clamp(1-adjusted/rawBase,0,1):1;
      regime='SATURATION KNEE · PR6';
    }else{
      // After the knee, converge smoothly from the previous market level toward mature replacement flow.
      const prev=out.at(-1)?.base||matureFlow;
      const transition=0.45;
      adjusted=Math.round(prev*(1-transition)+matureFlow*transition);
      structuralWeight=1;
      regime='POST-SATURATION · REPLACEMENT';
    }

    const rawDownRatio=rawBase?Number(r.down||rawBase)/rawBase:0.9;
    const rawUpRatio=rawBase?Number(r.up||rawBase)/rawBase:1.1;
    const widening=Math.min(0.08,0.01*i);
    const downRatio=v14clamp(rawDownRatio-widening,0.72,0.99);
    const upRatio=v14clamp(rawUpRatio+widening,1.01,1.35);
    const down=Math.min(adjusted,Math.round(adjusted*downRatio));
    const up=Math.max(adjusted,Math.round(adjusted*upRatio));
    const uioEnd=Math.max(0,uioStart-deaths+adjusted);
    const motos1000=pop?uioEnd/pop*1000:null;
    const impliedPR=uioEnd?pop/uioEnd:null;

    out.push({...r,
      raw_base:rawBase,base:adjusted,down,up,
      uio_start:uioStart,uio_end:uioEnd,population:pop,expected_deaths:deaths,
      saturation_uio:saturationUIO,headroom,
      structural_flow:saturated?matureFlow:rawBase,
      sales_to_pr6:salesToPR6,mature_flow:matureFlow,
      structural_weight:structuralWeight,
      raw_implied_pr:rawImpliedPR,motos_per_1000:motos1000,implied_pr:impliedPR,
      saturation_regime:regime,
      source:`${r.source||'MODEL'} + UIO/PR6 KNEE`
    });
    uioStart=uioEnd;
  });
  V14_LAST_CURVE=out;
  return out;
}

v8marketIndependent=function(){return v14curve()};

function v14uioBlock(){
  const rows=v14curve();
  if(!V14_UIO||!rows.length)return '';
  const first=rows[0],last=rows.at(-1);
  const chartRows=rows.map(r=>({period:r.ki,raw:r.raw_base,adjusted:r.base,mature:Math.round(r.mature_flow)}));
  const currentPR=first.population&&first.uio_start?first.population/first.uio_start:null;
  const knee=rows.find(r=>r.saturation_regime==='SATURATION KNEE · PR6');
  return `<section class="card v14-uio"><div class="card-head"><div><span class="eyebrow">UIO · SATURATION · REPLACEMENT</span><h2>Curva estructural con knee en PR = ${V14_UIO.pr_target}</h2><p>UIO no desacelera el mercado antes de PR 6. La pendiente del forecast libre se conserva hasta que esa trayectoria alcanza la saturación; desde ese punto la curva converge gradualmente hacia replacement + expansión poblacional.</p></div>${badge('ASSUMPTION · PR 6','amber')}</div>
  <section class="kpis">${kpi('UIO START',fmt(first.uio_start),'fin KI 25/26 · source model',COLORS.actual,'UIO')}${kpi('PR ACTUAL',currentPR?currentPR.toFixed(1):'—','personas por moto en uso',COLORS.blue,'CALC')}${kpi('PR OBJETIVO','6,0',`${(1000/Number(V14_UIO.pr_target)).toFixed(1).replace('.',',')} motos / 1.000 hab.`,COLORS.amber,'ASSUMPTION')}${kpi('HEADROOM ACTUAL',fmt(first.headroom),'hasta PR 6',COLORS.green,'CALC')}${kpi('KNEE DE SATURACIÓN',knee?knee.ki:'Más allá del horizonte','el PR no frena antes de este punto',COLORS.red,'MODEL')}</section>
  <div class="grid two">${card('Forecast libre vs UIO/PR6','Antes del knee ambas curvas son iguales; la separación aparece recién al alcanzar PR 6.',lineChart(chartRows,[{key:'raw',name:'FCST libre',color:COLORS.previous},{key:'adjusted',name:'Base con PR6',color:COLORS.red},{key:'mature',name:'Replacement maduro',color:COLORS.green}],{zero:true}),'MULTI-YEAR')}${card('Cómo entra UIO','Saturación como límite de madurez, no como freno anticipado.',`<div class="decision-grid"><div><b>1</b><h3>Antes de PR 6</h3><p>UIO no recorta el forecast. Manda la pendiente estadística/macro del mercado.</p></div><div><b>2</b><h3>Knee en PR 6</h3><p>Cuando la trayectoria libre llegaría a saturación, se curva el crecimiento para no sobrepasar mecánicamente el parque objetivo.</p></div><div><b>3</b><h3>Después de PR 6</h3><p>El mercado converge a bajas de cohortes + expansión por crecimiento poblacional.</p></div></div>`,'METHODOLOGY')}</div>
  ${card('Trayectoria KI con saturación','Actuals cerrados no cambian. PR sólo actúa cuando la trayectoria libre llega al nivel de saturación.',`<div class="table-wrap"><table class="table"><thead><tr><th>KI</th><th>FCST libre</th><th>Base PR6</th><th>UIO fin</th><th>Motos/1.000</th><th>PR implícito</th><th>Régimen</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.ki}</b></td><td>${fmt(r.raw_base)}</td><td><strong>${fmt(r.base)}</strong></td><td>${fmt(r.uio_end)}</td><td>${r.motos_per_1000?.toFixed(1).replace('.',',')||'—'}</td><td>${r.implied_pr?.toFixed(1).replace('.',',')||'—'}</td><td>${badge(r.saturation_regime,r.saturation_regime.startsWith('PRE')?'green':r.saturation_regime.startsWith('SATURATION')?'amber':'red')}</td></tr>`).join('')}</tbody></table></div>`,'UIO COHORT CONTROL')}
  <div class="note"><b>Gobernanza:</b> PR 6 es una ASSUMPTION visible. Si el forecast libre cae antes de PR 6 por macro, crédito, momentum o producto, esa baja se conserva; lo que queda eliminado es una desaceleración causada prematuramente por la capa de saturación.</div></section>`;
}

forecast=function(){return `${V14_BASE_FORECAST()}${v14uioBlock()}`};

fetch(`/data/uio-saturation-pr6.json?v=${V14_VERSION}`,{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error(`UIO PR6 HTTP ${r.status}`)))
  .then(x=>{
    V14_UIO=x;
    if(typeof V7_MODEL!=='undefined'&&V7_MODEL?.saturation){
      V7_MODEL.saturation.selected_pr=Number(x.pr_target)||6;
      V7_MODEL.saturation.soft_brake_start_per_1000=Number(x.saturation_per_1000)||166.6666666667;
      V7_MODEL.saturation.reference_maturity_per_1000=Number(x.saturation_per_1000)||166.6666666667;
      V7_MODEL.saturation.rule='Active live assumption: PR 6 is a saturation knee. No UIO brake before the free forecast reaches PR6; after the knee the market converges toward cohort replacement plus population-driven expansion.';
    }
    const ready=()=>{if(typeof DATA!=='undefined'&&DATA){render()}else setTimeout(ready,100)};ready();
  })
  .catch(err=>console.error('UIO saturation layer unavailable',err));
