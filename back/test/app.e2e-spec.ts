import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Role, TaskStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/prisma/prisma.service';

describe('Task Manager API (e2e)', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  let adminAgent: ReturnType<typeof request.agent>;
  let employeeAgent: ReturnType<typeof request.agent>;
  let employeeId: string;
  let taskId: string;

  const adminEmail = 'e2e-admin@example.com';
  const employeeEmail = 'e2e-employee@example.com';
  const password = 'StrongPass123';

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({ imports: [AppModule] }).compile();
    app = moduleRef.createNestApplication();
    app.setGlobalPrefix('api/v1');
    await app.init();
    prisma = app.get(PrismaService);

    await prisma.comment.deleteMany({
      where: { author: { email: { in: [adminEmail, employeeEmail] } } },
    });
    await prisma.task.deleteMany({
      where: {
        OR: [
          { createdBy: { email: adminEmail } },
          { assignedTo: { email: employeeEmail } },
        ],
      },
    });
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, employeeEmail] } } });

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: await bcrypt.hash(password, 12),
        role: Role.ADMIN,
      },
    });
    const employee = await prisma.user.create({
      data: {
        email: employeeEmail,
        password: await bcrypt.hash(password, 12),
        role: Role.EMPLOYEE,
      },
    });
    employeeId = employee.id;

    adminAgent = request.agent(app.getHttpServer());
    employeeAgent = request.agent(app.getHttpServer());
    await adminAgent.post('/api/v1/auth/login').send({ email: adminEmail, password }).expect(200);
    await employeeAgent
      .post('/api/v1/auth/login')
      .send({ email: employeeEmail, password })
      .expect(200);
  });

  afterAll(async () => {
    if (taskId) await prisma.task.deleteMany({ where: { id: taskId } });
    await prisma.user.deleteMany({ where: { email: { in: [adminEmail, employeeEmail] } } });
    await app.close();
  });

  it('rejects invalid credentials with 401', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: adminEmail, password: 'WrongPass123' })
      .expect(401);
  });

  it('allows an admin to create and assign a task', async () => {
    const response = await adminAgent
      .post('/api/v1/tasks')
      .send({
        title: 'E2E task',
        description: 'Created by the automated API test',
        priority: 'HIGH',
        assignedToId: employeeId,
      })
      .expect(201);

    const task = response.body as { id: string; assignedTo: { id: string } };
    taskId = task.id;
    expect(task.assignedTo.id).toBe(employeeId);
  });

  it('prevents employees from creating tasks', () => {
    return employeeAgent.post('/api/v1/tasks').send({ title: 'Forbidden task' }).expect(403);
  });

  it('returns only the employee task collection', async () => {
    const response = await employeeAgent.get('/api/v1/tasks/my-tasks').expect(200);
    const result = response.body as { items: Array<{ id: string }> };
    expect(result.items.some((task) => task.id === taskId)).toBe(true);
  });

  it('allows the assignee to update task status and comment', async () => {
    await employeeAgent
      .patch(`/api/v1/tasks/${taskId}/status`)
      .send({ status: TaskStatus.IN_PROGRESS })
      .expect(200);

    const comment = await employeeAgent
      .post(`/api/v1/tasks/${taskId}/comments`)
      .send({ text: 'Work has started.' })
      .expect(201);
    const createdComment = comment.body as { author: { email: string } };
    expect(createdComment.author.email).toBe(employeeEmail);
  });

  it('allows the admin to delete the task', async () => {
    await adminAgent.delete(`/api/v1/tasks/${taskId}`).expect(204);
    taskId = '';
  });
});
