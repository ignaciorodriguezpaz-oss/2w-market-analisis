(()=>{
  let raf=0;
  let currentId='';

  const buttons=()=>[...document.querySelectorAll('#navigation [data-anchor]')];
  const chapters=()=>[...document.querySelectorAll('.single-chapter[id]')];

  function setCurrent(id){
    if(!id)return;
    const nav=buttons();
    if(!nav.length)return;
    const active=nav.find(b=>b.dataset.anchor===id);
    nav.forEach(b=>{
      const on=b===active;
      b.classList.toggle('viewing',on);
      if(on)b.setAttribute('aria-current','true');
      else b.removeAttribute('aria-current');
    });
    if(active){
      const label=active.querySelector('span')?.textContent?.trim();
      const title=document.getElementById('viewTitle');
      if(title&&label)title.textContent=label;
      if(id!==currentId){
        active.scrollIntoView({block:'nearest',inline:'nearest'});
        currentId=id;
      }
    }
  }

  function detect(){
    raf=0;
    const list=chapters();
    if(!list.length)return;
    const stickyOffset=window.innerWidth<=760?118:152;
    const probe=stickyOffset+Math.min(150,window.innerHeight*.18);
    let current=list[0];
    for(const section of list){
      if(section.getBoundingClientRect().top<=probe)current=section;
      else break;
    }
    const nearBottom=window.innerHeight+window.scrollY>=document.documentElement.scrollHeight-8;
    if(nearBottom)current=list[list.length-1];
    setCurrent(current.id);
  }

  function schedule(){
    if(!raf)raf=requestAnimationFrame(detect);
  }

  document.addEventListener('click',e=>{
    const b=e.target.closest?.('#navigation [data-anchor]');
    if(b)setCurrent(b.dataset.anchor);
  });
  window.addEventListener('scroll',schedule,{passive:true});
  window.addEventListener('resize',schedule,{passive:true});
  window.addEventListener('hashchange',schedule);

  document.addEventListener('DOMContentLoaded',()=>{
    const content=document.getElementById('content');
    if(content){
      new MutationObserver(schedule).observe(content,{childList:true,subtree:false});
    }
    schedule();
    setTimeout(schedule,80);
    setTimeout(schedule,350);
  });
})();
