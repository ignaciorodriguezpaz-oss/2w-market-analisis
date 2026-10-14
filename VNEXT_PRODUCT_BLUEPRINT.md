# 2W Market Analysis VNext — Product Blueprint

## North star
A desktop-first motorcycle market decision system that answers, in order:
1. What is happening now?
2. Where will the current month close?
3. Where will CY / KI close?
4. What does the independent market model expect next?
5. What does Honda assume and how different is it from market reality?
6. Why does the forecast produce that number?
7. What changed since the previous report?
8. What should management watch or decide?

Mobile is a consultation experience; desktop is the primary analytical workspace.

## Non-negotiable UX rules
- Primary charts always render at full available width on desktop.
- No horizontal chart carousels, side-scroll charts or hidden chart pages.
- Filters are global and persistent where semantically valid.
- Progressive disclosure: Executive → Overview → Analysis → Drill-down → Math / Source.
- Honda red is reserved for Honda. Neutral market data uses restrained neutral/blue tones.
- Every number exposes status: FACT / ESTIMATE / EARLY SIGNAL / ASSUMPTION / FORECAST / USER INPUT / PENDING.
- Every analytical object exposes source, cutoff and methodology version.
- Double click / Inspect action on forecast values opens Forecast Inspector.
- Drill-down preserves context and filters; it must not reset the analytical state.

## Final information architecture
### 1. Executive
One-screen management view: MTD, MTF, latest closed month, CY, KI, next KI, Honda share, independent forecast, Honda assumption, forecast delta, top drivers, top risks and What Changed.

### 2. Market
Total → Brand → Group → Segment 1 / Segment 2 → Model.
Includes Daily, Weekly, Monthly, CY, KI, R12, YoY, MoM, historical records, seasonality and rankings. Double-clicking a segment opens its evolution, Top 5, Honda position even when outside Top 5, models, outsiders and forecast.

### 3. Imports & Supply
Total imports, available/imported model count, Group, Brand, Segment, Model, origin, trends, new-model detector, Imports/Registrations, absorption and stock-pressure signals. Imports never enter CAFAM registration totals.

### 4. Forecast
Next month, +3M, +6M, +12M, CY, KI and Multi-KI. Down / Base / Up / Custom. Actual closed periods locked. Future KI monthly paths preserve scenario totals and governed seasonality.

### 5. Scenario Lab & Honda Planning
Independent Forecast and Honda Plan are separate layers. User can enter target market and Honda volume; Honda share is calculated. Required Path solves the inverse problem: given a target CY/KI, calculate the monthly path and assumptions required to reach it. PRB / 1QFC / 2QFC / 3QFC / Close remain immutable versions.

### 6. Intelligence
Macro actuals, macro external forecasts, affordability, credit, FX, activity, imports/supply, new models, competition, regulatory/political events and relevant news. Only evidence that can affect interpretation or forecast is promoted to management view.

### 7. Reports & Outputs
Weekly, Monthly, Niguri/Operational, PRB, 1QFC, 2QFC, 3QFC, KI Close, MTP and Custom. Outputs: Preview, PDF, PowerPoint, Excel Data Pack, Gamma briefing. Reports are purpose-specific; they are not exports of the whole app.

## Forecast Inspector
Inspecting any forecast cell must explain THAT calculation, not a generic methodology page.

Required sections:
- Forecast identity: metric, period, scenario, model version, generated_at.
- Observed baseline: CAFAM / governed actual history used.
- Momentum: latest MoM, YoY, 3M, 6M, R12 and bounded momentum actually used.
- Pace: MTD, comparable business days, daily run-rate, MTF when applicable.
- Seasonality: historical seasonal index and calibration window.
- Macro actual: wage/income, FX, interest rate, inflation/activity/credit where used.
- Macro forward: external forecast source and vintage (e.g. approved consultancy) or model-generated assumption, explicitly distinguished.
- Supply: imports, import/registration balance and supply signal where used.
- Structural: UIO / replacement / saturation / affordability only when implemented.
- Scenario: exact Down/Base/Up/Custom adjustment.
- Formula: exact executed equation with numerical substitutions.
- Attribution: contribution in units and/or percentage points for every adjustment.
- Result: unrounded and displayed forecast.
- Sources: source, period, publication/capture date and cutoff.

No factor may appear in Inspector unless it participates in the executed calculation. Missing inputs must show PENDING rather than simulated values.

## Forecast data lineage
Three categories must never be conflated:
1. OBSERVED — CAFAM, INDEC, BCRA, uploaded imports, etc.
2. EXTERNAL FORECAST — Ecolatina/ABECEB/approved source with vintage.
3. MODEL INFERENCE — values generated internally.

Every forward macro input must identify which category produced it.

