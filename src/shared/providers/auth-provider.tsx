"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from "react";
import { useRouter } from "next/navigation";
import { clearSession, getSession, setSession } from "@/shared/lib/auth/session";
import type { AuthSession, LoginPayload } from "@/shared/types/auth";
import {
  enrichSession,
  login as loginService,
  refreshSessionProfile,
} from "@/modules/auth/services/auth.service";

interface AuthContextValue {
  session: AuthSession | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [session, setSessionState] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = getSession();
    if (!stored?.access_token) {
      setSessionState(null);
      setIsLoading(false);
      return;
    }

    setSessionState(stored);
    refreshSessionProfile(stored)
      .then((enriched) => {
        setSession(enriched);
        setSessionState(enriched);
      })
      .catch(() => {
        setSessionState(stored);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (payload: LoginPayload) => {
      const response = await loginService(payload);
      const enriched = await enrichSession(response);
      setSession(enriched);
      setSessionState(enriched);
    },
    [],
  );

  const logout = useCallback(() => {
    clearSession();
    setSessionState(null);
    router.push("/login");
  }, [router]);

  const refreshProfile = useCallback(async () => {
    const stored = getSession();
    if (!stored?.access_token) return;
    const enriched = await refreshSessionProfile(stored);
    setSession(enriched);
    setSessionState(enriched);
  }, []);

  const value = useMemo(
    () => ({
      session,
      isLoading,
      isAuthenticated: Boolean(session?.access_token),
      login,
      logout,
      refreshProfile,
    }),
    [session, isLoading, login, logout, refreshProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
