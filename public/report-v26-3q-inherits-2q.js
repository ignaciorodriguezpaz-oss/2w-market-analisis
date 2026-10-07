/* 2W Market Analysis v26 — 3Q FCST inherits 2Q FCST until each real result is loaded */
const V26_VERSION='20261007-3q-inherits-2q-until-actual';
const V26_BASE_MONTHLY_EFFECTIVE=v12monthlyEffective;

function v26sumMap(map,periods){
  return (periods||[]).reduce((s,p)=>s+(Number(map?.[p]?.value)||0),0);
}

v12monthlyEffective=function(stage,field){
  if(stage!=='3QFCST')return V26_BASE_MONTHLY_EFFECTIVE(stage,field);

  const previous=V26_BASE_MONTHLY_EFFECTIVE('2QFCST',field);
  const resultPeriods=V12_PERIODS.filter(p=>v12isResult(stage,p)); // Apr-Dec
  const planPeriods=v12planPeriods(stage); // Jan-Mar
  const out={};

  // Result zone: actual wins. Until the actual exists, preserve the last approved 2Q FCST.
  resultPeriods.forEach(p=>{
    const actual=Number(v12actual(field,p))||null;
    if(actual){
      out[p]={value:actual,mode:'RESULT',locked:true,inherited:false};
      return;
    }
    const inherited=Number(previous?.[p]?.value)||null;
    if(inherited){
      out[p]={value:inherited,mode:'2Q FCST · INHERITED',locked:true,inherited:true};
      return;
    }
    out[p]={value:null,mode:'PENDING RESULT',locked:true,inherited:false};
  });

  // 3Q plan zone: use explicit Jan-Mar inputs when present; otherwise reconcile residual to the stage total.
  const explicit=Object.fromEntries(planPeriods.map(p=>[p,v12monthlyCell(stage,field,p)]));
  const explicitSum=planPeriods.reduce((s,p)=>s+(Number(explicit[p])||0),0);
  const fixedThroughDec=v26sumMap(out,resultPeriods);
  const inheritedStageTotal=v26sumMap(previous,V12_PERIODS);
  const configuredTotal=Number(v12stageTotal(stage,field))||0;
  const effectiveTotal=configuredTotal||inheritedStageTotal;
  const blanks=planPeriods.filter(p=>!explicit[p]);
  const residual=Math.max(0,effectiveTotal-fixedThroughDec-explicitSum);
  const weightSum=blanks.reduce((s,p)=>s+v12seasonWeight(p),0)||1;

  planPeriods.forEach(p=>{
    if(explicit[p]){
      out[p]={value:Number(explicit[p]),mode:'USER INPUT',locked:false,inherited:false};
    }else{
      out[p]={value:Math.round(residual*v12seasonWeight(p)/weightSum),mode:'AUTO · 3Q',locked:false,inherited:false};
    }
  });

  return out;
};

// Make the inheritance rule visible in the Plan User editor.
const V26_BASE_STAGE_EDITOR=v12stageEditor;
v12stageEditor=function(stage){
  const html=V26_BASE_STAGE_EDITOR(stage);
  if(stage!=='3QFCST')return html;
  const note='<div class="note"><b>Regla 3Q:</b> Oct–Dic mantienen el 2Q FCST vigente hasta que se cargue el real de cada mes. Cuando entra el real, reemplaza automáticamente al 2Q heredado. No se redistribuye ese faltante hacia Ene–Mar.</div>';
  return `${html}${note}`;
};

(function v26boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v12monthlyEffective==='function'&&typeof v12stageEditor==='function'){
      try{render()}catch(e){console.error('V26 3Q inheritance render',e)}
    }else setTimeout(ready,100);
  };
  ready();
})();
