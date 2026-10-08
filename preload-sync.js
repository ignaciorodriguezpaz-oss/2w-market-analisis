/* Pre-open data synchronization gate: do not reveal the dashboard until live sources are refreshed. */
(()=>{
  const DAILY_ENDPOINT='https://ijaqabjjhsuvovtfffit.supabase.co/functions/v1/data-ingest';
  const IMPORTS_ENDPOINT='https://ijaqabjjhsuvovtfffit.supabase.co/functions/v1/imports-live';
  const STORE='2w.datahub.uploadKey';
  const TIMEOUT=15000;
  const boot={status:null,imports:null,dailyCutoff:null,dailyPeriod:null,dailyMtd:0,startedAt:new Date().toISOString(),ready:false,warnings:[]};
  window.__2W_PRELOAD_STATE__=boot;

  const gate=document.createElement('style');
  gate.id='preloadSyncGate';
  gate.textContent='#app{visibility:hidden!important}#loading{display:flex!important}';
  document.head.appendChild(gate);

  const sleep=ms=>new Promise(r=>setTimeout(r,ms));
  const norm=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
  const fmt=n=>new Intl.NumberFormat('es-AR',{maximumFractionDigits:0}).format(Number(n)||0);
  const monthLabel=period=>{const [y,m]=String(period||'').split('-').map(Number);return Number.isFinite(m)?new Intl.DateTimeFormat('es-AR',{month:'short'}).format(new Date(y,m-1,1)).replace('.','').toUpperCase():''};

  function setStage(title,detail=''){
    const box=document.getElementById('loading');
    if(!box)return;
    let p=box.querySelector('p');
    if(p)p.innerHTML=`<strong>${title}</strong>${detail?`<br><small>${detail}</small>`:''}`;
  }

  async function getJson(url,key){
    const ctrl=new AbortController();
    const timer=setTimeout(()=>ctrl.abort(),9000);
    try{
      const r=await fetch(url,{headers:key?{'x-upload-key':key}:{},cache:'no-store',signal:ctrl.signal});
      if(!r.ok)throw new Error(`HTTP ${r.status}`);
      return await r.json();
    }finally{clearTimeout(timer)}
  }

  async function refreshLive(){
    const key=localStorage.getItem(STORE);
    if(!key){boot.warnings.push('Sin clave local para consultar snapshots live');return boot}
    setStage('Actualizando Daily','Validando último corte y acumulado MTD…');
    const [daily,imports]=await Promise.allSettled([
      getJson(DAILY_ENDPOINT+'?action=status',key),
      getJson(IMPORTS_ENDPOINT,key)
    ]);
    if(daily.status==='fulfilled')boot.status=daily.value;else boot.warnings.push('Daily live no respondió');
    setStage('Actualizando importaciones','Leyendo el último snapshot confirmado…');
    if(imports.status==='fulfilled')boot.imports=imports.value;else boot.warnings.push('Importaciones live no respondió');
    const rows=boot.status?.daily||[];
    const last=rows[0];
    boot.dailyPeriod=last?.period||null;
    boot.dailyCutoff=last?.market_date||boot.status?.runs?.find?.(r=>r.dataset==='daily'&&r.status==='success')?.source_date||null;
    if(boot.dailyPeriod)boot.dailyMtd=rows.filter(r=>r.period===boot.dailyPeriod).reduce((a,b)=>a+Number(b.market_total||0),0);
    return boot
  }

  async function waitForAppData(){
    const start=Date.now();
    while(Date.now()-start<TIMEOUT){
      try{if(typeof DATA!=='undefined'&&DATA&&document.getElementById('content'))return true}catch{}
      await sleep(50);
    }
    throw new Error('La base principal no terminó de cargar a tiempo')
  }

  function mergeIntoData(){
    try{
      if(typeof DATA==='undefined'||!DATA)return;
      DATA.live={...(DATA.live||{}),daily:boot.status?.daily||[],daily_runs:boot.status?.runs||[],daily_period:boot.dailyPeriod,daily_cutoff:boot.dailyCutoff,daily_mtd:boot.dailyMtd};
      DATA.meta={...(DATA.meta||{}),daily_cutoff:boot.dailyCutoff||DATA.meta?.daily_cutoff,daily_mtd:boot.dailyMtd||DATA.meta?.daily_mtd};
      if(boot.imports?.imports)DATA.imports=boot.imports.imports;
      if(boot.imports?.meta_patch)DATA.meta={...DATA.meta,...boot.imports.meta_patch};
    }catch(error){boot.warnings.push(`Merge live: ${error.message}`)}
  }

  function patchVisibleLive(){
    const period=boot.dailyPeriod,total=boot.dailyMtd,cutoff=boot.dailyCutoff;
    if(!period||!total)return;
    const m=monthLabel(period);
    document.querySelectorAll('.kpi').forEach(k=>{
      const title=norm(k.querySelector('.kpi-top span')?.textContent||k.querySelector('span')?.textContent);
      if(title==='NOWCAST'||title===`${m} MTD`||title.endsWith(' MTD')){
        const value=k.querySelector(':scope>b');
        const note=k.querySelector('small');
        const tag=k.querySelector('.kpi-top em');
        if(value)value.textContent=fmt(total);
        if(note)note.textContent=`SIOMAA MTD · ${period} · corte ${cutoff||'—'}`;
        if(tag){tag.textContent='OPEN MONTH';tag.style.opacity='1'}
      }
    });
    document.querySelectorAll('.update-band>div').forEach(d=>{
      const label=norm(d.querySelector('span')?.textContent),b=d.querySelector('b');
      if(!b)return;
      if(label==='SIOMAA'&&cutoff)b.textContent=cutoff;
      if(label==='IMPORTS'&&boot.imports?.meta_patch?.imports_cutoff)b.textContent=boot.imports.meta_patch.imports_cutoff;
    });
    const fresh=document.getElementById('freshness');
    if(fresh)fresh.textContent=cutoff?`DAILY ${cutoff}`:'ACTUALIZADO';
  }

  async function bootSync(){
    try{
      setStage('Actualizando base','Mercado, histórico, competencia, Honda, forecast y módulos…');
      const livePromise=refreshLive();
      await waitForAppData();
      await livePromise;
      setStage('Validando datos','Aplicando Daily, importaciones y último corte antes del primer render…');
      mergeIntoData();
      try{if(typeof render==='function')render()}catch(error){boot.warnings.push(`Render: ${error.message}`)}
      await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));
      patchVisibleLive();
      boot.ready=true;boot.finishedAt=new Date().toISOString();
      document.dispatchEvent(new CustomEvent('2w:preload-ready',{detail:boot}));
      const detail=boot.dailyCutoff?`Daily ${boot.dailyCutoff} · MTD ${fmt(boot.dailyMtd)}${boot.imports?.meta_patch?.imports_cutoff?` · Imports ${boot.imports.meta_patch.imports_cutoff}`:''}`:'Fuentes base validadas';
      setStage('Datos actualizados',detail);
      await sleep(220);
      gate.remove();
      const app=document.getElementById('app');if(app)app.hidden=false;
      const loading=document.getElementById('loading');if(loading)loading.style.display='none';
    }catch(error){
      console.error('[preload-sync]',error);
      boot.warnings.push(error.message);
      setStage('No se pudo completar la actualización',error.message);
      const app=document.getElementById('app');if(app)app.hidden=true;
    }
  }

  window.__2W_PRELOAD_PROMISE__=bootSync();
})();