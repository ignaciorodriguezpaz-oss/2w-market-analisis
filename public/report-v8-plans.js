/* 2W Market Analysis v8 — Honda planning matrix: PRB/1Q/2Q/3Q + 5Y OB, one Market/Honda input surface */
const V8_VERSION='20261007-honda-plan-matrix';
const V8_CURRENT_KI='2026/27';
const V8_STAGE_KEYS=['PRB','1QFCST','2QFCST','3QFCST'];
const V8_STAGE_LABELS={PRB:'PRB','1QFCST':'1Q FCST','2QFCST':'2Q FCST','3QFCST':'3Q FCST'};
const V8_OB_YEARS=['2027/28','2028/29','2029/30','2030/31','2031/32'];
const V8_BASE_FORECAST=forecast;
const V8_BASE_BIND=bindSingle;
let V8_PLAN_MATRIX=(()=>{try{return JSON.parse(localStorage.getItem('2w.plan.matrix')||'{}')||{}}catch{return {}}})();

function v8num(v){const n=Number(v);return Number.isFinite(n)&&n>0?n:null}
function v8clamp(x,a,b){return Math.max(a,Math.min(b,x))}
function v8cell(id){return V8_PLAN_MATRIX[id]||{}}
function v8explicit(id,field){return v8num(v8cell(id)[field])}
function v8hasExplicit(id){return !!(v8explicit(id,'market')||v8explicit(id,'honda'))}
function v8save(){try{localStorage.setItem('2w.plan.matrix',JSON.stringify(V8_PLAN_MATRIX))}catch{}}
function v8migrateLegacy(){
  if(Object.keys(V8_PLAN_MATRIX).length)return;
  try{
    const raw=localStorage.getItem('2w.plan');
    if(!raw)return;
    const p=JSON.parse(raw||'{}');
    if(v8num(p.marketKI)||v8num(p.hondaKI))V8_PLAN_MATRIX['3QFCST']={market:v8num(p.marketKI),honda:v8num(p.hondaKI)};
    v8save();
  }catch{}
}
v8migrateLegacy();

function v8currentHondaBase(){
  const actual=typeof v3actualHondaKI==='function'?v3actualHondaKI():0;
  const future=v3sum((DATA.honda?.forecast||[]).map(r=>Number(r.base)||0));
  return Math.round(actual+future);
}
function v8marketIndependent(){
  const cur=v3currentKI(),currentBase=Number(cur.base)||0,ref=v7model?.().reference_ki||{},refCur=Number(ref[V8_CURRENT_KI])||currentBase||1;
  const years=[V8_CURRENT_KI,...V8_OB_YEARS],out=[];
  const sourceGrowth2031=Number(ref['2030/31'])&&Number(ref['2029/30'])?Number(ref['2030/31'])/Number(ref['2029/30']):1+(Number(DATA.forecast?.structural_growth)||.02);
  years.forEach((ki,i)=>{
    let base;
    if(i===0)base=currentBase;
    else if(Number(ref[ki]))base=Math.round(currentBase*(Number(ref[ki])/refCur));
    else {const prev=out.at(-1)?.base||currentBase;base=Math.round(prev*sourceGrowth2031)}
    const downRatio=currentBase?Number(cur.down||currentBase)/currentBase:1;
    const upRatio=currentBase?Number(cur.up||currentBase)/currentBase:1;
    out.push({ki,base,down:Math.round(base*downRatio),up:Math.round(base*upRatio),source:Number(ref[ki])?'LIVE-ANCHORED SOURCE MODEL':'EXTRAPOLATED SOURCE TREND'});
  });
  return out;
}
function v8hondaIndependent(marketRows){
  const currentMarket=marketRows[0]?.base||1,currentHonda=v8currentHondaBase(),baseShare=currentHonda/currentMarket;
  let drift=0;
  try{const r=v3entityMetrics('brand','HONDA');drift=v8clamp((Number(r.r3Share)||baseShare)-(Number(r.r12Share)||baseShare),-.015,.015)}catch{}
  return marketRows.map((m,i)=>{
    const share=i===0?baseShare:v8clamp(baseShare+drift*((1-Math.pow(.55,i))/(1-.55)),.08,.35);
    return {ki:m.ki,base:Math.round(m.base*share),share};
  });
}
function v8independent(){const market=v8marketIndependent(),honda=v8hondaIndependent(market);return market.map((m,i)=>({...m,hondaBase:honda[i].base,hondaShare:honda[i].share}))}

