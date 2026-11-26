import {useEffect,useMemo,useState} from 'react';
import {CartesianGrid,Legend,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {CheckCircle2,Download,Info} from 'lucide-react';
import {countryName,csvDownload,e0Stats,LiteIndex,LiteIndexEntry,LitePopulation,loadLiteIndex,loadLitePopulation,nameOfModel,palette,uniqueSorted} from '../services/liteData';
export default function LiteContest(){
 const [index,setIndex]=useState<LiteIndex|null>(null),[entry,setEntry]=useState<LiteIndexEntry|null>(null),[pop,setPop]=useState<LitePopulation|null>(null),[error,setError]=useState(''),[loading,setLoading]=useState(true);
 const [start,setStart]=useState(1960),[end,setEnd]=useState(2000),[horizon,setHorizon]=useState(20),[metric,setMetric]=useState<'rmse'|'mae'>('rmse'),[chosen,setChosen]=useState<string[]>([]);
 useEffect(()=>{loadLiteIndex().then(i=>{setIndex(i);setEntry(i.populations.find(p=>p.population==='SWE'&&p.sex==='Total')??i.populations[0]??null)}).catch(e=>{setError(String(e));setLoading(false)})},[]);
 useEffect(()=>{if(!entry)return;let alive=true;setPop(null);setLoading(true);setError('');loadLitePopulation(entry).then(p=>{if(alive){setPop(p);setLoading(false)}}).catch(e=>{if(alive){setError(String(e));setLoading(false)}});return()=>{alive=false}},[entry]);
 const starts=useMemo(()=>uniqueSorted(pop?.backtests.map(t=>t.training_start)??[],(a,b)=>a-b),[pop]);
 useEffect(()=>{if(starts.length&&!starts.includes(start))setStart(starts[0])},[starts,start]);
 const ends=useMemo(()=>uniqueSorted(pop?.backtests.filter(t=>t.training_start===start).map(t=>t.training_end)??[],(a,b)=>a-b),[pop,start]);
 useEffect(()=>{if(ends.length&&!ends.includes(end))setEnd(ends[ends.length-1])},[ends,end]);
 const runs=useMemo(()=>pop?.backtests.filter(t=>t.training_start===start&&t.training_end===end)??[],[pop,start,end]);
 const models=useMemo(()=>uniqueSorted(runs.map(r=>r.model)),[runs]);
 useEffect(()=>{setChosen(models)},[pop,start,end]);
 const maxH=Math.max(1,...runs.map(r=>r.e0.length));
 useEffect(()=>{setHorizon(h=>Math.min(Math.max(h,1),maxH))},[maxH]);
 const matching=useMemo(()=>runs.filter(r=>chosen.includes(r.model)),[runs,chosen]);
 const scores=useMemo(()=>matching.map(r=>{const stats=e0Stats(r.e0,horizon);return stats?{id:r.model,label:nameOfModel(r.model),...stats}:null}).filter((s):s is {id:string;label:string;n:number;rmse:number;mae:number}=>s!==null).sort((a,b)=>(a[metric]??Infinity)-(b[metric]??Infinity)),[matching,horizon,metric]);
 const rows=useMemo(()=>Array.from({length:horizon},(_,i)=>{const year=end+i+1;const row:Record<string,number|null>={year,observed:null};for(const run of matching){const x=run.e0.find(p=>p.Year===year);if(x){row[run.model]=x.e0;if(row.observed===null&&typeof x.observed_e0==='number')row.observed=x.observed_e0}}return row}),[end,horizon,matching]);
 function changeCountry(country:string){if(!index)return;setEntry(index.populations.find(e=>e.population===country&&e.sex===entry?.sex)??index.populations.find(e=>e.population===country)??null)}
 function changeSex(sex:string){if(!index||!entry)return;setEntry(index.populations.find(e=>e.population===entry.population&&e.sex===sex)??entry)}
 const countries=uniqueSorted(index?.populations.map(e=>e.population)??[]);
 const sexes=index?.populations.filter(e=>e.population===entry?.population).map(e=>e.sex)??[];
 return <section className='empirical-benchmark' id='benchmark-explorer'>
  <div className='empirical-heading'><div><div className='eyebrow'><CheckCircle2 size={15}/> HMD · PRECOMPUTED FORECASTS</div><h2>International mortality forecasting contest</h2><p>Real fixed-origin holdout comparisons. Select a population, training window, horizon and models.</p></div><span className='empirical-tag'>{index?.populations.length??'…'} population/sex datasets</span></div>
  {error&&<div className='panel real-error' role='alert'>{error}</div>}
  <div className='panel explorer-controls'><div className='explorer-grid'>
   <label>HMD population<select value={entry?.population??''} disabled={!index} onChange={e=>changeCountry(e.target.value)}>{countries.map(x=><option key={x} value={x}>{countryName[x]??x} · {x}</option>)}</select></label>
   <label>Sex<select value={entry?.sex??''} disabled={!entry} onChange={e=>changeSex(e.target.value)}>{sexes.map(s=><option key={s}>{s}</option>)}</select></label>
   <label>Training start<select value={start} disabled={!starts.length} onChange={e=>setStart(Number(e.target.value))}>{starts.map(y=><option key={y}>{y}</option>)}</select></label>
   <label>Training end / origin<select value={end} disabled={!ends.length} onChange={e=>setEnd(Number(e.target.value))}>{ends.map(y=><option key={y}>{y}</option>)}</select></label>
  </div><div className='explorer-control-row'>
   <label>Out-of-sample horizon<select value={horizon} disabled={!runs.length} onChange={e=>setHorizon(Number(e.target.value))}>{Array.from({length:maxH},(_,i)=>i+1).map(h=><option key={h} value={h}>{h} year{h===1?'':'s'} · to {end+h}</option>)}</select></label>
   <label>Ranking criterion<select value={metric} onChange={e=>setMetric(e.target.value as 'rmse'|'mae')}><option value='rmse'>RMSE · years</option><option value='mae'>MAE · years</option></select></label>
  </div><label className='field-label'>Compare models</label><div className='empirical-checks'>{models.map(m=><label key={m}><input type='checkbox' checked={chosen.includes(m)} onChange={()=>setChosen(old=>old.includes(m)?old.filter(x=>x!==m):[...old,m])}/>{nameOfModel(m)}</label>)}</div>
  <p className='note'>Available combinations reflect successful R exports. This lightweight dataset contains life expectancy e₀, not age-specific mortality-rate curves. The experimental builder below remains a separate simulation.</p></div>
  {loading?<div className='panel'>Loading empirical population…</div>:runs.length===0?<div className='panel'>No benchmark for this training configuration.</div>:<>
   <div className='panel real-chart-panel'><h3>Out-of-sample life expectancy · e₀</h3><p className='muted real-chart-desc'>{entry?.population} · {entry?.sex} · training {start}–{end} · evaluation {end+1}–{end+horizon}</p><div className='chart-area'><ResponsiveContainer width='100%' height={355}><LineChart data={rows}><CartesianGrid stroke='#e7ecf1' strokeDasharray='3 4'/><XAxis dataKey='year' type='number' domain={['dataMin','dataMax']} allowDecimals={false}/><YAxis width={65} domain={['auto','auto']} tickFormatter={(v:number)=>v.toFixed(1)}/><Tooltip formatter={(value,name)=>[typeof value==='number'?value.toFixed(3):'—',name==='observed'?'Observed':nameOfModel(String(name))]}/><Legend formatter={v=>v==='observed'?'Observed':nameOfModel(v)}/><Line type='linear' dataKey='observed' stroke='#192f47' strokeWidth={3} dot={false} isAnimationActive={false}/>{matching.map(r=><Line key={r.model} type='linear' dataKey={r.model} stroke={palette[r.model]??'#607b97'} strokeWidth={2} dot={false} isAnimationActive={false}/>)}</LineChart></ResponsiveContainer></div><p className='note'>Observed values and model forecasts use the same ICoMF life-table convention (aₓ=0.5; 105+ open age).</p></div>
   <div className='panel real-metrics'><div className='section-heading'><div><h3>Model ranking · {metric.toUpperCase()}</h3><p className='muted'>Calculated from the selected horizon; lower error is better.</p></div><button className='btn ghost' onClick={()=>csvDownload(`ICoMF_${entry?.population}_${entry?.sex}_${start}_${end}_h${horizon}_e0.csv`,rows.map(r=>({Year:r.year,Observed:r.observed,...Object.fromEntries(matching.map(t=>[t.model,r[t.model]??null]))})))}><Download size={16}/> Download CSV</button></div><div className='table-wrap'><table><thead><tr><th>Rank</th><th>Model</th><th>RMSE</th><th>MAE</th><th>Years</th></tr></thead><tbody>{scores.map((s,i)=><tr key={s.id}><td>{i+1}</td><td className='table-strong'>{s.label}</td><td>{s.rmse?.toFixed(4)}</td><td>{s.mae?.toFixed(4)}</td><td>{s.n}</td></tr>)}</tbody></table>{!scores.length&&<p className='note'>Select a model to see the ranking.</p>}</div><p className='note'><Info size={13} style={{verticalAlign:'middle'}}/> Rankings apply to this population, training period and evaluation horizon only. No inferential significance is claimed.</p></div>
  </>}
  <p className='empirical-provenance'>Source: Human Mortality Database, November 2026 combined 1×1 extracts. Computed in R. Retrospective errors use life expectancy e₀. Prediction intervals in the separate Forecasting page are model-specific and not available for all models.</p>
 </section>
}
