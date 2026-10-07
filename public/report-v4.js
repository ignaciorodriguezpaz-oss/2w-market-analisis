/* 2W Market Analysis v4 — Pivot-driven rankings/forecasts + causal User Plan */
const V4_LIMITS={brand:10,group:10,model:10};
const V4_LABELS={brand:'Marcas',group:'Grupos',model:'Modelos'};

function v4rankedNames(type,limit){
  if(!V3_ROLL)return [];
  const hist=v3hist(type),last=hist.at(-1)||{};
  return v3names(type).slice().sort((a,b)=>(Number(last[b])||0)-(Number(last[a])||0)).slice(0,limit);
}
function v4entityKI(type,name){
  const m=v3entityMetrics(type,name),h=v3hist(type);
  const actual=v3sum(h.filter(r=>r.period>='2026-04'&&r.period<='2026-09').map(r=>Number(r[name])||0));
  const down=actual+v3sum(m.f.map(x=>x.down));
  const base=actual+v3sum(m.f.map(x=>x.base));
  const up=actual+v3sum(m.f.map(x=>x.up));
  const user=actual+v3sum(m.f.map((x,i)=>Math.round((DATA.forecast.rows[i]?.user||0)*(x.share||0))));
  return {...m,actualKI:actual,kiDown:down,kiBase:base,kiUp:up,kiUser:user};
}
function v4rankTable(type,limit){
  if(!V3_ROLL)return pending('Ranking Pivot','Cargando historia de Registrations.');
  const total=Number(V3_ROLL.pivot_total_sep_2026)||80925;
  const names=v4rankedNames(type,limit);
  return `<div class="table-wrap"><table class="table v4-rank"><thead><tr><th>#</th><th>${type==='brand'?'Marca':type==='group'?'Grupo':'Modelo'}</th><th>Sep</th><th>Share</th><th>MoM</th><th>YoY</th><th>R3M</th><th>R6M</th><th>R12M</th></tr></thead><tbody>${names.map((n,i)=>{const r=v3entityMetrics(type,n);return `<tr><td>${i+1}</td><td><strong>${n}</strong></td><td>${fmt(r.current)}</td><td>${pct(r.current/total)}</td><td class="${ratioTone(r.mom)}-txt">${pct(r.mom)}</td><td class="${ratioTone(r.yoy)}-txt">${pct(r.yoy)}</td><td>${fmt(r.r3)}</td><td>${fmt(r.r6)}</td><td>${fmt(r.r12)}</td></tr>`}).join('')}</tbody></table></div>`;
}
function v4forecastTable(type,limit){
  if(!V3_ROLL)return pending('Forecast por entidad','Cargando historia de Registrations.');
  const names=v4rankedNames(type,limit);
  return `<div class="table-wrap"><table class="table v4-fcst"><thead><tr><th>${type==='brand'?'Marca':type==='group'?'Grupo':'Modelo'}</th><th>Sep A</th><th>Oct B</th><th>Nov B</th><th>Dic B</th><th>Ene B</th><th>Feb B</th><th>Mar B</th><th>KI Down</th><th>KI Base</th><th>KI Up</th><th>KI Plan</th></tr></thead><tbody>${names.map(n=>{const r=v4entityKI(type,n);return `<tr><td><strong>${n}</strong></td><td>${fmt(r.current)}</td>${r.f.map(x=>`<td>${fmt(x.base)}</td>`).join('')}<td>${fmt(r.kiDown)}</td><td><strong>${fmt(r.kiBase)}</strong></td><td>${fmt(r.kiUp)}</td><td class="v4-user-cell">${fmt(r.kiUser)}</td></tr>`}).join('')}</tbody></table></div>`;
}
function v4limitSwitch(type){const l=V4_LIMITS[type];return `<div class="v4-switch"><span>Vista</span><button data-v4-type="${type}" data-v4-limit="5" class="${l===5?'active':''}">Top 5</button><button data-v4-type="${type}" data-v4-limit="10" class="${l===10?'active':''}">Top 10</button></div>`}
function v4entityBlock(type){const l=V4_LIMITS[type];return `<section class="card v4-entity"><div class="card-head"><div><span class="eyebrow">PIVOT MASTER · REGISTRATIONS</span><h2>${V4_LABELS[type]}</h2><p>Ranking, MoM, YoY y Rolling reales; forecast estimado contra el mercado independiente.</p></div>${v4limitSwitch(type)}</div>${v4rankTable(type,l)}<div class="v4-subhead"><b>Forecast ${V4_LABELS[type].toLowerCase()}</b><span>Oct-26 → Mar-27 · Down/Base/Up/Plan a KI</span></div>${v4forecastTable(type,l)}</section>`}

