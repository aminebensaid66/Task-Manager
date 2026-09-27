import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import { Role } from '@prisma/client';
import { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { AuthenticatedUser } from '../common/authenticated-user';
import { Roles } from '../common/roles.decorator';
import { RolesGuard } from '../common/roles.guard';
import { parseCreateUserInput, parseUpdateUserInput } from './dto/user.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(Role.ADMIN)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  list(@Query() query: Record<string, unknown>) {
    return this.usersService.list(this.usersService.parseListQuery(query));
  }

  @Post()
  create(@Body() body: unknown) {
    return this.usersService.create(parseCreateUserInput(body));
  }

  @Patch(':id')
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.usersService.update(id, request.user.userId, parseUpdateUserInput(body));
  }
}
