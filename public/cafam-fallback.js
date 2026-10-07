/* Source fallback: SIOMAA -> CAFAM -> latest closed CAFAM -> PENDING */
let V3_CAFAM=null;
function v3UpToDate(){
  if(V3_DAILY&&Array.isArray(V3_DAILY.current)&&V3_DAILY.current.length){
    const d=v3dailyStats();
    return {kind:'siomaa',source:'SIOMAA',status:'EARLY SIGNAL',cutoff:V3_DAILY.current_cutoff||'—',value:d?.current||null,daily:d};
  }
  if(V3_CAFAM&&Number(V3_CAFAM.value)>0){
    return {kind:'cafam',source:'CAFAM',status:V3_CAFAM.status||'FACT',cutoff:V3_CAFAM.cutoff||V3_CAFAM.period||'—',value:Number(V3_CAFAM.value),ytd:Number(V3_CAFAM.ytd)||null,mode:V3_CAFAM.mode||'latest_official_close'};
  }
  const last=DATA?.market_history?.at(-1);
  if(last)return {kind:'cafam-close',source:'CAFAM',status:'FACT',cutoff:last.period,value:Number(last.value)||null,mode:'latest_closed_market'};
  return {kind:'pending',source:'PENDING',status:'PENDING',cutoff:'—',value:null};
}
function v3SourceBadge(u){return u.kind==='siomaa'?badge('SIOMAA · EARLY SIGNAL','green'):u.kind.startsWith('cafam')?badge('CAFAM · FACT','green'):badge('PENDING','amber')}
function v3FallbackPanel(u){
  if(u.kind==='siomaa')return v3dailyChart();
  if(u.kind.startsWith('cafam'))return `<div class="narrative"><div>${v3SourceBadge(u)}</div><h3>Último dato oficial disponible</h3><div class="big-number">${fmt(u.value)}<small>Corte ${u.cutoff}</small></div><p>SIOMAA no está disponible para este corte. El reporte usa CAFAM como fuente gobernante del mercado total. No se inventa una evolución daily ni se convierte el cierre en MTD.</p>${u.ytd?`<div class="scenario-strip"><span>YTD <b>${fmt(u.ytd)}</b></span><span>Fuente <b>CAFAM</b></span></div>`:''}</div>`;
  return pending('Dato up to date','Sin SIOMAA ni CAFAM vigente disponible.');
}

const V3_PREV_BAND=updateBand;
updateBand=function(){
  const u=v3UpToDate();
  return `<div class="update-band"><div><span>UP TO DATE</span><b>${u.source} · ${u.cutoff}</b></div><div><span>CIERRE</span><b>${DATA.meta.market_cutoff}</b></div><div><span>IMPORTS</span><b>${DATA.meta.imports_cutoff||DATA.imports?.cutoff||'—'}</b></div><div><span>ESTRUCTURA</span><b>${V3_ROLL?.cutoff||DATA.meta.structure_cutoff||'—'}</b></div><div><span>FORECAST</span><b>${DATA.forecast.version}</b></div></div>`;
};

