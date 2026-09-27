# Security policy

Do not report suspected vulnerabilities in public issues. Contact the repository owner privately and include reproduction steps, affected versions, and impact.

## Security assumptions

- Production traffic is served over HTTPS by the deployment platform or reverse proxy.
- `JWT_SECRET`, database credentials, and the initial administrator password are supplied through secret management and are never committed.
- Public signup should normally be disabled for an internal team deployment.
- The bundled Nginx configuration rate-limits login and signup. If the API is exposed directly, equivalent edge rate limiting must be configured.
- Authentication uses an HttpOnly `SameSite=Lax` cookie. Deploy the frontend and API under the same site unless the cookie/CORS policy is intentionally redesigned.
- Administrators can create accounts and change roles. The API prevents an administrator from deactivating themselves or removing the last active administrator.

## Dependency and patching policy

Run `npm audit` as an advisory signal, review lockfile updates, and apply supported Node/PostgreSQL/Nginx security updates through normal pull requests. Do not blindly apply semver-major automated fixes in production.
