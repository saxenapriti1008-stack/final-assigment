# Gym Review — Full-Stack Final Assignment

A full-stack app to browse gyms, add locations, and post star ratings with comments. Built with **React**, **Node/Express**, **PostgreSQL**, **Firebase Authentication**, and **Docker**.

| | URL (fill in after deploy) |
|---|---|
| **Frontend (Vercel)** | `https://YOUR-APP.vercel.app` |
| **Backend (Render)** | `https://YOUR-API.onrender.com` |
| **GitHub repo** | `https://github.com/YOUR-USER/gym-review` |

## Project structure

```
project/
├── backend/          # Express API + Firebase session cookies
├── frontend/         # React (Vite)
├── docker/           # docker-compose.yml
└── .github/workflows/deploy.yml
```

## Prerequisites

- [Node.js 20+](https://nodejs.org/)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (for containerized run)
- [Firebase](https://console.firebase.google.com/) project with **Email/Password** auth enabled

## Credentials (already wired from parent project)

If you use the shared `priti project` Firebase project (`fir-oauth-login`), run once after clone:

```powershell
cd project\scripts
.\sync-creds-from-parent.ps1
```

This copies `server/firebase/firebase-service-account.local.json` and `VITE_FIREBASE_*` from `..\..\..\.env` into `backend/.env`, `frontend/.env`, and `backend/firebase/`. These files are **gitignored** — do not commit them.

## 1. Firebase setup

1. Create a Firebase project → **Authentication** → enable **Email/Password** (already enabled on the shared project).
2. **Project settings** → Your apps → Web app → copy config into `frontend/.env`.
3. **Project settings** → **Service accounts** → Generate new private key → minify JSON to one line for `backend/.env` as `FIREBASE_SERVICE_ACCOUNT_JSON`.
4. **Authentication** → **Settings** → **Authorized domains** → add your Vercel domain and `localhost`.

## 2. Run locally (without Docker)

### Database

```powershell
docker run -d --name gymreviews-db -e POSTGRES_USER=gymuser -e POSTGRES_PASSWORD=gympass -e POSTGRES_DB=gymreviews -p 5432:5432 postgres:16-alpine
```

### Backend

```powershell
cd backend
copy .env.example .env
# Edit .env — set FIREBASE_SERVICE_ACCOUNT_JSON and DATABASE_URL
npm install
npm run db:migrate
npm run dev
```

### Frontend

```powershell
cd frontend
copy .env.example .env
# Set VITE_* Firebase vars and VITE_API_URL=http://localhost:3000
npm install
npm run dev
```

Open http://localhost:5173

## 3. Run with Docker

From the `docker` folder:

```powershell
cd docker
# Optional: set Firebase JSON for real login in containers
# $env:FIREBASE_SERVICE_ACCOUNT_JSON = '{"type":"service_account",...}'
docker compose up --build
```

| Service | URL |
|---------|-----|
| Frontend | http://localhost:8080 |
| API | http://localhost:3000 |
| Health | http://localhost:3000/health |

## 4. Tests

```powershell
cd backend
$env:TEST_MODE = "true"
$env:DATABASE_URL = "postgresql://gymuser:gympass@localhost:5432/gymreviews"
npm test
```

CI runs the same tests on push via GitHub Actions (`.github/workflows/deploy.yml`).

## 5. Deploy to production

### Backend + database (Render)

1. Create **PostgreSQL** on Render → copy **Internal Database URL**.
2. Create **Web Service** from repo, root directory `backend`.
3. Environment variables:

   | Variable | Value |
   |----------|--------|
   | `DATABASE_URL` | Render Postgres URL |
   | `CLIENT_ORIGIN` | `https://your-app.vercel.app` |
   | `FIREBASE_SERVICE_ACCOUNT_JSON` | One-line service account JSON |
   | `COOKIE_SECURE` | `true` |
   | `NODE_ENV` | `production` |

4. Build command: `npm install`  
   Start command: `node src/db/migrate.js && node src/index.js`

### Frontend (Vercel)

1. Import repo, root directory `frontend`.
2. Environment variables: all `VITE_FIREBASE_*` and `VITE_API_URL=https://your-api.onrender.com`.
3. Redeploy after backend URL is known.

### Post-deploy checklist

- [ ] Firebase authorized domains include Vercel URL
- [ ] `CLIENT_ORIGIN` matches Vercel URL exactly (no trailing slash)
- [ ] `COOKIE_SECURE=true` on Render
- [ ] CORS is **not** `*` — only your frontend origin
- [ ] Login → add gym → write review works on live URLs

---

## Security checklist (production)

| # | Item | How we meet it |
|---|------|----------------|
| 1 | No secrets in repo | `.env` in `.gitignore`; use Render/Vercel env vars and GitHub Secrets |
| 2 | CORS restricted | `cors({ origin: CLIENT_ORIGIN, credentials: true })` |
| 3 | No tokens in localStorage | Firebase ID token sent once to API; **httpOnly** session cookie stored |
| 4 | `withCredentials` | All API calls use `credentials: 'include'` |
| 5 | Docker excludes secrets | `.dockerignore` blocks `.env` and `node_modules` from host |
| 6 | HTTPS backend | Render provides HTTPS by default |
| 7 | Auth callbacks | Firebase authorized domains use deployed URL, not localhost |

---

## Reflection questions

### 1. Why did you choose your deployment platform?

We chose **Render** for the API and PostgreSQL because the course recommended it, the free tier includes managed Postgres, and deploys from GitHub are straightforward. **Vercel** hosts the React frontend with fast global CDN and simple environment variable management. Alternatives considered: **Railway** (similar to Render), **Fly.io** (more ops overhead), and **Netlify** instead of Vercel (equally viable for static SPAs).

### 2. What challenges did you face with Docker, and how did you solve them?

- **Database readiness**: The API started before Postgres was ready → added a `healthcheck` on the `db` service and `depends_on: condition: service_healthy`.
- **Build-time env for Vite**: Frontend needs `VITE_*` at **build** time → passed as Docker `ARG`/`ENV` in the frontend Dockerfile.
- **CORS in Docker**: Frontend on port 8080 required `CLIENT_ORIGIN=http://localhost:8080` in compose.

### 3. How are environment variables and secrets handled locally vs production?

**Local:** `.env` files (not committed) for `DATABASE_URL`, Firebase JSON, and `VITE_*` keys. **Production:** Render and Vercel dashboard env vars; GitHub Actions uses `TEST_MODE=true` so CI never needs real Firebase secrets. Service account JSON is always a single-line secret, never baked into images.

### 4. What would you do differently with one more week?

Add review editing, image uploads for gyms, pagination, e2e tests with Playwright against the deployed URL, and optional auto-deploy in GitHub Actions using provider tokens.

### 5. How did you ensure authentication works after deployment?

Firebase **session cookies** (`createSessionCookie` / `verifySessionCookie`) with `httpOnly`, `secure`, and `sameSite` flags; `CLIENT_ORIGIN` set to the Vercel URL; Firebase authorized domains updated; all authenticated requests use `credentials: 'include'`.

---

## API overview

| Method | Path | Auth |
|--------|------|------|
| GET | `/health` | No |
| POST | `/api/auth/session` | No (body: `{ idToken }`) |
| POST | `/api/auth/logout` | No |
| GET | `/api/auth/me` | Yes |
| GET | `/api/gyms` | No |
| POST | `/api/gyms` | Yes |
| GET | `/api/reviews/gym/:id` | No |
| POST | `/api/reviews/gym/:id` | Yes |

---

## Group / presentation notes

- Demo: `docker compose up` locally → then live Vercel/Render URLs → register/login → add gym → review.
- Share repo with teacher before **June 4** presentation.