structure=function(){
  const row=DATA.segment_history?.at(-1);let segs=(row?.segments||[]).slice().sort((a,b)=>b.value-a.value);if(state.segment!=='TOTAL')segs=segs.filter(x=>x.name===state.segment);
  return chapter('structure','05','Segmentos, marcas, grupos y modelos','La Pivot maestra gobierna la historia competitiva. Top 5/10, MoM, YoY, Rolling y forecast quedan en la misma lectura.',`<div class="grid two">${card('Segmentos','Último corte estructural.',barChart(segs.map(x=>({name:x.name,value:x.value,share:x.share})),{showShare:true,color:r=>COLORS[r.name]||COLORS.blue}),'ACTUAL')}${card('Grupos: actual + forecast Base','Iraola, Honda, La Emilia, Gilera y Keller en trayectoria comparable.',v3groupChart(),'GROUP OUTLOOK')}</div>${v4entityBlock('brand')}${v4entityBlock('group')}${v4entityBlock('model')}<div class="note"><b>Fuente:</b> 2606 Segmentation + Registrations + Pivot Table.xlsx / Registrations · Sep-26 Pivot ${fmt(V3_ROLL?.pivot_total_sep_2026||80925)}. CAFAM sigue gobernando el total oficial del mercado; la Pivot gobierna esta apertura estructural.</div>`)
};

