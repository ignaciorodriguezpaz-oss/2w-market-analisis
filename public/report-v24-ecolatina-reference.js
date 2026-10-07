/* v24 — Ecolatina is the external macro reference for Argentina Future */
const V24_VERSION='20261007-ecolatina-reference-v1';

const V24_ECOLATINA={
  source:'Ecolatina_Salary_Growth_vs_Inflation_Gap_2019_2033(1).xlsx',
  currentGap2025:-0.1021024809756959,
  currentPP2025:89.78975190243041,
  recovery:{Optimistic:'2029',Base:'2030',Pessimistic:'No recupera a 2033'},
  scenarios:{
    Base:[
      [2026,.29409237785559084,.29,89.50580494575843,-.10494195054241573],
      [2027,.19090523117742286,.2528175191843236,94.15899566909793,-.058410043309020665],
      [2028,.183879246141623,.18809483716310293,94.49427970928012,-.05505720290719879],
      [2029,.10232123456283215,.15125604151010663,98.68911801068435,-.013108819893156465],
      [2030,.05271473098436941,.08247863313144706,101.47940218264112,.014794021826411239],
      [2031,.0467954314571859,.050347011173496006,101.82370267878815,.018237026787881518],
      [2032,.03999304056722397,.044074475101201126,102.22330802255466,.022233080225546615],
      [2033,.04088146275630011,.04034840944285443,102.17095770697837,.021709577069783705]
    ],
    Optimistic:[
      [2026,.27134889009938745,.29,91.10699734443496,-.08893002655565041],
      [2027,.15030402080420835,.2229309423813158,96.8592338241736,-.031407661758264],
      [2028,.13997032281389798,.1461705416080842,97.38604441733425,-.02613955582665753],
      [2029,.0766100937940466,.11462623120595743,100.82483926786819,.008248392678681853],
      [2030,.042070922916031206,.06279442544284045,102.82992718020137,.028299271802013664],
      [2031,.031808632448130814,.03796600672887105,103.44357037817255,.03443570378172552],
      [2032,.028292492690062065,.030402176544903316,103.65579912812973,.03655799128129729],
      [2033,.024980832718524137,.026967828701446893,103.85674303839582,.0385674303839582]
    ],
    Pessimistic:[
      [2026,.3353389132441409,.29,86.7411102944157,-.13258889705584295],
      [2027,.49711361116248143,.4000487924114771,81.11728182461057,-.18882718175389428],
      [2028,.4877765690708318,.49337879432582155,81.42272909021561,-.1857727090978439],
      [2029,.3066708390329491,.4153342770556787,88.19388630275752,-.1180611369724248],
      [2030,.28158857817335803,.2966379346891127,89.22952383892523,-.10770476161074768],
      [2031,.2362591417070472,.2634568035868337,91.19257053131565,-.08807429468684347],
      [2032,.24406127323798166,.239379994319421,90.84942195243055,-.09150578952569454],
      [2033,.19325300527995304,.2237379660547702,93.17042265586888,-.06829577344131124]
    ]
  }
};

function v24ecoRows(){
  const years=V24_ECOLATINA.scenarios.Base.map(r=>r[0]);
  return years.map((y,i)=>({period:`${y}-12`,year:y,base:V24_ECOLATINA.scenarios.Base[i][3],optimistic:V24_ECOLATINA.scenarios.Optimistic[i][3],pessimistic:V24_ECOLATINA.scenarios.Pessimistic[i][3],baseline:100}));
}
function v24ecoInflationTable(){
  const b=V24_ECOLATINA.scenarios.Base,o=V24_ECOLATINA.scenarios.Optimistic,p=V24_ECOLATINA.scenarios.Pessimistic;
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Año</th><th>Ecolatina Base</th><th>Positivo</th><th>Negativo</th><th>Salario Base*</th><th>PP Base</th><th>Gap vs 2019</th></tr></thead><tbody>${b.map((r,i)=>`<tr><td><b>${r[0]}</b></td><td>${pct(r[1])}</td><td>${pct(o[i][1])}</td><td>${pct(p[i][1])}</td><td>${pct(r[2])}</td><td>${r[3].toFixed(1)}</td><td class="${r[4]>=0?'green-txt':'red-txt'}">${pct(r[4])}</td></tr>`).join('')}</tbody></table></div>`;
}
function v24ecoVsAi(){
  const d=typeof v5dailyStats==='function'?v5dailyStats():null;
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Variable</th><th>Ecolatina</th><th>IA / 2W</th><th>Uso en forecast motos</th></tr></thead><tbody>
    <tr><td><b>Inflación</b></td><td>Trayectorias Base / Positivo / Negativo 2026–2033</td><td>No reemplazo la fuente: tomo Ecolatina como ancla externa y evalúo consistencia con otros datos.</td><td>Impacta affordability, precio, tasa real y sensibilidad del consumidor.</td></tr>
    <tr><td><b>Salario / poder de compra</b></td><td>2025 PP=89,8 vs 2019=100; Base recupera en 2030, Positivo en 2029 y Negativo no recupera a 2033.</td><td>La IA usa ese gap como driver de demanda y lo cruza con crédito, precio de entrada y empleo.</td><td>Mayor PP sostiene conversión y mix; gap persistente limita upside.</td></tr>
    <tr><td><b>Mercado motos</b></td><td><b>No publica volumen de motos en este archivo.</b></td><td>2W traduce macro + micro + seasonality + daily + imports + UIO a Down / Base / Up.</td><td>Ecolatina alimenta el escenario macro; 2W produce el forecast de patentamientos.</td></tr>
    <tr><td><b>Nowcast</b></td><td>No aplica en el workbook Ecolatina.</td><td>${d?`Oct MTD ${fmt(d.currentMtd||0)}; el peso del pace aumenta a medida que avanza el mes.`:'Daily pendiente.'}</td><td>Recalibra el corto plazo sin confundir una señal diaria con tendencia estructural.</td></tr>
  </tbody></table></div>`;
}

