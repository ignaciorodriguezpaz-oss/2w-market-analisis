/* 2W Market Analysis v29 — causal Plan User: conditions, controls and actions */
const V29_VERSION='20261007-user-plan-causal-controls';
function v29planNumbers(){
  const e=typeof v8effectivePlan==='function'?v8effectivePlan():null;
  const active=e?.active||{};
  const ind=e?.ind?.[0]||{};
  return {market:Number(active.market)||Number(ind.base)||0,honda:Number(active.honda)||0,share:Number(active.share)||0,base:Number(ind.base)||0,down:Number(ind.down)||0,up:Number(ind.up)||0,explicit:!!active.explicit,key:e?.activeKey||'USER'};
}
function v29conditionRows(){
  const p=v29planNumbers();
  const gap=p.base?p.market/p.base-1:0;
  const high=gap>.06, low=gap<-.04;
  return [
    ['Argentina / Macro', high?'Actividad y salario real deben sostener recuperación; inflación y tasas no pueden deteriorar affordability.':low?'El plan tolera desaceleración macro moderada; foco en sostener mix y evitar sobrestock.':'Macro debe acompañar sin shock de FX/tasas.', high?'IPC, salario real, EMAE, tasas, FX':'IPC, salarios, crédito, confianza', high?'Si salario real no mejora o tasa sube, bajar escenario o reforzar financiación.':'Mantener seguimiento mensual.'],
    ['Mercado 2W', high?'El mercado debe correr por encima del Base y sostener daily pace hasta cierre de KI.':low?'El plan queda dentro de rango conservador; controlar no resignar share.':'Debe mantenerse cerca del Base.', 'Daily SIOMAA/CAFAM, MoM, YoY, Rolling 3M, mismo estadio', high?'Si daily cae debajo del Base 2 semanas, activar revisión de volumen.':'Si pace confirma Base, mantener.'],
    ['Importaciones / Supply', high?'Supply debe acompañar sin cuello de botella: importaciones, nacional y stock deben cubrir demanda incremental.':low?'Cuidar exceso de cobertura si el mercado queda debajo del plan.':'Supply debe quedar neutral.', 'Imports/ventas, stock terminal, stock dealer, cobertura 3M, nuevos modelos', high?'Si imports/stock <90% de necesidad, riesgo de incumplimiento operativo.':'Ajustar mix antes de acumular sobrestock.'],
    ['Competidores', high?'Competidores no deben capturar todo el crecimiento con precio/crédito/lanzamientos; monitorear Iraola, La Emilia, Gilera, Keller, Yamaha/Bajaj.':low?'Plan conservador puede requerir defender share más que capturar mercado.':'Monitorear amenazas puntuales.', 'Top 5 marcas, grupos, modelos, share rolling, noticias, precios', 'Si un competidor gana share 2 meses seguidos en el segmento clave, activar acción de producto/precio.'],
    ['Honda / Red', p.share>.25?'Honda requiere share alto: disponibilidad, financiación, red y mix deben estar alineados.':'Honda requiere ejecución estable y foco en modelos tractores.', 'Share mensual requerido, WS/RS, stock dealer, capacidad red, presupuesto', p.share>.25?'Si share requerido supera capacidad/stock, plan pasa a condicional.':'Mantener ejecución.'],
    ['Producto / Segmentos', high?'CUB/LMC y modelos volumen deben sostener elasticidad y disponibilidad; amenazas de Navi/Wave/Biz/XR se vuelven críticas.':'Controlar canibalización y margen.', 'Top 5 por segmento, elasticidad, precios, modelos nuevos, segment share', 'Si precio relativo empeora y elasticidad es alta, corregir precio/financiación o revisar volumen.']
  ];
}
function v29conditionTable(){
  return `<div class="table-wrap"><table class="table"><thead><tr><th>Frente</th><th>Qué debería pasar</th><th>Controles</th><th>Acción si no se cumple</th></tr></thead><tbody>${v29conditionRows().map(r=>`<tr><td><b>${r[0]}</b></td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</tbody></table></div>`;
}
function v29decisionTree(){
  const items=[
    ['Se cumple daily + macro + imports','Mantener Plan User y confirmar forecast vigente.','green'],
    ['Se cumple mercado pero no supply','Plan posible pero operativamente condicional; activar stock/imports/red.','amber'],
    ['Se cumple supply pero no mercado','Riesgo de sobrestock; revisar pricing, crédito y compras.','amber'],
    ['Competidores aceleran en segmento clave','Activar defensa por modelo: precio, financiación, comunicación o mix.','red'],
    ['Plan supera Up sin evidencia','Clasificar como remoto/condicional y exigir supuestos explícitos.','red']
  ];
  return `<div class="v29-tree">${items.map(([a,b,t])=>`<div class="${t}"><b>${a}</b><p>${b}</p></div>`).join('')}</div>`;
}
function v29planCausalBlock(){
  const p=v29planNumbers(),gap=p.base?p.market/p.base-1:null,share=p.market?p.honda/p.market:0;
  return `<section class="card v29-plan-causal"><div class="card-head"><div><span class="eyebrow">PLAN USER · CAUSAL REQUIREMENTS</span><h2>Qué tiene que pasar para que el plan se cumpla</h2><p>El Plan User queda separado del forecast independiente. Este bloque traduce el número en condiciones verificables, controles y acciones.</p></div>${badge(p.explicit?'USER INPUT':'AUTO · PLAN ANTERIOR',p.explicit?'purple':'amber')}</div>
    <section class="kpis">${kpi('MERCADO PLAN',fmt(p.market),gap==null?'sin base':`${gap>=0?'+':''}${pct(gap)} vs Base`,V3_PURPLE,'USER')}${kpi('HONDA PLAN',fmt(p.honda),`share requerido ${pct(share)}`,COLORS.red,'USER')}${kpi('BASE INDEP.',fmt(p.base),'forecast libre',COLORS.blue,'REFERENCE')}${kpi('COMPATIBILIDAD',gap>.08?'CONDICIONAL':gap<-.05?'CONSERVADORA':'PLAUSIBLE',gap>.08?'requiere evidencia extra':'dentro de banda',gap>.08?COLORS.amber:COLORS.green,'LIKELIHOOD')}</section>
    ${card('Condiciones para cumplir el plan','Macro, mercado, importaciones, competencia, Honda y producto. Cada fila tiene control y acción.',v29conditionTable(),'CONTROLS')}
    ${card('Árbol de decisión','Qué hacemos según qué condición se cumple o falla.',v29decisionTree(),'ACTION LOGIC')}
  </section>`;
}

if(typeof v12userSheet==='function'){
  const V29_BASE_USER_SHEET=v12userSheet;
  v12userSheet=function(){
    const html=V29_BASE_USER_SHEET();
    const marker='<div class="note"><b>Separación:</b>';
    return html.includes(marker)?html.replace(marker,`${v29planCausalBlock()}${marker}`):`${html}${v29planCausalBlock()}`;
  };
}
if(typeof userBlock==='function'){
  const V29_BASE_USER_BLOCK=userBlock;
  userBlock=function(){return `${V29_BASE_USER_BLOCK()}${v29planCausalBlock()}`};
}
(function v29boot(){const ready=()=>{if(typeof DATA!=='undefined'&&DATA){try{render()}catch(e){console.error('V29 user causal render',e)}}else setTimeout(ready,100)};ready()})();
