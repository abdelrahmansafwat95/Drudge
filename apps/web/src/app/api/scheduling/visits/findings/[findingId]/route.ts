import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, noContent, unauthorized, notFound } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, props: { params: Promise<{ findingId: string }> }) {
  const { findingId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const finding = await prisma.finding.findUnique({ where: { id: findingId } });
  if (!finding) return notFound();

  const body = await req.json().catch(() => ({}));
  const updated = await prisma.finding.update({
    where: { id: findingId },
    data: {
      isResolved: body.isResolved ?? !finding.isResolved,
      description: body.description ?? finding.description,
      severity: body.severity ?? finding.severity,
    },
  });
  return ok(updated);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ findingId: string }> }) {
  const { findingId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  await prisma.finding.delete({ where: { id: findingId } }).catch(() => null);
  return noContent();
}
