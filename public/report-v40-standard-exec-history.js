/* 2W Market Analysis v40 — historical rankings inside governed Standard Report executive summary */
const V40_VERSION='20261008-standard-exec-history-v1';
const V40_BASE_EXEC=typeof exec==='function'?exec:null;

function v40historicalBlock(){
  try{
    if(typeof v39historicalRecordsBlock==='function')return v39historicalRecordsBlock();
  }catch(e){console.error('v40 historical block',e)}
  return '';
}

if(V40_BASE_EXEC){
  exec=function(...args){
    const html=V40_BASE_EXEC.apply(this,args);
    const block=v40historicalBlock();
    if(!block||html.includes('data-v39-history'))return html;

    /* Standard Report: place historical context immediately after the executive KPI strip,
       before the scenario / daily-detail blocks that follow. */
    const kpiStart=html.indexOf('<section class="kpis');
    if(kpiStart>=0){
      const kpiClose=html.indexOf('</section>',kpiStart);
      if(kpiClose>=0)return `${html.slice(0,kpiClose+10)}${block}${html.slice(kpiClose+10)}`;
    }
    return `${html}${block}`;
  };
}

(function v40boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof render==='function'&&typeof v39historicalRecordsBlock==='function'){
      try{render()}catch(e){console.error('v40 Standard Report historical render',e)}
    }else setTimeout(ready,80);
  };
  ready();
})();
