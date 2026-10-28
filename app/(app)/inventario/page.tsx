"use client";

import { useEffect, useState, type FormEvent } from "react";
import AuthGuard from "@/components/AuthGuard";
import {
  Alert,
  Button,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  Modal,
  PageHeader,
  TableShell,
  Td,
  Th,
} from "@/components/ui";
import { availabilityFromCopies } from "@/lib/format";
import type { Book } from "@/lib/types";

export default function InventarioPage() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [form, setForm] = useState({
    title: "",
    author: "",
    category: "",
    isbn: "",
    copies: "1",
  });

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

  function resetForm() {
    setForm({ title: "", author: "", category: "", isbn: "", copies: "1" });
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setSaving(true);
    try {
      const res = await fetch("/api/books", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo agregar el libro");
        return;
      }
      setSuccess(data.message || "Libro agregado");
      setOpen(false);
      resetForm();
      await loadBooks();
    } catch {
      setError("Error de conexión");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AuthGuard roles={["ADMIN"]}>
      {loading ? (
        <LoadingBlock />
      ) : (
        <div>
          <PageHeader
            title="Inventario"
            description="Stock de títulos y estado de ejemplares."
            action={
              <Button
                onClick={() => {
                  resetForm();
                  setOpen(true);
                }}
              >
                Agregar libro
              </Button>
            }
          />

          {success ? (
            <div className="mb-4">
              <Alert tone="success">{success}</Alert>
            </div>
          ) : null}

          {books.length === 0 ? (
            <EmptyState
              title="Inventario vacío"
              description="Agrega el primer libro para comenzar."
            />
          ) : (
            <TableShell>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Título</Th>
                  <Th>Autor</Th>
                  <Th>Categoría</Th>
                  <Th>Total</Th>
                  <Th>Disponibles</Th>
                  <Th>Prestados</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {books.map((book) => {
                  const stats = availabilityFromCopies(book.copies);
                  return (
                    <tr key={book.id}>
                      <Td className="font-mono text-xs">{book.id.slice(0, 8)}…</Td>
                      <Td className="font-medium text-slate-900">{book.title}</Td>
                      <Td>{book.author}</Td>
                      <Td>{book.category}</Td>
                      <Td>{stats.total}</Td>
                      <Td>{stats.available}</Td>
                      <Td>{stats.loaned}</Td>
                    </tr>
                  );
                })}
              </tbody>
            </TableShell>
          )}

          <Modal
            open={open}
            title="Agregar libro"
            onClose={() => {
              if (!saving) {
                setOpen(false);
                resetForm();
              }
            }}
          >
            <form onSubmit={onSubmit} className="space-y-4">
              {error ? <Alert>{error}</Alert> : null}
              <Field label="Título">
                <Input
                  required
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                />
              </Field>
              <Field label="Autor">
                <Input
                  required
                  value={form.author}
                  onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))}
                />
              </Field>
              <Field label="Categoría">
                <Input
                  required
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                />
              </Field>
              <Field label="ISBN (opcional)">
                <Input
                  value={form.isbn}
                  onChange={(e) => setForm((f) => ({ ...f, isbn: e.target.value }))}
                />
              </Field>
              <Field label="Cantidad de ejemplares">
                <Input
                  type="number"
                  min={1}
                  required
                  value={form.copies}
                  onChange={(e) => setForm((f) => ({ ...f, copies: e.target.value }))}
                />
              </Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  disabled={saving}
                  onClick={() => {
                    setOpen(false);
                    resetForm();
                  }}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Agregando..." : "Agregar"}
                </Button>
              </div>
            </form>
          </Modal>
        </div>
      )}
    </AuthGuard>
  );
}
