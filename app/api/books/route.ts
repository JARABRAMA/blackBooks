import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/server-auth";
import { randomUUID } from "node:crypto";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: { copies: true },
      orderBy: { title: "asc" },
    });
    return NextResponse.json({ books });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json({ error: "Error al obtener libros" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getSessionUser(request);
    if (!session) return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    if (session.role !== "ADMIN") return NextResponse.json({ error: "No tienes permisos para crear libros" }, { status: 403 });

    const body = await request.json();
    const title = typeof body.title === "string" ? body.title.trim() : "";
    const author = typeof body.author === "string" ? body.author.trim() : "";
    const category = typeof body.category === "string" ? body.category.trim() : "";
    const isbn = typeof body.isbn === "string" ? body.isbn.trim() : "";
    const description = typeof body.description === "string" ? body.description.trim() : "";
    const coverImage = typeof body.coverImage === "string" ? body.coverImage.trim() : "";
    const copies = Number(body.copies);

    if (!title || !author || !category || !Number.isInteger(copies) || copies < 1 || copies > 500) {
      return NextResponse.json({ error: "Ingresa título, autor, categoría y entre 1 y 500 ejemplares" }, { status: 400 });
    }

    const book = await prisma.book.create({
      data: {
        title, author, category,
        isbn: isbn || null,
        description: description || null,
        coverImage: coverImage || null,
        copies: {
          create: Array.from({ length: copies }, (_, index) => ({
            code: `${isbn || title.substring(0, 3).toUpperCase()}-${randomUUID().slice(0, 8)}-${index + 1}`,
            status: "AVAILABLE" as const,
          })),
        },
      },
      include: { copies: true },
    });

    return NextResponse.json({ message: "Libro agregado exitosamente", book }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json({ error: "Error al crear libro. Verifica que el ISBN no esté registrado." }, { status: 500 });
  }
}
