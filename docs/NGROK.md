# Ngrok Setup (Frontend + Backend)

This app uses **Sanctum cookie auth**. With ngrok you usually need **two tunnels** (frontend and backend get different `*.ngrok-free.app` hosts).

## 1. Start tunnels

```bash
# Terminal 1 – backend (port 8000)
ngrok http 8000

# Terminal 2 – frontend (port 3000)
ngrok http 3000
```

Copy the **HTTPS** URLs, e.g.:

- Backend: `https://abc123.ngrok-free.app`
- Frontend: `https://xyz789.ngrok-free.app`

## 2. Backend `backend/.env`

Replace placeholders with your ngrok URLs:

```env
APP_URL=https://abc123.ngrok-free.app
FRONTEND_URL=https://xyz789.ngrok-free.app

# Hostname only — no https://, no trailing slash
SANCTUM_STATEFUL_DOMAINS=xyz789.ngrok-free.app,localhost:3000

# Full origin with https
CORS_ALLOWED_ORIGINS=https://xyz789.ngrok-free.app

# Required: frontend and backend are different ngrok hosts (cross-site cookies)
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
SESSION_DOMAIN=

GOOGLE_REDIRECT_URI=https://abc123.ngrok-free.app/api/v1/auth/google/callback
```

Then:

```bash
cd backend
php artisan config:clear
php artisan serve --host=0.0.0.0 --port=8000
```

## 3. Frontend `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app/api/v1
NEXT_PUBLIC_BACKEND_URL=https://abc123.ngrok-free.app
NEXT_PUBLIC_APP_URL=https://xyz789.ngrok-free.app
```

Restart frontend:

```bash
cd frontend
npm run dev
```

## 4. Open the app

Use **only the frontend ngrok URL** in the browser:

`https://xyz789.ngrok-free.app/login`

Do **not** open the backend ngrok URL for browsing (API only).

## 5. Common issues

| Problem | Fix |
|---------|-----|
| Network error | Frontend `.env.local` must point to **backend ngrok URL**, not `localhost` |
| 419 CSRF | `SANCTUM_STATEFUL_DOMAINS` must match frontend hostname exactly; `X-XSRF-TOKEN` header must match the `XSRF-TOKEN` cookie (encrypted value); run `php artisan config:clear` after env changes |
| Login loop / no session | Set `SESSION_SAME_SITE=none` and `SESSION_SECURE_COOKIE=true` |
| ngrok warning page on API | Frontend sends `ngrok-skip-browser-warning` automatically |
| CORS blocked | Add exact frontend URL to `CORS_ALLOWED_ORIGINS` |

## 6. One tunnel only?

If you expose **only the backend** via ngrok and open the frontend on `localhost:3000`, use:

```env
# backend/.env
SANCTUM_STATEFUL_DOMAINS=localhost:3000
CORS_ALLOWED_ORIGINS=http://localhost:3000
SESSION_SAME_SITE=lax
SESSION_SECURE_COOKIE=false

# frontend/.env.local — API via ngrok
NEXT_PUBLIC_API_URL=https://abc123.ngrok-free.app/api/v1
NEXT_PUBLIC_BACKEND_URL=https://abc123.ngrok-free.app
```

Open app at `http://localhost:3000` (not ngrok).

## 7. Backend ngrok + frontend on server IP

If the frontend runs on `http://168.231.111.10:3000` and the API is exposed via ngrok:

```env
# backend/.env
APP_URL=https://YOUR-BACKEND.ngrok-free.dev
FRONTEND_URL=http://168.231.111.10:3000
SANCTUM_STATEFUL_DOMAINS=168.231.111.10:3000
CORS_ALLOWED_ORIGINS=http://168.231.111.10:3000
SESSION_SECURE_COOKIE=true
SESSION_SAME_SITE=none
```

After editing `.env`:

```bash
cd backend && php artisan config:clear
```

In DevTools → login request → verify `X-XSRF-TOKEN` header value **equals** the `XSRF-TOKEN` cookie value. If they differ, clear site cookies and retry.
