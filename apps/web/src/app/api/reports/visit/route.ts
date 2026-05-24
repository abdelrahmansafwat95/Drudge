import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized, notFound } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  if (!body.visitId) return notFound('Visit ID required');

  const visit = await prisma.visit.findUnique({
    where: { id: body.visitId },
    include: {
      site: { include: { client: { select: { name: true } } } },
      team: { select: { name: true } },
      checklistItems: true,
      findings: true,
      chemicalLogs: { include: { chemical: { select: { name: true, unit: true } } } },
    },
  });
  if (!visit) return notFound('Visit not found');

  const report = await prisma.report.create({
    data: {
      organizationId: user.organizationId,
      visitId: body.visitId,
      title: `Visit Report - ${visit.site.name} - ${new Date(visit.scheduledAt).toLocaleDateString()}`,
      type: 'VISIT',
      language: body.language || 'en',
    },
  });

  return created({ ...report, visit });
}
