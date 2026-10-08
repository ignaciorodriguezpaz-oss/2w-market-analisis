(()=>{
  const KEY='2w.interface.mode';
  const AUTO_BREAKPOINT=860;
  const body=document.body;
  const nav=document.getElementById('navigation');
  const sidebar=document.getElementById('sidebar');
  const filters=document.querySelector('.filters');
  const filterBtn=document.getElementById('mobileFilters');
  const scrim=document.getElementById('filterScrim');
  const switcher=document.getElementById('interfaceSwitch');
  const dock=document.getElementById('mobileDock');
  const screenBtn=document.getElementById('screenMode');

  function autoMode(){return window.innerWidth<=AUTO_BREAKPOINT?'mobile':'desktop'}
  function preference(){return localStorage.getItem(KEY)||'auto'}
  function resolved(pref=preference()){return pref==='auto'?autoMode():pref}
  function apply(pref=preference()){
    const mode=resolved(pref);
    body.dataset.interface=mode;
    body.dataset.interfacePreference=pref;
    switcher?.querySelectorAll('[data-ui]').forEach(btn=>btn.classList.toggle('active',btn.dataset.ui===pref));
    if(mode==='desktop'){
      filters?.classList.remove('open');
      scrim?.classList.remove('open');
      sidebar?.classList.remove('open');
    }
    syncDock();
  }
  function setPreference(pref){
    if(!['auto','desktop','mobile'].includes(pref))return;
    localStorage.setItem(KEY,pref);
    apply(pref);
  }
  function toggleFilters(force){
    if(body.dataset.interface!=='mobile')return;
    const open=typeof force==='boolean'?force:!filters?.classList.contains('open');
    filters?.classList.toggle('open',open);
    scrim?.classList.toggle('open',open);
    filterBtn?.setAttribute('aria-expanded',String(open));
  }
  function closeMobilePanels(){
    toggleFilters(false);
    sidebar?.classList.remove('open');
  }
  function navButtons(){return [...(nav?.querySelectorAll('button')||[])]}
  function labelOf(btn){return (btn?.innerText||btn?.textContent||'').replace(/\s+/g,' ').trim()}
  function pick(words,fallback){
    const buttons=navButtons();
    return buttons.find(btn=>words.some(w=>labelOf(btn).toLowerCase().includes(w)))||buttons[fallback]||null;
  }
  function dockTargets(){
    return [
      {key:'home',icon:'⌂',label:'Inicio',target:pick(['argentina hoy','resumen ejecutivo','inicio'],0)},
      {key:'market',icon:'⌁',label:'Mercado',target:pick(['mercado'],3)},
      {key:'forecast',icon:'⌁',label:'Forecast',target:pick(['forecast'],5)},
      {key:'honda',icon:'H',label:'Honda',target:pick(['honda','planning'],7)}
    ];
  }
  function buildDock(){
    if(!dock)return;
    const targets=dockTargets();
    dock.innerHTML=targets.map(x=>`<button type="button" data-dock="${x.key}"><i>${x.icon}</i><span>${x.label}</span></button>`).join('')+'<button type="button" data-dock="more"><i>☰</i><span>Más</span></button>';
    targets.forEach(x=>{
      dock.querySelector(`[data-dock="${x.key}"]`)?.addEventListener('click',()=>{
        closeMobilePanels();
        x.target?.click();
        if(x.target?.dataset.anchor){document.getElementById(x.target.dataset.anchor)?.scrollIntoView({behavior:'smooth',block:'start'})}
        syncDock();
      });
    });
    dock.querySelector('[data-dock="more"]')?.addEventListener('click',()=>{
      toggleFilters(false);
      sidebar?.classList.toggle('open');
    });
    syncDock();
  }
  function syncDock(){
    if(!dock)return;
    const active=navButtons().find(btn=>btn.classList.contains('active'));
    const activeText=labelOf(active).toLowerCase();
    const map={home:['argentina hoy','resumen ejecutivo','inicio'],market:['mercado'],forecast:['forecast'],honda:['honda','planning']};
    dock.querySelectorAll('button').forEach(btn=>btn.classList.remove('active'));
    let key=Object.entries(map).find(([,words])=>words.some(w=>activeText.includes(w)))?.[0];
    if(!key&&location.hash){
      const h=location.hash.slice(1).toLowerCase();
      if(['context','executive'].includes(h))key='home'; else if(h.includes('market'))key='market'; else if(h.includes('forecast'))key='forecast'; else if(h.includes('planning'))key='honda';
    }
    if(key)dock.querySelector(`[data-dock="${key}"]`)?.classList.add('active');
  }
  function togglePresentation(){
    if(body.dataset.interface!=='desktop')return;
    body.classList.toggle('presentation');
    const active=body.classList.contains('presentation');
    screenBtn?.classList.toggle('active',active);
    screenBtn?.setAttribute('aria-pressed',String(active));
    if(active&&document.documentElement.requestFullscreen){document.documentElement.requestFullscreen().catch(()=>{})}
    else if(!active&&document.fullscreenElement&&document.exitFullscreen){document.exitFullscreen().catch(()=>{})}
  }

  switcher?.addEventListener('click',e=>{
    const btn=e.target.closest('[data-ui]');
    if(btn)setPreference(btn.dataset.ui);
  });
  filterBtn?.addEventListener('click',()=>toggleFilters());
  scrim?.addEventListener('click',()=>closeMobilePanels());
  screenBtn?.addEventListener('click',togglePresentation);
  document.getElementById('resetFilters')?.addEventListener('click',()=>{if(body.dataset.interface==='mobile')toggleFilters(false)});
  nav?.addEventListener('click',()=>{if(body.dataset.interface==='mobile'){sidebar?.classList.remove('open');syncDock()}});
  window.addEventListener('hashchange',syncDock);
  window.addEventListener('resize',()=>{if(preference()==='auto')apply('auto')});
  document.addEventListener('fullscreenchange',()=>{if(!document.fullscreenElement){body.classList.remove('presentation');screenBtn?.classList.remove('active')}});

  if(nav){new MutationObserver(()=>buildDock()).observe(nav,{childList:true,subtree:true,attributes:true,attributeFilter:['class']})}
  apply();
  buildDock();
})();