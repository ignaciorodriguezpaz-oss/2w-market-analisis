# 2W Market Analysis VNext — Release Candidate

Status: **FEATURE-COMPLETE RC / QA GREEN**

Branch: `vnext`
Backup before rebuild: `snapshot-pre-vnext-2026-10-14`
Production/main is intentionally untouched.

## Product contract implemented

### Executive
- Market MTD / MTF / KI / CY decision view.
- Honda Plan kept separate from independent market forecast.
- Forecast version bridge / What Changed.
- Governed source/cutoff/status labels.

### Market
- History and current structure from governed Pivot assets.
- Drill-down: Total → Brand → Group → Segmento 1 / Segmento 2 → Model.
- Honda visibility rule even outside Top 5.
- Monthly evolution, shares, rankings, outsiders, records.
- Daily monitor when SIOMAA detail is connected; CAFAM MTD fallback without invented daily allocation.
- Friday→Thursday weekly comparison when daily detail exists.
- Structural forecast by Brand / Group / Segment / Model, explicitly labeled MODEL INFERENCE and reconciled to total market forecast.

### Imports & Supply
- Imports remain separate from registrations.
- Monthly imports vs registrations, import/registration coverage and supply state.
- Brand, model, origin, import type, latest month, new-model watch.
- Group/segment views activate only with governed granular mapping; no inferred mapping when absent.
- Newer authenticated live imports take precedence over static August enrichment.

### Forecast
- Down / Base / Up / User.
- Open month MTF, CY, current KI and five-KI horizon.
- Current KI actuals locked.
- Every forecast month can open the exact Forecast Inspector.
- Inspector uses the same engine object as the forecast: equation, exact inputs, attribution, external factors, source and cutoff.
- Target → Required Path with exact KI reconciliation.
- User Scenario is a transparent bounded sensitivity, not a probability.

### Validation
- Strict no-look-ahead Time Machine.
- Walk-forward backtest.
- 1M / 3M / 6M validation with WAPE, median APE, bias, MAE and directional accuracy.
- Historical macro/supply vintages are not backfilled when unavailable.
- Runtime health checks verify engine, scenario ordering, KI reconciliation, Multi-KI, assets and reporting libraries.

### Honda Commercial Planning
- Independent Market Forecast vs Honda Market Plan vs Honda Volume Plan.
- PRB → 1QFC → 2QFC → 3QFC → KI Close framework.
- Known planning views: PRB 762k, 1QFC 762k, 2QFC 850k; later cycles remain pending until supplied.
- Honda 30% strategic requirement calculated on independent future KI bases.
- Required Path remains separate from Honda Plan.

### Product
- Honda product selector and competitive set.
- Segment-first competitor view.
- Price-validity guardrails.
- Import/new-model signal matching.
- Unsupported specs / same-cutoff affordability remain explicitly pending instead of fabricated.

### Geography
- CAFAM province detail for current period and same-month previous year.
- Volume, share and YoY provincial view.
- No geographic forecast is fabricated without a governed methodology/source.

### Intelligence
- Macro / credit planning outlook separated from observed facts.
- Fresh official/current context layer.
- News and launch radar with source/date/category/impact.
- Rumors/watch signals are not converted into forecast inputs automatically.
- Affordability stays source-gated until same-cutoff price/income data is available.

### Reporting Center
- Weekly.
- Monthly Close.
- PRB / 1QFC / 2QFC / 3QFC / KI Close.
- MTP.
- Custom Report builder.
- PDF/print.
- Native XLSX Data Pack: Summary + KI Path + exact report tables + governance Read Me.
- Native PPTX 16:9 export with 2W/Honda visual identity.
- Gamma briefing workflow.
- Frozen report history through authenticated Supabase report-history endpoint.

### Data Update Center
- XLS / XLSX / CSV ingestion.
- Preview and governed dataset routing.
- Daily registration and imports handling.
- Master/Pivot mapping support.
- Authenticated live status / imports / weekly feeds when available.

## UX contract
- Desktop-first analytical layout.
- Responsive mobile consultation view.
- Charts are width:100%, bounded to their card and do not horizontally scroll.
- Mobile filter strip may scroll independently; charts may not.
- Honda uses Honda red; market remains neutral.
- Global filters keep Segmento 1 and Segmento 2 separate.

## Automated release gates

GitHub Actions `VNext QA` checks:
1. JavaScript syntax for every VNext module.
2. Forecast engine invariants.
3. Down ≤ Base ≤ Up.
4. KI / CY reconciliation.
5. Five KIs × 12 months reconciliation.
6. Required Path reconciliation.
7. Strict Time Machine/backtest behavior.
8. 1M / 3M / 6M validation metrics.
9. Required product module wiring.
10. Required CSS wiring.
11. Full-width/no-horizontal-scroll chart rule.
12. Inspector / Required Path engine hooks.
13. Honda visibility logic.
14. Imports-vs-registrations capability.
15. XLSX and PPTX export hooks.
16. Repository asset references.

Latest validated CI state at RC creation: **GREEN**.

## Remaining external release gate

### Vercel deployment
The Vercel connector can see the target team but currently reports no linked Git project/origin connection for this repository. Creating the Git-backed VNext project returned an authorization/connection error.

Therefore:
- no production URL is claimed;
- no public deployment was created as a workaround;
- `main` was not replaced;
- VNext remains on its isolated branch until a private Vercel project can be linked and visually tested.

Once the Git/Vercel origin connection exists, the final deployment gate is:
1. create private preview from `vnext`;
2. run desktop/mobile visual QA;
3. test auth and connected live feeds;
4. test XLSX/PPTX/PDF downloads in browser;
5. verify report-history persistence;
6. promote only after approval.

## Governance
- CAFAM governs registrations total.
- Pivot/master governs history and structural mapping.
- Imports are supply signals, never registrations.
- Official actuals, external forecasts and model inference remain visibly distinct.
- Locked Actuals are never overwritten by forecast.
- Honda planning assumptions never silently change the independent market forecast.
