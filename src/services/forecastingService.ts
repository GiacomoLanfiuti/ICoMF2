import {ContestConfig, ContestResult, ForecastPoint, ModelScore, datasets} from '../data/mockData';
const hash=(s:string)=>Array.from(s).reduce((v,c)=>((v*31+c.charCodeAt(0))>>>0),7);
export function demoContest(config:ContestConfig):ContestResult {
 const country=datasets.find(d=>d.id===config.datasetId);
 const countryShift=({swe:0,fra:1.5,ita:1,jpn:2.5,usa:-1.5} as Record<string,number>)[config.datasetId]??0;
 const sexShift=config.sex==='Female'?3.5:config.sex==='Male'?-2:0;
 const start=Math.max(country?.years[0]??1900,config.trainEnd-29);
 const end=Math.min(country?.years[1]??2023,config.testEnd);
 const base=(y:number)=>config.target==='e0' ? 64+countryShift+sexShift+.225*(y-1950)+.75*Math.sin((y-1950)/9) : Math.max(.00008,.013*Math.exp(-.017*(y-1950))*(1+config.minAge/95));
 const points:ForecastPoint[]=[];
 for(let year=start; year<=end;year++){
   const observation=base(year)+(config.target==='e0'?.23*Math.sin(year*1.17):base(year)*.035*Math.sin(year*.9));
   const row:ForecastPoint={year,observed:year>config.trainEnd?observation:null,historical:year<=config.trainEnd?observation:null};
   for(const id of config.modelIds){
     const offset=((hash(id)%17)-8)/13;
     const dt=Math.max(0,year-config.trainEnd);
     row[id]=year>=config.trainEnd?(config.target==='e0'?base(year)+offset*(.16+dt*.033)+.12*Math.sin(dt/3+offset):Math.max(.00001,base(year)*(1+offset*(.09+dt*.013)))):null;
   }
   points.push(row);
 }
 const scores:ModelScore[]=config.modelIds.map((id,i)=>({modelId:id,rmse:+(.36+(hash(id)%23)/34+(config.target==='mx'?.15:0)).toFixed(3),mae:+(.27+(hash(id)%19)/42).toFixed(3),coverage:config.interval&&id!=='linear'?78+(hash(id)%17):null,dm:i===0?'Reference':'Illustrative',runtime:+(1.2+(hash(id)%25)/10).toFixed(1)}));
 return {points,scores,config,label:'SIMULATED RESULTS · NOT SCIENTIFIC FORECASTS'};
}
export const demoLeaderboard=(target:'e0'|'mx')=>demoContest({...({modelIds:['lc','lcrw','rh','cbd','plat','hu','linear'],datasetId:'swe',target,sex:'Female',method:'fixed',minAge:0,maxAge:100,trainStart:1950,trainEnd:2000,testStart:2001,testEnd:2020,horizon:10,metric:'RMSE',interval:true,runtime:60} as ContestConfig)});
export function exportCSV(rows:Record<string,unknown>[],filename:string){if(!rows.length)return;const keys=Object.keys(rows[0]);const escape=(v:unknown)=>'"'+String(v??'').replaceAll('"','""')+'"';const csv=[keys.join(','),...rows.map(r=>keys.map(k=>escape(r[k])).join(','))].join('\n');downloadFile(csv,filename,'text/csv;charset=utf-8');}
export function downloadFile(contents:string,filename:string,type:string){const blob=new Blob([contents],{type});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);}
