import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const client = await prisma.client.findUnique({ where: { id }, select: { isActive: true } });
  if (!client) return notFound();

  const updated = await prisma.client.update({
    where: { id },
    data: { isActive: !client.isActive },
    select: { id: true, isActive: true },
  });
  return ok(updated);
}
