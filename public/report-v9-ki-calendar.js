/* 2W Market Analysis v9 — KI quarter calendar starts in April. PRB -> 1QFCST -> 2QFCST -> 3QFCST; 4Q closes KI. */
const V9_VERSION='20261007-ki-apr-mar';
const V9_BASE_USERBLOCK=userBlock;
const V9_BASE_PLANNING=planning;

function v9cutoffPeriod(){
  const raw=String(DATA?.meta?.market_cutoff||'2026-09');
  const m=raw.match(/(20\d{2})[-\/.](\d{1,2})/);
  return m?{year:Number(m[1]),month:Number(m[2])}:{year:2026,month:9};
}
function v9activeStageKey(){
  const {year,month}=v9cutoffPeriod();
  // KI 26/27: Apr-26 -> Mar-27. A quarter forecast becomes active only after that quarter closes.
  if(year===2026){
    if(month<=5)return 'PRB';
    if(month<=8)return '1QFCST';
    if(month<=11)return '2QFCST';
    return '3QFCST';
  }
  if(year===2027 && month<=3)return '3QFCST';
  return '3QFCST';
}
function v9stageMeta(key){
  return ({
    PRB:{label:'PRB',result:'Sin resultados cerrados del KI',plan:'Abr–Mar',quarter:'PRE-KI / BUDGET'},
    '1QFCST':{label:'1Q FCST',result:'Abr–Jun',plan:'Jul–Mar',quarter:'1Q = ABR–JUN'},
    '2QFCST':{label:'2Q FCST',result:'Abr–Sep',plan:'Oct–Mar',quarter:'2Q = JUL–SEP'},
    '3QFCST':{label:'3Q FCST',result:'Abr–Dic',plan:'Ene–Mar',quarter:'3Q = OCT–DIC'}
  })[key];
}
function v9quarterCalendar(){
  const active=v9activeStageKey();
  return `<section class="card v9-ki-calendar"><div class="card-head"><div><span class="eyebrow">KI CALENDAR · APR–MAR</span><h2>El KI empieza en abril</h2><p>Los quarters Honda se numeran desde abril, no desde enero.</p></div>${badge(`VIGENTE ${v9stageMeta(active).label}`,'purple')}</div><div class="v9-quarter-grid"><div><b>1Q</b><span>Abr · May · Jun</span><small>cierra Jun → 1Q FCST</small></div><div><b>2Q</b><span>Jul · Ago · Sep</span><small>cierra Sep → 2Q FCST</small></div><div><b>3Q</b><span>Oct · Nov · Dic</span><small>cierra Dic → 3Q FCST</small></div><div><b>4Q</b><span>Ene · Feb · Mar</span><small>cierra KI · resultado final</small></div></div><div class="v9-stage-logic"><div><b>PRB</b><span>Plan Abr–Mar</span></div><div><b>1Q FCST</b><span>Result Abr–Jun · Plan Jul–Mar</span></div><div><b>2Q FCST</b><span>Result Abr–Sep · Plan Oct–Mar</span></div><div><b>3Q FCST</b><span>Result Abr–Dic · Plan Ene–Mar</span></div></div></section>`;
}

/* Migrate only the v8 automatic legacy placement: if old 2w.plan equals the value stored in 3Q and 2Q is empty,
   move it to 2Q because Sep is the latest closed quarter at the current cutoff. Never move a genuinely different manual 3Q entry. */
(function v9migrateLegacyStage(){
  try{
    if(localStorage.getItem('2w.plan.matrix.v9'))return;
    const legacy=JSON.parse(localStorage.getItem('2w.plan')||'{}');
    const q3=V8_PLAN_MATRIX?.['3QFCST'];
    const q2=V8_PLAN_MATRIX?.['2QFCST'];
    const sameMarket=!q3?.market||Number(q3.market)===Number(legacy.marketKI);
    const sameHonda=!q3?.honda||Number(q3.honda)===Number(legacy.hondaKI);
    if(!q2 && q3 && sameMarket && sameHonda && v9activeStageKey()==='2QFCST'){
      V8_PLAN_MATRIX['2QFCST']={...q3};delete V8_PLAN_MATRIX['3QFCST'];v8save();
    }
    localStorage.setItem('2w.plan.matrix.v9','1');
  }catch{}
})();

/* Override only the active-stage selection; keep all v8 multi-year inheritance rules. */
const V9_V8_EFFECTIVE=v8effectivePlan;
v8effectivePlan=function(){
  const e=V9_V8_EFFECTIVE();
  const activeKey=v9activeStageKey();
  e.active=e.stages.find(x=>x.id===activeKey)||e.stages.at(-1);
  e.activeKey=activeKey;
  return e;
};

