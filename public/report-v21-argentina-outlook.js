/* 2W Market Analysis v21 — Argentina today -> future macro/micro outlook + AI/external comparison */
const V21_VERSION='20261007-argentina-outlook-v1';
const V21_BASE_CONTEXT=(typeof context==='function')?context:null;

const V21_OFFICIAL={
  cutoff:'2026-10-06',
  today:[
    {label:'IPC',value:'1,7%',sub:'Ago-26 · 33,5% YoY',source:'INDEC'},
    {label:'EMAE',value:'-2,9%',sub:'Jul-26 YoY',source:'INDEC'},
    {label:'Industria',value:'-5,0%',sub:'Jul-26 YoY',source:'INDEC'},
    {label:'Desocupación',value:'7,9%',sub:'2Q-26',source:'INDEC'}
  ],
  rem:[
    {label:'Inflación',value:'1,9%',sub:'Sep-26 esperado'},
    {label:'PIB 3Q-26',value:'-1,0%',sub:'q/q s.e.'},
    {label:'PIB 4Q-26',value:'+1,8%',sub:'q/q s.e.'},
    {label:'PIB 1Q-27',value:'+0,7%',sub:'q/q s.e.'},
    {label:'TAMAR Oct',value:'23,56%',sub:'TNA'},
    {label:'TCN Oct',value:'$1.545',sub:'ARS/USD promedio'},
    {label:'TCN Dic',value:'$1.614',sub:'ARS/USD promedio'}
  ]
};

function v21aiDrivers(){
  const d=(typeof v5dailyStats==='function')?v5dailyStats():null;
  const ki=(typeof v3currentKI==='function')?v3currentKI():null;
  const imports=DATA?.imports||{};
  return [
    {driver:'Actividad',today:'Q3 débil / contracción reciente',future:'Rebote esperado desde Q4-26',moto:'El mercado de motos puede seguir desacoplado parcialmente, pero un rebote general mejora conversión y mix.',tone:'amber'},
    {driver:'Inflación + ingreso',today:'Desinflación, pero poder de compra todavía sensible',future:'Mejora gradual si salarios sostienen el ritmo',moto:'Affordability manda: precio de moto / salario define cuántas consultas se convierten en patentamientos.',tone:'green'},
    {driver:'Tasas + crédito',today:'Tasas bastante más normales que en el régimen previo',future:'REM ve estabilidad cercana a 23–24% TNA',moto:'Financiación sostiene CUB/LMC; deterioro de cuota o mora es señal temprana de downside.',tone:'green'},
    {driver:'FX + importaciones',today:'Oferta más abierta, pero costo importado sigue expuesto al dólar',future:'Depreciación nominal gradual en consenso',moto:`Imports se usa como leading indicator de supply${imports?.cutoff?` · corte ${imports.cutoff}`:''}; nunca se suma a patentamientos.`,tone:'amber'},
    {driver:'Daily / momentum',today:d?`Oct MTD ${fmt(d.currentMtd||d.current||0)} · ${pct(d.mtdVs??d.vs)} vs comparable`:'Daily pendiente',future:d&&d.pace?`Pace ${fmt(d.pace)} como señal, con peso creciente durante el mes`:'El nowcast gana peso a medida que avanza el mes',moto:'El daily recalibra corto plazo; no debe extrapolar un shock de pocos días sin confirmación.',tone:'blue'},
    {driver:'UIO / saturación',today:'Todavía hay expansión neta de flota',future:'A largo plazo aumenta el peso de replacement',moto:'El forecast deja de ser crecimiento infinito: UIO superviviente + PR controlan madurez estructural.',tone:'purple'},
    {driver:'Mercado KI',today:ki?`KI 26/27 Base ${fmt(ki.base)}`:'KI pendiente',future:'Down / Base / Up se actualizan con macro, micro, nowcast y eventos',moto:'Es la salida final del motor; User Plan se compara aparte y no modifica el forecast independiente.',tone:'red'}
  ];
}

function v21aiMarketPath(){
  try{
    const rows=(typeof v8marketIndependent==='function'?v8marketIndependent():[])||[];
    return rows.slice(0,6);
  }catch{return []}
}

