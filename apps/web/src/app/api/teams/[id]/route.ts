import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, noContent, unauthorized, notFound, hasRole } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  const body = await req.json().catch(() => ({}));
  const team = await prisma.team.update({
    where: { id },
    data: { name: body.name, leaderId: body.leaderId || null, branchId: body.branchId || null },
  }).catch(() => null);

  if (!team) return notFound();
  return ok(team);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  await prisma.team.delete({ where: { id } }).catch(() => null);
  return noContent();
}
