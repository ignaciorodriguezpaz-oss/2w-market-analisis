/* 2W Market Analysis v5 — corrected daily window from header dates: 26/Sep through current cutoff, with 2025 YoY reference */
const V5_DAILY_VERSION='20261007-daily-2609-0610';
function v5sumRows(rows){return (rows||[]).reduce((a,r)=>a+(Number(r?.value)||0),0)}
function v5dayLabel(dateStr){const [y,m,d]=String(dateStr||'').split('-');return `${d||'—'} ${MONTHS[(Number(m)||1)-1]||''}`.trim()}
function v5dailyStats(){
  if(!V3_DAILY)return null;
  const current=(V3_DAILY.current_window||[]).filter(r=>r.date<=V3_DAILY.current_cutoff);
  const priorAll=V3_DAILY.prior_year_window||[];
  const priorByMd=new Map(priorAll.map(r=>[String(r.date).slice(5),r]));
  let cc=0,pc=0;
  const rows=current.map(r=>{
    const py=priorByMd.get(String(r.date).slice(5));
    cc+=Number(r.value)||0;pc+=Number(py?.value)||0;
    return {period:v5dayLabel(r.date),current:cc,prior:pc,currentDaily:Number(r.value)||0,priorDaily:Number(py?.value)||0};
  });
  const octCurrent=V3_DAILY.current||current.filter(r=>String(r.date).startsWith('2026-10'));
  const cutoffMd=String(V3_DAILY.current_cutoff||'').slice(5);
  const octPrior=(V3_DAILY.prior_year_comparable||priorAll.filter(r=>String(r.date).startsWith('2025-10'))).filter(r=>String(r.date).slice(5)<=cutoffMd);
  const currentMtd=v5sumRows(octCurrent),priorMtd=v5sumRows(octPrior),currentWindow=cc,priorWindow=pc;
  const oct25=DATA?.market_history?.find(r=>r.period==='2025-10')?.value||0;
  const pace=oct25&&priorMtd?Math.round(oct25*currentMtd/priorMtd):null;
  return {rows,currentWindow,priorWindow,windowVs:v3pct(currentWindow,priorWindow),currentMtd,priorMtd,mtdVs:v3pct(currentMtd,priorMtd),pace,days:current.length,cutoff:V3_DAILY.current_cutoff};
}
v3dailyStats=v5dailyStats;
v3dailyChart=function(){
  const s=v5dailyStats();if(!s)return pending('Daily evolution','Cargando snapshot SIOMAA.');
  return lineChart(s.rows,[{key:'current',name:'2026 acumulado',color:COLORS.red},{key:'prior',name:'2025 mismas fechas',color:COLORS.previous}],{zero:true});
};

