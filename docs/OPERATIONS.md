# Operations runbook

## First deployment

1. Copy `.env.example` to `.env` on the deployment host.
2. Replace every example password/secret. Generate `JWT_SECRET` from a cryptographically secure random source.
3. For HTTPS production, set `PUBLIC_ORIGIN` to the public HTTPS origin and `COOKIE_SECURE=true`.
4. Keep `ALLOW_PUBLIC_SIGNUP=false` unless self-registration is an explicit requirement.
5. Start services with `docker compose up --build -d`.
6. Run `docker compose exec api npm run seed:prod` once to create/promote the configured initial administrator.
7. Verify `/api/v1/health/live`, `/api/v1/health/ready`, login, admin task creation, and employee task access.

## Deployment of a new version

- Review every new SQL migration before deployment.
- Take a database backup before migrations that alter/drop data or columns.
- Pull the reviewed commit/tag.
- Run `docker compose build` and the CI-equivalent tests if your release process requires local verification.
- Run `docker compose up -d`.
- The API container executes `prisma migrate deploy` before starting NestJS.
- Check container health and application logs after deployment.

## Database backup

Example logical backup:

```bash
docker compose exec -T db pg_dump -U task_manager -d task_manager -Fc > task-manager-$(date +%F).dump
```

Store backups outside the application host and test restoration periodically.

Example restore into an empty database:

```bash
cat task-manager-YYYY-MM-DD.dump | docker compose exec -T db pg_restore -U task_manager -d task_manager --clean --if-exists
```

Adjust database/user names to match `.env`.

## Logs and request IDs

NestJS logs one line per completed request and includes the request ID. Nginx sends an `X-Request-Id` to the API, and the API exposes the resulting ID in the response. When investigating a user report, capture the request ID and search centralized logs for it.

For a serious production deployment, forward container logs to your normal log platform and add alerting for 5xx rate, readiness failures, database capacity, disk usage, and restart loops.

## Account recovery

The service prevents removal of the last active administrator. If credentials are nevertheless lost, set `ADMIN_EMAIL`/`ADMIN_PASSWORD` to a controlled recovery account and run the seed command. Rotate/remove recovery credentials from deployment secrets afterwards.

## Incident containment

- Compromised account: deactivate it as an administrator. JWT validation reloads account state, so subsequent requests fail immediately.
- Suspected JWT secret exposure: rotate `JWT_SECRET`; all existing sessions become invalid.
- Database credential exposure: rotate the PostgreSQL password and update deployment secrets/connection strings.
- Application vulnerability: restrict ingress if needed, deploy the fixed image, and preserve relevant logs before rotation/cleanup.

## Rollback

Application-image rollback is straightforward when the database schema remains backward-compatible. Database migrations require more care: Prisma migrations do not provide automatic down migrations. Prefer forward fixes. If a migration is destructive and a rollback is required, restore a verified backup or apply a separately reviewed corrective migration.
