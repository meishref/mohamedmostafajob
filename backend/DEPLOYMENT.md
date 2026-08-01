# Render Deployment Guide – Business Management System API

## Prerequisites

| Requirement | Details |
|-------------|---------|
| **Database** | **MySQL or MariaDB is required.** This project uses UUID foreign keys, sessions/cache/queues on DB, and Spatie Permission. PostgreSQL is not supported without code changes. |
| **Render plan** | Free Web Service works for the API container. **You still need an external MySQL/MariaDB host** (Render does not offer free MySQL). |
| **Frontend** | Deploy Next.js separately; point `FRONTEND_URL`, `CORS_ALLOWED_ORIGINS`, and `SANCTUM_STATEFUL_DOMAINS` at it. |
| **Ephemeral disk** | Render Free has **no persistent disk**. File uploads in `storage/app/public` are **lost on redeploy**. Use S3 (`FILESYSTEM_DISK=s3`) for production uploads. |

## Deployment Checklist

### 1. Repository

- [ ] Push code to GitHub/GitLab
- [ ] Confirm Render **Root Directory** = `backend`

### 2. Database (external MySQL/MariaDB)

- [ ] Create database + user with full privileges on that schema
- [ ] Allow connections from Render (often `0.0.0.0/0` or provider-specific IP allowlist)
- [ ] Note host, port, database name, username, password
- [ ] Enable SSL if provider requires it (`MYSQL_ATTR_SSL_CA`)

### 3. Render Web Service

- [ ] New → **Web Service** → connect repo
- [ ] **Root Directory:** `backend`
- [ ] **Runtime:** Docker
- [ ] **Instance type:** Free
- [ ] **Health Check Path:** `/up`
- [ ] Add all environment variables (see below)
- [ ] Deploy

### 4. First deploy verification

- [ ] `GET https://<your-service>.onrender.com/up` → 200
- [ ] Logs show: migrations ran, config/route/view cached, server started on `PORT`
- [ ] `POST /api/v1/auth/login` works from frontend origin
- [ ] CSRF cookie + session auth work (check `SANCTUM_STATEFUL_DOMAINS`)

### 5. Post-deploy (manual, one time)

- [ ] Seed admin if needed: `php artisan db:seed --class=DatabaseSeeder` (via Render Shell)
- [ ] Confirm email sending with your SMTP credentials
- [ ] Point frontend `NEXT_PUBLIC_API_URL` (or equivalent) to Render API URL

### 6. Optional production hardening

- [ ] Add **Render Cron Job** for `php artisan schedule:run` (runs `tasks:process-deadlines` hourly)
- [ ] Add **Background Worker** if switching `QUEUE_CONNECTION=database`
- [ ] Configure **S3** for attachments (`AWS_*` env vars + `FILESYSTEM_DISK=s3`)
- [ ] Custom domain + HTTPS (Render provides TLS automatically)

---

## Render Environment Variables

Set these in **Render Dashboard → your service → Environment**.

### Application (required)

| Variable | Example | Purpose |
|----------|---------|---------|
| `APP_NAME` | `Business Management System` | App name in emails/UI |
| `APP_ENV` | `production` | Environment mode |
| `APP_KEY` | `base64:...` | **Required.** Generate: `php artisan key:generate --show` |
| `APP_DEBUG` | `false` | Must be false in production |
| `APP_URL` | `https://bms-api.onrender.com` | Public API URL (HTTPS) |

### Database (required)

| Variable | Example | Purpose |
|----------|---------|---------|
| `DB_CONNECTION` | `mysql` | Use `mysql` or `mariadb` |
| `DB_HOST` | `db.example.com` | External DB hostname |
| `DB_PORT` | `3306` | Database port |
| `DB_DATABASE` | `bms` | Schema name |
| `DB_USERNAME` | `bms` | DB user |
| `DB_PASSWORD` | *(secret)* | DB password |
| `MYSQL_ATTR_SSL_CA` | `/etc/ssl/certs/ca-certificates.crt` | Only if DB requires SSL |

### Session & SPA auth (required for Next.js frontend)

