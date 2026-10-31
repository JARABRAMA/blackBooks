import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ error: "No tienes permisos para registrar devoluciones" }, { status: 403 });
    const { id } = await params;

    const result = await prisma.$transaction(async (tx) => {
      const loan = await tx.loan.findUnique({ where: { id } });
      if (!loan) throw new Error("LOAN_NOT_FOUND");
      if (loan.status === "RETURNED" || loan.returnDate) throw new Error("ALREADY_RETURNED");

      const now = new Date();
      const isOverdue = now > loan.dueDate;
      await tx.loan.update({ where: { id }, data: { status: "RETURNED", returnDate: now } });
      await tx.bookCopy.update({ where: { id: loan.copyId }, data: { status: "AVAILABLE" } });
      await tx.transaction.create({
        data: { type: "RETURN", loanId: loan.id, actorId: session.id, notes: isOverdue ? "Devolución con retraso" : "Devolución a tiempo" },
      });
      return { isOverdue };
    });

    return NextResponse.json({ message: "Devolución registrada exitosamente", overdue: result.isOverdue });
  } catch (error) {
    const message = error instanceof Error ? error.message : "";
    if (message === "LOAN_NOT_FOUND") return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 });
    if (message === "ALREADY_RETURNED") return NextResponse.json({ error: "Este préstamo ya fue devuelto" }, { status: 409 });
    console.error("Error returning loan:", error);
    return NextResponse.json({ error: "Error al registrar devolución" }, { status: 500 });
  }
}
