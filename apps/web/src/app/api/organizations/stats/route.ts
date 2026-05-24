import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const orgId = user.organizationId;

  const [users, branches, teams, clients, sites] = await Promise.all([
    prisma.user.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.branch.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.team.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.client.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.site.count({ where: { client: { organizationId: orgId }, isActive: true } }),
  ]);

  return ok({ users, branches, teams, clients, sites });
}
