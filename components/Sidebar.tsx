"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

type User = {
  id: string;
  name: string;
  surnames: string;
  email: string;
  role: "USER" | "ADMIN";
  image?: string | null;
};

export default function Sidebar() {
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {});
  }, []);

  const isActive = (path: string) => pathname === path;

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-xl font-bold text-center">Biblitec</h2>
      </div>

      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
            {user?.image ? (
              <img src={user.image} alt="User" className="w-10 h-10 rounded-full" />
            ) : (
              <span className="text-lg font-bold">
                {user?.name?.[0]}
                {user?.surnames?.[0]}
              </span>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">
              {user?.name} {user?.surnames}
            </p>
            <p className="text-xs text-gray-400 truncate">{user?.role}</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        <Link
          href="/catalogo"
          className={`block px-4 py-2 rounded-lg transition-colors ${
            isActive("/catalogo")
              ? "bg-indigo-600 text-white"
              : "text-gray-300 hover:bg-gray-800 hover:text-white"
          }`}
        >
          Catálogo de Libros
        </Link>

        {user?.role === "USER" && (
          <Link
            href="/mis-prestamos"
            className={`block px-4 py-2 rounded-lg transition-colors ${
              isActive("/mis-prestamos")
                ? "bg-indigo-600 text-white"
                : "text-gray-300 hover:bg-gray-800 hover:text-white"
            }`}
          >
            Mis Reservas / Préstamos
          </Link>
        )}

        {user?.role === "ADMIN" && (
          <>
            <Link
              href="/inventario"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/inventario")
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Inventario
            </Link>
            <Link
              href="/prestamos-devoluciones"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/prestamos-devoluciones")
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Préstamos y Devoluciones
            </Link>
            <Link
              href="/usuarios"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/usuarios")
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Usuarios
            </Link>
            <Link
              href="/reportes"
              className={`block px-4 py-2 rounded-lg transition-colors ${
                isActive("/reportes")
                  ? "bg-indigo-600 text-white"
                  : "text-gray-300 hover:bg-gray-800 hover:text-white"
              }`}
            >
              Reportes / Transacciones
            </Link>
          </>
        )}
      </nav>

      <div className="p-4 border-t border-gray-700">
        <button
          onClick={async () => {
            await fetch("/api/auth/logout", { method: "POST" });
            window.location.href = "/";
          }}
          className="w-full px-4 py-2 text-sm text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
        >
          Cerrar Sesión
        </button>
      </div>
    </div>
  );
}
