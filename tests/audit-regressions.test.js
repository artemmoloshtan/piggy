const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const html = fs.readFileSync(require('node:path').join(__dirname,'../index.html'),'utf8');
const c = vm.createContext({t:k=>k, console});
vm.runInContext(html.match(/<script id="engine">([\s\S]*?)<\/script>/)[1],c);
const header='Datum obchodu;Směr;Symbol;Cena;Počet;Měna;Typ aktiva';
function calc(text){
  c.input=text;
  return vm.runInContext('(()=>{const n=normalizeRows(parseCsv(input));const r=computeAll(n.trades);return {...r, normalized:n};})()',c);
}
let n=calc(header+';Objem\n1.1.2025;Nákup;AAA;100;10;CZK;Akcie;-1000').normalized;
assert.equal(n.trades[0].fee,0);
n=calc('Symbol;Typ aktiva;Měna;Počet;Cena;Směr;Datum obchodu\nAAA;Akcie;CZK;10;100;Nákup;1.1.2025').normalized;
assert.equal(n.trades[0].fee,0);
assert.equal(n.trades[0].objem,-1000);
assert(calc(header.replace(';Cena','')+'\n1.1.2025;Nákup;AAA;10;CZK;Akcie').normalized.issues.some(i=>i.code==='MISSING_COLUMN'));
for(const date of ['31.2.2025','29.2.2025','1.13.2025','2025-02-29','1.1.2025 24:00','1.1.2025junk']){
  assert(calc(header+'\n'+date+';Nákup;AAA;100;1;CZK;Akcie').normalized.issues.some(i=>i.code==='INVALID_DATE'),date);
}
assert.equal(calc(header+'\n29.2.2024;Nákup;AAA;100;1;CZK;Akcie').normalized.trades.length,1);
for(const val of ['abc','123oops','Infinity','-2']) assert.equal(calc(header+'\n1.1.2025;Nákup;AAA;'+val+';1;CZK;Akcie').normalized.trades.length,0);
assert(calc(header+';Obchodní majetek\n1.1.2025;Nákup;AAA;100;1;CZK;Akcie;maybe').normalized.issues.some(i=>i.code==='INVALID_FIELD'));
const sale=(year,type='Akcie',optional='',value='')=>calc(header+optional+'\n1.1.2020;Nákup;AAA;1000000;1;CZK;'+type+value+'\n1.3.'+year+';Prodej;AAA;50000000;1;CZK;'+type+value);
assert.equal(sale(2025).groups[0].taxInc,10000000);
assert.equal(sale(2026).groups[0].taxInc,0);
assert.equal(sale(2026,'Kryptoaktivum').groups[0].taxInc,10000000);
for(const type of ['Akcie','Kryptoaktivum']){
  const r=sale(2025,type,';Obchodní majetek',';Ano');
  assert.equal(r.groups[0].exemptC,0);
  assert(r.issues.some(i=>i.code==='BUSINESS_REVIEW'));
  assert.equal(sale(2025,type,';Vyloučení z osvobození',';Ano').groups[0].exemptC,0);
  const small=calc(header+';Obchodní majetek\n1.1.2020;Nákup;AAA;100;1;CZK;'+type+';Ano\n1.3.2025;Prodej;AAA;1000;1;CZK;'+type+';Ne');
  assert.equal(small.groups[0].exemptC,0,'business acquisition cannot pass either exemption test');
  assert(small.issues.some(i=>i.code==='BUSINESS_REVIEW'));
}
const mixedCap=calc(header+'\n1.1.2020;Nákup;STOCK;1000000;1;CZK;Akcie\n1.1.2020;Nákup;COIN;1000000;1;CZK;Kryptoaktivum\n1.3.2025;Prodej;STOCK;30000000;1;CZK;Akcie\n1.3.2025;Prodej;COIN;30000000;1;CZK;Kryptoaktivum');
assert.equal(mixedCap.groups.reduce((s,g)=>s+g.taxInc,0),20000000);
const example=calc(fs.readFileSync(require('node:path').join(__dirname,'../examples/piggy-template.csv'),'utf8'));
c.g=example.groups.find(g=>g.symbol==='AAPL');
assert.equal(vm.runInContext('disposalQuantities(g).taxable',c),5);
assert.equal(vm.runInContext('disposalQuantities(g).exempt',c),20);
assert.equal(example.reportGroups.find(g=>g.year===2025 && g.kind==='security').taxBase.toFixed(2),'3430.48');
// Exercise the actual import and export functions with rendering stubbed out.
function install(name){const start=html.indexOf('function '+name+'(');const end=html.indexOf('\nfunction ',start+1);vm.runInContext(html.slice(start,end),c);}
vm.runInContext('let importIssues=[],importWarnings=[],nextDatasetId=0,loadedFiles=[],state=null; const showError=msg=>{throw Error(msg)}; const renderLoaded=()=>{}; const runAll=()=>{};',c);
for(const name of ['processText','addTrades','loadText'])install(name);
c.bad=header+'\n31.2.2025;Nákup;AAA;100;1;CZK;Akcie';
vm.runInContext('loadText(bad,"clipboard");loadText(bad,"clipboard");',c);
const removal=html.match(/const removed = loadedFiles\[\+target.dataset.rm\];([\s\S]*?)renderLoaded\(\); runAll\(\); return;/)[0].replace('return;','');
vm.runInContext('const target={dataset:{rm:0}};'+removal,c);
assert.equal(vm.runInContext('importIssues.length',c),1);
assert.equal(vm.runInContext('importIssues[0].datasetId===loadedFiles[0].datasetId',c),true);
vm.runInContext('const assetLabel=x=>x; const fmtDateTime=x=>String(x); let downloaded; const download=(name,text)=>{downloaded=text};',c);
install('numCZK');install('exportTaxable');
const gains=calc(header+'\n1.1.2025;Nákup;A;100000;1;CZK;Akcie\n1.1.2025;Nákup;B;100000;1;CZK;Akcie\n1.3.2025;Prodej;A;120000;1;CZK;Akcie\n1.3.2025;Prodej;B;90000;1;CZK;Akcie');
c.result=gains;
vm.runInContext('state=result;exportTaxable()',c);
assert(vm.runInContext('downloaded.includes("-10000,00")',c));
assert.equal(gains.reportGroups[0].taxBase,10000);
console.log('Audit regressions passed: mapping, dates, values, exemptions, caps, quantities, annual losses, and dataset removal.');
