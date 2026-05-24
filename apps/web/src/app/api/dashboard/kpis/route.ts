import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const orgId = user.organizationId;
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalClients, activeClients, totalSites, activeSites, totalVisits, completedVisits, scheduledVisits] = await Promise.all([
    prisma.client.count({ where: { organizationId: orgId } }),
    prisma.client.count({ where: { organizationId: orgId, isActive: true } }),
    prisma.site.count({ where: { client: { organizationId: orgId } } }),
    prisma.site.count({ where: { client: { organizationId: orgId }, isActive: true } }),
    prisma.visit.count({ where: { site: { client: { organizationId: orgId } }, scheduledAt: { gte: startOfMonth } } }),
    prisma.visit.count({ where: { site: { client: { organizationId: orgId } }, status: 'COMPLETED', scheduledAt: { gte: startOfMonth } } }),
    prisma.visit.count({ where: { site: { client: { organizationId: orgId } }, status: 'SCHEDULED' } }),
  ]);

  return ok({
    totalClients,
    activeClients,
    totalSites,
    activeSites,
    totalVisits,
    completedVisits,
    scheduledVisits,
    completionRate: totalVisits > 0 ? Math.round((completedVisits / totalVisits) * 100) : 0,
  });
}
