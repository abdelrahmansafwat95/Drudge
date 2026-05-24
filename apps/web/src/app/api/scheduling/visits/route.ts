import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const teamId = searchParams.get('teamId');
  const from = searchParams.get('from');
  const to = searchParams.get('to');

  const visits = await prisma.visit.findMany({
    where: {
      site: { client: { organizationId: user.organizationId } },
      ...(status ? { status: status as any } : {}),
      ...(teamId ? { teamId } : {}),
      ...(from || to ? {
        scheduledAt: {
          ...(from ? { gte: new Date(from) } : {}),
          ...(to ? { lte: new Date(to) } : {}),
        },
      } : {}),
    },
    include: {
      site: { include: { client: { select: { name: true } } } },
      team: { select: { name: true } },
    },
    orderBy: { scheduledAt: 'desc' },
  });

  return ok(visits);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const visit = await prisma.visit.create({
    data: {
      siteId: body.siteId,
      teamId: body.teamId,
      scheduleId: body.scheduleId || null,
      scheduledAt: new Date(body.scheduledAt),
      notes: body.notes || null,
    },
    include: {
      site: { include: { client: { select: { name: true } } } },
      team: { select: { name: true } },
    },
  });
  return created(visit);
}
