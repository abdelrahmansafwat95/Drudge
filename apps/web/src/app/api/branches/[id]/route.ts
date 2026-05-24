import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, noContent, unauthorized, notFound, hasRole } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'ADMIN')) return unauthorized('Insufficient permissions');

  const body = await req.json().catch(() => ({}));
  const branch = await prisma.branch.update({
    where: { id },
    data: { name: body.name, address: body.address, phone: body.phone },
  }).catch(() => null);

  if (!branch) return notFound('Branch not found');
  return ok(branch);
}

export async function DELETE(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'ADMIN')) return unauthorized('Insufficient permissions');

  await prisma.branch.delete({ where: { id } }).catch(() => null);
  return noContent();
}
