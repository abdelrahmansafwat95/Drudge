import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound, hasRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, isActive: true, lastLoginAt: true,
      branchId: true, organizationId: true,
    },
  });
  if (!user) return notFound();
  return ok(user);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'ADMIN')) return unauthorized('Insufficient permissions');

  const body = await req.json().catch(() => ({}));
  const user = await prisma.user.update({
    where: { id },
    data: {
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      role: body.role,
      branchId: body.branchId || null,
    },
    select: {
      id: true, email: true, firstName: true, lastName: true,
      role: true, phone: true, isActive: true,
    },
  }).catch(() => null);

  if (!user) return notFound();
  return ok(user);
}