function v4macroEvidence(){
  const rows=(DATA.macro||[]).slice(0,6);
  if(!rows.length)return pending('Macro','Sin señales macro cargadas.');
  return `<div class="v4-evidence">${rows.map(x=>{const t=tone(x.direction);return `<div><span>${badge(t==='green'?'APOYA':t==='red'?'RIESGO':'VIGILAR',t)}</span><b>${x.metric}</b><strong>${x.value}</strong><small>${x.detail||''}</small></div>`}).join('')}</div>`;
}
function v4planMath(){
  const fit=v3planFit(),prev=actualKI(2025),actualM=v3actualMarketKI(),actualH=v3actualHondaKI();
  const baseRemain=v3sum(DATA.forecast.rows.map(r=>r.base)),upRemain=v3sum(DATA.forecast.rows.map(r=>r.up)),downRemain=v3sum(DATA.forecast.rows.map(r=>r.down));
  const planRemain=Math.max(0,Number(V3_PLAN.marketKI)-actualM),months=DATA.forecast.rows.length||6;
  const hBaseRemain=v3sum((DATA.honda?.forecast||[]).map(r=>r.base)),hPlanRemain=Math.max(0,Number(V3_PLAN.hondaKI)-actualH);
  const marketUplift=baseRemain?planRemain/baseRemain-1:null,hondaUplift=hBaseRemain?hPlanRemain/hBaseRemain-1:null;
  const growthVsPrev=prev.value?Number(V3_PLAN.marketKI)/prev.value-1:null;
  const shareGap=fit.share-(Number(DATA.honda?.share)||0);
  return {fit,prev,actualM,actualH,baseRemain,upRemain,downRemain,planRemain,months,hBaseRemain,hPlanRemain,marketUplift,hondaUplift,growthVsPrev,shareGap,planAvg:planRemain/months,baseAvg:baseRemain/months,hPlanAvg:hPlanRemain/months,hBaseAvg:hBaseRemain/months};
}
function v4planLevel(m){
  if(m.fit.p>m.fit.k.up)return {tone:'red',title:'PLAN POR ENCIMA DEL UPSIDE',copy:'Para alcanzarlo deben coincidir varias condiciones favorables y sostenerse durante el resto del KI.'};
  if(m.fit.p>m.fit.k.base)return {tone:'amber',title:'PLAN EXIGENTE PERO DENTRO DEL RANGO',copy:'Necesita un mercado más cerca del Upside que del Base y una mejora de share Honda.'};
  if(m.fit.p>=m.fit.k.down)return {tone:'green',title:'PLAN DENTRO DEL RANGO',copy:'Es compatible con el abanico actual; el foco pasa a ejecución Honda y mix.'};
  return {tone:'amber',title:'PLAN POR DEBAJO DEL DOWNSIDE',copy:'El volumen no exige un entorno fuerte, pero puede implicar una lectura demasiado defensiva frente al momentum actual.'};
}
function v4conditions(m){
  const strong=m.fit.p>m.fit.k.base,aboveUp=m.fit.p>m.fit.k.up;
  const marketNeed=aboveUp?'crecimiento sostenido por encima del escenario optimista':strong?'ritmo cercano al Upside, sin deterioro del run-rate':'cumplimiento del rango Base/Down';
  const macroNeed=aboveUp?'desinflación, salario real positivo, crédito más accesible y FX sin shock, todos a la vez':strong?'salario real y crédito al menos estables/mejorando; actividad sin contracción severa':'sin shock macro que rompa la demanda';
  const consumerNeed=strong?'la cuota/ingreso no debería empeorar y el precio de entrada debe conservar ventaja frente al auto':'affordability estable alcanza; no requiere una mejora extraordinaria';
  const hondaNeed=m.shareGap>0?`Honda debe ganar ${pp(m.shareGap)} vs su share actual y sostener ~${fmt(m.hPlanAvg)} uds/mes restantes.`:`Honda puede cumplir sin ganar share estructural frente al nivel actual.`;
  return [
    ['MACRO',macroNeed,'ASSUMPTION'],['CONSUMIDOR',consumerNeed,'ASSUMPTION'],['MERCADO',`${marketNeed}. El plan exige ~${fmt(m.planAvg)} uds/mes restantes vs Base ~${fmt(m.baseAvg)}.`,m.marketUplift>0?'STRETCH':'ALIGNED'],['HONDA',hondaNeed,m.shareGap>0?'STRETCH':'ALIGNED'],['SUPPLY','No debe aparecer una restricción de producción/importaciones/stock que limite la captura. Sin fuente confiable de stock, esta condición queda PENDING.','PENDING'],['COMPETENCIA','Honda debe defender CUB/LMC y absorber presión de Iraola/Gilera/Keller sin depender de una caída extraordinaria de competidores.','WATCH']
  ];
}
function v4planAnalysis(){
  const m=v4planMath(),level=v4planLevel(m),conds=v4conditions(m),monthly=DATA.forecast.rows.map(r=>({period:r.period,base:r.base,up:r.up,user:r.user}));
  return `<div class="v4-plan-diagnosis"><div class="v4-plan-head">${badge(level.title,level.tone)}<h3>${level.copy}</h3><p>El plan se evalúa contra el forecast libre. No mueve Base.</p></div><section class="kpis">${kpi('PLAN vs KI 25/26',pct(m.growthVsPrev),'crecimiento requerido',V3_PURPLE,'USER INPUT')}${kpi('RESTO KI PLAN',fmt(m.planRemain),`${fmt(m.planAvg)} uds/mes`,V3_PURPLE,'CALC')}${kpi('GAP vs BASE RESTANTE',pct(m.marketUplift),`${fmt(m.planRemain-m.baseRemain)} uds`,COLORS.amber,'CALC')}${kpi('SHARE HONDA REQ.',pct(m.fit.share),`gap ${pp(m.shareGap)} vs actual`,COLORS.red,'CALC')}</section><div class="grid two">${card('Qué se espera en el Base','Evidencia macro/micro actualmente cargada. Una señal sola no mueve el forecast.',v4macroEvidence(),'MACRO / MICRO')}${card('Qué debería pasar para cumplir el plan','Condiciones necesarias, no hechos inventados.',`<div class="v4-conditions">${conds.map(([k,c,s])=>`<div><span>${badge(s,s==='ALIGNED'?'green':s==='PENDING'?'amber':s==='STRETCH'?'amber':'amber')}</span><b>${k}</b><p>${c}</p></div>`).join('')}</div>`,'PLAN REQUIREMENTS')}</div>${card('Trayectoria mensual requerida','Plan distribuido sobre la estacionalidad Base restante; sirve para detectar desvíos mes a mes.',lineChart(monthly,[{key:'base',name:'Base',color:COLORS.red},{key:'up',name:'Upside',color:COLORS.blue},{key:'user',name:'Plan',color:V3_PURPLE}],{zero:true}),'OCT-26 → MAR-27')}<div class="v4-trigger-grid"><div><b>Primer gatillo de revisión</b><p>Si el MTD se aleja de la trayectoria Plan y además affordability/crédito empeoran, baja la compatibilidad del plan.</p></div><div><b>Qué confirmaría el plan</b><p>Daily dentro/encima de Plan, salario real estable, financiación sin deterioro y Honda ganando share sin restricción de supply.</p></div><div><b>Qué lo vuelve improbable</b><p>Mercado por debajo de Base durante varios cierres, shock de precio/FX, CFT mayor o share Honda sin mejora.</p></div></div></div>`;
}

