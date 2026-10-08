/* v60 · single authoritative scrollspy for report sheets only */
(()=>{
let raf=0,current='';
const nav=()=>document.getElementById('navigation');
const allButtons=()=>[...(nav()?.querySelectorAll('[data-anchor]')||[])];
const buttons=()=>allButtons().filter(b=>b.dataset.anchor!=='datahub'&&!b.hidden&&b.getAttribute('aria-hidden')!=='true');
function probe(){const top=document.querySelector('.topbar')?.getBoundingClientRect().height||0;const filters=document.querySelector('.filters')?.getBoundingClientRect().height||0;return Math.min(innerHeight*.42,top+filters+30)}
function rows(){return buttons().map((button,index)=>{const id=button.dataset.anchor,el=id?document.getElementById(id):null;if(!el)return null;const r=el.getBoundingClientRect();return {id,button,el,top:r.top,bottom:r.bottom,index}}).filter(Boolean).sort((a,b)=>a.top-b.top)}
function pick(){const list=rows();if(!list.length)return null;const y=probe();let chosen=list[0];for(const row of list){if(row.top<=y)chosen=row;else break}return chosen}
function clearLegacy(b){b.classList.remove('active','viewing');b.removeAttribute('data-v53-active');b.removeAttribute('aria-current');b.removeAttribute('data-scroll-current')}
function apply(item){if(!item)return;allButtons().forEach(clearLegacy);item.button.setAttribute('data-scroll-current','true');item.button.setAttribute('aria-current','location');const label=item.button.querySelector('span')?.textContent?.trim();const title=document.getElementById('viewTitle');if(label&&title&&!document.body.classList.contains('data-hub-sheet-open'))title.textContent=label;document.body.dataset.currentChapter=item.id;if(current!==item.id){item.button.scrollIntoView({block:'nearest'});current=item.id}}
function detect(){raf=0;if(document.body.classList.contains('data-hub-sheet-open'))return;apply(pick())}
function schedule(){if(!raf)raf=requestAnimationFrame(detect)}
function go(id){if(id==='datahub')return;const el=document.getElementById(id);if(!el)return;el.scrollIntoView({behavior:'smooth',block:'start'});setTimeout(schedule,80);setTimeout(schedule,260);setTimeout(schedule,650)}
function loadSegmentModels(){if(!document.querySelector('link[data-v57-models]')){const l=document.createElement('link');l.rel='stylesheet';l.href='/report-v57-segment-model-analysis.css?v=20261008-v57a';l.dataset.v57Models='1';document.head.appendChild(l)}if(!document.querySelector('script[data-v57-models]')){const s=document.createElement('script');s.src='/report-v57-segment-model-analysis.js?v=20261008-v57a';s.defer=true;s.dataset.v57Models='1';document.body.appendChild(s)}}
function start(){loadSegmentModels();document.addEventListener('click',e=>{const b=e.target.closest?.('#navigation [data-anchor]');if(!b||b.dataset.anchor==='datahub')return;e.preventDefault();go(b.dataset.anchor);document.getElementById('sidebar')?.classList.remove('open')},true);window.addEventListener('scroll',schedule,{passive:true});window.addEventListener('resize',schedule,{passive:true});window.addEventListener('hashchange',schedule);const n=nav();if(n)new MutationObserver(()=>{current='';schedule()}).observe(n,{childList:true,subtree:true});const c=document.getElementById('content');if(c)new MutationObserver(()=>{current='';schedule()}).observe(c,{childList:true,subtree:true});setInterval(()=>{if(!document.body.classList.contains('data-hub-sheet-open'))apply(pick())},700);schedule();setTimeout(schedule,120);setTimeout(schedule,600);setTimeout(schedule,1500)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
