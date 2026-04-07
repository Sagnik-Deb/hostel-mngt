"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

interface Hostel {
  id: string;
  name: string;
}

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: info, 2: hostel+docs, 3: OTP
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", aadharNumber: "", collegeIdUpload: "",
    hostelId: "", roommatePreference: "",
  });

  const [otp, setOtp] = useState("");

  useEffect(() => {
    fetch("/api/hostels")
      .then((r) => r.json())
      .then((d) => { if (d.success) setHostels(d.data); })
      .catch(console.error);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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
      const result = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        aadharNumber: form.aadharNumber,
        collegeIdUpload: form.collegeIdUpload,
        hostelId: form.hostelId,
        roommatePreference: form.roommatePreference,
      });
      setSignupEmail(result.email);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
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
      if (!res.ok) throw new Error(data.error);
      setStep(4); // success
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, rgba(6,182,212,0.05) 0%, var(--color-bg) 50%, rgba(124,58,237,0.08) 100%)' }}>
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl" style={{ background: 'var(--gradient-primary)' }}>H</div>
            <span className="text-2xl font-bold">HostelHub</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Register for hostel accommodation</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Personal Info", "Hostel & Docs", "Verify Email", "Done"].map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-1 text-sm font-bold"
                style={{
                  background: step > i + 1 ? 'var(--color-success)' : step === i + 1 ? 'var(--gradient-primary)' : 'var(--color-surface-2)',
                  color: step >= i + 1 ? 'white' : 'var(--color-text-muted)',
                }}
              >
                {step > i + 1 ? "✓" : i + 1}
              </div>
              <p className="text-xs" style={{ color: step === i + 1 ? 'var(--color-text)' : 'var(--color-text-muted)' }}>{label}</p>
            </div>
          ))}
        </div>

        {/* Form */}
        <div className="glass p-6">
          {error && (
            <div className="p-3 rounded-lg text-sm font-medium mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
              {error}
            </div>
          )}

          {/* Step 1: Personal Info */}
          {step === 1 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="input-label">Full Name *</label>
                <input name="name" className="input" placeholder="John Doe" value={form.name} onChange={handleChange} required id="signup-name" />
              </div>
              <div>
                <label className="input-label">Email *</label>
                <input name="email" type="email" className="input" placeholder="you@example.com" value={form.email} onChange={handleChange} required id="signup-email" />
              </div>
              <div>
                <label className="input-label">Phone</label>
                <input name="phone" className="input" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={handleChange} id="signup-phone" />
              </div>
              <div>
                <label className="input-label">Password *</label>
                <input name="password" type="password" className="input" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required id="signup-password" />
              </div>
              <div>
                <label className="input-label">Confirm Password *</label>
                <input name="confirmPassword" type="password" className="input" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required id="signup-confirm-password" />
              </div>
              <button onClick={handleStep1} className="btn btn-primary w-full btn-lg" id="signup-next-1">
                Next → Hostel & Documents
              </button>
            </div>
          )}

          {/* Step 2: Hostel & Documents */}
          {step === 2 && (
            <div className="space-y-4 animate-fade-in">
              <div>
                <label className="input-label">Select Hostel *</label>
                <select name="hostelId" className="input" value={form.hostelId} onChange={handleChange} required id="signup-hostel">
                  <option value="">Choose your hostel</option>
                  {hostels.map((h) => (
                    <option key={h.id} value={h.id}>{h.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="input-label">Aadhar Number</label>
                <input name="aadharNumber" className="input" placeholder="XXXX-XXXX-XXXX" value={form.aadharNumber} onChange={handleChange} id="signup-aadhar" />
              </div>
              <div>
                <label className="input-label">College ID</label>
                <input name="collegeIdUpload" className="input" placeholder="College ID number" value={form.collegeIdUpload} onChange={handleChange} id="signup-college-id" />
              </div>
              <div>
                <label className="input-label">Roommate Preference</label>
                <textarea
                  name="roommatePreference"
                  className="input"
                  rows={3}
                  placeholder="Any preferences for roommates? (optional)"
                  value={form.roommatePreference}
                  onChange={handleChange}
                  id="signup-roommate"
                  style={{ resize: 'vertical' }}
                />
              </div>
              <div className="flex gap-3">
                <button onClick={() => setStep(1)} className="btn btn-secondary flex-1">← Back</button>
                <button onClick={handleStep2} className="btn btn-primary flex-1" disabled={loading} id="signup-submit">
                  {loading ? "Submitting..." : "Submit & Verify Email"}
                </button>
              </div>
            </div>
          )}

          {/* Step 3: OTP Verification */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in text-center">
              <div className="text-5xl mb-4">📧</div>
              <h3 className="text-lg font-bold">Check Your Email</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                We&apos;ve sent a 6-digit OTP to <strong>{signupEmail}</strong>
              </p>
              <input
                className="input text-center text-2xl tracking-widest"
                placeholder="000000"
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                id="signup-otp"
              />
              <button onClick={handleVerify} className="btn btn-primary w-full btn-lg" disabled={loading} id="signup-verify">
                {loading ? "Verifying..." : "Verify Email"}
              </button>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                Note: If SMTP is not configured, check the server console for the OTP.
              </p>
            </div>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <div className="text-center space-y-4 animate-fade-in py-8">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto text-3xl" style={{ background: 'rgba(16,185,129,0.15)' }}>✅</div>
              <h3 className="text-xl font-bold">Application Submitted!</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                Your email has been verified successfully. Your application is now pending admin approval. You&apos;ll be notified once approved.
              </p>
              <Link href="/login" className="btn btn-primary btn-lg inline-flex">
                Go to Login →
              </Link>
            </div>
          )}
        </div>

        <p className="text-center text-sm mt-6" style={{ color: 'var(--color-text-muted)' }}>
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: 'var(--color-primary)' }}>
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
