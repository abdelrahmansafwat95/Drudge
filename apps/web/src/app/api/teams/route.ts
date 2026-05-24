import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized, hasRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const teams = await prisma.team.findMany({
    where: { organizationId: user.organizationId },
    include: {
      leader: { select: { id: true, firstName: true, lastName: true } },
      members: {
        include: { user: { select: { id: true, firstName: true, lastName: true, role: true } } },
      },
      _count: { select: { visits: true } },
    },
    orderBy: { name: 'asc' },
  });

  return ok(teams);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const team = await prisma.team.create({
    data: {
      organizationId: user.organizationId,
      branchId: body.branchId || null,
      name: body.name,
      leaderId: body.leaderId || null,
    },
  });
  return created(team);
}
