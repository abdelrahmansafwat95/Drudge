import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const orgId = user.organizationId;
  const [total, active, inactive] = await Promise.all([
    prisma.client.count({ where: { organizationId: orgId } }),
    prisma.client.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.client.count({ where: { organizationId: orgId, isActive: false } }),
  ]);

  return ok({ total, active, inactive });
}