| Variable | Example | Purpose |
|----------|---------|---------|
| `SESSION_DRIVER` | `database` | Sessions stored in DB (migrated) |
| `SESSION_SECURE_COOKIE` | `true` | Cookies only over HTTPS |
| `SESSION_DOMAIN` | *(empty)* or `.yourdomain.com` | Empty for cross-site; parent domain if sharing cookies |
| `SANCTUM_STATEFUL_DOMAINS` | `your-app.onrender.com` | Frontend host(s) for cookie auth |
| `CORS_ALLOWED_ORIGINS` | `https://your-app.onrender.com` | Allowed CORS origins |
| `FRONTEND_URL` | `https://your-app.onrender.com` | Links in task emails |

### Mail (required for task notifications)

| Variable | Example | Purpose |
|----------|---------|---------|
| `MAIL_MAILER` | `smtp` | Mail driver |
| `MAIL_HOST` | `smtp.gmail.com` | SMTP server |
| `MAIL_PORT` | `587` | SMTP port |
| `MAIL_USERNAME` | `you@gmail.com` | SMTP user |
| `MAIL_PASSWORD` | *(app password)* | SMTP password |
| `MAIL_ENCRYPTION` | `tls` | TLS encryption |
| `MAIL_FROM_ADDRESS` | `you@gmail.com` | From address |
| `MAIL_FROM_NAME` | `Business Management System` | From name |

### Runtime / infrastructure

| Variable | Value | Purpose |
|----------|-------|---------|
| `PORT` | *(auto)* | **Set by Render automatically.** Do not override. |
| `LOG_CHANNEL` | `stderr` | Logs visible in Render dashboard |
| `LOG_LEVEL` | `info` | Log verbosity |
| `CACHE_STORE` | `database` | Cache in DB (no Redis needed on Free) |
| `QUEUE_CONNECTION` | `sync` | Process jobs inline (Free tier; no worker) |
| `FILESYSTEM_DISK` | `public` | Local uploads (ephemeral on Free) |

### Optional

| Variable | Purpose |
|----------|---------|
| `GOOGLE_CLIENT_ID` | Google OAuth login |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `GOOGLE_REDIRECT_URI` | Must match API callback URL |
| `AWS_*` | S3 storage for persistent uploads |

---

## Startup Command

Render uses the Dockerfile `ENTRYPOINT`. At container start:

```sh
# docker/entrypoint.sh
1. Wait for database (up to 60s)
2. php artisan storage:link
3. php artisan migrate --force
4. php artisan config:cache
5. php artisan route:cache
6. php artisan view:cache
7. php artisan serve --host=0.0.0.0 --port=$PORT
```

**Do not** set a custom Start Command in Render unless you replace the entrypoint.

---

## Docker Build Summary

| Stage | Purpose |
|-------|---------|
| `vendor` | `composer install --no-dev --optimize-autoloader` |
| `assets` | `npm install && npm run build` (Vite welcome page assets) |
| `production` | PHP 8.3 Alpine + extensions, copies app, runs as `www-data` |

### PHP extensions installed

`pdo_mysql`, `mbstring`, `bcmath`, `intl`, `zip`, `opcache`, `pcntl` (+ bundled: `fileinfo`, `openssl`, `json`, `ctype`, `tokenizer`, `curl`)

---

## Known Render Free Limitations

1. **Spins down after inactivity** (~50s cold start on next request)
2. **No persistent filesystem** – uploaded files lost on redeploy
3. **No MySQL included** – external database required
4. **No cron** on Web Service – schedule needs Cron Job (paid) or external scheduler
5. **No queue worker** – use `QUEUE_CONNECTION=sync` or add a Worker service

---

## Local Docker Test

```bash
cd backend
docker build -t bms-api .
docker run --rm -p 8000:8000 \
  -e APP_KEY=base64:YOUR_KEY \
  -e APP_URL=http://localhost:8000 \
  -e DB_HOST=host.docker.internal \
  -e DB_DATABASE=bms \
  -e DB_USERNAME=bms \
  -e DB_PASSWORD=secret \
  bms-api
```

Health: `http://localhost:8000/up`

---

## Deployment Fix Applied

`bootstrap/app.php` – added `trustProxies(at: '*')` so Laravel detects HTTPS and client IP correctly behind Render's load balancer. Required for Sanctum cookie auth in production.
