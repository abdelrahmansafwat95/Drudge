import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound, hasRole } from '@/lib/auth-helpers';

export async function PUT(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();
  if (!hasRole(auth, 'MANAGER')) return unauthorized('Insufficient permissions');

  const body = await req.json().catch(() => ({}));
  const chemical = await prisma.chemical.update({
    where: { id },
    data: {
      name: body.name,
      activeIngredient: body.activeIngredient || null,
      unit: body.unit || 'ml',
    },
  }).catch(() => null);

  if (!chemical) return notFound();
  return ok(chemical);
}
