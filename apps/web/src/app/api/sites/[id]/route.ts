import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const site = await prisma.site.findUnique({
    where: { id },
    include: {
      client: { select: { name: true, id: true } },
      zones: true,
      _count: { select: { visits: true } },
    },
  });
  if (!site) return notFound();
  return ok(site);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const site = await prisma.site.update({
    where: { id },
    data: {
      name: body.name,
      address: body.address,
      latitude: body.latitude ? parseFloat(body.latitude) : null,
      longitude: body.longitude ? parseFloat(body.longitude) : null,
      notes: body.notes,
    },
  }).catch(() => null);

  if (!site) return notFound();
  return ok(site);
}
