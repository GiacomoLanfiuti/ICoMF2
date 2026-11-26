import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync,existsSync} from 'node:fs';
const root='public/icomf-lite/';
const index=JSON.parse(readFileSync(root+'index.json','utf8'));
test('global catalog exports realistic size and count',()=>{
 assert.equal(index.schema_version,'0.5-lite-v1');
 assert.equal(index.populations.length,128);
 assert.equal(index.populations.reduce((s,p)=>s+p.backtests,0),9942);
 assert.equal(index.populations.reduce((s,p)=>s+p.forecasting,0),1295);
});
test('all catalog references have a matching population and valid year series',()=>{
 for(const p of index.populations){
  assert.equal(p.file,`icomf-lite/${p.population}/${p.sex}.json`);
  assert.ok(existsSync('public/'+p.file));
  const data=JSON.parse(readFileSync('public/'+p.file,'utf8'));
  assert.equal(data.population,p.population);
  assert.equal(data.sex,p.sex);
  assert.equal(data.backtests.length,p.backtests);
  assert.equal(data.forecasting.length,p.forecasting);
  for(const run of [...data.backtests,...data.forecasting]){
   assert.ok(run.training_start<=run.training_end);
   assert.ok(run.forecast_end>run.training_end);
   assert.ok(Array.isArray(run.e0));
   assert.ok(run.e0.every(x=>x.Year>run.training_end&&x.Year<=run.forecast_end));
   if('interval_method' in run && run.interval_method==='unavailable'){
    assert.ok(run.e0.every(x=>x.L95===null&&x.U95===null));
   }
  }
 }
});
