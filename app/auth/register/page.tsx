"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert, Button, Field, Input } from "@/components/ui";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    surnames: "",
    dni: "",
    email: "",
    phoneNumber: "",
    birthDay: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  function update<K extends keyof typeof form>(key: K, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "No se pudo registrar");
        return;
      }
      setSuccess("Cuenta creada. Redirigiendo al inicio de sesión...");
      setTimeout(() => router.push("/auth/login"), 900);
    } catch {
      setError("Error de conexión. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white p-6 shadow-2xl sm:p-8">
      <div className="mb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-teal-700">
          Biblitec
        </p>
        <h1 className="mt-2 text-2xl font-semibold text-slate-900">Crear cuenta</h1>
        <p className="mt-1 text-sm text-slate-500">
          Regístrate como lector para reservar y consultar libros.
        </p>
      </div>

      <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
        {error ? (
          <div className="sm:col-span-2">
            <Alert>{error}</Alert>
          </div>
        ) : null}
        {success ? (
          <div className="sm:col-span-2">
            <Alert tone="success">{success}</Alert>
          </div>
        ) : null}

        <Field label="Nombre">
          <Input required value={form.name} onChange={(e) => update("name", e.target.value)} />
        </Field>
        <Field label="Apellidos">
          <Input
            required
            value={form.surnames}
            onChange={(e) => update("surnames", e.target.value)}
          />
        </Field>
        <Field label="DNI">
          <Input required value={form.dni} onChange={(e) => update("dni", e.target.value)} />
        </Field>
        <Field label="Teléfono">
          <Input
            required
            value={form.phoneNumber}
            onChange={(e) => update("phoneNumber", e.target.value)}
          />
        </Field>
        <Field label="Correo electrónico">
          <Input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </Field>
        <Field label="Fecha de nacimiento">
          <Input
            type="date"
            required
            value={form.birthDay}
            onChange={(e) => update("birthDay", e.target.value)}
          />
        </Field>
        <div className="sm:col-span-2">
          <Field label="Contraseña">
            <Input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => update("password", e.target.value)}
            />
          </Field>
        </div>

        <div className="sm:col-span-2">
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Registrando..." : "Crear cuenta"}
          </Button>
        </div>
      </form>

      <p className="mt-5 text-center text-sm text-slate-500">
        ¿Ya tienes cuenta?{" "}
        <Link href="/auth/login" className="font-medium text-teal-700 hover:underline">
          Inicia sesión
        </Link>
      </p>
    </div>
  );
}
