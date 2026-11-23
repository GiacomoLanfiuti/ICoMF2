export type Target = 'e0' | 'mx';
export type Method = 'fixed' | 'rolling';
export type Sex = 'Female' | 'Male' | 'Total';
export interface Model { id: string; name: string; authors: string; year: string; family: string; description: string; paper?: string; code?: string }
export interface Dataset { id: string; name: string; country: string; years: [number, number]; ages: [number, number]; description: string }
export interface ContestConfig { modelIds: string[]; datasetId: string; target: Target; sex: Sex; method: Method; minAge: number; maxAge: number; trainStart: number; trainEnd: number; testStart: number; testEnd: number; horizon: number; metric: 'RMSE' | 'MAE' | 'Coverage'; interval: boolean; runtime: number }
export interface ForecastPoint { year: number; observed: number | null; historical: number | null; [modelId: string]: number | null }
export interface ModelScore { modelId: string; rmse: number; mae: number; coverage: number | null; dm: string; runtime: number }
export interface ContestResult { points: ForecastPoint[]; scores: ModelScore[]; config: ContestConfig; label: string }
export const models: Model[] = [
 {id:'lc',name:'Lee–Carter',authors:'Lee & Carter',year:'1992',family:'Age–period',description:'Classic age–period mortality model with a time index.',paper:'https://doi.org/10.1080/01621459.1992.10475265'},
 {id:'lcrw',name:'Lee–Carter (RW variant)',authors:'Lee & Carter',year:'1992',family:'Age–period',description:'Lee–Carter with a random-walk projection of the time index.'},
 {id:'rh',name:'Renshaw–Haberman',authors:'Renshaw & Haberman',year:'2006',family:'Cohort',description:'Extension of age–period modeling with a cohort component.'},
 {id:'cbd',name:'Cairns–Blake–Dowd',authors:'Cairns, Blake & Dowd',year:'2006',family:'Old-age',description:'A model developed for mortality at higher ages.'},
 {id:'plat',name:'Plat',authors:'Plat',year:'2009',family:'Age–period–cohort',description:'Flexible mortality forecasting framework.'},
 {id:'hu',name:'Hyndman–Ullah',authors:'Hyndman & Ullah',year:'2007',family:'Functional',description:'Functional time-series approach to mortality forecasting.'},
 {id:'linear',name:'Linear regression benchmark',authors:'ICoMF demo',year:'—',family:'Baseline',description:'Simple illustrative baseline used for interface demonstrations.'}
];
export const datasets: Dataset[] = [
 {id:'swe',name:'Sweden',country:'Sweden',years:[1900,2023],ages:[0,110],description:'Synthetic demonstration series labeled Sweden; NOT HMD data.'},
 {id:'fra',name:'France',country:'France',years:[1900,2023],ages:[0,110],description:'Synthetic demonstration series labeled France; NOT HMD data.'},
 {id:'ita',name:'Italy',country:'Italy',years:[1900,2023],ages:[0,110],description:'Synthetic demonstration series labeled Italy; NOT HMD data.'},
 {id:'jpn',name:'Japan',country:'Japan',years:[1900,2023],ages:[0,110],description:'Synthetic demonstration series labeled Japan; NOT HMD data.'},
 {id:'usa',name:'United States',country:'United States',years:[1900,2023],ages:[0,110],description:'Synthetic demonstration series labeled United States; NOT HMD data.'}
];
export const defaultConfig: ContestConfig={modelIds:['lc','rh','cbd'],datasetId:'swe',target:'e0',sex:'Female',method:'fixed',minAge:0,maxAge:100,trainStart:1950,trainEnd:2000,testStart:2001,testEnd:2020,horizon:10,metric:'RMSE',interval:true,runtime:60};
export const unresolved=['Official leaderboard training/testing periods','Rolling-window design: expanding vs sliding','Aggregation of errors over ages and horizons','Age weighting and open-age intervals','Life-table conventions for e0','Prediction interval levels and proper interval scoring','Diebold–Mariano testing, dependence, and multiplicity','Benchmark eligibility and failed-model policy','Multi-population comparisons and data versioning'];
