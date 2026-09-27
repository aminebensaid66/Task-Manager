import { BadRequestException } from '@nestjs/common';
import { TaskPriority, TaskStatus } from '@prisma/client';
import {
  asObject,
  optionalDate,
  optionalEnum,
  optionalString,
  optionalUuid,
  rejectUnknownKeys,
  requiredString,
} from '../../common/validation';

export interface CreateTaskInput {
  title: string;
  description?: string | null;
  deadline?: Date | null;
  priority: TaskPriority;
  status: TaskStatus;
  assignedToId?: string | null;
}

export interface UpdateTaskInput {
  title?: string;
  description?: string | null;
  deadline?: Date | null;
  priority?: TaskPriority;
  status?: TaskStatus;
  assignedToId?: string | null;
}

const taskKeys = ['title', 'description', 'deadline', 'priority', 'status', 'assignedToId'];

export const parseCreateTaskInput = (body: unknown): CreateTaskInput => {
  const value = asObject(body);
  rejectUnknownKeys(value, taskKeys);
  return {
    title: requiredString(value, 'title', { min: 1, max: 160 }),
    description: optionalString(value, 'description', { max: 5000, nullable: true }),
    deadline: optionalDate(value, 'deadline'),
    priority:
      optionalEnum(value, 'priority', Object.values(TaskPriority)) ?? TaskPriority.MEDIUM,
    status: optionalEnum(value, 'status', Object.values(TaskStatus)) ?? TaskStatus.PENDING,
    assignedToId: optionalUuid(value, 'assignedToId', { nullable: true }),
  };
};

export const parseUpdateTaskInput = (body: unknown): UpdateTaskInput => {
  const value = asObject(body);
  rejectUnknownKeys(value, taskKeys);
  const result: UpdateTaskInput = {
    title:
      value.title === undefined
        ? undefined
        : requiredString(value, 'title', { min: 1, max: 160 }),
    description: optionalString(value, 'description', { max: 5000, nullable: true }),
    deadline: optionalDate(value, 'deadline'),
    priority: optionalEnum(value, 'priority', Object.values(TaskPriority)),
    status: optionalEnum(value, 'status', Object.values(TaskStatus)),
    assignedToId: optionalUuid(value, 'assignedToId', { nullable: true }),
  };
  if (Object.values(result).every((entry) => entry === undefined)) {
    throw new BadRequestException('At least one field must be provided');
  }
  return result;
};

export const parseStatusInput = (body: unknown) => {
  const value = asObject(body);
  rejectUnknownKeys(value, ['status']);
  const status = optionalEnum(value, 'status', Object.values(TaskStatus));
  if (!status) throw new BadRequestException('status is required');
  return { status };
};

export const parseAssignInput = (body: unknown) => {
  const value = asObject(body);
  rejectUnknownKeys(value, ['userId']);
  const userId = optionalUuid(value, 'userId', { nullable: true });
  if (userId === undefined) throw new BadRequestException('userId is required and may be null');
  return { userId };
};

export const parseCommentInput = (body: unknown) => {
  const value = asObject(body);
  rejectUnknownKeys(value, ['text']);
  return { text: requiredString(value, 'text', { min: 1, max: 2000 }) };
};
