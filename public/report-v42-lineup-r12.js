/* 2W Market Analysis v42 — active lineup breadth: R12 vs current month, segmented */
const V42_VERSION='20261008-lineup-r12-v1';

function v42num(v){const n=Number(v);return Number.isFinite(n)?n:0}
function v42esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}

function v42rollingUniverse(endIndex=null,window=12){
  const hist=(typeof V13_MODEL_HISTORY!=='undefined'&&Array.isArray(V13_MODEL_HISTORY))?V13_MODEL_HISTORY:[];
  if(!hist.length)return {period:'—',start:'—',total:0,honda:0,s1:{},s2:{},s1Honda:{},s2Honda:{},names:[]};
  const end=endIndex==null?hist.length-1:Math.max(0,Math.min(hist.length-1,endIndex));
  const start=Math.max(0,end-window+1),slice=hist.slice(start,end+1);
  const names=[...new Set(slice.flatMap(r=>Object.keys(r||{}).filter(k=>!['period','total','value'].includes(k))))];
  const active=names.filter(name=>slice.some(r=>v42num(r?.[name])>0));
  const s1={},s2={},s1Honda={},s2Honda={};let honda=0;
  active.forEach(name=>{
    const seg=typeof v41seg==='function'?v41seg(name):{segment1:'OTHERS',segment2:'SIN CLASIFICAR'};
    const a=seg.segment1||'OTHERS',b=seg.segment2||'SIN CLASIFICAR';
    const brand=typeof v41brand==='function'?v41brand(name):String(name).split(' ')[0];
    const isHonda=String(brand).toUpperCase()==='HONDA';
    s1[a]=(s1[a]||0)+1;s2[b]=(s2[b]||0)+1;
    if(isHonda){honda++;s1Honda[a]=(s1Honda[a]||0)+1;s2Honda[b]=(s2Honda[b]||0)+1}
  });
  return {period:hist[end]?.period||'—',start:hist[start]?.period||'—',total:active.length,honda,s1,s2,s1Honda,s2Honda,names:active};
}

function v42segmentBreadthRows(key){
  const cur=v42rollingUniverse(),prev=v42rollingUniverse((typeof V13_MODEL_HISTORY!=='undefined'?V13_MODEL_HISTORY.length:1)-2,12);
  const monthly=typeof v41monthlyActive==='function'?v41monthlyActive():[],m=monthly.at(-1)||{};
  const hKey=key==='s1'?'s1Honda':'s2Honda';
  const keys=[...new Set([...Object.keys(cur[key]||{}),...Object.keys(prev[key]||{}),...Object.keys(m[key]||{})])];
  return keys.map(name=>({
    name,
    r12:v42num(cur[key]?.[name]),
    prev:v42num(prev[key]?.[name]),
    delta:v42num(cur[key]?.[name])-v42num(prev[key]?.[name]),
    month:v42num(m[key]?.[name]),
    honda:v42num(cur[hKey]?.[name])
  })).sort((a,b)=>b.r12-a.r12);
}