/* Effective user plan behavior:
   - before any explicit input: use independent forecast;
   - current KI revisions carry the last entered Market/Honda forward from PRB -> 3Q;
   - once an explicit anchor exists, blank future OB years inherit market growth from independent FCST and keep the latest explicit user share;
   - a later explicit row becomes the new anchor. */
function v8effectivePlan(){
  const ind=v8independent(),curModel=ind[0];
  let anchored=false,market=curModel.base,honda=curModel.hondaBase,share=honda/market;
  const stages=V8_STAGE_KEYS.map(key=>{
    const em=v8explicit(key,'market'),eh=v8explicit(key,'honda');
    if(em||eh){anchored=true;market=em||market;honda=eh||(market*share);share=market?honda/market:share}
    else if(!anchored){market=curModel.base;honda=curModel.hondaBase;share=curModel.hondaShare}
    return {id:key,ki:V8_CURRENT_KI,label:V8_STAGE_LABELS[key],market:Math.round(market),honda:Math.round(honda),share,explicit:!!(em||eh),mode:(em||eh)?'USER INPUT':anchored?'AUTO · LAST PLAN':'AUTO · FCST'};
  });
  let prevModel=curModel;
  const future=V8_OB_YEARS.map((ki,i)=>{
    const model=ind[i+1],em=v8explicit(ki,'market'),eh=v8explicit(ki,'honda');
    if(!anchored && !(em||eh)){
      market=model.base;honda=model.hondaBase;share=model.hondaShare;
    }else{
      if(em||eh){
        anchored=true;
        const growth=prevModel?.base?model.base/prevModel.base:1;
        market=em||Math.round(market*growth);
        honda=eh||Math.round(market*share);
        share=market?honda/market:share;
      }else{
        const growth=prevModel?.base?model.base/prevModel.base:1;
        market=Math.round(market*growth);
        honda=Math.round(market*share);
      }
    }
    prevModel=model;
    return {id:ki,ki,label:`OB ${ki}`,market:Math.round(market),honda:Math.round(honda),share,explicit:!!(em||eh),mode:(em||eh)?'USER INPUT':anchored?'AUTO · LAST PLAN':'AUTO · FCST'};
  });
  return {ind,stages,future,active:stages.at(-1),all:[...stages,...future]};
}
function v8syncActive(){
  if(typeof DATA==='undefined'||!DATA)return;
  const eff=v8effectivePlan(),a=eff.active;
  if(a){V3_PLAN.marketKI=a.market;V3_PLAN.hondaKI=a.honda;v3save();syncUserScenario()}
}

