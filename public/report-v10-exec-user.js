/* 2W Market Analysis v10 — executive: MoM/YoY/Daily + 4 scenarios. User Plan gets its own Apr-Mar monthly gap sheet. */
const V10_VERSION='20261007-exec-user-monthly-gap';

function v10monthLabel(period){
  const [y,m]=String(period||'').split('-');
  const names=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  return `${names[(Number(m)||1)-1]||period}-${String(y||'').slice(-2)}`;
}
function v10scenarioRows(){
  const ki=v3currentKI(),e=v8effectivePlan(),a=e.active,f=DATA.forecast?.rows?.[0]||{};
  return [
    {name:'Down',tone:'amber',month:Number(f.down)||0,ki:Number(ki.down)||0,note:'stress'},
    {name:'Base',tone:'blue',month:Number(f.base)||0,ki:Number(ki.base)||0,note:'modelo'},
    {name:'Up',tone:'green',month:Number(f.up)||0,ki:Number(ki.up)||0,note:'optimista'},
    {name:'User',tone:'purple',month:Number(f.user)||0,ki:Number(a?.market)||Number(V3_PLAN.marketKI)||0,note:v9stageMeta(e.activeKey)?.label||'plan'}
  ];
}
function v10scenarioTable(){
  const rows=v10scenarioRows();
  return `<section class="card"><div class="card-head"><div><span class="eyebrow">4 SCENARIOS · MARKET</span><h2>Down / Base / Up / User</h2><p>Mes abierto y KI completo en la misma lectura. User se compara contra el forecast independiente pero no lo modifica.</p></div>${badge('USER ≠ FCST','purple')}</div><div class="table-wrap"><table class="table"><thead><tr><th>Escenario</th><th>Mes abierto</th><th>KI 26/27</th><th>Lectura</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${badge(r.name.toUpperCase(),r.tone)}</td><td><strong>${fmt(r.month)}</strong></td><td><strong>${fmt(r.ki)}</strong></td><td><small>${r.note}</small></td></tr>`).join('')}</tbody></table></div></section>`;
}

exec=function(){
  const e=DATA.executive,ki=v3currentKI(),d=v5dailyStats(),check=V3_DAILY?.checks||{},sc=v10scenarioRows(),user=sc.find(x=>x.name==='User');
  return chapter('executive','02','Resumen ejecutivo','MoM, YoY, Daily/Open Month y los cuatro escenarios en una sola hoja ejecutiva.',`<section class="kpis">
    ${kpi('MERCADO CERRADO',fmt(e.market),'Sep-26',COLORS.actual,'FACT')}
    ${kpi('MoM',pct(e.mom),'Sep vs Ago',e.mom>=0?COLORS.green:COLORS.amber,'FACT')}
    ${kpi('YoY',pct(e.yoy),'Sep-26 vs Sep-25',e.yoy>=0?COLORS.green:COLORS.amber,'FACT')}
    ${kpi('DAILY / OCT MTD',d?fmt(d.currentMtd):'PENDING',d?`${pct(d.mtdVs)} vs mismas fechas 2025`:'SIOMAA',COLORS.red,d?'FACT':'PENDING')}
    ${kpi('VENTANA DAILY',d?fmt(d.currentWindow):'PENDING',d?`26/09 → ${v5dayLabel(d.cutoff)} · ${pct(d.windowVs)} YoY`:'',COLORS.blue,d?'FACT':'PENDING')}
    ${kpi('NOWCAST PACE',d&&d.pace?fmt(d.pace):'PENDING',`Base mes ${fmt(DATA.forecast.rows[0]?.base||0)}`,COLORS.green,'EARLY SIGNAL')}
  </section>
  ${v10scenarioTable()}
  <div class="grid two">${card('Daily evolution 2026 vs 2025',d?`Fechas exactas · corte ${d.cutoff}`:'Cargando',v3dailyChart(),'SIOMAA / SAME CALENDAR DATES')}${card('Lectura ejecutiva','Qué cambió y qué implica para el rango.',`<div class="narrative"><h3>${d&&d.mtdVs>=0?'El mes abierto sostiene una señal positiva':'El mes abierto muestra una señal más débil'}</h3><p>Sep cerró ${fmt(e.market)} (${pct(e.mom)} MoM; ${pct(e.yoy)} YoY). ${d?`Oct MTD suma ${fmt(d.currentMtd)} y está ${pct(d.mtdVs)} vs las mismas fechas de 2025.`:'El daily todavía está pendiente.'}</p><p>KI Base ${fmt(ki.base)} · Down ${fmt(ki.down)} · Up ${fmt(ki.up)} · User ${fmt(user?.ki||0)}.</p><div>${badge('BASE NO SE MUEVE SOLO POR DAILY','amber')}${badge(check.monthly_control_status==='OK'?'CONTROL MTD ✓':'CONTROL PENDING',check.monthly_control_status==='OK'?'green':'amber')}</div></div>`,'EXECUTIVE VIEW')}</div>
  <div class="storyline"><div><b>Qué pasó</b><p>MoM ${pct(e.mom)} · YoY ${pct(e.yoy)}.</p></div><div><b>Qué pasa ahora</b><p>Daily/MTD ${d?pct(d.mtdVs):'—'} vs 2025 comparable.</p></div><div><b>Qué decidir</b><p>Contrastar Down / Base / Up con User; el detalle de gaps queda únicamente en la hoja Plan User.</p></div></div>`)
};

function v10userMonthlyRows(){
  const periods=['2026-04','2026-05','2026-06','2026-07','2026-08','2026-09','2026-10','2026-11','2026-12','2027-01','2027-02','2027-03'];
  const mh=new Map((DATA.market_history||[]).map(r=>[r.period,Number(r.value)||0]));
  const hh=new Map((DATA.honda?.history||[]).map(r=>[r.period,Number(r.honda)||0]));
  const mf=new Map((DATA.forecast?.rows||[]).map(r=>[r.period,r]));
  const hf=new Map((DATA.honda?.forecast||[]).map(r=>[r.period,r]));
  const d=v5dailyStats();
  return periods.map(p=>{
    const closed=p<='2026-09',open=p==='2026-10';
    const marketActual=closed?(mh.get(p)||0):open?(d?.currentMtd||0):null;
    const hondaActual=closed?(hh.get(p)||0):null;
    const marketPlan=closed?marketActual:(Number(mf.get(p)?.user)||0);
    const hondaPlan=closed?hondaActual:(Number(hf.get(p)?.user)||0);
    const marketGap=marketActual==null?marketPlan:Math.max(0,marketPlan-marketActual);
    const hondaGap=hondaActual==null?hondaPlan:Math.max(0,hondaPlan-hondaActual);
    return {period:p,status:closed?'RESULT':open?'MTD + PLAN':'PLAN',marketActual,hondaActual,marketPlan,hondaPlan,marketGap,hondaGap};
  });
}
function v10userMonthlyTable(){
  const rows=v10userMonthlyRows();
  return `<section class="card"><div class="card-head"><div><span class="eyebrow">USER PLAN · MONTH BY MONTH · APR–MAR</span><h2>Actual + MTD + Plan + Gap</h2><p>Los meses cerrados quedan bloqueados como Result. Octubre muestra MTD contra el plan mensual; el resto muestra lo que falta ejecutar.</p></div>${badge('KI APR–MAR','purple')}</div><div class="table-wrap"><table class="table"><thead><tr><th>Mes</th><th>Status</th><th>Mkt Actual/MTD</th><th>Mkt Plan</th><th>Gap Mkt</th><th>Honda Actual</th><th>Honda Plan</th><th>Gap Honda</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${v10monthLabel(r.period)}</b></td><td>${badge(r.status,r.status==='RESULT'?'green':r.status.includes('MTD')?'amber':'purple')}</td><td>${r.marketActual==null?'—':fmt(r.marketActual)}</td><td>${fmt(r.marketPlan)}</td><td><strong>${r.marketGap?fmt(r.marketGap):'—'}</strong></td><td>${r.hondaActual==null?'—':fmt(r.hondaActual)}</td><td>${fmt(r.hondaPlan)}</td><td><strong>${r.hondaGap?fmt(r.hondaGap):'—'}</strong></td></tr>`).join('')}</tbody></table></div></section>`;
}
function v10userGapKpis(){
  const e=v8effectivePlan(),a=e.active,d=v5dailyStats(),closedM=v3actualMarketKI(),closedH=v3actualHondaKI(),mtd=d?.currentMtd||0;
  const observedM=closedM+mtd,remainM=Math.max(0,a.market-observedM),remainH=Math.max(0,a.honda-closedH);
  return `<section class="kpis">${kpi('PLAN MARKET KI',fmt(a.market),`${v9stageMeta(e.activeKey).label} vigente`,V3_PURPLE,'USER')}${kpi('OBSERVADO MKT',fmt(observedM),`Abr–Sep + Oct MTD ${fmt(mtd)}`,COLORS.actual,'FACT/MTD')}${kpi('GAP MARKET KI',fmt(remainM),`${pct(a.market?remainM/a.market:null)} del plan`,COLORS.amber,'TO DELIVER')}${kpi('PLAN HONDA KI',fmt(a.honda),`MS ${pct(a.share)}`,COLORS.red,'USER')}${kpi('ACTUAL HONDA',fmt(closedH),'Abr–Sep cerrado',COLORS.red,'FACT')}${kpi('GAP HONDA KI',fmt(remainH),'Honda Daily Oct no cargado',COLORS.amber,'TO DELIVER')}</section>`;
}

