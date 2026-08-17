# DevPulse AI

AI-generated standup summaries from a GitHub repo's real recent activity (commits, PRs, issues) — a scaled-down clone of Troopr's "Check-ins" feature.

## Stack

- **Frontend:** React (Vite) — `client/`
- **Backend:** Node + Express — `server/`
- **Database:** MongoDB (Atlas free tier)
- **AI:** Google Gemini API
- **Data source:** GitHub REST API

## Local setup

### 1. Backend

```
cd server
cp .env.example .env
```

Fill in `server/.env`:

| Var | Where to get it |
|---|---|
| `MONGODB_URI` | MongoDB Atlas → create free M0 cluster → "Connect" → driver connection string |
| `GITHUB_TOKEN` | GitHub → Settings → Developer settings → Personal access tokens → generate (no scopes needed for public repos) |
| `GEMINI_API_KEY` | [Google AI Studio](https://aistudio.google.com/apikey) |
| `CORS_ORIGIN` | `http://localhost:5173` for local dev |

```
npm install
npm run dev
```

Server runs on `http://localhost:5000`. Hitting `/health` should return `{"ok":true}` even without a DB connection; any `/api/*` route returns `503` immediately if MongoDB isn't connected (by design — no hanging requests).

### 2. Frontend

```
cd client
cp .env.example .env   # VITE_API_URL=http://localhost:5000
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

## Deploying (free tier)

1. **MongoDB Atlas** — create the M0 cluster, add a database user, allow access from anywhere (0.0.0.0/0) for Render's dynamic IPs, copy the connection string.
2. **Render** (backend) — new Web Service pointing at `server/`, build command `npm install`, start command `npm start`. Set env vars: `MONGODB_URI`, `GITHUB_TOKEN`, `GEMINI_API_KEY`, `CORS_ORIGIN` (set this to your Vercel URL once you have it).
3. **Vercel** (frontend) — import the repo, root directory `client/`, set `VITE_API_URL` to your Render URL.
4. Once both are live, update `CORS_ORIGIN` on Render to the final Vercel URL and redeploy.

Note: Render's free tier spins down after inactivity — the first request after idle can take 30-60s while it wakes up. The UI shows a "waking up the server…" state on the generate button to make this less confusing during a demo.
