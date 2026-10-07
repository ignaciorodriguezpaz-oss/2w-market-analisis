/* 2W Market Analysis v16 — Budget revision comparison: first loaded plan is the baseline */
const V16_VERSION='20261007-budget-compare-v2';
const V16_BASE_PLANNING=planning;

function v16delta(current,base){
  const c=Number(current),b=Number(base);
  if(!Number.isFinite(c)||!Number.isFinite(b)||!b)return null;
  return c/b-1;
}
function v16pp(current,base){
  const c=Number(current),b=Number(base);
  return Number.isFinite(c)&&Number.isFinite(b)?c-b:null;
}
function v16budgetRows(){
  const e=v8effectivePlan();
  const stages=e.stages||[];
  const firstExplicitIndex=stages.findIndex(r=>r.explicit);
  if(firstExplicitIndex<0)return {rows:[],baseline:null,reason:'NO_USER_PLAN'};
  const rows=stages.slice(firstExplicitIndex).map(r=>({
    period:r.label,
    market:r.market,
    honda:r.honda,
    share:r.share,
    mode:r.mode,
    explicit:r.explicit,
    inherited:r.inherited
  }));
  return {rows,baseline:rows[0],reason:null};
}
function v16budgetCompare(){
  const e=v8effectivePlan(),budget=v16budgetRows(),rows=budget.rows;
  if(!rows.length){
    return `<section class="card v16-budget-compare"><div class="card-head"><div><span class="eyebrow">BUDGET REVISION</span><h2>Comparativo de budgets</h2><p>Todavía no hay un Plan User cargado para este KI. No uso el forecast ni los actuals como si fueran un budget.</p></div>${badge('PENDING · USER INPUT','amber')}</div><div class="note"><b>Regla:</b> el primer plan que cargues en PRB / 1Q / 2Q / 3Q será el baseline del período. Las revisiones siguientes se compararán contra ese plan original.</div></section>`;
  }
  const first=budget.baseline,last=rows.at(-1),ind=e.ind?.[0]||{};
  const actualM=typeof v3actualMarketKI==='function'?v3actualMarketKI():null;
  const actualH=typeof v3actualHondaKI==='function'?v3actualHondaKI():null;
  const actualShare=(actualM&&actualH)?actualH/actualM:null;
  const mDelta=v16delta(last.market,first.market),hDelta=v16delta(last.honda,first.honda),sDelta=v16pp(last.share,first.share);
  const mVsFcst=v16delta(last.market,ind.base),hVsFcst=v16delta(last.honda,ind.hondaBase),sVsFcst=v16pp(last.share,ind.hondaShare);
  const statusRows=rows.map((r,idx)=>`<tr><td><b>${r.period}</b>${idx===0?'<small>PLAN INICIAL · BASELINE</small>':''}</td><td>${fmt(r.market)}</td><td>${fmt(r.honda)}</td><td>${pct(r.share)}</td><td>${badge(idx===0?'PLAN INICIAL':r.mode,r.explicit?'purple':r.inherited?'amber':'green')}</td></tr>`).join('');
  return `<section class="card v16-budget-compare"><div class="card-head"><div><span class="eyebrow">BUDGET REVISION · PLAN INICIAL → REVISIÓN VIGENTE</span><h2>Comparativo de budgets</h2><p>El baseline es el primer Plan User cargado dentro del KI. Actuals y forecast se muestran sólo como referencias y nunca sustituyen al budget.</p></div>${badge(v9stageMeta(v9activeStageKey()).label+' VIGENTE','purple')}</div>
  <section class="kpis">
    ${kpi('PLAN INICIAL',first.period,`${fmt(first.market)} mercado · ${fmt(first.honda)} Honda`,V3_PURPLE,'BASELINE')}
    ${kpi('Δ MERCADO vs INICIAL',mDelta===null?'—':pct(mDelta),`${fmt(first.market)} → ${fmt(last.market)}`,mDelta>=0?COLORS.green:COLORS.red,'BUDGET')}
    ${kpi('Δ HONDA vs INICIAL',hDelta===null?'—':pct(hDelta),`${fmt(first.honda)} → ${fmt(last.honda)}`,hDelta>=0?COLORS.green:COLORS.red,'BUDGET')}
    ${kpi('Δ MS vs INICIAL',sDelta===null?'—':pp(sDelta),`${pct(first.share)} → ${pct(last.share)}`,sDelta>=0?COLORS.green:COLORS.red,'BUDGET')}
    ${kpi('ACTUAL KI',actualM?fmt(actualM):'—',actualShare?`Honda ${fmt(actualH)} · MS ${pct(actualShare)}`:'referencia de ejecución',COLORS.actual,'FACT')}
  </section>
  <div class="grid two">
    ${card('Mercado · evolución del budget','Sólo versiones de plan; el primer plan cargado es el punto de comparación.',lineChart(rows,[{key:'market',name:'Plan Mercado',color:V3_PURPLE}],{zero:false,minValue:Math.min(...rows.map(r=>r.market))*.94,maxValue:Math.max(...rows.map(r=>r.market))*1.06}),'BUDGET VERSIONS')}
    ${card('Honda · evolución del budget','Sólo versiones de plan; no mezcla actuals.',lineChart(rows,[{key:'honda',name:'Plan Honda',color:COLORS.red}],{zero:false,minValue:Math.min(...rows.map(r=>r.honda))*.94,maxValue:Math.max(...rows.map(r=>r.honda))*1.06}),'BUDGET VERSIONS')}
  </div>
  ${card('Market Share · evolución del budget',`Plan vigente ${pct(last.share)} · Plan inicial ${pct(first.share)} · FCST independiente ${pct(ind.hondaShare)}.`,lineChart(rows,[{key:'share',name:'MS Plan',color:COLORS.amber}],{percent:true,zero:false,minValue:Math.max(0,Math.min(...rows.map(r=>r.share))-.025),maxValue:Math.max(...rows.map(r=>r.share))+.025}),'SHARE')}
  <div class="grid two">
    ${card('Plan vigente vs FCST independiente','Comparación externa al budget: sirve para medir ambición, no para definir el baseline.',`<div class="decision-grid"><div><b>MKT</b><h3>${mVsFcst===null?'—':pct(mVsFcst)}</h3><p>Plan ${fmt(last.market)} vs FCST ${fmt(ind.base)}</p></div><div><b>HONDA</b><h3>${hVsFcst===null?'—':pct(hVsFcst)}</h3><p>Plan ${fmt(last.honda)} vs FCST ${fmt(ind.hondaBase)}</p></div><div><b>MS</b><h3>${sVsFcst===null?'—':pp(sVsFcst)}</h3><p>Plan ${pct(last.share)} vs FCST ${pct(ind.hondaShare)}</p></div></div>`,'PLAN vs OUTLOOK')}
    ${card('Ejecución actual vs plan vigente','Actual acumulado separado de la revisión de budget.',`<div class="decision-grid"><div><b>MKT</b><h3>${actualM?fmt(actualM):'—'}</h3><p>Actual KI acumulado</p></div><div><b>HONDA</b><h3>${actualH?fmt(actualH):'—'}</h3><p>Actual KI acumulado</p></div><div><b>MS</b><h3>${actualShare?pct(actualShare):'—'}</h3><p>Actual KI acumulado</p></div></div>`,'ACTUAL EXECUTION')}
  </div>
  ${card('Detalle de revisiones','Cada fila es una versión de plan efectiva desde el primer User Input.',`<div class="table-wrap"><table class="table"><thead><tr><th>Revisión</th><th>Mercado Plan</th><th>Honda Plan</th><th>MS Plan</th><th>Origen</th></tr></thead><tbody>${statusRows}</tbody></table></div>`,'BUDGET HISTORY')}
  </section>`;
}

planning=function(){
  return `${V16_BASE_PLANNING()}${v16budgetCompare()}`;
};

(function v16boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v8effectivePlan==='function')render();
    else setTimeout(ready,100);
  };
  ready();
})();
