/* v13 — navigation bridge between separate Analysis and Plan User sheets */
const V13_BASE_BIND_SINGLE=bindSingle;
bindSingle=function(){
  V13_BASE_BIND_SINGLE();
  $$('[data-anchor]').forEach(b=>b.onclick=()=>{
    const id=b.dataset.anchor;
    if(typeof V12_PAGE!=='undefined'&&V12_PAGE==='user'){
      v12captureMonthlyInputs();V12_PAGE='analysis';render();
      setTimeout(()=>{document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'})},30);
    }else document.getElementById(id)?.scrollIntoView({behavior:'smooth',block:'start'});
    $('#sidebar')?.classList.remove('open');
  });
};
