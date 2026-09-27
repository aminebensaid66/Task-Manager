import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
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
import {
  parseAssignInput,
  parseCommentInput,
  parseCreateTaskInput,
  parseStatusInput,
  parseUpdateTaskInput,
} from './dto/task.dto';
import { parseTaskQuery } from './dto/task-query.dto';
import { TasksService } from './tasks.service';

@Controller('tasks')
@UseGuards(JwtAuthGuard, RolesGuard)
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get('stats')
  stats(@Req() request: Request & { user: AuthenticatedUser }) {
    return this.tasksService.stats(request.user);
  }

  @Get('my-tasks')
  myTasks(
    @Query() query: Record<string, unknown>,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.list(parseTaskQuery(query), request.user, true);
  }

  @Get()
  @Roles(Role.ADMIN)
  list(
    @Query() query: Record<string, unknown>,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.list(parseTaskQuery(query), request.user);
  }

  @Get(':id')
  findOne(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.findOne(id, request.user);
  }

  @Post()
  @Roles(Role.ADMIN)
  create(
    @Body() body: unknown,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.create(parseCreateTaskInput(body), request.user);
  }

  @Patch(':id')
  @Roles(Role.ADMIN)
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.update(id, parseUpdateTaskInput(body), request.user);
  }

  @Patch(':id/status')
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.updateStatus(id, parseStatusInput(body).status, request.user);
  }

  @Patch(':id/assign')
  @Roles(Role.ADMIN)
  assign(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.assign(id, parseAssignInput(body).userId, request.user);
  }

  @Post(':id/comments')
  addComment(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() body: unknown,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    return this.tasksService.addComment(id, parseCommentInput(body).text, request.user);
  }

  @Delete(':id')
  @Roles(Role.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Req() request: Request & { user: AuthenticatedUser },
  ) {
    await this.tasksService.remove(id, request.user);
  }
}
