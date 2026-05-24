import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signAccess, signRefresh, ok, unauthorized, badRequest } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.email || !body?.password) return badRequest('Email and password required');

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() },
    include: { organization: true },
  });

  if (!user || !user.isActive) return unauthorized('Invalid credentials');

  const valid = await bcrypt.compare(body.password, user.passwordHash);
  if (!valid) return unauthorized('Invalid credentials');

  const accessToken = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id, user.role);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  return ok({
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      organizationId: user.organizationId,
      organization: { name: user.organization.name },
    },
  });
}
