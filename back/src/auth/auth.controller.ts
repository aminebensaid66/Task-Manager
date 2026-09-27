import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { AuthenticatedUser } from '../common/authenticated-user';
import { env } from '../config/env';
import { AuthService } from './auth.service';
import { parseLoginInput, parseSignupInput } from './dto/auth.dto';
import { JwtAuthGuard } from './jwt-auth.guard';

const cookieOptions = () => ({
  httpOnly: true,
  secure: env.cookieSecure,
  sameSite: 'lax' as const,
  path: '/',
  maxAge: env.jwtExpiresInSeconds * 1000,
});

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('config')
  config() {
    return { publicSignupEnabled: env.allowPublicSignup };
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async login(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = parseLoginInput(body);
    const result = await this.authService.login(input.email, input.password);
    response.cookie(env.accessCookieName, result.token, cookieOptions());
    return { user: result.user };
  }

  @Post('signup')
  async signup(@Body() body: unknown, @Res({ passthrough: true }) response: Response) {
    const input = parseSignupInput(body);
    const result = await this.authService.signup(input.email, input.password);
    response.cookie(env.accessCookieName, result.token, cookieOptions());
    return { user: result.user };
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  me(@Req() request: Request & { user: AuthenticatedUser }) {
    return this.authService.getCurrentUser(request.user.userId);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  logout(@Res({ passthrough: true }) response: Response) {
    response.clearCookie(env.accessCookieName, {
      httpOnly: true,
      secure: env.cookieSecure,
      sameSite: 'lax',
      path: '/',
    });
  }
}
