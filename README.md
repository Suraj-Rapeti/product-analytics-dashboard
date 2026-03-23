# Product Analytics Dashboard with Automated Insights

An end-to-end analytics dashboard that converts user, order, and event data into actionable business insights.

This project is designed to show product thinking, not only data visualization: each insight includes metric context, interpretation, and suggested action.

## Problem It Solves

Teams often track users, orders, and revenue separately, which makes decisions slow and reactive.

This dashboard combines:

- product funnel behavior
- conversion and order quality
- trend and risk signals
- automated recommendations

to help answer: what is happening, why it is happening, and what to do next.

## Core Features

- Multi-page analytics app: Dashboard, Users, Insights, Settings
- Actionable AI-style insights with severity levels: Critical, Warning, Healthy
- Insight format standardization: Metric -> Interpretation -> Action
- Conversion rate and average order value tracking
- Funnel analysis: `view_product -> add_to_cart -> checkout`
- Critical alert detection (missing funnel, steep order drops, low conversion)
- Per-chart date range controls with custom start/end dates
- Users page pagination with configurable page size
- Realistic data seeding model with user behavior simulation

## Advanced Feature

Independent chart-level time filtering (7D / 30D / 90D / All / Custom) for each major chart.

Why it matters:

- supports deeper comparative analysis
- avoids one global filter hiding chart-specific patterns
- makes dashboard behavior closer to real analytics tools

## Tech Stack

- React 19 (Create React App)
- Recharts
- Tailwind CSS
- Firebase Firestore
- Lucide React icons

## Data Model

- `users`: profile, signup date, segment
- `orders`: user relationship, product, amount, status, quantity, timestamp
- `events`: event type, page, user relationship, timestamp

## Realistic Seed Simulation

The seeding script generates behavior-driven data instead of random isolated records.

Includes:

- real user-to-order relationships
- user segments: active, casual, inactive
- funnel progression with drop-off
- product demand bias and value bias
- cancelled orders and sparse-user edge cases
- temporal patterns (weekend/evening bias + monthly seasonality)

## Getting Started

1. Install dependencies

```bash
npm install
```

2. Create `.env` with Firebase values

Required keys:

- `REACT_APP_FIREBASE_API_KEY`
- `REACT_APP_FIREBASE_AUTH_DOMAIN`
- `REACT_APP_FIREBASE_PROJECT_ID`
- `REACT_APP_FIREBASE_STORAGE_BUCKET`
- `REACT_APP_FIREBASE_MESSAGING_SENDER_ID`
- `REACT_APP_FIREBASE_APP_ID`

3. Run the app

```bash
npm start
```

4. Seed realistic demo data

```bash
npm run seed
```

## Scripts

- `npm start` - start local development server
- `npm run build` - create production build
- `npm test` - run tests
- `npm run seed` - generate realistic Firestore seed data

## Screenshots

Add screenshots to improve portfolio impact:

- `docs/screenshots/dashboard.png`
- `docs/screenshots/insights.png`
- `docs/screenshots/users.png`

Example markdown:

```md
![Dashboard](docs/screenshots/dashboard.png)
![Insights](docs/screenshots/insights.png)
```

## Demo

- Live demo: add your deployment URL here
- Repo: this repository

## Portfolio Highlights

- Strong product analytics framing (not just charts)
- Prioritized insights and actionable recommendations
- Realistic data simulation to stress-test insight logic
- Clear separation of business metrics and behavior metrics
