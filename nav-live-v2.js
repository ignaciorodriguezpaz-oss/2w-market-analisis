(()=>{
  const FLOW=['executive','context','market','structure','consumer','forecast','user','planning','actions','method'];
  let raf=0,currentId='',observer=null;
  const nav=()=>document.getElementById('navigation');
  const buttons=()=>FLOW.map(id=>nav()?.querySelector(`[data-anchor="${id}"]`)).filter(Boolean);
  const chapterRows=()=>FLOW.map(id=>{
    const section=document.getElementById(id),button=nav()?.querySelector(`[data-anchor="${id}"]`);
    if(!section||!button)return null;
    const r=section.getBoundingClientRect();
    return {id,section,button,top:r.top,bottom:r.bottom,height:r.height};
  }).filter(Boolean);

  function mobileIndicator(){
    let el=document.getElementById('mobileSectionIndicator');
    if(el)return el;
    el=document.createElement('button');el.id='mobileSectionIndicator';el.className='mobile-section-indicator';el.type='button';
    el.setAttribute('aria-label','Abrir índice en la sección actual');
    el.innerHTML='<i>01</i><span>Resumen ejecutivo</span><b>Índice</b>';
    el.addEventListener('click',()=>document.getElementById('sidebar')?.classList.add('open'));
    document.body.appendChild(el);return el;
  }

  function removeNonReportIndexItems(){
    const n=nav();if(!n)return;
    [...n.querySelectorAll('[data-anchor]')].forEach(b=>{
      if(!FLOW.includes(b.dataset.anchor)){
        b.hidden=true;
        b.setAttribute('aria-hidden','true');
        b.classList.remove('active','viewing');
        b.removeAttribute('aria-current');
      }
    });
  }

  function probe(){
    const top=document.querySelector('.topbar')?.getBoundingClientRect().height||0;
    const filters=document.querySelector('.filters')?.getBoundingClientRect().height||0;
    return Math.min(window.innerHeight*.40,top+filters+28);
  }

  function pick(){
    const rows=chapterRows();if(!rows.length)return null;
    const y=probe();let chosen=rows[0];
    for(const row of rows){if(row.top<=y)chosen=row;else break}
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-8)chosen=rows.at(-1);
    return chosen;
  }

  function setCurrent(item){
    if(!item)return;
    removeNonReportIndexItems();
    const all=buttons();
    all.forEach(b=>{
      const on=b===item.button;
      b.classList.toggle('viewing',on);
      b.classList.toggle('active',on);
      b.toggleAttribute('data-current',on);
      if(on)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current');
    });
    const label=item.button.querySelector('span')?.textContent?.trim()||'';
    const num=item.button.querySelector('i')?.textContent?.trim()||'';
    const title=document.getElementById('viewTitle');if(title&&label)title.textContent=label;
    const mob=mobileIndicator();if(mob){mob.querySelector('i').textContent=num;mob.querySelector('span').textContent=label}
    document.body.dataset.currentChapter=item.id;
    if(item.id!==currentId){item.button.scrollIntoView({block:'nearest'});currentId=item.id}
  }

  function detect(){raf=0;setCurrent(pick())}
  function schedule(){if(!raf)raf=requestAnimationFrame(detect)}

  function observeChapters(){
    observer?.disconnect();
    const top=Math.round(probe());
    observer=new IntersectionObserver(()=>schedule(),{root:null,rootMargin:`-${top}px 0px -55% 0px`,threshold:[0,.01,.25,.5,.75,1]});
    FLOW.forEach(id=>{const el=document.getElementById(id);if(el)observer.observe(el)});
  }

  function go(id){
    if(!FLOW.includes(id))return;
    const el=document.getElementById(id);if(!el)return;
    el.scrollIntoView({behavior:'smooth',block:'start'});
    setTimeout(schedule,60);setTimeout(schedule,220);setTimeout(schedule,520);
  }

  function start(){
    mobileIndicator();removeNonReportIndexItems();observeChapters();
    document.addEventListener('click',e=>{
      const b=e.target.closest?.('#navigation [data-anchor]');if(!b||!FLOW.includes(b.dataset.anchor))return;
      e.preventDefault();go(b.dataset.anchor);document.getElementById('sidebar')?.classList.remove('open');
    },true);
    window.addEventListener('scroll',schedule,{passive:true});
    document.addEventListener('scroll',schedule,{passive:true,capture:true});
    window.addEventListener('resize',()=>{observeChapters();schedule()},{passive:true});
    window.addEventListener('hashchange',schedule);
    const content=document.getElementById('content');
    if(content)new MutationObserver(()=>{currentId='';removeNonReportIndexItems();observeChapters();schedule()}).observe(content,{childList:true,subtree:false});
    const n=nav();
    if(n)new MutationObserver(()=>{removeNonReportIndexItems();schedule()}).observe(n,{childList:true,subtree:false});
    setInterval(schedule,500);
    schedule();setTimeout(schedule,80);setTimeout(schedule,350);setTimeout(schedule,900);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();