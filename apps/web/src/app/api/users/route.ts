import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized, conflict, hasRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const role = searchParams.get('role');
  const search = searchParams.get('search');

  const users = await prisma.user.findMany({
    where: {
      organizationId: user.organizationId,
      ...(role ? { role: role as any } : {}),
      ...(search ? {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, isActive: true, lastLoginAt: true,
      branchId: true, branch: { select: { name: true } },
    },
    orderBy: { firstName: 'asc' },
  });

  return ok(users);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'ADMIN')) return unauthorized('Insufficient permissions');

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const exists = await prisma.user.findUnique({ where: { email: body.email?.toLowerCase() } });
  if (exists) return conflict('Email already in use');

  const passwordHash = await bcrypt.hash(body.password || 'Admin@123', 12);
  const newUser = await prisma.user.create({
    data: {
      organizationId: user.organizationId,
      branchId: body.branchId || null,
      email: body.email.toLowerCase(),
      passwordHash,
      role: body.role,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone || null,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, isActive: true,
    },
  });

  return created(newUser);
}
