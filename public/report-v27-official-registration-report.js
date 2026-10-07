/* 2W Market Analysis v27 — official registration report governance */
const V27_VERSION='20261007-official-registration-report';
let V27_OFFICIAL=null;

function v27pct(a,b){return b?Number(a)/Number(b)-1:null}
function v27officialMap(){
  if(!window.V24_PIVOT||!Array.isArray(V24_PIVOT.periods)||!Array.isArray(V24_PIVOT.market_total_raw))return new Map();
  return new Map(V24_PIVOT.periods.map((p,i)=>[p,Number(V24_PIVOT.market_total_raw[i])||0]).filter(([,v])=>v>0));
}
function v27sameMonthPrevYear(period){
  const [y,m]=String(period||'').split('-');
  return y&&m?`${Number(y)-1}-${m}`:null;
}
function v27applyOfficialReport(){
  if(typeof DATA==='undefined'||!DATA||!window.V24_PIVOT)return false;
  const map=v27officialMap();
  if(!map.size)return false;

  const hist=DATA.market_history||[];
  hist.forEach(r=>{
    const v=map.get(r.period);
    if(v>0){
      r.value=v;
      r.source='Patentamiento (68).xls · REPORTE OFICIAL';
      r.status='ACTUAL';
    }
  });
  hist.forEach((r,i)=>{
    const prev=hist[i-1];
    const py=hist.find(x=>x.period===v27sameMonthPrevYear(r.period));
    r.mom=prev?.value?v27pct(r.value,prev.value):null;
    r.yoy=py?.value?v27pct(r.value,py.value):null;
  });

  const cutoff=V24_PIVOT.cutoff||[...map.keys()].at(-1)||'2026-09';
  const latest=hist.find(r=>r.period===cutoff)||hist.at(-1);
  const ytd=hist.filter(r=>String(r.period).startsWith('2026-')&&r.period<='2026-09').reduce((s,r)=>s+(Number(r.value)||0),0);
  const cafam=Number(DATA.executive?.cafam_latest)||80641;
  if(DATA.meta){
    DATA.meta.market_cutoff=cutoff;
    DATA.meta.market_source='Patentamiento (68).xls · reporte oficial de patentamientos';
    DATA.meta.governance='Reporte oficial Patentamiento/SIOMAA gobierna el cierre y los últimos 12 meses disponibles; SIOMAA daily gobierna mes abierto; CAFAM queda como referencia secundaria/fallback cuando esté actualizado; Pivot Master conserva historia estructural; importaciones son supply y no se suman a patentamientos.';
  }
  if(DATA.executive&&latest){
    DATA.executive.market=Number(latest.value)||0;
    DATA.executive.mom=latest.mom;
    DATA.executive.yoy=latest.yoy;
    DATA.executive.ytd=ytd;
    DATA.executive.pivot_latest=Number(latest.value)||0;
    DATA.executive.source_gap=(Number(latest.value)||0)-cafam;
  }

  const micro=DATA.micro||[];
  const close=micro.find(x=>String(x.metric||'').toUpperCase().includes('CAFAM SEP CLOSE'));
  if(close&&latest){
    close.metric='Reporte oficial Sep close';
    close.value=`${Number(latest.value).toLocaleString('en-US')} units`;
    close.date='Sep 2026';
    close.direction='strong-upside';
    close.detail=`Cierre oficial usado por la app: ${Number(latest.value).toLocaleString('en-US')} unidades (${latest.mom==null?'—':(latest.mom*100).toFixed(1)+'%'} MoM; ${latest.yoy==null?'—':(latest.yoy*100).toFixed(1)+'%'} YoY). CAFAM ${cafam.toLocaleString('en-US')} queda como referencia rezagada y no gobierna este cierre.`;
    close.source='Patentamiento (68).xls · reporte oficial';
    close.url='';
  }
  if(DATA.planning_read&&latest){
    DATA.planning_read.base=`Mantener octubre constructivo: el reporte oficial cerró septiembre en ${Number(latest.value).toLocaleString('en-US')} unidades y la estacionalidad entra en un período más fuerte. CAFAM se conserva sólo como referencia secundaria mientras esté desactualizado.`;
  }

  V27_OFFICIAL={source:'Patentamiento (68).xls',cutoff,value:Number(latest?.value)||0,ytd,cafam,gap:(Number(latest?.value)||0)-cafam,map};
  return true;
}