exec=function(){
  const e=DATA.executive,ki=v3currentKI(),d=v5dailyStats(),fit=v3planFit(),check=V3_DAILY?.checks||{};
  return chapter('executive','02','Resumen ejecutivo','Mes en curso, daily YoY, cierre anterior, KI, escenarios y decisión en una sola lectura.',`<section class="kpis">
  ${kpi('OCT MTD',d?fmt(d.currentMtd):'PENDING',d?`01–06 Oct · ${pct(d.mtdVs)} vs 2025`:'SIOMAA',COLORS.red,d?'FACT':'PENDING')}
  ${kpi('VENTANA 26/09→06/10',d?fmt(d.currentWindow):'PENDING',d?`${fmt(d.priorWindow)} en 2025 · ${pct(d.windowVs)} YoY`:'',COLORS.blue,d?'FACT':'PENDING')}
  ${kpi('NOWCAST PACE',d&&d.pace?fmt(d.pace):'PENDING',d?`YoY MTD aplicado al cierre Oct-25 · Base ${fmt(DATA.forecast.rows[0].base)}`:'',COLORS.green,'EARLY SIGNAL')}
  ${kpi('SEP CERRADO',fmt(e.market),`${pct(e.mom)} MoM · ${pct(e.yoy)} YoY`,COLORS.actual,'FACT')}
  ${kpi('KI 26/27 BASE',fmt(ki.base),`Down ${fmt(ki.down)} · Up ${fmt(ki.up)}`,COLORS.blue,'FORECAST')}
  ${kpi('PLAN USUARIO',fmt(V3_PLAN.marketKI),`${fmt(V3_PLAN.hondaKI)} Honda · share ${pct(fit.share)}`,V3_PURPLE,'USER INPUT')}</section>
  <div class="grid two">${card('Daily evolution 2026 vs 2025',d?`Fechas exactas de la fila 1 · corte ${d.cutoff}`:'Cargando',v3dailyChart(),'SIOMAA / SAME CALENDAR DATES')}${card('Lectura del mes abierto','El daily es señal temprana; Base no se reemplaza automáticamente.',`<div class="narrative"><h3>${d&&d.mtdVs>=0?'Octubre abre por encima del año anterior':'Octubre abre por debajo del año anterior'}</h3><p>${d?`Del 1 al 6 de octubre hay ${fmt(d.currentMtd)} unidades vs ${fmt(d.priorMtd)} en las mismas fechas de 2025 (${pct(d.mtdVs)}). En la ventana completa 26/09–06/10: ${fmt(d.currentWindow)} vs ${fmt(d.priorWindow)} (${pct(d.windowVs)}).`:'Daily pendiente.'}</p><div>${badge('BASE NO SE MUEVE AUTOMÁTICAMENTE','amber')}${badge(check.monthly_control_status==='OK'?'CONTROL OCT MTD ✓':'CONTROL PENDING',check.monthly_control_status==='OK'?'green':'amber')}</div><p class="method-note">Se preservan las fechas del encabezado y la fila TOTAL. No se vuelve a sumar el detalle por modelo. Como la ventana arranca un sábado en 2026, el comparativo principal se muestra por fecha calendario para no perder ni desplazar el 26/09.</p></div>`,'DIAGNOSIS')}</div>
  <div class="storyline"><div><b>Qué pasó</b><p>Sep cerró ${fmt(e.market)} con ${pct(e.yoy)} YoY.</p></div><div><b>Qué está pasando</b><p>Oct MTD está ${d?pct(d.mtdVs):'—'} vs las mismas fechas de 2025.</p></div><div><b>Qué mirar</b><p>Confirmar si el ritmo se sostiene antes de recalibrar Base, junto con macro, financiación y supply.</p></div></div>`)
};

market=function(){
  const hist=periodRows(DATA.market_history),last=hist.at(-1),d=v5dailyStats();const r=n=>v3avg(DATA.market_history.slice(-n).map(x=>x.value));
  return chapter('market','04','Mercado actual, Daily 2025/26 & momentum','Actual cerrado + ventana diaria exacta + rolling. MoM y YoY permanecen visibles.',`<section class="kpis">${kpi('OCT MTD',d?fmt(d.currentMtd):'PENDING',d?`${pct(d.mtdVs)} vs 01–06 Oct-25`:'',COLORS.red,'FACT')}${kpi('26/09→06/10',d?fmt(d.currentWindow):'PENDING',d?`${pct(d.windowVs)} vs misma ventana 2025`:'',COLORS.blue,'FACT')}${kpi('ROLLING 3M',fmt(r(3)),'promedio mensual',COLORS.red,'FACT')}${kpi('ROLLING 6M',fmt(r(6)),'promedio mensual',COLORS.blue,'FACT')}${kpi('ROLLING 12M',fmt(r(12)),'promedio mensual',COLORS.green,'FACT')}${kpi('ÚLTIMO YoY',pct(last.yoy),`MoM ${pct(last.mom)}`,COLORS.amber,'FACT')}</section><div class="grid two">${card('Daily cumulative',d?`26 Sep → ${v5dayLabel(d.cutoff)} · 2026 vs 2025`:'Cargando',v3dailyChart(),'OPEN WINDOW')}${card('Actual + perspectiva','El cierre histórico sigue visible antes del forecast.',lineChart(hist.slice(-18).map(x=>({...x,actual:x.value})),[{key:'actual',name:'Actual',color:COLORS.actual}],{zero:true}),'HISTORY')}</div><div class="note">Control cruzado: el archivo mensual de octubre marca ${fmt(V3_DAILY?.checks?.monthly_control_oct_2026||0)} unidades y coincide con la suma diaria 01–06/10. La referencia 2025 queda cargada hasta 15/10 para extender el comparable cuando ingresen nuevos días.</div>`)
};

fetch(`/data/daily-open-month.json?v=${V5_DAILY_VERSION}`,{cache:'no-store'}).then(r=>r.ok?r.json():null).then(d=>{if(!d)return;V3_DAILY=d;const ready=()=>{if(typeof DATA!=='undefined'&&DATA){render()}else setTimeout(ready,100)};ready()}).catch(console.error);
