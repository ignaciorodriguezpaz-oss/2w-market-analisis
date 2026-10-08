/* Import Intelligence deep dive for the current single-report architecture */
(()=>{
const AUG={
  period:'2026-08',cutoff:'2026-08-31',total:74713,honda:14002,electric:9209,aug2025:79512,ytd2025aug:685838,
  brands:[
    {name:'HONDA',value:14002},{name:'MOTOMEL',value:8891},{name:'CORVEN',value:7720},{name:'ZANELLA',value:6951},{name:'GILERA',value:6212},{name:'KELLER',value:4080},{name:'MONDIAL',value:3930},{name:'S/M',value:3276},{name:'IKA',value:2860},{name:'YAMAHA',value:1553},{name:'BAJAJ',value:1452},{name:'GUERRERO',value:1355}
  ],
  models:[
    {name:'MOTOMEL B110',value:6676},{name:'HONDA WAVE 110 S',value:4620},{name:'CORVEN ENERGY 110',value:4530},{name:'GILERA SMASH',value:4302},{name:'ZANELLA ZB 110',value:4160},{name:'MONDIAL LD 110',value:3930},{name:'KELLER KN110/8',value:3400},{name:'HONDA BIZ 110',value:2604},{name:'IKA P110 V1',value:2300},{name:'ZANELLA ZR 150',value:1725},{name:'CORVEN TRIAX 150',value:1485},{name:'HONDA XR 150 L',value:1440},{name:'HONDA XR300L TORNADO',value:1350},{name:'MOTOMEL CX 150',value:1152},{name:'SIAM NOMAD',value:990}
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
const fmtPct=n=>Number.isFinite(Number(n))?`${Number(n)>=0?'+':''}${(Number(n)*100).toFixed(1).replace('.',',')}%`:'—';
function marketFor(period){const r=(globalThis.DATA?.market_history||[]).find(x=>x.period===period);return r?Number(r.value)||0:null}
function monthlySeries(){
  const base=(globalThis.DATA?.imports?.monthly||[]).filter(x=>String(x.period).startsWith('2026-')).map(x=>({period:x.period,imports:Number(x.value)||0}));
  const i=base.findIndex(x=>x.period===AUG.period); if(i>=0)base[i].imports=AUG.total; else base.push({period:AUG.period,imports:AUG.total});
  return base.sort((a,b)=>a.period.localeCompare(b.period)).map(x=>({...x,registrations:marketFor(x.period)}));
}
function table(rows){return `<div class="table-wrap"><table class="table"><thead><tr><th>Mes</th><th>Importaciones</th><th>Patentamientos</th><th>Gap flujo</th><th>Import / Sales</th><th>Lectura</th></tr></thead><tbody>${rows.slice().reverse().map(r=>{const g=r.registrations==null?null:r.imports-r.registrations,ratio=r.registrations?r.imports/r.registrations:null;return `<tr><td><strong>${label(r.period)}</strong></td><td>${fmt(r.imports)}</td><td>${r.registrations==null?'—':fmt(r.registrations)}</td><td>${g==null?'—':`${g>=0?'+':''}${fmt(g)}`}</td><td>${ratio==null?'—':pct(ratio-1)}</td><td>${g==null?badge('SIN MATCH','amber'):g<0?badge('ABSORCIÓN','amber'):badge('BUILD','green')}</td></tr>`}).join('')}</tbody></table></div>`}
function insights(rows){
  const prev=rows.at(-2),mom=prev?.imports?AUG.total/prev.imports-1:null,yoy=AUG.total/AUG.aug2025-1;
  const ytdImports=sum(rows,'imports'),ytdRegs=rows.reduce((a,b)=>a+(Number(b.registrations)||0),0),flow=ytdImports-ytdRegs;
  const last3=rows.slice(-3),i3=sum(last3,'imports'),r3=last3.reduce((a,b)=>a+(Number(b.registrations)||0),0),ratio3=r3?i3/r3:null;
  let streak=0;for(let i=rows.length-1;i>=0;i--){const r=rows[i];if(r.registrations!=null&&r.imports-r.registrations<0)streak++;else break}
  return {mom,yoy,ytdImports,ytdRegs,flow,ratio3,streak};
}
function renderBlock(){
  if(typeof DATA==='undefined'||typeof card!=='function'||typeof barChart!=='function'||typeof lineChart!=='function')return '';
  const rows=monthlySeries(),s=insights(rows),brands=shareRows(AUG.brands,AUG.total),models=shareRows(AUG.models,AUG.total),origins=shareRows(AUG.origins,AUG.total),types=shareRows(AUG.types,AUG.total);
  const honda=AUG.honda/AUG.total,china=AUG.origins[0].value/AUG.total,ikd=AUG.types[0].value/AUG.total,electric=AUG.electric/AUG.total;
  const currentTop=new Set((DATA.competition?.top_models||[]).map(x=>String(x.name||'').toUpperCase()));
  const watches=AUG.models.filter(x=>![...currentTop].some(n=>n.includes(x.name.toUpperCase())||x.name.toUpperCase().includes(n))).slice(0,8);
  return `<div id="importsDeepDive" class="imports-deep-dive">
    <div class="chapter-subhead"><span>IMPORT INTELLIGENCE · ACTUALIZADO ${AUG.cutoff}</span><h3>Análisis de importaciones y presión de oferta</h3><p>Importaciones se leen como señal de supply. No se suman a patentamientos.</p></div>
    <section class="kpis">${kpi('AGO IMPORTS',fmt(AUG.total),`${fmtPct(s.mom)} vs Jul · ${fmtPct(s.yoy)} YoY`,COLORS.amber,'ACTUAL')}${kpi('HONDA IMPORT SHARE',pct(honda),`${fmt(AUG.honda)} unidades`,COLORS.red,'AGO')}${kpi('ORIGEN CHINA',pct(china),`${fmt(AUG.origins[0].value)} unidades`,COLORS.green,'AGO')}${kpi('IKD',pct(ikd),`${fmt(AUG.types[0].value)} unidades`,COLORS.blue,'AGO')}${kpi('ELÉCTRICOS',pct(electric),`${fmt(AUG.electric)} unidades`, '#7c3aed','AGO')}</section>
    <div class="grid two">${card('Importaciones vs patentamientos','Evolución 2026. La brecha aproxima absorción/build de flujo, no inventario físico.',lineChart(rows,[{key:'imports',name:'Importaciones',color:COLORS.amber},{key:'registrations',name:'Patentamientos',color:COLORS.actual}],{zero:true}),'SUPPLY vs DEMAND')}${card('Lectura ejecutiva','Señales derivadas del flujo disponible.',`<div class="signals"><div class="signal"><div class="signal-top"><h3>Flujo acumulado 2026</h3>${badge(`${s.flow>=0?'+':''}${fmt(s.flow)} uds`,s.flow<0?'amber':'green')}</div><p>Importaciones menos patentamientos del período observado.</p></div><div class="signal"><div class="signal-top"><h3>Import / Sales últimos 3M</h3>${badge(s.ratio3==null?'—':pct(s.ratio3-1),s.ratio3!=null&&s.ratio3<1?'amber':'green')}</div><p>Ayuda a detectar absorción sostenida o acumulación de oferta.</p></div><div class="signal"><div class="signal-top"><h3>Meses consecutivos en absorción</h3>${badge(String(s.streak),s.streak>=3?'amber':'green')}</div><p>Meses con importaciones por debajo de patentamientos.</p></div></div>`,'EARLY WARNING')}</div>
    ${card('Detalle mensual 2026','Serie trazable con agosto incorporado.',table(rows),'MONTHLY FLOW')}
    <div class="grid two">${card('Agosto · marcas','Participación dentro de las importaciones del mes.',barChart(brands,{showShare:true,color:r=>r.name==='HONDA'?COLORS.red:COLORS.amber,limit:12}),'BRAND FLOW')}${card('Agosto · modelos','Modelos con mayor volumen de entrada.',barChart(models,{showShare:true,color:r=>String(r.name).startsWith('HONDA ')?COLORS.red:COLORS.blue,limit:15}),'MODEL FLOW')}</div>
    <div class="grid two">${card('Agosto · origen','Dependencia geográfica de la oferta.',barChart(origins,{showShare:true,color:COLORS.green,limit:8}),'COUNTRY MIX')}${card('Agosto · régimen','IKD / CBU / SKD / CKD y eléctricos separados.',barChart(types,{showShare:true,color:COLORS.actual,limit:8}),'IMPORT TYPE')}</div>
    ${card('Supply Watch · Product Planning','Entradas relevantes con presencia comercial todavía no proporcional. Señal para investigar precio, homologación, disponibilidad y primeras registraciones.',`<div class="signal-list">${watches.map(x=>`<div class="intel-row"><div>${badge('WATCH','amber')}<b>${x.name}</b><small>Importación Ago · revisar presión futura de oferta.</small></div><strong>${fmt(x.value)}</strong></div>`).join('')||'<div class="empty">Sin señales adicionales.</div>'}</div>`,'THREAT RADAR')}
  </div>`;
}
let busy=false;
function apply(){
  if(busy)return;const sec=document.getElementById('structure');if(!sec)return;const html=renderBlock();if(!html)return;
  const old=document.getElementById('importsDeepDive');if(old)old.remove();
  busy=true;sec.insertAdjacentHTML('beforeend',html);busy=false;
}
function start(){
  const content=document.getElementById('content');if(content)new MutationObserver(()=>{if(!busy)queueMicrotask(apply)}).observe(content,{childList:true,subtree:false});
  let n=0;const t=setInterval(()=>{apply();if(++n>80||document.getElementById('importsDeepDive'))clearInterval(t)},100);
  document.getElementById('refresh')?.addEventListener('click',()=>setTimeout(apply,1200));
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();