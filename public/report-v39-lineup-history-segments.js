/* 2W Market Analysis v39 — monthly active lineup history from Pivot + Segment 1 / Segment 2 */
const V39_VERSION='20261008-lineup-history-segments-v1';

function v39n(v){const n=Number(v);return Number.isFinite(n)?n:0}
function v39esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function v39seg(name){try{return typeof v23seg==='function'?v23seg(name):{segment1:'OTHERS',segment2:'SIN CLASIFICAR'}}catch{return {segment1:'OTHERS',segment2:'SIN CLASIFICAR'}}}
function v39brand(name){try{return v32modelMeta(name)?.brand||String(name).split(' ')[0]||'—'}catch{return String(name).split(' ')[0]||'—'}}

function v39pivotUniverse(){
  const hist=(typeof V13_MODEL_HISTORY!=='undefined'&&Array.isArray(V13_MODEL_HISTORY))?V13_MODEL_HISTORY:[];
  const names=[...new Set(hist.flatMap(r=>Object.keys(r||{}).filter(k=>k!=='period'&&k!=='total'&&k!=='value')))];
  const first={};
  names.forEach(n=>{const i=hist.findIndex(r=>v39n(r?.[n])>0);first[n]=i>=0?i:null});
  return {hist,names,first};
}

function v39monthlyActive(){
  const {hist,names,first}=v39pivotUniverse();
  return hist.map((r,i)=>{
    const s1={},s2={},s1Honda={},s2Honda={};let total=0,honda=0,newModels=0;
    names.forEach(name=>{
      if(v39n(r?.[name])<=0)return;
      total++;if(first[name]===i)newModels++;
      const s=v39seg(name),a=s.segment1||'OTHERS',b=s.segment2||'SIN CLASIFICAR',isHonda=String(v39brand(name)).toUpperCase()==='HONDA';
      s1[a]=(s1[a]||0)+1;s2[b]=(s2[b]||0)+1;
      if(isHonda){honda++;s1Honda[a]=(s1Honda[a]||0)+1;s2Honda[b]=(s2Honda[b]||0)+1}
    });
    return {period:r.period,total,honda,newModels,s1,s2,s1Honda,s2Honda};
  });
}

function v39palette(key,i){
  const known={CUB:'#d7a23a',LMC:'#4f7fda',SC:'#5ca66f',FUN:'#7a66c7',ATV:'#9b6f4b',OTHERS:'#8a919d','ON-OFF':'#4f7fda','ON OFF':'#4f7fda','BUSINESS':'#d7a23a','SCOOTER':'#5ca66f','SPORT':'#d45b5b','FUN +300':'#7a66c7'};
  const fallback=['#4f7fda','#d7a23a','#5ca66f','#7a66c7','#d45b5b','#9b6f4b','#5f8793','#8a919d','#b7788d','#6f8d55'];
  return known[String(key||'').toUpperCase()]||fallback[i%fallback.length];
}

function v39segmentKeys(rows,key,limit=8){
  const score={};rows.forEach(r=>Object.entries(r[key]||{}).forEach(([k,v])=>score[k]=(score[k]||0)+v39n(v)));
  return Object.entries(score).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(x=>x[0]);
}

