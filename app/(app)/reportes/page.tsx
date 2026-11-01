"use client";

import { useEffect, useMemo, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import {
  Badge,
  EmptyState,
  Field,
  Input,
  LoadingBlock,
  PageHeader,
  Select,
  TableShell,
  Td,
  Th,
} from "@/components/ui";
import { useAuth } from "@/lib/auth-context";
import { demoTransactions } from "@/lib/demo-data";
import { formatDateTime } from "@/lib/format";
import type { Transaction, TransactionType } from "@/lib/types";

function typeTone(type: TransactionType) {
  if (type === "LOAN") return "info" as const;
  if (type === "RETURN") return "success" as const;
  return "warning" as const;
}

function DailyActivityChart({ transactions }: { transactions: Transaction[] }) {
  const days = Array.from({ length: 7 }, (_, index) => {
    const date = new Date();
    date.setHours(0, 0, 0, 0);
    date.setDate(date.getDate() - (6 - index));
    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    const dayTransactions = transactions.filter((tx) => {
      const created = new Date(tx.createdAt);
      return created.getFullYear() === date.getFullYear() && created.getMonth() === date.getMonth() && created.getDate() === date.getDate();
    });
    return {
      key,
      label: date.toLocaleDateString("es-CO", { weekday: "short" }).replace(".", ""),
      loans: dayTransactions.filter((tx) => tx.type === "LOAN").length,
      returns: dayTransactions.filter((tx) => tx.type === "RETURN").length,
    };
  });
  const max = Math.max(1, ...days.map((day) => Math.max(day.loans, day.returns)));

  return (
    <section className="mb-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-semibold text-slate-900">Actividad de los últimos 7 días</h2>
          <p className="text-sm text-slate-500">Comparación diaria de préstamos y devoluciones.</p>
        </div>
        <div className="flex gap-4 text-xs font-medium">
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-teal-600" />Préstamos</span>
          <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-sm bg-indigo-500" />Devoluciones</span>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2" role="img" aria-label="Gráfica de barras de préstamos y devoluciones de los últimos siete días">
        {days.map((day) => (
          <div key={day.key} className="flex min-w-0 flex-col items-center gap-2">
            <div className="flex h-36 w-full items-end justify-center gap-1 rounded-lg bg-slate-50 px-1 pt-2">
              <div title={`${day.loans} préstamos`} className="w-3 rounded-t bg-teal-600" style={{ height: `${Math.max(day.loans ? 5 : 0, (day.loans / max) * 100)}%` }} />
              <div title={`${day.returns} devoluciones`} className="w-3 rounded-t bg-indigo-500" style={{ height: `${Math.max(day.returns ? 5 : 0, (day.returns / max) * 100)}%` }} />
            </div>
            <span className="text-xs capitalize text-slate-500">{day.label}</span>
            <span className="text-xs font-semibold text-slate-700">{day.loans + day.returns}</span>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function ReportesPage() {
  const { isDemo } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState<"ALL" | TransactionType>("ALL");
  const [dateFilter, setDateFilter] = useState("");

  useEffect(() => {
    async function load() {
      try {
        if (isDemo) {
          setTransactions(demoTransactions);
          return;
        }
        const res = await fetch("/api/admin/transactions", {
          signal: AbortSignal.timeout(4000),
        });
        const data = await res.json();
        setTransactions(data.transactions ?? []);
      } catch {
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [isDemo]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      if (typeFilter !== "ALL" && tx.type !== typeFilter) return false;
      if (dateFilter) {
        const day = new Date(tx.createdAt).toISOString().slice(0, 10);
        if (day !== dateFilter) return false;
      }
      return true;
    });
  }, [transactions, typeFilter, dateFilter]);

  return (
    <AuthGuard roles={["ADMIN", "USER"]}>
      {loading ? (
        <LoadingBlock />
      ) : (
        <div>
          <PageHeader
            title="Reportes / Transacciones"
            description="Historial de préstamos, devoluciones y reservas."
          />

          <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Movimientos registrados</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{transactions.length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Préstamos</p>
              <p className="mt-1 text-2xl font-bold text-teal-700">{transactions.filter((tx) => tx.type === "LOAN").length}</p>
            </div>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <p className="text-sm text-slate-500">Devoluciones</p>
              <p className="mt-1 text-2xl font-bold text-indigo-600">{transactions.filter((tx) => tx.type === "RETURN").length}</p>
            </div>
          </div>

          <DailyActivityChart transactions={transactions} />

          <div className="mb-5 grid gap-3 sm:grid-cols-2">
            <Field label="Tipo">
              <Select
                value={typeFilter}
                onChange={(e) =>
                  setTypeFilter(e.target.value as "ALL" | TransactionType)
                }
              >
                <option value="ALL">Todos</option>
                <option value="RESERVATION">Reserva</option>
                <option value="LOAN">Préstamo</option>
                <option value="RETURN">Devolución</option>
              </Select>
            </Field>
            <Field label="Fecha">
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
            </Field>
          </div>

          {filtered.length === 0 ? (
            <EmptyState title="No hay transacciones con esos filtros" />
          ) : (
            <TableShell>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Tipo</Th>
                  <Th>Libro</Th>
                  <Th>Ejemplar</Th>
                  <Th>Lector</Th>
                  <Th>Actor</Th>
                  <Th>Fecha</Th>
                  <Th>Notas</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((tx) => (
                  <tr key={tx.id}>
                    <Td className="font-mono text-xs">{tx.id.slice(0, 8)}…</Td>
                    <Td>
                      <Badge tone={typeTone(tx.type)}>{tx.type}</Badge>
                    </Td>
                    <Td>{tx.loan?.copy.book.title ?? tx.reservation?.copy.book.title ?? "—"}</Td>
                    <Td>{tx.loan?.copy.code ?? tx.reservation?.copy.code ?? "—"}</Td>
                    <Td>
                      {tx.loan?.user || tx.reservation?.user
                        ? `${(tx.loan?.user ?? tx.reservation?.user)?.name} ${(tx.loan?.user ?? tx.reservation?.user)?.surnames}`
                        : "—"}
                    </Td>
                    <Td>
                      {tx.actor.name} {tx.actor.surnames}
                    </Td>
                    <Td>{formatDateTime(tx.createdAt)}</Td>
                    <Td>{tx.notes ?? "—"}</Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          )}
        </div>
      )}
    </AuthGuard>
  );
}
