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
