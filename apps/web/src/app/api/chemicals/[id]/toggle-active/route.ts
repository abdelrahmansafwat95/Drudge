import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound, hasRole } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  const chemical = await prisma.chemical.findUnique({ where: { id }, select: { isActive: true } });
  if (!chemical) return notFound();

  const updated = await prisma.chemical.update({
    where: { id },
    data: { isActive: !chemical.isActive },
    select: { id: true, isActive: true },
  });
  return ok(updated);
}
