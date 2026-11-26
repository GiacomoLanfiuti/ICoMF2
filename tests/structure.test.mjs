import test from 'node:test';import assert from 'node:assert/strict';import {readFileSync,existsSync} from 'node:fs';
test('five pages exist and contain actual code',()=>{for(const page of ['Contest','Forecasting','Library','Leaderboard','About','Documentation']){const path=`src/pages/${page}Page.tsx`;assert.ok(existsSync(path));assert.ok(readFileSync(path,'utf8').length>100)}});
test('Vite base matches case-sensitive repository name',()=>assert.match(readFileSync('vite.config.ts','utf8'),/\/ICoMF2\//));
test('workflow exists',()=>assert.ok(existsSync('.github/workflows/deploy.yml')));
test('demo data are labeled synthetic',()=>assert.match(readFileSync('src/data/mockData.ts','utf8'),/Synthetic demonstration/));
