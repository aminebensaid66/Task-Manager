-- Domain enums
CREATE TYPE "Role" AS ENUM ('ADMIN', 'EMPLOYEE');
CREATE TYPE "TaskStatus" AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED');
CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH');
CREATE TYPE "ActivityType" AS ENUM ('CREATED', 'UPDATED', 'ASSIGNED', 'STATUS_CHANGED', 'COMMENTED', 'DELETED');

-- Upgrade the original User table without losing existing accounts.
ALTER TABLE "User"
  ALTER COLUMN "role" TYPE "Role"
  USING (CASE WHEN lower("role") = 'admin' THEN 'ADMIN' ELSE 'EMPLOYEE' END)::"Role";

ALTER TABLE "User"
  ALTER COLUMN "role" SET DEFAULT 'EMPLOYEE',
  ADD COLUMN "isActive" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

CREATE INDEX "User_role_isActive_idx" ON "User"("role", "isActive");

CREATE TABLE "Task" (
  "id" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "description" TEXT,
  "deadline" TIMESTAMP(3),
  "priority" "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "TaskStatus" NOT NULL DEFAULT 'PENDING',
  "completedAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "assignedToId" TEXT,
  "createdById" TEXT NOT NULL,
  CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Comment" (
  "id" TEXT NOT NULL,
  "text" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "taskId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  CONSTRAINT "Comment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TaskActivity" (
  "id" TEXT NOT NULL,
  "type" "ActivityType" NOT NULL,
  "metadata" JSONB,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "taskId" TEXT NOT NULL,
  "actorId" TEXT,
  CONSTRAINT "TaskActivity_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Task_status_idx" ON "Task"("status");
CREATE INDEX "Task_priority_idx" ON "Task"("priority");
CREATE INDEX "Task_deadline_idx" ON "Task"("deadline");
CREATE INDEX "Task_assignedToId_status_idx" ON "Task"("assignedToId", "status");
CREATE INDEX "Task_createdById_idx" ON "Task"("createdById");
CREATE INDEX "Comment_taskId_createdAt_idx" ON "Comment"("taskId", "createdAt");
CREATE INDEX "Comment_authorId_idx" ON "Comment"("authorId");
CREATE INDEX "TaskActivity_taskId_createdAt_idx" ON "TaskActivity"("taskId", "createdAt");
CREATE INDEX "TaskActivity_actorId_idx" ON "TaskActivity"("actorId");

ALTER TABLE "Task" ADD CONSTRAINT "Task_assignedToId_fkey"
  FOREIGN KEY ("assignedToId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Task" ADD CONSTRAINT "Task_createdById_fkey"
  FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Comment" ADD CONSTRAINT "Comment_authorId_fkey"
  FOREIGN KEY ("authorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_taskId_fkey"
  FOREIGN KEY ("taskId") REFERENCES "Task"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TaskActivity" ADD CONSTRAINT "TaskActivity_actorId_fkey"
  FOREIGN KEY ("actorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
