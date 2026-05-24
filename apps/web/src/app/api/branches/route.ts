import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized, hasRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const branches = await prisma.branch.findMany({
    where: { organizationId: user.organizationId },
    orderBy: { name: 'asc' },
  });
  return ok(branches);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'ADMIN')) return unauthorized('Insufficient permissions');

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const branch = await prisma.branch.create({
    data: {
      organizationId: user.organizationId,
      name: body.name,
      address: body.address,
      phone: body.phone,
    },
  });
  return created(branch);
}