## Forecast math governance
Preserve the validated legacy statistical core as a benchmark model, not as unquestioned truth:
Market = 48,619 + 4.37 × Wage Index − 8.39 × FX − 1,032.66 × Interest Rate
with T-3 macro lag, then governed calibration / scenario / reality-control layers.

VNext must compare candidate model versions through time-based backtesting before promoting a model to Official Base. No future information leakage.

## Backtesting / Time Machine
Global Time Machine selects an as-of date and restricts all inputs to information available on that date. Evaluate 1M, 3M, 6M, CY and KI horizons.
Metrics: MAE, MAPE, bias, directional accuracy, interval coverage and error by regime/segment where valid.
Compare at minimum:
- Legacy N-5 / old planning reference where data exists.
- Validated regression benchmark.
- Current dynamic VNext candidate.
A model is promoted only after documented out-of-sample improvement or a clear governance reason.

## What Changed
Every forecast version stores attribution versus the previous version:
CAFAM pace / momentum / seasonality / macro / credit / supply / structural / scenario / methodology change.
The UI must reconcile these contributions to the displayed forecast delta.

## Target → Required Path
Input: target CY or KI total and optional scenario constraints.
Output: monthly path, YoY required, daily pace where applicable, comparison with Base/Down/Up, distance from historical distribution and assumptions required. It must be labelled TARGET PATH, never FORECAST.

## Reporting contracts
### Weekly
Default Friday report window: previous Friday through the Thursday immediately before report Friday, using comparable-day logic where required.
Purpose: what changed this week?
Content: weekly volume/evolution, MTD/MTF, forecast change, brand ranking, Top 15 models, Honda total and model evolution, Segment 1/2 evolution, Top 5 plus Honda if outside Top 5, material import/new-model/macro/news signals, watch next week.

### Monthly Close
Purpose: how did the month close and what does it imply next?
Content: locked CAFAM month, MoM/YoY/comparable days, CY/KI/R12, brands, groups, Top 15 models, segments, Honda, historical records, imports/supply, macro/credit context, forecast accuracy, next-month Down/Base/Up and concise forecast attribution.

### PRB / 1QFC / 2QFC / 3QFC / Close
Purpose: what did we think, what happened, what changed, what do we think now, what does Honda want, how realistic is it, what should we do?
Include Forecast Revision Bridge and only evidence material to the planning revision.

### MTP
Current/next quarter monthly; future KIs totalized. Independent scenarios vs Honda assumptions, segment/model paths and structural assumptions.

## Gamma contract
2W owns facts, calculations, charts, narrative facts and sources. Gamma is a presentation renderer, not the analytical source of truth.
Each report creates a structured Gamma briefing with title, reporting window, slide intent, KPIs, chart data, findings, sources, forecast rationale and management takeaway.

## Report history
Every saved report is immutable and stores source snapshot, forecast version, macro/news/import snapshot, Honda inputs, assumptions and conclusions. Historical reports must not change when current data changes.

## Migration principles: old app + 2W
### Recover from argentina-moto-market
- Faster Executive / management reading grammar.
- Single daily/MTD/MTF engine.
- Forecast-quality and backtesting concepts.
- Planning-cycle separation and immutable versions.
- Richer API/data-service structure for CAFAM, daily evolution, forecast and news.
- Explicit Context → Situation → Actual → Forecast → Honda Plan → Analysis → Decision narrative.

### Keep/improve from 2W
- Data Hub and upload-oriented workflow.
- Import intelligence modules and new-model signals.
- Segment/model evolution tools.
- Global CY/KI/scenario/segment filters.
- Single-report navigation concept, but reduced to seven user-facing chapters.
- Responsive consultation mode.

### Remove/fuse
- Duplicate calculations producing different values for the same metric.
- Dead filters/buttons.
- Repeated methodology text inside analytical views.
- Chart carousels/side scrolling on desktop.
- Modules that show framework/demo values as if connected facts.
- Multiple competing navigation implementations.

## Data consistency tests
- One CAFAM total for each period across every screen/report.
- Closed actuals immutable.
- Down ≤ Base ≤ Up.
- Monthly sums reconcile to CY/KI scenario totals.
- Segment/brand/group/model aggregates reconcile where source coverage permits.
- Honda plan never changes independent forecast.
- Imports never add to registrations.
- Report values equal application values for the same snapshot/version.
- Forecast Inspector formula reproduces displayed forecast within rounding tolerance.

## Delivery gates
1. Inventory + source map.
2. Canonical data contracts.
3. Forecast engine + Inspector + backtest.
4. Executive / Market / Imports.
5. Scenario Lab / Honda Planning.
6. Reporting Center + Gamma briefing.
7. Desktop visual polish + mobile consultation.
8. Functional QA, reconciliation tests and deployment validation.

A gate is not complete because the UI exists; calculations, source lineage and interaction must work end-to-end.