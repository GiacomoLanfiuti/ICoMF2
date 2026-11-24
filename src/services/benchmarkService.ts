export interface BenchmarkModel {id:string;sourceId:string;name:string}
export interface BenchmarkRow {model:string;year:number;age?:number;forecast:number;observed:number;lower:number|null;upper:number|null}
export interface BenchmarkMetric {model:string;target:'e0'|'mx';rmse:number;mae:number}
export interface Benchmark {
 id:string;country:string;population:string;source:string;
 training:{start:number;end:number};testing:{start:number;end:number};
 origin:number;horizon:number;openAge:string;ageRange:[number,number];method:'fixed';
 predictionInterval:string;officialLeaderboard:boolean;status:'empirical';
 models:BenchmarkModel[];e0:BenchmarkRow[];mx:BenchmarkRow[];metrics:BenchmarkMetric[];
}
export const benchmarkRoot = `${import.meta.env.BASE_URL}benchmarks/`;
export async function loadSwedenBenchmark():Promise<Benchmark> {
 const r=await fetch(`${benchmarkRoot}sweden_total_1960_2000_h20.json`);
 if(!r.ok) throw new Error(`Unable to load published benchmark (${r.status})`);
 const b=await r.json() as Benchmark;
 if(b.id!=='swe-total-1960-2000-h20'||b.e0.length!==40||b.mx.length!==4240)throw new Error('Benchmark data failed integrity checks.');
 return b;
}
export function benchmarkCSV(name:'forecast_mx.csv'|'forecast_e0.csv'|'metrics.csv'){
 return `${benchmarkRoot}sweden_total_1960_2000_h20/${name}`;
}
