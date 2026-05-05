"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, Mail, CheckCircle2, ArrowRight, ArrowLeft, ShieldCheck, ShieldAlert, PartyPopper } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl bg-indigo-500"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl bg-purple-500"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-foreground">AUSHostel Admin</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 tracking-tight text-foreground">Admin Registration</h1>
          <p className="text-sm text-muted-foreground">Register to manage a hostel — subject to approval</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {steps.map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold transition-colors ${step > i + 1
                    ? "bg-emerald-500 text-white"
                    : step === i + 1
                      ? "bg-indigo-600 text-white shadow-sm"
                      : "bg-muted text-muted-foreground"
                  }`}
              >
                {step > i + 1 ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              <p className={`text-xs font-medium ${step === i + 1 ? "text-foreground" : "text-muted-foreground"}`}>
                {label}
              </p>
            </div>
          ))}
        </div>

        <Card className="border-border shadow-sm">
          <CardContent className="pt-6">
            {error && (
              <div className="p-3 rounded-lg text-sm font-medium mb-6 bg-red-50 text-red-600 border border-red-100">
                {error}
              </div>
            )}

            {/* Step 1: Personal Information */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="p-3 rounded-lg text-sm mb-2 bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-start gap-2">
                  <ShieldAlert className="w-5 h-5 shrink-0 mt-0.5" />
                  <p>After registration, your account needs approval from an existing hostel admin before you can log in.</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-name">Full Name *</Label>
                  <Input name="name" id="admin-signup-name" placeholder="John Doe" value={form.name} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-email">Email *</Label>
                  <Input name="email" id="admin-signup-email" type="email" placeholder="admin@example.com" value={form.email} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-phone">Phone</Label>
                  <Input name="phone" id="admin-signup-phone" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-password">Password *</Label>
                  <Input name="password" id="admin-signup-password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-confirm-password">Confirm Password *</Label>
                  <Input name="confirmPassword" id="admin-signup-confirm-password" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} />
                </div>
                <Button onClick={handleStep1} className="w-full mt-4 h-11 gap-2 bg-indigo-600 hover:bg-indigo-700">
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Hostel Selection */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="admin-signup-hostel">Select Hostel to Manage *</Label>
                  <Select name="hostelId" value={form.hostelId} onValueChange={(v) => setForm({ ...form, hostelId: v })} required>
                    <SelectTrigger id="admin-signup-hostel">
                      <SelectValue placeholder="Choose a hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-muted-foreground mt-1">
                    The existing admins of the selected hostel will be notified and must approve your application before you gain access.
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={handleStep2} className="flex-1 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                    {loading ? "Submitting..." : "Submit & Verify"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 text-center py-6">
                <div className="w-16 h-16 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Verify Your Email</h3>
                  <p className="text-sm text-muted-foreground">
                    We&apos;ve sent a 6-digit OTP to <strong className="text-foreground">{signupEmail}</strong>
                  </p>
                </div>
                <div className="space-y-4">
                  <Input
                    className="text-center text-3xl tracking-[0.5em] font-mono h-16 w-3/4 mx-auto"
                    placeholder="000000"
                    maxLength={6}
                    value={otp}
                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                  />
                  <Button onClick={handleVerify} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700" disabled={loading}>
                    {loading ? "Verifying..." : "Verify Email"}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Note: If SMTP is not configured, check the server console for the OTP.
                </p>
              </div>
            )}

            {/* Step 4: Success */}
            {step === 4 && (
              <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 py-6">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <PartyPopper className="w-10 h-10" />
                </div>
                <h3 className="text-2xl font-bold tracking-tight text-foreground">Registration Complete!</h3>
                <div className="p-4 rounded-xl text-sm text-left space-y-3 bg-emerald-50 border border-emerald-100">
                  <p className="font-semibold text-emerald-700 flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5" /> Email verified successfully
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Your admin registration is now <strong>pending approval</strong>. The existing admins of your selected hostel have been notified.
                  </p>
                  <p className="text-emerald-800 leading-relaxed">
                    Once approved, you will receive a notification and can log in to the admin portal.
                  </p>
                </div>
                <Link href="/login" className="inline-block mt-4">
                  <Button className="h-11 px-8 gap-2 bg-indigo-600 hover:bg-indigo-700">
                    Go to Login <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline mr-2">
            Sign in here
          </Link>
          ·
          <Link href="/signup" className="font-semibold text-muted-foreground hover:text-foreground ml-2 transition-colors">
            Student signup
          </Link>
        </p>
      </div>
    </div>
  );
}
