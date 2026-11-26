export interface LiteYear {Year:number;e0:number|null;L95:number|null;U95:number|null;observed_e0?:number|null}
export interface LiteMetric {Horizon:number;Target:string;RMSE:number;MAE:number;N:number}
export interface Backtest {training_start:number;training_end:number;forecast_end:number;model:string;model_version:string;e0:LiteYear[];metrics:LiteMetric[]}
export interface FutureRun {training_start:number;training_end:number;forecast_end:number;model:string;model_version:string;e0:LiteYear[];interval_method:string}
export interface LitePopulation {population:string;sex:string;backtests:Backtest[];forecasting:FutureRun[]}
export interface LiteIndexEntry {population:string;sex:string;file:string;backtests:number;forecasting:number}
export interface LiteIndex {schema_version:string;created_at:string;source:string;life_table:string;populations:LiteIndexEntry[]}
const root=`${import.meta.env.BASE_URL}icomf-lite/`;
let indexPromise:Promise<LiteIndex>|undefined;
const populationCache=new Map<string,Promise<LitePopulation>>();
export function loadLiteIndex():Promise<LiteIndex> {return indexPromise??(indexPromise=fetch(root+'index.json').then(r=>{if(!r.ok)throw Error(`Catalog not available (HTTP ${r.status})`);return r.json() as Promise<LiteIndex>}).then(d=>{if(d.schema_version!=='0.5-lite-v1'||!Array.isArray(d.populations))throw Error('Unexpected ICoMF export schema');return d}).catch(e=>{indexPromise=undefined;throw e}));}
export function loadLitePopulation(entry:LiteIndexEntry):Promise<LitePopulation> {
 const key=`${entry.population}/${entry.sex}`;
 if(!populationCache.has(key)) {
  // Only index-provided paths under the static data directory are used.
  if(entry.file!==`icomf-lite/${key}.json`)return Promise.reject(Error('Unexpected catalog file path'));
  const req=fetch(`${import.meta.env.BASE_URL}${entry.file}`).then(r=>{if(!r.ok)throw Error(`Population not available (HTTP ${r.status})`);return r.json() as Promise<LitePopulation>}).then(v=>{if(v.population!==entry.population||v.sex!==entry.sex||!Array.isArray(v.backtests)||!Array.isArray(v.forecasting))throw Error('Population data failed integrity check');return v}).catch(e=>{populationCache.delete(key);throw e});populationCache.set(key,req);
 }
 return populationCache.get(key)!;
}
export const nameOfModel=(id:string)=>({Naive:'Naïve',Poisson:'Poisson baseline',LeeCarter:'Lee–Carter',LeeCarterPoisson:'Lee–Carter log-Poisson',HyndmanUllah:'Hyndman–Ullah'} as Record<string,string>)[id]||id;
export const palette:Record<string,string>={Naive:'#86909d',Poisson:'#bf7a31',LeeCarter:'#3073ae',LeeCarterPoisson:'#29927c',HyndmanUllah:'#9a67a7'};
export const countryName:Record<string,string>={AUS:'Australia',AUT:'Austria',BEL:'Belgium',BGR:'Bulgaria',BLR:'Belarus',CAN:'Canada',CHE:'Switzerland',CHL:'Chile',CZE:'Czechia',DEUTE:'Germany (East)',DEUTNP:'Germany (non-population)',DEUTW:'Germany (West)',DNK:'Denmark',ESP:'Spain',EST:'Estonia',FIN:'Finland',FRACNP:'France (civilian)',FRATNP:'France (total)',GBR_NIR:'Northern Ireland',GBR_NP:'United Kingdom',GBR_SCO:'Scotland',GBRCENW:'England & Wales (civilian)',GBRTENW:'England & Wales (total)',GRC:'Greece',HKG:'Hong Kong',HRV:'Croatia',HUN:'Hungary',IRL:'Ireland',ISL:'Iceland',ISR:'Israel',ITA:'Italy',JPN:'Japan',LTU:'Lithuania',LVA:'Latvia',NLD:'Netherlands',NOR:'Norway',NZL_NM:'New Zealand (non-Māori)',NZL_NP:'New Zealand',POL:'Poland',PRT:'Portugal',RUS:'Russia',SVK:'Slovakia',SVN:'Slovenia',SWE:'Sweden',TWN:'Taiwan',UKR:'Ukraine',USA:'United States'};
export function uniqueSorted<T>(items:T[],cmp?:(a:T,b:T)=>number):T[]{return Array.from(new Set(items)).sort(cmp)}
export function e0Stats(rows:LiteYear[],limit:number){const d=rows.slice(0,limit).filter(x=>x.e0!==null&&x.observed_e0!==null&&x.observed_e0!==undefined&&Number.isFinite(x.e0)&&Number.isFinite(x.observed_e0));if(!d.length)return null;const err=d.map(x=>x.e0!-x.observed_e0!);return {n:err.length,rmse:Math.sqrt(err.reduce((a,e)=>a+e*e,0)/err.length),mae:err.reduce((a,e)=>a+Math.abs(e),0)/err.length};}
export function csvDownload(fileName:string,rows:Record<string,string|number|null|undefined>[]){if(!rows.length)return;const keys=Object.keys(rows[0]);const v=(x:unknown)=>{const s=String(x??'');return /[",\n]/.test(s)?'"'+s.replace(/"/g,'""')+'"':s};const csv=[keys.map(v).join(','),...rows.map(row=>keys.map(k=>v(row[k])).join(','))].join('\r\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download=fileName;a.click();URL.revokeObjectURL(url)}
