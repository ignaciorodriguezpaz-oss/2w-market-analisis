/* Executive story + KI + User scenario */
const STORY={
  userAdj:Number(localStorage.getItem('ami.userAdj')||0),
  probs:JSON.parse(localStorage.getItem('ami.probs')||'{"down":20,"base":55,"up":20,"user":5}')
};
const BASE_RENDER=render;
const BASE_OVERVIEW=renderOverview;
const BASE_FORECAST=renderForecast;
const BASE_REPORTS=renderReports;

function clamp(v,min,max){return Math.min(max,Math.max(min,Number(v)||0))}
function saveStory(){localStorage.setItem('ami.userAdj',String(STORY.userAdj));localStorage.setItem('ami.probs',JSON.stringify(STORY.probs))}
function probTotal(){return Object.values(STORY.probs).reduce((a,b)=>a+(Number(b)||0),0)}
function scenarioExpected(row){const t=probTotal()||100;return Math.round(((row.down||0)*STORY.probs.down+(row.base||0)*STORY.probs.base+(row.up||0)*STORY.probs.up+(row.user||0)*STORY.probs.user)/t)}
function applyLargestRemainder(baseSegments,total){
  const sum=baseSegments.reduce((a,b)=>a+(b.base||0),0)||1;
  const raw=baseSegments.map(s=>({name:s.name,raw:(s.base||0)/sum*total}));
  const out=raw.map(x=>({name:x.name,value:Math.floor(x.raw),rem:x.raw-Math.floor(x.raw)}));
  let left=total-out.reduce((a,b)=>a+b.value,0);
  out.sort((a,b)=>b.rem-a.rem);for(let i=0;i<left;i++)out[i%out.length].value++;
  return Object.fromEntries(out.map(x=>[x.name,x.value]));
}
function syncUserScenario(){
  if(!DATA)return;
  const factor=1+STORY.userAdj/100;
  DATA.forecast.rows.forEach(r=>{r.user=Math.round(r.base*factor);r.expected=scenarioExpected(r)});
  (DATA.forecast.segments||[]).forEach((r,i)=>{
    const total=DATA.forecast.rows[i]?.user||r.total.base;
    const alloc=applyLargestRemainder(r.segments,total);
    r.total.user=total;r.total.expected=DATA.forecast.rows[i]?.expected||total;
    r.segments.forEach(s=>{s.user=alloc[s.name];s.expected=Math.round((s.down*STORY.probs.down+s.base*STORY.probs.base+s.up*STORY.probs.up+s.user*STORY.probs.user)/(probTotal()||100))});
  });
  (DATA.honda?.forecast||[]).forEach(r=>{r.user=Math.round(r.base*factor);r.expected=Math.round((r.down*STORY.probs.down+r.base*STORY.probs.base+r.up*STORY.probs.up+r.user*STORY.probs.user)/(probTotal()||100))});
}
render=function(){syncUserScenario();BASE_RENDER()};

