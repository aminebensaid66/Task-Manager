# Task Manager

A production-oriented team task-management application built with React, NestJS, Prisma, and PostgreSQL. Administrators manage people and work; employees see only their assigned tasks, update task status, and collaborate through comments.

## What is implemented

- Secure login with bcrypt password hashing and HttpOnly JWT cookie authentication
- Optional public employee signup (disabled by default in production)
- `ADMIN` / `EMPLOYEE` authorization enforced by the API
- Account creation, role changes, activation/deactivation, and last-admin protection
- Persistent tasks with priority, status, deadline, creator, and assignee
- Employee-scoped task access enforced server-side
- Task comments and recent activity history
- Search, filters, pagination, overdue filtering, and dashboard statistics
- Request validation, consistent errors, request IDs, CORS controls, and security headers
- PostgreSQL migrations that upgrade the original project without deleting existing users
- Liveness/readiness health checks
- Docker Compose deployment with PostgreSQL, NestJS, React/Nginx, and auth endpoint rate limiting
- Backend unit/E2E tests plus frontend/backend CI build and lint checks
- Architecture, API, security, and contribution documentation

## Repository layout

```text
Task-Manager/
├── back/                  NestJS API and Prisma schema
├── frontend/              React/Vite application
├── docs/                  Architecture and API reference
├── .github/workflows/     CI
├── docker-compose.yml     Production-style local deployment
├── .env.example           Compose environment template
├── CONTRIBUTING.md
└── SECURITY.md
```

## Fastest way to run it

Requirements: Docker with Compose.

```bash
cp .env.example .env
```

Change at least `POSTGRES_PASSWORD`, `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`, then run:

```bash
docker compose up --build -d
```

Create/upgrade the initial administrator after the API is healthy:

```bash
docker compose exec api npm run seed:prod
```

Open `http://localhost:8080` (or the `APP_PORT` you configured).

The database is stored in the `task_manager_db` Docker volume. `docker compose down` does not delete it; `docker compose down -v` does.

## Local development

### 1. PostgreSQL

Run PostgreSQL locally and create a database, or start only the Compose database:

```bash
docker compose up -d db
```

### 2. Backend

```bash
cd back
cp .env.example .env
npm ci
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run start:dev
```

The API listens on `http://localhost:3000/api/v1` by default.

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm ci
npm run dev
```

Vite runs on `http://localhost:5173` and proxies `/api` to the NestJS process, so no hard-coded localhost API URL is embedded in the application.

## Roles

**Administrator**: list/create/manage users; create/edit/delete/assign all tasks; update status; comment.

**Employee**: list/read only tasks assigned to themselves; update status; comment. Changing the React UI or manually calling another task ID does not bypass these restrictions because they are enforced in the service layer.

## Environment variables

See `.env.example` and `back/.env.example`. Important production values:

- `DATABASE_URL`, `DIRECT_URL`: PostgreSQL connection strings
- `JWT_SECRET`: at least 32 random characters; use secret management in production
- `JWT_EXPIRES_IN_SECONDS`: access session lifetime (default 8 hours)
- `CORS_ORIGINS`: comma-separated allowed browser origins
- `ALLOW_PUBLIC_SIGNUP`: normally `false` for an internal organization
- `COOKIE_SECURE`: use `true` whenever the public site is HTTPS; the example uses `false` only so localhost Compose works over HTTP
- `ADMIN_EMAIL`, `ADMIN_PASSWORD`: used only by the seed command

Never commit a populated `.env` file.

## Database lifecycle

Development schema changes:

```bash
cd back
npx prisma migrate dev --name describe_the_change
```

Production deployment:

```bash
npx prisma migrate deploy
```

Do not use `prisma db push` for production schema deployment. Review migration SQL before merging it.

## Verification

Backend:

```bash
cd back
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand
```

The E2E suite needs a migrated PostgreSQL test database. CI provisions one automatically.

Frontend:

```bash
cd frontend
npm run lint
npm run build
```

## API and architecture

See [docs/API.md](docs/API.md), [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md), and [docs/OPERATIONS.md](docs/OPERATIONS.md).

## Deployment notes

The included Compose/Nginx setup is a strong single-host baseline, not a substitute for organization-specific infrastructure. For an internet-facing deployment, terminate TLS, back up PostgreSQL, centralize logs/metrics, store secrets outside the repository, and configure infrastructure-level alerting and rate limiting.

The repository intentionally remains `UNLICENSED`; choose a license only with the project owner's approval.
