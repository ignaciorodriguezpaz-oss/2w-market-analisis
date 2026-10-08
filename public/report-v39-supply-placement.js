/* 2W Market Analysis v39 — place Supply Intelligence exactly where legacy forecast governance was */
const V39_VERSION='20261008-supply-placement-v1';
const V39_BASE_FORECAST=typeof forecast==='function'?forecast:null;

if(V39_BASE_FORECAST){
  forecast=function(){
    let html=V39_BASE_FORECAST();
    let governance='';
    let supply='';
    try{governance=typeof v27forecastGovernanceBlock==='function'?v27forecastGovernanceBlock():''}catch(e){}
    try{supply=typeof v38supplyBlock==='function'?v38supplyBlock():''}catch(e){}

    if(governance&&supply&&html.includes(governance)){
      /* v38 originally appended Supply at the end. Remove that copy first, then replace
         the technical governance block in-place so the narrative reads Forecast -> Supply. */
      if(html.includes(supply)) html=html.replace(supply,'');
      html=html.replace(governance,supply);
      return html;
    }

    /* Fallback: do not duplicate Supply. If legacy governance cannot be found, keep the v38 output. */
    return html;
  };
}

(function v39boot(){
  const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof forecast==='function'){try{render()}catch(e){console.error('v39 supply placement',e)}}else setTimeout(ready,120)};
  ready();
})();