/* Source hierarchy: open month SIOMAA early signal; closed market official report; CAFAM only fallback/reference. */
const V27_PREV_UPTODATE=typeof v3UpToDate==='function'?v3UpToDate:null;
v3UpToDate=function(){
  if(typeof V3_DAILY!=='undefined'&&V3_DAILY&&Array.isArray(V3_DAILY.current)&&V3_DAILY.current.length){
    const d=v3dailyStats();
    return {kind:'siomaa',source:'SIOMAA',status:'EARLY SIGNAL',cutoff:V3_DAILY.current_cutoff||'—',value:d?.current||null,daily:d};
  }
  if(V27_OFFICIAL?.value>0){
    return {kind:'official-report',source:'REPORTE OFICIAL',status:'FACT',cutoff:V27_OFFICIAL.cutoff,value:V27_OFFICIAL.value,ytd:V27_OFFICIAL.ytd,mode:'official_registration_report'};
  }
  return V27_PREV_UPTODATE?V27_PREV_UPTODATE():{kind:'pending',source:'PENDING',status:'PENDING',cutoff:'—',value:null};
};

v3SourceBadge=function(u){
  if(u.kind==='siomaa')return badge('SIOMAA · EARLY SIGNAL','green');
  if(u.kind==='official-report')return badge('REPORTE OFICIAL · FACT','green');
  if(String(u.kind||'').startsWith('cafam'))return badge('CAFAM · REFERENCIA','amber');
  return badge('PENDING','amber');
};

v3FallbackPanel=function(u){
  if(u.kind==='siomaa')return v3dailyChart();
  if(u.kind==='official-report')return `<div class="narrative"><div>${v3SourceBadge(u)}</div><h3>Último cierre oficial disponible</h3><div class="big-number">${fmt(u.value)}<small>Corte ${u.cutoff}</small></div><p>El reporte de patentamientos recibido gobierna el cierre oficial y reemplaza a CAFAM mientras CAFAM permanezca desactualizado. CAFAM se mantiene como referencia secundaria, no como denominador oficial.</p>${u.ytd?`<div class="scenario-strip"><span>YTD <b>${fmt(u.ytd)}</b></span><span>Fuente <b>REPORTE OFICIAL</b></span></div>`:''}</div>`;
  if(String(u.kind||'').startsWith('cafam'))return `<div class="narrative"><div>${v3SourceBadge(u)}</div><h3>Referencia CAFAM</h3><div class="big-number">${fmt(u.value)}<small>Corte ${u.cutoff}</small></div><p>CAFAM se usa sólo si no existe un reporte oficial más reciente.</p></div>`;
  return pending('Dato up to date','Sin fuente oficial vigente disponible.');
};

const V27_PREV_BAND=typeof updateBand==='function'?updateBand:null;
updateBand=function(){
  const u=v3UpToDate(),off=V27_OFFICIAL;
  return `<div class="update-band"><div><span>UP TO DATE</span><b>${u.source} · ${u.cutoff}</b></div><div><span>CIERRE OFICIAL</span><b>${off?`${off.cutoff} · ${fmt(off.value)}`:(DATA?.meta?.market_cutoff||'—')}</b></div><div><span>IMPORTS</span><b>${DATA.meta.imports_cutoff||DATA.imports?.cutoff||'—'}</b></div><div><span>ESTRUCTURA</span><b>${typeof V3_ROLL!=='undefined'?(V3_ROLL?.cutoff||DATA.meta.structure_cutoff||'—'):(DATA.meta.structure_cutoff||'—')}</b></div><div><span>FORECAST</span><b>${DATA.forecast.version}</b></div></div>`;
};

function v27decorate(){
  const footer=document.querySelector('footer span:last-child');
  if(footer)footer.textContent='Gobernanza: SIOMAA daily = mes abierto · Reporte Patentamiento = cierre oficial · CAFAM = referencia/fallback si está actualizado · Pivot = estructura · Importaciones = supply, no patentamientos';
  const fresh=document.getElementById('freshness');
  if(fresh&&V27_OFFICIAL)fresh.textContent=`OFICIAL ${V27_OFFICIAL.cutoff} · ${fmt(V27_OFFICIAL.value)}`;
}

function v27boot(){
  if(v27applyOfficialReport()){
    try{syncUserScenario();}catch{}
    try{render();}catch(e){console.error('v27 render',e)}
    setTimeout(v27decorate,0);
  }else setTimeout(v27boot,120);
}
v27boot();
