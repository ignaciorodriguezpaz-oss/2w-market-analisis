/* 2W Market Analysis v38 — supply intelligence replaces technical governance in narrative forecast */
const V38_VERSION='20261008-supply-intelligence-v1';
const V38_BASE_FORECAST=typeof forecast==='function'?forecast:null;
const V38_BASE_METHOD=typeof method==='function'?method:null;

function v38num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function v38esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function v38labelPeriod(p){try{return typeof label==='function'?label(p):p}catch{return p}}
function v38marketMap(){return new Map((DATA?.market_history||[]).map(r=>[r.period,v38num(r.value)]))}
function v38importsRows(){
  const market=v38marketMap();
  return (DATA?.imports?.monthly||[]).map(r=>{
    const imports=v38num(r.value),registrations=v38num(market.get(r.period));
    return {period:r.period,imports,registrations,ratio:registrations?imports/registrations:null,gap:imports-registrations};
  }).filter(r=>r.imports||r.registrations);
}
function v38supplyStats(){
  const rows=v38importsRows(),sum=(arr,k)=>arr.reduce((s,r)=>s+v38num(r[k]),0),imports=sum(rows,'imports'),regs=sum(rows,'registrations');
  const last3=rows.slice(-3),i3=sum(last3,'imports'),r3=sum(last3,'registrations');
  let streak=0;for(let i=rows.length-1;i>=0;i--){if(rows[i].ratio!==null&&rows[i].ratio<1)streak++;else break}
  const ratio=regs?imports/regs:null,ratio3=r3?i3/r3:null,gap=imports-regs;
  let status='BALANCEADO',tone='green';
  if(ratio!==null&&ratio<.90){status='ABSORBIENDO STOCK',tone='red'}else if(ratio!==null&&ratio<1){status='CONSUME STOCK',tone='amber'}else if(ratio!==null&&ratio>1.12){status='BUILD / OVERSTOCK WATCH',tone='blue'}
  return {rows,imports,regs,ratio,ratio3,gap,streak,status,tone};
}

