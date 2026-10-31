import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const { name, surnames, dni, email, phoneNumber, birthDay, password, role } =
      await request.json();

    if (!name || !surnames || !dni || !email || !phoneNumber || !birthDay || !password) {
      return NextResponse.json(
        { error: "Todos los campos son requeridos" },
        { status: 400 }
      );
    }

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { dni }],
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "El email o DNI ya están registrados" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        surnames,
        dni,
        email,
        phoneNumber,
        birthDay: new Date(birthDay),
        password: hashedPassword,
        role: role === "ADMIN" ? "ADMIN" : "USER",
      },
      select: {
        id: true,
        name: true,
        surnames: true,
        email: true,
        role: true,
      },
    });

    return NextResponse.json(
      { message: "Usuario registrado exitosamente", user },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
