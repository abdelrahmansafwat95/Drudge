import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const user = await getAuthUser(req);
  if (user) {
    await prisma.refreshToken.deleteMany({ where: { userId: user.sub } });
  }
  return ok({ message: 'Logged out' });
}
