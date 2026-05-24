import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const visit = await prisma.visit.update({
    where: { id },
    data: {
      signature: body.signature,
      signedBy: body.signedBy || null,
    },
  }).catch(() => null);

  if (!visit) return notFound();
  return ok(visit);
}
