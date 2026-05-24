import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const reports = await prisma.report.findMany({
    where: { organizationId: user.organizationId },
    include: {
      visit: { include: { site: { include: { client: { select: { name: true } } } } } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return ok(reports);
}
