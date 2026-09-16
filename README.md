# Task Manager

A role-aware full-stack task-management application built with React and NestJS. It includes account creation, JWT authentication, protected routes, task workflows, and administrative user views.

## Stack

- React 19, Vite, React Router, Tailwind CSS
- NestJS, Passport, JWT, bcrypt
- PostgreSQL and Prisma
- Axios and date-fns

## Structure

```text
Task-Manager/
├── frontend/   # React interface and protected pages
└── back/       # NestJS API, authentication, and Prisma
```

## Features

- Sign-up and login flows
- Password hashing and JWT authentication
- Protected and role-aware routes
- Task creation, editing, filtering, and completion UI
- Administrative user listing
- Prisma migrations and seed support

## Local development

### Backend

Configure `DATABASE_URL`, `DIRECT_URL`, and the JWT secret in the backend environment, then:

```bash
cd back
npm install
npx prisma generate
npx prisma migrate dev
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

## Quality

```bash
cd back && npm test
cd frontend && npm run lint && npm run build
```

## Status

Student full-stack project. Before production use, centralize environment documentation, expand API tests, validate authorization on every mutation, and add deployment configuration.
