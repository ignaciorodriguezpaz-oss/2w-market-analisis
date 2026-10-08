(()=>{
const BASE='https://ijaqabjjhsuvovtfffit.supabase.co/functions/v1/';
const KEY='sb_publishable_uCbjOGhQR-efd9Fi_6et2w_6olQoisr';
const nativeFetch=window.fetch.bind(window);
window.fetch=(input,init={})=>{
  const url=typeof input==='string'?input:input?.url||'';
  if(!String(url).startsWith(BASE))return nativeFetch(input,init);
  const headers=new Headers(init.headers||(typeof input!=='string'?input.headers:undefined)||{});
  headers.set('apikey',KEY);
  const token=window.APP_AUTH?.getAccessToken?.();if(token)headers.set('authorization',`Bearer ${token}`);
  return nativeFetch(input,{...init,headers});
};
})();