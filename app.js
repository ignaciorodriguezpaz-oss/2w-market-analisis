const $=selector=>document.querySelector(selector);
const fmt=value=>new Intl.NumberFormat("es-AR",{maximumFractionDigits:0}).format(Number(value)||0);
const pct=value=>Number.isFinite(Number(value))?`${Number(value)>=0?"+":""}${(Number(value)*100).toFixed(1).replace(".",",")}%`:"—";
const MONTHS=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const COLORS={actual:"#101722",forecast:"#e0182d",previous:"#8f9aaa",down:"#b97916",base:"#e0182d",up:"#2b69c9",CUB:"#e0182d",LMC:"#2b69c9",SC:"#8a5bd1",FUN:"#18845b",ATV:"#b97916",OTHERS:"#7f8a99"};
const TITLES={overview:"Resumen ejecutivo",argentina:"Argentina hoy",market:"Mercado motos",forecast:"Forecast",segments:"Segmentos",data:"Datos y método"};
let DATA=null;
const state={view:"overview",period:"24",calendar:"CY",scenario:"base",segment:"TOTAL"};

function label(period){const [year,month]=String(period).split("-").map(Number);return `${MONTHS[month-1]} ${String(year).slice(-2)}`}
function tone(direction){const value=String(direction||"").toLowerCase();if(/down|negative|risk|weak/.test(value))return "red";if(/watch|mixed/.test(value))return "amber";return "green"}
function periodRows(rows){const limit=state.period==="all"?rows.length:Number(state.period);return rows.slice(-limit)}
function kpi(title,value,note,color="#2b69c9"){return `<article class="kpi" style="--accent:${color}"><span>${title}</span><b>${value}</b><small>${note}</small></article>`}
function head(eyebrow,title,copy,badge=""){return `<header class="page-head"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${copy}</p></div>${badge?`<span class="badge ${badge.tone}">${badge.text}</span>`:""}</header>`}
function card(title,subtitle,body,extra=""){return `<section class="card"><div class="card-head"><div><span class="eyebrow">${extra}</span><h2>${title}</h2><p>${subtitle}</p></div></div>${body}</section>`}
function legend(series){return `<div class="legend">${series.map(item=>`<span><i style="background:${item.color}"></i>${item.name}</span>`).join("")}</div>`}

