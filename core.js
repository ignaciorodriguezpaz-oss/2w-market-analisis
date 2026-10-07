const $=selector=>document.querySelector(selector);
const $$=selector=>[...document.querySelectorAll(selector)];
const fmt=value=>new Intl.NumberFormat("es-AR",{maximumFractionDigits:0}).format(Number(value)||0);
const money=value=>Number.isFinite(Number(value))?new Intl.NumberFormat("es-AR",{style:"currency",currency:"ARS",maximumFractionDigits:0}).format(Number(value)):"—";
const pct=value=>Number.isFinite(Number(value))?`${Number(value)>=0?"+":""}${(Number(value)*100).toFixed(1).replace(".",",")}%`:"—";
const pp=value=>Number.isFinite(Number(value))?`${Number(value)>=0?"+":""}${(Number(value)*100).toFixed(1).replace(".",",")} pp`:"—";
const MONTHS=["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov","Dic"];
const COLORS={actual:"#101722",forecast:"#e0182d",previous:"#8f9aaa",down:"#b97916",base:"#e0182d",up:"#2b69c9",blue:"#2b69c9",green:"#18845b",amber:"#b97916",red:"#e0182d",CUB:"#e0182d",LMC:"#2b69c9",SC:"#8a5bd1",FUN:"#18845b",ATV:"#b97916",OTHERS:"#7f8a99",HONDA:"#e0182d",MOTOMEL:"#121922",GILERA:"#00a3a3",KELLER:"#f08a24",CORVEN:"#2d5f9a",ZANELLA:"#6a7f3d"};
const TITLES={overview:"Resumen ejecutivo",argentina:"Argentina hoy",market:"Mercado total",competition:"Competencia",forecast:"Forecast",segments:"Segmentos",honda:"Honda & Commercial",product:"Product Planning",imports:"Importaciones",intelligence:"Radar & señales",safety:"Safety",reports:"Report Center",data:"Datos & método"};
let DATA=null;
const state={view:"overview",period:"24",calendar:"CY",scenario:"base",segment:"TOTAL",productModel:null,taxonomy:"segment1"};
const norm=value=>String(value??"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toUpperCase().replace(/[^A-Z0-9]+/g," ").trim();

function label(period){const [year,month]=String(period).split("-").map(Number);return Number.isFinite(month)?`${MONTHS[month-1]} ${String(year).slice(-2)}`:period}
function tone(direction){const value=String(direction||"").toLowerCase();if(/down|negative|risk|weak|high/.test(value))return "red";if(/watch|mixed|medium|attention/.test(value))return "amber";return "green"}
function periodRows(rows){const limit=state.period==="all"?rows.length:Number(state.period);return rows.slice(-limit)}
function kpi(title,value,note,color="#2b69c9",tag=""){return `<article class="kpi" style="--accent:${color}"><div class="kpi-top"><span>${title}</span>${tag?`<em>${tag}</em>`:""}</div><b>${value}</b><small>${note}</small></article>`}
function head(eyebrow,title,copy,badge=""){return `<header class="page-head"><div><span class="eyebrow">${eyebrow}</span><h1>${title}</h1><p>${copy}</p></div>${badge?`<span class="badge ${badge.tone}">${badge.text}</span>`:""}</header>`}
function card(title,subtitle,body,extra="",cls=""){return `<section class="card ${cls}"><div class="card-head"><div><span class="eyebrow">${extra}</span><h2>${title}</h2><p>${subtitle}</p></div></div>${body}</section>`}
function legend(series){return `<div class="legend">${series.map(item=>`<span><i style="background:${item.color}"></i>${item.name}</span>`).join("")}</div>`}
function badge(text,t="green"){return `<span class="badge ${t}">${text}</span>`}
function safe(v){return v===null||v===undefined||v===""?"—":v}
function ratioTone(v,goodAbove=true){if(v===null||v===undefined)return "amber";const good=goodAbove?v>=0:v<=0;return good?"green":"red"}
function maxOf(rows,keys){const vals=[];rows.forEach(r=>keys.forEach(k=>{const v=Number(r[k]);if(Number.isFinite(v))vals.push(v)}));return vals.length?Math.max(...vals):1}

function lineChart(rows,series,{height=245,percent=false,zero=true,maxValue=null,minValue=null}={}){
  if(!rows.length)return `<div class="empty">Sin datos para los filtros seleccionados.</div>`;
  const width=760,pad={l:54,r:16,t:16,b:34};
  const values=series.flatMap(item=>rows.map(row=>Number(row[item.key])).filter(Number.isFinite));
  let min=minValue!==null?minValue:Math.min(...values),max=maxValue!==null?maxValue:Math.max(...values);
  if(zero&&!percent)min=0;
  if(percent&&min>0)min=0;
  if(min===max){max=min+1} const range=max-min||1;
  const x=index=>pad.l+index*(width-pad.l-pad.r)/Math.max(1,rows.length-1);
  const y=value=>pad.t+(max-value)/range*(height-pad.t-pad.b);
  const grid=Array.from({length:5},(_,index)=>{const value=max-range*index/4,yy=y(value);return `<g><line class="chart-grid" x1="${pad.l}" x2="${width-pad.r}" y1="${yy}" y2="${yy}"/><text class="chart-axis" x="${pad.l-7}" y="${yy+3}" text-anchor="end">${percent?pct(value):fmt(value)}</text></g>`}).join("");
  const paths=series.map(item=>{const points=rows.map((row,index)=>({value:Number(row[item.key]),index,row})).filter(point=>Number.isFinite(point.value));const d=points.map((point,index)=>`${index?"L":"M"}${x(point.index).toFixed(1)},${y(point.value).toFixed(1)}`).join(" ");const dots=points.filter((_,index)=>index%Math.max(1,Math.floor(points.length/12))===0||index===points.length-1).map(point=>`<circle class="chart-dot" data-tip="${label(point.row.period)}|${item.name}|${percent?pct(point.value):fmt(point.value)}" cx="${x(point.index)}" cy="${y(point.value)}" r="4" fill="${item.color}"/>`).join("");return `<path class="chart-line" d="${d}" stroke="${item.color}"/>${dots}`}).join("");
  const step=Math.max(1,Math.floor(rows.length/6));
  const ticks=rows.map((row,index)=>({row,index})).filter(({index})=>index%step===0||index===rows.length-1).map(({row,index})=>`<text class="chart-axis" x="${x(index)}" y="${height-8}" text-anchor="middle">${label(row.period)}</text>`).join("");
  return `${legend(series)}<div class="chart-shell"><svg viewBox="0 0 ${width} ${height}" role="img">${grid}${paths}${ticks}</svg></div>`;
}

function barChart(rows,{nameKey="name",valueKey="value",max=null,percent=false,limit=15,color=COLORS.blue,showShare=false}={}){
  const data=rows.slice(0,limit);if(!data.length)return `<div class="empty">Sin datos.</div>`;
  const ceiling=max||Math.max(...data.map(x=>Number(x[valueKey])||0),1);
  return `<div class="bars">${data.map((row,index)=>{const value=Number(row[valueKey])||0;const w=Math.max(1,value/ceiling*100);const labelValue=percent?pct(value):fmt(value);return `<div class="bar-row"><div class="bar-label"><span><i>${String(index+1).padStart(2,"0")}</i>${safe(row[nameKey])}</span><b>${labelValue}${showShare&&Number.isFinite(row.share)?` <small>${pct(row.share)}</small>`:""}</b></div><div class="hbar"><i style="width:${w}%;background:${typeof color==="function"?color(row,index):color}"></i></div>${row.mom!==undefined?`<div class="bar-meta"><span>MoM ${pct(row.mom)}</span>${row.yoy!==undefined?`<span>YoY ${pct(row.yoy)}</span>`:""}</div>`:""}</div>`}).join("")}</div>`;
}

function bubbleChart(rows,{xKey="cc",yKey="aug_volume",rKey="share_segment",height=280}={}){
  const clean=rows.map(r=>({...r,x:Number(String(r[xKey]||"").replace(/[^0-9.]/g,"")),y:Number(r[yKey])||0,r:Number(r[rKey])||0})).filter(r=>Number.isFinite(r.x)&&r.x>0&&r.y>0);
  if(!clean.length)return `<div class="empty">Sin datos comparables para este modelo.</div>`;
  const width=760,pad={l:50,r:28,t:22,b:38},maxX=Math.max(...clean.map(r=>r.x))*1.12,maxY=Math.max(...clean.map(r=>r.y))*1.18;
  const x=v=>pad.l+(v/maxX)*(width-pad.l-pad.r),y=v=>height-pad.b-(v/maxY)*(height-pad.t-pad.b);
  const grid=Array.from({length:4},(_,i)=>{const yy=pad.t+i*(height-pad.t-pad.b)/3;return `<line class="chart-grid" x1="${pad.l}" x2="${width-pad.r}" y1="${yy}" y2="${yy}"/>`}).join("");
  const bubbles=clean.map((r,i)=>{const radius=8+Math.min(20,Math.sqrt(r.r*1000||1)*2);return `<g><circle class="bubble" data-tip="${r.model}|${r.brand}|${fmt(r.y)} uds · ${r.x} cc" cx="${x(r.x)}" cy="${y(r.y)}" r="${radius}" fill="${i===0?COLORS.red:COLORS.blue}" fill-opacity="${i===0?.82:.5}"/><text class="bubble-label" x="${x(r.x)}" y="${y(r.y)-radius-5}" text-anchor="middle">${r.brand}</text></g>`}).join("");
  return `<div class="chart-shell"><svg viewBox="0 0 ${width} ${height}">${grid}<line class="axis-line" x1="${pad.l}" x2="${width-pad.r}" y1="${height-pad.b}" y2="${height-pad.b}"/>${bubbles}<text class="chart-axis" x="${width/2}" y="${height-8}" text-anchor="middle">Cilindrada (cc)</text><text class="chart-axis" transform="rotate(-90 12 ${height/2})" x="12" y="${height/2}" text-anchor="middle">Volumen estructural</text></svg></div>`;
}

function calendarSummary(){
  const rows=DATA.market_history;
  if(state.calendar==="CY"){
    const selected=rows.filter(r=>r.period.startsWith("2026-"));return {label:"CY 2026 YTD",value:selected.reduce((a,b)=>a+b.value,0),months:selected.length};
  }
  const selected=rows.filter(r=>r.period>="2026-04"&&r.period<="2027-03");return {label:"KI 26/27 ACT+FCST",value:selected.reduce((a,b)=>a+b.value,0)+DATA.forecast.rows.reduce((a,b)=>a+Number(b[state.scenario]||0),0),months:selected.length+DATA.forecast.rows.length};
}
function marketSeries(){const actual=periodRows(DATA.market_history).map(row=>({...row,actual:row.value,forecast:null}));const future=DATA.forecast.rows.map(row=>({...row,actual:null,forecast:row[state.scenario]}));const bridge=actual.at(-1);return [...actual,{...bridge,forecast:bridge.actual},...future]}
function segmentAt(name,period="2026-08"){const row=DATA.segment_history.find(r=>r.period===period);return row?.segments.find(x=>x.name===name)}
