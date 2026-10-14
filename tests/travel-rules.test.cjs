const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const data=JSON.parse(fs.readFileSync('travel-rules.json','utf8'));
const items=JSON.parse(fs.readFileSync('opportunities.json','utf8'));
const context={window:{countryName:name=>name==='United States of America'?'United States':name},Date};vm.createContext(context);
for(const file of ['travel-rules-data.js','travel-rules.js'])vm.runInContext(fs.readFileSync(file,'utf8'),context);
assert.equal(JSON.stringify(context.window.HK_TRAVEL_RULES),JSON.stringify(data));
assert.equal(data.passport,'HKSAR');assert.equal(Object.keys(data.countries).length,56);
for(const item of items){
 const rule=context.window.hkTravelRule(item.country);assert.ok(rule,item.country);
 assert.ok(rule.stay&&rule.entry&&rule.placement.note);
 for(const source of [...rule.sources,...rule.placement.sources])assert.equal(new URL(source.url).protocol,'https:');
 const html=context.window.hkTravelCard(item.country);assert.ok(html.includes(item.country==='Hong Kong'?'Hong Kong placement':'HKSAR passport'));assert.ok(!html.includes('BN(O)'));
}
for(const c of ['Spain','France','Romania','Switzerland'])assert.equal(data.countries[c].stayLimit.sharedArea,'Schengen');
for(const c of ['Ireland','Cyprus','French Guiana'])assert.notEqual(data.countries[c].stayLimit.sharedArea,'Schengen');
assert.equal(context.window.hkTravelRule('Cambodia','2026-10-15').stay,'Up to 14 days');
assert.equal(context.window.hkTravelRule('Cambodia','2026-10-16').status,'unverified');
assert.equal(context.window.hkTravelRule('Cambodia','2026-10-16').stayLimit,null);
assert.ok(!context.window.hkTravelRule('Cambodia','2026-10-16').stay.includes('14'));
assert.equal(data.countries.Malaysia.stay,'Up to 90 days');
assert.ok(context.window.hkTravelRule('United States of America').entry.includes('no HKSAR ESTA'));
assert.ok(data.countries['New Zealand'].placement.note.includes('food or accommodation'));
assert.ok(data.countries.Thailand.placement.label.includes('work permit'));
assert.equal(context.window.hkTravelRule('Unknown').status,'unverified');
console.log(`PASS: ${items.length} cards, HKSAR snapshot and unknown-country fallbacks, sources, Schengen separation, expiry and permission warnings.`);