userBlock=function(){
  const e=v8effectivePlan();
  return chapter('user','07','Plan User','Hoja independiente para cargar Mercado/Honda y seguir el gap mes a mes del KI. El forecast independiente permanece separado y se usa solo como referencia comparativa.',`${v9quarterCalendar()}${v10userGapKpis()}<div class="v8-help"><b>Cómo leerla:</b><span>Abr–Sep queda como Result bloqueado. Oct muestra MTD actual contra el User mensual. Nov–Mar muestra el plan a ejecutar. Cambiar Mercado/Honda modifica solamente la trayectoria User; Down/Base/Up no cambian.</span></div>${v8editorTable()}<div class="v8-actions"><button id="v8ApplyPlan">Guardar y recalcular</button><button id="v8ClearPlan" class="secondary">Vaciar inputs y volver a FCST</button></div>${v10userMonthlyTable()}${v8planCharts()}<div class="note"><b>Gap:</b> para Mercado se descuenta también el MTD de octubre. Para Honda el gap descuenta únicamente resultados cerrados porque el Daily Honda de octubre no está cargado en la base actual.</div>`);
};

planning=function(){
  const e=v8effectivePlan(),ind=e.ind[0],meta=v9stageMeta(e.activeKey),actualH=v3actualHondaKI(),actualM=v3actualMarketKI();
  return chapter('planning','08','Honda Planning · KI / Budget / OB','Lectura corporativa del calendario Honda y sus revisiones. La edición, los gaps mensuales y los gráficos del User Plan viven solamente en la hoja Plan User.',`${v9quarterCalendar()}<section class="kpis">${kpi('ACTUAL KI MARKET',fmt(actualM),'Abr–Sep cerrado',COLORS.actual,'FACT')}${kpi('ACTUAL KI HONDA',fmt(actualH),'Abr–Sep cerrado',COLORS.red,'FACT')}${kpi('FCST MARKET BASE',fmt(ind.base),`Down ${fmt(ind.down)} · Up ${fmt(ind.up)}`,COLORS.blue,'INDEPENDENT FCST')}${kpi('FCST HONDA BASE',fmt(ind.hondaBase),`MS ${pct(ind.hondaShare)}`,COLORS.red,'INDEPENDENT FCST')}${kpi('REVISIÓN VIGENTE',meta.label,`${meta.result} → ${meta.plan}`,V3_PURPLE,'PLAN VERSION')}</section>${card('Revisiones del KI actual',`${meta.label} vigente según el último quarter cerrado. Sin duplicar gráficos del Plan User.`,v9stageStrip(e),'BUDGET / QUARTER FORECAST HISTORY')}<div class="note"><b>Separación de funciones:</b> Honda Planning muestra historia de revisiones y referencia independiente. Toda carga User, gap mensual y trayectoria User se concentra en la hoja <b>Plan User</b>.</div>`);
};

(function v10boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof V8_PLAN_MATRIX!=='undefined'&&typeof V3_DAILY!=='undefined'){render()}else setTimeout(ready,100)};ready()})();
