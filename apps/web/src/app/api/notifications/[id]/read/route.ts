import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, notFound } from '@/lib/auth-helpers';

export async function PATCH(req: NextRequest, props: { params: Promise<{ id: string }> }) {
  const { id } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const notification = await prisma.notification.update({
    where: { id, userId: auth.sub },
    data: { isRead: true },
  }).catch(() => null);

  if (!notification) return notFound();
  return ok(notification);
}
