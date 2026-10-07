/* 2W Market Analysis v18 — Analysis User scenario always comes from the date-active budget revision */
const V18_VERSION='20261007-active-budget-by-date';

function v18activeBudget(){
  const key=typeof v9activeStageKey==='function'?v9activeStageKey():'2QFCST';
  const eff=typeof v8effectivePlan==='function'?v8effectivePlan():null;
  const stage=eff?.stages?.find(r=>r.id===key)||eff?.active||null;
  const marketMonthly=typeof v12monthlyEffective==='function'?v12monthlyEffective(key,'market'):null;
  const hondaMonthly=typeof v12monthlyEffective==='function'?v12monthlyEffective(key,'honda'):null;
  return {key,meta:typeof v9stageMeta==='function'?v9stageMeta(key):null,stage,marketMonthly,hondaMonthly};
}

/* Single source of truth for every User value consumed by Analysis:
   market cutoff/date -> active revision -> monthly User path from that revision. */
syncUserScenario=function(){
  if(!DATA)return;
  const active=v18activeBudget(),stage=active.stage;

  // Annual/KI User always follows the active budget revision.
  if(stage){
    V3_PLAN.marketKI=Number(stage.market)||V3_PLAN.marketKI;
    V3_PLAN.hondaKI=Number(stage.honda)||V3_PLAN.hondaKI;
  }

  // Monthly market User follows the active revision month by month.
  (DATA.forecast?.rows||[]).forEach(r=>{
    const planned=Number(active.marketMonthly?.[r.period]?.value);
    r.user=Number.isFinite(planned)&&planned>0?Math.round(planned):Number(r.base)||0;
    r.expected=scenarioExpected(r);
  });

  // Segment User allocation must reconcile to the active monthly market User.
  (DATA.forecast?.segments||[]).forEach((r,i)=>{
    const total=Number(DATA.forecast?.rows?.[i]?.user)||Number(r.total?.base)||0;
    const alloc=applyLargestRemainder(r.segments,total);
    r.total.user=total;r.total.expected=scenarioExpected(r.total);
    r.segments.forEach(s=>{s.user=alloc[s.name];s.expected=scenarioExpected(s)});
  });

  // Honda monthly User follows the same active revision.
  (DATA.honda?.forecast||[]).forEach(r=>{
    const planned=Number(active.hondaMonthly?.[r.period]?.value);
    r.user=Number.isFinite(planned)&&planned>0?Math.round(planned):Number(r.base)||0;
    r.expected=scenarioExpected(r);
  });
};

/* Ensure Executive Summary explicitly reads the active revision for both open month and KI. */
v10scenarioRows=function(){
  const ki=v3currentKI(),active=v18activeBudget(),f=DATA.forecast?.rows?.[0]||{},openPeriod=f.period;
  const userMonth=Number(active.marketMonthly?.[openPeriod]?.value)||Number(f.user)||0;
  const userKI=Number(active.stage?.market)||Number(V3_PLAN.marketKI)||0;
  return [
    {name:'Down',tone:'amber',month:Number(f.down)||0,ki:Number(ki.down)||0,note:'stress'},
    {name:'Base',tone:'blue',month:Number(f.base)||0,ki:Number(ki.base)||0,note:'modelo'},
    {name:'Up',tone:'green',month:Number(f.up)||0,ki:Number(ki.up)||0,note:'optimista'},
    {name:'User',tone:'purple',month:userMonth,ki:userKI,note:`${active.meta?.label||active.key} vigente por fecha`}
  ];
};

(function v18boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v12monthlyEffective==='function'&&typeof v8effectivePlan==='function'){
      syncUserScenario();render();
    }else setTimeout(ready,100);
  };
  ready();
})();
