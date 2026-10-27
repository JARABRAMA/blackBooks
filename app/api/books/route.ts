import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const books = await prisma.book.findMany({
      include: {
        copies: true,
      },
      orderBy: {
        title: "asc",
      },
    });

    return NextResponse.json({ books });
  } catch (error) {
    console.error("Error fetching books:", error);
    return NextResponse.json(
      { error: "Error al obtener libros" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { title, author, category, isbn, description, coverImage, copies } =
      await request.json();

    if (!title || !author || !category || !copies) {
      return NextResponse.json(
        { error: "Título, autor, categoría y cantidad son requeridos" },
        { status: 400 }
      );
    }

    const book = await prisma.book.create({
      data: {
        title,
        author,
        category,
        isbn: isbn || null,
        description: description || null,
        coverImage: coverImage || null,
        copies: {
          create: Array.from({ length: parseInt(copies) }, (_, i) => ({
            code: `${isbn || title.substring(0, 3).toUpperCase()}-${Date.now()}-${i + 1}`,
            status: "AVAILABLE",
          })),
        },
      },
      include: {
        copies: true,
      },
    });

    return NextResponse.json({ message: "Libro agregado exitosamente", book }, { status: 201 });
  } catch (error) {
    console.error("Error creating book:", error);
    return NextResponse.json(
      { error: "Error al crear libro" },
      { status: 500 }
    );
  }
}
