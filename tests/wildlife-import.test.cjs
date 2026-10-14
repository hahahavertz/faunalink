const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
const items=JSON.parse(fs.readFileSync('opportunities.json','utf8'));
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync('data.js','utf8'),context);
assert.equal(JSON.stringify(context.window.OPPORTUNITIES),JSON.stringify(items));
assert.equal(items.length,118);assert.equal(new Set(items.map(i=>i.country)).size,49);
assert.equal(new Set(items.map(i=>i.region)).size,6);assert.equal(new Set(items.map(i=>i.id)).size,118);
assert.equal(new Set(items.map(i=>i.url+'|'+i.place+'|'+i.title)).size,118);
for(const i of items){
 assert.ok(Number.isFinite(i.lat)&&Math.abs(i.lat)<=90);assert.ok(Number.isFinite(i.lng)&&Math.abs(i.lng)<=180);
 for(const u of [i.url,i.postedDateSource,...i.alternateSources.map(a=>a.url)].filter(Boolean))assert.equal(new URL(u).protocol,'https:');
 assert.ok(['ongoing_programme','accepting_applications','closed_for_season'].includes(i.availabilityStatus));
}
const ciwy=items.filter(i=>i.organization==='Comunidad Inti Wara Yassi (CIWY)');
assert.equal(ciwy.length,2);assert.notEqual(ciwy[0].id,ciwy[1].id);assert.notEqual(ciwy[0].place,ciwy[1].place);
assert.ok(!items.some(i=>['PAWS-PATAS','Soi Dog Foundation','The Black Sheep Animal Sanctuary'].includes(i.organization)));
if(process.argv[2]){
 const supplied=process.argv.slice(2,6).flatMap(path=>JSON.parse(fs.readFileSync(path,'utf8')));assert.equal(supplied.length,items.length);
 supplied.forEach((source,index)=>{
  for(const [key,value] of Object.entries(source)){
   if(key==='id'&&String(value).startsWith('fl-p3-')){assert.equal(items[index].importedId,value);}
   else if(key==='postedDateSource'&&value){
    const match=value.match(/https:\/\/[^\s)]+/);assert.equal(items[index][key],match?match[0]:source.url);
   }else assert.equal(JSON.stringify(items[index][key]),JSON.stringify(value),`${index}: ${key}`);
  }
 });
}
if(process.argv[6]){const baseline=JSON.parse(fs.readFileSync(process.argv[6],'utf8'));assert.equal(JSON.stringify(items.slice(0,baseline.length)),JSON.stringify(baseline));}

assert.equal(items.filter(i=>i.availabilityStatus==='closed_for_season').length,8);
const seaLife=items.filter(i=>i.organization==='SEA LIFE Trust Beluga Whale Sanctuary & Puffin Rescue Centre');assert.equal(seaLife.length,2);assert.equal(seaLife.filter(i=>i.availabilityStatus==='closed_for_season').length,1);assert.ok(seaLife.some(i=>i.programType==='paid_job'&&i.availabilityStatus==='accepting_applications'));
console.log('PASS: 118 supplied entries, prior batch and IDs preserved, unique programme keys, valid map coordinates and link schemes.');
