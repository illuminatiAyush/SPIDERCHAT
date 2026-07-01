import * as jose from "jose";

export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("CRITICAL: JWT_SECRET environment variable is not set in production.");
    }
    console.warn("⚠️ Using default development JWT secret. Do NOT use in production!");
    return new TextEncoder().encode("default_secret_for_development");
  }
  return new TextEncoder().encode(secret);
}

export interface AuthPayload extends jose.JWTPayload {
  userId: string;
  username: string;
}

export async function verifyAuthToken(token: string): Promise<AuthPayload> {
  try {
    const secret = getJwtSecret();
    const { payload } = await jose.jwtVerify(token, secret);
    return payload as AuthPayload;
  } catch (error) {
    throw new Error("Invalid or expired token");
  }
}

export async function signAuthToken(payload: any, expiresIn: string = "7d") {
  const secret = getJwtSecret();
  return new jose.SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(secret);
}
