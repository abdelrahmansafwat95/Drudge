import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const visits = await prisma.visit.findMany({
    where: {
      site: { client: { organizationId: user.organizationId } },
      status: { in: ['SCHEDULED', 'IN_PROGRESS'] },
    },
    include: {
      site: { include: { client: { select: { name: true } } } },
      team: {
        include: {
          leader: { select: { firstName: true, lastName: true } },
          members: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      },
    },
    orderBy: { scheduledAt: 'asc' },
  });

  return ok(visits);
}
