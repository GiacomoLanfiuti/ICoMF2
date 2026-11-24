# ICoMF v0.3 — empirical Sweden benchmark integration

This release adds a published empirical fixed-origin Sweden (Total) benchmark to the existing demonstration website. The dashboard and leaderboard fetch precomputed R results from `public/benchmarks/`; **no R code runs on GitHub Pages**.

**Empirical configuration:** training 1960–2000; forecast origin 2000; test 2001–2020; mortality ages 0–104 and 105+; Lee–Carter (1992) and Poisson baseline. Outputs include observed holdout values, forecast values, and RMSE/MAE. Prediction interval values are absent (`NA`). No formal Diebold–Mariano p-value is reported because the 20 target years correspond to different forecast horizons from a single origin.

**Important:** Other countries and arbitrary contest settings in the separate experimental builder are still synthetic, and the site labels them as such. This is not an official global leaderboard. The HMD raw source data are not redistributed in this repository; the attached forecast CSVs are research outputs supplied by the user. Preserve HMD attribution when reusing the figures.

## Add a new benchmark

1. Run the models privately in R and export age-specific and life expectancy forecasts alongside observed holdout values.
2. Validate `Year`, `Age`, model labels, metric calculation, training and testing metadata and the population being forecast.
3. Produce a JSON file following `public/benchmarks/sweden_total_1960_2000_h20.json` and add it to `public/benchmarks/index.json`.
4. Add a UI selector when additional benchmark datasets are available; do not silently relabel one country's results as another's.

## Run locally

```sh
npm install
npm test
npm run build
npm run dev
```

## Deploy

The existing GitHub Actions workflow publishes Vite's `dist` to GitHub Pages. In GitHub Settings → Pages, choose GitHub Actions. Vite base must be `/ICoMF2/`.

---

# ICoMF — Infinite Contest of Mortality Forecasting

An interactive **scientific prototype** for exploring mortality forecasting methods. **All displayed data, rankings, and predictions are simulated, not HMD observations or genuine model fits.**

## Run locally

Install Node.js 20+ and run:

```bash
npm install
npm run dev
```

Open the URL shown by Vite. To run structural tests and create a production build:

```bash
npm test
npm run build
```

## Publish on GitHub Pages

1. Push these files to the `main` branch of `GiacomoLanfiuti/ICoMF` (or upload them using the GitHub web interface).
2. Go to **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Open **Actions** and check the `Deploy ICoMF to GitHub Pages` workflow.
4. After success, visit `https://GiacomoLanfiuti.github.io/ICoMF/`.

The Vite base path is `/ICoMF/`. For a different repository name or custom-domain root, update `base` in `vite.config.ts` accordingly.

**Public GitHub Pages requires a public repository on GitHub Free.** To keep source private, use a separate hosting option instead.

## Architecture

- `src/data/`: TypeScript models and synthetic demonstration catalog
- `src/services/`: deterministic mock forecast service and export utilities
- `src/components/`: reusable forecast chart and score table
- `src/pages/`: Contest, Library, Leaderboard, About, Documentation
- `.github/workflows/deploy.yml`: automated GitHub Pages publishing

## Planned next steps

1. Verify UI on GitHub Pages, improve the prototype.
2. Add authentication and persistence with an actual backend.
3. Connect a sandboxed R computational service and standardized model adapters.
4. Define and implement scientific evaluation protocols and public benchmarks.

This prototype **does not** execute uploaded R code, store private submissions, authenticate users, or conduct real statistical inference.
