import {useEffect,useMemo,useState} from 'react';
import {CartesianGrid,Legend,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {Download,Info,CheckCircle2,AlertCircle} from 'lucide-react';
import {Benchmark,benchmarkCSV,loadSwedenBenchmark} from '../services/benchmarkService';
type Target='e0'|'mx';
export default function RealBenchmark({compact=false,initialTarget='e0'}:{compact?:boolean;initialTarget?:Target}){
 const [b,setB]=useState<Benchmark|null>(null);
 const [error,setError]=useState('');
 const [target,setTarget]=useState<Target>(initialTarget);
 const [age,setAge]=useState(65);
 const [metric,setMetric]=useState<'rmse'|'mae'>('rmse');
 const [chosen,setChosen]=useState<string[]>(['poisson','lc']);
 useEffect(()=>{let active=true;loadSwedenBenchmark().then(x=>{if(active)setB(x)}).catch(e=>{if(active)setError(String(e))});return()=>{active=false}},[]);
 const source=target==='e0'?b?.e0:b?.mx;
 const chartData=useMemo(()=>{
  if(!b||!source)return [];
  const rows=source.filter(x=>target==='e0'||x.age===age);
  return Array.from({length:20},(_,i)=>{
   const year=2001+i;
   const perYear=rows.filter(r=>r.year===year);
   const obs=perYear[0]?.observed??null;
   return {year,observed:obs,...Object.fromEntries(perYear.filter(r=>chosen.includes(r.model)).map(r=>[r.model,r.forecast]))};
  });
 },[b,source,age,target,chosen]);
 const scores=b?.metrics.filter(m=>m.target===target&&chosen.includes(m.model)).sort((x,y)=>x[metric]-y[metric])??[];
 if(error)return <div className='panel real-error'><AlertCircle size={18}/><span>{error}. Check that the benchmark JSON was uploaded to the public/benchmarks folder.</span></div>;
 if(!b)return <div className='panel'>Loading published Sweden benchmark…</div>;
 return <section className={'empirical-benchmark '+(compact?'empirical-compact':'')}>
  <div className='empirical-heading'><div><div className='eyebrow'><CheckCircle2 size={15}/> REAL OUT-OF-SAMPLE BENCHMARK</div><h2>Sweden · Poisson vs Lee–Carter</h2><p>Observed mortality data · Total population · training 1960–2000 · forecast 2001–2020 · fixed origin</p></div><span className='empirical-tag'>Empirical results · R output</span></div>
  <div className='empirical-controls'>
   <div><label className='field-label'>Forecast target</label><div className='toggle'><button className={target==='e0'?'active':''} onClick={()=>setTarget('e0')}>Life expectancy e₀</button><button className={target==='mx'?'active':''} onClick={()=>setTarget('mx')}>Mortality rates mₓ</button></div></div>
   {target==='mx'&&<div className='empirical-age'><label className='field-label' htmlFor='real-age'>Age (105 = 105+)</label><input id='real-age' type='number' min={0} max={105} value={age} onChange={e=>setAge(Math.max(0,Math.min(105,Number(e.target.value))))}/></div>}
   <div><label className='field-label'>Compare models</label><div className='empirical-checks'>{b.models.map(m=><label key={m.id}><input type='checkbox' checked={chosen.includes(m.id)} onChange={()=>setChosen(old=>old.includes(m.id)?old.length>1?old.filter(v=>v!==m.id):old:[...old,m.id])}/>{m.name}</label>)}</div></div>
  </div>
  <div className='panel real-chart-panel'><h3>{target==='e0'?'Life expectancy at birth · e₀':`Age-specific mortality rate · age ${age===105?'105+':age}`}</h3><p className='muted real-chart-desc'>Out-of-sample comparison against actual observations, 2001–2020</p><div className='chart-area'><ResponsiveContainer width='100%' height={340}><LineChart data={chartData} margin={{top:15,right:20,bottom:6,left:8}}><CartesianGrid stroke='#e7ecf1' strokeDasharray='3 4'/><XAxis dataKey='year' type='number' domain={[2001,2020]} tick={{fontSize:12}} allowDecimals={false}/><YAxis width={72} domain={['auto','auto']} tick={{fontSize:12}} tickFormatter={(v:number)=>target==='mx'?Number(v).toPrecision(2):Number(v).toFixed(1)}/><Tooltip formatter={(value,name)=>[Number(value).toFixed(target==='mx'?6:3),name==='observed'?'Observed':name==='lc'?'Lee–Carter':'Poisson baseline']} labelFormatter={v=>`Year ${v}`}/><Legend formatter={v=>v==='observed'?'Observed':v==='lc'?'Lee–Carter (1992)':'Poisson baseline'}/><Line dataKey='observed' stroke='#172d44' strokeWidth={2.5} dot={false} isAnimationActive={false}/>{chosen.includes('poisson')&&<Line dataKey='poisson' stroke='#cb823c' strokeWidth={2} dot={false} strokeDasharray='6 3' isAnimationActive={false}/>} {chosen.includes('lc')&&<Line dataKey='lc' stroke='#327cb1' strokeWidth={2} dot={false} strokeDasharray='6 3' isAnimationActive={false}/>}</LineChart></ResponsiveContainer></div><p className='note'>Prediction intervals are not available in the uploaded model output (L95/U95 = NA). No uncertainty ribbons are shown.</p></div>
  <div className='panel real-metrics'><div className='section-heading'><div><h3>Predictive accuracy</h3><p className='muted'>{target==='e0'?'Errors in years of remaining life':'Unweighted errors in age-specific mortality rates across all ages 0–105+ and 2001–2020'} · lower is better</p></div><label className='metric-select'>Rank by <select value={metric} onChange={e=>setMetric(e.target.value as 'rmse'|'mae')}><option value='rmse'>RMSE</option><option value='mae'>MAE</option></select></label></div><div className='table-wrap'><table><thead><tr><th>Rank</th><th>Model</th><th>RMSE</th><th>MAE</th><th>Intervals</th></tr></thead><tbody>{scores.map((s,i)=><tr key={s.model}><td>{i===0?<span className='rank'>1</span>:i+1}</td><td className='table-strong'>{b.models.find(m=>m.id===s.model)?.name}</td><td>{s.rmse.toPrecision(5)}</td><td>{s.mae.toPrecision(5)}</td><td>N/A</td></tr>)}</tbody></table></div><p className='note'><Info size={13} style={{verticalAlign:'middle'}}/> Ranking is specific to this one benchmark, not a global leaderboard. Formal Diebold–Mariano p-values are not reported for a single fixed-origin, mixed-horizon forecast.</p></div>
  {!compact&&<div className='result-actions'><a className='btn ghost' download href={benchmarkCSV('forecast_e0.csv')}><Download size={16}/> e₀ forecasts CSV</a><a className='btn ghost' download href={benchmarkCSV('forecast_mx.csv')}><Download size={16}/> mₓ forecasts CSV</a><a className='btn ghost' download href={benchmarkCSV('metrics.csv')}><Download size={16}/> Metrics CSV</a></div>}
  <p className='empirical-provenance'>Source: user-supplied Sweden mortality data derived from HMD files. Forecast outputs and errors supplied from an R analysis. Life table: ages 0–104 plus open 105+, as implemented in the analysis. Input data and full R reproducibility package are not included in this static site. Other populations and configurations are not yet computed.</p>
 </section>;
}
