import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const today = new Date();
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const end = new Date(start.getTime() + 24 * 60 * 60 * 1000);

  const visits = await prisma.visit.findMany({
    where: {
      site: { client: { organizationId: user.organizationId } },
      scheduledAt: { gte: start, lt: end },
    },
    include: {
      site: { include: { client: { select: { name: true } } } },
      team: { select: { name: true } },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return ok(visits);
}
