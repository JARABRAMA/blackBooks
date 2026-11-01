-- Permite registrar más de un movimiento (préstamo y devolución) para un mismo préstamo.
DROP INDEX IF EXISTS "Transaction_loanId_key";

-- Relaciona los movimientos de reserva con la reserva y su ejemplar.
ALTER TABLE "Transaction" ADD COLUMN "reservationId" TEXT;
CREATE INDEX "Transaction_reservationId_idx" ON "Transaction"("reservationId");
ALTER TABLE "Transaction"
  ADD CONSTRAINT "Transaction_reservationId_fkey"
  FOREIGN KEY ("reservationId") REFERENCES "Reservation"("id")
  ON DELETE SET NULL ON UPDATE CASCADE;
