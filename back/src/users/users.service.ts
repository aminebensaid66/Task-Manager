import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserInput, UpdateUserInput } from './dto/user.dto';

export const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async list(query: { search?: string; role?: Role; page: number; limit: number }) {
    const where: Prisma.UserWhereInput = {
      ...(query.role ? { role: query.role } : {}),
      ...(query.search
        ? { email: { contains: query.search.toLowerCase(), mode: 'insensitive' } }
        : {}),
    };
    const [items, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        select: publicUserSelect,
        orderBy: { createdAt: 'desc' },
        skip: (query.page - 1) * query.limit,
        take: query.limit,
      }),
      this.prisma.user.count({ where }),
    ]);
    return {
      items,
      total,
      page: query.page,
      limit: query.limit,
      totalPages: Math.max(1, Math.ceil(total / query.limit)),
    };
  }

  async create(input: CreateUserInput) {
    const email = input.email.toLowerCase();
    if (await this.prisma.user.findUnique({ where: { email } })) {
      throw new ConflictException('An account with this email already exists');
    }
    return this.prisma.user.create({
      data: {
        email,
        password: await bcrypt.hash(input.password, 12),
        role: input.role,
      },
      select: publicUserSelect,
    });
  }

  async update(id: string, actorId: string, input: UpdateUserInput) {
    const target = await this.prisma.user.findUnique({ where: { id } });
    if (!target) throw new NotFoundException('User not found');

    if (id === actorId && (input.isActive === false || (input.role && input.role !== target.role))) {
      throw new BadRequestException('You cannot deactivate yourself or change your own role');
    }

    const removesAdmin =
      target.role === Role.ADMIN &&
      (input.role === Role.EMPLOYEE || input.isActive === false);
    if (removesAdmin && target.isActive) {
      const activeAdmins = await this.prisma.user.count({
        where: { role: Role.ADMIN, isActive: true },
      });
      if (activeAdmins <= 1) {
        throw new BadRequestException('The last active administrator cannot be removed');
      }
    }

    return this.prisma.user.update({
      where: { id },
      data: input,
      select: publicUserSelect,
    });
  }

  parseListQuery(raw: Record<string, unknown>) {
    const page = Number(raw.page ?? 1);
    const requestedLimit = Number(raw.limit ?? 20);
    if (!Number.isInteger(page) || page <= 0 || !Number.isInteger(requestedLimit) || requestedLimit <= 0) {
      throw new BadRequestException('page and limit must be positive integers');
    }
    const search = typeof raw.search === 'string' ? raw.search.trim().slice(0, 100) : undefined;
    const roleRaw = typeof raw.role === 'string' ? raw.role.toUpperCase() : undefined;
    if (roleRaw && !Object.values(Role).includes(roleRaw as Role)) {
      throw new BadRequestException(`role must be one of: ${Object.values(Role).join(', ')}`);
    }
    return {
      page,
      limit: Math.min(requestedLimit, env.maxPageSize),
      search: search || undefined,
      role: roleRaw as Role | undefined,
    };
  }
}
