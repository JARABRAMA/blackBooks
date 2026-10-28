"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { availabilityFromCopies } from "@/lib/format";
import type { Book } from "@/lib/types";
import {
  Alert,
  Badge,
  Button,
  Card,
  EmptyState,
  Input,
  LoadingBlock,
  PageHeader,
} from "@/components/ui";

export default function CatalogoPage() {
  const { user } = useAuth();
  const [books, setBooks] = useState<Book[]>([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );
  const [reservingId, setReservingId] = useState<string | null>(null);

  async function loadBooks() {
    setLoading(true);
    try {
      const res = await fetch("/api/books");
      const data = await res.json();
      setBooks(data.books ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadBooks();
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return books;
    return books.filter(
      (book) =>
        book.title.toLowerCase().includes(q) ||
        book.author.toLowerCase().includes(q) ||
        book.category.toLowerCase().includes(q)
    );
  }, [books, query]);

  async function reserveBook(bookId: string) {
    setMessage(null);
    setReservingId(bookId);
    try {
      const res = await fetch("/api/reservations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ tone: "error", text: data.error || "No se pudo reservar" });
        return;
      }
      setMessage({ tone: "success", text: data.message || "Reserva realizada" });
      await loadBooks();
    } catch {
      setMessage({ tone: "error", text: "Error de conexión" });
    } finally {
      setReservingId(null);
    }
  }

  if (loading) return <LoadingBlock />;

  return (
    <div>
      <PageHeader
        title="Catálogo de Libros"
        description="Busca por título, autor o categoría y reserva ejemplares disponibles."
      />

      <div className="mb-5">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar libros..."
        />
      </div>

      {message ? (
        <div className="mb-4">
          <Alert tone={message.tone === "success" ? "success" : "error"}>
            {message.text}
          </Alert>
        </div>
      ) : null}

      {filtered.length === 0 ? (
        <EmptyState
          title="No se encontraron resultados"
          description="Prueba con otro término de búsqueda."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((book) => {
            const { available, total } = availabilityFromCopies(book.copies);
            const canReserve = user?.role === "USER" && available > 0;

            return (
              <Card key={book.id} className="flex flex-col">
                <div className="mb-3 flex items-start justify-between gap-2">
                  <div>
                    <h2 className="text-base font-semibold text-slate-900">{book.title}</h2>
                    <p className="text-sm text-slate-500">{book.author}</p>
                  </div>
                  <Badge tone={available > 0 ? "success" : "warning"}>
                    {available > 0 ? "Disponible" : "Sin stock"}
                  </Badge>
                </div>
                <p className="mb-1 text-xs uppercase tracking-wide text-slate-400">
                  {book.category}
                </p>
                <p className="mb-4 text-sm text-slate-600">
                  {available} de {total} ejemplares disponibles
                </p>
                {user?.role === "USER" ? (
                  <Button
                    className="mt-auto"
                    disabled={!canReserve || reservingId === book.id}
                    onClick={() => reserveBook(book.id)}
                  >
                    {reservingId === book.id
                      ? "Reservando..."
                      : available > 0
                        ? "Reservar"
                        : "Sin ejemplares disponibles"}
                  </Button>
                ) : null}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
