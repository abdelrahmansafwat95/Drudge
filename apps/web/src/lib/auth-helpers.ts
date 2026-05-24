import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const ACCESS_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!;
const ACCESS_EXPIRES = process.env.JWT_EXPIRES_IN || '15m';
const REFRESH_EXPIRES = process.env.JWT_REFRESH_EXPIRES_IN || '7d';

const ROLE_LEVELS: Record<string, number> = {
  SUPER_ADMIN: 100,
  ADMIN: 80,
  MANAGER: 60,
  TEAM_LEADER: 40,
  AGENT: 20,
  CLIENT_USER: 10,
};

export function signAccess(sub: string, role: string): string {
  return jwt.sign({ sub, role }, ACCESS_SECRET, { expiresIn: ACCESS_EXPIRES } as jwt.SignOptions);
}

export function signRefresh(sub: string, role: string): string {
  return jwt.sign({ sub, role }, REFRESH_SECRET, { expiresIn: REFRESH_EXPIRES } as jwt.SignOptions);
}

export function verifyAccess(token: string): { sub: string; role: string } | null {
  try {
    return jwt.verify(token, ACCESS_SECRET) as { sub: string; role: string };
  } catch {
    return null;
  }
}

export function verifyRefresh(token: string): { sub: string; role: string } | null {
  try {
    return jwt.verify(token, REFRESH_SECRET) as { sub: string; role: string };
  } catch {
    return null;
  }
}

export async function getAuthUser(req: NextRequest): Promise<{ sub: string; role: string } | null> {
  const auth = req.headers.get('authorization');
  if (!auth?.startsWith('Bearer ')) return null;
  const token = auth.slice(7);
  return verifyAccess(token);
}

export function hasRole(user: { role: string }, minRole: string): boolean {
  return (ROLE_LEVELS[user.role] ?? 0) >= (ROLE_LEVELS[minRole] ?? 0);
}

export const ok = (data: unknown, status = 200) =>
  NextResponse.json(data, { status });

export const created = (data: unknown) =>
  NextResponse.json(data, { status: 201 });

export const noContent = () =>
  new NextResponse(null, { status: 204 });

export const unauthorized = (msg = 'Unauthorized') =>
  NextResponse.json({ message: msg }, { status: 401 });

export const forbidden = (msg = 'Forbidden') =>
  NextResponse.json({ message: msg }, { status: 403 });

export const notFound = (msg = 'Not found') =>
  NextResponse.json({ message: msg }, { status: 404 });

export const badRequest = (msg = 'Bad request') =>
  NextResponse.json({ message: msg }, { status: 400 });

export const conflict = (msg = 'Conflict') =>
  NextResponse.json({ message: msg }, { status: 409 });

export const serverError = (msg = 'Internal server error') =>
  NextResponse.json({ message: msg }, { status: 500 });
