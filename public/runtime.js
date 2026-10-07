function renderData(){
  const meta=DATA.seasonality.metadata;
  return head("TRAZABILIDAD · DEFINICIONES · FÓRMULAS","De dónde sale cada número","Fuentes, cortes, transformaciones y límites forman parte del producto. Nada se corrige silenciosamente.")+
  `<div class="grid two">${card("Motor de forecast","Cálculo de la proyección independiente.",`<div class="formula">Nivel desestacionalizado = MEDIANA(mercado / índice mensual, últimos 6 meses)<br><br>Crecimiento(h) = 3,5% + (YoY reciente − 3,5%) × 0,68ʰ<br><br>Base(h) = nivel × índice_mes × (1 + crecimiento(h))^(h/12)<br><br>Down / Up = Base × banda de incertidumbre creciente</div><p class="method-note">${DATA.forecast.method}. No se fuerza al objetivo Honda ni a un presupuesto.</p>`,"FÓRMULA")}${card("Estacionalidad","Cómo se midió mercado y segmentos.",`<div class="formula">Índice(mes,año) = 12 × volumen_mes / volumen_anual<br><br>Índice robusto(mes) = MEDIANA 2010–2025<br><br>2026 parcial = ritmo / validación, no año completo<br><br>NORMALIZACIÓN: Σ índices = 12</div><p class="method-note">${meta.partial_2026_policy}. Reconciliación máxima: ${meta.reconciliation_max_abs}.</p>`,meta.available_history)}</div>`+
  `<div class="grid two">${card("Fuentes gobernadas","Rol explícito y cortes visibles.",`<div class="source-list">${DATA.sources.map(source=>`<div class="source"><div><b>${source.name}</b><small>${source.role}${source.sheet?` · ${source.sheet}`:""}</small></div>${source.url?`<a href="${source.url}" target="_blank" rel="noreferrer">ABRIR ↗</a>`:badge("ARCHIVO USUARIO","amber")}</div>`).join("")}</div>`,"FUENTES")}${card("Controles automáticos","QA del dataset y de la app.",`<div class="signals"><div class="signal"><div class="signal-top"><h3>Perfiles estacionales</h3>${badge("12,000 ✓","green")}</div><p>Cada curva suma exactamente 12.</p></div><div class="signal"><div class="signal-top"><h3>Forecast segmentado</h3>${badge("RECONCILIADO ✓","green")}</div><p>Cada escenario y mes suma exactamente al total.</p></div><div class="signal"><div class="signal-top"><h3>Gap de fuentes</h3>${badge("VISIBLE","amber")}</div><p>CAFAM ${fmt(DATA.executive.cafam_latest)} vs Pivot ${fmt(DATA.executive.pivot_latest)}. No se elimina la diferencia.</p></div><div class="signal"><div class="signal-top"><h3>Importaciones</h3>${badge("SEPARADAS","green")}</div><p>No se suman a patentamientos.</p></div></div>`,"QA")}</div>`+
  card("Estado de módulos","Qué está conectado y qué depende de actualización de fuente.",`<div class="module-status"><div>${badge("LIVE DATASET","green")}<b>Mercado / Forecast / Segmentos</b><small>Operativos</small></div><div>${badge("CURRENT SNAPSHOT","green")}<b>Competencia / Honda</b><small>Sep-26</small></div><div>${badge("PIVOT READY","green")}<b>Marcas / Grupos / Modelos / Rolling</b><small>Corte ${DATA.meta.structure_cutoff||DATA.meta.segment_cutoff}</small></div><div>${badge("SUPPLY","amber")}<b>Importaciones</b><small>Corte ${DATA.meta.imports_cutoff||"—"}</small></div><div>${badge("FRAMEWORK","amber")}<b>Affordability</b><small>Expandible con fuentes alineadas</small></div></div>`,"SYSTEM STATUS");
}

function bindChartTips(){$$("[data-tip]").forEach(node=>{node.addEventListener("pointerenter",event=>{const parts=node.dataset.tip.split("|");const tip=$("#tooltip");tip.innerHTML=`<b>${parts[0]}</b><br>${parts.slice(1).join(" · ")}`;tip.hidden=false;positionTip(event)});node.addEventListener("pointermove",positionTip);node.addEventListener("pointerleave",()=>$("#tooltip").hidden=true)})}
function positionTip(event){const tip=$("#tooltip");tip.style.left=`${Math.min(innerWidth-245,event.clientX+14)}px`;tip.style.top=`${Math.max(8,event.clientY-48)}px`}
function bindViewActions(){
  $$(".tax-btn").forEach(b=>b.addEventListener("click",()=>{state.taxonomy=b.dataset.tax;render()}));
  $$(".product-tab").forEach(b=>b.addEventListener("click",()=>{state.productModel=b.dataset.product;render()}));
  $$("[data-export]").forEach(b=>b.addEventListener("click",()=>exportReport(b.dataset.export)));
}
function render(){location.hash=state.view;$("#viewTitle").textContent=TITLES[state.view];$$("#navigation button").forEach(button=>button.classList.toggle("active",button.dataset.view===state.view));const renderers={overview:renderOverview,argentina:renderArgentina,market:renderMarket,competition:renderCompetition,forecast:renderForecast,segments:renderSegments,honda:renderHonda,product:renderProduct,imports:renderImports,intelligence:renderIntelligence,reports:renderReports,data:renderData};$("#content").innerHTML=(renderers[state.view]||renderOverview)();bindChartTips();bindViewActions();$("#content").focus({preventScroll:true});$("#sidebar").classList.remove("open")}

