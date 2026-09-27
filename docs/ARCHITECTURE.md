# Architecture

## Runtime topology

```text
Browser
  |
  | HTTPS
  v
Nginx / React SPA
  |
  | /api/v1/* reverse proxy
  v
NestJS API
  |
  | Prisma
  v
PostgreSQL
```

The React application never decides whether an operation is authorized. It only adapts the UI to the current user. NestJS validates identity, role, task ownership, request fields, and account activity for every protected operation.

## Domain model

- `User`: authenticated account with `ADMIN` or `EMPLOYEE` role and an active/inactive lifecycle.
- `Task`: work item created by an administrator, optionally assigned to one active employee.
- `Comment`: append-only discussion entry attached to a task.
- `TaskActivity`: recent task history for creation, edits, assignment, status changes, and comments.

Employees can read tasks assigned to them, change their status, and comment on them. Administrators can see all tasks, create/update/delete/assign tasks, list users, create accounts, change roles, and deactivate accounts.

## Authentication

The API signs a short-lived JWT and places it in an HttpOnly cookie. The cookie is not readable by React code. Passport accepts the cookie (or an Authorization bearer token for non-browser clients), verifies expiration/signature, and reloads the user from the database so deactivated accounts stop working without waiting for the JWT to expire.

The production cookie is `Secure` and `SameSite=Lax`. The default deployment serves the SPA and API under one site through Nginx.

## Authorization invariants

1. Only administrators can create, fully edit, assign, or delete tasks.
2. Employees can access only tasks whose `assignedToId` is their own user ID.
3. Employees can only change task status or add comments.
4. Only administrators can list/create/update users.
5. An administrator cannot change their own role or deactivate themselves.
6. The last active administrator cannot be demoted or deactivated.
7. Only active employees can be selected as task assignees.

These rules live in the API and are tested through E2E requests.

## API structure

```text
src/
  auth/       authentication, JWT strategy and guard
  users/      admin account management
  tasks/      task/comment/activity domain logic
  health/     liveness/readiness endpoints
  prisma/     database client lifecycle
  common/     role guard, request logging, validation and errors
  config/     validated environment access
```

Controllers parse HTTP input and delegate to services. Services own domain rules and database access. Prisma is the persistence boundary.

## Operational behavior

- `/api/v1/health/live` confirms the Node process is running.
- `/api/v1/health/ready` also checks PostgreSQL connectivity.
- Every response receives an `X-Request-Id`; API logs include the same ID.
- Unexpected server errors return a generic message to clients and are logged server-side.
- Docker startup runs `prisma migrate deploy` before starting the API.
- Schema evolution is committed as reviewed SQL migrations.

## Scaling notes

The current design is stateless at the API tier; JWT verification and all state live in PostgreSQL. Multiple API replicas can therefore be placed behind a load balancer. The bundled Nginx authentication rate limiter is per Nginx instance; use shared/infrastructure-level rate limiting for a larger deployment.
