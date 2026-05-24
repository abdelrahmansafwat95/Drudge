import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const teams = await prisma.team.findMany({
    where: { organizationId: user.organizationId },
    include: {
      leader: { select: { firstName: true, lastName: true } },
      _count: { select: { visits: true, members: true } },
      visits: {
        where: { status: 'COMPLETED' },
        select: { id: true },
      },
    },
  });

  return ok(teams.map((t) => ({
    id: t.id,
    name: t.name,
    leader: t.leader,
    totalVisits: t._count.visits,
    completedVisits: t.visits.length,
    memberCount: t._count.members,
    completionRate: t._count.visits > 0 ? Math.round((t.visits.length / t._count.visits) * 100) : 0,
  })));
}
