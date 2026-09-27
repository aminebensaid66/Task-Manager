import { BadRequestException } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import { env } from '../../config/env';

export interface TaskQuery {
  page: number;
  limit: number;
  search?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  assigneeId?: string;
  overdue?: boolean;
}

export const parseTaskQuery = (raw: Record<string, unknown>): TaskQuery => {
  const page = Number(raw.page ?? 1);
  const requestedLimit = Number(raw.limit ?? 20);
  if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(requestedLimit) || requestedLimit <= 0) {
    throw new BadRequestException('page and limit must be positive integers');
  }

  const enumValue = <T extends string>(value: unknown, values: readonly T[], name: string): T | undefined => {
    if (value === undefined || value === '') return undefined;
    if (typeof value !== 'string') throw new BadRequestException(`${name} must be a string`);
    const normalized = value.toUpperCase() as T;
    if (!values.includes(normalized)) throw new BadRequestException(`${name} has an invalid value`);
    return normalized;
  };

  const assigneeId = typeof raw.assigneeId === 'string' && raw.assigneeId ? raw.assigneeId : undefined;
  if (assigneeId && !/^[0-9a-f-]{36}$/i.test(assigneeId)) {
    throw new BadRequestException('assigneeId must be a UUID');
  }

  let overdue: boolean | undefined;
  if (raw.overdue !== undefined && raw.overdue !== '') {
    if (raw.overdue === 'true' || raw.overdue === true) overdue = true;
    else if (raw.overdue === 'false' || raw.overdue === false) overdue = false;
    else throw new BadRequestException('overdue must be true or false');
  }

  const search = typeof raw.search === 'string' ? raw.search.trim().slice(0, 100) : undefined;
  return {
    page,
    limit: Math.min(requestedLimit, env.maxPageSize),
    search: search || undefined,
    status: enumValue(raw.status, Object.values(TaskStatus), 'status'),
    priority: enumValue(raw.priority, Object.values(TaskPriority), 'priority'),
    assigneeId,
    overdue,
  };
};
