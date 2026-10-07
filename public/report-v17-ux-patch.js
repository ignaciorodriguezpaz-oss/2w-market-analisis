/* v17 — compatibility bridge for contextual UX layer */
function v17esc(v){return String(v??'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
v13modelControls=function(){
  const brands=v13modelBrands(),count=v13modelFilteredNames().length;
  return `<div class="v13-local-controls"><span>MODELOS</span><label><span>MARCA</span><select id="v13ModelBrand"><option value="ALL">Todas las marcas</option>${brands.map(b=>`<option value="${v17esc(b)}" ${V13_MODEL_BRAND===b?'selected':''}>${v17esc(b)}</option>`).join('')}</select></label><label><span>BUSCAR MODELO</span><input id="v13ModelSearch" value="${v17esc(V13_MODEL_QUERY)}" placeholder="Wave, Tornado, Rouser…"></label><button id="v13ModelApply">Aplicar</button><button id="v13ModelClear">Limpiar</button><div class="v13-universe"><b>${count}</b><small>de ${V13_MODEL_DATA?.active_count||v3names('model').length} activos</small></div></div>`;
};
const V17_BASE_FORECAST=forecast;
forecast=function(){return `${V17_BASE_FORECAST()}${typeof v14uioBlock==='function'?v14uioBlock():''}`};
