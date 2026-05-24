import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthUser, noContent, unauthorized } from '@/lib/auth-helpers';

export async function DELETE(req: NextRequest, props: { params: Promise<{ logId: string }> }) {
  const { logId } = await props.params;
  const auth = await getAuthUser(req);
  if (!auth) return unauthorized();

  await prisma.chemicalLog.delete({ where: { id: logId } }).catch(() => null);
  return noContent();
}
