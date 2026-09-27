import {
  asObject,
  rejectUnknownKeys,
  requiredEmail,
  requiredPassword,
  requiredString,
} from '../../common/validation';

export interface LoginInput {
  email: string;
  password: string;
}

export const parseLoginInput = (body: unknown): LoginInput => {
  const value = asObject(body);
  rejectUnknownKeys(value, ['email', 'password']);
  return {
    email: requiredEmail(value),
    password: requiredString(value, 'password', { min: 1, max: 128, trim: false }),
  };
};

export const parseSignupInput = (body: unknown): LoginInput => {
  const value = asObject(body);
  rejectUnknownKeys(value, ['email', 'password']);
  return {
    email: requiredEmail(value),
    password: requiredPassword(value),
  };
};
