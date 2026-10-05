# Deploying KPop Universe (free beta)

A $0 setup that scales later. Two deployables: the Rails API and the React (Vite) SPA.

## Stack
- **Frontend (SPA)** → **Cloudflare Pages** (free, global CDN)
- **API (Rails)** → **Render** free web service (sleeps after ~15 min idle; wakes in ~30s)
- **Postgres** → **Neon** free tier (persistent)
- **Edge protection** → **Cloudflare** (free DDoS + Bot Fight Mode + Turnstile CAPTCHA)
- **App-level rate limiting** → **Rack::Attack** (already wired; active in prod via solid_cache)

When you outgrow free: the repo is **Kamal-ready** (`config/deploy.yml`) — deploy to a cheap/free VPS (DigitalOcean, Hetzner, or Oracle Cloud's free ARM VM) with `bin/kamal deploy`.

---

## 1. Database (Neon)
1. Create a free Neon project → copy the connection string (`postgres://…`).
2. **Single-DB gotcha:** this app's `config/database.yml` defines separate `cache`, `queue`, and `cable` databases (Rails 8 "Solid" trifecta). Managed free Postgres usually gives you **one** database, so consolidate them into the primary DB for the free path (they just become extra tables). See the "Consolidate Solid DBs" snippet below. (On a VPS with full Postgres you can instead create all four DBs and skip this.)

## 2. API (Render)
1. New → **Web Service** → connect this repo, root = `backend/`, runtime = Docker (uses the existing `Dockerfile`).
2. Set env vars (below). `DATABASE_URL` = the Neon string.
3. Deploy. Render runs the release command / `db:prepare` to migrate. Jobs run in-Puma (`SOLID_QUEUE_IN_PUMA`), so no separate worker is needed for the beta.
4. Note the service URL, e.g. `https://kpop-api.onrender.com`.

### Required backend env vars
| Var | Value |
|---|---|
| `RAILS_MASTER_KEY` | from `backend/config/master.key` |
| `DATABASE_URL` | Neon connection string |
| `FRONTEND_URL` | your Pages URL, e.g. `https://kpopuniverse.pages.dev` (drives CORS **and** ActionCable origins) |
| `APP_HOST` | the API host, e.g. `kpop-api.onrender.com` (so Active Storage image URLs resolve) |
| `AWS_ACCESS_KEY_ID` / `AWS_SECRET_ACCESS_KEY` / `AWS_REGION` / `AWS_BUCKET` | S3 for uploads |
| `AWS_CONFIG_FILE` | `/dev/null` |
| `DEVISE_JWT_SECRET_KEY` | a `rails secret` |
| `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET` | optional (group sync) |
| `COMEBACK_SCRAPER_BASE_URL` | `https://www.kpopcomebacks.com` |

## 3. Frontend (Cloudflare Pages)
1. New Pages project → connect repo, root = `frontend/`, build = `npm run build`, output = `dist`.
2. Build-time env vars:
   - `VITE_API_URL` = `https://<api-host>/api/v1`
   - `VITE_CABLE_URL` = `wss://<api-host>/cable`
   - `VITE_GIPHY_API_KEY` = your Giphy key (optional)
3. Deploy → note the `*.pages.dev` URL and set it as `FRONTEND_URL` on the API.

## 4. Bot / abuse protection
- **Cloudflare**: proxy your domain through CF (orange cloud), SSL mode **Full**, turn on **Bot Fight Mode**. WebSockets pass through fine.
- **Turnstile** (optional, free): add a Turnstile widget to signup/login and verify the token server-side. (Ask and I'll wire it in.)
- **Rack::Attack** (already active in prod): throttles login, signup, password reset, message sends, new conversations, and a global per-IP cap. Tune limits in `backend/config/initializers/rack_attack.rb`.

---

## Pre-launch checklist
- [ ] Set `FRONTEND_URL` + `APP_HOST` on the API (WebSockets + image URLs break without them).
- [ ] Consolidate Solid DBs (below) **or** provision 4 Postgres DBs.
- [ ] Bump Rails off 8.0.4 (EOL 2026-10-07).
- [ ] Verify an image message + a real-time DM work in prod (WS + S3).
- [ ] Confirm Giphy key is set (GIF picker degrades gracefully if not).

### Consolidate Solid DBs (single-Postgres hosts)
In `config/database.yml`, point `cache`/`queue`/`cable` at the primary DB (keep their `migrations_paths`):
```yaml
production:
  primary: &primary_production
    <<: *default
    url: <%= ENV["DATABASE_URL"] %>
  cache:
    <<: *primary_production
    migrations_paths: db/cache_migrate
  queue:
    <<: *primary_production
    migrations_paths: db/queue_migrate
  cable:
    <<: *primary_production
    migrations_paths: db/cable_migrate
```
Then `bin/rails db:prepare` runs all migration paths into the one database.
