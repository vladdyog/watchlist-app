# Movie Selector

A (currently) minimal web app that helps you pick a random movie from your watchlist.

All you need to do is upload the CSV export from your **IMDb** or **Letterboxd** account, and the app will pick a random movie for you.

Your list is saved in the browser, so it's still there next time you open it!

---

## Features

As of April 22, 2026:

- Upload a watchlist CSV from IMDb or Letterboxd.
- Pick a random movie from your list.
- Persist your list in the browser. (no account or server needed)

---

## Supported CSV Formats

Currently the app supports CSVs from IMDb or Letterboxd accounts.

| Source     | How to export                          |
| ---------- | -------------------------------------- |
| IMDb       | Profile → Watchlist → Export           |
| Letterboxd | Profile → Watchlist → Export Watchlist |

**NOTE:** IMDb allows exporting any list you own, not just your watchlist.

Other CSV files may also work if they have a `Title` or `Name` column.

---

## Tech Stack

As of April 22, 2026:

- [React](https://react.dev/) + [TypeScript](https://www.typescriptlang.org/)
- [Vite](https://vitejs.dev/) — dev server and build tool
- [PapaParse](https://www.papaparse.com/) — CSV parsing

---

## Requirements

As of April 22, 2026:

- [Node.js](https://nodejs.org/) v18 or higher
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
2. **Parse** — The app reads and normalizes the CSV into a list of movies
3. **Pick** — Click "Pick a movie" to get a random one from your list
4. **Persist** — Your list is saved in localStorage so it survives page refreshes

To load a new list, simply upload a new CSV — it replaces the previous one.
