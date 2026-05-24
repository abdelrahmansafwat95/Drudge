import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyRefresh, signAccess, signRefresh, ok, unauthorized } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  const token = body?.refreshToken;
  if (!token) return unauthorized('Refresh token required');

  const payload = verifyRefresh(token);
  if (!payload) return unauthorized('Invalid or expired refresh token');

  const stored = await prisma.refreshToken.findUnique({ where: { token } });
  if (!stored || stored.expiresAt < new Date()) return unauthorized('Refresh token expired');

  await prisma.refreshToken.delete({ where: { token } });

  const user = await prisma.user.findUnique({ where: { id: stored.userId } });
  if (!user || !user.isActive) return unauthorized('User inactive');

  const accessToken = signAccess(user.id, user.role);
  const refreshToken = signRefresh(user.id, user.role);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      token: refreshToken,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    },
  });

  return ok({ accessToken, refreshToken });
}
