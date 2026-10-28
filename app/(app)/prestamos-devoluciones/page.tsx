"use client";

import { useEffect, useState } from "react";
import AuthGuard from "@/components/AuthGuard";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  LoadingBlock,
  PageHeader,
  TableShell,
  Td,
  Th,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { Loan, Reservation } from "@/lib/types";

export default function PrestamosDevolucionesPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(
    null
  );

  async function load() {
    setLoading(true);
    try {
      const [loansRes, reservationsRes] = await Promise.all([
        fetch("/api/admin/loans"),
        fetch("/api/admin/reservations"),
      ]);
      const loansData = await loansRes.json();
      const reservationsData = await reservationsRes.json();
      setLoans(loansData.loans ?? []);
      setReservations(
        (reservationsData.reservations ?? []).filter(
          (r: Reservation) => r.status === "PENDING"
        )
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function fulfillReservation(reservation: Reservation) {
    setMessage(null);
    setBusyId(reservation.id);
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reservationId: reservation.id,
          userId: reservation.user?.id,
          copyId: reservation.copy.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ tone: "error", text: data.error || "No se pudo registrar el préstamo" });
        return;
      }
      setMessage({ tone: "success", text: data.message || "Préstamo registrado" });
      await load();
    } catch {
      setMessage({ tone: "error", text: "Error de conexión" });
    } finally {
      setBusyId(null);
    }
  }

  async function returnLoan(loanId: string) {
    setMessage(null);
    setBusyId(loanId);
    try {
      const res = await fetch(`/api/loans/${loanId}/return`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        setMessage({ tone: "error", text: data.error || "No se pudo registrar la devolución" });
        return;
      }
      setMessage({ tone: "success", text: data.message || "Devolución registrada" });
      await load();
    } catch {
      setMessage({ tone: "error", text: "Error de conexión" });
    } finally {
      setBusyId(null);
    }
  }

  const activeLoans = loans.filter((l) => l.status === "ACTIVE" || l.status === "OVERDUE");

  return (
    <AuthGuard roles={["ADMIN"]}>
      {loading ? (
        <LoadingBlock />
      ) : (
        <div className="space-y-8">
          <PageHeader
            title="Préstamos y Devoluciones"
            description="Gestiona reservas pendientes y préstamos activos."
          />

          {message ? (
            <Alert tone={message.tone === "success" ? "success" : "error"}>
              {message.text}
            </Alert>
          ) : null}

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Reservas pendientes
            </h2>
            {reservations.length === 0 ? (
              <EmptyState title="No hay reservas pendientes" />
            ) : (
              <TableShell>
                <thead>
                  <tr>
                    <Th>Libro</Th>
                    <Th>Ejemplar</Th>
                    <Th>Lector</Th>
                    <Th>Reservado</Th>
                    <Th>Acción</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {reservations.map((reservation) => (
                    <tr key={reservation.id}>
                      <Td className="font-medium text-slate-900">
                        {reservation.copy.book.title}
                      </Td>
                      <Td>{reservation.copy.code}</Td>
                      <Td>
                        {reservation.user
                          ? `${reservation.user.name} ${reservation.user.surnames}`
                          : "—"}
                      </Td>
                      <Td>{formatDate(reservation.reservedAt)}</Td>
                      <Td>
                        <Button
                          disabled={busyId === reservation.id || !reservation.user}
                          onClick={() => fulfillReservation(reservation)}
                        >
                          {busyId === reservation.id ? "Registrando..." : "Registrar préstamo"}
                        </Button>
                      </Td>
                    </tr>
                  ))}
                </tbody>
              </TableShell>
            )}
          </section>

          <section>
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Préstamos activos
            </h2>
            {activeLoans.length === 0 ? (
              <EmptyState title="No hay préstamos activos" />
            ) : (
              <TableShell>
                <thead>
                  <tr>
                    <Th>ID</Th>
                    <Th>Libro</Th>
                    <Th>Ejemplar</Th>
                    <Th>Lector</Th>
                    <Th>Préstamo</Th>
                    <Th>Vence</Th>
                    <Th>Estado</Th>
                    <Th>Acción</Th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeLoans.map((loan) => (
                    <tr key={loan.id}>
                      <Td className="font-mono text-xs">{loan.id.slice(0, 8)}…</Td>
                      <Td className="font-medium text-slate-900">{loan.copy.book.title}</Td>
                      <Td>{loan.copy.code}</Td>
                      <Td>
                        {loan.user ? `${loan.user.name} ${loan.user.surnames}` : "—"}
                      </Td>
                      <Td>{formatDate(loan.loanDate)}</Td>
                      <Td>{formatDate(loan.dueDate)}</Td>
                      <Td>
                        <Badge tone={loan.status === "OVERDUE" ? "danger" : "info"}>
                          {loan.status}
                        </Badge>
                      </Td>
                      <Td>
                        <Button
                          variant="secondary"
                          disabled={busyId === loan.id}
                          onClick={() => returnLoan(loan.id)}
                        >
                          {busyId === loan.id ? "Procesando..." : "Registrar devolución"}
                        </Button>
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
