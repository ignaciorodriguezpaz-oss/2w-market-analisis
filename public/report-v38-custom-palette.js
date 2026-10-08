/* 2W Market Analysis v38 — user-defined brand/group palette + final supply placement */
const V38_VERSION='20261008-custom-palette-v4';
const V38_BRANDS={
  GILERA:'#6D28D9',
  CORVEN:'#F97316',
  KELLER:'#B8875B',
  YAMAHA:'#38BDF8',
  KAWASAKI:'#84CC16',
  VOGE:'#8B5CF6'
};
const V38_GROUPS={
  IRAOLA:'#F97316',
  SIMPA:'#FACC15',
  'LA EMILIA':'#86EFAC'
};

/* v39 placement patch kept in the last loaded layer so the visible Forecast chapter
   replaces the old technical governance card with Supply Intelligence in-place. */
const V39_FINAL_BASE_FORECAST=typeof forecast==='function'?forecast:null;
if(V39_FINAL_BASE_FORECAST){
  forecast=function(){
    let html=V39_FINAL_BASE_FORECAST();
    let governance='';
    let supply='';
    try{governance=typeof v27forecastGovernanceBlock==='function'?v27forecastGovernanceBlock():''}catch(e){}
    try{supply=typeof v38supplyBlock==='function'?v38supplyBlock():''}catch(e){}
    if(governance&&supply&&html.includes(governance)){
      /* v38 appended Supply at the bottom. Remove that copy and put it exactly where
         the governance block was, matching the narrative shown in the UI. */
      if(html.includes(supply))html=html.replace(supply,'');
      html=html.replace(governance,supply);
    }
    return html;
  };
}

(function v38boot(){
  const ready=()=>{
    if(typeof V37_BRANDS==='undefined'||typeof COLORS==='undefined'){setTimeout(ready,80);return}
    Object.assign(V37_BRANDS,V38_BRANDS);
    Object.assign(COLORS,V38_BRANDS);
    try{Object.assign(V37_GROUP_FALLBACK,V38_GROUPS)}catch{}
    try{
      v37groupColor=function(name){
        const group=v37n(name);
        if(group==='HONDA')return V37.honda;
        if(V38_GROUPS[group])return V38_GROUPS[group];
        try{
          const rows=(typeof V3_ROLL!=='undefined'&&V3_ROLL?.brand_history)||[];
          const last=rows.at(-1)||{};
          const map=typeof V24_GROUP_BY_BRAND!=='undefined'?V24_GROUP_BY_BRAND:{};
          const candidates=Object.keys(last).filter(k=>k!=='period'&&v37n(map[k])===group).sort((a,b)=>(Number(last[b])||0)-(Number(last[a])||0));
          if(candidates.length)return v37brandColor(candidates[0])||V37_GROUP_FALLBACK[group]||null;
        }catch{}
        return V37_GROUP_FALLBACK[group]||null;
      };
    }catch{}
    try{if(typeof render==='function'&&typeof DATA!=='undefined'&&DATA)render()}catch(e){console.error('V38 palette/supply placement render',e)}
  };
  ready();
})();
