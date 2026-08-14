import { SignJWT, jwtVerify } from 'jose';
import { appConfig } from '../config';
import type { Usuario } from '../types/user';

const STORAGE_KEY = 'cantina.authToken';
const SESSION_DURATION = '1d';

const secretKey = new TextEncoder().encode(appConfig.jwtSecret);

export async function createAuthToken(usuario: Usuario): Promise<string> {
  return new SignJWT({ nome: usuario.nome })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(String(usuario.id))
    .setIssuedAt()
    .setExpirationTime(SESSION_DURATION)
    .sign(secretKey);
}

export async function verifyAuthToken(token: string): Promise<Usuario | null> {
  try {
    const { payload } = await jwtVerify(token, secretKey);
    if (!payload.sub || typeof payload.nome !== 'string') return null;

    return { id: Number(payload.sub), nome: payload.nome };
  } catch {
    return null;
  }
}

export function saveAuthToken(token: string): void {
  localStorage.setItem(STORAGE_KEY, token);
}

export function getAuthToken(): string | null {
  return localStorage.getItem(STORAGE_KEY);
}

export function clearAuthToken(): void {
  localStorage.removeItem(STORAGE_KEY);
}
