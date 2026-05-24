import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound, badRequest } from '@/lib/auth-helpers';

const VALID_STATUSES = ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'];

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  if (!VALID_STATUSES.includes(body.status)) return badRequest('Invalid status');

  const data: Record<string, unknown> = { status: body.status };
  if (body.status === 'IN_PROGRESS') data.startedAt = new Date();
  if (body.status === 'COMPLETED') data.completedAt = new Date();

  const visit = await prisma.visit.update({ where: { id }, data }).catch(() => null);
  if (!visit) return notFound();
  return ok(visit);
}
