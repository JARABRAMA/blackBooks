"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth-context";

const userLinks = [
  { href: "/catalogo", label: "Catálogo de Libros" },
  { href: "/mis-prestamos", label: "Mis Reservas / Préstamos" },
];

const adminLinks = [
  { href: "/catalogo", label: "Catálogo de Libros" },
  { href: "/inventario", label: "Inventario" },
  { href: "/prestamos-devoluciones", label: "Préstamos y Devoluciones" },
  { href: "/usuarios", label: "Usuarios" },
  { href: "/reportes", label: "Reportes / Transacciones" },
];

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout, isDemo } = useAuth();
  const links = user?.role === "ADMIN" ? adminLinks : userLinks;

  return (
    <>
      <div
        className={`fixed inset-0 z-30 bg-slate-900/40 transition-opacity lg:hidden ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
        onClick={onClose}
      />

      <aside
        className={`fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r border-slate-800 bg-slate-950 text-white transition-transform lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-teal-300/80">Biblioteca</p>
            <h2 className="text-xl font-semibold">Biblitec</h2>
          </div>
          <button
            type="button"
            className="rounded-md px-2 py-1 text-slate-400 hover:bg-slate-800 lg:hidden"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <div className="border-b border-slate-800 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-full bg-teal-800 text-sm font-semibold">
              {user?.image ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={user.image} alt="" className="h-11 w-11 object-cover" />
              ) : (
                <span>
                  {user?.name?.[0]}
                  {user?.surnames?.[0]}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.name} {user?.surnames}
              </p>
              <p className="truncate text-xs text-slate-400">
                {user?.role === "ADMIN" ? "Administrador" : "Lector"}
                {isDemo ? " · Demo" : ""}
              </p>
            </div>
          </div>
        </div>

        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={onClose}
                className={`block rounded-lg px-3 py-2.5 text-sm transition-colors ${
                  active
                    ? "bg-teal-700 text-white"
                    : "text-slate-300 hover:bg-slate-900 hover:text-white"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="border-t border-slate-800 p-3">
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-300 transition-colors hover:bg-slate-900 hover:text-white"
          >
            Cerrar Sesión
          </button>
        </div>
      </aside>
    </>
  );
}
