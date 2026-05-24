import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const visits = await prisma.visit.findMany({
    where: { site: { clientId: id } },
    include: {
      site: { select: { name: true } },
      team: { select: { name: true } },
    },
    orderBy: { scheduledAt: 'desc' },
    take: 20,
  });
  return ok(visits);
}
