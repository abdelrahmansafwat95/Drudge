import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, hasRole } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string; userId: string }> }) {
  const { id, userId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  const team = await prisma.team.update({
    where: { id },
    data: { leaderId: userId },
  });
  return ok(team);
}
