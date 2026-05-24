-- ============================================================
-- PestControl Pro — Full Database Setup
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- Project: https://supabase.com/dashboard/project/qliqgoqiejeoppfbegek
-- ============================================================

-- ── ENUMS ────────────────────────────────────────────────────
CREATE TYPE "Role" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'MANAGER', 'TEAM_LEADER', 'AGENT', 'CLIENT_USER');
CREATE TYPE "VisitStatus" AS ENUM ('SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED');
CREATE TYPE "FindingSeverity" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- ── TABLES ───────────────────────────────────────────────────
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL, "name" TEXT NOT NULL, "email" TEXT, "phone" TEXT,
    "address" TEXT, "logoUrl" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Branch" (
    "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "address" TEXT, "phone" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Branch_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "User" (
    "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "branchId" TEXT,
    "email" TEXT NOT NULL, "passwordHash" TEXT NOT NULL, "role" "Role" NOT NULL,
    "firstName" TEXT NOT NULL, "lastName" TEXT NOT NULL, "phone" TEXT,
    "avatarUrl" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3), "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RefreshToken" (
    "id" TEXT NOT NULL, "userId" TEXT NOT NULL, "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Team" (
    "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "branchId" TEXT,
    "name" TEXT NOT NULL, "leaderId" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Team_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "TeamMember" (
    "id" TEXT NOT NULL, "teamId" TEXT NOT NULL, "userId" TEXT NOT NULL,
    "joinedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TeamMember_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Client" (
    "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "contactName" TEXT, "contactEmail" TEXT, "contactPhone" TEXT,
    "address" TEXT, "notes" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Client_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Contract" (
    "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL, "endDate" TIMESTAMP(3) NOT NULL,
    "value" DOUBLE PRECISION, "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Contract_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Site" (
    "id" TEXT NOT NULL, "clientId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "address" TEXT, "latitude" DOUBLE PRECISION, "longitude" DOUBLE PRECISION,
    "notes" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Site_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Zone" (
    "id" TEXT NOT NULL, "siteId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "description" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Zone_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Schedule" (
    "id" TEXT NOT NULL, "siteId" TEXT NOT NULL, "teamId" TEXT NOT NULL,
    "frequency" TEXT NOT NULL, "dayOfWeek" INTEGER, "dayOfMonth" INTEGER,
    "timeOfDay" TEXT, "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Schedule_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Visit" (
    "id" TEXT NOT NULL, "siteId" TEXT NOT NULL, "teamId" TEXT NOT NULL,
    "scheduleId" TEXT, "status" "VisitStatus" NOT NULL DEFAULT 'SCHEDULED',
    "scheduledAt" TIMESTAMP(3) NOT NULL, "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3), "notes" TEXT, "signature" TEXT, "signedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Visit_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChecklistItem" (
    "id" TEXT NOT NULL, "visitId" TEXT NOT NULL, "description" TEXT NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false, "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChecklistItem_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Finding" (
    "id" TEXT NOT NULL, "visitId" TEXT NOT NULL, "description" TEXT NOT NULL,
    "severity" "FindingSeverity" NOT NULL DEFAULT 'LOW', "location" TEXT,
    "imageUrl" TEXT, "isResolved" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Chemical" (
    "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "name" TEXT NOT NULL,
    "activeIngredient" TEXT, "unit" TEXT NOT NULL DEFAULT 'ml',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Chemical_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "ChemicalLog" (
    "id" TEXT NOT NULL, "visitId" TEXT NOT NULL, "chemicalId" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL, "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ChemicalLog_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Report" (
    "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "visitId" TEXT,
    "title" TEXT NOT NULL, "type" TEXT NOT NULL, "language" TEXT NOT NULL DEFAULT 'en',
    "fileUrl" TEXT, "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Report_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Notification" (
    "id" TEXT NOT NULL, "organizationId" TEXT NOT NULL, "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL, "message" TEXT NOT NULL, "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- ── INDEXES ──────────────────────────────────────────────────
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");
CREATE UNIQUE INDEX "TeamMember_teamId_userId_key" ON "TeamMember"("teamId", "userId");

-- ── FOREIGN KEYS ─────────────────────────────────────────────
ALTER TABLE "Branch" ADD CONSTRAINT "Branch_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "User" ADD CONSTRAINT "User_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_branchId_fkey" FOREIGN KEY ("branchId") REFERENCES "Branch"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Team" ADD CONSTRAINT "Team_leaderId_fkey" FOREIGN KEY ("leaderId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "TeamMember" ADD CONSTRAINT "TeamMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Client" ADD CONSTRAINT "Client_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Contract" ADD CONSTRAINT "Contract_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Site" ADD CONSTRAINT "Site_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "Client"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Zone" ADD CONSTRAINT "Zone_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Schedule" ADD CONSTRAINT "Schedule_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "Site"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Visit" ADD CONSTRAINT "Visit_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "Team"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChecklistItem" ADD CONSTRAINT "ChecklistItem_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Chemical" ADD CONSTRAINT "Chemical_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChemicalLog" ADD CONSTRAINT "ChemicalLog_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "ChemicalLog" ADD CONSTRAINT "ChemicalLog_chemicalId_fkey" FOREIGN KEY ("chemicalId") REFERENCES "Chemical"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Report" ADD CONSTRAINT "Report_visitId_fkey" FOREIGN KEY ("visitId") REFERENCES "Visit"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- ── SEED DATA ────────────────────────────────────────────────
-- All passwords: Admin@123
DO $$
DECLARE
  org_id TEXT := 'org_pestcontrol_001';
  branch_id TEXT := 'branch_cairo_001';
  user_superadmin TEXT := 'user_superadmin_001';
  user_admin TEXT := 'user_admin_001';
  user_manager TEXT := 'user_manager_001';
  user_leader TEXT := 'user_leader_001';
  user_agent TEXT := 'user_agent_001';
  team_id TEXT := 'team_alpha_001';
  client_id TEXT := 'client_nile_001';
  site_id TEXT := 'site_hotel_001';
  visit_id TEXT := 'visit_001_completed';
  chem1 TEXT := 'chem_001';
  chem2 TEXT := 'chem_002';
  chem3 TEXT := 'chem_003';
  chem4 TEXT := 'chem_004';
  pw_hash TEXT := '$2a$12$grx7vjZRUi3ghCId8irpmOjzuFAo6Cnbc8/ASaPfwkPwQO4gYqUgK';
BEGIN

  INSERT INTO "Organization" (id, name, email, phone, address) VALUES
    (org_id, 'PestControl Pro', 'info@pestcontrol.com', '+201000000000', 'Cairo, Egypt');

  INSERT INTO "Branch" (id, "organizationId", name, address, phone) VALUES
    (branch_id, org_id, 'Main Branch - Cairo', 'Downtown Cairo', '+201000000001');

  INSERT INTO "User" (id, "organizationId", "branchId", email, "passwordHash", role, "firstName", "lastName", phone) VALUES
    (user_superadmin, org_id, NULL,      'superadmin@pestcontrol.com', pw_hash, 'SUPER_ADMIN',  'Super',   'Admin',   '+201000000010'),
    (user_admin,      org_id, branch_id, 'admin@pestcontrol.com',      pw_hash, 'ADMIN',        'Ahmed',   'Hassan',  '+201000000011'),
    (user_manager,    org_id, branch_id, 'manager@pestcontrol.com',    pw_hash, 'MANAGER',      'Mohamed', 'Ali',     '+201000000012'),
    (user_leader,     org_id, branch_id, 'leader@pestcontrol.com',     pw_hash, 'TEAM_LEADER',  'Omar',    'Ibrahim', '+201000000013'),
    (user_agent,      org_id, branch_id, 'agent@pestcontrol.com',      pw_hash, 'AGENT',        'Khalid',  'Mahmoud', '+201000000014');

  INSERT INTO "Team" (id, "organizationId", "branchId", name, "leaderId") VALUES
    (team_id, org_id, branch_id, 'Alpha Team', user_leader);

  INSERT INTO "TeamMember" (id, "teamId", "userId") VALUES
    ('tm_001', team_id, user_leader),
    ('tm_002', team_id, user_agent);

  INSERT INTO "Client" (id, "organizationId", name, "contactName", "contactEmail", "contactPhone", address) VALUES
    (client_id, org_id, 'Grand Nile Hotel', 'Sameh Fawzy', 'sameh@grandnile.com', '+201111111111', 'Corniche El Nile, Cairo');

  INSERT INTO "Contract" (id, "clientId", title, "startDate", "endDate", value, notes) VALUES
    ('contract_001', client_id, 'Annual Pest Control Contract 2025', '2025-01-01', '2025-12-31', 24000, 'Monthly visits included');

  INSERT INTO "Site" (id, "clientId", name, address, notes) VALUES
    (site_id, client_id, 'Hotel Main Building', 'Corniche El Nile, Cairo', 'Access through service entrance');

  INSERT INTO "Zone" (id, "siteId", name, description) VALUES
    ('zone_001', site_id, 'Kitchen Area',  'Main kitchen and food storage'),
    ('zone_002', site_id, 'Basement',      'Storage and utility rooms'),
    ('zone_003', site_id, 'Guest Floors',  'Floors 1-15');

  INSERT INTO "Chemical" (id, "organizationId", name, "activeIngredient", unit) VALUES
    (chem1, org_id, 'Cypermethrin 25%',  'Cypermethrin',  'ml'),
    (chem2, org_id, 'Deltamethrin 2.5%', 'Deltamethrin',  'ml'),
    (chem3, org_id, 'Imidacloprid Gel',  'Imidacloprid',  'g'),
    (chem4, org_id, 'Rodenticide Bait',  'Brodifacoum',   'g');

  INSERT INTO "Visit" (id, "siteId", "teamId", status, "scheduledAt", "startedAt", "completedAt", notes) VALUES
    (visit_id, site_id, team_id, 'COMPLETED', NOW(), NOW(), NOW(), 'Monthly routine inspection completed successfully');

  INSERT INTO "ChecklistItem" (id, "visitId", description, "isCompleted", "completedAt") VALUES
    ('ci_001', visit_id, 'Inspect kitchen drains',  true, NOW()),
    ('ci_002', visit_id, 'Check all bait stations', true, NOW()),
    ('ci_003', visit_id, 'Spray perimeter',          true, NOW()),
    ('ci_004', visit_id, 'Document findings',        true, NOW());

  INSERT INTO "ChemicalLog" (id, "visitId", "chemicalId", quantity, notes) VALUES
    ('cl_001', visit_id, chem1, 500, 'Applied along baseboards'),
    ('cl_002', visit_id, chem4, 200, 'Placed in bait stations');

END $$;

-- ── VERIFY ───────────────────────────────────────────────────
SELECT 'Setup complete! All tables created and seeded.' AS status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
