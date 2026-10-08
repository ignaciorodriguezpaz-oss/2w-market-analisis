/* Import Intelligence v2 — preserve existing base and append monthly updates */
(()=>{
const IMPORT_UPDATE={
  period:'2026-08',cutoff:'2026-08-31',total:74713,honda:14002,electric:9209,aug_2025:79512,ytd_2025_aug:685838,
  brands:[
    {name:'HONDA',value:14002},{name:'MOTOMEL',value:8891},{name:'CORVEN',value:7720},{name:'ZANELLA',value:6951},{name:'GILERA',value:6212},{name:'KELLER',value:4080},{name:'MONDIAL',value:3930},{name:'S/M',value:3276},{name:'IKA',value:2860},{name:'YAMAHA',value:1553},{name:'BAJAJ',value:1452},{name:'GUERRERO',value:1355}
  ],
  models:[
    {name:'MOTOMEL B110',value:6676},{name:'HONDA WAVE 110 S',value:4620},{name:'CORVEN ENERGY 110',value:4530},{name:'GILERA SMASH',value:4302},{name:'ZANELLA ZB 110',value:4160},{name:'MONDIAL LD 110',value:3930},{name:'KELLER KN110/8',value:3400},{name:'HONDA BIZ 110',value:2604},{name:'IKA P110 V1',value:2300},{name:'ZANELLA ZR 150',value:1725},{name:'CORVEN TRIAX 150',value:1485},{name:'HONDA XR 150 L',value:1440},{name:'HONDA XR300L TORNADO',value:1350},{name:'MOTOMEL CX 150',value:1152},{name:'SIAM NOMAD',value:992}
  ],
  origins:[
    {name:'China',value:65824},{name:'India',value:5636},{name:'Z. Franca Manaos',value:1350},{name:'Japón',value:565},{name:'Tailandia',value:455},{name:'Indonesia',value:432},{name:'Alemania',value:198},{name:'Brasil',value:100}
  ],
  types:[
    {name:'IKD',value:61375},{name:'ELÉCTRICOS CBU',value:6915},{name:'CBU',value:3041},{name:'ELÉCTRICOS SKD',value:2294},{name:'SKD',value:702},{name:'CKD',value:363},{name:'SIDECAR',value:23}
  ]
};
const sum=(rows,key='value')=>(rows||[]).reduce((a,b)=>a+(Number(b?.[key])||0),0);
const shareRows=(rows,total)=>rows.map(r=>({...r,share:total?Number(r.value)/total:0}));
const ratioPct=v=>Number.isFinite(Number(v))?`${(Number(v)*100).toFixed(1).replace('.',',')}%`:'—';

function patchImportBase(){
  if(typeof DATA==='undefined'||!DATA?.imports)return false;
  const imp=DATA.imports;
  if(!Array.isArray(imp.monthly))imp.monthly=[];
  const i=imp.monthly.findIndex(x=>x.period===IMPORT_UPDATE.period);
  if(i>=0)imp.monthly[i]={period:IMPORT_UPDATE.period,value:IMPORT_UPDATE.total};
  else imp.monthly.push({period:IMPORT_UPDATE.period,value:IMPORT_UPDATE.total});
  imp.monthly.sort((a,b)=>String(a.period).localeCompare(String(b.period)));
  imp.cutoff=IMPORT_UPDATE.cutoff;
  imp.latest_month=IMPORT_UPDATE;
  DATA.meta.imports_cutoff=IMPORT_UPDATE.cutoff;
  return true;
}

function importRows(imp){
  return (imp.monthly||[]).slice().sort((a,b)=>String(a.period).localeCompare(String(b.period))).map(m=>{
    const mr=(DATA.market_history||[]).find(x=>x.period===m.period);
    const registrations=Number(mr?.value)||null;
    const imports=Number(m.value)||0;
    return {period:m.period,imports,registrations,gap:registrations===null?null:imports-registrations,ratio:registrations?imports/registrations:null};
  });
}
function deficitStreak(rows){let n=0;for(let i=rows.length-1;i>=0;i--){if(Number.isFinite(rows[i].gap)&&rows[i].gap<0)n++;else break}return n}
function importTable(rows){
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Mes</th><th>Importaciones</th><th>Patentamientos</th><th>Gap flujo</th><th>Import / Sales</th><th>Lectura</th></tr></thead><tbody>${rows.slice().reverse().map(r=>`<tr><td><strong>${label(r.period)}</strong></td><td>${fmt(r.imports)}</td><td>${r.registrations===null?'—':fmt(r.registrations)}</td><td>${r.gap===null?'—':`${r.gap>=0?'+':''}${fmt(r.gap)}`}</td><td>${ratioPct(r.ratio)}</td><td>${r.gap===null?badge('SIN MATCH','amber'):r.gap<0?badge('ABSORCIÓN','amber'):badge('BUILD','green')}</td></tr>`).join('')}</tbody></table></div>`;
}

renderImports=function(){
  patchImportBase();
  const imp=DATA.imports,latest=imp.latest_month||IMPORT_UPDATE,rows=importRows(imp),current=rows.at(-1),prev=rows.at(-2);
  const ytdRows=rows.filter(r=>r.period.startsWith('2026-'));
  const ytdImports=sum(ytdRows,'imports'),ytdRegs=sum(ytdRows,'registrations'),flow=ytdImports-ytdRegs;
  const mom=prev?.imports?current.imports/prev.imports-1:null;
  const yoy=latest.aug_2025?current.imports/latest.aug_2025-1:null;
  const ytdYoy=latest.ytd_2025_aug?ytdImports/latest.ytd_2025_aug-1:null;
  const last3=ytdRows.slice(-3),ratio3=sum(last3,'registrations')?sum(last3,'imports')/sum(last3,'registrations'):null;
  const streak=deficitStreak(ytdRows);
  const hondaShare=latest.total?latest.honda/latest.total:0,electricShare=latest.total?latest.electric/latest.total:0;
  const types=shareRows(latest.types,latest.total),origins=shareRows(latest.origins,latest.total),brands=shareRows(latest.brands,latest.total);
  const ikd=types.find(x=>x.name==='IKD');
  const salesNames=new Set((DATA.competition?.top_models||[]).map(x=>norm(x.name)));
  const watches=latest.models.filter(x=>![...salesNames].some(s=>s.includes(norm(x.name))||norm(x.name).includes(s))).slice(0,8);
  const flowTone=flow<0?'amber':'green';
  return head('IMPORT INTELLIGENCE · BASE + UPDATE','Importaciones: tendencia, presión de oferta y señales por modelo','La base histórica se conserva. Cada archivo mensual agrega/reemplaza sólo el mes correspondiente; importaciones nunca se suman a patentamientos.',{tone:'green',text:`ACTUALIZADO ${latest.cutoff}`})+
  `<section class="kpis">${kpi('AGO IMPORTS',fmt(current.imports),`${pct(mom)} vs Jul · ${pct(yoy)} YoY`,COLORS.amber,'ACTUAL')}${kpi('YTD ENE–AGO',fmt(ytdImports),`${pct(ytdYoy)} vs ene–ago 2025`,COLORS.blue,'ACTUAL')}${kpi('HONDA AGO',pct(hondaShare),`${fmt(latest.honda)} unidades`,COLORS.red,'SHARE IMPORT')}${kpi('ELÉCTRICOS AGO',pct(electricShare),`${fmt(latest.electric)} unidades`,COLORS.green,'MIX')}${kpi('IKD AGO',ikd?pct(ikd.share):'—',ikd?`${fmt(ikd.value)} unidades`:'—',COLORS.actual,'RÉGIMEN')}</section>`+
  `<div class="grid two">${card('Importaciones vs patentamientos','La brecha es un proxy de absorción/build de flujo, no stock físico.',lineChart(ytdRows,[{key:'imports',name:'Importaciones',color:COLORS.amber},{key:'registrations',name:'Patentamientos',color:COLORS.actual}],{zero:true}), 'SUPPLY vs DEMAND')}${card('Lectura de supply','Indicadores derivados de la base existente + actualización agosto.',`<div class="signals"><div class="signal"><div class="signal-top"><h3>Flujo acumulado ene–ago</h3>${badge(`${flow>=0?'+':''}${fmt(flow)} uds`,flowTone)}</div><p>Importaciones menos patentamientos del período. No equivale a inventario físico sin stock inicial, exportaciones y ajustes.</p></div><div class="signal"><div class="signal-top"><h3>Import / Sales 3M</h3>${badge(ratioPct(ratio3),ratio3!==null&&ratio3<1?'amber':'green')}</div><p>Relación de los últimos tres meses disponibles; ayuda a detectar absorción sostenida o build de oferta. 100% significa importaciones iguales a patentamientos.</p></div><div class="signal"><div class="signal-top"><h3>Meses consecutivos en absorción</h3>${badge(String(streak),streak>=3?'amber':'green')}</div><p>Cuenta meses consecutivos con importaciones por debajo de patentamientos dentro de 2026.</p></div></div>`,'EARLY WARNING')}</div>`+
  card('Detalle mensual 2026','La serie enero–julio es la base existente; agosto es la actualización recién incorporada.',importTable(ytdRows),'TRACEABLE SERIES')+
  `<div class="grid two">${card('Agosto · marcas','Participación dentro de las importaciones de agosto.',barChart(brands,{showShare:true,color:r=>r.name==='HONDA'?COLORS.red:COLORS.amber,limit:12}),'LATEST MONTH')}${card('Agosto · modelos','Qué modelos están entrando con mayor volumen.',barChart(shareRows(latest.models,latest.total),{showShare:true,color:r=>String(r.name).startsWith('HONDA ')?COLORS.red:COLORS.blue,limit:15}),'MODEL FLOW')}</div>`+
  `<div class="grid two">${card('Agosto · origen','Dependencia geográfica de la oferta importada.',barChart(origins,{showShare:true,color:COLORS.green,limit:8}),'COUNTRY MIX')}${card('Agosto · régimen','IKD / CBU / SKD / CKD y eléctricos separados.',barChart(types,{showShare:true,color:COLORS.actual,limit:8}),'IMPORT TYPE')}</div>`+
  card('Señales para Product Planning','Modelos con entrada relevante que no aparecen con alta presencia en el ranking comercial actual. Es señal de oferta, no confirmación de lanzamiento.',`<div class="signal-list">${watches.map(x=>`<div class="intel-row"><div>${badge('WATCH','amber')}<b>${x.name}</b><small>Entrada Ago · revisar disponibilidad, homologación, precio y primeras registraciones.</small></div><strong>${fmt(x.value)}</strong></div>`).join('')||'<div class="empty">Sin señales adicionales.</div>'}</div>`,'SUPPLY WATCH');
};

let tries=0;
const timer=setInterval(()=>{
  tries++;
  if(patchImportBase()){
    clearInterval(timer);
    if(typeof state!=='undefined'&&state.view==='imports'&&typeof render==='function')render();
  }else if(tries>80)clearInterval(timer);
},75);
})();
