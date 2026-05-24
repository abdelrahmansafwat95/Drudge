import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, created, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => ({}));
  const finding = await prisma.finding.create({
    data: {
      visitId: id,
      description: body.description,
      severity: body.severity || 'LOW',
      location: body.location || null,
      imageUrl: body.imageUrl || null,
    },
  });
  return created(finding);
}
