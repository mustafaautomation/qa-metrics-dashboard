# QA Metrics Dashboard

![CI](https://github.com/mustafaautomation/qa-metrics-dashboard/actions/workflows/dashboard.yml/badge.svg)
![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)
![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)

A real-time QA metrics dashboard that ingests JUnit XML test results and renders actionable intelligence — pass rate trends, suite-level breakdowns, browser coverage, failure rankings, and per-run history — all in a single dark-themed interface that auto-refreshes every 30 seconds.

Most QA teams run hundreds of automated tests in CI but have no centralized view of quality trends over time. This dashboard solves that by turning raw JUnit XML output into interactive charts and summary cards that surface degradation early, identify flaky tests, and give leadership the visibility they need.

---

## Features

- **Summary cards** — total tests, pass rate, failure count, and average duration at a glance.
- **Pass rate trend** — line chart tracking pass rate across the last 10 CI runs, color-coded by threshold.
- **Suite breakdown** — grouped bar chart comparing passed vs. failed counts for each test suite (Auth, Inventory, Cart, Checkout, API).
- **Browser coverage** — stacked horizontal bar chart showing results across Chromium, Firefox, WebKit, and Mobile.
- **Top failing tests** — ranked list of the most frequently failing test cases with failure frequency bars and last-failed timestamps.
- **Recent runs table** — per-run history with total/passed/failed counts, pass rate, duration, and color-coded status badges.
- **Auto-refresh** — the dashboard polls the API every 30 seconds for live updates without page reload.
- **Mock data fallback** — ships with realistic mock data so the dashboard works out of the box, no test results required.

---

## Tech Stack

| Component | Purpose |
|---|---|
| **Node.js + Express** | Lightweight HTTP server and REST API |
| **Chart.js 4** | All interactive charts (line, bar, stacked bar) |
| **Tailwind CSS** | Utility-first styling via CDN |
| **fast-xml-parser** | JUnit XML ingestion and parsing |

---

## Quick Start

```bash
git clone https://github.com/mustafaautomation/qa-metrics-dashboard.git
cd qa-metrics-dashboard
npm install
npm start
```

The dashboard will be available at `http://localhost:3000`. On first launch it renders mock data. To display real results, drop JUnit XML files into the `reports/` directory.

For development with auto-reload:

```bash
npm run dev
```

---

## Configuration

| Variable | Default | Description |
|---|---|---|
| `PORT` | `3000` | HTTP server port |
| `DATA_DIR` | `./results` | Directory for data storage |

Copy `.env.example` to `.env` and adjust values as needed.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/api/metrics` | Returns the full metrics payload (summary, history, suites, browsers, top failures, recent runs) |
| `GET` | `/` | Serves the static dashboard UI |

The `/api/metrics` endpoint returns JSON with the following structure:

```json
{
  "summary": { "total": 156, "passed": 147, "failed": 7, "skipped": 2, "passRate": 94.2, "avgDuration": 28.3, "lastRun": "..." },
  "history": [ { "run": "#042", "date": "Feb 24", "total": 156, "passed": 147, "failed": 7, "duration": 28.3, "passRate": 94.2 } ],
  "suites": [ { "name": "Auth", "total": 24, "passed": 23, "failed": 1 } ],
  "browsers": [ { "name": "Chromium", "passed": 48, "failed": 3 } ],
  "topFailures": [ { "test": "checkout: order total validation", "suite": "Checkout", "failures": 5, "lastFailed": "Feb 24" } ],
  "recentRuns": [ { "run": "#042", "date": "Feb 24", "total": 156, "passed": 147, "failed": 7, "passRate": 94.2, "status": "partial" } ]
}
```

---

## CI Integration

Drop your test runner's JUnit XML output into the `reports/` directory and the dashboard will automatically parse it instead of mock data.

**Playwright:**

```ts
// playwright.config.ts
reporter: [['junit', { outputFile: 'reports/results.xml' }]]
```

**Cypress:**

```json
"reporter": "junit",
"reporterOptions": { "mochaFile": "reports/results-[hash].xml" }
```

**Jest:**

```json
reporters: [["jest-junit", { "outputDirectory": "reports" }]]
```

---

## Project Structure

```
qa-metrics-dashboard/
  public/
    index.html            Static dashboard UI
    js/
      dashboard.js        Client-side rendering and Chart.js logic
  src/
    server.js             Express server and /api/metrics endpoint
    parser.js             JUnit XML parsing logic
    mockData.js           Fallback mock data for demo mode
  reports/                Drop JUnit XML files here (gitignored)
  .github/
    workflows/
      dashboard.yml       CI workflow
```

---

Built by [Quvantic](https://quvantic.com)
