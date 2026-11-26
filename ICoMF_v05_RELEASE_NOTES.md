# ICoMF v0.5 — Worldwide Contest & Forecasting

## What changed
- The public **Contest** page now includes the worldwide HMD e₀ benchmark explorer with the available population/sex pairs, fixed training start/end, and custom out-of-sample horizons. The leaderboard uses the same real results.
- A new **Forecasting** page follows Contest in the main navigation and displays R-precomputed e₀ trajectories to 2080 for selectable HMD populations, training starts, and models.
- Model-specific L95/U95 bounds are drawn only when published, as dashed upper/lower limits. They are **not confidence intervals** and do not cover parameter/model uncertainty.
- Experimental custom-model and custom-dataset controls remain visibly simulated; no uploads or execution are activated.
- Historic mₓ and custom age-range rankings are not included in `icomf-lite`. Existing R outputs preserve the full details for possible future releases.

## Deploying
1. Extract this ZIP and upload **the contents** of `ICoMF2-main` into the root of the `ICoMF2` GitHub repository.
2. Include the whole `public/icomf-lite` directory. Do not add `ICoMF2-main` as a nested directory.
3. Commit and check GitHub Actions build/deployment. Verify `/ICoMF2/#/forecasting` and `/ICoMF2/#/contest`.

## Source & limitations
Data: HMD combined 1x1 Deaths and Exposures, November 2026. Predictions computed offline in R. The ICoMF life table uses aₓ=0.5 and age 105+ open. Backtest rankings are specific to the selected holdout, not global model superiority. The forecasts are conditional model extrapolations, not policy projections. For the log-Poisson Lee–Carter model, available intervals are conditional simulation intervals and exclude parameter/model selection uncertainty. Some populations may have only a subset of models/configurations.

## Testing
`npm install && npm test && npm run build`. The archive was validated with Node tests, but the build was not reproduced in this environment due to unavailable npm dependencies.
