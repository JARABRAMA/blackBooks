import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    const loans = await prisma.loan.findMany({
      where: session.role === "ADMIN" ? undefined : { userId: session.id },
      include: { copy: { include: { book: true } }, user: { select: { id: true, name: true, surnames: true, email: true } } },
      orderBy: { loanDate: "desc" },
    });
    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    return NextResponse.json({ error: "Error al obtener préstamos" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ error: "No tienes permisos para registrar préstamos" }, { status: 403 });

    const { reservationId, userId, copyId } = await request.json();
    if (!userId || !copyId) return NextResponse.json({ error: "userId y copyId son requeridos" }, { status: 400 });

    const result = await prisma.$transaction(async (tx) => {
      const copy = await tx.bookCopy.findUnique({ where: { id: copyId } });
      if (!copy) throw new Error("COPY_NOT_FOUND");
      if (reservationId) {
        const reservation = await tx.reservation.findUnique({ where: { id: reservationId } });
        if (!reservation || reservation.userId !== userId || reservation.copyId !== copyId || reservation.status !== "PENDING") {
          throw new Error("RESERVATION_INVALID");
        }
        if (copy.status !== "RESERVED") throw new Error("COPY_UNAVAILABLE");
      } else if (copy.status !== "AVAILABLE") {
        throw new Error("COPY_UNAVAILABLE");
      }

      const loan = await tx.loan.create({
        data: {
          userId, copyId, reservationId: reservationId || null,
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          status: "ACTIVE",
        },
      });
      await tx.bookCopy.update({ where: { id: copyId }, data: { status: "LOANED" } });
      if (reservationId) {
        await tx.reservation.update({ where: { id: reservationId }, data: { status: "FULFILLED", fulfilledAt: new Date() } });
      }
      await tx.transaction.create({ data: { type: "LOAN", loanId: loan.id, actorId: session.id, notes: "Préstamo registrado" } });
      return loan;
    });

    return NextResponse.json({ message: "Préstamo registrado exitosamente", loan: result }, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "COPY_NOT_FOUND") return NextResponse.json({ error: "Ejemplar no encontrado" }, { status: 404 });
    if (message === "COPY_UNAVAILABLE") return NextResponse.json({ error: "El ejemplar no está disponible" }, { status: 409 });
    if (message === "RESERVATION_INVALID") return NextResponse.json({ error: "La reserva no es válida para este préstamo" }, { status: 409 });
    console.error("Error creating loan:", error);
    return NextResponse.json({ error: "Error al crear préstamo" }, { status: 500 });
  }
}
