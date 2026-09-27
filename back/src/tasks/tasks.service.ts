import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  ActivityType,
  Prisma,
  Role,
  TaskStatus,
} from '@prisma/client';
import { AuthenticatedUser } from '../common/authenticated-user';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateTaskInput,
  UpdateTaskInput,
} from './dto/task.dto';
import { TaskQuery } from './dto/task-query.dto';

const userSummarySelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
} as const;

const taskListInclude = {
  assignedTo: { select: userSummarySelect },
  createdBy: { select: userSummarySelect },
  _count: { select: { comments: true } },
} as const;

const taskDetailInclude = {
  assignedTo: { select: userSummarySelect },
  createdBy: { select: userSummarySelect },
  comments: {
    include: { author: { select: userSummarySelect } },
    orderBy: { createdAt: 'asc' as const },
  },
  activities: {
    include: { actor: { select: userSummarySelect } },
    orderBy: { createdAt: 'desc' as const },
    take: 50,
  },
} as const;

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: TaskQuery, actor: AuthenticatedUser, onlyMine = false) {
    const where = this.buildWhere(query, onlyMine ? actor.userId : undefined);
    const [items, total] = await this.prisma.$transaction([
      this.prisma.task.findMany({
        where,
        include: taskListInclude,
        orderBy: [{ deadline: 'asc' }, { createdAt: 'desc' }],
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.task.count({ where }),
    ]);
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  async stats(actor: AuthenticatedUser) {
    const base: Prisma.TaskWhereInput = actor.role === Role.ADMIN ? {} : { assignedToId: actor.userId };
    const now = new Date();
    const [total, pending, inProgress, completed, overdue] = await this.prisma.$transaction([
      this.prisma.task.count({ where: base }),
      this.prisma.task.count({ where: { ...base, status: TaskStatus.PENDING } }),
      this.prisma.task.count({ where: { ...base, status: TaskStatus.IN_PROGRESS } }),
      this.prisma.task.count({ where: { ...base, status: TaskStatus.COMPLETED } }),
      this.prisma.task.count({
        where: {
          ...base,
          deadline: { lt: now },
          status: { not: TaskStatus.COMPLETED },
        },
      }),
    ]);
    return { total, pending, inProgress, completed, overdue };
  }

  async findOne(id: string, actor: AuthenticatedUser) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: taskDetailInclude,
    });
    if (!task) throw new NotFoundException('Task not found');
    this.assertCanAccess(task.assignedToId, actor);
    return task;
  }

  async create(input: CreateTaskInput, actor: AuthenticatedUser) {
    if (input.assignedToId) await this.assertAssignableEmployee(input.assignedToId);
    const task = await this.prisma.task.create({
      data: {
        ...input,
        createdById: actor.userId,
        completedAt: input.status === TaskStatus.COMPLETED ? new Date() : null,
      },
      include: taskDetailInclude,
    });
    await this.recordActivity(task.id, actor.userId, ActivityType.CREATED, {
      title: task.title,
    });
    return this.findOne(task.id, actor);
  }

  async update(id: string, input: UpdateTaskInput, actor: AuthenticatedUser) {
    await this.requireTask(id);
    if (input.assignedToId) await this.assertAssignableEmployee(input.assignedToId);
    const data: Prisma.TaskUncheckedUpdateInput = { ...input };
    if (input.status) {
      data.completedAt = input.status === TaskStatus.COMPLETED ? new Date() : null;
    }
    await this.prisma.task.update({ where: { id }, data });
    await this.recordActivity(id, actor.userId, ActivityType.UPDATED, this.activityMetadata(input));
    return this.findOne(id, actor);
  }

  async updateStatus(id: string, status: TaskStatus, actor: AuthenticatedUser) {
    const task = await this.requireTask(id);
    this.assertCanAccess(task.assignedToId, actor);
    await this.prisma.task.update({
      where: { id },
      data: {
        status,
        completedAt: status === TaskStatus.COMPLETED ? new Date() : null,
      },
    });
    await this.recordActivity(id, actor.userId, ActivityType.STATUS_CHANGED, { status });
    return this.findOne(id, actor);
  }

  async assign(id: string, userId: string | null, actor: AuthenticatedUser) {
    await this.requireTask(id);
    if (userId) await this.assertAssignableEmployee(userId);
    await this.prisma.task.update({
      where: { id },
      data: { assignedToId: userId },
    });
    await this.recordActivity(id, actor.userId, ActivityType.ASSIGNED, { userId });
    return this.findOne(id, actor);
  }

  async addComment(id: string, text: string, actor: AuthenticatedUser) {
    const task = await this.requireTask(id);
    this.assertCanAccess(task.assignedToId, actor);
    const comment = await this.prisma.comment.create({
      data: { taskId: id, authorId: actor.userId, text },
      include: { author: { select: userSummarySelect } },
    });
    await this.recordActivity(id, actor.userId, ActivityType.COMMENTED, {
      commentId: comment.id,
    });
    return comment;
  }

  async remove(id: string, actor: AuthenticatedUser) {
    const task = await this.requireTask(id);
    await this.recordActivity(id, actor.userId, ActivityType.DELETED, { title: task.title });
    await this.prisma.task.delete({ where: { id } });
  }

  private buildWhere(query: TaskQuery, forcedAssigneeId?: string): Prisma.TaskWhereInput {
    const now = new Date();
    const and: Prisma.TaskWhereInput[] = [];

    if (query.search) {
      and.push({
        OR: [
          { title: { contains: query.search, mode: 'insensitive' } },
          { description: { contains: query.search, mode: 'insensitive' } },
        ],
      });
    }
    if (query.overdue === true) {
      and.push({ deadline: { lt: now }, status: { not: TaskStatus.COMPLETED } });
    } else if (query.overdue === false) {
      and.push({
        OR: [
          { deadline: null },
          { deadline: { gte: now } },
          { status: TaskStatus.COMPLETED },
        ],
      });
    }

    return {
      ...(query.status ? { status: query.status } : {}),
      ...(query.priority ? { priority: query.priority } : {}),
      ...(forcedAssigneeId
        ? { assignedToId: forcedAssigneeId }
        : query.assigneeId
          ? { assignedToId: query.assigneeId }
          : {}),
      ...(and.length ? { AND: and } : {}),
    };
  }

  private async requireTask(id: string) {
    const task = await this.prisma.task.findUnique({ where: { id } });
    if (!task) throw new NotFoundException('Task not found');
    return task;
  }

  private assertCanAccess(assignedToId: string | null, actor: AuthenticatedUser) {
    if (actor.role === Role.ADMIN) return;
    if (assignedToId !== actor.userId) {
      throw new ForbiddenException('You may only access tasks assigned to you');
    }
  }

  private async assertAssignableEmployee(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.isActive || user.role !== Role.EMPLOYEE) {
      throw new NotFoundException('Active employee not found');
    }
  }

  private recordActivity(
    taskId: string,
    actorId: string,
    type: ActivityType,
    metadata?: Prisma.InputJsonValue,
  ) {
    return this.prisma.taskActivity.create({
      data: { taskId, actorId, type, metadata },
    });
  }

  private activityMetadata(input: UpdateTaskInput): Prisma.InputJsonValue {
    const normalized = Object.fromEntries(
      Object.entries(input)
        .filter(([, value]) => value !== undefined)
        .map(([key, value]) => [
          key,
          value instanceof Date ? value.toISOString() : value,
        ]),
    );
    return normalized as Prisma.InputJsonValue;
  }
}
