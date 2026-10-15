import fs from 'node:fs';
import assert from 'node:assert/strict';

const html=fs.readFileSync('vnext/index.html','utf8');
const requiredModules=[
  'history.js','data.js','engine.js','engine-governance.js','live.js','upload.js',
  'market-drilldown.js','daily-monitor-v2.js','structure-forecast.js','geography.js',
  'time-machine.js','validation-v2.js','forecast-diff.js','forecast-v2.js',
  'honda-planning-v2.js','product-v2.js','intelligence-v2.js','fresh-intelligence.js',
  'imports-v2.js','reporting-v2.js','weekly-guard.js','reporting-v3.js',
  'custom-report-v4.js','report-export-v4.js','report-history.js','runtime-health.js'
];
for(const file of requiredModules){
  const path=`vnext/${file}`;
  assert.ok(fs.existsSync(path),`${path} exists`);
  assert.ok(fs.statSync(path).size>80,`${path} is non-empty implementation`);
  assert.ok(html.includes(`./${file}`),`${file} is wired in index.html`);
}

const requiredStyles=[
  'vnext.css','upload.css','market-drilldown.css','daily-monitor-v2.css','structure-forecast.css',
  'time-machine.css','forecast-diff.css','forecast-v2.css','honda-planning-v2.css','product-v2.css',
  'reporting-v2.css','weekly-guard.css','reporting-v3.css','report-history.css','validation-v2.css',
  'runtime-health.css','intelligence-v2.css','fresh-intelligence.css','custom-report-v4.css'
];
for(const file of requiredStyles){
  const path=`vnext/${file}`;
  assert.ok(fs.existsSync(path),`${path} exists`);
  assert.ok(html.includes(`./${file}`)||file==='vnext.css',`${file} is wired in index.html`);
}

const css=fs.readFileSync('vnext/vnext.css','utf8');
const chartRule=css.match(/\.svg-chart\{([^}]*)\}/)?.[1]||'';
assert.ok(chartRule,'Core SVG chart rule exists');
assert.match(chartRule,/overflow\s*:\s*hidden/i,'Charts are bounded to available width');
assert.doesNotMatch(chartRule,/overflow-x\s*:\s*(auto|scroll)/i,'Charts do not horizontally scroll');
assert.match(css,/\.svg-chart svg\{[^}]*width\s*:\s*100%/i,'SVG charts scale to full available width');

const forecast=fs.readFileSync('vnext/forecast-v2.js','utf8');
assert.match(forecast,/E\.inspect\(/,'Forecast UI calls the engine Inspector');
assert.match(forecast,/E\.requiredPath\(/,'Forecast UI calls Required Path engine');
const market=fs.readFileSync('vnext/market-drilldown.js','utf8');
assert.match(market,/includeHonda\(/,'Market drill-down has explicit Honda inclusion logic');
const imports=fs.readFileSync('vnext/imports-v2.js','utf8');
assert.match(imports,/registrations/i,'Imports view compares with registrations');
const reporting=fs.readFileSync('vnext/report-export-v4.js','utf8');
assert.match(reporting,/XLSX\.writeFile/,'Native XLSX export is wired');
assert.match(reporting,/PptxGenJS/,'Native PowerPoint export is wired');

console.log(JSON.stringify({ok:true,modules:requiredModules.length,styles:requiredStyles.length,checks:'wiring + non-empty modules + no-scroll charts + engine Inspector/RequiredPath hooks + Honda visibility + imports comparison + XLSX/PPTX exports'},null,2));