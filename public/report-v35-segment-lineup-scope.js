/* 2W Market Analysis v35 — curated Honda lineup per segment */
const V35_VERSION='20261008-segment-lineup-scope-v1';

/* Segment pages must show only the Honda lineup that belongs to that segment.
   This is intentionally curated and does not auto-append every Honda model found in Pivot. */
const V35_HONDA_SEGMENT_LINEUP={
  CUB:[
    {label:'Wave 110',aliases:['HONDA WAVE 110','HONDA WAVE 110S','HONDA WAVE']},
    {label:'Biz 110',aliases:['HONDA BIZ 110','HONDA BIZ']}
  ],
  LMC:[
    {label:'GLH150',aliases:['HONDA GLH150','HONDA GLH 150']},
    {label:'XR150L',aliases:['HONDA XR 150','HONDA XR150','HONDA XR150L']},
    {label:'XR190L',aliases:['HONDA XR 190','HONDA XR190','HONDA XR190L']}
  ],
  SC:[
    {label:'NAVI',aliases:['HONDA NAVI']},
    {label:'PCX160',aliases:['HONDA PCX160','HONDA PCX 160']}
  ],
  FUN:[
    {label:'XR300L Tornado',aliases:['HONDA XR 300L','HONDA XR300L','HONDA XR300 TORNADO','HONDA XR 300 TORNADO']},
    {label:'CB300',aliases:['HONDA CB 300','HONDA CB300','HONDA CB300F']}
  ],
  ATV:[
    {label:'TRX420FM',aliases:['HONDA TRX420','HONDA TRX 420','HONDA TRX420FM']}
  ],
  OTHERS:[]
};

if(typeof v33segmentHondaEntries==='function'){
  v33segmentHondaEntries=function(segment){
    const rows=V35_HONDA_SEGMENT_LINEUP[segment]||[];
    return rows.map(x=>({label:x.label,segment,aliases:x.aliases,model:v33matchLineup({label:x.label,segment,aliases:x.aliases})}));
  };
}

/* Keep wording aligned with the curated segment lineup. */
if(typeof v33hondaLineupBlock==='function'){
  v33hondaLineupBlock=function(segment){
    const entries=v33segmentHondaEntries(segment),active=entries.filter(e=>v33lineupMetrics(segment,e).hasData).length,total=entries.length;
    if(!total)return '';
    return `<section class="card v33-honda-lineup"><div class="card-head"><div><span class="eyebrow">HONDA · LINEUP DEL SEGMENTO</span><h2>${segment} · lineup Honda relevante</h2><p>Se muestran únicamente los modelos Honda que pertenecen a este segmento. Si un modelo queda fuera del Top 5 conserva igualmente su ranking real y el gap contra el competidor inmediatamente superior.</p></div>${badge(`${active}/${total} CON DATA`,active===total?'green':'amber')}</div>${v33hondaLineupTable(segment)}<div class="note"><b>Regla:</b> esta tabla no trae modelos Honda de otros segmentos ni agrega automáticamente modelos premium/futuros. En FUN, el lineup mostrado es XR300L Tornado + CB300.</div></section>`;
  };
}

(function v35boot(){
  const ready=()=>{if(typeof DATA!=='undefined'&&DATA){try{render()}catch(e){console.error('v35 lineup scope',e)}}else setTimeout(ready,100)};
  ready();
})();
