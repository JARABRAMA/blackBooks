"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import type { AuthUser, UserRole } from "@/lib/types";

const DEMO_KEY = "biblitec-demo-role";

type AuthContextValue = {
  user: AuthUser | null;
  loading: boolean;
  isDemo: boolean;
  refresh: () => Promise<void>;
  enterDemo: (role: UserRole) => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function demoUser(role: UserRole): AuthUser {
  return {
    id: "demo-user",
    name: role === "ADMIN" ? "Ana" : "Luis",
    surnames: role === "ADMIN" ? "Bibliotecaria" : "Lector",
    email: role === "ADMIN" ? "admin@demo.local" : "lector@demo.local",
    role,
    image: null,
  };
}

function readDemoRole(): UserRole | null {
  if (typeof window === "undefined") return null;
  const role = window.localStorage.getItem(DEMO_KEY);
  return role === "ADMIN" || role === "USER" ? role : null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isDemo, setIsDemo] = useState(false);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          window.localStorage.removeItem(DEMO_KEY);
          setUser(data.user);
          setIsDemo(false);
          return;
        }
      }

      const demoRole = readDemoRole();
      if (demoRole) {
        setUser(demoUser(demoRole));
        setIsDemo(true);
        return;
      }

      setUser(null);
      setIsDemo(false);
    } catch {
      const demoRole = readDemoRole();
      if (demoRole) {
        setUser(demoUser(demoRole));
        setIsDemo(true);
        return;
      }
      setUser(null);
      setIsDemo(false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const enterDemo = useCallback((role: UserRole) => {
    window.localStorage.setItem(DEMO_KEY, role);
    setUser(demoUser(role));
    setIsDemo(true);
    setLoading(false);
    window.location.href = "/catalogo";
  }, []);

  const logout = useCallback(async () => {
    window.localStorage.removeItem(DEMO_KEY);
    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } catch {
      // ignore when API/DB is unavailable
    }
    setUser(null);
    setIsDemo(false);
    window.location.href = "/";
  }, []);

  return (
    <AuthContext.Provider
      value={{ user, loading, isDemo, refresh, enterDemo, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return ctx;
}
