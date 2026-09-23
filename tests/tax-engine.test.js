const fs = require('fs');
const vm = require('vm');
const path = require('path');

const html = fs.readFileSync(path.join(__dirname, '..', 'index.html'), 'utf8');
const match = html.match(/<script id="engine">([\s\S]*?)<\/script>/);
if (!match) throw new Error('Engine script not found');

const context = vm.createContext({
  console,
  t: (key, params = {}) => Object.entries(params).reduce(
    (value, entry) => value.replaceAll('{' + entry[0] + '}', entry[1]),
    key
  )
});
vm.runInContext(match[1], context);

function calculate(csvText) {
  context.__csv = csvText;
  return vm.runInContext(
    '(() => {' +
      'const parsed = parseCsv(__csv);' +
      'if (parsed.error) throw new Error(parsed.error);' +
      'const normalized = normalizeRows(parsed);' +
      'const result = computeAll(normalized.trades);' +
      'result.issues.unshift(...normalized.issues);' +
      'return JSON.parse(JSON.stringify({' +
        'groups: result.groups, reportGroups: result.reportGroups,' +
        'issues: result.issues, years: result.byYear' +
      '}, (key, value) => key === \"related\" ? undefined : value));' +
    '})()',
    context
  );
}

const header = 'Datum obchodu;Směr;Symbol;Cena;Počet;Měna;Typ aktiva;Objem;Poplatky;Vyloučení z osvobození;Obchodní majetek;ID transakce;Zdroj;Peněženka;Protihodnota;Zdroj ocenění;Poznámka';
// Test cases below retain the original fixture order; serialize them into the public required-first schema.
const row = values => [values[0],values[1],values[2],values[3],values[4],values[5],values[8],values[6],values[7],values[9] === 'RESTRICT' ? 'Ano' : '',...values.slice(10)].join(';');
const csv = rows => [header].concat(rows).join('\n');
const close = (actual, expected, message) => {
  if (Math.abs(actual - expected) > 0.01) throw new Error(message + ': ' + actual + ' !== ' + expected);
};
const ok = (condition, message) => { if (!condition) throw new Error(message); };

const tests = [];
function test(name, fn) { tests.push([name, fn]); }

test('securities amount test uses gross proceeds and exempts the whole eligible basket', () => {
  const result = calculate(csv([
    row(['1.1.2025','Nákup','AAA','100','10','CZK','-1000','0','Akcie','','Ne','B1','Broker','','','','']),
    row(['1.2.2025','Prodej','AAA','200','10','CZK','2000','0','Akcie','','Ne','S1','Broker','','','',''])
  ]));
  close(result.groups[0].taxInc, 0, 'taxable income');
  close(result.groups[0].exemptC, 2000, 'exempt income');
});

test('ordinary eligible crypto uses its own 100k test after 15 February 2025', () => {
  const result = calculate(csv([
    row(['16.2.2025','Nákup','ETH','1000','1','CZK','-1000','0','Kryptoaktivum','Ano','Ne','B1','DEX','W','CZK','DEX','']),
    row(['20.2.2025','Prodej','ETH','2000','1','CZK','2000','0','Kryptoaktivum','Ano','Ne','S1','DEX','W','CZK','DEX',''])
  ]));
  close(result.groups[0].taxInc, 0, 'taxable crypto income');
  close(result.groups[0].amountTestExemptC, 2000, 'crypto amount-test exemption');
});

test('EMT is excluded from the crypto 100k test', () => {
  const result = calculate(csv([
    row(['16.2.2025','Nákup','USDT','1','1000','USD','-1000','0','EMT','Ano','Ne','B1','Exchange','W','USD','Exchange','']),
    row(['20.2.2025','Prodej','USDT','1','1000','USD','1000','0','EMT','Ano','Ne','S1','Exchange','W','USD','Exchange',''])
  ]));
  ok(result.groups[0].taxInc > 0, 'EMT disposal must remain taxable');
  close(result.groups[0].amountTestExemptC, 0, 'EMT amount-test exemption');
});

test('EMT can still pass the separate three-year holding test', () => {
  const result = calculate(csv([
    row(['1.1.2020','Nákup','USDT','1','1000','USD','-1000','0','EMT','Ano','Ne','B1','Exchange','W','USD','Exchange','']),
    row(['20.2.2025','Prodej','USDT','1','1000','USD','1000','0','EMT','Ano','Ne','S1','Exchange','W','USD','Exchange',''])
  ]));
  close(result.groups[0].taxInc, 0, 'taxable EMT income');
  ok(result.groups[0].timeTestExemptC > 0, 'EMT time-test exemption');
});