const V3_PREV_EXEC=exec;
exec=function(){
  const e=DATA.executive,h=DATA.honda,ki=v3currentKI(),u=v3UpToDate(),fit=v3planFit(),d=u.daily||null;
  const firstKpi=u.kind==='siomaa'
    ? kpi('MES ABIERTO MTD',fmt(d.current),`${d.n} días hábiles comparables · ${pct(d.vs)} vs mes previo`,COLORS.red,'EARLY SIGNAL')
    : kpi('UP TO DATE CAFAM',u.value?fmt(u.value):'PENDING',`Corte ${u.cutoff} · último oficial disponible`,COLORS.red,u.status);
  const secondKpi=u.kind==='siomaa'
    ? kpi('NOWCAST PACE',d.pace?fmt(d.pace):'PENDING',`Base Oct ${fmt(DATA.forecast.rows[0].base)} · señal por pace`,COLORS.green,'EARLY SIGNAL')
    : kpi('BASE OCT',fmt(DATA.forecast.rows[0].base),'Forecast oficial · no sustituido por cierre CAFAM',COLORS.green,'FORECAST');
  return chapter('executive','02','Resumen ejecutivo','Mes en curso, cierre anterior, KI, escenarios y decisión en una sola lectura.',`<section class="kpis">
  ${firstKpi}${secondKpi}
  ${kpi('SEP CERRADO',fmt(e.market),`${pct(e.mom)} MoM · ${pct(e.yoy)} YoY`,COLORS.actual,'FACT')}
  ${kpi('KI 26/27 BASE',fmt(ki.base),`Down ${fmt(ki.down)} · Up ${fmt(ki.up)}`,COLORS.blue,'FORECAST')}
  ${kpi('PLAN USUARIO',fmt(V3_PLAN.marketKI),`${fmt(V3_PLAN.hondaKI)} Honda · share ${pct(fit.share)}`,V3_PURPLE,'USER INPUT')}</section>
  <div class="grid two">${card(u.kind==='siomaa'?'Daily evolution':'Dato up to date',u.kind==='siomaa'?'Comparación por igual cantidad de días hábiles.':'Fallback automático al último dato oficial CAFAM.',v3FallbackPanel(u),u.source)}${card('Lectura del dato actual','La fuente cambia; la gobernanza no.',`<div class="narrative"><h3>${u.kind==='siomaa'?(d.vs>0?'Ritmo inicial por encima del mes previo':'Ritmo inicial por debajo del mes previo'):'CAFAM toma el control cuando falta SIOMAA'}</h3><p>${u.kind==='siomaa'?`El mes abierto acumula ${fmt(d.current)} unidades en ${d.n} días hábiles comparables. El pace simple implica ~${fmt(d.pace)}, mientras el Base oficial es ${fmt(DATA.forecast.rows[0].base)}.`:`El último dato oficial disponible es ${fmt(u.value)} con corte ${u.cutoff}. Se conserva como FACT y el forecast futuro permanece separado.`}</p><div>${badge('BASE NO SE MUEVE AUTOMÁTICAMENTE','amber')}${v3SourceBadge(u)}</div></div>`,'DIAGNOSIS')}</div>
  <div class="storyline"><div><b>Fuente actual</b><p>${u.source} · ${u.cutoff}.</p></div><div><b>Qué está pasando</b><p>${u.kind==='siomaa'?'El daily entra como señal temprana.':'Sin daily comparable; se usa CAFAM como último hecho oficial.'}</p></div><div><b>Qué comparar</b><p>Plan usuario vs Down/Base/Up, grupos, marcas y modelos.</p></div></div>`)
};

const V3_PREV_MARKET=market;
market=function(){
  const hist=periodRows(DATA.market_history),last=hist.at(-1),u=v3UpToDate();const r=n=>v3avg(DATA.market_history.slice(-n).map(x=>x.value));
  return chapter('market','04','Mercado actual, Daily & momentum','Actual cerrado + fuente up-to-date + rolling. MoM y YoY permanecen visibles.',`<section class="kpis">${kpi('ROLLING 3M',fmt(r(3)),'promedio mensual',COLORS.red,'FACT')}${kpi('ROLLING 6M',fmt(r(6)),'promedio mensual',COLORS.blue,'FACT')}${kpi('ROLLING 12M',fmt(r(12)),'promedio mensual',COLORS.green,'FACT')}${kpi('ÚLTIMO YoY',pct(last.yoy),`MoM ${pct(last.mom)}`,COLORS.amber,'FACT')}</section><div class="grid two">${card(u.kind==='siomaa'?'Daily evolution':'Fuente up to date',`Fuente ${u.source} · corte ${u.cutoff}`,v3FallbackPanel(u),u.kind==='siomaa'?'OPEN MONTH':'CAFAM FALLBACK')}${card('Actual + perspectiva','El cierre histórico sigue visible antes del forecast.',lineChart(hist.slice(-18).map(x=>({...x,actual:x.value})),[{key:'actual',name:'Actual',color:COLORS.actual}],{zero:true}),'HISTORY')}</div>`)
};

fetch('/data/cafam-current.json',{cache:'no-store'})
  .then(r=>r.ok?r.json():null)
  .then(c=>{V3_CAFAM=c;const ready=()=>{if(typeof DATA!=='undefined'&&DATA){render()}else setTimeout(ready,100)};ready()})
  .catch(()=>{});
