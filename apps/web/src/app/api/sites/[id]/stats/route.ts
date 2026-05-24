import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const [totalVisits, completedVisits, pendingVisits, zones] = await Promise.all([
    prisma.visit.count({ where: { siteId: id } }),
    prisma.visit.count({ where: { siteId: id, status: 'COMPLETED' } }),
    prisma.visit.count({ where: { siteId: id, status: 'SCHEDULED' } }),
    prisma.zone.count({ where: { siteId: id } }),
  ]);

  return ok({ totalVisits, completedVisits, pendingVisits, zones });
}
