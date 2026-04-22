"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface User {
  id: string;
  name: string;
  email: string;
  role: "STUDENT" | "ADMIN" | "PRIMARY_ADMIN" | "SUPER_ADMIN";
  status: string;
  hostelId: string;
  hostelName?: string;
  hostelCode?: string;
  hostel?: { id: string; name: string; code: string };
  room?: { id: string; number: string; floor: number; roomType: string } | null;
  bedNumber?: number | null;
  profileImage?: string | null;
  adminState?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string, loginType: string, hostelId?: string) => Promise<void>;
  superadminLogin: (email: string, password: string, hostelId: string) => Promise<void>;
  signup: (data: Record<string, unknown>) => Promise<{ applicationId: string; email: string }>;
  verifyEmail: (email: string, code: string) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchUser = useCallback(async (t: string) => {
    try {
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.data);
      } else {
        localStorage.removeItem("token");
        setToken(null);
        setUser(null);
      }
    } catch {
      localStorage.removeItem("token");
      setToken(null);
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("token");
    if (stored) {
      setToken(stored);
      fetchUser(stored).finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [fetchUser]);

  const login = async (email: string, password: string, loginType: string, hostelId?: string) => {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, loginType, hostelId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);

    if (data.data.user.role === "ADMIN" || data.data.user.role === "PRIMARY_ADMIN" || data.data.user.role === "SUPER_ADMIN") {
      router.push("/admin/dashboard");
    } else {
      router.push("/student/dashboard");
    }
  };

  const superadminLogin = async (email: string, password: string, hostelId: string) => {
    const res = await fetch("/api/auth/superadmin-login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, hostelId }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Login failed");

    localStorage.setItem("token", data.data.token);
    setToken(data.data.token);
    setUser(data.data.user);
    router.push("/admin/dashboard");
  };

  const signup = async (formData: Record<string, unknown>) => {
    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Signup failed");
    return data.data;
  };

  const verifyEmail = async (email: string, code: string) => {
    const res = await fetch("/api/auth/verify-email", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, code }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Verification failed");
  };

  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  const refreshUser = async () => {
    if (token) await fetchUser(token);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, superadminLogin, signup, verifyEmail, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
