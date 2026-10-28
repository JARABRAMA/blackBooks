import Link from "next/link";

export default function Home() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_20%_20%,rgba(45,212,191,0.22),transparent_45%),radial-gradient(ellipse_at_80%_0%,rgba(148,163,184,0.18),transparent_40%),linear-gradient(160deg,#020617_0%,#0f172a_55%,#042f2e_100%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 w-full max-w-xl opacity-30"
        style={{
          backgroundImage:
            "repeating-linear-gradient(90deg, transparent 0 18px, rgba(255,255,255,0.04) 18px 20px), repeating-linear-gradient(180deg, #134e4a 0 12%, #0f766e 12% 24%, #115e59 24% 38%, #164e63 38% 52%, #1e3a5f 52% 66%, #334155 66% 80%, #0f172a 80% 100%)",
        }}
      />

      <main className="relative z-10 mx-auto flex min-h-screen max-w-5xl flex-col justify-center px-6 py-16">
        <p className="mb-4 text-xs font-semibold uppercase tracking-[0.35em] text-teal-300">
          Biblitec
        </p>
        <h1 className="max-w-2xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl md:text-6xl">
          La biblioteca, organizada de punta a punta.
        </h1>
        <p className="mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
          Catálogo, reservas, préstamos y control de inventario en un solo
          sistema para lectores y bibliotecarios.
        </p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link
            href="/auth/login"
            className="inline-flex items-center justify-center rounded-lg bg-teal-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-teal-400"
          >
            Iniciar sesión
          </Link>
          <Link
            href="/auth/register"
            className="inline-flex items-center justify-center rounded-lg border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
          >
            Crear cuenta
          </Link>
        </div>
      </main>
    </div>
  );
}
