/* 2W Market Analysis v24 — final visible budget graphs inside Plan User */
const V24_VERSION='20261007-plan-user-budget-graphs-final';
const V24_BASE_USER_SHEET=(typeof V22B_BASE_USER_SHEET!=='undefined')?V22B_BASE_USER_SHEET:v12userSheet;

function v24stageForPeriod(p){
  if(p<'2026-07')return 'PRB';
  if(p<'2026-10')return '1QFCST';
  if(p<'2027-01')return '2QFCST';
  return '3QFCST';
}
function v24stageTotalFromMonthly(stage,field){
  const s=v12monthlyEffective(stage,field);
  return V12_PERIODS.reduce((a,p)=>a+(Number(s?.[p]?.value)||0),0);
}
function v24revisionSummary(){
  return V8_STAGE_KEYS.map(stage=>{
    const market=v24stageTotalFromMonthly(stage,'market');
    const honda=v24stageTotalFromMonthly(stage,'honda');
    return {stage,label:V8_STAGE_LABELS[stage],market,honda,share:market?honda/market:null};
  });
}
function v24monthlyRows(field){
  const all=Object.fromEntries(V8_STAGE_KEYS.map(s=>[s,v12monthlyEffective(s,field)]));
  return V12_PERIODS.map(p=>{
    const active=v24stageForPeriod(p);
    return {
      period:p,
      actual:Number(v12actual(field,p))||null,
      prb:Number(all.PRB?.[p]?.value)||null,
      q1:Number(all['1QFCST']?.[p]?.value)||null,
      q2:Number(all['2QFCST']?.[p]?.value)||null,
      q3:Number(all['3QFCST']?.[p]?.value)||null,
      active:Number(all[active]?.[p]?.value)||null
    };
  });
}
function v24budgetDeltaTable(){
  const rows=v24revisionSummary();
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Revisión</th><th>Mercado KI</th><th>Δ vs anterior</th><th>Honda KI</th><th>Δ vs anterior</th><th>MS</th><th>Δ MS</th></tr></thead><tbody>${rows.map((r,i)=>{const prev=rows[i-1];const dm=prev&&prev.market?r.market/prev.market-1:null;const dh=prev&&prev.honda?r.honda/prev.honda-1:null;const ds=prev&&prev.share!=null?r.share-prev.share:null;return `<tr><td><b>${r.label}</b></td><td>${fmt(r.market)}</td><td>${i?' '+pct(dm):'BASELINE'}</td><td>${fmt(r.honda)}</td><td>${i?' '+pct(dh):'BASELINE'}</td><td>${pct(r.share)}</td><td>${i?pp(ds):'BASELINE'}</td></tr>`}).join('')}</tbody></table></div>`;
}
function v24accuracy(field){
  return V8_STAGE_KEYS.map(stage=>{
    const start=V12_STAGE_PLAN_START[stage],s=v12monthlyEffective(stage,field);
    const periods=V12_PERIODS.filter(p=>p>=start&&Number(v12actual(field,p))>0);
    if(!periods.length)return {stage,n:0};
    const actual=periods.reduce((a,p)=>a+Number(v12actual(field,p)||0),0);
    const plan=periods.reduce((a,p)=>a+Number(s[p]?.value||0),0);
    const mape=periods.reduce((a,p)=>a+Math.abs(Number(s[p]?.value||0)/Number(v12actual(field,p))-1),0)/periods.length;
    return {stage,n:periods.length,actual,plan,bias:actual?plan/actual-1:null,mape};
  });
}
function v24accuracyTable(field){
  const rows=v24accuracy(field);
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Budget</th><th>Meses reales evaluables</th><th>Plan</th><th>Real</th><th>Bias</th><th>MAPE</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${V8_STAGE_LABELS[r.stage]}</b></td>${r.n?`<td>${r.n}</td><td>${fmt(r.plan)}</td><td>${fmt(r.actual)}</td><td>${pct(r.bias)}</td><td>${pct(r.mape)}</td>`:`<td colspan="5">PENDING</td>`}</tr>`).join('')}</tbody></table></div>`;
}
function v24budgetGraphs(){
  const rev=v24revisionSummary(),m=v24monthlyRows('market'),h=v24monthlyRows('honda');
  const marketBars=rev.map(r=>({name:r.label,value:r.market}));
  const hondaBars=rev.map(r=>({name:r.label,value:r.honda}));
  const current=rev.at(-1),initial=rev[0];
  return `<section class="card v24-budget-graphs"><div class="card-head"><div><span class="eyebrow">PLAN USER · BUDGET vs BUDGET vs REAL</span><h2>Comparativo gráfico de presupuestos</h2><p>Acá se ve cómo nació el presupuesto, cada salto PRB → 1Q → 2Q → 3Q y cómo terminó viniendo el Real mes a mes.</p></div>${badge('BUDGET TRACKING','purple')}</div>
    <section class="kpis">
      ${kpi('MKT · PRB → 3Q',pct(initial.market?current.market/initial.market-1:null),`${fmt(initial.market)} → ${fmt(current.market)}`,V3_PURPLE,'REVISION')}
      ${kpi('HONDA · PRB → 3Q',pct(initial.honda?current.honda/initial.honda-1:null),`${fmt(initial.honda)} → ${fmt(current.honda)}`,COLORS.red,'REVISION')}
      ${kpi('MS · PRB → 3Q',pp((current.share||0)-(initial.share||0)),`${pct(initial.share)} → ${pct(current.share)}`,COLORS.amber,'REVISION')}
    </section>
    <div class="grid two">
      ${card('Mercado KI · presupuestos entre sí','Comparación de volumen total del KI en cada revisión.',barChart(marketBars,{limit:4,color:r=>r.name==='PRB'?COLORS.previous:r.name==='1Q FCST'?COLORS.blue:r.name==='2Q FCST'?V3_PURPLE:COLORS.amber}),'PRB / 1Q / 2Q / 3Q')}
      ${card('Honda KI · presupuestos entre sí','Comparación de volumen Honda total del KI en cada revisión.',barChart(hondaBars,{limit:4,color:r=>r.name==='PRB'?COLORS.previous:r.name==='1Q FCST'?COLORS.blue:r.name==='2Q FCST'?V3_PURPLE:COLORS.red}),'PRB / 1Q / 2Q / 3Q')}
    </div>
    <div class="grid two">
      ${card('Mercado mensual · todos los budgets vs Real','Cada versión queda visible completa para comparar forma, saltos y error contra el cierre real.',lineChart(m,[{key:'actual',name:'Real',color:COLORS.actual},{key:'prb',name:'PRB',color:COLORS.previous},{key:'q1',name:'1Q FCST',color:COLORS.blue},{key:'q2',name:'2Q FCST',color:V3_PURPLE},{key:'q3',name:'3Q FCST',color:COLORS.amber}],{zero:true}),'MONTHLY')}
      ${card('Honda mensual · todos los budgets vs Real','Misma comparación para Honda.',lineChart(h,[{key:'actual',name:'Real Honda',color:COLORS.red},{key:'prb',name:'PRB',color:COLORS.previous},{key:'q1',name:'1Q FCST',color:COLORS.blue},{key:'q2',name:'2Q FCST',color:V3_PURPLE},{key:'q3',name:'3Q FCST',color:COLORS.amber}],{zero:true}),'MONTHLY')}
    </div>
    <div class="grid two">
      ${card('Mercado · presupuesto vigente por fecha vs Real','Una única línea de plan toma PRB Abr–Jun, 1Q Jul–Sep, 2Q Oct–Dic y 3Q Ene–Mar. Los saltos muestran exactamente el cambio de presupuesto.',lineChart(m,[{key:'actual',name:'Real',color:COLORS.actual},{key:'active',name:'Budget vigente',color:V3_PURPLE}],{zero:true}),'REVISION JUMPS')}
      ${card('Honda · presupuesto vigente por fecha vs Real','Misma lectura: ejecución real contra la versión que estaba vigente en cada tramo.',lineChart(h,[{key:'actual',name:'Real Honda',color:COLORS.red},{key:'active',name:'Budget vigente',color:V3_PURPLE}],{zero:true}),'REVISION JUMPS')}
    </div>
    ${card('Cambios entre presupuestos','Delta directo de cada revisión contra la inmediatamente anterior.',v24budgetDeltaTable(),'BUDGET DELTAS')}
    <div class="grid two">
      ${card('Precisión Mercado','Cada revisión se evalúa sólo contra meses que aún eran futuros cuando se emitió.',v24accuracyTable('market'),'PLAN vs REAL')}
      ${card('Precisión Honda','Misma regla para Honda.',v24accuracyTable('honda'),'PLAN vs REAL')}
    </div>
  </section>`;
}

v12userSheet=function(){
  const html=V24_BASE_USER_SHEET();
  const marker='<section class="card v12-revision-editor">';
  if(html.includes(marker))return html.replace(marker,`${v24budgetGraphs()}${marker}`);
  return `${html}${v24budgetGraphs()}`;
};

(function v24boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v12monthlyEffective==='function'&&typeof v12userSheet==='function'){
      try{render()}catch(e){console.error('V24 Plan User budget graphs',e)}
    }else setTimeout(ready,100);
  };
  ready();
})();
