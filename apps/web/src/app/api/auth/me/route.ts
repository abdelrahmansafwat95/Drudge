import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id: auth.sub },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, avatarUrl: true, isActive: true,
      lastLoginAt: true, organizationId: true, branchId: true,
      organization: { select: { name: true } },
    },
  });

  if (!user || !user.isActive) return unauthorized();
  return ok(user);
}
