import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
globalThis.window=globalThis;
for(const file of ['vnext/history.js','vnext/data.js','vnext/engine.js','vnext/engine-governance.js']){
  vm.runInThisContext(fs.readFileSync(file,'utf8'),{filename:file});
}
const D=globalThis.VNEXT_DATA,E=globalThis.VNEXT_ENGINE;
assert.ok(D&&E,'engine globals load');
const M=E.build();
assert.equal(M.forecast.length,6,'current KI has six open/future months Oct-Mar');
for(const r of M.forecast){assert.ok(r.down<=r.base&&r.base<=r.up,`${r.key}: Down ≤ Base ≤ Up`);assert.ok(r.base>0,`${r.key}: positive Base`)}
const actual=Object.values(D.actuals).reduce((s,v)=>s+v,0),forecastBase=M.forecast.reduce((s,r)=>s+r.base,0),forecastDown=M.forecast.reduce((s,r)=>s+r.down,0),forecastUp=M.forecast.reduce((s,r)=>s+r.up,0);
assert.equal(M.ki.actual,actual,'KI actual reconciles controlled closes');
assert.equal(M.ki.base,actual+forecastBase,'KI Base reconciles Apr-Mar');
assert.equal(M.ki.down,actual+forecastDown,'KI Down reconciles Apr-Mar');
assert.equal(M.ki.up,actual+forecastUp,'KI Up reconciles Apr-Mar');
assert.ok(M.cy.down<=M.cy.base&&M.cy.base<=M.cy.up,'CY scenario ordering');
for(const scenario of ['down','base','up']){assert.equal(M.multiKI[scenario].length,5,`${scenario}: five KIs`);for(const ki of M.multiKI[scenario]){assert.equal(ki.path.length,12,`${ki.ki}: twelve monthly path rows`);assert.equal(ki.path.reduce((s,x)=>s+x.value,0),ki.market,`${ki.ki}: monthly path reconciles`)}}
const target=900000,req=E.requiredPath(target,'KI26/27');assert.equal(req.actualLocked+req.path.reduce((s,x)=>s+x.value,0),target,'Target required path reconciles');
assert.ok(M.backtest.n>12,'backtest has meaningful sample');assert.ok(Number.isFinite(M.backtest.wape)&&M.backtest.wape>=0,'backtest WAPE finite');assert.match(M.backtest.scope,/Strict walk-forward/i,'backtest explicitly strict walk-forward');
const tm=E.timeMachine('2024-09',6);assert.equal(tm.rows.length,6,'Time Machine horizon');assert.ok(tm.rows.every(x=>x.knownThrough==='2024-09'),'Time Machine knowledge cutoff frozen');assert.ok(tm.rows.every(x=>x.seasonalityN>0),'Time Machine seasonality estimated from prior years');
console.log(JSON.stringify({ok:true,open:{mtd:M.open.mtd,base:M.open.base,down:M.open.down,up:M.open.up},ki:{actual:M.ki.actual,down:M.ki.down,base:M.ki.base,up:M.ki.up},cy:M.cy,backtest:{n:M.backtest.n,wape:M.backtest.wape,mape:M.backtest.mape,bias:M.backtest.bias},timeMachine:tm.rows.map(x=>({key:x.key,base:x.base,actual:x.actual,ape:x.ape}))},null,2));