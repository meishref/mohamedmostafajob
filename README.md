# Business Management System

A production-ready full-stack Business Management System foundation built with Laravel and Next.js.

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| **Frontend** | Next.js 15, TypeScript, Tailwind CSS, shadcn/ui, React Hook Form, Zod, TanStack Query, Axios |
| **Backend** | Laravel 13, PHP 8.4, Laravel Sanctum, Spatie Permission |
| **Database** | MariaDB / MySQL |

> **Note:** The latest Laravel release (v13) was installed. It is fully compatible with PHP 8.4 and follows the same architecture patterns as Laravel 12.

## Project Structure

```
.
├── backend/                 # Laravel API
│   ├── app/
│   │   ├── DTOs/            # Data Transfer Objects
│   │   ├── Exceptions/      # Custom exceptions
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   └── Resources/
│   │   ├── Repositories/    # Repository pattern (Contracts + Eloquent)
│   │   ├── Services/        # Business logic layer
│   │   └── Traits/          # Shared traits (ApiResponse)
│   ├── config/
│   ├── database/
│   └── routes/api.php
├── frontend/                # Next.js application
│   └── src/
│       ├── app/             # App Router
│       ├── components/
│       │   ├── common/      # Shared components
│       │   ├── layouts/     # Layout components
│       │   └── ui/          # shadcn/ui components
│       ├── config/          # Environment configuration
│       ├── hooks/           # Custom React hooks
│       ├── lib/             # Utilities & API client
│       ├── providers/       # React context providers
│       ├── services/        # API service layer
│       └── types/           # TypeScript type definitions
└── docker-compose.yml       # MariaDB container (optional)
```

## Prerequisites

- PHP 8.4+
- Composer 2.x
- Node.js 20+
- MariaDB 10.6+ / MySQL 8+ (or Docker)
- npm or pnpm

## Installation

### 1. Clone and enter the project

```bash
cd /path/to/mohamedmostaf
```

### 2. Start MariaDB

**Option A — Local install (recommended):**

```bash
sudo apt update
sudo apt install mariadb-server
sudo mysql -e "CREATE DATABASE IF NOT EXISTS bms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

Update `backend/.env` with your MariaDB credentials (default root with no password on local dev).

**Option B — Docker (optional):**

```bash
docker compose up -d
```

Uses:
- Database: `bms`
- Username: `bms`
- Password: `secret`
- Root password: `rootsecret`

### 3. Backend Setup

```bash
cd backend

# Copy environment file
cp .env.example .env

# Update database credentials in .env if needed
# DB_CONNECTION=mysql
# DB_HOST=127.0.0.1
# DB_PORT=3306
# DB_DATABASE=bms
# DB_USERNAME=root
# DB_PASSWORD=

# Install dependencies (already done if cloned with vendor/)
composer install

# Generate application key
php artisan key:generate

# Run migrations and seeders
php artisan migrate --seed

# Start the development server
php artisan serve
```

The API will be available at `http://localhost:8000`.

**Default admin credentials (after seeding):**
- Email: `admin@example.com`
- Password: `password` (Laravel factory default)

### 4. Frontend Setup

```bash
cd frontend

# Copy environment file
cp .env.example .env.local

# Install dependencies
npm install

# Start the development server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description | Default |
|----------|-------------|---------|
| `APP_URL` | Backend URL | `http://localhost:8000` |
| `DB_CONNECTION` | Database driver | `mysql` |
| `DB_HOST` | Database host | `127.0.0.1` |
| `DB_PORT` | Database port | `3306` |
| `DB_DATABASE` | Database name | `bms` |
| `DB_USERNAME` | Database user | `root` |
| `DB_PASSWORD` | Database password | *(empty)* |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:3000` |
| `SANCTUM_STATEFUL_DOMAINS` | Sanctum SPA domains | `localhost,localhost:3000,...` |
| `CORS_ALLOWED_ORIGINS` | Allowed CORS origins | `http://localhost:3000` |
| `SESSION_DOMAIN` | Session cookie domain | `localhost` |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | *(empty)* |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | *(empty)* |
| `GOOGLE_REDIRECT_URI` | Google OAuth callback URL | `http://localhost:8000/api/v1/auth/google/callback` |