function v39stackedActiveSvg(rows,key,limit=8){
  if(!rows.length)return '<div class="empty">Historia mensual de Pivot no disponible.</div>';
  const keys=v39segmentKeys(rows,key,limit);if(!keys.length)return '<div class="empty">Sin segmentación disponible.</div>';
  const W=1080,H=390,L=52,R=24,T=50,B=58,PW=W-L-R,PH=H-T-B;
  const totals=rows.map(r=>keys.reduce((s,k)=>s+v39n(r[key]?.[k]),0)),max=Math.max(...totals,1),yMax=Math.ceil(max*1.12/10)*10;
  const x=i=>L+(i+.5)*PW/rows.length,y=v=>T+PH-v/yMax*PH,bar=Math.min(52,PW/rows.length*.64);
  const grid=Array.from({length:5},(_,j)=>{const v=yMax*j/4,yy=y(v);return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" stroke="rgba(90,100,115,.16)"/><text x="${L-9}" y="${yy+4}" text-anchor="end" font-size="11" fill="#69717e">${Math.round(v)}</text>`}).join('');
  const bars=rows.map((r,i)=>{let acc=0;return keys.map((k,ki)=>{const v=v39n(r[key]?.[k]),h=v/yMax*PH,yy=T+PH-(acc+v)/yMax*PH;acc+=v;return v?`<rect x="${x(i)-bar/2}" y="${yy}" width="${bar}" height="${h}" fill="${v39palette(k,ki)}"><title>${r.period} · ${k}: ${v} modelos activos</title></rect>`:''}).join('')}).join('');
  const ticks=rows.map((r,i)=>`<text x="${x(i)}" y="${H-21}" text-anchor="middle" font-size="10.5" fill="#69717e">${typeof v38labelPeriod==='function'?v38labelPeriod(r.period):r.period}</text>`).join('');
  const legends=keys.map((k,i)=>`<g transform="translate(${L+i*118},18)"><rect width="10" height="10" rx="2" fill="${v39palette(k,i)}"/><text x="15" y="9" font-size="10.5" fill="#4e5662">${v39esc(k)}</text></g>`).join('');
  const labels=rows.map((r,i)=>`<text x="${x(i)}" y="${Math.max(44,y(totals[i])-7)}" text-anchor="middle" font-size="10" font-weight="700" fill="#49515d">${totals[i]}</text>`).join('');
  return `<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:900px;height:auto" role="img" aria-label="Modelos activos por mes segmentados">${grid}${legends}${bars}${labels}${ticks}</svg></div>`;
}

function v39segmentDeltaRows(key){
  const rows=v39monthlyActive();if(!rows.length)return [];
  const cur=rows.at(-1),prev=rows.length>=13?rows.at(-13):rows[0],keys=[...new Set([...Object.keys(cur[key]||{}),...Object.keys(prev[key]||{})])];
  return keys.map(k=>({name:k,current:v39n(cur[key]?.[k]),prev:v39n(prev[key]?.[k]),delta:v39n(cur[key]?.[k])-v39n(prev[key]?.[k]),honda:v39n(cur[key==='s1'?'s1Honda':'s2Honda']?.[k])})).sort((a,b)=>b.current-a.current);
}

function v39segmentDeltaTable(key,title){
  const rows=v39segmentDeltaRows(key);if(!rows.length)return '<div class="empty">Sin datos suficientes.</div>';
  const periodRows=v39monthlyActive(),cur=periodRows.at(-1),prev=periodRows.length>=13?periodRows.at(-13):periodRows[0];
  return `<div class="table-wrap"><table class="table"><thead><tr><th>${title}</th><th>${v39esc(cur?.period||'Actual')}</th><th>${v39esc(prev?.period||'Base')}</th><th>Δ modelos</th><th>Honda activos</th><th>Lectura</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${v39esc(r.name)}</b></td><td>${r.current}</td><td>${r.prev}</td><td class="${r.delta>0?'green-txt':r.delta<0?'red-txt':''}">${r.delta>0?'+':''}${r.delta}</td><td>${r.honda||0}</td><td>${r.delta>0?`Hay ${r.delta} modelos activos más que en el comparable.`:r.delta<0?`Hay ${Math.abs(r.delta)} modelos activos menos.`:'Lineup activo estable.'}</td></tr>`).join('')}</tbody></table></div>`;
}

function v39newlyActiveRows(){
  const {hist,names,first}=v39pivotUniverse();if(!hist.length)return [];
  const cutoff=Math.max(0,hist.length-12);
  return names.map(name=>({name,first:first[name]})).filter(x=>x.first!==null&&x.first>=cutoff).map(x=>{const s=v39seg(x.name),last=v39n(hist.at(-1)?.[x.name]);return {name:x.name,brand:v39brand(x.name),segment1:s.segment1||'OTHERS',segment2:s.segment2||'SIN CLASIFICAR',firstPeriod:hist[x.first]?.period,last,current:last>0}}).sort((a,b)=>String(b.firstPeriod).localeCompare(String(a.firstPeriod))||b.last-a.last);
}

function v39newlyActiveTable(){
  const rows=v39newlyActiveRows();if(!rows.length)return '<div class="empty">No se detectaron primeras apariciones dentro de la ventana Pivot cargada.</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Modelo</th><th>Marca</th><th>Segmento 1</th><th>Segmento 2</th><th>1er mes con patentamiento</th><th>Último mes</th><th>Estado</th></tr></thead><tbody>${rows.slice(0,30).map(r=>`<tr><td><b>${v39esc(r.name)}</b></td><td>${v39esc(r.brand)}</td><td>${v39esc(r.segment1)}</td><td>${v39esc(r.segment2)}</td><td>${typeof v38labelPeriod==='function'?v38labelPeriod(r.firstPeriod):r.firstPeriod}</td><td>${fmt(r.last)}</td><td>${r.current?badge('ACTIVO','green'):badge('SIN PATENTAR AHORA','amber')}</td></tr>`).join('')}</tbody></table></div>`;
}

