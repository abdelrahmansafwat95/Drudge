import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized } from '@/lib/auth-helpers';

export async function GET(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const notifications = await prisma.notification.findMany({
    where: { userId: auth.sub },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  return ok(notifications);
}
