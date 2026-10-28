"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import type { UserRole } from "@/lib/types";
import { LoadingBlock } from "@/components/ui";

export default function AuthGuard({
  children,
  roles,
}: {
  children: ReactNode;
  roles?: UserRole[];
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/auth/login");
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return <LoadingBlock label="Verificando sesión..." />;
  }

  if (roles && !roles.includes(user.role)) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-6 text-center text-sm text-rose-800">
        No autorizado. No tienes permisos para ver esta sección.
      </div>
    );
  }

  return <>{children}</>;
}
