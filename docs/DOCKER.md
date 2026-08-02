# Docker Setup (no ngrok)

Local `docker-compose.yml` is gitignored — copy the example first:

```bash
cp docker-compose.example.yml docker-compose.yml
cp .env.docker.example .env.docker
# Edit .env.docker with your server IP and APP_KEY
docker compose --env-file .env.docker up -d --build
```

Open: http://168.231.111.10:3000/login

Demo: `admin@example.com` / `password`

## How it works

```
Browser → frontend:3000 → proxy → backend:8000 → mariadb
```

| Service | Internal host | Notes |
|---------|---------------|-------|
| mariadb | `mariadb:3306` | `DB_HOST=mariadb` in backend |
| backend | `backend:8000` | Laravel API |
| frontend | `:3000` | Next.js + API proxy |

## Important env vars

**Backend (docker-compose):**
- `DB_HOST=mariadb` ✅ (same Docker network)
- `SANCTUM_STATEFUL_DOMAINS=168.231.111.10:3000`
- `SESSION_SECURE_COOKIE=false`

**Frontend container:**
- `BACKEND_PROXY_URL=http://backend:8000` ← **not** `127.0.0.1`

## If frontend runs on host (not Docker)

Only MariaDB + backend in Docker:

```env
# host machine frontend/.env.local
BACKEND_PROXY_URL=http://127.0.0.1:8000
```

Backend container must expose port `8000:8000`.

## Commands

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose exec backend php artisan migrate --force
docker compose restart frontend
```