### Frontend (`frontend/.env.local`)

| Variable | Description | Default |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API base URL | `http://localhost:8000/api/v1` |
| `NEXT_PUBLIC_APP_URL` | Frontend URL | `http://localhost:3000` |
| `NEXT_PUBLIC_APP_NAME` | Application name | `Business Management System` |

## API Architecture

### Base URL

```
http://localhost:8000/api/v1
```

### Response Format

All API responses follow a consistent structure:

```json
{
  "success": true,
  "message": "Success",
  "data": {},
  "errors": {},
  "meta": {}
}
```

### Authentication Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/auth/register` | Register new user | No |
| POST | `/auth/login` | Login with email/password | No |
| POST | `/auth/logout` | Logout | Yes |
| GET | `/auth/me` | Get authenticated user | Yes |
| POST | `/auth/forgot-password` | Send password reset email | No |
| POST | `/auth/reset-password` | Reset password with token | No |
| POST | `/auth/email/verification-notification` | Resend verification email | Yes |
| GET | `/auth/email/verify/{id}/{hash}` | Verify email (signed URL) | No |
| GET | `/auth/google/redirect` | Redirect to Google OAuth | No |
| GET | `/auth/google/callback` | Google OAuth callback | No |
| GET | `/profile` | Get user profile | Yes |
| POST | `/profile` | Update profile (multipart) | Yes |
| PUT | `/account/settings` | Update email/password | Yes |

### General Endpoints

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/health` | Health check | No |

## Database

See [backend/docs/DATABASE.md](backend/docs/DATABASE.md) for the complete PostgreSQL schema, ER diagram, migrations, and seeders.

### Frontend Auth Pages

| Route | Description | Access |
|-------|-------------|--------|
| `/login` | Sign in with email or Google | Guest |
| `/register` | Create new account | Guest |
| `/forgot-password` | Request password reset | Guest |
| `/reset-password` | Reset password with token | Guest |
| `/verify-email` | Email verification status | Protected |
| `/profile` | View and edit profile | Protected |
| `/account-settings` | Update email and password | Protected |

### Authentication Flow

The system uses **Laravel Sanctum** with cookie-based SPA authentication:

1. Frontend requests CSRF cookie from `/sanctum/csrf-cookie`
2. Login request includes credentials with `withCredentials: true`
3. Session cookie is set automatically for subsequent requests

## Frontend Architecture

### API Client

Axios is configured in `src/lib/api/client.ts` with:
- Credential support for Sanctum
- CSRF token handling
- Standardized error parsing via `ApiError` class

### React Query

Configured in `src/providers/query-provider.tsx` with:
- 60-second stale time
- Smart retry logic (no retry on 401)
- DevTools in development

### Adding shadcn/ui Components

```bash
cd frontend
npx shadcn@latest add [component-name]
```

## Development Commands

### Backend

```bash
php artisan serve              # Start dev server
php artisan migrate            # Run migrations
php artisan migrate:fresh --seed  # Reset & seed database
php artisan test               # Run tests
./vendor/bin/pint              # Code formatting
```

### Frontend

```bash
npm run dev                    # Start dev server
npm run build                  # Production build
npm run lint                   # ESLint
```

## Clean Architecture Layers

### Backend

1. **Controllers** — Handle HTTP requests, delegate to services
2. **Requests** — Validate incoming data
3. **Services** — Business logic orchestration
4. **Repositories** — Data access abstraction
5. **DTOs** — Type-safe data transfer
6. **Resources** — API response transformation

### Frontend

1. **Services** — API communication layer
2. **Hooks** — React Query integration
3. **Components** — UI presentation
4. **Layouts** — Page structure
5. **Types** — TypeScript interfaces
6. **Lib** — Shared utilities

## License

Proprietary. All rights reserved.
# mohamedmostafajob
