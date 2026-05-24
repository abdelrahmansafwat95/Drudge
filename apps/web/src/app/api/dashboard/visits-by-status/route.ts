import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const counts = await prisma.visit.groupBy({
    by: ['status'],
    where: {
      site: { client: { organizationId: user.organizationId } },
      scheduledAt: { gte: startOfMonth },
    },
    _count: { status: true },
  });

  return ok(counts.map((c) => ({ status: c.status, count: c._count.status })));
}
