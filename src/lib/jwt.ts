import crypto from 'crypto';
import { NextResponse } from 'next/server';

const JWT_SECRET = process.env.JWT_SECRET || 'DRX_HARDWARE_ULTRA_SECURE_JWT_SECRET_2026_x89q2';
const DEFAULT_EXPIRY = 60 * 60 * 24; // 24 hours

// Base64URL encoding/decoding helpers
function base64UrlEncode(str: string): string {
  return Buffer.from(str)
    .toString('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecode(str: string): string {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return Buffer.from(base64, 'base64').toString('utf8');
}

export interface JWTPayload {
  sub: string;
  email: string;
  name: string;
  role: string;
  iat?: number;
  exp?: number;
  [key: string]: any;
}

/**
 * Sign a secure JWT with HMAC-SHA256
 */
export function signJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>, expiresInSeconds = DEFAULT_EXPIRY): string {
  const header = {
    alg: 'HS256',
    typ: 'JWT',
  };

  const now = Math.floor(Date.now() / 1000);
  const fullPayload: JWTPayload = {
    ...payload,
    iat: now,
    exp: now + expiresInSeconds,
  };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac('sha256', JWT_SECRET)
    .update(signatureInput)
    .digest('base64')
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');

  return `${signatureInput}.${signature}`;
}

/**
 * Verify and decode a JWT token
 */
export function verifyJWT<T = JWTPayload>(token: string): T | null {
  try {
    if (!token || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    const [encodedHeader, encodedPayload, signature] = parts;
    const signatureInput = `${encodedHeader}.${encodedPayload}`;

    const expectedSignature = crypto
      .createHmac('sha256', JWT_SECRET)
      .update(signatureInput)
      .digest('base64')
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');

    // Constant-time comparison to prevent timing attacks
    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expectedSignature);
    if (sigBuffer.length !== expBuffer.length || !crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    const payload = JSON.parse(base64UrlDecode(encodedPayload)) as JWTPayload;

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp && payload.exp < now) {
      return null;
    }

    return payload as unknown as T;
  } catch (err) {
    return null;
  }
}

/**
 * Set HttpOnly, Secure, SameSite Cookie in Response
 */
export function setAuthCookie(response: NextResponse, token: string): void {
  response.cookies.set({
    name: 'drx_auth_token',
    value: token,
    httpOnly: true, // Prevents access via F12 console document.cookie / XSS
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

/**
 * Clear HttpOnly Auth Cookie
 */
export function clearAuthCookie(response: NextResponse): void {
  response.cookies.set({
    name: 'drx_auth_token',
    value: '',
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
    expires: new Date(0),
  });
}

/**
 * Extract auth user from Request cookies or Authorization header
 */
export function getAuthUserFromRequest(request: Request): JWTPayload | null {
  // 1. Try from cookie
  const cookieHeader = request.headers.get('cookie') || '';
  const match = cookieHeader.match(/drx_auth_token=([^;]+)/);
  if (match && match[1]) {
    const user = verifyJWT(match[1]);
    if (user) return user;
  }

  // 2. Try from Authorization Bearer header
  const authHeader = request.headers.get('authorization') || '';
  if (authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    const user = verifyJWT(token);
    if (user) return user;
  }

  return null;
}