/* Governed August-2026 import patch applied before runtime DATA is built. */
(()=>{
const AUG={
 cutoff:'2026-08-31',
 monthly:[
  {period:'2026-01',value:67691},{period:'2026-02',value:70988},{period:'2026-03',value:80881},{period:'2026-04',value:82970},
  {period:'2026-05',value:73283},{period:'2026-06',value:69707},{period:'2026-07',value:75442},{period:'2026-08',value:74713}
 ],
 brands:[
  {name:'HONDA',value:124215},{name:'KELLER',value:66679},{name:'GILERA',value:59196},{name:'ZANELLA',value:57572},{name:'CORVEN',value:43973},{name:'MOTOMEL',value:43483},{name:'MONDIAL',value:28945},{name:'THERBUSS',value:25682},{name:'BAJAJ',value:17038},{name:'IKA',value:15005},{name:'YAMAHA',value:12108},{name:'GADNIC',value:11214},{name:'KAWASAKI',value:5502},{name:'GUERRERO',value:5374},{name:'S/M',value:5244}
 ],
 models:[
  {name:'HONDA WAVE 110 S',value:62370},{name:'GILERA SMASH',value:40901},{name:'KELLER KN110/8',value:36320},{name:'ZANELLA ZB 110',value:32320},{name:'THERBUSS BLACK POWER R32M',value:25682},{name:'CORVEN ENERGY 110',value:25425},{name:'MONDIAL LD 110',value:24460},{name:'MOTOMEL B110',value:24280},{name:'KELLER KN110 8',value:14166},{name:'HONDA GLH 150',value:9776},{name:'KELLER KN150GY',value:9272},{name:'HONDA XR 150 L',value:8640},{name:'HONDA XR300L TORNADO',value:8010},{name:'MOTOMEL CG150 S2',value:7945},{name:'IKA P110 V1',value:7590}
 ],
 origins:[
  {name:'China',value:526537},{name:'India',value:42082},{name:'Z. Franca Manaos',value:10198},{name:'Tailandia',value:6378},{name:'Japón',value:3746},{name:'Indonesia',value:3095},{name:'Brasil',value:1200},{name:'Alemania',value:792},{name:'Italia',value:501},{name:'Austria',value:497}
 ],
 latest:{
  period:'2026-08',cutoff:'2026-08-31',total:74713,honda:14002,electric:9209,
  brands:[{name:'HONDA',value:14002},{name:'MOTOMEL',value:8891},{name:'CORVEN',value:7720},{name:'ZANELLA',value:6951},{name:'GILERA',value:6212},{name:'KELLER',value:4080},{name:'MONDIAL',value:3930},{name:'S/M',value:3276},{name:'IKA',value:2860},{name:'YAMAHA',value:1553},{name:'BAJAJ',value:1452},{name:'GUERRERO',value:1355}],
  models:[{name:'MOTOMEL B110',value:6676},{name:'HONDA WAVE 110 S',value:4620},{name:'CORVEN ENERGY 110',value:4530},{name:'GILERA SMASH',value:4302},{name:'ZANELLA ZB 110',value:4160},{name:'MONDIAL LD 110',value:3930},{name:'KELLER KN110/8',value:3400},{name:'HONDA BIZ 110',value:2604},{name:'IKA P110 V1',value:2300},{name:'ZANELLA ZR 150',value:1725},{name:'CORVEN TRIAX 150',value:1485},{name:'HONDA XR 150 L',value:1440},{name:'HONDA XR300L TORNADO',value:1350},{name:'MOTOMEL CX 150',value:1152},{name:'SIAM NOMAD',value:992}],
  origins:[{name:'China',value:65824},{name:'India',value:5636},{name:'Z. Franca Manaos',value:1350},{name:'Japón',value:565},{name:'Tailandia',value:455},{name:'Indonesia',value:432},{name:'Alemania',value:198},{name:'Brasil',value:100}],
  types:[{name:'IKD',value:61375},{name:'ELÉCTRICOS CBU',value:6915},{name:'CBU',value:3041},{name:'ELÉCTRICOS SKD',value:2294},{name:'SKD',value:702},{name:'CKD',value:363},{name:'SIDECAR',value:23}]
 }
};
function patch(d){
 if(!d||typeof d!=='object')return d;
 d.meta_patch={...(d.meta_patch||{}),imports_cutoff:AUG.cutoff,enriched_at:new Date().toISOString()};
 const imp=d.imports||{};
 imp.cutoff=AUG.cutoff;imp.monthly=AUG.monthly;imp.top_brands=AUG.brands;imp.top_models=AUG.models;imp.origins=AUG.origins;imp.latest_month=AUG.latest;
 imp.new_model_signals=[
  {name:'MONDIAL LD 110',units:3930,signal:'IMPORTACIÓN AGO · REVISAR PRESIÓN DE OFERTA'},
  {name:'KELLER KN110/8',units:3400,signal:'IMPORTACIÓN AGO · REVISAR PRESIÓN DE OFERTA'},
  {name:'HONDA BIZ 110',units:2604,signal:'IMPORTACIÓN AGO · ENTRADA PREVIA A LANZAMIENTO/VENTA'},
  {name:'IKA P110 V1',units:2300,signal:'IMPORTACIÓN AGO · REVISAR CRECIMIENTO'},
  {name:'ZANELLA ZR 150',units:1725,signal:'IMPORTACIÓN AGO · REVISAR STOCK FUTURO'},
  {name:'CORVEN TRIAX 150',units:1485,signal:'IMPORTACIÓN AGO · REVISAR STOCK FUTURO'},
  {name:'HONDA XR300L TORNADO',units:1350,signal:'IMPORTACIÓN AGO · ABASTECIMIENTO HONDA'},
  {name:'SIAM NOMAD',units:992,signal:'IMPORTACIÓN AGO · WATCH PRODUCTO'}
 ];
 imp.governance='Fuente: Importaciones MOTOS - AGOSTO 2026.xlsx. Bicicletas excluidas. Importaciones son señal de oferta y no se suman a patentamientos.';
 d.imports=imp;return d;
}
window.__IMPORTS_AUG_2026=AUG;
const nativeFetch=window.fetch.bind(window);
window.fetch=async function(input,init){
 const res=await nativeFetch(input,init);
 const url=typeof input==='string'?input:(input&&input.url)||'';
 if(!/\/data\/intelligence-modules\.json(?:\?|$)/.test(url)||!res.ok)return res;
 try{
  const data=patch(await res.clone().json());
  const headers=new Headers(res.headers);headers.set('content-type','application/json; charset=utf-8');headers.set('cache-control','no-store');
  return new Response(JSON.stringify(data),{status:res.status,statusText:res.statusText,headers});
 }catch{return res}
};
})();