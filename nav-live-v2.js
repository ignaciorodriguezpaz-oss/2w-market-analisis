(()=>{
  let raf=0,currentId='';
  const buttons=()=>[...document.querySelectorAll('#navigation [data-anchor]')];
  const chapters=()=>[...document.querySelectorAll('.single-chapter[id]')];
  function mobileIndicator(){
    let el=document.getElementById('mobileSectionIndicator');
    if(el)return el;
    el=document.createElement('button'); el.id='mobileSectionIndicator'; el.className='mobile-section-indicator'; el.type='button';
    el.setAttribute('aria-label','Abrir índice en la sección actual');
    el.innerHTML='<i>01</i><span>Argentina hoy</span><b>Índice</b>';
    el.addEventListener('click',()=>document.getElementById('sidebar')?.classList.add('open'));
    document.body.appendChild(el); return el;
  }
  function stickyProbe(){
    const top=document.querySelector('.topbar')?.getBoundingClientRect().height||0;
    const filters=document.querySelector('.filters')?.getBoundingClientRect().height||0;
    return Math.min(window.innerHeight*.42,top+filters+30);
  }
  function setCurrent(id){
    const nav=buttons(),selected=nav.find(b=>b.dataset.anchor===id); if(!selected)return;
    nav.forEach(b=>{
      const on=b===selected; b.classList.toggle('viewing',on);
      if(on)b.setAttribute('aria-current','location'); else b.removeAttribute('aria-current');
    });
    const label=selected.querySelector('span')?.textContent?.trim()||'',num=selected.querySelector('i')?.textContent?.trim()||'';
    const title=document.getElementById('viewTitle'); if(title&&label)title.textContent=label;
    const mob=mobileIndicator(); if(mob){mob.querySelector('i').textContent=num;mob.querySelector('span').textContent=label}
    document.body.dataset.currentChapter=id;
    if(id!==currentId){selected.scrollIntoView({block:'nearest'});currentId=id}
  }
  function detect(){
    raf=0; const list=chapters(); if(!list.length)return;
    const probe=stickyProbe(); let current=list[0];
    for(const section of list){
      const r=section.getBoundingClientRect();
      if(r.top<=probe)current=section;
      if(r.top<=probe&&r.bottom>probe){current=section;break}
    }
    if(window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-18)current=list.at(-1);
    setCurrent(current.id);
  }
  function schedule(){if(!raf)raf=requestAnimationFrame(detect)}
  document.addEventListener('click',e=>{const b=e.target.closest?.('#navigation [data-anchor]');if(!b)return;setCurrent(b.dataset.anchor);setTimeout(schedule,160);setTimeout(schedule,480)});
  window.addEventListener('scroll',schedule,{passive:true}); window.addEventListener('resize',schedule,{passive:true}); window.addEventListener('hashchange',schedule);
  function start(){
    mobileIndicator();
    const content=document.getElementById('content'); if(content)new MutationObserver(()=>{currentId='';schedule();setTimeout(schedule,60)}).observe(content,{childList:true,subtree:false});
    const nav=document.getElementById('navigation'); if(nav)new MutationObserver(schedule).observe(nav,{childList:true,subtree:false});
    schedule();setTimeout(schedule,80);setTimeout(schedule,350);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();
})();
