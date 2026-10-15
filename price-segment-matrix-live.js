(()=>{
const DATASET={"headers":{"CUB":{"v102":422200.0,"v103":572000.0,"ms102":0.167887,"ms103":0.186199},"SC":{"v102":27697.0,"v103":30300.0,"ms102":0.389031,"ms103":0.324788},"LMC ON":{"v102":118040.0,"v103":152100.0,"ms102":0.198424,"ms103":0.184765},"LMC ON-OFF":{"v102":104335.0,"v103":122900.0,"ms102":0.264005,"ms103":0.230929},"FUN MID":{"v102":22648.0,"v103":25000.0,"ms102":0.049585,"ms103":0.097661},"FUN HIGH":{"v102":21187.0,"v103":26900.0,"ms102":0.049889,"ms103":0.202788}},"cells":{"CUB":{"HIGH":{"v102":0.0,"v103":0.0,"ms102":0,"ms103":0,"g102":{},"g103":{}},"MID":{"v102":70882.0,"v103":106505.8,"ms102":1.0,"ms103":1.0,"g102":{"HONDA":1.0},"g103":{"HONDA":1.0}},"LOW":{"v102":351318.0,"v103":465494.2,"ms102":0.0,"ms103":0.0,"g102":{"IRAOLA":0.356277,"GILERA":0.183714,"LA EMILIA":0.165722,"KELLER":0.156818,"YAMAHA":0.000205,"MAGNY":0.026902,"NEWSAN":0.045284,"OTROS":0.065078},"g103":{"IRAOLA":0.344832,"GILERA":0.175452,"LA EMILIA":0.151347,"KELLER":0.188115,"YAMAHA":0.0001,"MAGNY":0.037228,"NEWSAN":0.041848,"OTROS":0.061078}}},"SC":{"HIGH":{"v102":11079.0,"v103":13429.0,"ms102":0.045943,"ms103":0.035471,"g102":{"HONDA":0.045943,"IRAOLA":0.236032,"GILERA":0.088456,"SIMPA":0.157054,"YAMAHA":0.285133,"BETA":0.187382},"g103":{"HONDA":0.035471,"IRAOLA":0.203008,"GILERA":0.081231,"SIMPA":0.101853,"YAMAHA":0.350172,"BETA":0.228265}},"MID":{"v102":15154.0,"v103":15182.7,"ms102":0.677445,"ms103":0.616805,"g102":{"HONDA":0.677445,"IRAOLA":0.061634,"LA EMILIA":0.071994,"KELLER":0.017553,"YAMAHA":0.040385,"MAGNY":0.020985,"NEWSAN":0.003893,"OTROS":0.106111},"g103":{"HONDA":0.616805,"IRAOLA":0.019168,"LA EMILIA":0.079524,"KELLER":0.090171,"YAMAHA":0.037447,"MAGNY":0.014683,"NEWSAN":0.00159,"OTROS":0.140612}},"LOW":{"v102":1464.0,"v103":1688.3,"ms102":0.0,"ms103":0.0,"g102":{"IRAOLA":1.0},"g103":{"IRAOLA":1.0}}},"LMC ON":{"HIGH":{"v102":21199.0,"v103":24755.5,"ms102":0.18449,"ms103":0.16008,"g102":{"HONDA":0.18449,"IRAOLA":0.432237,"LA EMILIA":0.070617,"SIMPA":0.041889,"YAMAHA":0.270767},"g103":{"HONDA":0.16008,"IRAOLA":0.409166,"LA EMILIA":0.045817,"SIMPA":0.031724,"YAMAHA":0.353213}},"MID":{"v102":46161.0,"v103":66050.9,"ms102":0.422673,"ms103":0.365475,"g102":{"HONDA":0.422673,"IRAOLA":0.331557,"GILERA":0.067113,"LA EMILIA":0.008319,"YAMAHA":4.3e-05,"BETA":0.006607,"NEWSAN":0.091224,"OTROS":0.072464},"g103":{"HONDA":0.365474,"IRAOLA":0.321587,"GILERA":0.099015,"LA EMILIA":0.00141,"YAMAHA":1.4e-05,"BETA":0.009625,"NEWSAN":0.050805,"OTROS":0.15207}},"LOW":{"v102":50680.0,"v103":61293.6,"ms102":0.0,"ms103":0.0,"g102":{"IRAOLA":0.268627,"GILERA":0.126914,"LA EMILIA":0.472869,"KELLER":0.072435,"MAGNY":0.059155},"g103":{"IRAOLA":0.380601,"GILERA":0.104138,"LA EMILIA":0.387898,"KELLER":0.068941,"MAGNY":0.058422}}},"LMC ON-OFF":{"HIGH":{"v102":36518.0,"v103":39588.5,"ms102":0.754286,"ms103":0.716904,"g102":{"HONDA":0.754285,"GILERA":0.075004,"LA EMILIA":0.012049,"YAMAHA":0.122926,"OTROS":0.035736},"g103":{"HONDA":0.716904,"GILERA":0.064672,"LA EMILIA":0.005213,"YAMAHA":0.155162,"OTROS":0.058049}},"MID":{"v102":28767.0,"v103":40385.3,"ms102":0.0,"ms103":0.0,"g102":{"IRAOLA":0.543055,"GILERA":0.214551,"LA EMILIA":0.024194,"KELLER":0.144123,"SIMPA":0.001981,"BETA":0.008204,"MAGNY":0.0365,"OTROS":0.027392},"g103":{"IRAOLA":0.422576,"GILERA":0.248516,"LA EMILIA":0.018857,"KELLER":0.212213,"SIMPA":0.000319,"BETA":0.003127,"MAGNY":0.070342,"OTROS":0.02405}},"LOW":{"v102":39050.0,"v103":42926.1,"ms102":0.0,"ms103":0.0,"g102":{"IRAOLA":0.305864,"GILERA":0.199744,"LA EMILIA":0.346172,"NEWSAN":0.14822},"g103":{"IRAOLA":0.359709,"GILERA":0.199411,"LA EMILIA":0.332678,"NEWSAN":0.108202}}},"FUN MID":{"HIGH":{"v102":0.0,"v103":0.0,"ms102":0,"ms103":0,"g102":{},"g103":{}},"MID":{"v102":626.0,"v103":1309.9,"ms102":1.0,"ms103":1.0,"g102":{"HONDA":1.0},"g103":{"HONDA":1.0}},"LOW":{"v102":22022.0,"v103":23690.1,"ms102":0.022568,"ms103":0.047766,"g102":{"HONDA":0.022568,"IRAOLA":0.398784,"GILERA":0.049632,"LA EMILIA":0.089274,"SIMPA":0.30574,"YAMAHA":0.070566,"BETA":0.041004,"MAGNY":0.002043,"NEWSAN":0.002906,"OTROS":0.017483},"g103":{"HONDA":0.04777,"IRAOLA":0.562314,"GILERA":0.029224,"LA EMILIA":0.047577,"SIMPA":0.187986,"YAMAHA":0.058414,"BETA":0.034367,"MAGNY":0.015324,"NEWSAN":0.005999,"OTROS":0.011025}}},"FUN HIGH":{"HIGH":{"v102":3677.0,"v103":3901.4,"ms102":0.022573,"ms103":0.637278,"g102":{"HONDA":0.022573,"IRAOLA":0.433234,"LA EMILIA":0.010063,"SIMPA":0.019581,"OTROS":0.514549},"g103":{"HONDA":0.637278,"IRAOLA":0.195905,"LA EMILIA":0.004095,"SIMPA":0.005315,"OTROS":0.157407}},"MID":{"v102":10124.0,"v103":12352.2,"ms102":0.096207,"ms103":0.240341,"g102":{"HONDA":0.096207,"IRAOLA":0.188759,"GILERA":0.093639,"LA EMILIA":0.131569,"SIMPA":0.356973,"YAMAHA":0.046523,"BETA":0.08633},"g103":{"HONDA":0.240341,"IRAOLA":0.059626,"GILERA":0.044163,"LA EMILIA":0.021448,"SIMPA":0.110375,"YAMAHA":0.063272,"BETA":0.454969,"MAGNY":0.005806}},"LOW":{"v102":7386.0,"v103":10646.4,"ms102":0.0,"ms103":0.0,"g102":{"IRAOLA":0.066477,"GILERA":0.471568,"LA EMILIA":0.193339,"SIMPA":0.204982,"MAGNY":0.054969,"OTROS":0.008665},"g103":{"IRAOLA":0.016932,"GILERA":0.132926,"LA EMILIA":0.058153,"SIMPA":0.110202,"MAGNY":0.671854,"OTROS":0.009933}}}}};
const MARKET_102=718916, MARKET_103=930965;
const SEGMENTS_LOCAL=['CUB','SC','LMC ON','LMC ON-OFF'];
const SEGMENTS_FAN=['FUN MID','FUN HIGH'];
const BUCKETS=['HIGH','MID','LOW'];
const PRICE_LABELS={
  local:{HIGH:'> ARS 5,0 M',MID:'ARS 3,0–5,0 M',LOW:'< ARS 3,0 M'},
  fan:{HIGH:'> USD 20k',MID:'USD 10k–20k',LOW:'< USD 10k'}
};
const GROUP_COLORS={
  HONDA:'#e40521',IRAOLA:'#1677ff',GILERA:'#00a06b','LA EMILIA':'#ff9f1c',KELLER:'#7c3aed',
  SIMPA:'#2ea44f',YAMAHA:'#1f5fae',BETA:'#c026d3',MAGNY:'#0f766e',NEWSAN:'#b45309',OTROS:'#9ca3af'
};
const GROUP_LABELS={HONDA:'Honda',IRAOLA:'Iraola',GILERA:'Gilera','LA EMILIA':'La Emilia',KELLER:'Keller',SIMPA:'Simpa',YAMAHA:'Yamaha',BETA:'Beta',MAGNY:'Magny',NEWSAN:'Newsan',OTROS:'Otros'};
const SEG_LABELS={'CUB':'CUB','SC':'SC','LMC ON':'LMC ON','LMC ON-OFF':'LMC ON-OFF','FUN MID':'FUN MID','FUN HIGH':'FUN HIGH'};
const SEG_SUB={'FUN MID':'301–500 cc','FUN HIGH':'501+ cc'};
const pct=n=>`${(100*(Number(n)||0)).toFixed(1)}%`;
const k=n=>{n=Number(n)||0;return n>=1000?`${(n/1000).toFixed(n>=100000?1:1)}k`:n.toFixed(0)};
const safe=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const topGroup=shares=>{const e=Object.entries(shares||{});if(!e.length)return null;return e.sort((a,b)=>b[1]-a[1])[0]};

function css(){
  if(document.getElementById('priceMatrixLiveStyle'))return;
  const s=document.createElement('style');s.id='priceMatrixLiveStyle';s.textContent=`
  .pmx{margin:34px 0 12px;border:1px solid #dfe4ea;border-radius:24px;background:#fff;box-shadow:0 18px 55px rgba(15,23,42,.08);overflow:hidden}
  .pmx-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-end;padding:24px 26px 18px;border-bottom:1px solid #e8ebef;background:linear-gradient(180deg,#fff,#fbfcfd)}
  .pmx-head h3{margin:0;font-size:26px;letter-spacing:-.03em;color:#101827} .pmx-head p{margin:5px 0 0;color:#657184;font-size:13px;max-width:840px}
  .pmx-toggle{display:flex;gap:7px;background:#f1f3f6;border:1px solid #e0e4e9;border-radius:12px;padding:4px;white-space:nowrap}
  .pmx-toggle button{border:0;background:transparent;padding:9px 13px;border-radius:9px;font-weight:800;color:#5d6675;cursor:pointer}
  .pmx-toggle button.active{background:#fff;color:#e40521;box-shadow:0 2px 8px rgba(15,23,42,.09)}
  .pmx-toolbar{display:flex;gap:8px;flex-wrap:wrap;padding:12px 26px;border-bottom:1px solid #edf0f3;background:#fafbfc}
  .pmx-chip{font-size:11px;font-weight:800;color:#546071;border:1px solid #dfe4ea;background:#fff;border-radius:999px;padding:6px 9px}
  .pmx-panels{display:grid;grid-template-columns:minmax(0,1.7fr) minmax(360px,.95fr);gap:14px;padding:14px;background:#f7f8fa}
  .pmx-panel{background:#fff;border:1px solid #dfe3e8;border-radius:18px;overflow:hidden}
  .pmx-panel-title{background:#e40521;color:#fff;text-align:center;font-size:17px;font-weight:900;letter-spacing:.03em;padding:10px}
  .pmx-grid{display:grid;grid-template-columns:122px repeat(var(--cols),minmax(0,1fr))}
  .pmx-cell{min-height:146px;border-right:1px solid #e2e6ea;border-bottom:1px solid #e2e6ea;padding:10px 9px;display:flex;flex-direction:column;align-items:center;justify-content:center;position:relative}
  .pmx-grid>.pmx-cell:nth-child(calc(var(--cols) + 1)n){border-right:0}
  .pmx-corner{justify-content:center;background:#fbfcfd;color:#263246;font-weight:900;font-size:16px;line-height:1.2}
  .pmx-seghead{min-height:132px;justify-content:flex-start;padding-top:12px;background:#fff}
  .pmx-seghead b{font-size:15px;color:#101827} .pmx-seghead small{color:#677285;font-size:10px;margin-top:1px}
  .pmx-segstats{margin-top:8px;width:100%;display:grid;gap:3px;text-align:center;font-size:10.5px;color:#5c6677}
  .pmx-segstats strong{color:#e40521;font-weight:900}
  .pmx-rowhead{align-items:flex-start;padding-left:14px;background:#fbfcfd} .pmx-rowhead b{font-size:18px;color:#101827} .pmx-rowhead span{font-size:11px;color:#566174;margin-top:4px}
  .pmx-chartwrap{height:82px;display:grid;place-items:center} .pmx-chartwrap svg{overflow:visible}
  .pmx-empty{height:82px;display:grid;place-items:center;color:#a0a7b1;font-weight:800;font-size:12px}
  .pmx-lines{width:100%;display:grid;gap:2px;text-align:center;font-size:10px;color:#39465a;line-height:1.25}
  .pmx-lines b{font-weight:900} .pmx-lines .red{color:#e40521} .pmx-lines .coral{color:#ff6f7d}
  .pmx-note{padding:11px 16px 14px;color:#6d7686;font-size:10px;line-height:1.45;border-top:1px solid #eef1f4;background:#fcfcfd}
  .pmx-legend{display:flex;gap:12px;align-items:center;flex-wrap:wrap;padding:13px 24px 18px;color:#536072;font-size:11px}
  .pmx-key{display:flex;align-items:center;gap:6px} .pmx-dot{width:10px;height:10px;border-radius:50%;display:inline-block}
  .pmx-ringkey{width:22px;height:22px;border-radius:50%;position:relative;border:5px solid #e40521;box-sizing:border-box} .pmx-ringkey.inner{border-color:#ff8b95}
  .pmx-summary{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin-left:auto}
  .pmx-summary strong{font-size:12px;color:#111827} .pmx-summary span{font-size:10px;color:#6b7280}
  @media(max-width:1100px){.pmx-panels{grid-template-columns:1fr} .pmx-grid{min-width:840px} .pmx-panel{overflow:auto}}
  @media(max-width:720px){.pmx-head{align-items:flex-start;flex-direction:column} .pmx-panels{padding:8px} .pmx-grid{min-width:760px} .pmx-toolbar{padding:10px 16px}}
  `;
  document.head.appendChild(s);
}

function ringSegments(shares,r,stroke,opacity=1){
  let off=0,out='';
  for(const [g,val] of Object.entries(shares||{})){
    const p=Math.max(0,Math.min(1,Number(val)||0)); if(!p)continue;
    const color=GROUP_COLORS[g]||GROUP_COLORS.OTROS;
    out+=`<circle cx="50" cy="50" r="${r}" fill="none" stroke="${color}" stroke-width="${stroke}" pathLength="100" stroke-dasharray="${(p*100).toFixed(4)} ${(100-p*100).toFixed(4)}" stroke-dashoffset="${(-off*100).toFixed(4)}" stroke-linecap="butt" opacity="${opacity}" transform="rotate(-90 50 50)"/>`;
    off+=p;
  }
  return out;
}
function hondaDonut(cell,size){
  if(!cell||(!cell.v102&&!cell.v103))return `<div class="pmx-empty">SIN VOLUMEN</div>`;
  const s=Math.round(size);
  const a102=Math.max(0,Math.min(1,cell.ms102||0)),a103=Math.max(0,Math.min(1,cell.ms103||0));
  return `<div class="pmx-chartwrap"><svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-label="Honda share 102KI ${pct(a102)} y 103KI ${pct(a103)}">
    <circle cx="50" cy="50" r="35" fill="none" stroke="#c2c7ce" stroke-width="10"/>
    <circle cx="50" cy="50" r="35" fill="none" stroke="#e40521" stroke-width="10" pathLength="100" stroke-dasharray="${(a103*100).toFixed(3)} ${(100-a103*100).toFixed(3)}" transform="rotate(-90 50 50)"/>
    <circle cx="50" cy="50" r="23" fill="none" stroke="#e1e4e8" stroke-width="9"/>
    <circle cx="50" cy="50" r="23" fill="none" stroke="#ff8b95" stroke-width="9" pathLength="100" stroke-dasharray="${(a102*100).toFixed(3)} ${(100-a102*100).toFixed(3)}" transform="rotate(-90 50 50)"/>
  </svg></div>`;
}
function groupDonut(cell,size){
  if(!cell||(!cell.v102&&!cell.v103))return `<div class="pmx-empty">SIN VOLUMEN</div>`;
  const s=Math.round(size);
  return `<div class="pmx-chartwrap"><svg width="${s}" height="${s}" viewBox="0 0 100 100" aria-label="Group participation 102KI y 103KI">
    <circle cx="50" cy="50" r="35" fill="none" stroke="#eef0f3" stroke-width="10"/>
    ${ringSegments(cell.g103,35,10,1)}
    <circle cx="50" cy="50" r="23" fill="none" stroke="#f0f2f5" stroke-width="9"/>
    ${ringSegments(cell.g102,23,9,.55)}
  </svg></div>`;
}
function cellLines(cell,mode){
  if(!cell||(!cell.v102&&!cell.v103))return `<div class="pmx-lines"><span>102KI — · 103KI —</span><span>Sin volumen en este rango</span></div>`;
  if(mode==='groups'){
    const t102=topGroup(cell.g102),t103=topGroup(cell.g103);
    return `<div class="pmx-lines"><span>Vol. <span class="coral">102KI</span> <b>${k(cell.v102)}</b> · <span class="red">103KI</span> <b>${k(cell.v103)}</b></span><span>#1 102: <b>${t102?safe(GROUP_LABELS[t102[0]]||t102[0]):'—'} ${t102?pct(t102[1]):''}</b> · #1 103: <b>${t103?safe(GROUP_LABELS[t103[0]]||t103[0]):'—'} ${t103?pct(t103[1]):''}</b></span></div>`;
  }
  return `<div class="pmx-lines"><span>Vol. <span class="coral">102KI</span> <b>${k(cell.v102)}</b> · <span class="red">103KI</span> <b>${k(cell.v103)}</b></span><span>MS Honda <b class="coral">${pct(cell.ms102)}</b> → <b class="red">${pct(cell.ms103)}</b></span></div>`;
}
function segmentHeader(seg){
  const h=DATASET.headers[seg],tot102=MARKET_102,tot103=MARKET_103;
  return `<div class="pmx-cell pmx-seghead"><b>${safe(SEG_LABELS[seg]||seg)}</b>${SEG_SUB[seg]?`<small>${SEG_SUB[seg]}</small>`:''}<div class="pmx-segstats"><span>Segment market <strong>${k(h.v102)} → ${k(h.v103)}</strong></span><span>Share mercado <strong>${pct(h.v102/tot102)} → ${pct(h.v103/tot103)}</strong></span><span>MS Honda <strong>${pct(h.ms102)} → ${pct(h.ms103)}</strong></span></div></div>`;
}
function panel(type,segs,mode){
  const isFan=type==='fan',max=Math.max(...segs.flatMap(seg=>BUCKETS.map(b=>Math.max(DATASET.cells[seg][b].v102||0,DATASET.cells[seg][b].v103||0))));
  let html=`<section class="pmx-panel"><div class="pmx-panel-title">${isFan?'FUN SEGMENTS (USD)':'LOCAL SEGMENTS (ARS)'}</div><div class="pmx-grid" style="--cols:${segs.length}">`;
  html+=`<div class="pmx-cell pmx-corner">Precio<br>${isFan?'(USD)':'(ARS)'}</div>${segs.map(segmentHeader).join('')}`;
  for(const b of BUCKETS){
    html+=`<div class="pmx-cell pmx-rowhead"><b>${b}</b><span>${safe(PRICE_LABELS[type][b])}</span></div>`;
    for(const seg of segs){
      const cell=DATASET.cells[seg][b],v=Math.max(cell.v102||0,cell.v103||0);
      const size=v?44+64*Math.sqrt(v/max):44;
      html+=`<div class="pmx-cell">${mode==='groups'?groupDonut(cell,size):hondaDonut(cell,size)}${cellLines(cell,mode)}</div>`;
    }
  }
  html+=`</div><div class="pmx-note">${isFan?'FUN MID = 301–500 cc · FUN HIGH = 501+ cc · precios en USD.':'Escala común local: Low < ARS 3,0 M · Mid ARS 3,0–5,0 M · High > ARS 5,0 M.'}</div></section>`;
  return html;
}
function legend(mode){
  if(mode==='groups'){
    const groups=['HONDA','IRAOLA','GILERA','LA EMILIA','KELLER','SIMPA','YAMAHA','BETA','MAGNY','NEWSAN','OTROS'];
    return `<div class="pmx-legend"><span class="pmx-key"><i class="pmx-ringkey inner"></i>Inner ring = 102KI</span><span class="pmx-key"><i class="pmx-ringkey"></i>Outer ring = 103KI</span>${groups.map(g=>`<span class="pmx-key"><i class="pmx-dot" style="background:${GROUP_COLORS[g]}"></i>${GROUP_LABELS[g]}</span>`).join('')}<span class="pmx-summary"><strong>Donut size = market volume</strong><span>relative within each table</span></span></div>`;
  }
  return `<div class="pmx-legend"><span class="pmx-key"><i class="pmx-ringkey inner"></i>Inner = 102KI</span><span class="pmx-key"><i class="pmx-ringkey"></i>Outer = 103KI</span><span class="pmx-key"><i class="pmx-dot" style="background:#e40521"></i>Honda</span><span class="pmx-key"><i class="pmx-dot" style="background:#c2c7ce"></i>Competition</span><span class="pmx-summary"><strong>Donut size = market volume</strong><span>relative within each table</span></span></div>`;
}
function render(root){
  const mode=root.dataset.mode||'honda';
  root.innerHTML=`<div class="pmx-head"><div><h3>PRICE × SEGMENT MATRIX · LIVE</h3><p>Dos lecturas sobre la misma base: Honda market share y participación por grupos. Volúmenes recalculados con segmentación Pivot y forecast 103KI.</p></div><div class="pmx-toggle"><button data-mode="honda" class="${mode==='honda'?'active':''}">Honda MS</button><button data-mode="groups" class="${mode==='groups'?'active':''}">Groups</button></div></div>
  <div class="pmx-toolbar"><span class="pmx-chip">102KI actual · 718.916</span><span class="pmx-chip">103KI matrix · 930.965 market</span><span class="pmx-chip">Honda plan · 181.500</span><span class="pmx-chip">Local: ARS 3M / 5M</span><span class="pmx-chip">FUN: USD 10k / 20k</span></div>
  <div class="pmx-panels">${panel('local',SEGMENTS_LOCAL,mode)}${panel('fan',SEGMENTS_FAN,mode)}</div>
  ${legend(mode)}
  <div class="pmx-note">Gobierno: Pivot MTP 25-2 Guide v2 para segmentación; FUN MID 301–500 cc y FUN HIGH 501+ cc. Modelos sin precio se asignan por comparable marca/grupo; Honda premium: Transalp/NC/Hornet en Mid, Africa Twin/CBR en High. La matriz cubre los seis segmentos mostrados; ATV/OFF/Others quedan fuera.</div>`;
  root.querySelectorAll('[data-mode]').forEach(b=>b.addEventListener('click',()=>{root.dataset.mode=b.dataset.mode;render(root)}));
}
function mount(){
  css();
  const planning=document.getElementById('planning'); if(!planning)return false;
  let root=planning.querySelector(':scope > .pmx');
  if(!root){root=document.createElement('section');root.className='pmx';root.dataset.mode='honda';planning.appendChild(root)}
  render(root); return true;
}
let timer=null;
function schedule(){clearTimeout(timer);timer=setTimeout(mount,40)}
function start(){
  mount();
  const content=document.getElementById('content'); if(content)new MutationObserver(schedule).observe(content,{childList:true,subtree:true});
  document.addEventListener('change',e=>{if(e.target?.id==='scenarioFilter'||e.target?.id==='calendarFilter')schedule()});
  window.addEventListener('2w:index-rebuilt',schedule);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
