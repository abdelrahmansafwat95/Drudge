import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized, hasRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const schedules = await prisma.schedule.findMany({
    where: { site: { client: { organizationId: user.organizationId } } },
    include: {
      site: { include: { client: { select: { name: true } } } },
      team: { select: { name: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ok(schedules);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  const body = await req.json().catch(() => ({}));
  const schedule = await prisma.schedule.create({
    data: {
      siteId: body.siteId,
      teamId: body.teamId,
      frequency: body.frequency,
      dayOfWeek: body.dayOfWeek ?? null,
      dayOfMonth: body.dayOfMonth ?? null,
      timeOfDay: body.timeOfDay ?? null,
    },
  });
  return created(schedule);
}
