(()=>{
  let raf=0;
  let currentId='';

  const buttons=()=>[...document.querySelectorAll('#navigation [data-anchor]')];
  const chapters=()=>[...document.querySelectorAll('.single-chapter[id]')];

  function ensureMobileIndicator(){
    let el=document.getElementById('mobileSectionIndicator');
    if(el)return el;
    el=document.createElement('button');
    el.id='mobileSectionIndicator';
    el.className='mobile-section-indicator';
    el.type='button';
    el.setAttribute('aria-label','Abrir índice en la sección actual');
    el.innerHTML='<i>01</i><span>Argentina hoy</span><b>Índice</b>';
    el.addEventListener('click',()=>document.getElementById('sidebar')?.classList.add('open'));
    document.body.appendChild(el);
    return el;
  }

  function setCurrent(id){
    if(!id)return;
    const nav=buttons();
    if(!nav.length)return;
    const selected=nav.find(b=>b.dataset.anchor===id);
    nav.forEach(b=>{
      const on=b===selected;
      b.classList.toggle('viewing',on);
      b.classList.toggle('active',on);
      if(on)b.setAttribute('aria-current','true');
      else b.removeAttribute('aria-current');
    });
    if(selected){
      const label=selected.querySelector('span')?.textContent?.trim()||'';
      const number=selected.querySelector('i')?.textContent?.trim()||'';
      const title=document.getElementById('viewTitle');
      if(title&&label)title.textContent=label;
      const mobile=ensureMobileIndicator();
      if(mobile){
        const i=mobile.querySelector('i');
        const span=mobile.querySelector('span');
        if(i)i.textContent=number;
        if(span)span.textContent=label;
      }
      if(id!==currentId){
        selected.scrollIntoView({block:'nearest',inline:'nearest'});
        currentId=id;
      }
    }
  }

  function detect(){
    raf=0;
    const list=chapters();
    if(!list.length)return;
    const isMobile=document.body.dataset.interface==='mobile'||window.innerWidth<=760;
    const probe=(isMobile?74:150)+Math.min(140,window.innerHeight*.18);
    let current=list[0];
    for(const section of list){
      if(section.getBoundingClientRect().top<=probe)current=section;
      else break;
    }
    const nearBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-12;
    if(nearBottom)current=list[list.length-1];
    setCurrent(current.id);
  }

  function schedule(){if(!raf)raf=requestAnimationFrame(detect)}

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#navigation [data-anchor]');
    if(b)setCurrent(b.dataset.anchor);
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('hashchange',schedule);

  document.addEventListener('DOMContentLoaded',()=>{
    ensureMobileIndicator();
    const content=document.getElementById('content');
    if(content)new MutationObserver(schedule).observe(content,{childList:true,subtree:false});
    schedule();
    setTimeout(schedule,80);
    setTimeout(schedule,350);
  });
})();
