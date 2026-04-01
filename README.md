# AeroDefence Wire

A production-style, analyst-oriented aerospace and defence intelligence dashboard built as a single-page app with Next.js + TypeScript + Tailwind CSS.

## Stack

- Next.js App Router (client-side dashboard experience)
- TypeScript
- Tailwind CSS
- Zustand for local state
- Recharts for trend visualizations
- `next-themes` for dark/light mode

## Features Implemented

- Desktop-first analyst layout with sidebar navigation and top command/search bar
- Views: Dashboard, Live Feed, Topics, Companies, Watchlists, Saved, Settings
- Dark mode by default with light mode toggle
- Mock scoring model (`priority`, `relevance`, `trust`) with transparent rules
- Feed filtering/sorting controls and high-signal + press-release handling
- Article detail drawer with metadata and "Why it matters"
- Watchlist model and saved/read interactions
- Seeded realistic defence/aerospace sample content and source mix

## Local Setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project Structure

- `src/app/page.tsx` - primary SPA shell and views
- `src/types/news.ts` - typed domain models
- `src/data/mock-data.ts` - realistic seed data
- `src/lib/scoring.ts` - scoring + headline dedupe helper
- `src/lib/feed.ts` - filtering/sorting pipeline
- `src/store/use-wire-store.ts` - global dashboard state

## How to connect real news sources later

1. Add an ingestion module per source class:
   - RSS feeds
   - News APIs
   - Defence trade outlets
   - Company newsroom feeds
   - Government/MoD publications
2. Normalize incoming payloads into the `Article` interface in `src/types/news.ts`.
3. Run each normalized item through `scoreArticle()` in `src/lib/scoring.ts`.
4. Replace `src/data/mock-data.ts` with:
   - `GET /api/news` route fetching normalized records, or
   - direct client fetch from a trusted aggregation endpoint.
5. Persist read/saved/watchlist/preferences to local DB or managed backend.
6. Add scheduled ingestion + deduplication (headline key + semantic similarity).

This keeps the existing UI and state architecture intact while swapping mock data for live pipelines.
