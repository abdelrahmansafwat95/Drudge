import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const site = await prisma.site.findUnique({ where: { id }, select: { isActive: true } });
  if (!site) return notFound();

  const updated = await prisma.site.update({
    where: { id },
    data: { isActive: !site.isActive },
    select: { id: true, isActive: true },
  });
  return ok(updated);
}
