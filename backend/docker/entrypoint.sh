#!/bin/sh
set -eu

PORT="${PORT:-8000}"

echo "[entrypoint] Waiting for database..."
for i in $(seq 1 30); do
  if php artisan db:show >/dev/null 2>&1; then
    echo "[entrypoint] Database is reachable."
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "[entrypoint] ERROR: Database not reachable after 30 attempts."
    exit 1
  fi
  sleep 2
done

php artisan storage:link 2>/dev/null || true

echo "[entrypoint] Running migrations..."
php artisan migrate --force --no-interaction

echo "[entrypoint] Caching config, routes, and views..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "[entrypoint] Starting server on 0.0.0.0:${PORT}..."
exec php artisan serve --host=0.0.0.0 --port="${PORT}"
