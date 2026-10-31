import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const name = typeof body.name === "string" ? body.name.trim() : "";
    const surnames = typeof body.surnames === "string" ? body.surnames.trim() : "";
    const dni = typeof body.dni === "string" ? body.dni.trim() : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phoneNumber = typeof body.phoneNumber === "string" ? body.phoneNumber.trim() : "";
    const birthDay = typeof body.birthDay === "string" ? new Date(body.birthDay) : new Date("invalid");
    const password = typeof body.password === "string" ? body.password : "";

    if (!name || !surnames || !dni || !email || !phoneNumber || !body.birthDay || !password) {
      return NextResponse.json({ error: "Todos los campos son requeridos" }, { status: 400 });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "El correo electrónico no es válido" }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "La contraseña debe tener al menos 8 caracteres" }, { status: 400 });
    }
    if (Number.isNaN(birthDay.getTime()) || birthDay > new Date()) {
      return NextResponse.json({ error: "La fecha de nacimiento no es válida" }, { status: 400 });
    }

    const existingUser = await prisma.user.findFirst({ where: { OR: [{ email }, { dni }] } });
    if (existingUser) {
      return NextResponse.json({ error: "El correo o documento ya están registrados" }, { status: 409 });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        name,
        surnames,
        dni,
        email,
        phoneNumber,
        birthDay,
        password: hashedPassword,
        // El rol enviado por el navegador se ignora siempre.
        role: "USER",
      },
      select: { id: true, name: true, surnames: true, email: true, role: true },
    });

    return NextResponse.json({ message: "Usuario registrado exitosamente", user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 });
  }
}
