# ICoMF v0.4 – Five-model precomputed benchmark explorer

## Included real data

This archive includes **one** fully computed benchmark: Sweden, Total, training 1960–2000, test 2001–2020, from the user's `output.zip` produced by the R benchmark engine. It includes five methods: Naive, Poisson, LeeCarter, LeeCarterPoisson and HyndmanUllah. It **does not include** the later, local worldwide batch. Do not advertise global coverage until that directory has been supplied and processed.

## What changed

- `public/benchmarks/catalog-v04.json`: index of actually available precomputed benchmarks.
- `public/benchmarks/v04/SWE_Total_1960_2000.json`: 10,700 real prediction/observation rows (five models, 20 yearly e0 forecasts, 20*106 yearly mx forecasts).
- `src/services/benchmarkV04.ts`: data reader, validation and browser-side RMSE/MAE calculator.
- `src/components/BenchmarkExplorer.tsx`: real benchmark configuration (country, population, baseline, horizon 1–20, models, outcome, metric, age/age range), chart, ranking, selected-data CSV export.
- `src/vite-env.d.ts`: Vite ImportMeta types for CI.
- Contest and Leaderboard use the new component. The old synthetic contest builder remains separately and **explicitly marked as simulated**, for future workflows.
- The model/dataset submission preview no longer invokes a file picker, reads or transmits any files.

## Upload to GitHub

Upload all content **inside** the `ICoMF2-main/` folder, not the parent folder, into the root of the `ICoMF2` repository. Commit and check GitHub Actions build and Pages deployment. The workflow already handles the `/ICoMF2/` base URL.

## Review and known limits

- All five models were found in the pilot R results. All 10,700 row entries are finite. Independent RMSE calculations reproduce the earlier R metrics at horizon 20.
- Existing Node built-in test suite: 7/7 passed.
- **Vite build not tested in this environment**: npm dependency installation timed out here. GitHub Actions must validate compilation.
- Intervals are unavailable; no uncertainty ribbons or DM test are claimed.
- HMD period files contain fractional adjusted deaths. `StMoMo`'s Poisson likelihood warns about non-integers; model interpretation and resulting fits should be reviewed before formal publication.
- Australia's 1980–2000 male Poisson and log-Poisson forecast e0 failed because their age-104 mx exceeds 2 and leads to invalid qx with ax=0.5; these output files were not included in this release. No silent clipping of model forecasts was performed.
- e0 uses the current ICoMF life-table convention (ax=0.5, 105+ open); not official HMD e0.
- Model rankings are specific to selected configuration and loss function.
- The rest of the HMD forecast results must be added later from the **full local `output/` folder**; the `output.zip` supplied here is only the Sweden pilot.
