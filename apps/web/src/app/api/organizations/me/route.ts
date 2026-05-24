import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, hasRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const org = await prisma.organization.findUnique({ where: { id: user.organizationId } });
  return ok(org);
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'ADMIN')) return unauthorized('Insufficient permissions');

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const org = await prisma.organization.update({
    where: { id: user.organizationId },
    data: {
      name: body.name,
      email: body.email,
      phone: body.phone,
      address: body.address,
    },
  });
  return ok(org);
}
