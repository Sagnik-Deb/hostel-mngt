"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Hostel {
  id: string;
  name: string;
}

export default function AdminSignupPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: personal info, 2: hostel, 3: OTP, 4: done
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    phone: "",
    hostelId: "",
  });

  const [otp, setOtp] = useState("");

  useEffect(() => {
    fetch("/api/hostels")
      .then((r) => r.json())
      .then((d) => { if (d.success) setHostels(d.data); })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleStep1 = () => {
    if (!form.name || !form.email || !form.password) {
      setError("Name, email, and password are required");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    setStep(2);
  };

  const handleStep2 = async () => {
    if (!form.hostelId) {
      setError("Please select a hostel");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/admin-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone,
          hostelId: form.hostelId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Registration failed");
      setSignupEmail(data.data.email);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!otp || otp.length !== 6) {
      setError("Please enter a 6-digit OTP");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: signupEmail, code: otp }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Verification failed");
      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const steps = ["Personal Info", "Select Hostel", "Verify Email", "Done"];

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-12"
      style={{ background: "linear-gradient(135deg, rgba(124,58,237,0.08) 0%, var(--color-bg) 50%, rgba(6,182,212,0.05) 100%)" }}
    >
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl"
              style={{ background: "var(--gradient-warm)" }}
            >
              🛡️
            </div>
            <span className="text-2xl font-bold">HostelHub Admin</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Admin Registration</h1>
          <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
            Register to manage a hostel — subject to approval by existing admins
          </p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 text-sm font-bold transition-all"
                style={{
                  background:
                    step > i + 1
                      ? "var(--color-success)"
                      : step === i + 1
                      ? "var(--gradient-warm)"
                      : "var(--color-surface-2)",
                  color: step >= i + 1 ? "white" : "var(--color-text-muted)",
                }}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <p
                className="text-xs"
                style={{ color: step === i + 1 ? "var(--color-text)" : "var(--color-text-muted)" }}
              >
                {label}
              </p>
            </div>
          ))}
        </div>

        <div className="glass p-6">
          {error && (
            <div
              className="p-3 rounded-lg text-sm font-medium mb-4"
              style={{ background: "rgba(239,68,68,0.1)", color: "var(--color-danger)" }}
            >
              {error}
            </div>
          )}

          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div
                className="p-3 rounded-lg text-sm mb-2"
                style={{ background: "rgba(124,58,237,0.1)", color: "var(--color-primary)" }}
              >
                🛡️ After registration, your account needs approval from an existing hostel admin before you can log in.
              </div>
              <div>
                <label className="input-label">Full Name *</label>
                <input
                  name="name"
                  className="input"
                  placeholder="John Doe"
                  value={form.name}
                  onChange={handleChange}
                  id="admin-signup-name"
                />
              </div>
              <div>
                <label className="input-label">Email *</label>
                <input
                  name="email"
                  type="email"
                  className="input"
                  placeholder="admin@example.com"
                  value={form.email}
                  onChange={handleChange}
                  id="admin-signup-email"
                />
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input
                  name="phone"
                  className="input"
                  placeholder="+91-XXXXXXXXXX"
                  value={form.phone}
                  onChange={handleChange}
                  id="admin-signup-phone"
                />
              </div>
              <div>
                <label className="input-label">Password *</label>
                <input
                  name="password"
                  type="password"
                  className="input"
                  placeholder="Min 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  id="admin-signup-password"
                />
              </div>
              <div>
                <label className="input-label">Confirm Password *</label>
                <input
                  name="confirmPassword"
                  type="password"
                  className="input"
                  placeholder="Re-enter password"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  id="admin-signup-confirm-password"
                />
              </div>
              <button
                onClick={handleStep1}
                className="btn btn-primary w-full btn-lg"
                id="admin-signup-next-1"
              >
                Next → Select Hostel
              </button>
            </div>
          )}

          {/* Step 2: Hostel Selection */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="input-label">Select Hostel to Manage *</label>
                <select
                  name="hostelId"
                  className="input"
                  value={form.hostelId}
                  onChange={handleChange}
                  id="admin-signup-hostel"
                >
                  <option value="">Choose a hostel</option>
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
              </div>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                The existing admins of the selected hostel will be notified and must approve your application before you gain access.
              </p>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">
                  ← Back
                </button>
                <button
                  onClick={handleStep2}
                  className="btn btn-primary flex-1"
                  disabled={loading}
                  id="admin-signup-submit"
                >
                  {loading ? "Submitting..." : "Submit & Verify Email"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-lg font-bold">Verify Your Email</h3>
              <p className="text-sm" style={{ color: "var(--color-text-muted)" }}>
                We&apos;ve sent a 6-digit OTP to <strong>{signupEmail}</strong>
              </p>
              <input
                className="input text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                id="admin-signup-otp"
              />
              <button
                onClick={handleVerify}
                className="btn btn-primary w-full btn-lg"
                disabled={loading}
                id="admin-signup-verify"
              >
                {loading ? "Verifying..." : "Verify Email"}
              </button>
              <p className="text-xs" style={{ color: "var(--color-text-muted)" }}>
                Note: If SMTP is not configured, check the server console for the OTP.
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-4 animate-fade-in py-6">
              <div
                className="w-20 h-20 rounded-full flex items-center justify-center mx-auto text-4xl"
                style={{ background: "rgba(124,58,237,0.12)" }}
              >
                🎉
              </div>
              <h3 className="text-xl font-bold">Registration Complete!</h3>
              <div
                className="p-4 rounded-xl text-sm text-left space-y-2"
                style={{ background: "rgba(16,185,129,0.08)", border: "1px solid rgba(16,185,129,0.2)" }}
              >
                <p className="font-semibold" style={{ color: "var(--color-success)" }}>
                  ✅ Email verified successfully
                </p>
                <p style={{ color: "var(--color-text-muted)" }}>
                  Your admin registration is now <strong>pending approval</strong>. The existing admins of your selected hostel have been notified.
                </p>
                <p style={{ color: "var(--color-text-muted)" }}>
                  Once approved, you will receive a notification and can log in to the admin portal.
                </p>
              </div>
              <Link href="/login" className="btn btn-primary btn-lg inline-flex" id="admin-signup-go-login">
                Go to Login →
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: "var(--color-text-muted)" }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "var(--color-primary)" }}>
            Sign in here
          </Link>
          {" · "}
          <Link href="/signup" className="font-semibold" style={{ color: "var(--color-text-muted)" }}>
            Student signup
          </Link>
        </p>
      </div>
    </div>
  );
}
