# API reference

Base path: `/api/v1`

Browser authentication uses the `tm_access` HttpOnly cookie. API clients may alternatively send `Authorization: Bearer <jwt>`.

## Authentication

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/auth/config` | Public | Returns whether public signup is enabled |
| POST | `/auth/login` | Public | Authenticate and set access cookie |
| POST | `/auth/signup` | Public/configurable | Create an employee account and sign in |
| GET | `/auth/me` | User | Return the current active user |
| POST | `/auth/logout` | Public | Clear the access cookie |

Login/signup body:

```json
{
  "email": "person@example.com",
  "password": "StrongPass123"
}
```

Passwords used for account creation must be 10-128 characters and include lowercase, uppercase, and a number.

## Users (administrator only)

| Method | Path | Description |
|---|---|---|
| GET | `/users?page=1&limit=20&search=&role=` | Paginated account list |
| POST | `/users` | Create an employee/admin account |
| PATCH | `/users/:id` | Change role and/or active state |

Create body:

```json
{
  "email": "engineer@example.com",
  "password": "Temporary123",
  "role": "EMPLOYEE"
}
```

Update body:

```json
{
  "isActive": false
}
```

## Tasks

| Method | Path | Permission | Description |
|---|---|---|---|
| GET | `/tasks` | Admin | Paginated task list |
| GET | `/tasks/my-tasks` | User | Paginated list restricted to current assignee |
| GET | `/tasks/stats` | User | Counts visible to current user |
| GET | `/tasks/:id` | Admin/assignee | Task, comments, and recent activity |
| POST | `/tasks` | Admin | Create task |
| PATCH | `/tasks/:id` | Admin | Full task update |
| PATCH | `/tasks/:id/status` | Admin/assignee | Change workflow status |
| PATCH | `/tasks/:id/assign` | Admin | Change assignee |
| POST | `/tasks/:id/comments` | Admin/assignee | Add comment |
| DELETE | `/tasks/:id` | Admin | Permanently delete task and dependent history |

Task list query parameters:

- `page`, `limit`
- `search` (title/description)
- `status`: `PENDING`, `IN_PROGRESS`, `COMPLETED`
- `priority`: `LOW`, `MEDIUM`, `HIGH`
- `assigneeId` (admin list only)
- `overdue=true`

Create/update body fields:

```json
{
  "title": "Ship release candidate",
  "description": "Run final regression and publish artifacts.",
  "deadline": "2026-10-02",
  "priority": "HIGH",
  "status": "PENDING",
  "assignedToId": "uuid-or-null"
}
```

## Response errors

Errors use a consistent structure:

```json
{
  "statusCode": 403,
  "error": "Forbidden",
  "message": "You may only access tasks assigned to you",
  "path": "/api/v1/tasks/...",
  "timestamp": "2026-09-27T16:00:00.000Z",
  "requestId": "..."
}
```

Do not build client logic around error message text; use HTTP status and endpoint semantics.
