/* 2W Market Analysis v31 — fixed governed report + separate interactive tools */
const V31_VERSION='20261007-static-analysis-tools-v1';
const V31_ANALYSIS_INDEX=[
  ['context','01','Argentina hoy'],['executive','02','Resumen ejecutivo'],['consumer','03','Consumidor & movilidad'],['market','04','Mercado + Daily'],['structure','05','Estructura competitiva'],['forecast','06','Forecast CY / KI'],['planning','07','Honda + Plan User'],['actions','08','Noticias / señales'],['method','09','Metodología & datos']
];
const V31_TOOL_INDEX=[
  ['tool-segment','T1','Modelos por segmento'],['tool-competition','T2','Marca / grupo / modelo'],['tool-product','T3','Producto & elasticidad'],['tool-forecast','T4','Forecast / imports / backtest'],['tool-scenario','T5','Escenarios'],['tool-news','T6','Radar de noticias']
];

function v31pageSwitches(){
  return `<button class="v31-page-switch ${V12_PAGE==='analysis'?'active':''}" data-v31-page="analysis"><i>A</i><span>ANÁLISIS GENERAL</span></button>
  <button class="v31-page-switch ${V12_PAGE==='tools'?'active':''}" data-v31-page="tools"><i>T</i><span>HERRAMIENTAS</span></button>
  <button class="v31-page-switch ${V12_PAGE==='user'?'active':''}" data-v31-page="user"><i>U</i><span>PLAN USER</span></button>`;
}
function v31nav(){
  const idx=V12_PAGE==='analysis'?V31_ANALYSIS_INDEX:V12_PAGE==='tools'?V31_TOOL_INDEX:[];
  return `${v31pageSwitches()}${idx.length?'<div class="v12-nav-sep"></div>':''}${idx.map(([id,n,t])=>`<button data-v31-anchor="${id}"><i>${n}</i><span>${t}</span></button>`).join('')}`;
}
function v31withFixedCriteria(fn){
  const saved={period:state.period,calendar:state.calendar,scenario:state.scenario,segment:state.segment};
  const savedMetric=typeof V6_METRIC!=='undefined'?V6_METRIC:null;
  const savedNews=typeof NR_FILTER!=='undefined'?{...NR_FILTER}:null;
  Object.assign(state,{period:'24',calendar:'KI',scenario:'base',segment:'TOTAL'});
  if(typeof V6_METRIC!=='undefined')V6_METRIC='volume';
  if(typeof NR_FILTER!=='undefined')Object.assign(NR_FILTER,{category:'ALL',status:'ALL',impact:'ALL'});
  let html='';
  try{html=fn()}finally{
    Object.assign(state,saved);
    if(savedMetric!==null)V6_METRIC=savedMetric;
    if(savedNews&&typeof NR_FILTER!=='undefined')Object.assign(NR_FILTER,savedNews);
  }
  return html;
}
function v31fixedStructure(){
  const row=DATA.segment_history?.at(-1),segs=(row?.segments||[]).slice().sort((a,b)=>b.value-a.value);
  const brand=typeof v4rankTable==='function'?v4rankTable('brand',5):pending('Top marcas','Historia estructural no disponible.');
  const group=typeof v4rankTable==='function'?v4rankTable('group',5):pending('Top grupos','Historia estructural no disponible.');
  const model=typeof v4rankTable==='function'?v4rankTable('model',5):pending('Top modelos','Historia estructural no disponible.');
  const groupChart=typeof v3groupChart==='function'?v3groupChart():'';
  return chapter('structure','05','Estructura competitiva · lectura obligatoria','El reporte fijo resume segmentos y Top 5 de marcas, grupos y modelos. El detalle filtrable vive en Herramientas.',`<div class="v31-fixed-structure">
    <div class="v31-fixed-note"><b>Criterio fijo:</b> Mercado total · Top 5 · Volumen · último cierre oficial. Para Segmento 1/2, Market Share, Top 10/15 o un modelo específico usar Herramientas.</div>
    <div class="grid two">${card('Mix por segmento','Último corte estructural de la Pivot.',barChart(segs,{showShare:true,color:r=>COLORS[r.name]||COLORS.blue,limit:7}),'SEGMENTS')}${card('Grupos clave','Iraola, Honda y principales grupos · volumen real + outlook cuando está disponible.',groupChart,'GROUP VIEW')}</div>
    <div class="grid three">${card('Top 5 marcas','Volumen, MS, MoM, YoY y rolling.',brand,'TOP 5')}${card('Top 5 grupos','Comparativa estructural de grupos empresarios.',group,'TOP 5')}${card('Top 5 modelos','Ranking general; análisis por segmento queda en Herramientas.',model,'TOP 5')}</div>
  </div>`);
}
function v31analysisPage(){
  return v31withFixedCriteria(()=>`<div class="single-report v31-static-report">
    <div class="report-cover"><span>2W MARKET ANALYSIS · GOVERNED STANDARD REPORT</span><h1>Argentina Motorcycle Intelligence</h1><p>Reporte estándar: contexto → consumidor → mercado → competencia → forecast → Honda / Plan User → señales → control metodológico.</p>
      <div class="v31-cover-note"><span>CRITERIO FIJO</span><span>Mercado total</span><span>Base central + Down/Up</span><span>Actuals bloqueados</span><span>CY + KI</span><span>Top 5</span><span>Volumen</span></div>
    </div>
    ${updateBand()}${ctx()}${exec()}${consumer()}${market()}${v31fixedStructure()}${forecast()}${planning()}${typeof v29planCausalBlock==='function'?v29planCausalBlock():''}${actions()}${method()}
  </div>`);
}
function v31toolsIntro(){
  return `<div class="v31-tools-head"><span>DEEP DIVE · INTERACTIVE WORKSPACE</span><h1>Herramientas de análisis</h1><p>Acá sí podés mover filtros, cambiar segmento, comparar volumen vs market share, elegir modelos, simular precio, revisar escenarios y profundizar señales. Nada de esto altera el criterio del Análisis General ni del reporte estándar.</p><div class="v31-tool-index">${V31_TOOL_INDEX.map(([id,n,t])=>`<a href="#${id}"><b>${n} · ${t}</b><small>${id==='tool-segment'?'Segmento 1/2 · Top 5 modelos':id==='tool-competition'?'Top 5/10 · Rolling · Volumen/MS':id==='tool-product'?'Ficha · Top competidores · precio · elasticidad':id==='tool-forecast'?'CY/KI · imports · bias · backtest':id==='tool-scenario'?'Down/Base/Up · likelihood · sensibilidad':'Noticias · rumores · impacto · confianza'}</small></a>`).join('')}</div></div>`;
}
function v31toolSection(id,title,copy,body){return `<section id="${id}" class="v31-tool-section"><header><span>HERRAMIENTA</span><h2>${title}</h2><p>${copy}</p></header>${body}</section>`}
function v31toolsPage(){
  const comp=`${typeof v6metricSwitch==='function'?v6metricSwitch():''}${typeof v4entityBlock==='function'?v4entityBlock('brand'):''}${typeof v4entityBlock==='function'?v4entityBlock('group'):''}${typeof v4entityBlock==='function'?v4entityBlock('model'):''}`;
  return `<div class="single-report v31-tools-page">${v31toolsIntro()}
    ${v31toolSection('tool-segment','Modelos por segmento','Elegí Segmento 1 o Segmento 2. La apertura inicial es Top 5 y después podés profundizar.',typeof v28segmentModelBlock==='function'?v28segmentModelBlock():pending('Segmentos','Módulo no disponible.'))}
    ${v31toolSection('tool-competition','Marca / grupo / modelo','Compará rolling, MoM, YoY, forecast y alterná entre Volumen y Market Share.',comp)}
    ${v31toolSection('tool-product','Producto & competencia','Modelo específico, Top competidores, Price Evolution, forecast volumen/share y elasticidad.',typeof v11ProductBlock==='function'?v11ProductBlock():pending('Producto','Módulo no disponible.'))}
    ${v31toolSection('tool-forecast','Forecast / imports / bias / backtest','Profundización del forecast independiente y sus controles de gobernanza.',forecast())}
    ${v31toolSection('tool-scenario','Escenarios & sensibilidad','Herramienta de escenarios. El Plan User anual/mensual se administra en su página propia.',typeof userBlock==='function'?userBlock():pending('Escenarios','Módulo no disponible.'))}
    ${v31toolSection('tool-news','Radar de noticias','Filtrá categorías, estado e impacto para profundizar señales particulares.',actions())}
  </div>`;
}
function v31setMode(){
  document.body.classList.remove('v31-analysis-mode','v31-tools-mode','v31-user-mode');
  document.body.classList.add(V12_PAGE==='analysis'?'v31-analysis-mode':V12_PAGE==='tools'?'v31-tools-mode':'v31-user-mode');
  const filters=document.querySelector('.filters');if(filters)filters.style.display=V12_PAGE==='tools'?'flex':'none';
  const crumb=document.querySelector('.breadcrumbs span');if(crumb)crumb.textContent=V12_PAGE==='analysis'?'2W MARKET ANALYSIS · STANDARD REPORT':V12_PAGE==='tools'?'2W MARKET ANALYSIS · INTERACTIVE TOOLS':'2W MARKET ANALYSIS · PLAN USER';
  const title=document.getElementById('viewTitle');if(title)title.textContent=V12_PAGE==='analysis'?'Análisis General · criterio fijo':V12_PAGE==='tools'?'Herramientas de análisis':'Plan User · Budget / FCST versions';
}
function v31bindNavigation(){
  $$('[data-v31-page]').forEach(b=>b.onclick=()=>{try{v12captureMonthlyInputs?.()}catch{};V12_PAGE=b.dataset.v31Page;render();window.scrollTo({top:0,behavior:'smooth'})});
  $$('[data-v31-anchor]').forEach(b=>b.onclick=()=>document.getElementById(b.dataset.v31Anchor)?.scrollIntoView({behavior:'smooth',block:'start'}));
  $$('.v31-tool-index a').forEach(a=>a.onclick=e=>{e.preventDefault();document.querySelector(a.getAttribute('href'))?.scrollIntoView({behavior:'smooth',block:'start'})});
}