userBlock=function(){const fit=v3planFit(),k=fit.k;return chapter('user','07','Plan usuario: qué tendría que pasar para cumplirlo','Ingresás mercado KI y Honda KI. La app recalcula la trayectoria y explica qué condiciones macro, micro, de mercado y Honda deberían darse.',`<div class="plan-inputs"><label><span>MERCADO KI 26/27</span><input id="planMarket" type="number" step="1000" min="0" value="${V3_PLAN.marketKI}"><small>USER INPUT</small></label><label><span>HONDA KI 26/27</span><input id="planHonda" type="number" step="1000" min="0" value="${V3_PLAN.hondaKI}"><small>USER INPUT</small></label><button id="applyPlan">Aplicar plan</button></div><section class="kpis">${kpi('PLAN MERCADO',fmt(V3_PLAN.marketKI),`vs Base ${fmt(fit.gapBase)}`,V3_PURPLE,'USER INPUT')}${kpi('PLAN HONDA',fmt(V3_PLAN.hondaKI),`share requerido ${pct(fit.share)}`,COLORS.red,'USER INPUT')}${kpi('LIKELIHOOD PLAN',`${fit.compat}%`,fit.zone,COLORS.amber,'ESTIMATE')}${kpi('PROB. ESCENARIOS',`${RPROB.base}% Base`,`Down ${RPROB.down}% · Up ${RPROB.up}%`,COLORS.green,'ASSUMPTION')}</section>${v4planAnalysis()}<div class="note">La likelihood del plan es una compatibilidad por distancia al rango actual, no una probabilidad estadística validada. Down/Base/Up permanecen separados y suman 100%.</div>`)};

const V4_BASE_BIND_SINGLE=bindSingle;
bindSingle=function(){
  V4_BASE_BIND_SINGLE();
  const apply=$('#applyPlan');
  if(apply)apply.onclick=()=>{V3_PLAN.marketKI=Math.max(0,Number($('#planMarket')?.value)||0);V3_PLAN.hondaKI=Math.max(0,Number($('#planHonda')?.value)||0);v3save();syncUserScenario();render()};
  ['planMarket','planHonda'].forEach(id=>{const el=$('#'+id);if(el)el.onkeydown=e=>{if(e.key==='Enter')apply?.click()}});
  $$('[data-v4-limit]').forEach(b=>b.onclick=()=>{V4_LIMITS[b.dataset.v4Type]=Number(b.dataset.v4Limit)||10;render()});
};

Promise.all([
  fetch('/data/daily-open-month.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null),
  fetch('/data/rolling-entities.json',{cache:'no-store'}).then(r=>r.ok?r.json():null).catch(()=>null)
]).then(([d,r])=>{if(d)V3_DAILY=d;if(r)V3_ROLL=r;if(typeof DATA!=='undefined'&&DATA){syncUserScenario();render()}});
