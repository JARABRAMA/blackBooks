import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const loan = await prisma.loan.findUnique({
      where: { id: params.id },
    });

    if (!loan) {
      return NextResponse.json({ error: "Préstamo no encontrado" }, { status: 404 });
    }

    if (loan.status === "RETURNED") {
      return NextResponse.json({ error: "Este préstamo ya fue devuelto" }, { status: 400 });
    }

    const now = new Date();
    const isOverdue = now > loan.dueDate;

    await prisma.loan.update({
      where: { id: params.id },
      data: {
        status: isOverdue ? "OVERDUE" : "RETURNED",
        returnDate: now,
      },
    });

    await prisma.bookCopy.update({
      where: { id: loan.copyId },
      data: { status: "AVAILABLE" },
    });

    await prisma.transaction.create({
      data: {
        type: "RETURN",
        loanId: loan.id,
        actorId: decoded.userId,
        notes: isOverdue ? "Devolución con retraso" : "Devolución a tiempo",
      },
    });

    return NextResponse.json({ message: "Devolución registrada exitosamente" });
  } catch (error) {
    console.error("Error returning loan:", error);
    return NextResponse.json(
      { error: "Error al registrar devolución" },
      { status: 500 }
    );
  }
}
