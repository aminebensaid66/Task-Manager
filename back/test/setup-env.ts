process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = process.env.JWT_SECRET ?? 'test-secret-that-is-longer-than-thirty-two-characters';
process.env.JWT_EXPIRES_IN_SECONDS = '3600';
process.env.ALLOW_PUBLIC_SIGNUP = 'true';
process.env.CORS_ORIGINS = 'http://localhost:5173';
