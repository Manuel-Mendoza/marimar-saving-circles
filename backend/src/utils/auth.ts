// Authentication utilities using Bun's native crypto APIs and PASETO

import { V4 as paseto } from "paseto";
import { generateKeyPairSync, createPrivateKey } from "crypto";

export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);

  // Generate salt
  const salt = crypto.getRandomValues(new Uint8Array(16));

  // Hash password with salt using PBKDF2
  const key = await crypto.subtle.importKey(
    "raw",
    data,
    { name: "PBKDF2" },
    false,
    ["deriveBits"],
  );

  const hash = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  // Combine salt and hash
  const hashArray = new Uint8Array(hash);
  const combined = new Uint8Array(salt.length + hashArray.length);
  combined.set(salt);
  combined.set(hashArray, salt.length);

  // Convert to base64 for storage
  return btoa(String.fromCharCode(...combined));
}

export async function verifyPassword(
  password: string,
  storedHash: string,
): Promise<boolean> {
  try {
    // Decode stored hash
    const combined = Uint8Array.from(atob(storedHash), (c) => c.charCodeAt(0));

    // Extract salt and hash
    const salt = combined.slice(0, 16);
    const originalHash = combined.slice(16);

    // Hash input password with same salt
    const encoder = new TextEncoder();
    const data = encoder.encode(password);

    const key = await crypto.subtle.importKey(
      "raw",
      data,
      { name: "PBKDF2" },
      false,
      ["deriveBits"],
    );

    const hash = await crypto.subtle.deriveBits(
      {
        name: "PBKDF2",
        salt: salt,
        iterations: 100000,
        hash: "SHA-256",
      },
      key,
      256,
    );

    const hashArray = new Uint8Array(hash);

    // Compare hashes
    if (hashArray.length !== originalHash.length) {
      return false;
    }

    return hashArray.every((byte, index) => byte === originalHash[index]);
  } catch (error) {
    console.error("Error verifying password:", error);
    return false;
  }
}

// Generate an Ed25519 private key for PASETO v4
export function generatePasetoKey(): string {
  const { privateKey } = generateKeyPairSync("ed25519", {
    privateKeyEncoding: { format: "pem", type: "pkcs8" },
    publicKeyEncoding: { format: "pem", type: "spki" },
  });
  return privateKey;
}

// Generate PASETO token
export async function generateToken(
  payload: object,
  secretKey: string,
): Promise<string> {
  try {
    // Create Ed25519 private key from PEM
    const privateKey = createPrivateKey(secretKey);

    // Create PASETO token with expiration
    const token = await paseto.sign(
      {
        ...payload,
        iat: new Date(),
        exp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
      privateKey,
    );

    return token;
  } catch (error) {
    console.error("Error generating PASETO token:", error);
    throw new Error("Failed to generate authentication token");
  }
}

// Verify PASETO token
export async function verifyToken(
  token: string,
  secretKey: string,
): Promise<object | null> {
  try {
    // Validate inputs
    if (!token || !secretKey) {
      console.error("Error verifying PASETO token: Missing token or secret key");
      return null;
    }

    // Validate token format
    if (!token.startsWith("v4.local.") && !token.startsWith("v4.public.")) {
      console.error("Error verifying PASETO token: Invalid token format");
      return null;
    }

    // Create Ed25519 private key from PEM
    const privateKey = createPrivateKey(secretKey);

    // Verify and decode the token
    const payload = await paseto.verify(token, privateKey);

    // Validate payload structure
    if (!payload || typeof payload !== "object") {
      console.error("Error verifying PASETO token: Invalid payload");
      return null;
    }

    // Check expiration
    if (payload.exp && new Date(payload.exp as string) < new Date()) {
      console.error("Error verifying PASETO token: Token expired");
      return null;
    }

    return payload;
  } catch (error) {
    console.error("Error verifying PASETO token:", error);
    
    // Provide specific error messages
    if (error instanceof Error) {
      if (error.message.includes("Invalid token")) {
        console.error("💡 The token format is invalid or corrupted");
      } else if (error.message.includes("Expired")) {
        console.error("💡 The token has expired");
      } else if (error.message.includes("Invalid signature")) {
        console.error("💡 The token signature is invalid");
      }
    }
    
    return null;
  }
}

// Extract user ID from token without full verification (for middleware)
export async function getTokenPayload(token: string): Promise<object | null> {
  try {
    // For PASETO v4, we can decode without verification to get basic info
    // In production middleware, you should verify the token
    const parts = token.split(".");
    if (parts.length !== 4 || !token.startsWith("v4.local.")) {
      return null;
    }

    // This is a simplified decode - in production, always verify the token
    // For middleware purposes, you might want to verify on each request
    return verifyToken(token, process.env.PASETO_SECRET!);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
}
