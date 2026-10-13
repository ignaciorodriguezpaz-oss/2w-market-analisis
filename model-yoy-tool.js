/* 2W Market Analysis · YoY Model Comparison tool */
(()=>{
  'use strict';
  const VERSION='20261013-model-yoy-v1';
  const PALETTE=['#d81f32','#2f6fba','#2f8f68','#b47b22','#7758b6','#2d8e9d','#9c5667','#627184'];
  const MONTHS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  let DB=null, booting=false;

  const n=v=>{const x=Number(v);return Number.isFinite(x)?x:0};
  const fmt=v=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(n(v));
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,' ').trim();

  function canonical(raw){
    const s=norm(raw), rules=[
      [/^HONDA WAVE 110S/,'HONDA WAVE 110'],[/^GILERA SMASH/,'GILERA SMASH 110'],[/^KELLER KN110 8/,'KELLER CRONO 110'],
      [/^MOTOMEL B110/,'MOTOMEL BLITZ 110'],[/^MONDIAL LD 110/,'MONDIAL LD 110'],[/^ZANELLA ZB 110/,'ZANELLA ZB 110'],
      [/^MOTOMEL S2 150/,'MOTOMEL S 150'],[/^HONDA GLH 150/,'HONDA GLH150'],[/^IKA IKA P110/,'IKA P110'],
      [/^HONDA XR150L/,'HONDA XR 150'],[/^HONDA XR300L TORNADO/,'HONDA XR 300L'],[/^HONDA XR190L/,'HONDA XR 190'],
      [/^HONDA CB300F TWISTER/,'HONDA CB 300F'],[/^YAMAHA FZ S FI/,'YAMAHA FZ FI'],[/^YAMAHA MT03 ABS/,'YAMAHA MT 03'],
      [/^BAJAJ ROUSER NS 160/,'BAJAJ ROUSER 160'],[/^BAJAJ ROUSER NS 400 Z/,'BAJAJ ROUSER 400'],[/^BAJAJ DOMINAR D400/,'BAJAJ DOMINAR 400']
    ];
    for(const [re,name] of rules) if(re.test(s)) return name;
    return String(raw||'').trim().replace(/\s+/g,' ');
  }

  async function ungzipB64(text){
    if(!text) throw new Error('Pivot payload no disponible');
    if(!('DecompressionStream' in window)) throw new Error('El navegador no soporta descompresión gzip');
    const bytes=Uint8Array.from(atob(text),c=>c.charCodeAt(0));
    const stream=new Blob([bytes]).stream().pipeThrough(new DecompressionStream('gzip'));
    return JSON.parse(await new Response(stream).text());
  }

  function build(pivot){
    const periods=(pivot?.periods||[]).map(String), index=new Map(periods.map((p,i)=>[p,i])), models=new Map();
    for(const row of pivot?.models||[]){
      const name=canonical(row?.name), vals=(row?.values||[]).map(n);
      if(!models.has(name)) models.set(name,new Array(periods.length).fill(0));
      const out=models.get(name); vals.forEach((v,i)=>{if(i<out.length)out[i]+=v});
    }
    const catalog=[...models.entries()].map(([name,values])=>({name,values,total:values.reduce((a,b)=>a+b,0)})).sort((a,b)=>b.total-a.total||a.name.localeCompare(b.name,'es'));
    const years=[...new Set(periods.map(p=>Number(p.slice(0,4))).filter(Number.isFinite))].sort((a,b)=>a-b);
    DB={periods,index,models,catalog,years,source:pivot?.source||'Pivot/AUTOMATIC',cutoff:pivot?.cutoff||periods.at(-1)||'—'};
  }

  function ensureStyles(){
    if(document.getElementById('modelYoyToolCss'))return;
    const l=document.createElement('link');l.id='modelYoyToolCss';l.rel='stylesheet';l.href=`/model-yoy-tool.css?v=${VERSION}`;document.head.appendChild(l);
  }

  function ensureButton(){
    const host=document.querySelector('.top-actions');if(!host||document.getElementById('modelYoyToolsBtn'))return;
    const b=document.createElement('button');b.id='modelYoyToolsBtn';b.type='button';b.className='model-yoy-open';b.innerHTML='<span>⌁</span> Herramientas';
    b.addEventListener('click',open);
    const before=document.getElementById('quickReport');host.insertBefore(b,before||host.firstChild);
  }

  function saved(){
    try{return JSON.parse(localStorage.getItem('2w.modelYoyTool')||'{}')}catch{return {}}
  }
  function save(v){try{localStorage.setItem('2w.modelYoyTool',JSON.stringify(v))}catch{}}

  function defaults(){
    const s=saved(), names=DB.catalog.map(x=>x.name);
    const a=names.includes(s.a)?s.a:(names.includes('HONDA WAVE 110')?'HONDA WAVE 110':names[0]||'');
    const b=names.includes(s.b)&&s.b!==a?s.b:(names.includes('GILERA SMASH 110')?'GILERA SMASH 110':names.find(x=>x!==a)||'');
    let years=Array.isArray(s.years)?s.years.map(Number).filter(y=>DB.years.includes(y)):[];
    if(!years.length)years=DB.years.slice(-2);
    return {a,b,years};
  }

  function optionList(){return DB.catalog.map(m=>`<option value="${esc(m.name)}"></option>`).join('')}
  function yearChecks(sel){return DB.years.map(y=>`<label class="model-yoy-year ${sel.includes(y)?'active':''}"><input type="checkbox" value="${y}" ${sel.includes(y)?'checked':''}><span>${y}</span></label>`).join('')}

  function shell(){
    const d=defaults();
    return `<div class="model-yoy-backdrop" id="modelYoyBackdrop" aria-hidden="true">
      <section class="model-yoy-panel" role="dialog" aria-modal="true" aria-labelledby="modelYoyTitle">
        <header class="model-yoy-head">
          <div><span class="model-yoy-eyebrow">2W · HERRAMIENTAS DE ANÁLISIS</span><h2 id="modelYoyTitle">Comparador YoY de modelos</h2><p>Superponé los mismos meses de los años que elijas y compará dos modelos sobre una escala común.</p></div>
          <button class="model-yoy-close" id="modelYoyClose" aria-label="Cerrar">×</button>
        </header>
        <div class="model-yoy-controls">
          <label><span>MODELO A</span><input id="modelYoyA" list="modelYoyList" value="${esc(d.a)}" autocomplete="off"></label>
          <label><span>MODELO B</span><input id="modelYoyB" list="modelYoyList" value="${esc(d.b)}" autocomplete="off"></label>
          <datalist id="modelYoyList">${optionList()}</datalist>
          <div class="model-yoy-years"><span>AÑOS A COMPARAR</span><div id="modelYoyYearList">${yearChecks(d.years)}</div></div>
          <button id="modelYoyApply" class="model-yoy-apply">Actualizar gráfico</button>
        </div>
        <div class="model-yoy-meta"><span><b>Fuente</b> ${esc(DB.source)}</span><span><b>Corte</b> ${esc(DB.cutoff)}</span><span><b>Historia disponible</b> ${DB.years[0]||'—'}–${DB.years.at(-1)||'—'}</span></div>
        <div id="modelYoyError" class="model-yoy-error" hidden></div>
        <div id="modelYoyResult"></div>
      </section>
    </div>`;
  }

  function ensureShell(){
    if(document.getElementById('modelYoyBackdrop'))return;
    document.body.insertAdjacentHTML('beforeend',shell());
    document.getElementById('modelYoyClose')?.addEventListener('click',close);
    document.getElementById('modelYoyBackdrop')?.addEventListener('click',e=>{if(e.target.id==='modelYoyBackdrop')close()});
    document.getElementById('modelYoyApply')?.addEventListener('click',renderFromControls);
    document.getElementById('modelYoyYearList')?.addEventListener('change',e=>e.target.closest('.model-yoy-year')?.classList.toggle('active',e.target.checked));
  }

  function open(){
    ensureShell();const el=document.getElementById('modelYoyBackdrop');el.classList.add('open');el.setAttribute('aria-hidden','false');document.body.classList.add('model-yoy-lock');renderFromControls();
  }
  function close(){const el=document.getElementById('modelYoyBackdrop');el?.classList.remove('open');el?.setAttribute('aria-hidden','true');document.body.classList.remove('model-yoy-lock')}

  function exactModel(value){const q=norm(value);return DB.catalog.find(m=>norm(m.name)===q)?.name||null}
  function selectedYears(){return [...document.querySelectorAll('#modelYoyYearList input:checked')].map(x=>Number(x.value)).sort((a,b)=>a-b)}
  function value(model,year,month){const i=DB.index.get(`${year}-${String(month).padStart(2,'0')}`);return i==null?null:n(DB.models.get(model)?.[i])}
  function periodExists(year,month){return DB.index.has(`${year}-${String(month).padStart(2,'0')}`)}

  function linePath(vals,x,y){
    let d='',started=false;
    vals.forEach((v,i)=>{if(v==null){started=false;return}const xx=x(i),yy=y(v);d+=`${started?' L':'M'}${xx.toFixed(1)},${yy.toFixed(1)}`;started=true});
    return d;
  }

  function chart(a,b,years){
    const W=1120,H=480,L=70,R=24,T=52,B=64,iw=W-L-R,ih=H-T-B;
    const series=[];
    years.forEach((year,yi)=>{
      series.push({model:a,year,vals:MONTHS.map((_,i)=>periodExists(year,i+1)?value(a,year,i+1):null),color:PALETTE[yi%PALETTE.length],dash:''});
      series.push({model:b,year,vals:MONTHS.map((_,i)=>periodExists(year,i+1)?value(b,year,i+1):null),color:PALETTE[yi%PALETTE.length],dash:'9 7'});
    });
    const all=series.flatMap(s=>s.vals.filter(v=>v!=null)), rawMax=Math.max(1,...all), yMax=Math.ceil(rawMax*1.12/500)*500||rawMax;
    const x=i=>L+i*iw/11, y=v=>T+ih-(v/yMax)*ih;
    const grid=Array.from({length:5},(_,j)=>{const v=yMax*j/4,yy=y(v);return `<line x1="${L}" x2="${W-R}" y1="${yy}" y2="${yy}" class="my-grid"/><text x="${L-10}" y="${yy+4}" text-anchor="end" class="my-axis">${fmt(v)}</text>`}).join('');
    const ticks=MONTHS.map((m,i)=>`<text x="${x(i)}" y="${H-26}" text-anchor="middle" class="my-axis">${m}</text>`).join('');
    const paths=series.map(s=>{const d=linePath(s.vals,x,y);const dots=s.vals.map((v,i)=>v==null?'':`<circle cx="${x(i)}" cy="${y(v)}" r="3" fill="${s.color}"><title>${esc(s.model)} · ${s.year} · ${MONTHS[i]}: ${fmt(v)}</title></circle>`).join('');return `<path d="${d}" fill="none" stroke="${s.color}" stroke-width="3" stroke-dasharray="${s.dash}" stroke-linecap="round" stroke-linejoin="round"/>${dots}`}).join('');
    const legends=years.map((yr,i)=>`<span><i style="background:${PALETTE[i%PALETTE.length]}"></i>${yr}</span>`).join('');
    return `<div class="model-yoy-chart-head"><div><b>Evolución mensual · comparación YoY</b><small>Misma escala · cada color representa un año.</small></div><div class="model-yoy-style-key"><span><i class="solid"></i>${esc(a)}</span><span><i class="dash"></i>${esc(b)}</span></div></div>
      <div class="model-yoy-chart"><svg viewBox="0 0 ${W} ${H}" role="img" aria-label="Comparación YoY ${esc(a)} versus ${esc(b)}">${grid}${paths}${ticks}</svg></div>
      <div class="model-yoy-year-legend">${legends}</div>`;
  }

  function summary(a,b,years){
    const rows=years.map(year=>{
      const months=MONTHS.map((_,i)=>i+1).filter(m=>periodExists(year,m));
      const ta=months.reduce((s,m)=>s+value(a,year,m),0),tb=months.reduce((s,m)=>s+value(b,year,m),0),diff=ta-tb;
      return {year,months:months.length,a:ta,b:tb,diff};
    });
    return `<div class="model-yoy-summary"><table><thead><tr><th>Año</th><th>Meses cargados</th><th>${esc(a)}</th><th>${esc(b)}</th><th>Diferencia A−B</th><th>Líder</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${r.year}</b></td><td>${r.months}/12</td><td>${fmt(r.a)}</td><td>${fmt(r.b)}</td><td class="${r.diff>0?'pos':r.diff<0?'neg':''}">${r.diff>0?'+':''}${fmt(r.diff)}</td><td>${r.a===r.b?'Empate':r.a>r.b?esc(a):esc(b)}</td></tr>`).join('')}</tbody></table></div>`;
  }

  function insight(a,b,years){
    if(years.length<2)return 'Seleccioná dos o más años para leer el cambio interanual de cada modelo.';
    const y1=years[years.length-2],y2=years.at(-1),common=MONTHS.map((_,i)=>i+1).filter(m=>periodExists(y1,m)&&periodExists(y2,m));
    if(!common.length)return `No hay meses comparables entre ${y1} y ${y2} en la base cargada.`;
    const sumModel=(model,y)=>common.reduce((s,m)=>s+value(model,y,m),0),a1=sumModel(a,y1),a2=sumModel(a,y2),b1=sumModel(b,y1),b2=sumModel(b,y2);
    const g=(v0,v1)=>v0?((v1/v0-1)*100):null,ga=g(a1,a2),gb=g(b1,b2),months=common.map(m=>MONTHS[m-1]).join(', ');
    return `<b>Comparable ${y2} vs ${y1}:</b> ${esc(a)} ${ga==null?'s/base':`${ga>=0?'+':''}${ga.toFixed(1)}%`} · ${esc(b)} ${gb==null?'s/base':`${gb>=0?'+':''}${gb.toFixed(1)}%`} · meses comunes: ${months}.`;
  }

  function renderFromControls(){
    if(!DB)return;
    const a=exactModel(document.getElementById('modelYoyA')?.value),b=exactModel(document.getElementById('modelYoyB')?.value),years=selectedYears(),err=document.getElementById('modelYoyError'),out=document.getElementById('modelYoyResult');
    let msg='';if(!a)msg='Elegí un Modelo A válido de la lista.';else if(!b)msg='Elegí un Modelo B válido de la lista.';else if(a===b)msg='Elegí dos modelos distintos.';else if(!years.length)msg='Seleccioná al menos un año.';
    if(msg){err.hidden=false;err.textContent=msg;out.innerHTML='';return}err.hidden=true;
    save({a,b,years});
    out.innerHTML=`<section class="model-yoy-output">${chart(a,b,years)}<div class="model-yoy-insight">${insight(a,b,years)}</div>${summary(a,b,years)}<p class="model-yoy-note"><b>Lectura:</b> el eje X siempre es Ene–Dic para que la comparación sea YoY. Los meses que no existen en la base se dejan vacíos; no se completan ni se estiman.</p></section>`;
  }

  async function init(){
    if(booting||DB)return;booting=true;
    try{
      ensureStyles();ensureButton();
      const pivot=await ungzipB64(window.V24_PIVOT_B64);build(pivot);ensureButton();ensureShell();
      document.addEventListener('keydown',e=>{if(e.key==='Escape')close()});
      const top=document.querySelector('.top-actions');if(top)new MutationObserver(ensureButton).observe(top,{childList:true});
    }catch(err){console.error('2W YoY Model Tool',err)}finally{booting=false}
  }

  function start(){
    let tries=0;const tick=()=>{tries++;if(window.V24_PIVOT_B64&&document.querySelector('.top-actions'))init();else if(tries<80)setTimeout(tick,150)};tick();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
