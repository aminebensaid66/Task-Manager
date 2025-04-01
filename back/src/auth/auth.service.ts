import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService, private jwtService: JwtService) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (user && (await bcrypt.compare(password, user.password))) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(email: string, password: string) {
    const user = await this.validateUser(email, password);
    if (!user) {
      return { error: 'Invalid credentials' };
    }
    const token = this.jwtService.sign({ userId: user.id, email: user.email, role: user.role });
    return { token, user };
  }

  async signup(email: string, password: string, role: string = 'user') {
    const existingUser = await this.prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new BadRequestException('email deja utulisé');
    }
    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        role:'employee',
      },
    });

    const token = this.jwtService.sign({ userId: newUser.id, email: newUser.email, role: newUser.role });

    return { message: 'Signup successful', token, user: { id: newUser.id, email: newUser.email, role: newUser.role } };
  }
}