import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const year = body.year || new Date().getFullYear();
  const month = body.month || new Date().getMonth() + 1;

  const start = new Date(year, month - 1, 1);
  const end = new Date(year, month, 1);

  const visits = await prisma.visit.findMany({
    where: {
      site: { client: { organizationId: user.organizationId } },
      scheduledAt: { gte: start, lt: end },
    },
    include: {
      site: { include: { client: { select: { name: true } } } },
    },
  });

  const report = await prisma.report.create({
    data: {
      organizationId: user.organizationId,
      title: `Monthly Report - ${year}/${String(month).padStart(2, '0')}`,
      type: 'MONTHLY',
      language: body.language || 'en',
    },
  });

  return created({ ...report, summary: { totalVisits: visits.length, month, year } });
}