function v42breadthTable(key,title){
  const rows=v42segmentBreadthRows(key);if(!rows.length)return '<div class="empty">Sin datos de lineup R12.</div>';
  const cur=v42rollingUniverse(),monthly=(typeof v41monthlyActive==='function'?v41monthlyActive():[]).at(-1)||{};
  return `<div class="table-wrap"><table class="table"><thead><tr><th>${v42esc(title)}</th><th>Activos R12</th><th>R12 previo</th><th>Δ</th><th>Activos ${v42esc(monthly.period||'mes')}</th><th>Honda R12</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${v42esc(r.name)}</b></td><td>${r.r12}</td><td>${r.prev}</td><td class="${r.delta>0?'green-txt':r.delta<0?'red-txt':''}">${r.delta>0?'+':''}${r.delta}</td><td>${r.month}</td><td>${r.honda}</td></tr>`).join('')}</tbody></table></div><div class="note"><b>R12 activo:</b> tuvo al menos 1 patentamiento en algún mes entre ${v42esc(cur.start)} y ${v42esc(cur.period)}. <b>Activo mensual:</b> tuvo al menos 1 patentamiento en el último mes.</div>`;
}

function v42breadthSvg(key){
  const rows=v42segmentBreadthRows(key).slice(0,10);if(!rows.length)return '<div class="empty">Sin datos.</div>';
  const W=1080,H=420,L=170,R=50,T=34,B=28,PW=W-L-R,barH=Math.min(26,(H-T-B)/Math.max(rows.length,1)*.55),max=Math.max(...rows.map(r=>r.r12),1);
  const y=i=>T+i*(H-T-B)/rows.length+(H-T-B)/rows.length/2;
  const x=v=>L+(v/max)*PW;
  const grid=[0,.25,.5,.75,1].map(p=>`<line x1="${x(max*p)}" x2="${x(max*p)}" y1="${T-8}" y2="${H-B}" stroke="rgba(90,100,115,.14)"/><text x="${x(max*p)}" y="${H-7}" text-anchor="middle" font-size="10" fill="#69717e">${Math.round(max*p)}</text>`).join('');
  const bars=rows.map((r,i)=>{const yy=y(i),w=Math.max(2,x(r.r12)-L),wm=Math.max(1,x(r.month)-L);return `<text x="${L-12}" y="${yy+4}" text-anchor="end" font-size="11" fill="#4e5662">${v42esc(r.name)}</text><rect x="${L}" y="${yy-barH/2}" width="${w}" height="${barH}" rx="4" fill="rgba(79,127,218,.26)"/><rect x="${L}" y="${yy-barH/2}" width="${wm}" height="${barH}" rx="4" fill="#4f7fda"><title>${v42esc(r.name)} · mes ${r.month} / R12 ${r.r12}</title></rect><text x="${Math.min(W-R-4,x(r.r12)+8)}" y="${yy+4}" font-size="11" font-weight="700" fill="#49515d">R12 ${r.r12}</text>`}).join('');
  return `<div style="overflow-x:auto"><svg viewBox="0 0 ${W} ${H}" style="width:100%;min-width:820px;height:auto" role="img" aria-label="Lineup activo R12 versus activo mensual por segmento">${grid}${bars}<g transform="translate(${L},12)"><rect width="12" height="8" rx="2" fill="#4f7fda"/><text x="18" y="8" font-size="10.5" fill="#4e5662">Activo último mes</text><rect x="145" width="12" height="8" rx="2" fill="rgba(79,127,218,.26)"/><text x="163" y="8" font-size="10.5" fill="#4e5662">Activo en R12</text></g></svg></div>`;
}

function v42earlyImportCount(){
  try{return (typeof v38newImportRows==='function'?v38newImportRows():[]).filter(r=>!r.firstReg).length}catch{return 0}
}

const V42_BASE_SUPPLY=typeof v38supplyBlock==='function'?v38supplyBlock:null;
if(V42_BASE_SUPPLY){
  v38supplyBlock=function(){
    const s=v38supplyStats(),active=typeof v41monthlyActive==='function'?v41monthlyActive():[],month=active.at(-1)||null,r12=v42rollingUniverse(),prevR12=v42rollingUniverse((typeof V13_MODEL_HISTORY!=='undefined'?V13_MODEL_HISTORY.length:1)-2,12),early=v42earlyImportCount();
    const r12Delta=r12.total-prevR12.total;
    return `<section class="card v38-supply"><div class="card-head"><div><span class="eyebrow">SUPPLY INTELLIGENCE · IMPORTS / MARKET / LINEUP BREADTH</span><h2>Oferta, amplitud competitiva y entrada de modelos</h2><p>Separamos tres conceptos: <b>lineup activo R12</b> (amplitud real del mercado), <b>activo mensual</b> (modelos que efectivamente patentaron en el último mes) y <b>early signals de importación</b> (modelos detectados antes de aparecer en patentamientos).</p></div>${badge(s.status,s.tone)}</div>
      <section class="kpis v38-kpis">
        ${kpi('LINEUP ACTIVO R12',String(r12.total),`${r12.start} → ${r12.period} · ${r12Delta>=0?'+':''}${r12Delta} vs R12 previo`,COLORS.red,'PIVOT R12')}
        ${kpi('ACTIVOS ÚLTIMO MES',month?String(month.total):'—',month?month.period:'Pivot pendiente',COLORS.blue,'MONTHLY ACTIVE')}
        ${kpi('HONDA ACTIVOS R12',String(r12.honda),r12.total?`${(r12.honda/r12.total*100).toFixed(1)}% del lineup R12`:'—',COLORS.actual,'HONDA BREADTH')}
        ${kpi('EARLY IMPORT SIGNALS',String(early),'detectados en imports sin patentamiento visible',COLORS.amber,'PIPELINE')}
        ${kpi('IMPORT / MARKET',s.ratio===null?'—':`${(s.ratio*100).toFixed(1)}%`,s.gap>=0?`flow +${fmt(s.gap)}`:`flow ${fmt(s.gap)}`,s.ratio!==null&&s.ratio<1?COLORS.amber:COLORS.green,'FLOW PROXY')}
      </section>
      <div class="grid two v38-grid2">
        ${card('Importaciones vs mercado','Columnas mensuales + ratio Imports / Patentamientos. Supply y demanda permanecen separados.',v38importsMarketSvg(s.rows),'SUPPLY VS DEMAND')}
        ${card('Lineup · Segmento 1','Barra sólida = modelos activos en el último mes. Fondo = modelos con al menos un patentamiento en R12.',v42breadthSvg('s1'),'MONTH vs R12')}
      </div>
      <div class="grid two v38-grid2">
        ${card('Lineup R12 · Segmento 1','Permite ver cuántos CUB, LMC, SC, FUN, ATV, etc. compiten realmente en la ventana anual, aunque no patenten todos los meses.',v42breadthTable('s1','Segmento 1'),'COMPETITIVE BREADTH')}
        ${card('Lineup R12 · Segmento 2','Apertura de producto: On-Off, Business, Scooter, Sport, Fun +300, etc.',v42breadthTable('s2','Segmento 2'),'PRODUCT BREADTH')}
      </div>
      <div class="grid two v38-grid2">
        ${card('Evolución mensual · Segmento 1','Modelos con patentamientos > 0 en cada mes. Sirve para medir intensidad efectiva de oferta.',typeof v41stackedActiveSvg==='function'?v41stackedActiveSvg(active,'s1',8):'','MONTHLY ACTIVE')}
        ${card('Evolución mensual · Segmento 2','Misma lectura con la taxonomía de producto de la Pivot.',typeof v41stackedActiveSvg==='function'?v41stackedActiveSvg(active,'s2',10):'','MONTHLY ACTIVE')}
      </div>
      ${card('Primeras apariciones en patentamientos','Modelos cuyo primer patentamiento positivo aparece dentro de la ventana disponible.',typeof v41newlyActiveTable==='function'?v41newlyActiveTable():'','FIRST REGISTRATION')}
      ${card('Nuevos modelos detectados en importaciones','Tercera capa: producto que ya aparece en supply/imports aunque todavía no tenga patentamientos visibles.',typeof v41importTable==='function'?v41importTable():'','IMPORT → REGISTRATION RADAR')}
      <div class="note"><b>Interpretación:</b> el número grande de ~600 modelos corresponde mejor al <b>lineup activo R12</b>, no a los modelos que patentan todos los meses. Por eso ambos indicadores quedan visibles y segmentados. Así se puede detectar, por ejemplo, si crece la cantidad de LMC u On-Off disponibles aunque el volumen total del segmento todavía no cambie demasiado.</div>
    </section>`;
  };
}

(function v42boot(){
  const go=()=>{if(typeof DATA!=='undefined'&&DATA&&typeof V13_MODEL_HISTORY!=='undefined'&&V13_MODEL_HISTORY?.length){try{render()}catch(e){console.error('v42 lineup r12 render',e)}}else setTimeout(go,140)};go();
})();
