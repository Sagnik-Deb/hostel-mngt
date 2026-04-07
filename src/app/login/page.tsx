"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Hostel {
  id: string;
  name: string;
  code: string;
}

export default function LoginPage() {
  const { login } = useAuth();
  const [loginType, setLoginType] = useState<"student" | "admin">("student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [hostelId, setHostelId] = useState("");
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/hostels")
      .then((r) => r.json())
      .then((d) => { if (d.success) setHostels(d.data); })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, loginType, hostelId || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.08) 0%, var(--color-bg) 50%, rgba(6,182,212,0.05) 100%)' }}>
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ background: 'var(--gradient-primary)' }}>H</div>
            <span className="text-2xl font-bold">HostelHub</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Welcome back</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Sign in to your account</p>
        </div>

        {/* Login Type Tabs */}
        <div className="flex gap-2 mb-6 p-1 rounded-lg" style={{ background: 'var(--color-surface)' }}>
          <button
            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${loginType === "student" ? "text-white" : ""}`}
            style={loginType === "student" ? { background: 'var(--gradient-primary)' } : { color: 'var(--color-text-muted)' }}
            onClick={() => setLoginType("student")}
          >
            🎓 Student
          </button>
          <button
            className={`flex-1 py-2.5 rounded-md text-sm font-semibold transition-all ${loginType === "admin" ? "text-white" : ""}`}
            style={loginType === "admin" ? { background: 'var(--gradient-primary)' } : { color: 'var(--color-text-muted)' }}
            onClick={() => setLoginType("admin")}
          >
            🛡️ Admin
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg text-sm font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Email</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="login-email"
            />
          </div>

          <div>
            <label className="input-label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              id="login-password"
            />
          </div>

          {loginType === "student" && (
            <div>
              <label className="input-label">Select Hostel</label>
              <select
                className="input"
                value={hostelId}
                onChange={(e) => setHostelId(e.target.value)}
                id="login-hostel"
              >
                <option value="">Select your hostel</option>
                {hostels.map((h) => (
                  <option key={h.id} value={h.id}>{h.name}</option>
                ))}
              </select>
            </div>
          )}

          <button
            type="submit"
            className="btn btn-primary w-full btn-lg"
            disabled={loading}
            id="login-submit"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              `Sign In as ${loginType === "student" ? "Student" : "Admin"}`
            )}
          </button>

          <p className="text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
              Register here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}
