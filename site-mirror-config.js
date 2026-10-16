(()=>{
  const config={
    source:{
      type:'chatgpt-site',
      projectId:'appgprj_6ad0344c5900819189af38529acc3915',
      label:'ARGENTINA MOTORCYCLE INTELLIGENCE'
    },
    production:{
      provider:'vercel',
      projectId:'prj_biZo0BRQoW9Bs8UAQMbXw2fVFPqZ',
      projectName:'2w-market-analisis-418j',
      branch:'main'
    },
    visualVersion:'2026-10-16.1',
    identity:{
      documentTitle:'2W Market Analysis · Argentina Motorcycle Intelligence',
      brandTitle:'ARGENTINA',
      brandSubtitle:'MARKET ANALYSIS',
      breadcrumb:'2W MARKET ANALYSIS · SINGLE REPORT',
      loading:'Preparando reporte integral…'
    },
    theme:{
      bg:'#f3f5f7',
      paper:'#ffffff',
      ink:'#101722',
      muted:'#687386',
      line:'#e3e8ee',
      hondaRed:'#e0182d',
      blue:'#2b69c9',
      green:'#18845b',
      amber:'#b97916',
      nav:'#0b1017',
      nav2:'#141b24',
      radius:'18px'
    },
    chapters:[
      ['executive','Resumen ejecutivo'],
      ['context','Argentina hoy'],
      ['market','Mercado, Daily & estacionalidad'],
      ['structure','Segmentos, competencia & supply'],
      ['consumer','Consumidor & movilidad'],
      ['forecast','Forecast CY / KI'],
      ['user','Probabilidad & User Scenario'],
      ['planning','Honda & Planning'],
      ['actions','Radar, riesgos & acciones'],
      ['method','Metodología, validación & reportes']
    ]
  };

  window.__2W_SITE_MIRROR__=config;
  const root=document.documentElement;
  root.dataset.visualSource='market-site';
  root.dataset.visualVersion=config.visualVersion;
  const css={
    '--bg':config.theme.bg,
    '--paper':config.theme.paper,
    '--ink':config.theme.ink,
    '--muted':config.theme.muted,
    '--line':config.theme.line,
    '--red':config.theme.hondaRed,
    '--blue':config.theme.blue,
    '--green':config.theme.green,
    '--amber':config.theme.amber,
    '--nav':config.theme.nav,
    '--nav2':config.theme.nav2,
    '--radius':config.theme.radius
  };
  Object.entries(css).forEach(([key,value])=>root.style.setProperty(key,value));
  document.title=config.identity.documentTitle;

  function applyIdentity(){
    const brand=document.querySelector('.brand');
    if(brand){
      const b=brand.querySelector('b');
      const small=brand.querySelector('small');
      if(b)b.textContent=config.identity.brandTitle;
      if(small)small.textContent=config.identity.brandSubtitle;
    }
    const auth=document.querySelector('.auth-brand');
    if(auth){
      const b=auth.querySelector('b');
      const small=auth.querySelector('small');
      if(b)b.textContent=config.identity.brandTitle;
      if(small)small.textContent=`${config.identity.brandSubtitle} · ACCESO PROTEGIDO`;
    }
    const breadcrumb=document.querySelector('.breadcrumbs span');
    if(breadcrumb)breadcrumb.textContent=config.identity.breadcrumb;
    const loading=document.querySelector('#loading p');
    if(loading)loading.textContent=config.identity.loading;
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',applyIdentity,{once:true});
  else applyIdentity();
})();
