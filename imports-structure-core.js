/* Embed August Import Intelligence directly into chapter 05 render output. */
(()=>{
function wrap(){
 if(typeof structure!=='function'||structure.__importsAugWrapped)return false;
 const base=structure;
 const wrapped=function(){
  const html=base();
  const A=window.__IMPORTS_AUG_2026;
  if(!A||typeof card!=='function'||typeof barChart!=='function'||typeof lineChart!=='function')return html;
  const rows=(A.monthly||[]).map(x=>{const m=(DATA.market_history||[]).find(r=>r.period===x.period);return {period:x.period,imports:x.value,registrations:m?Number(m.value)||0:null}});
  const prev=rows.at(-2),mom=prev?.imports?A.latest.total/prev.imports-1:null;
  const honda=A.latest.honda/A.latest.total,china=A.latest.origins[0].value/A.latest.total,ikd=A.latest.types[0].value/A.latest.total,elect=A.latest.electric/A.latest.total;
  const shares=(arr,total)=>arr.map(x=>({...x,share:total?x.value/total:0}));
  const flow=rows.reduce((a,r)=>a+r.imports-(Number(r.registrations)||0),0);
  const block=`<div id="importsAugCore" class="imports-deep-dive">
   <div class="chapter-subhead"><span>IMPORT INTELLIGENCE · ACTUALIZADO 31/08/2026</span><h3>Agosto ya incorporado al análisis de supply</h3><p>Fuente de Aduana cargada por el usuario. Bicicletas excluidas. Importaciones no se suman a patentamientos.</p></div>
   <section class="kpis">${kpi('AGO IMPORTS',fmt(A.latest.total),`${mom==null?'—':pct(mom)} vs Jul`,COLORS.amber,'ACTUAL')}${kpi('HONDA IMPORT SHARE',pct(honda),`${fmt(A.latest.honda)} unidades`,COLORS.red,'AGO')}${kpi('ORIGEN CHINA',pct(china),`${fmt(A.latest.origins[0].value)} unidades`,COLORS.green,'AGO')}${kpi('IKD',pct(ikd),`${fmt(A.latest.types[0].value)} unidades`,COLORS.blue,'AGO')}${kpi('ELÉCTRICOS',pct(elect),`${fmt(A.latest.electric)} unidades`,'#7c3aed','AGO')}</section>
   <div class="grid two">${card('Importaciones mensuales 2026','Serie del archivo acumulado cargado, con agosto incluido.',lineChart(rows,[{key:'imports',name:'Importaciones',color:COLORS.amber}],{zero:true}),'JAN–AUG')}${card('Agosto · top marcas','Participación sobre las 74.713 unidades de agosto.',barChart(shares(A.latest.brands,A.latest.total),{showShare:true,color:r=>r.name==='HONDA'?COLORS.red:COLORS.amber,limit:12}),'BRANDS')}</div>
   <div class="grid two">${card('Importaciones vs patentamientos','Supply vs demanda observada; la brecha no equivale a inventario físico.',lineChart(rows,[{key:'imports',name:'Importaciones',color:COLORS.amber},{key:'registrations',name:'Patentamientos',color:COLORS.actual}],{zero:true}),'FLOW')}${card('Agosto · top modelos','Modelos con mayor entrada en el último corte.',barChart(shares(A.latest.models,A.latest.total),{showShare:true,color:r=>String(r.name).startsWith('HONDA ')?COLORS.red:COLORS.blue,limit:15}),'MODELS')}</div>
   <div class="grid two">${card('Agosto · origen','Dependencia geográfica del flujo importado.',barChart(shares(A.latest.origins,A.latest.total),{showShare:true,color:COLORS.green,limit:8}),'COUNTRY MIX')}${card('Agosto · régimen','IKD / CBU / SKD / CKD y eléctricos.',barChart(shares(A.latest.types,A.latest.total),{showShare:true,color:COLORS.actual,limit:8}),'IMPORT TYPE')}</div>
   <div class="analysis-line"><b>Lectura:</b> agosto cerró en <strong>${fmt(A.latest.total)}</strong> unidades importadas; Honda explicó <strong>${pct(honda)}</strong>, China <strong>${pct(china)}</strong> del origen e IKD <strong>${pct(ikd)}</strong> del régimen. Flujo acumulado ene–ago vs patentamientos: <strong>${flow>=0?'+':''}${fmt(flow)}</strong> unidades.</div>
  </div>`;
  return html.replace(/<\/section>\s*$/,block+'</section>');
 };
 wrapped.__importsAugWrapped=true;structure=wrapped;return true;
}
if(!wrap()){
 let n=0;const t=setInterval(()=>{if(wrap()||++n>100)clearInterval(t)},25);
}
})();