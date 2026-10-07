/* 2W Market Analysis v16 — Budget revision comparison PRB -> 3Q FCST */
const V16_VERSION='20261007-budget-compare';
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
  return e.stages.map(r=>({
    period:r.label,
    market:r.market,
    honda:r.honda,
    share:r.share,
    mode:r.mode,
    explicit:r.explicit,
    inherited:r.inherited
  }));
}
function v16budgetCompare(){
  const e=v8effectivePlan(),rows=v16budgetRows();
  if(!rows.length)return '';
  const first=rows[0],last=rows.at(-1),ind=e.ind?.[0]||{};
  const mDelta=v16delta(last.market,first.market),hDelta=v16delta(last.honda,first.honda),sDelta=v16pp(last.share,first.share);
  const mVsFcst=v16delta(last.market,ind.base),hVsFcst=v16delta(last.honda,ind.hondaBase),sVsFcst=v16pp(last.share,ind.hondaShare);
  const statusRows=rows.map(r=>`<tr><td><b>${r.period}</b></td><td>${fmt(r.market)}</td><td>${fmt(r.honda)}</td><td>${pct(r.share)}</td><td>${badge(r.mode,r.explicit?'purple':r.inherited?'amber':'green')}</td></tr>`).join('');
  return `<section class="card v16-budget-compare"><div class="card-head"><div><span class="eyebrow">BUDGET REVISION · PRB → 3Q FCST</span><h2>Comparativo de budgets</h2><p>Cómo fue cambiando el plan de Mercado, Honda y Market Share entre cada revisión del KI. Una revisión vacía conserva el Plan User anterior.</p></div>${badge(v9stageMeta(v9activeStageKey()).label+' VIGENTE','purple')}</div>
  <section class="kpis">
    ${kpi('Δ MERCADO vs PRB',mDelta===null?'—':pct(mDelta),`${fmt(first.market)} → ${fmt(last.market)}`,mDelta>=0?COLORS.green:COLORS.red,'BUDGET')}
    ${kpi('Δ HONDA vs PRB',hDelta===null?'—':pct(hDelta),`${fmt(first.honda)} → ${fmt(last.honda)}`,hDelta>=0?COLORS.green:COLORS.red,'BUDGET')}
    ${kpi('Δ MS vs PRB',sDelta===null?'—':pp(sDelta),`${pct(first.share)} → ${pct(last.share)}`,sDelta>=0?COLORS.green:COLORS.red,'BUDGET')}
    ${kpi('PLAN MKT vs FCST',mVsFcst===null?'—':pct(mVsFcst),`FCST ${fmt(ind.base)}`,Math.abs(mVsFcst||0)<.03?COLORS.green:COLORS.amber,'GAP')}
    ${kpi('PLAN HONDA vs FCST',hVsFcst===null?'—':pct(hVsFcst),`FCST ${fmt(ind.hondaBase)}`,Math.abs(hVsFcst||0)<.03?COLORS.green:COLORS.amber,'GAP')}
  </section>
  <div class="grid two">
    ${card('Mercado · evolución del budget','Volumen anual KI por revisión.',lineChart(rows,[{key:'market',name:'Plan Mercado',color:V3_PURPLE}],{zero:false,minValue:Math.min(...rows.map(r=>r.market))*.94,maxValue:Math.max(...rows.map(r=>r.market))*1.06}),'PRB / 1Q / 2Q / 3Q')}
    ${card('Honda · evolución del budget','Volumen Honda anual KI por revisión.',lineChart(rows,[{key:'honda',name:'Plan Honda',color:COLORS.red}],{zero:false,minValue:Math.min(...rows.map(r=>r.honda))*.94,maxValue:Math.max(...rows.map(r=>r.honda))*1.06}),'PRB / 1Q / 2Q / 3Q')}
  </div>
  ${card('Market Share · evolución del budget',`Plan vigente ${pct(last.share)} · FCST independiente ${pct(ind.hondaShare)} · gap ${sVsFcst===null?'—':pp(sVsFcst)}.`,lineChart(rows,[{key:'share',name:'MS Plan',color:COLORS.amber}],{percent:true,zero:false,minValue:Math.max(0,Math.min(...rows.map(r=>r.share))-.025),maxValue:Math.max(...rows.map(r=>r.share))+.025}),'SHARE')}
  ${card('Detalle de revisiones','Valores efectivos usados en cada revisión.',`<div class="table-wrap"><table class="table"><thead><tr><th>Revisión</th><th>Mercado</th><th>Honda</th><th>MS</th><th>Origen</th></tr></thead><tbody>${statusRows}</tbody></table></div>`,'BUDGET HISTORY')}
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