test('crypto disposal before 15 February 2025 remains taxable', () => {
  const result = calculate(csv([
    row(['1.1.2020','Nákup','BTC','100','1','CZK','-100','0','Kryptoaktivum','Ano','Ne','B1','Exchange','W','CZK','Exchange','']),
    row(['14.2.2025','Prodej','BTC','200','1','CZK','200','0','Kryptoaktivum','Ano','Ne','S1','Exchange','W','CZK','Exchange',''])
  ]));
  close(result.groups[0].taxInc, 200, 'pre-effective-date income');
});

test('section 10 expenses are capped by income within each income kind', () => {
  const result = calculate(csv([
    row(['1.1.2025','Nákup','LOSS','200000','1','CZK','-200000','0','Akcie','','Ne','B1','Broker','','','','']),
    row(['1.2.2025','Prodej','LOSS','150000','1','CZK','150000','0','Akcie','','Ne','S1','Broker','','','',''])
  ]));
  const group = result.reportGroups.find(item => item.kind === 'security');
  close(group.allowableExpenses, 150000, 'allowable expenses');
  close(group.nonDeductibleExpenses, 50000, 'non-deductible excess');
  close(group.taxBase, 0, 'tax base');
});

test('missing acquisition history is a blocking issue', () => {
  const result = calculate(csv([
    row(['20.3.2025','Prodej','BTC','90000','0.5','USD','45000','1','Kryptoaktivum','Ano','Ne','S1','Exchange','W','USD','Exchange',''])
  ]));
  ok(result.issues.some(item => item.code === 'MISSING_ACQUISITION' && item.severity === 'error'), 'missing acquisition error');
});

test('CSV formula injection and delimiters are escaped', () => {
  context.__value = '=SUM(1;2)';
  const escaped = vm.runInContext('csvCell(__value)', context);
  ok(escaped === '"\'=SUM(1;2)"', 'unexpected escaped value: ' + escaped);
});

test('English validation guidance names the Czech source columns', () => {
  for (const column of ['Směr', 'Datum obchodu', 'Symbol', 'Měna', 'Typ aktiva', 'Cena', 'Počet', 'ID transakce', 'Zdroj ocenění']) {
    ok(html.includes('Czech source column') && html.includes('“' + column + '”'), 'missing English guidance for Czech column: ' + column);
  }
});

test('crypto exemptions are evaluated without a redundant eligibility confirmation', () => {
  const result = calculate(csv([
    row(['1.1.2020','Nákup','BTC','100','1','CZK','-100','0','Kryptoaktivum','','Ne','B1','Exchange','W','CZK','Exchange','']),
    row(['20.2.2025','Prodej','BTC','200','1','CZK','200','0','Kryptoaktivum','','Ne','S1','Exchange','W','CZK','Exchange',''])
  ]));
  ok(result.groups[0].timeTestExemptC === 200, 'time test should be evaluated by default');
  ok(!result.issues.some(item => item.code === 'CRYPTO_ELIGIBILITY_UNCONFIRMED'), 'redundant eligibility error remains');
});

test('exemption restriction explicitly disables crypto exemptions', () => {
  const result = calculate(csv([
    row(['1.1.2020','Nákup','BTC','100','1','CZK','-100','0','Kryptoaktivum','RESTRICT','Ne','B1','Exchange','W','CZK','Exchange','']),
    row(['20.2.2025','Prodej','BTC','200','1','CZK','200','0','Kryptoaktivum','RESTRICT','Ne','S1','Exchange','W','CZK','Exchange',''])
  ]));
  ok(result.groups[0].taxInc === 200, 'restricted disposal should remain taxable');
});

test('warnings and issue descriptions remain translatable after import', () => {
  ok(html.includes("importWarnings.push({code:'CRYPTO_ELIGIBILITY'"), 'crypto warning is stored as translated text');
  ok(html.includes("warnings.push({code:'PROVISIONAL_RATE', year})"), 'rate warning is stored as translated text');
  ok(html.includes('esc(issueText(x))'), 'validation table does not translate issue codes at render time');
});

let passed = 0;
for (const item of tests) {
  try {
    item[1]();
    console.log('✓ ' + item[0]);
    passed++;
  } catch (error) {
    console.error('✗ ' + item[0]);
    console.error(error.stack || error);
  }
}
if (passed !== tests.length) process.exit(1);
console.log('\n' + passed + '/' + tests.length + ' tests passed');
