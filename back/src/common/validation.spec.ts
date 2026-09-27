import { BadRequestException } from '@nestjs/common';
import { asObject, optionalEnum, requiredEmail, requiredPassword } from './validation';

describe('validation helpers', () => {
  it('normalizes email addresses', () => {
    expect(requiredEmail({ email: '  User@Example.COM ' })).toBe('user@example.com');
  });

  it('rejects weak passwords', () => {
    expect(() => requiredPassword({ password: 'onlyletters' })).toThrow(BadRequestException);
  });

  it('normalizes enum values', () => {
    expect(optionalEnum({ status: 'completed' }, 'status', ['PENDING', 'COMPLETED'] as const)).toBe('COMPLETED');
  });

  it('rejects arrays as request bodies', () => {
    expect(() => asObject([])).toThrow(BadRequestException);
  });
});
