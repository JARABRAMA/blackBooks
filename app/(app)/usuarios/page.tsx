"use client";

import { useEffect, useState, type FormEvent } from "react";
import AuthGuard from "@/components/AuthGuard";
import {
  Alert,
  Badge,
  Button,
  EmptyState,
  Field,
  LoadingBlock,
  Modal,
  PageHeader,
  Select,
  TableShell,
  Td,
  Th,
} from "@/components/ui";
import { formatDate } from "@/lib/format";
import type { AdminUser, UserRole } from "@/lib/types";

export default function UsuariosPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<AdminUser | null>(null);
  const [role, setRole] = useState<UserRole>("USER");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function loadUsers() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users");
      const data = await res.json();
      setUsers(data.users ?? []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadUsers();
  }, []);

  function openEdit(user: AdminUser) {
    setSelected(user);
    setRole(user.role);
    setError("");
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!selected) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/admin/users/${selected.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo actualizar el usuario");
        return;
      }
      setSuccess(data.message || "Usuario actualizado");
      setSelected(null);
      await loadUsers();
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
            title="Usuarios"
            description="Administra roles y acceso al sistema."
          />

          {success ? (
            <div className="mb-4">
              <Alert tone="success">{success}</Alert>
            </div>
          ) : null}

          {users.length === 0 ? (
            <EmptyState title="No hay usuarios registrados" />
          ) : (
            <TableShell>
              <thead>
                <tr>
                  <Th>ID</Th>
                  <Th>Creación</Th>
                  <Th>Nombre</Th>
                  <Th>Correo</Th>
                  <Th>Rol</Th>
                  <Th>Acción</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((user) => (
                  <tr key={user.id}>
                    <Td className="font-mono text-xs">{user.id.slice(0, 8)}…</Td>
                    <Td>{formatDate(user.createdAt)}</Td>
                    <Td className="font-medium text-slate-900">
                      {user.name} {user.surnames}
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Badge tone={user.role === "ADMIN" ? "info" : "neutral"}>
                        {user.role}
                      </Badge>
                    </Td>
                    <Td>
                      <Button variant="secondary" onClick={() => openEdit(user)}>
                        Editar usuario
                      </Button>
                    </Td>
                  </tr>
                ))}
              </tbody>
            </TableShell>
          )}

          <Modal
            open={!!selected}
            title="Editar usuario"
            onClose={() => {
              if (!saving) setSelected(null);
            }}
          >
            {selected ? (
              <form onSubmit={onSubmit} className="space-y-4">
                {error ? <Alert>{error}</Alert> : null}
                <p className="text-sm text-slate-600">
                  Correo: <span className="font-medium text-slate-900">{selected.email}</span>
                </p>
                <Field label="Rol">
                  <Select
                    value={role}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                  >
                    <option value="USER">USER</option>
                    <option value="ADMIN">ADMIN</option>
                  </Select>
                </Field>
                <div className="flex justify-end gap-2 pt-2">
                  <Button
                    type="button"
                    variant="secondary"
                    disabled={saving}
                    onClick={() => setSelected(null)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={saving}>
                    {saving ? "Actualizando..." : "Guardar / Actualizar"}
                  </Button>
                </div>
              </form>
            ) : null}
          </Modal>
        </div>
      )}
    </AuthGuard>
  );
}
