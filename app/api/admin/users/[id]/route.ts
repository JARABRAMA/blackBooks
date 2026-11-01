import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ error: "No autorizado" }, { status: 403 });

    const { id } = await params;
    const { role } = await request.json();

    if (!role || (role !== "USER" && role !== "ADMIN")) {
      return NextResponse.json({ error: "Rol inválido" }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: { role },
      select: {
        id: true,
        name: true,
        surnames: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json({ message: "Usuario actualizado exitosamente", user });
  } catch (error) {
    console.error("Error updating user:", error);
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    );
  }
}