function v8editorTable(){
  const e=v8effectivePlan(),ind=e.ind,rows=[...e.stages,...e.future];
  return `<div class="table-wrap"><table class="table v8-plan-table"><thead><tr><th>Plan / KI</th><th>Mercado User</th><th>Honda User</th><th>MS User</th><th>Mercado FCST</th><th>Honda FCST</th><th>MS FCST</th><th>Modo</th></tr></thead><tbody>${rows.map((r,idx)=>{const model=r.ki===V8_CURRENT_KI?ind[0]:ind.find(x=>x.ki===r.ki)||ind.at(-1);return `<tr class="${r.id==='3QFCST'?'v8-active-row':''}"><td><b>${r.label}</b><small>${r.ki===V8_CURRENT_KI?'KI ACTUAL':'OUTER BUSINESS'}</small></td><td><input class="v8-input" data-v8-id="${r.id}" data-v8-field="market" type="number" step="1000" min="0" value="${v8explicit(r.id,'market')||''}" placeholder="${fmt(r.market)}"><small>efectivo ${fmt(r.market)}</small></td><td><input class="v8-input" data-v8-id="${r.id}" data-v8-field="honda" type="number" step="1000" min="0" value="${v8explicit(r.id,'honda')||''}" placeholder="${fmt(r.honda)}"><small>efectivo ${fmt(r.honda)}</small></td><td><strong>${pct(r.share)}</strong></td><td>${fmt(model.base)}</td><td>${fmt(model.hondaBase)}</td><td>${pct(model.hondaShare)}</td><td>${badge(r.mode,r.explicit?'purple':r.mode.includes('LAST')?'amber':'green')}</td></tr>`}).join('')}</tbody></table></div>`;
}
function v8planCharts(){
  const e=v8effectivePlan(),future=[e.active,...e.future],market=future.map((r,i)=>({period:r.ki,user:r.market,fcst:e.ind[i]?.base})),honda=future.map((r,i)=>({period:r.ki,user:r.honda,fcst:e.ind[i]?.hondaBase}));
  return `<div class="grid two">${card('Mercado · Plan User vs FCST','KI actual + próximos 5 OB.',lineChart(market,[{key:'fcst',name:'FCST independiente',color:COLORS.blue},{key:'user',name:'Plan User',color:V3_PURPLE}],{zero:true}),'MULTI-YEAR')}${card('Honda · Plan User vs FCST','Volumen Honda; el share se deriva automáticamente.',lineChart(honda,[{key:'fcst',name:'FCST Honda',color:COLORS.red},{key:'user',name:'Plan User',color:V3_PURPLE}],{zero:true}),'MULTI-YEAR')}</div>`;
}
function v8fcstLongTable(){
  const rows=v8independent();
  return `<section class="card v8-long-fcst"><div class="card-head"><div><span class="eyebrow">INDEPENDENT FORECAST · MULTI-YEAR</span><h2>Forecast KI actual + próximos 5 años</h2><p>Independiente del Plan User. El source model se re-ancla al último Base live; 2031/32 extiende el último crecimiento estructural disponible.</p></div>${badge('FCST ≠ PLAN','green')}</div><div class="table-wrap"><table class="table"><thead><tr><th>KI</th><th>Down Mkt</th><th>Base Mkt</th><th>Up Mkt</th><th>Honda Base</th><th>Honda MS</th><th>Fuente</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.ki}</b></td><td>${fmt(r.down)}</td><td><strong>${fmt(r.base)}</strong></td><td>${fmt(r.up)}</td><td>${fmt(r.hondaBase)}</td><td>${pct(r.hondaShare)}</td><td><small>${r.source}</small></td></tr>`).join('')}</tbody></table></div></section>`;
}

userBlock=function(){
  const e=v8effectivePlan(),a=e.active,fit=v3planFit();
  return chapter('user','07','Plan User plurianual','Un solo lugar para cargar volúmenes. Ingresás únicamente Mercado y Honda; share, gaps, reversión mensual y OB se calculan automáticamente.',`<section class="kpis">${kpi('PLAN VIGENTE','3Q FCST',`KI ${V8_CURRENT_KI}`,V3_PURPLE,'PLAN VERSION')}${kpi('MERCADO PLAN',fmt(a.market),`vs FCST ${fmt(e.ind[0].base)}`,V3_PURPLE,a.explicit?'USER INPUT':'AUTO')}${kpi('HONDA PLAN',fmt(a.honda),`vs FCST ${fmt(e.ind[0].hondaBase)}`,COLORS.red,a.explicit?'USER INPUT':'AUTO')}${kpi('MS PLAN',pct(a.share),`FCST ${pct(e.ind[0].hondaShare)}`,COLORS.amber,'CALC')}${kpi('COMPATIBILIDAD',`${fit.compat}%`,fit.zone,COLORS.green,'ESTIMATE')}</section><div class="v8-help"><b>Cómo funciona:</b><span>PRB → 1Q → 2Q → 3Q conserva la historia del KI actual. Una celda vacía hereda el último plan; si nunca cargaste nada usa mi FCST. En OB, el último valor que ingresaste se transforma en el nuevo ancla para los años siguientes.</span></div>${v8editorTable()}<div class="v8-actions"><button id="v8ApplyPlan">Guardar y recalcular</button><button id="v8ClearPlan" class="secondary">Vaciar inputs y volver a FCST</button></div>${v8planCharts()}<div class="note"><b>Importante:</b> editar Plan User nunca modifica el forecast independiente. Para el KI actual, el valor efectivo de 3Q FCST alimenta la reversión Oct–Mar y mantiene actuals cerrados bloqueados.</div>`);
};

planning=function(){
  const e=v8effectivePlan(),a=e.active,ind=e.ind[0],actualH=v3actualHondaKI(),actualM=v3actualMarketKI(),remainH=Math.max(0,a.honda-actualH),remainM=Math.max(0,a.market-actualM);
  return chapter('planning','08','Honda Planning · KI / Budget / OB','El plan corporativo se lee como revisiones del KI actual y OB a cinco años; el forecast independiente queda siempre al lado.',`<section class="kpis">${kpi('ACTUAL KI MARKET',fmt(actualM),'Abr–Sep cerrado',COLORS.actual,'FACT')}${kpi('ACTUAL KI HONDA',fmt(actualH),'Abr–Sep cerrado',COLORS.red,'FACT')}${kpi('RESTANTE PLAN MKT',fmt(remainM),'Oct–Mar',V3_PURPLE,'CALC')}${kpi('RESTANTE PLAN HONDA',fmt(remainH),'Oct–Mar',COLORS.red,'CALC')}${kpi('PLAN MS',pct(a.share),`FCST ${pct(ind.hondaShare)}`,COLORS.amber,'CALC')}</section>${v8planCharts()}${card('Revisiones del KI actual','PRB / 1Q FCST / 2Q FCST / 3Q FCST. La última revisión es la vigente.',`<div class="v8-stage-strip">${e.stages.map(r=>`<div class="${r.id==='3QFCST'?'active':''}"><span>${r.label}</span><b>${fmt(r.market)} / ${fmt(r.honda)}</b><small>MS ${pct(r.share)} · ${r.mode}</small></div>`).join('')}</div>`,'BUDGET HISTORY')}<div class="note">Edición centralizada en <b>Plan User</b>. Esta sección es deliberadamente read-only para evitar tener números diferentes cargados en dos lugares.</div>`);
};

forecast=function(){return `${V8_BASE_FORECAST()}${v8fcstLongTable()}`};

bindSingle=function(){
  V8_BASE_BIND();
  const apply=$('#v8ApplyPlan');
  if(apply)apply.onclick=()=>{
    $$('.v8-input').forEach(el=>{const id=el.dataset.v8Id,field=el.dataset.v8Field,val=v8num(el.value);V8_PLAN_MATRIX[id]=V8_PLAN_MATRIX[id]||{};if(val)V8_PLAN_MATRIX[id][field]=val;else delete V8_PLAN_MATRIX[id][field];if(!Object.keys(V8_PLAN_MATRIX[id]).length)delete V8_PLAN_MATRIX[id]});
    v8save();v8syncActive();render();
  };
  const clear=$('#v8ClearPlan');
  if(clear)clear.onclick=()=>{V8_PLAN_MATRIX={};v8save();v8syncActive();render()};
  $$('.v8-input').forEach(el=>el.onkeydown=e=>{if(e.key==='Enter')apply?.click()});
};

(function v8boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof V7_MODEL!=='undefined'&&V7_MODEL){v8syncActive();render()}else setTimeout(ready,120)};ready()})();