function v21aiTable(){
  const rows=v21aiDrivers();
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Driver</th><th>Argentina hoy</th><th>Argentina futuro · IA</th><th>Cómo llega a motos</th></tr></thead><tbody>${rows.map(r=>`<tr><td>${badge(r.driver.toUpperCase(),r.tone)}</td><td>${r.today}</td><td><strong>${r.future}</strong></td><td><small>${r.moto}</small></td></tr>`).join('')}</tbody></table></div>`;
}

function v21forecastCompare(){
  const ai=v21aiMarketPath();
  const abcRows=ai.map(r=>({ki:r.ki,abc:null}));
  return `<section class="card"><div class="card-head"><div><span class="eyebrow">FORECAST COMPARISON</span><h2>IA / 2W vs referencia externa “ABC”</h2><p>La IA muestra la trayectoria que sale del motor 2W. La referencia ABC queda separada para comparar supuestos, no para promediarla a ciegas.</p></div>${badge('ABC PENDIENTE ARCHIVO','amber')}</div>
    <div class="table-wrap"><table class="table"><thead><tr><th>KI</th><th>IA / 2W Down</th><th>IA / 2W Base</th><th>IA / 2W Up</th><th>ABC</th><th>Gap Base vs ABC</th></tr></thead><tbody>${ai.map((r,i)=>`<tr><td><b>${r.ki}</b></td><td>${fmt(r.down)}</td><td><strong>${fmt(r.base)}</strong></td><td>${fmt(r.up)}</td><td>${abcRows[i]?.abc?fmt(abcRows[i].abc):'PENDIENTE'}</td><td>—</td></tr>`).join('')||'<tr><td colspan="6">Forecast plurianual pendiente de carga.</td></tr>'}</tbody></table></div>
    <div class="note"><b>Gobernanza:</b> IA/2W = forecast propio. ABC = referencia externa. Se comparan variable por variable y KI por KI; una diferencia se explica por supuestos de inflación, actividad, FX, tasas, crédito, importaciones, affordability, política o saturación.</div>
  </section>`;
}

function v21futureBlock(){
  return chapter('argentina-future','01B','Argentina en el futuro','Puente causal entre el contexto macro/micro y el forecast de motos: primero hechos, después consenso, después interpretación IA y finalmente contraste con una referencia externa.',`
    <section class="card"><div class="card-head"><div><span class="eyebrow">ARGENTINA HOY · FACTS</span><h2>Qué economía recibe hoy al mercado de motos</h2><p>Snapshot oficial previo al forecast. No son supuestos del modelo.</p></div>${badge('OFFICIAL SNAPSHOT','green')}</div>
      <section class="kpis">${V21_OFFICIAL.today.map(x=>kpi(x.label,x.value,x.sub,COLORS.actual,x.source)).join('')}</section>
      <div class="note"><b>Lectura:</b> desinflación y normalización financiera conviven con actividad débil. Para motos, por eso no alcanza con mirar PIB: affordability, crédito, empleo, imports y momentum pueden sostener o frenar la conversión.</div>
    </section>
    <section class="card"><div class="card-head"><div><span class="eyebrow">ARGENTINA FUTURO · CONSENSUS INPUT</span><h2>REM como ancla macro, no como forecast de motos</h2><p>El consenso macro se usa como input de referencia. Después 2W traduce esos supuestos a demanda de motos con su propia metodología.</p></div>${badge('BCRA REM SEP-26','blue')}</div>
      <section class="kpis">${V21_OFFICIAL.rem.map(x=>kpi(x.label,x.value,x.sub,COLORS.blue,'REM')).join('')}</section>
    </section>
    ${card('Forecast IA · teoría de transmisión','De macro/micro a mercado de motos.',v21aiTable(),'2W CAUSAL MAP')}
    ${v21forecastCompare()}
    <div class="storyline"><div><b>1 · Macro</b><p>Inflación, actividad, FX, tasa y salario entran como estado de la economía y expectativa futura.</p></div><div><b>2 · Micro</b><p>Crédito, affordability, imports, stock, lanzamientos, daily y mix determinan cuánto de esa demanda puede convertirse.</p></div><div><b>3 · Mercado</b><p>Seasonality, momentum, política y UIO/PR terminan de formar Down / Base / Up por mes, CY y KI.</p></div></div>
    <div class="note"><b>IA / 2W:</b> es una síntesis/modelo propio y no una fuente externa. <b>ABC:</b> todavía no está identificado en los archivos disponibles; cuando se cargue, esta misma tabla mostrará sus supuestos y gaps contra IA/2W.</div>
  `);
}

if(V21_BASE_CONTEXT){
  context=function(){return `${V21_BASE_CONTEXT()}${v21futureBlock()}`};
}

(function v21boot(){
  const ready=()=>{if(typeof DATA!=='undefined'&&DATA){try{render()}catch(e){console.error('v21 outlook render',e)}}else setTimeout(ready,120)};
  ready();
})();
