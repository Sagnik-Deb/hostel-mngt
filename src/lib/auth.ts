import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { NextRequest } from "next/server";

const JWT_SECRET = process.env.JWT_SECRET || "fallback-dev-secret";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string; // "STUDENT" | "ADMIN" | "PRIMARY_ADMIN" | "SUPER_ADMIN"
  hostelId: string;
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }
  const cookieToken = request.cookies.get("token")?.value;
  return cookieToken || null;
}

export function getAuthUser(request: NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}

export function requireAuth(request: NextRequest): JWTPayload {
  const user = getAuthUser(request);
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export function requireAdmin(request: NextRequest): JWTPayload {
  const user = requireAuth(request);
  if (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Admin access required");
  }
  return user;
}

export function requirePrimaryAdmin(request: NextRequest): JWTPayload {
  const user = requireAuth(request);
  if (user.role !== "PRIMARY_ADMIN" && user.role !== "SUPER_ADMIN") {
    throw new Error("Forbidden: Primary Admin access required");
  }
  return user;
}
