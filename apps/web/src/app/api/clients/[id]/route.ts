import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound, hasRole } from '@/lib/auth-helpers';

export async function GET(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const client = await prisma.client.findUnique({
    where: { id },
    include: {
      sites: { include: { _count: { select: { visits: true, zones: true } } } },
      contracts: true,
      _count: { select: { sites: true, contracts: true } },
    },
  });
  if (!client) return notFound();
  return ok(client);
}

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const client = await prisma.client.update({
    where: { id },
    data: {
      name: body.name,
      contactName: body.contactName,
      contactEmail: body.contactEmail,
      contactPhone: body.contactPhone,
      address: body.address,
      notes: body.notes,
    },
  }).catch(() => null);

  if (!client) return notFound();
  return ok(client);
}
