/* 2W Market Analysis v38 — user-defined brand and group palette */
const V38_VERSION='20261008-custom-palette-v1';
const V38_BRANDS={
  GILERA:'#6D28D9',
  CORVEN:'#F97316',
  KELLER:'#B8875B',
  YAMAHA:'#38BDF8',
  KAWASAKI:'#84CC16',
  VOGE:'#8B5CF6'
};
const V38_GROUPS={
  IRAOLA:'#F97316',
  SIMPA:'#FACC15',
  'LA EMILIA':'#86EFAC'
};

(function v38boot(){
  const ready=()=>{
    if(typeof V37_BRANDS==='undefined'||typeof COLORS==='undefined'){setTimeout(ready,80);return}
    Object.assign(V37_BRANDS,V38_BRANDS);
    Object.assign(COLORS,V38_BRANDS);
    try{Object.assign(V37_GROUP_FALLBACK,V38_GROUPS)}catch{}
    try{
      v37groupColor=function(name){
        const group=v37n(name);
        if(group==='HONDA')return V37.honda;
        if(V38_GROUPS[group])return V38_GROUPS[group];
        try{
          const rows=(typeof V3_ROLL!=='undefined'&&V3_ROLL?.brand_history)||[];
          const last=rows.at(-1)||{};
          const map=typeof V24_GROUP_BY_BRAND!=='undefined'?V24_GROUP_BY_BRAND:{};
          const candidates=Object.keys(last).filter(k=>k!=='period'&&v37n(map[k])===group).sort((a,b)=>(Number(last[b])||0)-(Number(last[a])||0));
          if(candidates.length)return v37brandColor(candidates[0])||V37_GROUP_FALLBACK[group]||null;
        }catch{}
        return V37_GROUP_FALLBACK[group]||null;
      };
    }catch{}
    try{if(typeof render==='function'&&typeof DATA!=='undefined'&&DATA)render()}catch(e){console.error('V38 palette render',e)}
  };
  ready();
})();
