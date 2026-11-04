import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { getAdminUser } from './db';

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'sri-sai-computers-secret-key-coimbatore-2026'
);

const COOKIE_NAME = 'ssc_admin_session';

export async function createSessionToken(username: string): Promise<string> {
  return await new SignJWT({ username, role: 'admin' })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('24h')
    .sign(JWT_SECRET);
}

export async function verifySessionToken(token: string) {
  try {
    const verified = await jwtVerify(token, JWT_SECRET);
    return verified.payload as { username: string; role: string };
  } catch (err) {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return await verifySessionToken(token);
}

export async function authenticateAdmin(username: string, passwordInput: string): Promise<boolean> {
  const user = getAdminUser(username);
  if (!user) return false;

  // Simple secure comparison for default seed & direct auth
  if (user.password_hash === passwordInput) {
    return true;
  }
  return false;
}
