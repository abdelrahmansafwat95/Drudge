import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, noContent, unauthorized, notFound } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const visit = await prisma.visit.findUnique({
    where: { id },
    include: {
      site: { include: { client: { select: { name: true, id: true } }, zones: true } },
      team: {
        include: {
          members: { include: { user: { select: { firstName: true, lastName: true } } } },
        },
      },
      checklistItems: true,
      findings: true,
      chemicalLogs: { include: { chemical: { select: { name: true, unit: true } } } },
    },
  });

  if (!visit) return notFound();
  return ok(visit);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const visit = await prisma.visit.update({
    where: { id },
    data: {
      siteId: body.siteId,
      teamId: body.teamId,
      scheduledAt: body.scheduledAt ? new Date(body.scheduledAt) : undefined,
      notes: body.notes,
    },
  }).catch(() => null);

  if (!visit) return notFound();
  return ok(visit);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  await prisma.visit.delete({ where: { id } }).catch(() => null);
  return noContent();
}