function download(name,type,text){const blob=new Blob([text],{type});const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=name;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},500)}
function exportReport(kind){
  if(kind==="pdf"){window.print();return}
  if(kind==="csv"){
    const rows=[["SECTION","NAME","VALUE","SHARE","MOM","YOY"],...DATA.competition.top_brands.map(r=>["TOP_BRANDS",r.name,r.value,r.share,r.mom,r.yoy]),...DATA.competition.top_models.map(r=>["TOP_MODELS",r.name,r.value,r.share,r.mom,r.yoy]),["FORECAST","PERIOD","DOWN","BASE","UP",""],...DATA.forecast.rows.map(r=>["FORECAST",r.period,r.down,r.base,r.up,""])];
    const csv=rows.map(row=>row.map(v=>`"${String(v??"").replaceAll('"','""')}"`).join(";")).join("\n");download("argentina-motorcycle-intelligence.csv","text/csv;charset=utf-8",`\ufeff${csv}`);return
  }
  if(kind==="ppt"){
    const body=reportSlides().replaceAll('class="report-deck"','class="report-deck ppt"');
    const html=`<html><head><meta charset="utf-8"><style>body{font-family:Arial;color:#101722}.report-slide{width:1200px;height:675px;page-break-after:always;padding:45px;box-sizing:border-box;border-left:14px solid #e0182d}.report-slide h2{font-size:34px}.slide-kpis{display:flex;gap:20px}.slide-kpis div{padding:20px;border:1px solid #ddd}.slide-kpis b{display:block;font-size:28px}.bars{width:100%}.bar-row{margin:10px}.hbar{height:10px;background:#eee}.hbar i{display:block;height:100%;background:#2b69c9}.bar-label{display:flex;justify-content:space-between}.chart-shell svg{width:100%;height:430px}</style></head><body>${body}</body></html>`;
    download("argentina-motorcycle-intelligence.ppt","application/vnd.ms-powerpoint",html)
  }
}

function bind(){
  $$("#navigation button").forEach(button=>button.addEventListener("click",()=>{state.view=button.dataset.view;render()}));
  [["periodFilter","period"],["calendarFilter","calendar"],["scenarioFilter","scenario"],["segmentFilter","segment"]].forEach(([id,key])=>$("#"+id).addEventListener("change",event=>{state[key]=event.target.value;render()}));
  $("#resetFilters").addEventListener("click",()=>{Object.assign(state,{period:"24",calendar:"CY",scenario:"base",segment:"TOTAL"});["periodFilter","calendarFilter","scenarioFilter","segmentFilter"].forEach(id=>$("#"+id).selectedIndex=0);render()});
  $("#menu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));
  $("#refresh").addEventListener("click",init);
  $("#quickReport").addEventListener("click",()=>document.getElementById("method")?.scrollIntoView({behavior:"smooth",block:"start"}));
  window.addEventListener("hashchange",()=>{const v=location.hash.slice(1);if(v in TITLES&&v!==state.view){state.view=v;render()}})
}

async function fetchJsonRequired(url,label){
  const r=await fetch(url,{cache:"no-store"});
  if(!r.ok)throw new Error(`${label}: HTTP ${r.status}`);
  try{return await r.json()}catch(e){throw new Error(`${label}: JSON inválido`)}
}
async function fetchJsonOptional(url){
  try{const r=await fetch(url,{cache:"no-store"});if(!r.ok)return null;return await r.json()}catch{return null}
}

async function init(){
  try{
    $("#freshness").textContent="ACTUALIZANDO";
    const [base,competition,hondaProduct,modules,rolling,daily]=await Promise.all([
      fetchJsonRequired("/data/intelligence.json","Mercado/forecast"),
      fetchJsonRequired("/data/competition.json","Competencia"),
      fetchJsonRequired("/data/honda-product.json","Honda/producto"),
      fetchJsonRequired("/data/intelligence-modules.json","Módulos"),
      fetchJsonRequired("/data/rolling-entities.json","Historia Pivot / Rolling"),
      fetchJsonOptional("/data/daily-open-month.json")
    ]);
    DATA={...base,...competition,...hondaProduct,...modules,meta:{...base.meta,...(modules.meta_patch||{})}};
    if(typeof V3_ROLL!=="undefined")V3_ROLL=rolling;
    if(typeof V3_DAILY!=="undefined"&&daily)V3_DAILY=daily;
    window.__ROLLING_READY__=true;
    window.__ROLLING_CUTOFF__=rolling.cutoff||"2026-09";
    $("#cutoffSide").textContent=`Mercado ${DATA.meta.market_cutoff} · Pivot ${rolling.cutoff||DATA.meta.structure_cutoff||DATA.meta.segment_cutoff}`;
    $("#freshness").textContent=`ROLLING READY · ${rolling.cutoff||DATA.meta.market_cutoff}`;
    $("#footerMeta").textContent=`${DATA.meta.app} · ${DATA.meta.architecture} · Pivot precalculada · ${new Date(DATA.meta.enriched_at||DATA.meta.generated_at).toLocaleString("es-AR")}`;
    const hash=location.hash.slice(1);state.view=hash in TITLES?hash:state.view;
    $("#loading").style.display="none";$("#app").hidden=false;render();
  }catch(error){
    console.error(error);
    $("#loading").innerHTML=`<div class="loading-mark">!</div><h2>No se pudo completar el bootstrap</h2><p>${error.message}</p><small>No se muestra un reporte parcial: la historia Pivot/rolling debe estar disponible antes de analizar.</small>`;
  }
}
bind();init();