function v38importsMarketSvg(rows){
  if(!rows.length)return '<div class="empty">Serie de importaciones no disponible.</div>';
  const W=1040,H=340,L=68,R=62,T=30,B=54,PW=W-L-R,PH=H-T-B;
  const max=Math.max(...rows.flatMap(r=>[r.imports,r.registrations]),1),yMax=Math.ceil(max*1.12/10000)*10000;
  const x=i=>L+(i+.5)*PW/rows.length,y=v=>T+PH-v/yMax*PH,bar=Math.min(44,PW/rows.length*.28);
  const ratioMax=Math.max(1.4,...rows.map(r=>r.ratio||0));const yr=v=>T+PH-(v/ratioMax)*PH;
  const grid=Array.from({length:5},(_,i)=>{const v=yMax*i/4,yy=y(v);return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" class="v38-grid"/><text x="${L-9}" y="${yy+4}" text-anchor="end" class="v38-axis">${fmt(v)}</text>`}).join('');
  const bars=rows.map((r,i)=>`<g><rect x="${x(i)-bar-2}" y="${y(r.imports)}" width="${bar}" height="${T+PH-y(r.imports)}" rx="4" class="v38-import"><title>${v38labelPeriod(r.period)} · Imports ${fmt(r.imports)}</title></rect><rect x="${x(i)+2}" y="${y(r.registrations)}" width="${bar}" height="${T+PH-y(r.registrations)}" rx="4" class="v38-market"><title>${v38labelPeriod(r.period)} · Mercado ${fmt(r.registrations)}</title></rect></g>`).join('');
  const pts=rows.map((r,i)=>r.ratio?`${i?'L':'M'} ${x(i)} ${yr(r.ratio)}`:'').filter(Boolean).join(' ');
  const dots=rows.map((r,i)=>r.ratio?`<circle cx="${x(i)}" cy="${yr(r.ratio)}" r="4" class="v38-ratio-dot"><title>${v38labelPeriod(r.period)} · Imports / Market ${(r.ratio*100).toFixed(1)}%</title></circle>`:'').join('');
  const ticks=rows.map((r,i)=>`<text x="${x(i)}" y="${H-18}" text-anchor="middle" class="v38-axis">${v38labelPeriod(r.period)}</text>`).join('');
  const right=Array.from({length:4},(_,i)=>{const v=ratioMax*i/3,yy=yr(v);return `<text x="${W-R+9}" y="${yy+4}" class="v38-axis">${Math.round(v*100)}%</text>`}).join('');
  return `<div class="v38-chart-scroll"><svg class="v38-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Importaciones versus patentamientos y ratio supply market">${grid}${bars}<path d="${pts}" class="v38-ratio-line"/>${dots}${ticks}${right}</svg></div>`;
}

function v38activeRows(){
  if(typeof V13_MODEL_DATA==='undefined'||!V13_MODEL_DATA?.periods?.length)return [];
  const periods=V13_MODEL_DATA.periods||[],active=V13_MODEL_DATA.active||[];
  return periods.map((period,i)=>{
    let total=0,honda=0,newModels=0;
    active.forEach(r=>{
      const vals=r[4]||[],v=v38num(vals[i]);
      if(v>0){
        total++;if(String(r[1]||'').toUpperCase()==='HONDA')honda++;
        const first=vals.findIndex(x=>v38num(x)>0);if(first===i)newModels++;
      }
    });
    return {period,total,honda,newModels};
  });
}
function v38activeSvg(rows){
  if(!rows.length)return '<div class="empty">La serie mensual de modelos activos todavía no está cargada.</div>';
  const W=1040,H=330,L=58,R=58,T=30,B=52,PW=W-L-R,PH=H-T-B,max=Math.max(...rows.map(r=>r.total),1),yMax=Math.ceil(max*1.12/20)*20;
  const x=i=>L+(i+.5)*PW/rows.length,y=v=>T+PH-v/yMax*PH,bar=Math.min(42,PW/rows.length*.48),hMax=Math.max(...rows.map(r=>r.honda),1),yh=v=>T+PH-v/(hMax*1.2)*PH;
  const grid=Array.from({length:5},(_,i)=>{const v=yMax*i/4,yy=y(v);return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" class="v38-grid"/><text x="${L-8}" y="${yy+4}" text-anchor="end" class="v38-axis">${Math.round(v)}</text>`}).join('');
  const bars=rows.map((r,i)=>`<g><rect x="${x(i)-bar/2}" y="${y(r.total)}" width="${bar}" height="${T+PH-y(r.total)}" rx="4" class="v38-active"><title>${v38labelPeriod(r.period)} · ${r.total} modelos activos · ${r.newModels} altas en el mes</title></rect>${r.newModels?`<text x="${x(i)}" y="${Math.max(T+12,y(r.total)-8)}" text-anchor="middle" class="v38-new-label">+${r.newModels}</text>`:''}</g>`).join('');
  const path=rows.map((r,i)=>`${i?'L':'M'} ${x(i)} ${yh(r.honda)}`).join(' '),dots=rows.map((r,i)=>`<circle cx="${x(i)}" cy="${yh(r.honda)}" r="3.8" class="v38-honda-dot"><title>${v38labelPeriod(r.period)} · Honda ${r.honda} modelos activos</title></circle>`).join('');
  const ticks=rows.map((r,i)=>`<text x="${x(i)}" y="${H-17}" text-anchor="middle" class="v38-axis">${v38labelPeriod(r.period)}</text>`).join('');
  return `<div class="v38-chart-scroll"><svg class="v38-chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Cantidad de modelos activos por mes y lineup Honda"><g>${grid}${bars}</g><path d="${path}" class="v38-honda-line"/>${dots}${ticks}</svg></div>`;
}

function v38norm(s){return String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim()}
function v38modelMatch(name){
  if(typeof V13_MODEL_DATA==='undefined'||!V13_MODEL_DATA?.active)return null;
  const canonical=typeof v24canonical==='function'?v24canonical(name):name,cn=v38norm(canonical),rn=v38norm(name);
  let hit=V13_MODEL_DATA.active.find(r=>v38norm(r[0])===cn)||V13_MODEL_DATA.active.find(r=>v38norm(r[0])===rn);
  if(hit)return hit;
  hit=V13_MODEL_DATA.active.find(r=>{const x=v38norm(r[0]);return x.includes(cn)||cn.includes(x)||x.includes(rn)||rn.includes(x)});
  return hit||null;
}
function v38firstPositive(vals,periods){const i=(vals||[]).findIndex(v=>v38num(v)>0);return i>=0?periods[i]:null}
function v38newImportRows(){
  const periods=(typeof V13_MODEL_DATA!=='undefined'&&V13_MODEL_DATA?.periods)||[],cut=String(DATA?.imports?.cutoff||'').slice(0,7);
  return (DATA?.imports?.new_model_signals||[]).map(s=>{
    const hit=v38modelMatch(s.name),vals=hit?.[4]||[],firstReg=hit?v38firstPositive(vals,periods):null,last=vals.length?v38num(vals.at(-1)):0;
    return {name:s.name,units:v38num(s.units),signal:s.signal||s.status||'EARLY SIGNAL',importSeen:s.first_seen||s.first_import_period||cut||null,firstReg,last,brand:hit?.[1]||String(s.name||'').split(' ')[0]||'—'};
  });
}
function v38newModelsTable(){
  const rows=v38newImportRows();
  if(!rows.length)return '<div class="empty">No hay señales de modelos nuevos cargadas.</div>';
  return `<div class="table-wrap"><table class="table v38-new-table"><thead><tr><th>Modelo detectado</th><th>Marca</th><th>Imports señal</th><th>Detectado imports</th><th>1er patentamiento en Pivot</th><th>Último mes</th><th>Lectura</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${v38esc(r.name)}</b></td><td>${v38esc(r.brand)}</td><td>${fmt(r.units)}</td><td>${r.importSeen?`${v38labelPeriod(r.importSeen)} <small>corte</small>`:'—'}</td><td>${r.firstReg?v38labelPeriod(r.firstReg):badge('AÚN NO VISIBLE','amber')}</td><td>${r.firstReg?fmt(r.last):'—'}</td><td>${r.firstReg?(r.last>0?'YA ACTIVO · seguir ramp-up':'APARECIÓ Y HOY SIN VOLUMEN'):'EARLY SIGNAL · vigilar alta'}</td></tr>`).join('')}</tbody></table></div>`;
}

function v38supplyAnalysis(){
  const s=v38supplyStats(),a=v38activeRows(),first=a[0],last=a.at(-1),modelDelta=first&&last?last.total-first.total:0,hondaDelta=first&&last?last.honda-first.honda:0,signals=v38newImportRows(),unreg=signals.filter(r=>!r.firstReg).length;
  const supply=s.ratio===null?'sin ratio':`${(s.ratio*100).toFixed(1)}% del mercado alineado`;
  return `<div class="v38-read-grid"><div><b>Supply vs demanda</b><span>${supply}. Gap observado ${s.gap>=0?'+':''}${fmt(s.gap)} u. en meses con imports disponibles.</span></div><div><b>Lineup competitivo</b><span>${last?`${last.total} modelos activos en ${v38labelPeriod(last.period)} (${modelDelta>=0?'+':''}${modelDelta} vs inicio). Honda ${last.honda} (${hondaDelta>=0?'+':''}${hondaDelta}).`:'Pendiente de Pivot mensual.'}</span></div><div><b>Nuevos modelos</b><span>${signals.length} señales en importaciones; ${unreg} todavía sin primer patentamiento visible en la Pivot reciente.</span></div></div>`;
}

function v38supplyBlock(){
  const s=v38supplyStats(),active=v38activeRows(),latest=active.at(-1)||null;
  return `<section class="card v38-supply"><div class="card-head"><div><span class="eyebrow">SUPPLY INTELLIGENCE · IMPORTS / MARKET / LINEUP</span><h2>Oferta, presión de stock y entrada de modelos</h2><p>Importaciones se comparan contra patentamientos para leer presión de oferta. No se suman al mercado y el flujo acumulado no se presenta como stock físico de la red sin inventario inicial validado.</p></div>${badge(s.status,s.tone)}</div>
    <section class="kpis v38-kpis">
      ${kpi('IMPORTS ALINEADOS',fmt(s.imports),`corte ${DATA?.imports?.cutoff||'—'}`,COLORS.blue,'SUPPLY')}
      ${kpi('MERCADO MISMO PERÍODO',fmt(s.regs),'mismos meses que imports',COLORS.actual,'REGISTRATIONS')}
      ${kpi('IMPORT / MARKET',s.ratio===null?'—':`${(s.ratio*100).toFixed(1)}%`,s.gap>=0?`flow +${fmt(s.gap)}`:`flow ${fmt(s.gap)}`,s.ratio!==null&&s.ratio<1?COLORS.amber:COLORS.green,'FLOW PROXY')}
      ${kpi('COBERTURA 3M',s.ratio3===null?'—':`${(s.ratio3*100).toFixed(1)}%`,`${s.streak} meses consecutivos <100%`,COLORS.amber,'EARLY SIGNAL')}
      ${kpi('MODELOS ACTIVOS',latest?String(latest.total):'—',latest?`${v38labelPeriod(latest.period)} · Honda ${latest.honda}`:'Pivot pendiente',COLORS.red,'LINEUP')}
    </section>
    <div class="grid two v38-grid2">
      ${card('Importaciones vs mercado','Columnas mensuales + ratio Imports / Patentamientos. Sirve para detectar absorción o construcción de supply.',v38importsMarketSvg(s.rows),'SUPPLY VS DEMAND')}
      ${card('Evolución del lineup activo','Cantidad de modelos con patentamientos por mes. La línea roja muestra cuántos modelos Honda están activos; +N marca altas del mes.',v38activeSvg(active),'ACTIVE MODELS')}
    </div>
    ${card('Nuevos modelos detectados en importaciones','Cruce contra la Pivot reciente: cuándo se detectan en supply, cuándo aparece el primer patentamiento y si ya están ganando volumen.',v38newModelsTable(),'NEW MODEL RADAR')}
    ${v38supplyAnalysis()}
    <div class="note"><b>Stock estimado:</b> por ahora se publica como <b>flow proxy</b> (imports − patentamientos) y cobertura relativa. No equivale a stock físico terminal/dealer sin opening inventory, producción local adicional, exportaciones y stock de red validados.</div>
  </section>`;
}

function v38moveGovernanceToMethod(html){
  if(typeof v27forecastGovernanceBlock!=='function')return html;
  let block='';try{block=v27forecastGovernanceBlock().replace('v27-governance','v38-governance-tech')}catch{return html}
  const i=html.lastIndexOf('</section>');return i>=0?`${html.slice(0,i)}${block}${html.slice(i)}`:`${html}${block}`;
}

if(V38_BASE_FORECAST){
  forecast=function(){
    const html=V38_BASE_FORECAST(),i=html.lastIndexOf('</section>');
    return i>=0?`${html.slice(0,i)}${v38supplyBlock()}${html.slice(i)}`:`${html}${v38supplyBlock()}`;
  };
}
if(V38_BASE_METHOD){method=function(){return v38moveGovernanceToMethod(V38_BASE_METHOD())}}

(function v38boot(){
  const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof forecast==='function'){try{render()}catch(e){console.error('v38 supply intelligence render',e)}}else setTimeout(ready,120)};
  ready();
})();
