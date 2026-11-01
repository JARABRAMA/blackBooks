import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";

export async function GET(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const loans = await prisma.loan.findMany({
      include: {
        user: { select: { id: true, name: true, surnames: true, email: true } },
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
