import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Role } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

const publicUserSelect = {
  id: true,
  email: true,
  role: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user || !user.isActive || !(await bcrypt.compare(password, user.password))) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const safeUser = await this.prisma.user.findUniqueOrThrow({
      where: { id: user.id },
      select: publicUserSelect,
    });
    return { user: safeUser, token: this.sign(user.id, user.email, user.role) };
  }

  async signup(email: string, password: string) {
    if (!env.allowPublicSignup) {
      throw new ForbiddenException('Public signup is disabled. Ask an administrator to create your account.');
    }

    const normalizedEmail = email.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) throw new BadRequestException('An account with this email already exists');

    const user = await this.prisma.user.create({
      data: {
        email: normalizedEmail,
        password: await bcrypt.hash(password, 12),
        role: Role.EMPLOYEE,
      },
      select: publicUserSelect,
    });

    return { user, token: this.sign(user.id, user.email, user.role) };
  }

  async getCurrentUser(userId: string) {
    return this.prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: publicUserSelect,
    });
  }

  private sign(userId: string, email: string, role: Role) {
    return this.jwtService.sign(
      { sub: userId, email, role },
      { expiresIn: env.jwtExpiresInSeconds },
    );
  }
}
