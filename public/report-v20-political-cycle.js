/* 2W Market Analysis v20 — political/election uncertainty overlay */
const V20_VERSION='20261007-political-cycle-v1';
const V20_BASE_MARKET_INDEPENDENT=v8marketIndependent;
const V20_BASE_FORECAST=forecast;
let V20_POLITICS=null;
let V20_LAST_ROWS=[];

function v20kiMonths(ki){
  const m=String(ki||'').match(/(20\d{2})\/(\d{2})/);
  if(!m)return [];
  const y=Number(m[1]);
  return [4,5,6,7,8,9,10,11,12].map(mm=>`${y}-${String(mm).padStart(2,'0')}`).concat([1,2,3].map(mm=>`${y+1}-${String(mm).padStart(2,'0')}`));
}
function v20monthFactor(period){
  if(!V20_POLITICS)return 1;
  return Number(V20_POLITICS.presidential?.monthly_factors?.[period] ?? V20_POLITICS.legislative?.monthly_factors?.[period] ?? 1);
}
function v20seasonWeights(){
  const months=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'];
  const p=V7_MODEL?.seasonality?.final_profile;
  if(Array.isArray(p)&&p.length===12){
    const sum=p.reduce((a,b)=>a+(Number(b)||0),0)||12;
    return Object.fromEntries(months.map((m,i)=>[m,(Number(p[i])||1)/sum]));
  }
  return Object.fromEntries(months.map(m=>[m,1/12]));
}
function v20kiFactor(ki){
  const periods=v20kiMonths(ki),labels=['Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec','Jan','Feb','Mar'],w=v20seasonWeights();
  if(!periods.length)return 1;
  return periods.reduce((acc,p,i)=>acc+(w[labels[i]]||1/12)*v20monthFactor(p),0);
}
function v20marketIndependent(){
  const rows=V20_BASE_MARKET_INDEPENDENT();
  if(!V20_POLITICS){V20_LAST_ROWS=rows;return rows;}
  const out=(rows||[]).map(r=>{
    const factor=v20kiFactor(r.ki);
    const active=Math.abs(factor-1)>0.00005;
    return {...r,
      pre_political_base:Number(r.base)||0,
      pre_political_down:Number(r.down)||0,
      pre_political_up:Number(r.up)||0,
      political_factor:factor,
      political_effect:factor-1,
      political_active:active,
      base:Math.round((Number(r.base)||0)*factor),
      down:Math.round((Number(r.down)||0)*factor),
      up:Math.round((Number(r.up)||0)*factor),
      source:`${r.source||'MODEL'}${active?' + POLITICAL CYCLE':''}`
    };
  });
  V20_LAST_ROWS=out;
  return out;
}
v8marketIndependent=v20marketIndependent;

function v20politicsBlock(){
  if(!V20_POLITICS)return '';
  const before=V20_BASE_MARKET_INDEPENDENT(),after=v20marketIndependent();
  const rows=after.map((r,i)=>({period:r.ki,before:Number(before[i]?.base)||0,after:Number(r.base)||0,factor:r.political_factor}));
  const affected=rows.filter(r=>Math.abs(r.factor-1)>0.00005);
  const detail=affected.map(r=>`<tr><td><b>${r.period}</b></td><td>${fmt(r.before)}</td><td>${fmt(r.after)}</td><td>${pct(r.factor-1)}</td><td>${r.period.startsWith('2027')?'Presidencial':r.period.startsWith('2029')?'Legislativa':'Electoral'}</td></tr>`).join('') || '<tr><td colspan="5">Sin KI afectado dentro del horizonte visible.</td></tr>';
  return `<section class="card v20-politics"><div class="card-head"><div><span class="eyebrow">POLITICAL CYCLE · ELECTION UNCERTAINTY</span><h2>Desaceleración transitoria por especulación electoral</h2><p>La política no actúa como límite estructural: sólo modifica temporalmente la conversión de demanda alrededor de elecciones. El efecto presidencial es mayor que el legislativo y luego normaliza.</p></div>${badge('ASSUMPTION','amber')}</div>
    <div class="grid two">
      ${card('Base estructural vs Base con política','Mismo modelo macro/UIO; la diferencia es exclusivamente la ventana electoral.',lineChart(rows,[{key:'before',name:'Base antes política',color:COLORS.previous},{key:'after',name:'Base final',color:COLORS.red}],{zero:true}),'ELECTION OVERLAY')}
      ${card('Regla de uso','Cómo entra al forecast.',`<div class="decision-grid"><div><b>1</b><h3>Año normal</h3><p>Factor 1,00: política no toca el forecast.</p></div><div><b>2</b><h3>Presidencial</h3><p>Pequeña cautela Ago–Nov, máxima en octubre, con normalización posterior.</p></div><div><b>3</b><h3>Legislativa</h3><p>Impacto menor que presidencial. Nunca reemplaza macro, affordability ni momentum.</p></div></div>`,'METHODOLOGY')}
    </div>
    ${card('Impacto por KI','El factor anual es la media ponderada por estacionalidad de los meses electorales dentro de cada KI.',`<div class="table-wrap"><table class="table"><thead><tr><th>KI</th><th>Base pre-política</th><th>Base final</th><th>Impacto</th><th>Ciclo</th></tr></thead><tbody>${detail}</tbody></table></div>`,'VISIBLE ASSUMPTION')}
    <div class="note"><b>Gobernanza:</b> los multiplicadores políticos son supuestos de escenario y pueden actualizarse con evidencia. Nunca modifican actuals cerrados. Una noticia política aislada no cambia Base por sí sola.</div>
  </section>`;
}
forecast=function(){return `${V20_BASE_FORECAST()}${v20politicsBlock()}`};

fetch(`/data/political-cycle.json?v=${V20_VERSION}`,{cache:'no-store'})
  .then(r=>r.ok?r.json():Promise.reject(new Error(`Political cycle HTTP ${r.status}`)))
  .then(x=>{
    V20_POLITICS=x;
    if(typeof V7_MODEL!=='undefined'&&V7_MODEL){
      V7_MODEL.event_controls={
        active_live_assumption:true,
        presidential:x.presidential?.monthly_factors||{},
        legislative:x.legislative?.monthly_factors||{},
        governance:x.governance
      };
    }
    const ready=()=>{if(typeof DATA!=='undefined'&&DATA){render()}else setTimeout(ready,100)};ready();
  })
  .catch(err=>console.error('Political cycle layer unavailable',err));
