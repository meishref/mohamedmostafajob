# =============================================================================
# Stage 1: Install PHP dependencies
# =============================================================================
FROM composer:2 AS vendor

WORKDIR /app

COPY composer.json composer.lock ./

RUN composer install \
    --no-dev \
    --no-interaction \
    --no-scripts \
    --prefer-dist \
    --optimize-autoloader

COPY . .

RUN composer dump-autoload --optimize --classmap-authoritative \
    && composer run-script post-autoload-dump --no-interaction || true

# =============================================================================
# Stage 2: Build frontend assets (welcome page only; API does not depend on Vite)
# =============================================================================
FROM node:22-alpine AS assets

WORKDIR /app

COPY package.json ./
RUN npm install --ignore-scripts

COPY vite.config.js ./
COPY resources ./resources
COPY public ./public

RUN npm run build

# =============================================================================
# Stage 3: Production runtime
# =============================================================================
FROM php:8.3-cli-alpine AS production

LABEL org.opencontainers.image.title="Business Management System API"
LABEL org.opencontainers.image.description="Laravel 13 API for Render deployment"

# System libraries + PHP extensions required by Laravel and this project:
# - pdo_mysql: MySQL/MariaDB (required)
# - mbstring, xml, ctype, json, tokenizer, curl, zip, bcmath: Laravel core
# - fileinfo: MIME validation for uploads (SecureUploadValidator)
# - opcache: production performance
# - pcntl: optional queue worker support
RUN apk add --no-cache \
        bash \
        curl \
        icu-dev \
        libzip-dev \
        oniguruma-dev \
    && docker-php-ext-configure intl \
    && docker-php-ext-install -j"$(nproc)" \
        bcmath \
        intl \
        mbstring \
        opcache \
        pcntl \
        pdo_mysql \
        zip \
    && rm -rf /var/cache/apk/* /tmp/*

COPY docker/php/opcache.ini /usr/local/etc/php/conf.d/99-opcache.ini

WORKDIR /var/www/html

# Application code
COPY --from=vendor /app/vendor ./vendor
COPY . .
COPY --from=assets /app/public/build ./public/build

# Render injects PORT at runtime; default supports local docker runs
ENV PORT=8000

# Writable Laravel directories
RUN mkdir -p storage/framework/{cache,sessions,views} storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

USER www-data

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=5s --start-period=60s --retries=3 \
    CMD curl -fsS "http://127.0.0.1:${PORT}/up" || exit 1

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
