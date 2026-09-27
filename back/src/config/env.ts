const requireValue = (name: string): string => {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
};

const parseBoolean = (value: string | undefined, fallback: boolean): boolean => {
  if (value === undefined) return fallback;
  return ['1', 'true', 'yes', 'on'].includes(value.trim().toLowerCase());
};

const parsePositiveInt = (name: string, fallback: number): number => {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  if (!Number.isInteger(value) || value <= 0) {
    throw new Error(`${name} must be a positive integer`);
  }
  return value;
};

export const env = {
  get nodeEnv() {
    return process.env.NODE_ENV ?? 'development';
  },
  get isProduction() {
    return (process.env.NODE_ENV ?? 'development') === 'production';
  },
  get port() {
    return parsePositiveInt('PORT', 3000);
  },
  get jwtSecret() {
    const secret = requireValue('JWT_SECRET');
    if (secret.length < 32) {
      throw new Error('JWT_SECRET must contain at least 32 characters');
    }
    return secret;
  },
  get jwtExpiresInSeconds() {
    return parsePositiveInt('JWT_EXPIRES_IN_SECONDS', 28_800);
  },
  get corsOrigins() {
    return (process.env.CORS_ORIGINS ?? 'http://localhost:5173')
      .split(',')
      .map((origin) => origin.trim())
      .filter(Boolean);
  },
  get allowPublicSignup() {
    return parseBoolean(
      process.env.ALLOW_PUBLIC_SIGNUP,
      (process.env.NODE_ENV ?? 'development') !== 'production',
    );
  },
  get maxPageSize() {
    return parsePositiveInt('MAX_PAGE_SIZE', 100);
  },
  get cookieSecure() {
    return parseBoolean(
      process.env.COOKIE_SECURE,
      (process.env.NODE_ENV ?? 'development') === 'production',
    );
  },
  get accessCookieName() {
    return process.env.ACCESS_COOKIE_NAME?.trim() || 'tm_access';
  },
};
