import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const log = await prisma.chemicalLog.create({
    data: {
      visitId: id,
      chemicalId: body.chemicalId,
      quantity: parseFloat(body.quantity),
      notes: body.notes || null,
    },
    include: {
      chemical: { select: { name: true, unit: true } },
    },
  });
  return created(log);
}