function storyNav(active){
  const steps=[['overview','01','Qué pasó'],['argentina','02','Por qué'],['forecast','03','Qué esperamos'],['segments','04','Dónde'],['honda','05','Honda'],['product','06','Qué hacer']];
  return `<div class="story-nav">${steps.map(([v,n,t])=>`<button data-story-view="${v}" class="${active===v?'active':''}"><i>${n}</i><span>${t}</span></button>`).join('')}</div>`;
}
function storySection(n,title,copy,body,cls=''){
  return `<section class="story-section ${cls}"><div class="story-index">${String(n).padStart(2,'0')}</div><div class="story-body"><header><h2>${title}</h2><p>${copy}</p></header>${body}</div></section>`;
}
function actualKI(startYear){
  const start=`${startYear}-04`,end=`${startYear+1}-03`;
  const rows=DATA.market_history.filter(r=>r.period>=start&&r.period<=end);
  return {label:`KI ${String(startYear).slice(-2)}/${String(startYear+1).slice(-2)}`,value:rows.reduce((a,b)=>a+b.value,0),months:rows.length};
}
function currentKI(){
  const actual=DATA.market_history.filter(r=>r.period>='2026-04'&&r.period<='2026-09');
  const sums={down:0,base:0,up:0,user:0,expected:0};
  actual.forEach(r=>Object.keys(sums).forEach(k=>sums[k]+=r.value));
  DATA.forecast.rows.forEach(r=>Object.keys(sums).forEach(k=>sums[k]+=Number(r[k]||0)));
  return {label:'KI 26/27',actualMonths:actual.length,...sums};
}
function futureKIYears(){
  const cur=currentKI(),growth=Number(DATA.forecast.structural_growth||.035);
  const years=[];
  let base=cur.base;
  for(let y=2027;y<=2030;y++){
    base=Math.round(base*(1+growth));
    const horizon=y-2026;
    const band=.045+.018*horizon;
    const down=Math.round(base*(1-band)),up=Math.round(base*(1+band)),user=Math.round(base*(1+STORY.userAdj/100));
    const expected=Math.round((down*STORY.probs.down+base*STORY.probs.base+up*STORY.probs.up+user*STORY.probs.user)/(probTotal()||100));
    years.push({ki:`KI ${String(y).slice(-2)}/${String(y+1).slice(-2)}`,down,base,up,user,expected,confidence:y===2027?'MEDIA':'BAJA'});
  }
  return years;
}
function kiTable(){
  const prev=actualKI(2025),cur=currentKI(),future=futureKIYears();
  const rows=[{ki:prev.label,actual:prev.value,down:null,base:null,up:null,user:null,expected:prev.value,confidence:'ACTUAL'},
    {ki:cur.label,actual:null,down:cur.down,base:cur.base,up:cur.up,user:cur.user,expected:cur.expected,confidence:'ALTA'},...future];
  return `<div class="table-wrap"><table class="table ki-table"><thead><tr><th>KI</th><th>Actual</th><th>Down</th><th>Base</th><th>Up</th><th>Usuario</th><th>Esperado</th><th>Conf.</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${r.ki}</strong></td><td>${r.actual?fmt(r.actual):'—'}</td><td>${r.down?fmt(r.down):'—'}</td><td>${r.base?`<strong>${fmt(r.base)}</strong>`:'—'}</td><td>${r.up?fmt(r.up):'—'}</td><td>${r.user?fmt(r.user):'—'}</td><td><strong>${fmt(r.expected)}</strong></td><td>${badge(r.confidence,r.confidence==='ALTA'||r.confidence==='ACTUAL'?'green':r.confidence==='MEDIA'?'amber':'red')}</td></tr>`).join('')}</tbody></table></div>`;
}
function probabilityEditor(){
  const p=STORY.probs,total=probTotal();
  return `<div class="prob-editor">
    <div class="user-view"><div><span>VISIÓN USUARIO</span><b>${STORY.userAdj>=0?'+':''}${STORY.userAdj.toFixed(1)}% vs Base</b><small>aplica a la curva mensual y a KI</small></div><input id="userAdj" type="range" min="-20" max="20" step="0.5" value="${STORY.userAdj}"></div>
    <div class="prob-grid">${['down','base','up','user'].map(k=>`<label><span>${k==='user'?'Usuario':k[0].toUpperCase()+k.slice(1)}</span><input class="prob-input" data-prob="${k}" type="number" min="0" max="100" step="5" value="${p[k]}"><small>%</small></label>`).join('')}</div>
    <div class="prob-total ${Math.abs(total-100)<.01?'ok':'bad'}"><span>Probabilidad total</span><b>${total.toFixed(0)}%</b><small>${Math.abs(total-100)<.01?'Distribución válida':'Debe sumar 100%'}</small></div>
  </div>`;
}
function forecastRowsStory(){return DATA.forecast.rows.map(r=>({...r,user:r.user,expected:r.expected}))}
function storyForecastChart(){
  const rows=forecastRowsStory();
  return lineChart(rows,[{key:'down',name:'Downside',color:COLORS.down},{key:'base',name:'Base',color:COLORS.red},{key:'up',name:'Upside',color:COLORS.blue},{key:'user',name:'Usuario',color:'#7c3aed'},{key:'expected',name:'Esperado',color:COLORS.green}],{zero:true,maxValue:Math.max(...rows.map(r=>r.up))*1.08});
}
function riskSummary(){
  const flags=[];
  if(DATA.macro.some(x=>tone(x.direction)==='red'))flags.push('actividad/crédito');
  if((DATA.imports?.new_model_signals||[]).length)flags.push('nuevos modelos / oferta');
  if(DATA.executive.source_gap)flags.push('gap de fuentes visible');
  return flags.join(' · ');
}
function bindStory(){
  $$('[data-story-view]').forEach(b=>b.addEventListener('click',()=>{state.view=b.dataset.storyView;render()}));
  const adj=$('#userAdj');if(adj)adj.addEventListener('input',e=>{STORY.userAdj=clamp(e.target.value,-20,20);saveStory();syncUserScenario();render()});
  $$('.prob-input').forEach(i=>i.addEventListener('change',e=>{STORY.probs[e.target.dataset.prob]=clamp(e.target.value,0,100);saveStory();syncUserScenario();render()}));
}
const BASE_BIND_VIEW=bindViewActions;
bindViewActions=function(){BASE_BIND_VIEW();bindStory()};

renderOverview=function(){
  const e=DATA.executive,h=DATA.honda,cur=currentKI(),prev=actualKI(2025),expectedYoY=prev.value?cur.expected/prev.value-1:null;
  const topSeg=(DATA.segment_history.find(r=>r.period==='2026-08')?.segments||[]).slice().sort((a,b)=>b.value-a.value)[0];
  const topComp=DATA.competition.top_brands[1];
  return storyNav('overview')+
  head('EXECUTIVE REPORT','Qué está pasando, por qué y qué haría después','Una lectura continua del mercado argentino de motos. Las hojas de detalle quedan como anexos; esta vista cuenta la historia completa.',{tone:'green',text:'SEP 2026 · FCST KI'})+
  `<section class="kpis">${kpi('MERCADO SEP',fmt(e.market),`${pct(e.mom)} MoM · ${pct(e.yoy)} YoY`,COLORS.actual,'ACTUAL')}${kpi('KI 26/27 ESPERADO',fmt(cur.expected),`${pct(expectedYoY)} vs KI 25/26`,COLORS.green,'PROBABILÍSTICO')}${kpi('HONDA SHARE',pct(h.share),`gap ${pp(.30-h.share)} a 30%`,COLORS.red)}${kpi('ESCENARIO USUARIO',`${STORY.userAdj>=0?'+':''}${STORY.userAdj.toFixed(1)}%`,`${STORY.probs.user}% probabilidad`, '#7c3aed')}${kpi('RIESGOS ACTIVOS',DATA.macro.filter(x=>tone(x.direction)!=='green').length,riskSummary(),COLORS.amber)}</section>`+
  storySection(1,'Qué pasó','Primero, el dato observado. Sin mezclar forecast ni importaciones.',`<div class="grid two">${card('Mercado observado','El cierre Sep-26 consolida crecimiento fuerte.',lineChart(periodRows(DATA.market_history).slice(-18).map(r=>({...r,actual:r.value})),[{key:'actual',name:'Mercado',color:COLORS.actual}],{zero:true}),'ACTUAL')}${card('Lectura ejecutiva','La moto sigue funcionando como solución de movilidad aun con actividad general más débil.',`<div class="narrative"><h3>Demanda fuerte, pero no lineal</h3><p>El mercado cerró ${fmt(e.market)} unidades, ${pct(e.yoy)} interanual. La lectura positiva se mantiene, pero el run-rate reciente no se extrapola sin convergencia: crédito, empleo y poder de compra siguen limitando conversión.</p><div>${badge('MERCADO ↑','green')}${badge('CRÉDITO','amber')}${badge('ACTIVIDAD','amber')}</div></div>`,'CONCLUSIÓN')}</div>`)+
  storySection(2,'Por qué pasó','Los drivers explican la calidad del crecimiento y el riesgo de reversión.',`<div class="grid three">${DATA.macro.slice(0,3).map(signalCard).join('')}</div>`)+
  storySection(3,'Qué esperamos','El foco pasa de un mes aislado al KI completo, con probabilidades explícitas.',`<div class="grid two">${card('Forecast mensual','Down / Base / Up / Usuario + valor esperado.',storyForecastChart(),'OCT-26 → MAR-27')}${card('KI 26/27','Actual Abr–Sep + forecast Oct–Mar.',`<div class="big-number">${fmt(cur.expected)}<small>valor esperado probabilístico</small></div><div class="scenario-strip"><span>Down <b>${fmt(cur.down)}</b></span><span>Base <b>${fmt(cur.base)}</b></span><span>Up <b>${fmt(cur.up)}</b></span><span>Usuario <b>${fmt(cur.user)}</b></span></div>`,'KI')}</div>${kiTable()}`)+
  storySection(4,'Dónde se juega','Segmentos, marcas y modelos explican de dónde sale el crecimiento.',`<div class="grid three">${card('Segmento más grande',topSeg?.name||'—',`<div class="big-number">${fmt(topSeg?.value)}<small>último corte estructural</small></div>`,'SEGMENT')}${card('Competidor inmediato',topComp?.name||'—',`<div class="big-number">${fmt(topComp?.value)}<small>${pct(topComp?.share)} share</small></div>`,'COMPETITION')}${card('Modelo líder',DATA.competition.top_models[0].model,`<div class="big-number">${fmt(DATA.competition.top_models[0].value)}<small>Sep-26</small></div>`,'MODEL')}</div>`)+
  storySection(5,'Qué significa para Honda','Liderar hoy no alcanza: la pregunta es cuánto volumen y mix requiere la trayectoria al 30%.',`<div class="grid two">${card('Share actual vs objetivo','La meta 2030 se mide como gap, no se mete dentro del forecast.',lineChart(h.target_path.map(x=>({period:`${x.year}-12`,share:x.target_share})),[{key:'share',name:'Target',color:COLORS.red}],{percent:true,zero:true,maxValue:.32}),'30% 2030')}${card('Lectura comercial', 'Prioridades de corto plazo',`<div class="action-list"><div><b>1</b><span>Defender liderazgo CUB sin canibalización destructiva Wave/Biz.</span></div><div><b>2</b><span>Medir share requerido por segmento, no sólo share total.</span></div><div><b>3</b><span>Usar importaciones y nuevos modelos como señal de oferta competitiva.</span></div></div>`,'ACTION')}</div>`)+
  storySection(6,'Decisión sugerida','Qué debería mirar el próximo comité antes de mover el forecast.',`<div class="decision-grid"><div><b>01</b><h3>Confirmar octubre</h3><p>Comparar run-rate contra mismo estadio de septiembre y octubre 2025 antes de subir Base.</p></div><div><b>02</b><h3>Revisar cuotas</h3><p>Affordability por modelo y segmento debe acompañar cualquier lectura de share.</p></div><div><b>03</b><h3>Monitorear oferta</h3><p>Import pressure y lanzamientos pueden cambiar mix aun con mercado total estable.</p></div></div>`);
};

renderForecast=function(){
  const rows=forecastRowsStory(),cur=currentKI(),prev=actualKI(2025),future=futureKIYears(),total=probTotal();
  return storyNav('forecast')+
  head('FORECAST · CY / KI / PROBABILIDAD','No sólo cuánto: también con qué probabilidad','El forecast mantiene Downside, Base y Upside, suma una Visión Usuario editable y calcula un valor esperado ponderado. KI se lee Apr–Mar.',{tone:Math.abs(total-100)<.01?'green':'red',text:`PROB. ${total.toFixed(0)}%`})+
  probabilityEditor()+
  `<section class="kpis">${kpi('KI 25/26 ACTUAL',fmt(prev.value),`${prev.months} meses observados`,COLORS.actual)}${kpi('KI 26/27 BASE',fmt(cur.base),`${pct(cur.base/prev.value-1)} vs KI anterior`,COLORS.red)}${kpi('KI 26/27 USUARIO',fmt(cur.user),`${STORY.userAdj>=0?'+':''}${STORY.userAdj.toFixed(1)}% vs Base`,'#7c3aed')}${kpi('KI 26/27 ESPERADO',fmt(cur.expected),`${pct(cur.expected/prev.value-1)} vs KI 25/26`,COLORS.green)}${kpi('KI 27/28 BASE',fmt(future[0].base),`confianza ${future[0].confidence.toLowerCase()}`,COLORS.blue)}</section>`+
  `<div class="grid two">${card('Forecast mensual probabilístico','Las cinco curvas usan la misma escala.',storyForecastChart(),'OCT-26 → MAR-27')}${card('Probabilidad por escenario','El valor esperado cambia automáticamente cuando modificás pesos o Visión Usuario.',`<div class="prob-bars">${[['down','Downside',COLORS.down],['base','Base',COLORS.red],['up','Upside',COLORS.blue],['user','Usuario','#7c3aed']].map(([k,n,c])=>`<div><span>${n}</span><b>${STORY.probs[k]}%</b><i><em style="width:${STORY.probs[k]}%;background:${c}"></em></i></div>`).join('')}</div><div class="expected-box"><span>VALOR ESPERADO OCT</span><b>${fmt(rows[0].expected)}</b><small>ponderado por probabilidades</small></div>`,'PROBABILITY VIEW')}</div>`+
  card('Forecast KI','KI actual + siguientes años de planning. A mayor horizonte, menor confianza.',kiTable(),'APR → MAR')+
  card('Detalle mensual','Incluye Visión Usuario y Expected.',`<div class="table-wrap"><table class="table"><thead><tr><th>Mes</th><th>Down</th><th>Base</th><th>Up</th><th>Usuario</th><th>Expected</th><th>Índice est.</th></tr></thead><tbody>${rows.map(r=>`<tr><td><strong>${label(r.period)}</strong></td><td>${fmt(r.down)}</td><td><strong>${fmt(r.base)}</strong></td><td>${fmt(r.up)}</td><td>${fmt(r.user)}</td><td><strong>${fmt(r.expected)}</strong></td><td>${r.seasonal_index.toFixed(3)}</td></tr>`).join('')}</tbody></table></div>`,'MONTHLY');
};

renderReports=function(){
  const e=DATA.executive,h=DATA.honda,cur=currentKI(),top=DATA.competition.top_brands.slice(0,5);
  return storyNav('overview')+
  head('MANAGEMENT REPORT','Una historia, no una colección de dashboards','El reporte se ordena como una decisión: hechos → drivers → forecast KI → competencia → Honda → acciones. Cada capítulo tiene una conclusión.',{tone:'green',text:'EXECUTIVE FLOW'})+
  `<div class="export-actions"><button data-export="pdf">↧ PDF</button><button data-export="ppt">↧ PowerPoint</button><button data-export="csv">↧ Excel / CSV</button></div>`+
  `<div class="management-report">
  <section><span>01 · EXECUTIVE</span><h2>Mercado fuerte, con Base constructivo pero no lineal</h2><div class="slide-kpis"><div><small>Sep mercado</small><b>${fmt(e.market)}</b></div><div><small>YoY</small><b>${pct(e.yoy)}</b></div><div><small>KI esperado</small><b>${fmt(cur.expected)}</b></div><div><small>Honda MS</small><b>${pct(h.share)}</b></div></div><p>${e.summary}</p></section>
  <section><span>02 · WHY</span><h2>El crecimiento convive con restricciones de affordability</h2><div class="grid three">${DATA.macro.slice(0,3).map(signalCard).join('')}</div></section>
  <section><span>03 · KI FORECAST</span><h2>KI 26/27 + probabilidades</h2>${kiTable()}${probabilityEditor()}</section>
  <section><span>04 · COMPETITION</span><h2>La pelea se concentra en volumen accesible</h2>${barChart(top,{showShare:true,color:r=>r.name==='HONDA'?COLORS.red:COLORS.blue})}</section>
  <section><span>05 · HONDA</span><h2>Liderazgo actual vs trayectoria 30% 2030</h2><p>Honda está en ${pct(h.share)}. La brecha a 30% es ${pp(.30-h.share)} y debe cerrarse por mix/segmento, no inflando el forecast de mercado.</p></section>
  <section><span>06 · ACTIONS</span><h2>Qué haría ahora</h2><div class="action-list"><div><b>1</b><span>Validar run-rate de octubre antes de mover Base.</span></div><div><b>2</b><span>Revisar affordability y cuotas por modelo.</span></div><div><b>3</b><span>Monitorear nuevos modelos e import pressure.</span></div><div><b>4</b><span>Traducir 30% 2030 a share requerido por segmento y modelo.</span></div></div></section>
  </div>`;
};

(function(){
  const select=$('#scenarioFilter');
  if(select&&!select.querySelector('option[value="user"]')){const o=document.createElement('option');o.value='user';o.textContent='Usuario';select.appendChild(o)}
})();
