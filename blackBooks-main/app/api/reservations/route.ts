import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    const { bookId } = await request.json();

    if (!bookId) {
      return NextResponse.json({ error: "bookId es requerido" }, { status: 400 });
    }

    // Find an available copy
    const availableCopy = await prisma.bookCopy.findFirst({
      where: {
        bookId,
        status: "AVAILABLE",
      },
    });

    if (!availableCopy) {
      return NextResponse.json(
        { error: "No hay ejemplares disponibles" },
        { status: 400 }
      );
    }

    const reservation = await prisma.reservation.create({
      data: {
        userId: decoded.userId,
        copyId: availableCopy.id,
        status: "PENDING",
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    await prisma.bookCopy.update({
      where: { id: availableCopy.id },
      data: { status: "RESERVED" },
    });

    return NextResponse.json(
      { message: "Reserva realizada exitosamente", reservation },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating reservation:", error);
    return NextResponse.json(
      { error: "Error al crear reserva" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get("token")?.value;

    if (!token) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };

    const reservations = await prisma.reservation.findMany({
      where: { userId: decoded.userId },
      include: {
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
