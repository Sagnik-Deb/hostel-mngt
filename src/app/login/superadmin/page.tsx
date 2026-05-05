"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ShieldAlert, Crown, ArrowLeft, Lock } from "lucide-react";

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
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl bg-red-500"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl bg-purple-500"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-6">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-md bg-gradient-to-br from-red-500 to-purple-600">
              <Crown className="w-7 h-7" />
            </div>
            <div className="text-left">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground">
                AUSHostel
              </p>
              <p className="text-xl font-bold tracking-tight text-foreground">Super Admin Portal</p>
            </div>
          </Link>

          {/* Security badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold mb-2 bg-red-50 text-red-600 border border-red-100">
            <Lock className="w-3 h-3" /> Restricted Access — Authorised Personnel Only
          </div>
        </div>

        {/* Notice */}
        <div className="p-4 rounded-xl text-sm mb-6 bg-amber-50 text-amber-900 border border-amber-200 shadow-sm">
          <p className="font-semibold mb-1 flex items-center gap-2 text-amber-700">
            <ShieldAlert className="w-4 h-4" /> Cross-Hostel Access
          </p>
          Select which hostel you want to manage for this session. Your permissions will be scoped to the selected hostel only.
        </div>

        <Card className="border-border shadow-sm">
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Super Admin Login</CardTitle>
              <CardDescription>Authenticate to access cross-hostel management.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-100">
                  {error}
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="superadmin-email">Super Admin Email</Label>
                <Input
                  id="superadmin-email"
                  type="email"
                  placeholder="superadmin@hostelmgmt.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="superadmin-password">Password</Label>
                <Input
                  id="superadmin-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="superadmin-hostel">Select Hostel to Manage *</Label>
                <Select value={hostelId} onValueChange={setHostelId} required>
                  <SelectTrigger id="superadmin-hostel">
                    <SelectValue placeholder="— Choose a hostel —" />
                  </SelectTrigger>
                  <SelectContent>
                    {hostels.map((h) => (
                      <SelectItem key={h.id} value={h.id}>
                        {h.name} ({h.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  Your session will be scoped to this hostel.
                </p>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                type="submit"
                className="w-full h-11 bg-gradient-to-r from-red-500 to-purple-600 hover:from-red-600 hover:to-purple-700 text-white shadow-md border-0"
                disabled={loading}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</>
                ) : (
                  <><Crown className="mr-2 h-4 w-4" /> Enter as Super Admin</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>

        {/* Links */}
        <div className="text-center mt-8">
          <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to regular login
          </Link>
        </div>
      </div>
    </div>
  );
}