function v39importTable(){
  const rows=typeof v38newImportRows==='function'?v38newImportRows():[];
  if(!rows.length)return '<div class="empty">No hay señales de modelos nuevos cargadas en importaciones.</div>';
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Modelo detectado</th><th>Marca</th><th>Seg. 1</th><th>Seg. 2</th><th>Imports</th><th>Detectado imports</th><th>1er patentamiento Pivot</th><th>Estado</th></tr></thead><tbody>${rows.map(r=>{const hit=typeof v38modelMatch==='function'?v38modelMatch(r.name):null,s=hit?v39seg(hit[0]):{segment1:'PENDIENTE',segment2:'PENDIENTE'};return `<tr><td><b>${v39esc(r.name)}</b></td><td>${v39esc(r.brand)}</td><td>${v39esc(s.segment1)}</td><td>${v39esc(s.segment2)}</td><td>${fmt(r.units)}</td><td>${r.importSeen?(typeof v38labelPeriod==='function'?v38labelPeriod(r.importSeen):r.importSeen):'—'}</td><td>${r.firstReg?(typeof v38labelPeriod==='function'?v38labelPeriod(r.firstReg):r.firstReg):badge('AÚN NO VISIBLE','amber')}</td><td>${r.firstReg?badge('YA PATENTÓ','green'):badge('EARLY SIGNAL','amber')}</td></tr>`}).join('')}</tbody></table></div>`;
}

const V39_BASE_SUPPLY_BLOCK=typeof v38supplyBlock==='function'?v38supplyBlock:null;
if(V39_BASE_SUPPLY_BLOCK){
  v38supplyBlock=function(){
    const s=v38supplyStats(),active=v39monthlyActive(),latest=active.at(-1)||null,first=active[0]||null,delta=latest&&first?latest.total-first.total:0;
    const range=active.length?`${v38labelPeriod(active[0].period)} → ${v38labelPeriod(active.at(-1).period)}`:'Pivot pendiente';
    return `<section class="card v38-supply"><div class="card-head"><div><span class="eyebrow">SUPPLY INTELLIGENCE · IMPORTS / MARKET / ACTIVE LINEUP</span><h2>Oferta, line up activo y entrada de modelos</h2><p><b>Definición de modelo activo:</b> un modelo cuenta como activo en un mes únicamente si tiene patentamientos &gt; 0 en la Pivot de ese mes. El histórico se reconstruye mes a mes, no desde una lista estática.</p></div>${badge(s.status,s.tone)}</div>
      <section class="kpis v38-kpis">
        ${kpi('IMPORTS ALINEADOS',fmt(s.imports),`corte ${DATA?.imports?.cutoff||'—'}`,COLORS.blue,'SUPPLY')}
        ${kpi('MERCADO MISMO PERÍODO',fmt(s.regs),'mismos meses que imports',COLORS.actual,'REGISTRATIONS')}
        ${kpi('IMPORT / MARKET',s.ratio===null?'—':`${(s.ratio*100).toFixed(1)}%`,s.gap>=0?`flow +${fmt(s.gap)}`:`flow ${fmt(s.gap)}`,s.ratio!==null&&s.ratio<1?COLORS.amber:COLORS.green,'FLOW PROXY')}
        ${kpi('MODELOS ACTIVOS',latest?String(latest.total):'—',latest?`${v38labelPeriod(latest.period)} · ${delta>=0?'+':''}${delta} vs inicio ventana`:'Pivot pendiente',COLORS.red,'PIVOT MONTHLY')}
        ${kpi('VENTANA LINEUP',active.length?String(active.length):'—',range,COLORS.blue,'MONTHS')}
      </section>
      <div class="grid two v38-grid2">
        ${card('Importaciones vs mercado','Columnas mensuales + ratio Imports / Patentamientos. Supply y demanda permanecen separados.',v38importsMarketSvg(s.rows),'SUPPLY VS DEMAND')}
        ${card('Line up activo · Segmento 1','Cantidad de modelos que efectivamente patentaron en cada mes, segmentados en CUB / LMC / SC / FUN / ATV / Others.',v39stackedActiveSvg(active,'s1',8),'ACTIVE MODELS · SEGMENT 1')}
      </div>
      <div class="grid two v38-grid2">
        ${card('Line up activo · Segmento 2','Misma definición, pero con la apertura de producto de la Pivot: On-Off / Business / Scooter / Sport / Fun +300, etc.',v39stackedActiveSvg(active,'s2',10),'ACTIVE MODELS · SEGMENT 2')}
        ${card('Cambio de line up · Segmento 1',`Cuántos modelos activos hay hoy versus ${active.length>=13?'12 meses atrás':'el inicio de la ventana disponible'}.`,v39segmentDeltaTable('s1','Segmento 1'),'LINEUP CHANGE')}
      </div>
      ${card('Cambio de line up · Segmento 2','Permite ver rápidamente, por ejemplo, cuántos On-Off o Business adicionales entraron al mercado.',v39segmentDeltaTable('s2','Segmento 2'),'PRODUCT LINEUP CHANGE')}
      ${card('Primeras apariciones en patentamientos','Modelos cuyo primer mes con patentamiento positivo aparece dentro de los últimos 12 meses disponibles de la Pivot.',v39newlyActiveTable(),'FIRST REGISTRATION IN PIVOT')}
      ${card('Nuevos modelos detectados en importaciones','Cruce de señales de imports con Segmento 1 / Segmento 2 y primer patentamiento visible en la Pivot.',v39importTable(),'IMPORT → REGISTRATION RADAR')}
      <div class="note"><b>Lectura correcta:</b> “activo” no significa homologado, importado o listado comercialmente: significa que tuvo al menos 1 patentamiento en ese mes de la Pivot. Por eso ahora podemos medir si el mercado tiene más LMC, más On-Off, más scooters, etc., y desde qué mes empezó a cambiar la oferta efectiva.</div>
    </section>`;
  };
}

(function v39boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof v38supplyBlock==='function'&&typeof V23_SEGMENTS!=='undefined'){try{render()}catch(e){console.error('v39 lineup history render',e)}}else setTimeout(ready,120)};ready()})();