const V31_BASE_EXPORT=typeof exportReport==='function'?exportReport:null;
if(V31_BASE_EXPORT){
  exportReport=function(kind){
    if(kind==='pdf'){
      V12_PAGE='analysis';render();setTimeout(()=>window.print(),120);return;
    }
    if(kind==='ppt'){
      const saved={period:state.period,calendar:state.calendar,scenario:state.scenario,segment:state.segment};
      Object.assign(state,{period:'24',calendar:'KI',scenario:'base',segment:'TOTAL'});
      try{return V31_BASE_EXPORT(kind)}finally{Object.assign(state,saved)}
    }
    return V31_BASE_EXPORT(kind);
  };
}

render=function(){
  if(!DATA)return;
  try{syncUserScenario()}catch{}
  v31setMode();
  const navEl=document.getElementById('navigation');if(navEl)navEl.innerHTML=v31nav();
  const content=document.getElementById('content');if(!content)return;
  content.innerHTML=V12_PAGE==='analysis'?v31analysisPage():V12_PAGE==='tools'?v31toolsPage():v12userSheet();
  try{bindSingle()}catch(e){console.error('v31 bindSingle',e)}
  v31bindNavigation();
  try{bindChartTips()}catch{}
  try{if(V12_PAGE==='analysis'&&typeof observe==='function')observe();else if(typeof robs!=='undefined'&&robs)robs.disconnect()}catch{}
  document.getElementById('sidebar')?.classList.remove('open');
};

(function v31boot(){
  const ready=()=>{
    if(typeof DATA!=='undefined'&&DATA&&typeof v12userSheet==='function'){
      const q=document.getElementById('quickReport');
      if(q&&!q.dataset.v31){q.dataset.v31='1';q.textContent='▣ Reporte fijo';q.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();V12_PAGE='analysis';render();window.scrollTo({top:0,behavior:'smooth'})},true)}
      try{render()}catch(e){console.error('V31 architecture render',e)}
    }else setTimeout(ready,120);
  };ready();
})();
