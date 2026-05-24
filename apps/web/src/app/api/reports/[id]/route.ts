import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, noContent, unauthorized, notFound } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const report = await prisma.report.findUnique({
    where: { id },
    include: {
      visit: {
        include: {
          site: { include: { client: true, zones: true } },
          team: { select: { name: true } },
          checklistItems: true,
          findings: true,
          chemicalLogs: { include: { chemical: true } },
        },
      },
    },
  });
  if (!report) return notFound();
  return ok(report);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  await prisma.report.delete({ where: { id } }).catch(() => null);
  return noContent();
}
