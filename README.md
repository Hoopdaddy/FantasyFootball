# Fantasy Football Draft Assistant

A single-user, mobile-first web app for live snake drafts: screenshot your draft board, confirm the picks, and get a ranked "who should I take next" recommendation built from your actual roster needs and league scoring — not generic best-player-available rankings.

Built from the v1.0 PRD (screenshot ingestion, roster-construction-aware recommendations, K/DEF/TE draft-stage rules, positional scarcity).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # add your ANTHROPIC_API_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Go through **League Setup** once (roster slots, scoring, teams, draft position — pre-populated with the scoring profile from the PRD), then use the **Draft Board** during your draft.

## How it works

- **League Setup** (`/setup`) — roster slots (TE/K/DEF hard-capped at 1), number of teams, draft position, rounds, and the full custom scoring profile. Persisted to `localStorage` — no login, single user, per PRD §5.1 / §7.
- **Screenshot ingestion** (`/draft`, `ScreenshotUpload`) — uploads an image to `POST /api/parse-screenshot`, which sends it to Claude's vision API with a platform-agnostic extraction prompt, fuzzy-matches names against the local player pool (`src/lib/match.ts`), and returns a review list you confirm/correct before it's added to state (PRD §5.2).
- **Player database** (`src/lib/players.ts`) — **placeholder seed data**: realistically-shaped ADP/rank/projection data for ~180 players, not a live feed. Swap this file for a real FantasyPros/ESPN/Yahoo export closer to draft day (see below).
- **Scoring engine** (`src/lib/scoring.ts`) — projects each player's season points against your league's exact scoring settings, not generic PPR.
- **Recommendation engine** (`src/lib/recommend.ts`) — the core differentiator (PRD §5.4): value-over-replacement per position, positional scarcity remaining, roster-fit multipliers for open starting slots vs. FLEX vs. bench, hard K/DEF suppression until the final rounds (overridable), a hard TE lock once your starting TE slot is filled, and "run" warnings when a position is being drafted unusually fast relative to what's left.
- **Dashboard** (`/draft`) — roster view, all-drafted list (with undo), manual add/correct with autocomplete, and a big-button "My Turn" mode for one-handed use mid-draft.

## Replacing the placeholder player data

`src/lib/players.ts` builds its player pool from small hand-maintained roster pools plus tier-based stat-line generators — it's intentionally easy to regenerate. To use real data before your draft:

1. Export a consensus ADP + rankings list (e.g. FantasyPros' ADP export) as CSV/JSON.
2. Replace the `pools` object in `buildPlayers()` with your real player list, or write a small script that maps your export into the `Player` shape in `src/lib/types.ts`.
3. Keep `projection` (a `ProjectedStatLine`) as realistic as you can — it drives every points/VORP calculation.

## Notes

- No live scraping during the draft — draft-day speed depends on local roster-state logic only (PRD §9). The only network call during a live draft is the screenshot → Claude vision parse.
- Auction drafts, multi-user leagues, and waiver/trade tools are explicitly out of scope for v1 (PRD §10).
