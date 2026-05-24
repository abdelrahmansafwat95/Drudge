import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const contract = await prisma.contract.create({
    data: {
      clientId: id,
      title: body.title,
      startDate: new Date(body.startDate),
      endDate: new Date(body.endDate),
      value: body.value ? parseFloat(body.value) : null,
      notes: body.notes,
    },
  });
  return created(contract);
}
