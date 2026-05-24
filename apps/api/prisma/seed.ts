import { PrismaClient, Role } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding...');

  const org = await prisma.organization.create({
    data: {
      name: 'PestControl Pro',
      email: 'info@pestcontrol.com',
      phone: '+201000000000',
      address: 'Cairo, Egypt',
    },
  });

  const branch = await prisma.branch.create({
    data: {
      organizationId: org.id,
      name: 'Main Branch - Cairo',
      address: 'Downtown Cairo',
      phone: '+201000000001',
    },
  });

  const passwordHash = await bcrypt.hash('Admin@123', 12);

  await prisma.user.create({
    data: {
      organizationId: org.id,
      email: 'superadmin@pestcontrol.com',
      passwordHash,
      role: Role.SUPER_ADMIN,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+201000000010',
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      branchId: branch.id,
      email: 'admin@pestcontrol.com',
      passwordHash,
      role: Role.ADMIN,
      firstName: 'Ahmed',
      lastName: 'Hassan',
      phone: '+201000000011',
    },
  });

  await prisma.user.create({
    data: {
      organizationId: org.id,
      branchId: branch.id,
      email: 'manager@pestcontrol.com',
      passwordHash,
      role: Role.MANAGER,
      firstName: 'Mohamed',
      lastName: 'Ali',
      phone: '+201000000012',
    },
  });

  const leader = await prisma.user.create({
    data: {
      organizationId: org.id,
      branchId: branch.id,
      email: 'leader@pestcontrol.com',
      passwordHash,
      role: Role.TEAM_LEADER,
      firstName: 'Omar',
      lastName: 'Ibrahim',
      phone: '+201000000013',
    },
  });

  const agent = await prisma.user.create({
    data: {
      organizationId: org.id,
      branchId: branch.id,
      email: 'agent@pestcontrol.com',
      passwordHash,
      role: Role.AGENT,
      firstName: 'Khalid',
      lastName: 'Mahmoud',
      phone: '+201000000014',
    },
  });

  const team = await prisma.team.create({
    data: {
      organizationId: org.id,
      branchId: branch.id,
      name: 'Alpha Team',
      leaderId: leader.id,
    },
  });

  await prisma.teamMember.createMany({
    data: [
      { teamId: team.id, userId: leader.id },
      { teamId: team.id, userId: agent.id },
    ],
  });

  const client = await prisma.client.create({
    data: {
      organizationId: org.id,
      name: 'Grand Nile Hotel',
      contactName: 'Sameh Fawzy',
      contactEmail: 'sameh@grandnile.com',
      contactPhone: '+201111111111',
      address: 'Corniche El Nile, Cairo',
    },
  });

  const site = await prisma.site.create({
    data: {
      clientId: client.id,
      name: 'Hotel Main Building',
      address: 'Corniche El Nile, Cairo',
      notes: 'Access through service entrance',
    },
  });

  await prisma.zone.createMany({
    data: [
      { siteId: site.id, name: 'Kitchen Area', description: 'Main kitchen and food storage' },
      { siteId: site.id, name: 'Basement', description: 'Storage and utility rooms' },
      { siteId: site.id, name: 'Guest Floors', description: 'Floors 1-15' },
    ],
  });

  await prisma.chemical.createMany({
    data: [
      { organizationId: org.id, name: 'Cypermethrin 25%', activeIngredient: 'Cypermethrin', unit: 'ml' },
      { organizationId: org.id, name: 'Deltamethrin 2.5%', activeIngredient: 'Deltamethrin', unit: 'ml' },
      { organizationId: org.id, name: 'Imidacloprid Gel', activeIngredient: 'Imidacloprid', unit: 'g' },
      { organizationId: org.id, name: 'Rodenticide Bait', activeIngredient: 'Brodifacoum', unit: 'g' },
    ],
  });

  const visit = await prisma.visit.create({
    data: {
      siteId: site.id,
      teamId: team.id,
      status: 'COMPLETED',
      scheduledAt: new Date(),
      startedAt: new Date(),
      completedAt: new Date(),
      notes: 'Monthly routine inspection completed successfully',
    },
  });

  await prisma.checklistItem.createMany({
    data: [
      { visitId: visit.id, description: 'Inspect kitchen drains', isCompleted: true },
      { visitId: visit.id, description: 'Check all bait stations', isCompleted: true },
      { visitId: visit.id, description: 'Spray perimeter', isCompleted: true },
      { visitId: visit.id, description: 'Document findings', isCompleted: true },
    ],
  });

  await prisma.contract.create({
    data: {
      clientId: client.id,
      title: 'Annual Pest Control Contract 2025',
      startDate: new Date('2025-01-01'),
      endDate: new Date('2025-12-31'),
      value: 24000,
      notes: 'Monthly visits included',
    },
  });

  console.log('✅ Seed complete!\n');
  console.log('LOGIN CREDENTIALS:');
  console.log('superadmin@pestcontrol.com / Admin@123');
  console.log('admin@pestcontrol.com      / Admin@123');
  console.log('manager@pestcontrol.com    / Admin@123');
  console.log('leader@pestcontrol.com     / Admin@123');
  console.log('agent@pestcontrol.com      / Admin@123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
