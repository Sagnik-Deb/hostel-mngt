"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Check, UploadCloud, FileText, X, Mail, CheckCircle2, ArrowRight, ArrowLeft, Building2 } from "lucide-react";

interface Hostel {
  id: string;
  name: string;
}

export default function SignupPage() {
  const { signup } = useAuth();
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: info, 2: hostel+docs, 3: OTP, 4: Success
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");

  const [form, setForm] = useState({
    name: "", email: "", password: "", confirmPassword: "",
    phone: "", aadharNumber: "", collegeIdUpload: "",
    hostelId: "", roommatePreference: "",
  });

  const [certFile, setCertFile] = useState<File | null>(null);
  const [certPreview, setCertPreview] = useState<string | null>(null);
  const [uploadingCert, setUploadingCert] = useState(false);
  const certInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

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

  const handleCertFileChange = (file: File | null) => {
    if (!file) return;
    const allowed = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!allowed.includes(file.type)) {
      setError("Certificate must be a JPG, PNG, WebP, or PDF file");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("Certificate file must be under 5 MB");
      return;
    }
    setError("");
    setCertFile(file);
    if (file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = (e) => setCertPreview(e.target?.result as string);
      reader.readAsDataURL(file);
    } else {
      setCertPreview("pdf");
    }
  };

  const handleStep2 = async () => {
    if (!form.hostelId) {
      setError("Please select a hostel");
      return;
    }
    setError("");
    setLoading(true);

    try {
      let allotmentCertificateUrl = "";
      if (certFile) {
        setUploadingCert(true);
        const fd = new FormData();
        fd.append("file", certFile);
        const uploadRes = await fetch("/api/upload", { method: "POST", body: fd });
        const uploadData = await uploadRes.json();
        setUploadingCert(false);
        if (!uploadRes.ok) throw new Error(uploadData.error || "Certificate upload failed");
        allotmentCertificateUrl = uploadData.url;
      }

      const result = await signup({
        name: form.name,
        email: form.email,
        password: form.password,
        phone: form.phone,
        aadharNumber: form.aadharNumber,
        collegeIdUpload: form.collegeIdUpload,
        hostelId: form.hostelId,
        roommatePreference: form.roommatePreference,
        allotmentCertificate: allotmentCertificateUrl || undefined,
      });
      setSignupEmail(result.email);
      setStep(3);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Signup failed");
    } finally {
      setLoading(false);
      setUploadingCert(false);
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
      setStep(4);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 right-10 w-72 h-72 rounded-full opacity-10 blur-3xl bg-blue-400"></div>
      <div className="absolute bottom-10 left-10 w-96 h-96 rounded-full opacity-10 blur-3xl bg-primary"></div>

      <div className="w-full max-w-lg relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl bg-primary shadow-sm">H</div>
            <span className="text-2xl font-bold tracking-tight text-foreground">AUSHostel</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 tracking-tight text-foreground">Create Account</h1>
          <p className="text-sm text-muted-foreground">Register for hostel accommodation</p>
        </div>

        {/* Progress Steps */}
        <div className="flex items-center gap-2 mb-8 px-2">
          {["Personal Info", "Hostel & Docs", "Verify Email", "Done"].map((label, i) => (
            <div key={i} className="flex-1 text-center">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto mb-2 text-sm font-bold transition-colors ${step > i + 1
                    ? "bg-emerald-500 text-white"
                    : step === i + 1
                      ? "bg-primary text-primary-foreground shadow-sm"
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

            {/* Step 1: Personal Info */}
            {step === 1 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="signup-name">Full Name *</Label>
                  <Input name="name" id="signup-name" placeholder="John Doe" value={form.name} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email *</Label>
                  <Input name="email" id="signup-email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-phone">Phone</Label>
                  <Input name="phone" id="signup-phone" placeholder="+91-XXXXXXXXXX" value={form.phone} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password *</Label>
                  <Input name="password" id="signup-password" type="password" placeholder="Min 6 characters" value={form.password} onChange={handleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-confirm-password">Confirm Password *</Label>
                  <Input name="confirmPassword" id="signup-confirm-password" type="password" placeholder="Re-enter password" value={form.confirmPassword} onChange={handleChange} required />
                </div>
                <Button onClick={handleStep1} className="w-full mt-4 h-11 gap-2">
                  Next Step <ArrowRight className="w-4 h-4" />
                </Button>
              </div>
            )}

            {/* Step 2: Hostel & Documents */}
            {step === 2 && (
              <div className="space-y-4 animate-in fade-in slide-in-from-right-2 duration-300">
                <div className="space-y-2">
                  <Label htmlFor="signup-hostel">Select Hostel *</Label>
                  <Select name="hostelId" value={form.hostelId} onValueChange={(v) => setForm({ ...form, hostelId: v })} required>
                    <SelectTrigger id="signup-hostel">
                      <SelectValue placeholder="Choose your hostel" />
                    </SelectTrigger>
                    <SelectContent>
                      {hostels.map((h) => (
                        <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-aadhar">Aadhar Number</Label>
                  <Input name="aadharNumber" id="signup-aadhar" placeholder="XXXX-XXXX-XXXX" value={form.aadharNumber} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-college-id">College ID</Label>
                  <Input name="collegeIdUpload" id="signup-college-id" placeholder="College ID number" value={form.collegeIdUpload} onChange={handleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-roommate">Roommate Preference</Label>
                  <Textarea
                    name="roommatePreference"
                    id="signup-roommate"
                    rows={3}
                    placeholder="Any preferences for roommates? (optional)"
                    value={form.roommatePreference}
                    onChange={handleChange}
                    className="resize-none"
                  />
                </div>

                {/* Allotment Certificate Upload */}
                <div className="space-y-2">
                  <Label className="flex items-baseline gap-2">
                    Hostel Allotment Certificate
                    <span className="text-xs font-normal text-muted-foreground">(JPG/PNG/PDF, max 5 MB)</span>
                  </Label>
                  <div
                    onClick={() => certInputRef.current?.click()}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={(e) => {
                      e.preventDefault();
                      setIsDragging(false);
                      const dropped = e.dataTransfer.files[0];
                      handleCertFileChange(dropped);
                    }}
                    className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-colors ${isDragging ? "border-primary bg-primary/5" : certFile ? "border-emerald-500 bg-emerald-50" : "border-border hover:bg-muted/50"
                      }`}
                  >
                    {certPreview && certPreview !== "pdf" ? (
                      <div className="relative inline-block">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={certPreview} alt="Preview" className="max-h-[140px] max-w-full rounded-md object-contain" />
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCertFile(null); setCertPreview(null); }}
                          className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ) : certPreview === "pdf" ? (
                      <div className="flex flex-col items-center gap-2">
                        <FileText className="w-12 h-12 text-blue-500" />
                        <p className="text-sm font-semibold truncate max-w-[200px]">{certFile?.name}</p>
                        <button
                          type="button"
                          onClick={(e) => { e.stopPropagation(); setCertFile(null); setCertPreview(null); }}
                          className="text-xs text-red-500 hover:underline"
                        >
                          Remove file
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2 text-muted-foreground">
                        <UploadCloud className="w-10 h-10 mb-1" />
                        <p className="text-sm">
                          <span className="font-semibold text-primary">Click to upload</span> or drag & drop
                        </p>
                        <p className="text-xs">Hostel allotment confirmation certificate</p>
                      </div>
                    )}
                  </div>
                  <input
                    ref={certInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp,application/pdf"
                    className="hidden"
                    onChange={(e) => handleCertFileChange(e.target.files?.[0] ?? null)}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <Button variant="outline" onClick={() => setStep(1)} className="flex-1 gap-2">
                    <ArrowLeft className="w-4 h-4" /> Back
                  </Button>
                  <Button onClick={handleStep2} className="flex-1" disabled={loading || uploadingCert}>
                    {uploadingCert ? "Uploading..." : loading ? "Submitting..." : "Submit"}
                  </Button>
                </div>
              </div>
            )}

            {/* Step 3: OTP Verification */}
            {step === 3 && (
              <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300 text-center py-6">
                <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Mail className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold tracking-tight text-foreground mb-2">Check Your Email</h3>
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
                  <Button onClick={handleVerify} className="w-full h-11" disabled={loading}>
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
              <div className="text-center space-y-6 animate-in fade-in zoom-in-95 duration-300 py-8">
                <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto text-emerald-500">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold tracking-tight text-foreground mb-2">Application Submitted!</h3>
                  <p className="text-sm text-muted-foreground max-w-sm mx-auto">
                    Your email has been verified successfully. Your application is now pending admin approval. You&apos;ll be notified once approved.
                  </p>
                </div>
                <Link href="/login" className="inline-block mt-4">
                  <Button className="h-11 px-8 gap-2">
                    Go to Login <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm mt-8 text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  );
}
