# Contributing

Use a short-lived feature branch and keep changes reviewable. Before opening a pull request, run the same checks as CI.

```bash
cd back
npm ci
npx prisma generate
npm run lint
npm run build
npm test -- --runInBand
npm run test:e2e -- --runInBand

cd ../frontend
npm ci
npm run lint
npm run build
```

For schema changes, create a Prisma migration and inspect the generated SQL before committing it. Never use `prisma db push` as a production deployment mechanism.

Authorization is a backend concern. Hiding a button in React is not an authorization control; every privileged operation must be enforced in NestJS.

Do not commit `.env` files, production data, tokens, passwords, database dumps, or generated `dist` directories.
