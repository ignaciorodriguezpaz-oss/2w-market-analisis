/* 2W Market Analysis v35 — full-length competitive R12 using long Pivot history */
const V35_VERSION='20261008-long-r12-v1';

function v35historyRows(names,values){
  const h=window.V35_COMP_HISTORY;
  if(!h?.periods?.length)return [];
  return h.periods.map((period,i)=>{
    const row={period};
    names.forEach((name,j)=>row[name]=Number(values?.[i]?.[j])||0);
    return row;
  });
}

function v35installLongHistory(){
  const h=window.V35_COMP_HISTORY;
  if(!h?.periods?.length||typeof v34combinedChart!=='function')return false;
  const brandRows=v35historyRows(h.brands,h.brand_values);
  const groupRows=v35historyRows(h.groups,h.group_values);
  const segmentRows=v35historyRows(h.segments,h.segment_values);

  v34monthly=function(type){
    if(type==='brand')return brandRows;
    if(type==='group')return groupRows;
    if(type==='segment')return segmentRows;
    return [];
  };
  v34availableNames=function(type){
    if(type==='brand')return h.brands||[];
    if(type==='group')return h.groups||[];
    if(type==='segment')return h.segments||[];
    return [];
  };

  /* Keep the requested long view. 72 monthly observations generate 61 valid R12 points,
     so the 60M display is covered end-to-end by real Rolling 12M data. */
  try{V34_RANGE=60;localStorage.setItem('2w.r12.range','60')}catch{}
  return true;
}

(function v35boot(){
  const ready=()=>{
    if(v35installLongHistory()){
      try{if(typeof render==='function')render()}catch(e){console.error('V35 long R12 render',e)}
    }else setTimeout(ready,100);
  };
  ready();
})();
