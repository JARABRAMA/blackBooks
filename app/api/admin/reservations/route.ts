import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const reservations = await prisma.reservation.findMany({
      include: {
        user: { select: { id: true, name: true, surnames: true, email: true } },
        copy: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        reservedAt: "desc",
      },
    });

    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json(
      { error: "Error al obtener reservas" },
      { status: 500 }
    );
  }
}
