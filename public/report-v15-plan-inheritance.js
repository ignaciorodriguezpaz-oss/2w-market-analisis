/* 2W Market Analysis v15 — Plan User inheritance: blank = previous plan */
const V15_VERSION='20261007-plan-inheritance-fix-active-stage';
const V15_BASE_USERBLOCK=userBlock;

v8effectivePlan=function(){
  const ind=v8independent(),curModel=ind[0];
  let anchored=false,market=curModel.base,honda=curModel.hondaBase,share=honda/market;

  const stages=V8_STAGE_KEYS.map(key=>{
    const em=v8explicit(key,'market'),eh=v8explicit(key,'honda');
    if(em||eh){
      anchored=true;
      // A blank field always keeps the previous effective plan value.
      if(em)market=em;
      if(eh)honda=eh;
      share=market?honda/market:share;
    }else if(!anchored){
      market=curModel.base;honda=curModel.hondaBase;share=curModel.hondaShare;
    }
    return {
      id:key,ki:V8_CURRENT_KI,label:V8_STAGE_LABELS[key],
      market:Math.round(market),honda:Math.round(honda),share,
      explicit:!!(em||eh),
      inherited:anchored&&!(em||eh),
      mode:(em||eh)?'USER INPUT':anchored?'AUTO · PLAN ANTERIOR':'AUTO · FCST'
    };
  });

  const future=V8_OB_YEARS.map((ki,i)=>{
    const model=ind[i+1],em=v8explicit(ki,'market'),eh=v8explicit(ki,'honda');
    if(em||eh){
      anchored=true;
      // Same rule in OB: only the field entered changes; the blank field inherits.
      if(em)market=em;
      if(eh)honda=eh;
      share=market?honda/market:share;
    }else if(!anchored){
      market=model.base;honda=model.hondaBase;share=model.hondaShare;
    }
    // If a previous User Plan exists and this row is blank, carry it forward exactly.
    return {
      id:ki,ki,label:`OB ${ki}`,
      market:Math.round(market),honda:Math.round(honda),share,
      explicit:!!(em||eh),
      inherited:anchored&&!(em||eh),
      mode:(em||eh)?'USER INPUT':anchored?'AUTO · PLAN ANTERIOR':'AUTO · FCST'
    };
  });

  // Preserve the Honda Apr–Mar quarter logic introduced in v9.
  // At the current Sep-26 close, 2Q FCST is the active revision.
  const activeKey=typeof v9activeStageKey==='function'?v9activeStageKey():'3QFCST';
  const active=stages.find(x=>x.id===activeKey)||stages.at(-1);
  return {ind,stages,future,active,activeKey,all:[...stages,...future]};
};

userBlock=function(){
  const html=V15_BASE_USERBLOCK();
  return html.replace(
    'Una celda vacía hereda el último plan; si nunca cargaste nada usa mi FCST. En OB, el último valor que ingresaste se transforma en el nuevo ancla para los años siguientes.',
    'Una celda vacía hereda exactamente el último Plan User cargado. Si cargás sólo Mercado o sólo Honda, el otro valor también se conserva. Recién si nunca existió un Plan User se usa el FCST independiente como referencia inicial.'
  );
};

(function v15boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v8syncActive==='function'){
      v8syncActive();render();
    }else setTimeout(ready,100);
  };
  ready();
})();
