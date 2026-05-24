import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { prisma } from './prisma';

const ROLE_LEVEL: Record<string, number> = {
  SUPER_ADMIN: 100, ADMIN: 80, MANAGER: 60, TEAM_LEADER: 40, AGENT: 20, CLIENT_USER: 10,
};

export async function getAuthUser(req: NextRequest) {
  const header = req.headers.get('authorization');
  if (!header?.startsWith('Bearer ')) return null;
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET!) as { sub: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      include: { organization: true, branch: true },
    });
    if (!user || !user.isActive) return null;
    return user;
  } catch {
    return null;
  }
}

export function hasRole(user: any, minRole: string) {
  return (ROLE_LEVEL[user.role] || 0) >= (ROLE_LEVEL[minRole] || 0);
}

export function signAccess(sub: string, role: string) {
  return jwt.sign({ sub, role }, process.env.JWT_SECRET!, {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as any,
  });
}

export function signRefresh(sub: string, role: string) {
  return jwt.sign({ sub, role }, process.env.JWT_REFRESH_SECRET!, {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as any,
  });
}

export const ok = (data: any, status = 200) => NextResponse.json(data, { status });
export const unauthorized = (msg = 'Unauthorized') => NextResponse.json({ message: msg }, { status: 401 });
export const forbidden = (msg = 'Forbidden') => NextResponse.json({ message: msg }, { status: 403 });
export const notFound = (msg = 'Not found') => NextResponse.json({ message: msg }, { status: 404 });
export const badRequest = (msg: string) => NextResponse.json({ message: msg }, { status: 400 });
export const conflict = (msg: string) => NextResponse.json({ message: msg }, { status: 409 });