function v9stageStrip(e){
  const active=e.activeKey||v9activeStageKey();
  return `<div class="v8-stage-strip">${e.stages.map(r=>{const meta=v9stageMeta(r.id);return `<div class="${r.id===active?'active':''}"><span>${r.label}${r.id===active?' · VIGENTE':''}</span><b>${fmt(r.market)} / ${fmt(r.honda)}</b><small>${meta.result} → ${meta.plan} · MS ${pct(r.share)}</small></div>`}).join('')}</div>`;
}

userBlock=function(){
  const e=v8effectivePlan(),a=e.active,fit=v3planFit(),meta=v9stageMeta(e.activeKey);
  return chapter('user','07','Plan User plurianual','Un solo lugar para cargar Mercado y Honda. El KI corre de abril a marzo y la revisión vigente depende del último quarter cerrado.',`${v9quarterCalendar()}<section class="kpis">${kpi('PLAN VIGENTE',meta.label,`${meta.result} → Plan ${meta.plan}`,V3_PURPLE,'PLAN VERSION')}${kpi('MERCADO PLAN',fmt(a.market),`vs FCST ${fmt(e.ind[0].base)}`,V3_PURPLE,a.explicit?'USER INPUT':'AUTO')}${kpi('HONDA PLAN',fmt(a.honda),`vs FCST ${fmt(e.ind[0].hondaBase)}`,COLORS.red,a.explicit?'USER INPUT':'AUTO')}${kpi('MS PLAN',pct(a.share),`FCST ${pct(e.ind[0].hondaShare)}`,COLORS.amber,'CALC')}${kpi('COMPATIBILIDAD',`${fit.compat}%`,fit.zone,COLORS.green,'ESTIMATE')}</section><div class="v8-help"><b>Cómo funciona:</b><span>PRB cubre Abr–Mar. 1Q FCST se arma con resultado Abr–Jun + plan Jul–Mar; 2Q FCST con resultado Abr–Sep + plan Oct–Mar; 3Q FCST con resultado Abr–Dic + plan Ene–Mar. 4Q cierra el KI. Si una celda está vacía hereda el último plan; si nunca cargaste nada usa el FCST independiente.</span></div>${v8editorTable()}<div class="v8-actions"><button id="v8ApplyPlan">Guardar y recalcular</button><button id="v8ClearPlan" class="secondary">Vaciar inputs y volver a FCST</button></div>${v8planCharts()}<div class="note"><b>Importante:</b> el Plan User nunca modifica el forecast independiente. La revisión vigente alimenta la reversión solo sobre los meses todavía no cerrados del KI.</div>`);
};

planning=function(){
  const e=v8effectivePlan(),a=e.active,ind=e.ind[0],meta=v9stageMeta(e.activeKey),actualH=v3actualHondaKI(),actualM=v3actualMarketKI(),remainH=Math.max(0,a.honda-actualH),remainM=Math.max(0,a.market-actualM);
  return chapter('planning','08','Honda Planning · KI / Budget / OB','Calendario Honda Apr–Mar: budget y quarter forecasts se leen contra resultados cerrados y plan remanente.',`${v9quarterCalendar()}<section class="kpis">${kpi('ACTUAL KI MARKET',fmt(actualM),'Abr–Sep cerrado',COLORS.actual,'FACT')}${kpi('ACTUAL KI HONDA',fmt(actualH),'Abr–Sep cerrado',COLORS.red,'FACT')}${kpi('RESTANTE PLAN MKT',fmt(remainM),meta.plan,V3_PURPLE,'CALC')}${kpi('RESTANTE PLAN HONDA',fmt(remainH),meta.plan,COLORS.red,'CALC')}${kpi('PLAN MS',pct(a.share),`FCST ${pct(ind.hondaShare)}`,COLORS.amber,'CALC')}</section>${v8planCharts()}${card('Revisiones del KI actual',`${meta.label} vigente según el último quarter cerrado.`,v9stageStrip(e),'BUDGET / QUARTER FORECAST HISTORY')}<div class="note"><b>Lectura correcta:</b> 1Q = Abr–Jun · 2Q = Jul–Sep · 3Q = Oct–Dic · 4Q = Ene–Mar. No existe un 4Q FCST adicional: el 4Q termina en el cierre del KI.</div>`);
};

(function v9boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof V8_PLAN_MATRIX!=='undefined'){v8syncActive();render()}else setTimeout(ready,100)};ready()})();