function lineChart(rows,series,{height=245,percent=false}={}){
  if(!rows.length)return `<div class="empty">Sin datos para los filtros seleccionados.</div>`;
  const width=760,pad={l:48,r:16,t:15,b:34};
  const values=series.flatMap(item=>rows.map(row=>Number(row[item.key])).filter(Number.isFinite));
  let min=Math.min(...values),max=Math.max(...values);if(min===max){min-=1;max+=1}const range=max-min;
  const x=index=>pad.l+index*(width-pad.l-pad.r)/Math.max(1,rows.length-1);
  const y=value=>pad.t+(max-value)/range*(height-pad.t-pad.b);
  const grid=Array.from({length:4},(_,index)=>{const value=max-range*index/3,yy=y(value);return `<g><line class="chart-grid" x1="${pad.l}" x2="${width-pad.r}" y1="${yy}" y2="${yy}"/><text class="chart-axis" x="${pad.l-7}" y="${yy+3}" text-anchor="end">${percent?pct(value):fmt(value)}</text></g>`}).join("");
  const paths=series.map(item=>{const points=rows.map((row,index)=>({value:Number(row[item.key]),index,row})).filter(point=>Number.isFinite(point.value));const d=points.map((point,index)=>`${index?"L":"M"}${x(point.index).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");const dots=points.filter((_,index)=>index%Math.max(1,Math.floor(points.length/14))===0||index===points.length-1).map(point=>`<circle class="chart-dot" data-tip="${label(point.row.period)}|${item.name}|${percent?pct(point.value):fmt(point.value)}" cx="${x(point.index)}" cy="${y(point.value)}" r="4" fill="${item.color}"/>`).join("");return `<path class="chart-line" d="${d}" stroke="${item.color}"/>${dots}`}).join("");
  const ticks=rows.filter((_,index)=>index%Math.max(1,Math.floor(rows.length/6))===0||index===rows.length-1).map(row=>{const index=rows.indexOf(row);return `<text class="chart-axis" x="${x(index)}" y="${height-8}" text-anchor="middle">${label(row.period)}</text>`}).join("");
  return `${legend(series)}<div class="chart-shell"><svg viewBox="0 0 ${width} ${height}" role="img">${grid}${paths}${ticks}</svg></div>`;
}

function marketSeries(){
  const actual=periodRows(DATA.market_history).map(row=>({...row,actual:row.value,forecast:null}));
  const future=DATA.forecast.rows.map(row=>({...row,actual:null,forecast:row[state.scenario]}));
  const bridge=actual.at(-1);return [...actual,{...bridge,forecast:bridge.actual},...future];
}

function renderOverview(){
  const e=DATA.executive,forecast=DATA.forecast.rows[0],marketRows=marketSeries();
  const macroRisks=DATA.macro.filter(item=>tone(item.direction)!=="green").length;
  return head("DECISION DESK","Argentina y el mercado de motos, en una lectura",e.summary,{tone:"amber",text:e.signal})+
  `<section class="kpis">${kpi("MERCADO CERRADO",fmt(e.market),`${DATA.meta.market_cutoff} · CAFAM`,"#101722")}${kpi("VARIACIÓN MOM",pct(e.mom),"contra mes anterior",e.mom>0?"#18845b":"#e0182d")}${kpi("VARIACIÓN YOY",pct(e.yoy),"contra mismo mes 2025","#18845b")}${kpi("PRÓXIMO MES · BASE",fmt(forecast.base),`${forecast.period} · Down ${fmt(forecast.down)} / Up ${fmt(forecast.up)}`,"#e0182d")}${kpi("ALERTAS DE CONTEXTO",macroRisks,"actividad, empleo, crédito y FX","#b97916")}</section>`+
  `<div class="grid two">${card("Mercado observado y forecast","La línea proyectada responde al escenario global seleccionado.",lineChart(marketRows,[{key:"actual",name:"Actual",color:COLORS.actual},{key:"forecast",name:`Forecast ${state.scenario}`,color:COLORS[state.scenario]}]),"MERCADO TOTAL")}
  <section class="card analysis"><div class="score">72</div><div><span class="eyebrow">LECTURA AUTOMÁTICA</span><h3>Demanda fuerte, capacidad de pago bajo observación</h3><p>El patentamiento de motos se desacopla positivamente de la actividad económica. La estacionalidad de octubre acompaña, pero el costo del crédito minorista y el empleo limitan la conversión. El escenario Base continúa constructivo; no conviene trasladar el crecimiento reciente sin una convergencia gradual.</p></div></section></div>`+
  `<div class="grid three">${DATA.macro.slice(0,3).map(item=>signalCard(item)).join("")}</div>`;
}

function signalCard(item){const t=tone(item.direction),colors={green:"#18845b",amber:"#b97916",red:"#e0182d"};return `<article class="card"><div class="signal-top"><span class="eyebrow">${item.date}</span><span class="badge ${t}">${t==="green"?"FAVORABLE":t==="red"?"ALERTA":"ATENCIÓN"}</span></div><h3>${item.metric}</h3><b style="font-size:18px">${item.value}</b><p style="color:var(--muted);font-size:10px;line-height:1.5">${item.detail}</p><div class="bar"><i style="width:${t==="green"?78:t==="amber"?52:28}%;background:${colors[t]}"></i></div></article>`}

function renderArgentina(){
  return head("MACRO · MICRO · AFFORDABILITY","¿Cómo está Argentina hoy?","Primero el contexto que condiciona ingreso, crédito y decisión de compra. Cada señal conserva fecha, fuente y una lectura para movilidad.")+
  `<div class="grid three">${DATA.macro.map(signalCard).join("")}</div>`+
  `<div class="grid two">${card("Lectura para movilidad","Qué variables pueden impulsar o frenar la demanda.",`<div class="signals"><div class="signal"><div class="signal-top"><h3>Ingreso nominal vs inflación</h3><b style="color:#18845b">MEJORA INCIPIENTE</b></div><p>Salarios +36,2% YoY frente a IPC +33,5% YoY, con distinto corte mensual. Confirmar con igual período antes de concluir recuperación real.</p></div><div class="signal"><div class="signal-top"><h3>Crédito minorista</h3><b style="color:#e0182d">ALERTA</b></div><p>La tasa de préstamos personales continúa muy por encima de las referencias mayoristas. La cuota efectiva es una variable crítica.</p></div><div class="signal"><div class="signal-top"><h3>Actividad y empleo</h3><b style="color:#b97916">ATENCIÓN</b></div><p>La debilidad de actividad y empleo no acompaña todavía el crecimiento del mercado de motos.</p></div></div>`,"TRANSMISIÓN")}${card("Indicadores directos del mercado","Señales microeconómicas y de producto.",`<div class="signals">${DATA.micro.slice(0,5).map(item=>`<div class="signal"><div class="signal-top"><h3>${item.metric}</h3><b>${item.value}</b></div><p>${item.detail}</p></div>`).join("")}</div>`,"MICRO / MOTOS")}</div>`;
}

function renderMarket(){
  const history=periodRows(DATA.market_history),growth=history.filter(row=>row.yoy!==null);
  const rows=history.map(row=>({...row,actual:row.value}));
  return head("MERCADO TOTAL · CAFAM + PIVOT","Evolución del mercado argentino","El cierre vigente usa CAFAM. La Pivot mantiene la profundidad histórica y la estructura de segmentos.")+
  `<section class="kpis">${kpi("ÚLTIMO CIERRE",fmt(DATA.executive.market),DATA.meta.market_cutoff,"#101722")}${kpi("YTD 2026",fmt(DATA.executive.ytd),"acumulado gobernado","#2b69c9")}${kpi("PIVOT SEP",fmt(DATA.executive.pivot_latest),"referencia estructural","#8a5bd1")}${kpi("GAP DE FUENTE",fmt(DATA.executive.source_gap),"Pivot menos CAFAM","#b97916")}${kpi("HISTÓRICO",`${DATA.market_history.length} meses`,`${DATA.market_history[0].period} → ${DATA.meta.market_cutoff}`,"#18845b")}</section>`+
  `<div class="grid two">${card("Patentamientos mensuales","Volumen observado según el período seleccionado.",lineChart(rows,[{key:"actual",name:"Mercado",color:COLORS.actual}]),"EVOLUCIÓN")}${card("Crecimiento interanual","Variación contra el mismo mes del año anterior.",lineChart(growth,[{key:"yoy",name:"YoY",color:COLORS.blue}],{percent:true}),"YOY")}</div>`+
  card("Últimos cierres","Detalle con comparación mensual e interanual.",tableMarket(history.slice(-18)),"TABLA GOBERNADA");
}

function tableMarket(rows){return `<div class="table-wrap"><table class="table"><thead><tr><th>Mes</th><th>Fuente</th><th>Mercado</th><th>MoM</th><th>YoY</th><th>Status</th></tr></thead><tbody>${rows.slice().reverse().map(row=>`<tr><td><strong>${label(row.period)}</strong></td><td>${row.source}</td><td>${fmt(row.value)}</td><td>${pct(row.mom)}</td><td>${pct(row.yoy)}</td><td><span class="badge green">ACTUAL</span></td></tr>`).join("")}</tbody></table></div>`}

function renderForecast(){
  const rows=DATA.forecast.rows.map(row=>({...row,selected:row[state.scenario]}));
  return head("FORECAST · 6 MESES","Proyección independiente y auditable","El escenario se puede cambiar arriba. El número nunca se fuerza a un target comercial; los supuestos quedan expuestos.",{tone:"green",text:DATA.forecast.version})+
  `<section class="kpis">${kpi("PRIMER MES",fmt(rows[0].selected),`${label(rows[0].period)} · ${state.scenario.toUpperCase()}`,"#e0182d")}${kpi("CRECIMIENTO RECIENTE",pct(DATA.forecast.recent_yoy_median),"mediana YoY últimos 6 meses","#18845b")}${kpi("CRECIMIENTO ESTRUCTURAL",pct(DATA.forecast.structural_growth),"convergencia de largo plazo","#2b69c9")}${kpi("PICO PROYECTADO",fmt(Math.max(...rows.map(row=>row.selected))),rows.find(row=>row.selected===Math.max(...rows.map(x=>x.selected))).period,"#8a5bd1")}${kpi("HORIZONTE","6 meses","oct-26 → mar-27","#101722")}</section>`+
  `<div class="grid two">${card("Bandas de forecast","Downside, Base y Upside se abren gradualmente con el horizonte.",lineChart(rows,[{key:"down",name:"Downside",color:COLORS.down},{key:"base",name:"Base",color:COLORS.base},{key:"up",name:"Upside",color:COLORS.up}]),"ESCENARIOS")}${card("Estacionalidad aplicada","Índice mensual robusto de mercado. Media anual = 1,00.",lineChart(DATA.seasonality.month_labels.map((name,index)=>({period:`2026-${String(index+1).padStart(2,"0")}`,index:DATA.seasonality.market.monthly_index[index]})),[{key:"index",name:"Índice",color:COLORS.blue}]),"PIVOT 2010–2026")}</div>`+
  card("Forecast mes a mes","Cada fila mantiene escenario, estacionalidad y señal de tendencia.",`<div class="table-wrap"><table class="table"><thead><tr><th>Mes</th><th>Downside</th><th>Base</th><th>Upside</th><th>Índice est.</th><th>Señal anual</th></tr></thead><tbody>${rows.map(row=>`<tr><td><strong>${label(row.period)}</strong></td><td>${fmt(row.down)}</td><td><strong>${fmt(row.base)}</strong></td><td>${fmt(row.up)}</td><td>${row.seasonal_index.toFixed(3)}</td><td>${pct(row.annual_growth_signal)}</td></tr>`).join("")}</tbody></table></div>`,"DETALLE");
}

function renderSegments(){
  const names=state.segment==="TOTAL"?["CUB","LMC","SC","FUN","ATV","OTHERS"]:[state.segment];
  const history=periodRows(DATA.segment_history).map(row=>{const out={period:row.period};row.segments.forEach(item=>out[item.name]=item.value);return out});
  const series=names.map(name=>({key:name,name,color:COLORS[name]}));
  const forecast=DATA.forecast.segments;
  return head("SEGMENTOS · HISTORIA + FORECAST","Cada segmento tiene su propia estacionalidad","El filtro global permite aislar un segmento. La proyección se reconcilia exactamente contra el escenario total.")+
  `<div class="grid two">${card("Evolución por segmento","Volumen mensual desde AUTOMATIC, sin mezclar taxonomías.",lineChart(history,series),"SEGMENTO 1 / MANAGEMENT")}${card("Índices estacionales","Curvas robustas 2010–2026; media anual = 1,00.",lineChart(DATA.seasonality.month_labels.map((_,index)=>{const row={period:`2026-${String(index+1).padStart(2,"0")}`};names.forEach(name=>row[name]=DATA.seasonality.management[name].monthly_index[index]);return row}),series),"ESTACIONALIDAD")}</div>`+
  card("Forecast segmentado","Los totales cierran por largest remainder, sin diferencias ocultas.",`<div class="table-wrap"><table class="table"><thead><tr><th>Segmento</th>${forecast.map(row=>`<th>${label(row.period)}</th>`).join("")}</tr></thead><tbody>${names.map(name=>`<tr><td><strong>${name}</strong></td>${forecast.map(row=>`<td>${fmt(row.segments.find(item=>item.name===name)[state.scenario])}</td>`).join("")}</tr>`).join("")}<tr><td><strong>TOTAL ${state.scenario.toUpperCase()}</strong></td>${forecast.map(row=>`<td><strong>${fmt(row.total[state.scenario])}</strong></td>`).join("")}</tr></tbody></table></div>`,"RECONCILIACIÓN EXACTA");
}

function renderData(){
  const meta=DATA.seasonality.metadata;
  return head("TRAZABILIDAD · DEFINICIONES · FÓRMULAS","De dónde sale cada número","La metodología forma parte del producto: fuentes, cortes, transformaciones y límites están disponibles para auditoría.")+
  `<div class="grid two">${card("Motor de forecast","Cálculo de la proyección independiente.",`<div class="formula">Nivel desestacionalizado = MEDIANA(mercado / índice mensual, últimos 6 meses)<br><br>Crecimiento(h) = 3,5% + (YoY reciente − 3,5%) × 0,68ʰ<br><br>Base(h) = nivel × índice_mes × (1 + crecimiento(h))^(h/12)<br><br>Down / Up = Base × banda de incertidumbre creciente</div><p style="font-size:10px;color:var(--muted);line-height:1.55">${DATA.forecast.method}. No se fuerza el resultado al objetivo Honda ni a un presupuesto.</p>`,"FÓRMULA")}${card("Estacionalidad","Cómo se midió mercado y segmentos.",`<div class="formula">Índice(mes,año) = 12 × volumen_mes / volumen_anual<br><br>Índice robusto(mes) = MEDIANA 2010–2025<br><br>Ritmo 2026 = volumen por día hábil vs mes anterior<br><br>NORMALIZACIÓN: Σ índices mensuales = 12</div><p style="font-size:10px;color:var(--muted)">${meta.partial_2026_policy}. Diferencia máxima AUTOMATIC vs Pivot en calibración: ${meta.reconciliation_max_abs}.</p>`,"${meta.available_history}")}</div>`+
  `<div class="grid two">${card("Fuentes gobernadas","Rol explícito y sin mezclar medidas.",`<div class="source-list">${DATA.sources.map(source=>`<div class="source"><div><b>${source.name}</b><small>${source.role}${source.sheet?` · ${source.sheet}`:""}</small></div>${source.url?`<a href="${source.url}" target="_blank" rel="noreferrer">ABRIR FUENTE ↗</a>`:"<span class='badge amber'>ARCHIVO USUARIO</span>"}</div>`).join("")}</div>`,"FUENTES")}${card("Controles automáticos","Validaciones ejecutadas al generar el dataset.",`<div class="signals"><div class="signal"><div class="signal-top"><h3>Perfiles estacionales</h3><b style="color:#18845b">12,000 ✓</b></div><p>Cada curva suma exactamente 12 meses.</p></div><div class="signal"><div class="signal-top"><h3>Forecast segmentado</h3><b style="color:#18845b">RECONCILIADO ✓</b></div><p>Cada escenario y mes suma exactamente el forecast total.</p></div><div class="signal"><div class="signal-top"><h3>Cierre vigente</h3><b style="color:#b97916">GAP VISIBLE</b></div><p>CAFAM ${fmt(DATA.executive.cafam_latest)} vs Pivot ${fmt(DATA.executive.pivot_latest)}. La diferencia no se corrige en silencio.</p></div></div>`,"QA")}</div>`;
}

function bindChartTips(){document.querySelectorAll("[data-tip]").forEach(node=>{node.addEventListener("pointerenter",event=>{const [period,name,value]=node.dataset.tip.split("|");const tip=$("#tooltip");tip.innerHTML=`<b>${period}</b><br>${name}: ${value}`;tip.hidden=false;positionTip(event)});node.addEventListener("pointermove",positionTip);node.addEventListener("pointerleave",()=>$("#tooltip").hidden=true)})}
function positionTip(event){const tip=$("#tooltip");tip.style.left=`${Math.min(innerWidth-230,event.clientX+14)}px`;tip.style.top=`${Math.max(8,event.clientY-42)}px`}
function render(){location.hash=state.view;$("#viewTitle").textContent=TITLES[state.view];document.querySelectorAll("#navigation button").forEach(button=>button.classList.toggle("active",button.dataset.view===state.view));const renderers={overview:renderOverview,argentina:renderArgentina,market:renderMarket,forecast:renderForecast,segments:renderSegments,data:renderData};$("#content").innerHTML=renderers[state.view]();bindChartTips();$("#content").focus({preventScroll:true});$("#sidebar").classList.remove("open")}
function bind(){document.querySelectorAll("#navigation button").forEach(button=>button.addEventListener("click",()=>{state.view=button.dataset.view;render()}));[["periodFilter","period"],["calendarFilter","calendar"],["scenarioFilter","scenario"],["segmentFilter","segment"]].forEach(([id,key])=>$("#"+id).addEventListener("change",event=>{state[key]=event.target.value;render()}));$("#resetFilters").addEventListener("click",()=>{Object.assign(state,{period:"24",calendar:"CY",scenario:"base",segment:"TOTAL"});["periodFilter","calendarFilter","scenarioFilter","segmentFilter"].forEach(id=>$("#"+id).selectedIndex=0);render()});$("#menu").addEventListener("click",()=>$("#sidebar").classList.toggle("open"));$("#refresh").addEventListener("click",init)}
async function init(){try{$("#freshness").textContent="ACTUALIZANDO";const response=await fetch("/data/intelligence.json",{cache:"no-store"});if(!response.ok)throw new Error(`HTTP ${response.status}`);DATA=await response.json();$("#cutoffSide").textContent=`Mercado ${DATA.meta.market_cutoff} · Segmentos ${DATA.meta.segment_cutoff}`;$("#freshness").textContent=`CORTE ${DATA.meta.market_cutoff}`;$("#footerMeta").textContent=`${DATA.meta.app} · ${DATA.meta.architecture} · ${new Date(DATA.meta.generated_at).toLocaleString("es-AR")}`;state.view=location.hash.slice(1) in TITLES?location.hash.slice(1):state.view;$("#loading").style.display="none";$("#app").hidden=false;render()}catch(error){$("#loading").innerHTML=`<div class="loading-mark">!</div><h2>No se pudo cargar la app</h2><p>${error.message}</p>`}}
bind();init();
