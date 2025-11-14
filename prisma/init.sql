-- AdminUser table
CREATE TABLE IF NOT EXISTS "AdminUser" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Member table
CREATE TABLE IF NOT EXISTS "Member" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "group" TEXT NOT NULL,
  "isActive" BOOLEAN NOT NULL DEFAULT true,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Session table
CREATE TABLE IF NOT EXISTS "Session" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "name" TEXT NOT NULL,
  "note" TEXT,
  "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "publicToken" TEXT NOT NULL UNIQUE,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- SessionMember table
CREATE TABLE IF NOT EXISTS "SessionMember" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE("sessionId", "memberId")
);

-- Attendance table
CREATE TABLE IF NOT EXISTS "Attendance" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "sessionId" TEXT NOT NULL,
  "memberId" TEXT NOT NULL,
  "checkedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "ip" TEXT,
  "userAgent" TEXT,
  UNIQUE("sessionId", "memberId")
);

-- Create indexes
CREATE INDEX IF NOT EXISTS "Member_phone_idx" ON "Member"("phone");
CREATE INDEX IF NOT EXISTS "Session_publicToken_idx" ON "Session"("publicToken");
CREATE INDEX IF NOT EXISTS "SessionMember_sessionId_idx" ON "SessionMember"("sessionId");
CREATE INDEX IF NOT EXISTS "Attendance_sessionId_idx" ON "Attendance"("sessionId");

-- Insert default admin user
INSERT INTO "AdminUser" ("id", "email", "password", "createdAt")
VALUES ('ttc91kaoyqnac6x7byescj', 'admin@joyful.app', '$2a$10$4/aYKSPcmqaWsLaHdTfKiePJRcWdaBPru1XWlq6mCb1v9vCwWYTy2', CURRENT_TIMESTAMP);
