/* v22 — make Argentina Futuro visible in the actual single-report render */
const V22_VERSION='20261007-argentina-future-visible-v1';

if(typeof ctx==='function' && typeof v21futureBlock==='function'){
  const V22_BASE_CTX=ctx;
  ctx=function(){return `${V22_BASE_CTX()}${v21futureBlock()}`};
}

if(typeof V12_ANALYSIS_INDEX!=='undefined' && Array.isArray(V12_ANALYSIS_INDEX)){
  const exists=V12_ANALYSIS_INDEX.some(x=>x[0]==='argentina-future');
  if(!exists)V12_ANALYSIS_INDEX.splice(1,0,['argentina-future','01B','Argentina futuro']);
}

(function v22boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA){
      try{render()}catch(e){console.error('v22 Argentina Futuro render',e)}
    }else setTimeout(ready,120);
  };
  ready();
})();
