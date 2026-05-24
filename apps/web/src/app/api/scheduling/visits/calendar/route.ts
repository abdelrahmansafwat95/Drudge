import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const year = parseInt(searchParams.get('year') || String(new Date().getFullYear()));
  const month = parseInt(searchParams.get('month') || String(new Date().getMonth() + 1));

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

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
