"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

interface Hostel {
  id: string;
  name: string;
  code: string;
}

export default function SuperadminLoginPage() {
  const { superadminLogin } = useAuth();
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
    if (!hostelId) { setError("Please select a hostel to manage"); return; }
    setError("");
    setLoading(true);
    try {
      await superadminLogin(email, password, hostelId);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{
        background: "linear-gradient(135deg, rgba(239,68,68,0.06) 0%, var(--color-bg) 45%, rgba(124,58,237,0.1) 100%)",
      }}
    >
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-lg"
              style={{ background: "linear-gradient(135deg, #ef4444, #7c3aed)" }}
            >
              👑
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: "var(--color-text-muted)" }}>
                HostelHub
              </p>
              <p className="text-xl font-bold">Super Admin Portal</p>
            </div>
          </Link>

          {/* Security badge */}
          <div
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold mb-2"
            style={{
              background: "rgba(239,68,68,0.1)",
              color: "#ef4444",
              border: "1px solid rgba(239,68,68,0.2)",
            }}
          >
            🔒 Restricted Access — Authorised Personnel Only
          </div>
        </div>

        {/* Notice */}
        <div
          className="p-4 rounded-xl text-sm mb-6"
          style={{
            background: "rgba(245,158,11,0.08)",
            border: "1px solid rgba(245,158,11,0.2)",
            color: "var(--color-text-muted)",
          }}
        >
          <p className="font-semibold mb-1" style={{ color: "var(--color-warning)" }}>
            ⚡ Cross-Hostel Access
          </p>
          Select which hostel you want to manage for this session. Your permissions will be scoped to the selected hostel only.
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="glass p-6 space-y-4">
          {error && (
            <div
              className="p-3 rounded-lg text-sm font-medium"
              style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-danger)" }}
            >
              {error}
            </div>
          )}

          <div>
            <label className="input-label">Super Admin Email</label>
            <input
              type="email"
              className="input"
              placeholder="superadmin@hostelmgmt.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              id="superadmin-email"
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
              id="superadmin-password"
            />
          </div>

          <div>
            <label className="input-label">Select Hostel to Manage *</label>
            <select
              className="input"
              value={hostelId}
              onChange={(e) => setHostelId(e.target.value)}
              required
              id="superadmin-hostel"
            >
              <option value="">— Choose a hostel —</option>
              {hostels.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.name} ({h.code})
                </option>
              ))}
            </select>
            <p className="text-xs mt-1" style={{ color: "var(--color-text-muted)" }}>
              Your session will be scoped to this hostel.
            </p>
          </div>

          <button
            type="submit"
            className="btn w-full btn-lg font-semibold"
            disabled={loading}
            id="superadmin-submit"
            style={{
              background: "linear-gradient(135deg, #ef4444, #7c3aed)",
              color: "white",
            }}
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                Signing in...
              </span>
            ) : (
              "👑 Enter as Super Admin"
            )}
          </button>
        </form>

        {/* Links */}
        <div className="text-center mt-6 space-y-2">
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            <Link href="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
              ← Back to regular login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
