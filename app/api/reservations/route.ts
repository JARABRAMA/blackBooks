import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const { bookId } = await request.json();
    if (typeof bookId !== "string" || !bookId.trim()) return NextResponse.json({ error: "bookId es requerido" }, { status: 400 });

    const reservation = await prisma.$transaction(async (tx) => {
      // updateMany hace que solo una solicitud pueda reclamar el ejemplar disponible.
      const availableCopy = await tx.bookCopy.findFirst({ where: { bookId, status: "AVAILABLE" }, orderBy: { createdAt: "asc" } });
      if (!availableCopy) throw new Error("NO_COPY_AVAILABLE");
      const claimed = await tx.bookCopy.updateMany({ where: { id: availableCopy.id, status: "AVAILABLE" }, data: { status: "RESERVED" } });
      if (claimed.count !== 1) throw new Error("NO_COPY_AVAILABLE");
      const created = await tx.reservation.create({
        data: { userId: session.id, copyId: availableCopy.id, status: "PENDING", expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) },
      });
      await tx.transaction.create({
        data: { type: "RESERVATION", reservationId: created.id, actorId: session.id, notes: "Reserva creada" },
      });
      return created;
    });

    return NextResponse.json({ message: "Reserva realizada exitosamente", reservation }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "NO_COPY_AVAILABLE") return NextResponse.json({ error: "No hay ejemplares disponibles" }, { status: 409 });
    console.error("Error creating reservation:", error);
    return NextResponse.json({ error: "Error al crear reserva" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const reservations = await prisma.reservation.findMany({
      where: session.role === "ADMIN" ? undefined : { userId: session.id },
      include: { copy: { include: { book: true } }, user: { select: { id: true, name: true, surnames: true, email: true } } },
      orderBy: { reservedAt: "desc" },
    });
    return NextResponse.json({ reservations });
  } catch (error) {
    console.error("Error fetching reservations:", error);
    return NextResponse.json({ error: "Error al obtener reservas" }, { status: 500 });
  }
}
