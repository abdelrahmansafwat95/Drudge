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
  const clientId = searchParams.get('clientId');

  const sites = await prisma.site.findMany({
    where: {
      client: { organizationId: user.organizationId },
      ...(clientId ? { clientId } : {}),
      ...(search ? {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { address: { contains: search, mode: 'insensitive' } },
        ],
      } : {}),
    },
    include: {
      client: { select: { name: true } },
      _count: { select: { zones: true, visits: true } },
    },
    orderBy: { name: 'asc' },
  });

  return ok(sites);
}

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const site = await prisma.site.create({
    data: {
      clientId: body.clientId,
      name: body.name,
      address: body.address,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      notes: body.notes,
    },
  });
  return created(site);
}
