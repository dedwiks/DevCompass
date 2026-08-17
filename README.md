# DevPulse AI

DevPulse AI turns a GitHub repository's raw activity into an engineering standup that writes itself. Point it at a repo, and it reads real commits, pull requests, and issues over a chosen time window, then has an LLM synthesize that activity into a structured update — what shipped, what's in flight, and what's stuck — instead of an engineer manually reconstructing the week from memory.

It's built as an AI-native product rather than an AI feature bolted onto a CRUD app: the model is given only grounded, real activity data and instructed never to fabricate beyond it, its output is parsed into a strict schema with a graceful fallback when the model misbehaves, and every summary is persisted so a team's history of progress is queryable over time, not lost in a chat scrollback.

## How it works

```
React (Vite) frontend  →  Express/Node API  →  GitHub REST API   (recent commits, PRs, issues)
                                             →  Gemini API        (structured synthesis)
                                             →  MongoDB           (persisted summary history)
```

1. **Track a repo** — add any `owner/name` to watch.
2. **Fetch, don't guess** — the backend pulls only the requested time window (1/3/7 days) directly from GitHub's API, deduplicating pull requests out of the issues feed and shaping everything down to what's actually relevant.
3. **Synthesize, don't hallucinate** — that data is handed to Gemini with an explicit instruction to summarize only what's present, returned as strict JSON (highlights / in-progress / blockers / narrative). Malformed model output is caught and degrades gracefully instead of erroring out.
4. **Persist and revisit** — every summary is stored against its repo, building a running history of a team's actual velocity over time.

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
