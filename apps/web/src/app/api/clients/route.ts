import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search');
  const active = searchParams.get('active');

  const clients = await prisma.client.findMany({
    where: {
      organizationId: user.organizationId,
      ...(active === 'true' ? { isActive: true } : active === 'false' ? { isActive: false } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { contactName: { contains: search, mode: 'insensitive' } },
          { contactEmail: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      _count: { select: { sites: true, contracts: true } },
    },
    orderBy: { name: 'asc' },
  });

  return ok(clients);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const client = await prisma.client.create({
    data: {
      organizationId: user.organizationId,
      name: body.name,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
      notes: body.notes,
    },
  });
  return created(client);
}
