import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, noContent, unauthorized, hasRole } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  await prisma.teamMember.upsert({
    where: { teamId_userId: { teamId: id, userId } },
    create: { teamId: id, userId },
    update: {},
  });
  return ok({ message: 'Member added' });
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  await prisma.teamMember.delete({
    where: { teamId_userId: { teamId: id, userId } },
  }).catch(() => null);
  return noContent();
}
