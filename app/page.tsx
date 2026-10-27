import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex flex-col items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-2xl">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Biblioteca
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Administra libros, préstamos, devoluciones y usuarios de manera eficiente
          </p>
          <Link
            href="/auth/login"
            className="inline-block px-8 py-3 bg-indigo-600 text-white text-lg font-semibold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    </div>
  );
}
