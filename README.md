# CueMovie

A web app that helps you pick a random movie from your watchlist.

Upload the CSV export from your **IMDb** or **Letterboxd** account, and the app enriches your list with data from TMDb — then picks a random movie for you.

Your list is saved in the browser, so it's still there next time you open it!

---

## Features <sup><small>As of May 1, 2026</small></sup>

- Upload a watchlist CSV from IMDb or Letterboxd.
- Automatically enriches movies with ratings, genres, runtime, posters, and overviews via the [TMDb API](https://www.themoviedb.org/).
- Filter your list by rating, runtime, release year, genre, and date added.
- Pick a random movie from your filtered list.
- **Deck mode** — queue up multiple picks and shuffle them to choose a winner.
- Click any result to open a detail modal with poster and overview.
- Persists your list in the browser (no account or server needed).

---

## Supported CSV Formats

| Source     | How to export                          |
| ---------- | -------------------------------------- |
| IMDb       | Profile → Watchlist → Export           |
| Letterboxd | Profile → Watchlist → Export Watchlist |

**NOTE:** IMDb allows exporting any list you own, not just your watchlist.

Other CSV files may also work if they have a `Title`/`Name` and `Year` columns (TMDb enrichment will still be attempted).

---

## Tech Stack <sup><small>As of May 1, 2026</small></sup>

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — dev server and build tool
- [PapaParse](https://www.papaparse.com/) — CSV parsing
- [Framer Motion](https://www.framer.com/motion/) — animations
- [Vercel Analytics](https://vercel.com/analytics) — usage analytics

---

## Requirements

- [Node.js](https://nodejs.org/) v20 or higher
- npm (comes with Node.js)

---

## Setup

```bash
# 1. Clone the repo
git clone <your-repo-url>
cd Movie-Selector/watchlist-app

# 2. Install dependencies
npm install

# 3. Start the app
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## How It Works

1. **Upload** — Select a CSV file exported from IMDb or Letterboxd
2. **Enrich** — The app fetches metadata for each movie from TMDb (rating, genres, runtime, poster, overview)
3. **Filter** — Narrow your list by rating, runtime, release year, genre, or date added
4. **Pick** — Click "Pick a film" to get a random movie from your filtered list
5. **Deck mode** — Optionally queue multiple picks and run a shuffle to crown a winner
6. **Persist** — Your enriched list is saved in localStorage so it survives page refreshes

To load a new list, simply upload a new CSV — it replaces the previous one.
