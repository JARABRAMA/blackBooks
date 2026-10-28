"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import {
  Badge,
  EmptyState,
  LoadingBlock,
  PageHeader,
  TableShell,
  Td,
  Th,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Loan, Reservation } from "@/lib/types";

function loanTone(status: Loan["status"]) {
  if (status === "ACTIVE") return "info" as const;
  if (status === "OVERDUE") return "danger" as const;
  return "success" as const;
}

function reservationTone(status: Reservation["status"]) {
  if (status === "PENDING") return "warning" as const;
  if (status === "FULFILLED") return "success" as const;
  if (status === "EXPIRED") return "danger" as const;
  return "neutral" as const;
}

export default function MisPrestamosPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [loansRes, reservationsRes] = await Promise.all([
          fetch("/api/loans"),
          fetch("/api/reservations"),
        ]);
        const loansData = await loansRes.json();
        const reservationsData = await reservationsRes.json();
        setLoans(loansData.loans ?? []);
        setReservations(reservationsData.reservations ?? []);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  return (
    <AuthGuard roles={["USER"]}>
      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="space-y-8">
          <PageHeader
            title="Mis Reservas / Préstamos"
            description="Consulta tus reservas activas, préstamos vigentes e historial."
          />

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Reservas
            </h2>
            {reservations.length === 0 ? (
              <EmptyState title="No tienes reservas" />
            ) : (
              <TableShell>
                <thead>
                  <tr>
                    <Th>Libro</Th>
                    <Th>Ejemplar</Th>
                    <Th>Reservado</Th>
                    <Th>Expira</Th>
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((item) => (
                    <tr key={item.id}>
                      <Td>
                        <div className="font-medium text-slate-900">
                          {item.copy.book.title}
                        </div>
                        <div className="text-xs text-slate-500">{item.copy.book.author}</div>
                      </Td>
                      <Td>{item.copy.code}</Td>
                      <Td>{formatDate(item.reservedAt)}</Td>
                      <Td>{formatDate(item.expiresAt)}</Td>
                      <Td>
                        <Badge tone={reservationTone(item.status)}>{item.status}</Badge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Préstamos
            </h2>
            {loans.length === 0 ? (
              <EmptyState title="No tienes préstamos registrados" />
            ) : (
              <TableShell>
                <thead>
                  <tr>
                    <Th>Libro</Th>
                    <Th>Préstamo</Th>
                    <Th>Vencimiento</Th>
                    <Th>Devolución</Th>
                    <Th>Estado</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loans.map((loan) => (
                    <tr key={loan.id}>
                      <Td>
                        <div className="font-medium text-slate-900">
                          {loan.copy.book.title}
                        </div>
                        <div className="text-xs text-slate-500">{loan.copy.code}</div>
                      </Td>
                      <Td>{formatDate(loan.loanDate)}</Td>
                      <Td>{formatDate(loan.dueDate)}</Td>
                      <Td>{formatDate(loan.returnDate)}</Td>
                      <Td>
                        <Badge tone={loanTone(loan.status)}>{loan.status}</Badge>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            )}
          </section>
        </div>
      )}
    </AuthGuard>
  );
}
