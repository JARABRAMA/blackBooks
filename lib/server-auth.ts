import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { prisma } from "@/lib/prisma";
import type { UserRole } from "@prisma/client";

export type SessionUser = { id: string; role: UserRole };

/**
 * Valida la cookie JWT y consulta el rol vigente en la base de datos.
 * No se usa un secreto por defecto: la aplicación falla de forma segura
 * si JWT_SECRET no está configurado.
 */
export async function getSessionUser(
  request: NextRequest
): Promise<SessionUser | null> {
  const secret = process.env.JWT_SECRET;
  const token = request.cookies.get("token")?.value;
  if (!secret || !token) return null;

  try {
    const payload = jwt.verify(token, secret) as jwt.JwtPayload & {
      userId?: string;
    };
    if (!payload.userId) return null;

    return await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, role: true },
    });
  } catch {
    return null;
  }
}
