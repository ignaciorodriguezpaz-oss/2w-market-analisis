/* v56 · reliable scrollspy, wins over older observers */
(()=>{
let raf=0,currentId='';
const topSections=()=>[...document.querySelectorAll('#content > .single-chapter[id]')];
const buttons=()=>[...document.querySelectorAll('#navigation [data-anchor]')];
function probeY(){const t=document.querySelector('.topbar')?.getBoundingClientRect().height||0;const f=document.querySelector('.filters')?.getBoundingClientRect().height||0;return Math.min(innerHeight*.42,t+f+30)}
function setCurrent(id){if(!id)return;const list=buttons();const selected=list.find(b=>b.dataset.anchor===id);if(!selected)return;list.forEach(b=>{const on=b===selected;b.classList.toggle('viewing',on);b.classList.toggle('active',on);b.dataset.v53Active=on?'true':'false';if(on)b.setAttribute('aria-current','location');else b.removeAttribute('aria-current')});const label=selected.querySelector('span')?.textContent?.trim();if(label){const title=document.getElementById('viewTitle');if(title)title.textContent=label}document.body.dataset.currentChapter=id;if(id!==currentId){selected.scrollIntoView({block:'nearest'});currentId=id}}
function detect(){raf=0;const sections=topSections();if(!sections.length)return;const probe=probeY();const hub=document.getElementById('datahub');if(hub){const hr=hub.getBoundingClientRect();if(hr.top<=probe&&hr.bottom>probe){setCurrent('datahub');return}}let current=sections[0];for(const s of sections){const r=s.getBoundingClientRect();if(r.top<=probe)current=s;if(r.top<=probe&&r.bottom>probe){current=s;break}}if(innerHeight+scrollY>=document.documentElement.scrollHeight-18){if(hub&&hub.getBoundingClientRect().bottom<=innerHeight+20)current={id:'datahub'};else current=sections.at(-1)}setCurrent(current.id)}
function schedule(){if(!raf)raf=requestAnimationFrame(detect)}
document.addEventListener('click',e=>{const b=e.target.closest?.('#navigation [data-anchor]');if(!b)return;setCurrent(b.dataset.anchor);setTimeout(schedule,80);setTimeout(schedule,300);setTimeout(schedule,700)});
function loadV57(){
  if(!document.querySelector('link[data-v57-models]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/report-v57-segment-model-analysis.css?v=20261008-v57a';l.dataset.v57Models='1';document.head.appendChild(l)}
  if(!document.querySelector('script[data-v57-models]')){const s=document.createElement('script');s.src='/report-v57-segment-model-analysis.js?v=20261008-v57a';s.defer=true;s.dataset.v57Models='1';document.body.appendChild(s)}
}
function start(){loadV57();const c=document.getElementById('content');if(c)new MutationObserver(()=>{currentId='';schedule();setTimeout(schedule,60)}).observe(c,{childList:true,subtree:true});const n=document.getElementById('navigation');if(n)new MutationObserver(schedule).observe(n,{childList:true,subtree:false});window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('hashchange',schedule);schedule();setTimeout(schedule,120);setTimeout(schedule,600)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
