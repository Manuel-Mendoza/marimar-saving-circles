// Authentication utilities using Bun's native crypto APIs and PASETO

import { V4 as paseto } from 'paseto';

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Hash password with salt using PBKDF2
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  );

  // Combine salt and hash
  const hashArray = new Uint8Array(hash);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  try {
    // Decode stored hash
    const combined = Uint8Array.from(atob(storedHash), c => c.charCodeAt(0));

    // Extract salt and hash
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);

    // Hash input password with same salt
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );

    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    );

    const hashArray = new Uint8Array(hash);

    // Compare hashes
    if (hashArray.length !== originalHash.length) {
      return false;
    }

    return hashArray.every((byte, index) => byte === originalHash[index]);
  } catch (error) {
    console.error('Error verifying password:', error);
    return false;
  }
}

// Generate a secure random key for PASETO
export function generatePasetoKey(): string {
  const keyBytes = crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...keyBytes));
}

// Generate PASETO token
export async function generateToken(payload: object, secretKey: string): Promise<string> {
  try {
    // Decode the base64 secret key
    const keyBytes = Uint8Array.from(atob(secretKey), c => c.charCodeAt(0));

    // Create PASETO token with expiration
    const token = await paseto.sign(
      {
        ...payload,
        iat: new Date(),
        exp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
      },
      keyBytes,
      {
        issuer: 'marimar-saving-circles',
        audience: 'marimar-users'
      }
    );

    return token;
  } catch (error) {
    console.error('Error generating PASETO token:', error);
    throw new Error('Failed to generate authentication token');
  }
}

// Verify PASETO token
export async function verifyToken(token: string, secretKey: string): Promise<object | null> {
  try {
    // Decode the base64 secret key
    const keyBytes = Uint8Array.from(atob(secretKey), c => c.charCodeAt(0));

    // Verify and decode the token
    const payload = await paseto.verify(token, keyBytes, {
      issuer: 'marimar-saving-circles',
      audience: 'marimar-users',
      clockTolerance: '1 minute'
    });

    return payload;
  } catch (error) {
    console.error('Error verifying PASETO token:', error);
    return null;
  }
}

// Extract user ID from token without full verification (for middleware)
export async function getTokenPayload(token: string): Promise<object | null> {
  try {
    // For PASETO v4, we can decode without verification to get basic info
    // In production middleware, you should verify the token
    const parts = token.split('.');
    if (parts.length !== 4 || !token.startsWith('v4.local.')) {
      return null;
    }

    // This is a simplified decode - in production, always verify the token
    // For middleware purposes, you might want to verify on each request
    return verifyToken(token, process.env.PASETO_SECRET!);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
}
