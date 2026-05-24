import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string; itemId: string }> }) {
  const { itemId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const item = await prisma.checklistItem.findUnique({ where: { id: itemId } });
  if (!item) return notFound();

  const updated = await prisma.checklistItem.update({
    where: { id: itemId },
    data: {
      isCompleted: !item.isCompleted,
      completedAt: !item.isCompleted ? new Date() : null,
    },
  });
  return ok(updated);
}
