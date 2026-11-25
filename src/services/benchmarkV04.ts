export type Target = 'e0'|'mx';
export interface CatalogEntry {id:string;pop:string;country:string;sex:string;trainStart:number;trainEnd:number;horizon:number;models:string[];file:string}
export interface Catalog {schemaVersion:number;entries:CatalogEntry[]}
export type ForecastRow = [string,Target,number,number,number,number];
export interface ForecastBundle {id:string;pop:string;sex:string;trainStart:number;trainEnd:number;testStart:number;horizon:number;models:{id:string;name:string}[];rows:ForecastRow[];note:string}
const base = `${import.meta.env.BASE_URL}benchmarks/`;
export async function loadCatalog():Promise<Catalog>{
 const r=await fetch(`${base}catalog-v04.json`);
 if(!r.ok)throw new Error(`Cannot load ICoMF benchmark catalogue (${r.status})`);
 const data=await r.json() as Catalog;
 if(data.schemaVersion!==1||!Array.isArray(data.entries))throw new Error('Unsupported catalogue format');
 return data;
}
export async function loadBundle(entry:CatalogEntry):Promise<ForecastBundle>{
 const r=await fetch(`${base}${entry.file}`);
 if(!r.ok)throw new Error(`Cannot load ${entry.id} (${r.status})`);
 const b=await r.json() as ForecastBundle;
 if(b.id!==entry.id||!Array.isArray(b.rows))throw new Error('Invalid benchmark file');
 return b;
}
export function computeScores(b:ForecastBundle,selected:string[],target:Target,horizon:number,minAge:number,maxAge:number){
 const out: {id:string;name:string;rmse:number;mae:number;n:number}[]=[];
 for(const m of b.models.filter(m=>selected.includes(m.id))){
  const relevant=b.rows.filter(r=>r[0]===m.id&&r[1]===target&&r[2]>=b.testStart&&r[2]<b.testStart+horizon&&(target==='e0'||(r[3]>=minAge&&r[3]<=maxAge)));
  const errors=relevant.map(r=>r[4]-r[5]).filter(Number.isFinite);
  if(errors.length===0)continue;
  out.push({id:m.id,name:m.name,rmse:Math.sqrt(errors.reduce((a,e)=>a+e*e,0)/errors.length),mae:errors.reduce((a,e)=>a+Math.abs(e),0)/errors.length,n:errors.length});
 }
 return out;
}