v21futureBlock=function(){
  const pp=v24ecoRows();
  return chapter('argentina-future','01B','Argentina en el futuro','Dos lecturas separadas: Ecolatina como referencia macro externa y 2W/IA como traducción de esos drivers al mercado de motos.',`
    <section class="card"><div class="card-head"><div><span class="eyebrow">REFERENCIA EXTERNA</span><h2>Ecolatina · macro 2026–2033</h2><p>Este es el archivo que pasaste como referencia. Lo uso como ancla macro, no como si fuera un forecast de patentamientos.</p></div>${badge('ECOLATINA','blue')}</div>
      <section class="kpis">${kpi('PP 2025',V24_ECOLATINA.currentPP2025.toFixed(1),'2019 = 100',COLORS.amber,'ECOLATINA')}${kpi('GAP 2025',pct(V24_ECOLATINA.currentGap2025),'vs 2019',COLORS.red,'ECOLATINA')}${kpi('RECUPERA BASE','2030','poder de compra ≥ 2019',COLORS.green,'ECOLATINA')}${kpi('RECUPERA POSITIVO','2029','poder de compra ≥ 2019',COLORS.blue,'ECOLATINA')}${kpi('NEGATIVO','NO A 2033','gap todavía -6,8%',COLORS.red,'ECOLATINA')}</section>
      ${v24ecoInflationTable()}
      <div class="note"><b>* Importante:</b> en tu workbook, la inflación 2026–2033 sí viene de los escenarios Ecolatina. El salario desde 2027 <b>no está publicado por Ecolatina</b>: se deriva con la regla explícita 60% inflación del año previo + 40% inflación corriente. El ancla salarial 2026 es 29,0% YoY.</div>
    </section>
    <div class="grid two">${card('Poder adquisitivo · escenarios Ecolatina','Índice 2019 = 100.',lineChart(pp,[{key:'base',name:'Ecolatina Base',color:COLORS.red},{key:'optimistic',name:'Ecolatina Positivo',color:COLORS.green},{key:'pessimistic',name:'Ecolatina Negativo',color:COLORS.amber},{key:'baseline',name:'2019 = 100',color:COLORS.actual}],{zero:false,minValue:75,maxValue:108}),'2019=100')}${card('IA / 2W · teoría de transmisión','Cómo convierto macro en demanda de motos.',v21aiTable(),'2W CAUSAL MAP')}</div>
    ${card('Ecolatina vs IA / 2W','No mezclo las dos fuentes: las uso con roles distintos.',v24ecoVsAi(),'EXTERNAL REFERENCE vs MODEL')}
    <div class="storyline"><div><b>1 · Ecolatina</b><p>Define el escenario macro externo: inflación y trayectoria de recuperación del poder adquisitivo.</p></div><div><b>2 · IA / 2W</b><p>Agrega crédito, prices/affordability, daily, imports, política, seasonality y UIO.</p></div><div><b>3 · Forecast motos</b><p>La salida final es Down / Base / Up mensual, CY y KI. El Plan User sigue separado.</p></div></div>
    <div class="note"><b>Regla de uso:</b> Ecolatina Base alimenta la referencia macro central; Positivo sirve como condición compatible con Upside y Negativo como condición compatible con Downside. No fuerzo una relación 1:1: el mercado de motos puede desacoplarse parcialmente por crédito, movilidad económica, precio relativo y supply.</div>
  `);
};

(function v24boot(){
  const ready=()=>{if(typeof DATA!=='undefined'&&DATA){try{render()}catch(e){console.error('v24 Ecolatina render',e)}}else setTimeout(ready,120)};
  ready();
})();
