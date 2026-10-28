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
    <AuthGuard roles={["ADMIN"]}>
      {loading ? (
        <LoadingBlock />
      ) : (
        <div>
          <PageHeader
            title="Reportes / Transacciones"
            description="Historial de préstamos, devoluciones y reservas."
          />

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
                    <Td>{tx.loan?.copy.book.title ?? "—"}</Td>
                    <Td>{tx.loan?.copy.code ?? "—"}</Td>
                    <Td>
                      {tx.loan?.user
                        ? `${tx.loan.user.name} ${tx.loan.user.surnames}`
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
