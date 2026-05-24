import { NextRequest } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { getAuthUser, ok, unauthorized, badRequest } from '@/lib/auth-helpers';

export async function POST(req: NextRequest) {
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  const body = await req.json().catch(() => null);
  if (!body?.currentPassword || !body?.newPassword) return badRequest('Both passwords required');

  const user = await prisma.user.findUnique({ where: { id: auth.sub } });
  if (!user) return unauthorized();

  const valid = await bcrypt.compare(body.currentPassword, user.passwordHash);
  if (!valid) return unauthorized('Current password incorrect');

  const passwordHash = await bcrypt.hash(body.newPassword, 12);
  await prisma.user.update({ where: { id: auth.sub }, data: { passwordHash } });

  return ok({ message: 'Password changed' });
}
