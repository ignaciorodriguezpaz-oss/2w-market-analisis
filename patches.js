function priceFor(model){return DATA.product_planning.prices.find(p=>norm(p.model).replaceAll(" ","")===norm(model).replaceAll(" ",""))}

/* 2W analysis tools loader */
(()=>{
  if(document.querySelector('script[data-model-yoy-tool]'))return;
  const s=document.createElement('script');
  s.src='/model-yoy-tool.js?v=20261013-v1';
  s.defer=true;
  s.dataset.modelYoyTool='1';
  document.head.appendChild(s);
})();
