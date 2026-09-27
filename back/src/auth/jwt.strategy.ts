import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Role } from '@prisma/client';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { AuthenticatedUser } from '../common/authenticated-user';
import { env } from '../config/env';
import { PrismaService } from '../prisma/prisma.service';

const cookieExtractor = (request: Request): string | null => {
  const header = request.headers.cookie;
  if (!header) return null;
  const cookies = header.split(';').map((part) => part.trim());
  const prefix = `${env.accessCookieName}=`;
  const cookie = cookies.find((item) => item.startsWith(prefix));
  return cookie ? decodeURIComponent(cookie.slice(prefix.length)) : null;
};

interface JwtPayload {
  sub: string;
  email: string;
  role: Role;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        cookieExtractor,
      ]),
      ignoreExpiration: false,
      secretOrKey: env.jwtSecret,
    });
  }

  async validate(payload: JwtPayload): Promise<AuthenticatedUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, email: true, role: true, isActive: true },
    });
    if (!user?.isActive) throw new UnauthorizedException('Account is inactive');
    return { userId: user.id, email: user.email, role: user.role };
  }
}
