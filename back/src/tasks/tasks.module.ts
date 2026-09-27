import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { RolesGuard } from '../common/roles.guard';
import { PrismaModule } from '../prisma/prisma.module';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [TasksController],
  providers: [TasksService, RolesGuard],
})
export class TasksModule {}
