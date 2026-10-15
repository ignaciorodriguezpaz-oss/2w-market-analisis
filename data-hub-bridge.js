/* Expose the app's lexical DATA state to isolated optional modules without changing core ownership. */
(()=>{
  try{Object.defineProperty(window,'DATA',{configurable:true,get:()=>DATA});}catch{}
  if(!document.querySelector('script[data-price-matrix-live]')){
    const s=document.createElement('script');
    s.src='/price-segment-matrix-live.js?v=20261015-1';
    s.defer=true;
    s.dataset.priceMatrixLive='1';
    document.head.appendChild(s);
  }
})();