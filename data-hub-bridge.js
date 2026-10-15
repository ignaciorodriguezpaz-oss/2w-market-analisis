/* Expose the app's lexical DATA state to isolated optional modules without changing core ownership. */
(()=>{try{Object.defineProperty(window,'DATA',{configurable:true,get:()=>DATA});}catch{}})();