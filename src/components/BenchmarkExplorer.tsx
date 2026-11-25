import {useEffect,useMemo,useState} from 'react';
import {CartesianGrid,Legend,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis} from 'recharts';
import {CheckCircle2,Download,Info} from 'lucide-react';
import {Catalog,CatalogEntry,computeScores,ForecastBundle,loadBundle,loadCatalog,Target} from '../services/benchmarkV04';
const palette=['#326c9a','#ce7e31','#22846c','#986db1','#b45d5d','#747e30'];
export default function BenchmarkExplorer(){
 const [catalog,setCatalog]=useState<Catalog|null>(null),[entryId,setEntryId]=useState(''),[bundle,setBundle]=useState<ForecastBundle|null>(null),[error,setError]=useState('');
 const [target,setTarget]=useState<Target>('e0'),[horizon,setHorizon]=useState(20),[age,setAge]=useState(65),[minAge,setMinAge]=useState(0),[maxAge,setMaxAge]=useState(105),[metric,setMetric]=useState<'rmse'|'mae'>('rmse'),[chosen,setChosen]=useState<string[]>([]);
 useEffect(()=>{loadCatalog().then(c=>{setCatalog(c);if(c.entries.length)setEntryId(c.entries[0].id)}).catch(e=>setError(String(e)))},[]);
 const entry=catalog?.entries.find(e=>e.id===entryId);
 useEffect(()=>{if(!entry)return;let live=true;setBundle(null);setError('');loadBundle(entry).then(b=>{if(!live)return;setBundle(b);setHorizon(b.horizon);setChosen(b.models.map(m=>m.id))}).catch(e=>{if(live)setError(String(e))});return()=>{live=false}},[entryId]);
 const countries=useMemo(()=>Array.from(new Set(catalog?.entries.map(e=>e.country)??[])),[catalog]);
 const sexes=useMemo(()=>catalog?.entries.filter(e=>e.country===entry?.country).map(e=>e.sex).filter((s,i,arr)=>arr.indexOf(s)===i)??[],[catalog,entry]);
 const periods=useMemo(()=>catalog?.entries.filter(e=>e.country===entry?.country&&e.sex===entry?.sex)??[],[catalog,entry]);
 const scores=useMemo(()=>bundle?computeScores(bundle,chosen,target,horizon,minAge,maxAge).sort((a,b)=>a[metric]-b[metric]):[],[bundle,chosen,target,horizon,minAge,maxAge,metric]);
 const chart=useMemo(()=>{
  if(!bundle)return [];
  return Array.from({length:horizon},(_,i)=>{
   const year=bundle.testStart+i;
   const rows=bundle.rows.filter(r=>r[1]===target&&r[2]===year&&(target==='e0'||r[3]===age));
   const out:Record<string,number|null>={year,observed:rows[0]?.[5]??null};
   for(const r of rows)if(chosen.includes(r[0]))out[r[0]]=r[4];
   return out;
  });
 },[bundle,chosen,target,horizon,age]);
 const pick=(predicate:(e:CatalogEntry)=>boolean)=>{const next=catalog?.entries.find(predicate);if(next)setEntryId(next.id)};
 const download=()=>{if(!bundle)return;const header='Model,Target,Year,Age,Forecast,Observed';const lines=bundle.rows.filter(r=>chosen.includes(r[0])&&r[1]===target&&r[2]<bundle.testStart+horizon&&(target==='e0'||r[3]>=minAge&&r[3]<=maxAge)).map(r=>r.join(','));const blob=new Blob([[header,...lines].join('\n')],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`ICoMF_${bundle.id}_${target}_h${horizon}.csv`;a.click();URL.revokeObjectURL(url)};
 if(error)return <div className='panel real-error' role='alert'>{error}</div>;
 if(!catalog||!entry||!bundle)return <div className='panel'>Loading available empirical benchmarks…</div>;
 return <section className='empirical-benchmark' id='benchmark-explorer'>
  <div className='empirical-heading'><div><div className='eyebrow'><CheckCircle2 size={15}/> PRECOMPUTED · OBSERVED DATA</div><h2>Explore mortality forecasting benchmarks</h2><p>Select a published population and compare up to five models, without running R.</p></div><span className='empirical-tag'>Real R forecasts</span></div>
  <div className='panel explorer-controls'>
   <div className='explorer-grid'>
    <label>Country<select value={entry.country} onChange={e=>pick(x=>x.country===e.target.value)}>{countries.map(c=><option key={c}>{c}</option>)}</select></label>
    <label>Population<select value={entry.sex} onChange={e=>pick(x=>x.country===entry.country&&x.sex===e.target.value)}>{sexes.map(s=><option key={s}>{s}</option>)}</select></label>
    <label>Training period<select value={entry.id} onChange={e=>setEntryId(e.target.value)}>{periods.map(p=><option value={p.id} key={p.id}>{p.trainStart}–{p.trainEnd}</option>)}</select></label>
    <label>Forecast horizon<select value={horizon} onChange={e=>setHorizon(Number(e.target.value))}>{Array.from({length:bundle.horizon},(_,i)=>i+1).map(h=><option key={h} value={h}>{h} {h===1?'year':'years'}</option>)}</select></label>
   </div>
   <div className='explorer-control-row'><div><label className='field-label'>Target</label><div className='toggle'><button className={target==='e0'?'active':''} onClick={()=>setTarget('e0')}>Life expectancy e₀</button><button className={target==='mx'?'active':''} onClick={()=>setTarget('mx')}>Mortality rates mₓ</button></div></div><div><label className='field-label'>Ranking metric</label><select value={metric} onChange={e=>setMetric(e.target.value as 'rmse'|'mae')}><option value='rmse'>RMSE</option><option value='mae'>MAE</option></select></div>{target==='mx'&&<div><label className='field-label'>Chart age</label><input type='number' min={0} max={105} value={age} onChange={e=>setAge(Math.max(0,Math.min(105,Number(e.target.value)||0)))}/></div>}</div>
   <label className='field-label'>Models</label><div className='empirical-checks'>{bundle.models.map(m=><label key={m.id}><input type='checkbox' checked={chosen.includes(m.id)} onChange={()=>setChosen(prev=>prev.includes(m.id)?prev.filter(x=>x!==m.id):[...prev,m.id])}/>{m.name}</label>)}</div>
   {target==='mx'&&<div className='explorer-control-row age-range'><label>Evaluate ages from<input type='number' min={0} max={105} value={minAge} onChange={e=>setMinAge(Math.max(0,Math.min(105,Number(e.target.value)||0)))}/></label><label>to<input type='number' min={0} max={105} value={maxAge} onChange={e=>setMaxAge(Math.max(0,Math.min(105,Number(e.target.value)||0)))}/></label><span className='note'>Age range affects ranking; chart shows one selected age.</span></div>}
  </div>
  <div className='panel real-chart-panel'><h3>{target==='e0'?'Life expectancy at birth':`Age-specific mortality rate · ${age===105?'105+':age}`}</h3><p className='muted real-chart-desc'>{entry.country} · {entry.sex} · train {entry.trainStart}–{entry.trainEnd} · observed evaluation {bundle.testStart}–{bundle.testStart+horizon-1}</p><div className='chart-area'><ResponsiveContainer width='100%' height={355}><LineChart data={chart}><CartesianGrid stroke='#e7ecf1' strokeDasharray='3 4'/><XAxis dataKey='year' type='number' domain={['dataMin','dataMax']} allowDecimals={false}/><YAxis width={76} domain={['auto','auto']} tickFormatter={(v:number)=>target==='mx'?v.toPrecision(2):v.toFixed(1)}/><Tooltip formatter={(v,name)=>[typeof v==='number'?v.toPrecision(target==='mx'?5:6):String(v),name==='observed'?'Observed':bundle.models.find(m=>m.id===name)?.name??name]}/><Legend formatter={v=>v==='observed'?'Observed':bundle.models.find(m=>m.id===v)?.name??v}/><Line type='linear' dataKey='observed' name='observed' stroke='#192f47' strokeWidth={3} dot={false} isAnimationActive={false}/>{bundle.models.filter(m=>chosen.includes(m.id)).map((m,i)=><Line key={m.id} type='linear' dataKey={m.id} name={m.id} stroke={palette[i%palette.length]} strokeWidth={2} strokeDasharray='5 3' dot={false} isAnimationActive={false}/>)}</LineChart></ResponsiveContainer></div><p className='note'>Prediction intervals are unavailable in these R exports (L95/U95 = NA). The chart is a fixed-origin out-of-sample comparison.</p></div>
  <div className='panel real-metrics'><div className='section-heading'><div><h3>Predictive accuracy · ranked by {metric.toUpperCase()}</h3><p className='muted'>Lower is better. {target==='mx'?`Equal weight per age-year cell, ages ${minAge}–${maxAge}.`:'Error measured in years.'}</p></div><button className='btn ghost' onClick={download}><Download size={16}/> Download selected forecasts</button></div>{minAge>maxAge&&target==='mx'?<p role='alert' className='error'>Choose a valid age range.</p>:<div className='table-wrap'><table><thead><tr><th>Rank</th><th>Model</th><th>RMSE</th><th>MAE</th><th>Evaluated cells</th></tr></thead><tbody>{scores.map((s,i)=><tr key={s.id}><td>{i+1}</td><td className='table-strong'>{s.name}</td><td>{s.rmse.toPrecision(5)}</td><td>{s.mae.toPrecision(5)}</td><td>{s.n}</td></tr>)}</tbody></table>{!scores.length&&<p className='note'>Select at least one available model.</p>}</div>}<p className='note'><Info size={13} style={{verticalAlign:'middle'}}/> Descriptive fixed-origin errors; no Diebold–Mariano significance test. Horizon selections reuse the same full forecasts.</p></div>
  <p className='empirical-provenance'>Data: Human Mortality Database, provided as Deaths_1x1 and Exposures_1x1 (November 2026). Life-table conventions: aₓ = 0.5 and open age 105+. Model outputs derived in R. Availability is limited to uploaded, successfully computed benchmarks; the full worldwide run has not yet been imported.</p>
 </section>;
}
