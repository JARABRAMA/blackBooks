import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });

    // La consulta incluye únicamente campos públicos; nunca se devuelve password.
    const transactions = await prisma.transaction.findMany({
      select: {
        id: true,
        type: true,
        notes: true,
        createdAt: true,
        actor: { select: { id: true, name: true, surnames: true, email: true } },
        reservation: {
          select: {
            id: true,
            user: { select: { id: true, name: true, surnames: true, email: true } },
            copy: { select: { id: true, code: true, book: { select: { id: true, title: true, author: true } } } },
          },
        },
        loan: {
          select: {
            id: true,
            user: { select: { id: true, name: true, surnames: true, email: true } },
            copy: { select: { id: true, code: true, book: { select: { id: true, title: true, author: true } } } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 500,
    });

    return NextResponse.json({ transactions });
  } catch (error) {
    console.error("Error fetching transactions:", error);
    return NextResponse.json({ error: "Error al obtener transacciones" }, { status: 500 });
  }
}
