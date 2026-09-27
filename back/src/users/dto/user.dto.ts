import { BadRequestException } from '@nestjs/common';
import { Role } from '@prisma/client';
import {
  asObject,
  optionalBoolean,
  optionalEnum,
  rejectUnknownKeys,
  requiredEmail,
  requiredPassword,
} from '../../common/validation';

export interface CreateUserInput {
  email: string;
  password: string;
  role: Role;
}

export interface UpdateUserInput {
  role?: Role;
  isActive?: boolean;
}

export const parseCreateUserInput = (body: unknown): CreateUserInput => {
  const value = asObject(body);
  rejectUnknownKeys(value, ['email', 'password', 'role']);
  return {
    email: requiredEmail(value),
    password: requiredPassword(value),
    role: optionalEnum(value, 'role', [Role.ADMIN, Role.EMPLOYEE]) ?? Role.EMPLOYEE,
  };
};

export const parseUpdateUserInput = (body: unknown): UpdateUserInput => {
  const value = asObject(body);
  rejectUnknownKeys(value, ['role', 'isActive']);
  const result = {
    role: optionalEnum(value, 'role', [Role.ADMIN, Role.EMPLOYEE]),
    isActive: optionalBoolean(value, 'isActive'),
  };
  if (result.role === undefined && result.isActive === undefined) {
    throw new BadRequestException('At least one field must be provided');
  }
  return result;
};
