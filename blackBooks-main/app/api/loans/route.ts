import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const loans = await prisma.loan.findMany({
      where: { userId: decoded.userId },
      include: {
        copy: {
          include: {
            book: true,
          },
        },
      },
      orderBy: {
        loanDate: "desc",
      },
    });

    return NextResponse.json({ loans });
  } catch (error) {
    console.error("Error fetching loans:", error);
    return NextResponse.json(
      { error: "Error al obtener préstamos" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string; role: string };

    if (decoded.role !== "ADMIN") {
      return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const { reservationId, userId, copyId } = await request.json();

    if (!userId || !copyId) {
      return NextResponse.json(
        { error: "userId y copyId son requeridos" },
        { status: 400 }
      );
    }

    const loan = await prisma.loan.create({
      data: {
        userId,
        copyId,
        reservationId: reservationId || null,
        dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        status: "ACTIVE",
      },
    });

    await prisma.bookCopy.update({
      where: { id: copyId },
      data: { status: "LOANED" },
    });

    if (reservationId) {
      await prisma.reservation.update({
        where: { id: reservationId },
        data: { status: "FULFILLED", fulfilledAt: new Date() },
      });
    }

    await prisma.transaction.create({
      data: {
        type: "LOAN",
        loanId: loan.id,
        actorId: decoded.userId,
        notes: "Préstamo registrado",
      },
    });

    return NextResponse.json({ message: "Préstamo registrado exitosamente", loan }, { status: 201 });
  } catch (error) {
    console.error("Error creating loan:", error);
    return NextResponse.json(
      { error: "Error al crear préstamo" },
      { status: 500 }
    );
  }
}
