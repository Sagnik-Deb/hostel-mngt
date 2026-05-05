"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, GraduationCap, ShieldAlert, Crown } from "lucide-react";

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

  const handleSubmit = async (e: React.FormEvent, type: "student" | "admin") => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password, type, hostelId || undefined);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl bg-primary"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl bg-blue-300"></div>

      <div className="w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-bold text-xl bg-primary shadow-sm">H</div>
            <span className="text-2xl font-bold tracking-tight text-foreground">AUSHostel</span>
          </Link>
          <h1 className="text-2xl font-bold mb-2 tracking-tight text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">Sign in to your account</p>
        </div>

        <Tabs defaultValue="student" className="w-full" onValueChange={(v) => setLoginType(v as "student" | "admin")}>
          <TabsList className="grid w-full grid-cols-2 mb-6 h-12">
            <TabsTrigger value="student" className="font-semibold gap-2">
              <GraduationCap className="w-4 h-4" /> Student
            </TabsTrigger>
            <TabsTrigger value="admin" className="font-semibold gap-2">
              <ShieldAlert className="w-4 h-4" /> Admin
            </TabsTrigger>
          </TabsList>

          <TabsContent value="student">
            <Card className="border-border shadow-sm">
              <form onSubmit={(e) => handleSubmit(e, "student")}>
                <CardHeader>
                  <CardTitle>Student Login</CardTitle>
                  <CardDescription>Access your hostel dashboard</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && loginType === "student" && (
                    <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-100">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="student-email">Email</Label>
                    <Input id="student-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-password">Password</Label>
                    <Input id="student-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="student-hostel">Select Hostel</Label>
                    <Select value={hostelId} onValueChange={setHostelId} required>
                      <SelectTrigger id="student-hostel">
                        <SelectValue placeholder="Select your hostel" />
                      </SelectTrigger>
                      <SelectContent>
                        {hostels.map((h) => (
                          <SelectItem key={h.id} value={h.id}>{h.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading && loginType === "student" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : "Sign In as Student"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground w-full">
                    Don&apos;t have an account? <Link href="/signup" className="font-semibold text-primary hover:underline">Register here</Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>

          <TabsContent value="admin">
            <Card className="border-border shadow-sm">
              <form onSubmit={(e) => handleSubmit(e, "admin")}>
                <CardHeader>
                  <CardTitle>Admin Login</CardTitle>
                  <CardDescription>Manage your hostel</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {error && loginType === "admin" && (
                    <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-100">
                      {error}
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Email</Label>
                    <Input id="admin-email" type="email" placeholder="admin@AUSHostel.com" value={email} onChange={(e) => setEmail(e.target.value)} required />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="admin-password">Password</Label>
                    <Input id="admin-password" type="password" placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} required />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col space-y-4">
                  <Button type="submit" className="w-full h-11" disabled={loading}>
                    {loading && loginType === "admin" ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in...</> : "Sign In as Admin"}
                  </Button>
                  <p className="text-center text-sm text-muted-foreground w-full">
                    Don&apos;t have an account? <Link href="/signup/admin" className="font-semibold text-primary hover:underline">Register as Admin</Link>
                  </p>
                </CardFooter>
              </form>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Superadmin link */}
        <p className="text-center text-xs mt-8 text-muted-foreground">
          System administrator?{" "}
          <Link href="/login/superadmin" className="font-semibold text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors">
            <Crown className="w-3 h-3" /> Super Admin Login
          </Link>
        </p>
      </div>
    </div>
  );
}
