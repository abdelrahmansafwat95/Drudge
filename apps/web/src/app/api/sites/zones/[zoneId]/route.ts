import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, noContent, unauthorized, notFound } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, props: { params: Promise<{ zoneId: string }> }) {
  const { zoneId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const zone = await prisma.zone.update({
    where: { id: zoneId },
    data: { name: body.name, description: body.description },
  }).catch(() => null);

  if (!zone) return notFound();
  return ok(zone);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ zoneId: string }> }) {
  const { zoneId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  await prisma.zone.delete({ where: { id: zoneId } }).catch(() => null);
  return noContent();
}
