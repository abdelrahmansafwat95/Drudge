import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound, hasRole } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'ADMIN')) return unauthorized('Insufficient permissions');

  const user = await prisma.user.findUnique({ where: { id }, select: { isActive: true } });
  if (!user) return notFound();

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    select: { id: true, isActive: true },
  });
  return ok(updated);
}
