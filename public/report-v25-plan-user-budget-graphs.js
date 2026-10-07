/* 2W Market Analysis v25 — final Plan User budget vs budget vs real charts */
const V25_BUDGET_VERSION='20261007-plan-user-budget-graphs-v25';
const V25_BASE_USER_SHEET=(typeof V22B_BASE_USER_SHEET!=='undefined')?V22B_BASE_USER_SHEET:v12userSheet;

function v25stageForPeriod(p){
  if(p<'2026-07')return 'PRB';
  if(p<'2026-10')return '1QFCST';
  if(p<'2027-01')return '2QFCST';
  return '3QFCST';
}
function v25stageTotal(stage,field){
  const s=v12monthlyEffective(stage,field);
  return V12_PERIODS.reduce((a,p)=>a+(Number(s?.[p]?.value)||0),0);
}
function v25summary(){
  return V8_STAGE_KEYS.map(stage=>{
    const market=v25stageTotal(stage,'market'),honda=v25stageTotal(stage,'honda');
    return {stage,label:V8_STAGE_LABELS[stage],market,honda,share:market?honda/market:null};
  });
}
function v25monthly(field){
  const all=Object.fromEntries(V8_STAGE_KEYS.map(s=>[s,v12monthlyEffective(s,field)]));
  return V12_PERIODS.map(p=>{
    const active=v25stageForPeriod(p);
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
function v25deltaTable(){
  const rows=v25summary();
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Revisión</th><th>Mercado KI</th><th>Δ Mkt</th><th>Honda KI</th><th>Δ Honda</th><th>MS</th><th>Δ MS</th></tr></thead><tbody>${rows.map((r,i)=>{const p=rows[i-1];return `<tr><td><b>${r.label}</b></td><td>${fmt(r.market)}</td><td>${i?pct(r.market/p.market-1):'BASELINE'}</td><td>${fmt(r.honda)}</td><td>${i?pct(r.honda/p.honda-1):'BASELINE'}</td><td>${pct(r.share)}</td><td>${i?pp(r.share-p.share):'BASELINE'}</td></tr>`}).join('')}</tbody></table></div>`;
}
function v25accuracy(field){
  return V8_STAGE_KEYS.map(stage=>{
    const start=V12_STAGE_PLAN_START[stage],series=v12monthlyEffective(stage,field);
    const periods=V12_PERIODS.filter(p=>p>=start&&Number(v12actual(field,p))>0);
    if(!periods.length)return {stage,n:0};
    const actual=periods.reduce((a,p)=>a+Number(v12actual(field,p)||0),0);
    const plan=periods.reduce((a,p)=>a+Number(series[p]?.value||0),0);
    const mape=periods.reduce((a,p)=>a+Math.abs(Number(series[p]?.value||0)/Number(v12actual(field,p))-1),0)/periods.length;
    return {stage,n:periods.length,actual,plan,bias:actual?plan/actual-1:null,mape};
  });
}
function v25accuracyTable(field){
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Budget</th><th>Meses</th><th>Plan</th><th>Real</th><th>Bias</th><th>MAPE</th></tr></thead><tbody>${v25accuracy(field).map(r=>`<tr><td><b>${V8_STAGE_LABELS[r.stage]}</b></td>${r.n?`<td>${r.n}</td><td>${fmt(r.plan)}</td><td>${fmt(r.actual)}</td><td>${pct(r.bias)}</td><td>${pct(r.mape)}</td>`:`<td colspan="5">PENDING</td>`}</tr>`).join('')}</tbody></table></div>`;
}
function v25budgetBlock(){
  const rev=v25summary(),market=v25monthly('market'),honda=v25monthly('honda'),first=rev[0],last=rev.at(-1);
  return `<section class="card v25-budget-block"><div class="card-head"><div><span class="eyebrow">PLAN USER · BUDGET vs BUDGET vs REAL</span><h2>Comparativo gráfico de presupuestos</h2><p>PRB, 1Q FCST, 2Q FCST y 3Q FCST quedan visibles entre sí y contra el Real. La línea de budget vigente muestra el salto exacto cuando cambia la revisión.</p></div>${badge('VISIBLE EN PLAN USER','purple')}</div>
  <section class="kpis">
    ${kpi('MKT · PRB→3Q',pct(first.market?last.market/first.market-1:null),`${fmt(first.market)} → ${fmt(last.market)}`,V3_PURPLE,'REVISION')}
    ${kpi('HONDA · PRB→3Q',pct(first.honda?last.honda/first.honda-1:null),`${fmt(first.honda)} → ${fmt(last.honda)}`,COLORS.red,'REVISION')}
    ${kpi('MS · PRB→3Q',pp((last.share||0)-(first.share||0)),`${pct(first.share)} → ${pct(last.share)}`,COLORS.amber,'REVISION')}
  </section>
  <div class="grid two">
    ${card('Mercado KI · PRB vs 1Q vs 2Q vs 3Q','Totales presupuestados del KI.',barChart(rev.map(r=>({name:r.label,value:r.market})),{limit:4,color:r=>r.name==='PRB'?COLORS.previous:r.name==='1Q FCST'?COLORS.blue:r.name==='2Q FCST'?V3_PURPLE:COLORS.amber}),'BUDGET TOTAL')}
    ${card('Honda KI · PRB vs 1Q vs 2Q vs 3Q','Totales Honda presupuestados del KI.',barChart(rev.map(r=>({name:r.label,value:r.honda})),{limit:4,color:r=>r.name==='PRB'?COLORS.previous:r.name==='1Q FCST'?COLORS.blue:r.name==='2Q FCST'?V3_PURPLE:COLORS.red}),'BUDGET TOTAL')}
  </div>
  <div class="grid two">
    ${card('Mercado mensual · presupuestos vs Real','Todas las versiones completas contra los cierres reales.',lineChart(market,[{key:'actual',name:'Real',color:COLORS.actual},{key:'prb',name:'PRB',color:COLORS.previous},{key:'q1',name:'1Q FCST',color:COLORS.blue},{key:'q2',name:'2Q FCST',color:V3_PURPLE},{key:'q3',name:'3Q FCST',color:COLORS.amber}],{zero:true}),'MONTHLY')}
    ${card('Honda mensual · presupuestos vs Real','Todas las versiones completas contra los cierres reales Honda.',lineChart(honda,[{key:'actual',name:'Real Honda',color:COLORS.red},{key:'prb',name:'PRB',color:COLORS.previous},{key:'q1',name:'1Q FCST',color:COLORS.blue},{key:'q2',name:'2Q FCST',color:V3_PURPLE},{key:'q3',name:'3Q FCST',color:COLORS.amber}],{zero:true}),'MONTHLY')}
  </div>
  <div class="grid two">
    ${card('Mercado · budget vigente vs Real','PRB Abr–Jun → 1Q Jul–Sep → 2Q Oct–Dic → 3Q Ene–Mar. Cada cambio de pendiente es una revisión.',lineChart(market,[{key:'actual',name:'Real',color:COLORS.actual},{key:'active',name:'Budget vigente',color:V3_PURPLE}],{zero:true}),'REVISION JUMPS')}
    ${card('Honda · budget vigente vs Real','Misma lectura para Honda.',lineChart(honda,[{key:'actual',name:'Real Honda',color:COLORS.red},{key:'active',name:'Budget vigente',color:V3_PURPLE}],{zero:true}),'REVISION JUMPS')}
  </div>
  ${card('Cambio de cada revisión','Cada budget contra el inmediatamente anterior.',v25deltaTable(),'BUDGET DELTAS')}
  <div class="grid two">${card('Precisión Mercado','Sólo meses que eran futuros al emitir cada revisión.',v25accuracyTable('market'),'PLAN vs REAL')}${card('Precisión Honda','Misma regla para Honda.',v25accuracyTable('honda'),'PLAN vs REAL')}</div>
  </section>`;
}

v12userSheet=function(){
  const html=V25_BASE_USER_SHEET();
  const marker='<section class="card v12-revision-editor">';
  return html.includes(marker)?html.replace(marker,`${v25budgetBlock()}${marker}`):`${v25budgetBlock()}${html}`;
};

(function v25budgetBoot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v12monthlyEffective==='function'){
      try{render()}catch(e){console.error('V25 Plan User budget graphs',e)}
    }else setTimeout(ready,100);
  };
  ready();
})();
