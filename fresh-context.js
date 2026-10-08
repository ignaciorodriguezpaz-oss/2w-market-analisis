(()=>{
const PATCHED_AT='2026-10-08T19:45:00Z';
let done=false;
function patch(){
  if(done||typeof DATA==='undefined'||!DATA)return false;
  DATA.meta={...(DATA.meta||{}),context_updated_at:PATCHED_AT,enriched_at:PATCHED_AT};
  if(DATA.executive){DATA.executive.market=80641;DATA.executive.mom=.087;DATA.executive.yoy=.357;DATA.executive.ytd=672710;DATA.executive.cafam_latest=80641;DATA.executive.signal='FAVORABLE CON ALERTAS';DATA.executive.summary='El mercado cerrado sigue en fuerte expansión y octubre abre con buen ritmo. La lectura de demanda debe mantenerse separada entre cierre oficial y Daily MTD; affordability, crédito y actividad siguen siendo los principales límites.'}
  DATA.macro=[
    {metric:'IPC',value:'1,7% MoM · 33,5% YoY',date:'Ago 2026 · próximo IPC 13/10',direction:'supportive',detail:'Último dato oficial disponible. La desinflación ayuda al ingreso nominal, pero todavía debe contrastarse contra salarios y financiación del mismo corte.',source:'INDEC',url:'https://www.indec.gob.ar/indec/web/Nivel4-Tema-3-5-31'},
    {metric:'Salarios',value:'+2,8% MoM · +36,2% YoY',date:'Jul 2026',direction:'supportive-watch',detail:'El índice salarial continúa recuperándose nominalmente. Se mantiene como señal positiva con cautela hasta alinear empleo, inflación y financiación.',source:'INDEC',url:'https://www.indec.gob.ar/'},
    {metric:'Actividad',value:'EMAE -1,4% YoY · -2,9% MoM s.e.',date:'Jul 2026',direction:'downside',detail:'La actividad mensual se contrajo fuerte en términos desestacionalizados, aunque la tendencia-ciclo subió 0,2%. En agosto, industria cayó 3,2% YoY pero rebotó 1,9% mensual desestacionalizado.',source:'INDEC',url:'https://www.indec.gob.ar/'},
    {metric:'Empleo',value:'7,9% desocupación',date:'2T 2026',direction:'watch',detail:'La debilidad laboral limita consumo discrecional y refuerza la importancia de una cuota accesible.',source:'INDEC',url:'https://www.indec.gob.ar/'},
    {metric:'FX',value:'Minorista $1.543,08 · Mayorista $1.520,71',date:'07 Oct 2026',direction:'watch',detail:'El tipo de cambio se mantiene dentro de la banda. La sensibilidad sigue siendo relevante para modelos, kits y componentes importados.',source:'BCRA',url:'https://www.bcra.gob.ar/estadisticas-indicadores/'},
    {metric:'Crédito',value:'Personales 61,39% TNA · TAMAR 24,19%',date:'06 Oct 2026',direction:'mixed-negative',detail:'La brecha entre tasas de referencia y préstamos personales sigue siendo amplia. Para motos importa especialmente la financiación efectiva de dealer, planes y promociones.',source:'BCRA',url:'https://www.bcra.gob.ar/estadisticas-indicadores/'}
  ];
  DATA.micro=[
    {metric:'CAFAM Sep close',value:'80.641 unidades',date:'Sep 2026',direction:'strong-upside',detail:'+8,7% MoM y +35,7% YoY sobre el cierre de referencia usado por la app. YTD: 672.710 unidades.',source:'CAFAM / mercado',url:'https://cafam.org.ar/patentamientos-new/'},
    {metric:'October Daily',value:DATA?.meta?.daily_mtd?`${Number(DATA.meta.daily_mtd).toLocaleString('es-AR')} MTD`:'Mes abierto',date:DATA?.meta?.daily_cutoff||'Oct 2026',direction:'early-positive',detail:'Mes abierto: se actualiza por SIOMAA y se mantiene separado del cierre mensual hasta consolidación.',source:'SIOMAA user files / live DB'},
    {metric:'Local-origin mix',value:'96,7% origen nacional',date:'Sep 2026',direction:'supply-support',detail:'El mercado cerrado sigue dominado por origen nacional; importaciones de modelos y componentes se monitorean por separado como señal de supply.',source:'CAFAM reporting'},
    {metric:'Core displacement',value:'101–250 cc ≈ 90%',date:'Sep 2026',direction:'volume-core',detail:'La baja/media cilindrada continúa siendo el núcleo del volumen y de la movilidad accesible.',source:'CAFAM reporting'},
    {metric:'Honda Biz 110',value:'Preventa desde 01 Oct',date:'Oct 2026',direction:'strategic',detail:'Producción nacional en Campana. Seguir reservas, stock y primeros patentamientos para medir expansión CUB versus canibalización Wave.',source:'Honda Argentina',url:'https://honda.com.ar/regreso_biz_2026.php'},
    {metric:'REM septiembre',value:'TAMAR Oct 23,56% · FX Oct $1.545',date:'Publicado 06 Oct 2026',direction:'watch',detail:'El REM mantiene una referencia de tasas moderándose y tipo de cambio promedio de octubre cercano al nivel observado.',source:'BCRA REM',url:'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-septiembre-de-2026/'}
  ];
  DATA.news_radar=[
    {date:'2026-10-08',category:'Macro / Crédito',impact:'high',title:'BCRA actualiza tasas y FX de referencia',detail:'Préstamos personales 61,39% TNA y TAMAR 24,19% al 06/10; dólar minorista promedio $1.543,08 y mayorista $1.520,71 al 07/10.',source:'BCRA',url:'https://www.bcra.gob.ar/estadisticas-indicadores/'},
    {date:'2026-10-08',category:'Macro / Actividad',impact:'medium',title:'Actividad débil con rebote industrial mensual',detail:'EMAE julio: -1,4% YoY y -2,9% mensual desestacionalizado. Industria agosto: -3,2% YoY y +1,9% mensual desestacionalizado.',source:'INDEC',url:'https://www.indec.gob.ar/'},
    {date:'2026-10-06',category:'Macro / Expectativas',impact:'medium',title:'REM septiembre actualiza tasas y dólar esperado',detail:'Mediana TAMAR de octubre: 23,56% TNA. Tipo de cambio promedio esperado para octubre: $1.545/USD.',source:'BCRA REM',url:'https://www.bcra.gob.ar/publicaciones/relevamiento-de-expectativas-de-mercado-rem-septiembre-de-2026/'},
    {date:'2026-10-01',category:'Honda / Lanzamiento',impact:'high',title:'Comienza la preventa de la nueva Honda Biz 110',detail:'Honda anunció producción nacional en Campana y preventa desde el 1 de octubre. Impacto directo en CUB y en la relación Biz/Wave.',source:'Honda Argentina',url:'https://honda.com.ar/regreso_biz_2026.php'},
    {date:'2026-10-01',category:'Mercado',impact:'high',title:'Septiembre cierra en 80.641 motos',detail:'El mercado mantiene expansión fuerte y entra a la temporada alta. La app separa este cierre oficial del Daily de octubre.',source:'CAFAM / mercado',url:'https://cafam.org.ar/patentamientos-new/'}
  ];
  if(DATA.report_center)DATA.report_center.sections=['Executive','Argentina','Market + Daily','Competition','Segments','Forecast','Honda','Product Planning','Imports','Radar','Methodology'];
  delete DATA.safety;
  if(typeof calendarSummary==='function'){
    window.calendarSummary=function(){const rows=DATA.market_history;if(state.calendar==='CY'){const selected=rows.filter(r=>r.period.startsWith('2026-'));return {label:'CY 2026 YTD',value:Number(DATA.executive?.ytd)||selected.reduce((a,b)=>a+b.value,0),months:selected.length}}const selected=rows.filter(r=>r.period>='2026-04'&&r.period<='2027-03');return {label:'KI 26/27 ACT+FCST',value:selected.reduce((a,b)=>a+b.value,0)+DATA.forecast.rows.reduce((a,b)=>a+Number(b[state.scenario]||0),0),months:selected.length+DATA.forecast.rows.length}}
  }
  done=true;document.dispatchEvent(new CustomEvent('2w:context-refreshed',{detail:{at:PATCHED_AT}}));return true
}
function start(){if(patch()){if(typeof render==='function')setTimeout(()=>render(),0);return}let tries=0;const t=setInterval(()=>{tries++;if(patch()||tries>200){clearInterval(t);if(done&&typeof render==='function')render()}},25)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();