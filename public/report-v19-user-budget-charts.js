/* 2W Market Analysis v19 — budget comparison charts inside Plan User */
const V19_VERSION='20261007-user-budget-charts';
const V19_BASE_USERBLOCK=userBlock;

function v19userBudgetCharts(){
  if(typeof v16budgetRows!=='function')return '';
  const budget=v16budgetRows(),rows=budget.rows||[],baseline=budget.baseline;
  if(!rows.length||!baseline){
    return `<section class="card v19-user-budget"><div class="card-head"><div><span class="eyebrow">BUDGET COMPARISON</span><h2>Comparativo de presupuestos</h2><p>Cuando cargues el primer Plan User del KI, ese valor será el baseline y las revisiones siguientes se compararán contra él.</p></div>${badge('PENDING · USER INPUT','amber')}</div></section>`;
  }
  const current=rows.at(-1);
  const marketRows=rows.map((r,i)=>({...r,baseline:baseline.market,current:i===rows.length-1?r.market:null}));
  const hondaRows=rows.map((r,i)=>({...r,baseline:baseline.honda,current:i===rows.length-1?r.honda:null}));
  const shareRows=rows.map((r,i)=>({...r,baseline:baseline.share,current:i===rows.length-1?r.share:null}));
  const dM=v16delta(current.market,baseline.market),dH=v16delta(current.honda,baseline.honda),dS=v16pp(current.share,baseline.share);
  const activeLabel=typeof v9stageMeta==='function'?v9stageMeta(v9activeStageKey()).label:current.period;
  return `<section class="card v19-user-budget"><div class="card-head"><div><span class="eyebrow">PLAN USER · BUDGET EVOLUTION</span><h2>Plan inicial vs revisiones</h2><p>Compara exclusivamente versiones de presupuesto. Actual y forecast quedan fuera de estas curvas.</p></div>${badge(`${activeLabel} VIGENTE`,'purple')}</div>
    <section class="kpis">
      ${kpi('BASELINE',baseline.period,`${fmt(baseline.market)} Mkt · ${fmt(baseline.honda)} Honda`,V3_PURPLE,'PLAN INICIAL')}
      ${kpi('Δ MKT',dM===null?'—':pct(dM),`${fmt(baseline.market)} → ${fmt(current.market)}`,dM>=0?COLORS.green:COLORS.red,'vs PLAN INICIAL')}
      ${kpi('Δ HONDA',dH===null?'—':pct(dH),`${fmt(baseline.honda)} → ${fmt(current.honda)}`,dH>=0?COLORS.green:COLORS.red,'vs PLAN INICIAL')}
      ${kpi('Δ MS',dS===null?'—':pp(dS),`${pct(baseline.share)} → ${pct(current.share)}`,dS>=0?COLORS.green:COLORS.red,'vs PLAN INICIAL')}
    </section>
    <div class="grid two">
      ${card('Mercado · revisiones del budget','PRB / 1Q / 2Q / 3Q desde el primer plan cargado.',lineChart(marketRows,[{key:'market',name:'Plan Mercado',color:V3_PURPLE},{key:'baseline',name:'Plan inicial',color:COLORS.previous}],{zero:false,minValue:Math.min(...marketRows.map(r=>r.market))*.94,maxValue:Math.max(...marketRows.map(r=>r.market))*1.06}),'BUDGET')}
      ${card('Honda · revisiones del budget','Misma lógica, sin mezclar actuals.',lineChart(hondaRows,[{key:'honda',name:'Plan Honda',color:COLORS.red},{key:'baseline',name:'Plan inicial',color:COLORS.previous}],{zero:false,minValue:Math.min(...hondaRows.map(r=>r.honda))*.94,maxValue:Math.max(...hondaRows.map(r=>r.honda))*1.06}),'BUDGET')}
    </div>
    ${card('Market Share · revisiones del budget',`Inicial ${pct(baseline.share)} · vigente ${pct(current.share)}.`,lineChart(shareRows,[{key:'share',name:'MS Plan',color:COLORS.amber},{key:'baseline',name:'MS inicial',color:COLORS.previous}],{percent:true,zero:false,minValue:Math.max(0,Math.min(...shareRows.map(r=>r.share))-.025),maxValue:Math.max(...shareRows.map(r=>r.share))+.025}),'BUDGET SHARE')}
  </section>`;
}

userBlock=function(){
  return `${V19_BASE_USERBLOCK()}${v19userBudgetCharts()}`;
};

(function v19boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v16budgetRows==='function'&&typeof userBlock==='function')render();
    else setTimeout(ready,100);
  };
  ready();
})();
