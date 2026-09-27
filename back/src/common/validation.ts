import { BadRequestException } from '@nestjs/common';

export type PlainObject = Record<string, unknown>;

export const asObject = (value: unknown): PlainObject => {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BadRequestException('Request body must be a JSON object');
  }
  return value as PlainObject;
};

export const rejectUnknownKeys = (body: PlainObject, allowed: string[]) => {
  const unknown = Object.keys(body).filter((key) => !allowed.includes(key));
  if (unknown.length > 0) {
    throw new BadRequestException(`Unknown field(s): ${unknown.join(', ')}`);
  }
};

export const requiredString = (
  body: PlainObject,
  key: string,
  options: { min?: number; max?: number; trim?: boolean } = {},
): string => {
  const raw = body[key];
  if (typeof raw !== 'string') {
    throw new BadRequestException(`${key} must be a string`);
  }
  const value = options.trim === false ? raw : raw.trim();
  if (options.min !== undefined && value.length < options.min) {
    throw new BadRequestException(`${key} must contain at least ${options.min} characters`);
  }
  if (options.max !== undefined && value.length > options.max) {
    throw new BadRequestException(`${key} must contain at most ${options.max} characters`);
  }
  return value;
};

export const optionalString = (
  body: PlainObject,
  key: string,
  options: { max?: number; trim?: boolean; nullable?: boolean } = {},
): string | null | undefined => {
  const raw = body[key];
  if (raw === undefined) return undefined;
  if (raw === null && options.nullable) return null;
  if (typeof raw !== 'string') {
    throw new BadRequestException(`${key} must be a string${options.nullable ? ' or null' : ''}`);
  }
  const value = options.trim === false ? raw : raw.trim();
  if (options.max !== undefined && value.length > options.max) {
    throw new BadRequestException(`${key} must contain at most ${options.max} characters`);
  }
  return value;
};

export const requiredEmail = (body: PlainObject, key = 'email'): string => {
  const email = requiredString(body, key, { min: 3, max: 254 }).toLowerCase();
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!valid) throw new BadRequestException(`${key} must be a valid email address`);
  return email;
};

export const requiredPassword = (body: PlainObject, key = 'password'): string => {
  const password = requiredString(body, key, { min: 10, max: 128, trim: false });
  if (!/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/\d/.test(password)) {
    throw new BadRequestException(
      `${key} must include at least one lowercase letter, one uppercase letter, and one number`,
    );
  }
  return password;
};

export const optionalBoolean = (body: PlainObject, key: string): boolean | undefined => {
  const value = body[key];
  if (value === undefined) return undefined;
  if (typeof value !== 'boolean') throw new BadRequestException(`${key} must be a boolean`);
  return value;
};

export const optionalEnum = <T extends string>(
  body: PlainObject,
  key: string,
  values: readonly T[],
): T | undefined => {
  const raw = body[key];
  if (raw === undefined) return undefined;
  if (typeof raw !== 'string') throw new BadRequestException(`${key} must be a string`);
  const normalized = raw.trim().toUpperCase() as T;
  if (!values.includes(normalized)) {
    throw new BadRequestException(`${key} must be one of: ${values.join(', ')}`);
  }
  return normalized;
};

export const optionalUuid = (
  body: PlainObject,
  key: string,
  options: { nullable?: boolean } = {},
): string | null | undefined => {
  const value = body[key];
  if (value === undefined) return undefined;
  if (value === null && options.nullable) return null;
  if (typeof value !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value)) {
    throw new BadRequestException(`${key} must be a valid UUID${options.nullable ? ' or null' : ''}`);
  }
  return value;
};

export const optionalDate = (body: PlainObject, key: string): Date | null | undefined => {
  const value = body[key];
  if (value === undefined) return undefined;
  if (value === null || value === '') return null;
  if (typeof value !== 'string') throw new BadRequestException(`${key} must be an ISO date string or null`);
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) throw new BadRequestException(`${key} must be a valid date`);
  return date;
};

export const queryString = (value: unknown, max = 100): string | undefined => {
  if (value === undefined || value === null || value === '') return undefined;
  if (typeof value !== 'string') throw new BadRequestException('Query parameter must be a string');
  const normalized = value.trim();
  if (normalized.length > max) throw new BadRequestException(`Query parameter exceeds ${max} characters`);
  return normalized || undefined;
};

export const queryPositiveInt = (value: unknown, fallback: number, max?: number): number => {
  if (value === undefined || value === null || value === '') return fallback;
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new BadRequestException('Pagination values must be positive integers');
  }
  return max ? Math.min(parsed, max) : parsed;
};
