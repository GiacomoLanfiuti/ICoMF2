import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync} from 'node:fs';
const b=JSON.parse(readFileSync('public/benchmarks/sweden_total_1960_2000_h20.json','utf8'));
test('empirical benchmark is a single fixed-origin Sweden comparison',()=>{assert.equal(b.country,'Sweden');assert.equal(b.population,'Total');assert.equal(b.origin,2000);assert.equal(b.horizon,20);assert.equal(b.testing.end,2020);assert.equal(b.officialLeaderboard,false)});
test('e0 and mx data preserve model/age/year completeness',()=>{assert.equal(b.e0.length,40);assert.equal(b.mx.length,4240);assert.equal(b.metrics.length,4);assert.equal(b.mx.filter(x=>x.year===2001&&x.model==='lc').length,106);assert.ok(b.e0.every(x=>x.lower===null&&x.upper===null))});
test('real benchmark does not claim a formal DM test',()=>{const text=readFileSync('src/components/RealBenchmark.tsx','utf8');assert.match(text,/Formal Diebold–Mariano p-values are not reported/)});
