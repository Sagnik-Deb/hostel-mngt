"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft, Crown, Building2 } from "lucide-react";

export default function CreateHostelPage() {
  const router = useRouter();
  
  // Superadmin credentials
  const [adminEmail, setAdminEmail] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  
  // Hostel details
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [wardenName, setWardenName] = useState("");
  const [wardenEmail, setWardenEmail] = useState("");
  const [wardenPhone, setWardenPhone] = useState("");
  const [description, setDescription] = useState("");
  const [address, setAddress] = useState("");
  const [totalRooms, setTotalRooms] = useState("");
  const [capacity, setCapacity] = useState("");
  
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/hostels/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          adminEmail,
          adminPassword,
          name,
          code,
          wardenName,
          wardenEmail,
          wardenPhone,
          description,
          address,
          totalRooms,
          capacity,
        }),
      });

      const data = await res.json();
      
      if (!data.success) {
        throw new Error(data.error || "Failed to create hostel");
      }

      setSuccess("Hostel created successfully! Redirecting...");
      
      // Redirect back to superadmin login after a short delay
      setTimeout(() => {
        router.push("/login/superadmin");
      }, 2000);

    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-background relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-10 blur-3xl bg-green-500"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl bg-blue-500"></div>

      <div className="w-full max-w-2xl relative z-10">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl text-white shadow-md bg-gradient-to-br from-green-500 to-emerald-700 mb-4">
            <Building2 className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">Create New Hostel</h1>
          <p className="text-muted-foreground mt-2">Add a new hostel to the management system</p>
        </div>

        <Card className="border-border shadow-md">
          <form onSubmit={handleSubmit}>
            <CardHeader className="bg-muted/30 border-b border-border pb-6">
              <CardTitle className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" /> Superadmin Authorization
              </CardTitle>
              <CardDescription>
                You must provide Superadmin credentials to perform this action.
              </CardDescription>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="space-y-2">
                  <Label htmlFor="adminEmail">Superadmin Email *</Label>
                  <Input 
                    id="adminEmail" 
                    type="email" 
                    value={adminEmail} 
                    onChange={(e) => setAdminEmail(e.target.value)} 
                    required 
                    placeholder="superadmin@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="adminPassword">Superadmin Password *</Label>
                  <Input 
                    id="adminPassword" 
                    type="password" 
                    value={adminPassword} 
                    onChange={(e) => setAdminPassword(e.target.value)} 
                    required 
                    placeholder="••••••••"
                  />
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-6 pt-6">
              {error && (
                <div className="p-3 rounded-lg text-sm font-medium bg-red-50 text-red-600 border border-red-100">
                  {error}
                </div>
              )}
              {success && (
                <div className="p-3 rounded-lg text-sm font-medium bg-green-50 text-green-600 border border-green-100">
                  {success}
                </div>
              )}

              <div className="space-y-4">
                <h3 className="text-lg font-semibold border-b border-border pb-2">Hostel Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Hostel Name *</Label>
                    <Input 
                      id="name" 
                      value={name} 
                      onChange={(e) => setName(e.target.value)} 
                      required 
                      placeholder="e.g. Boys Hostel A"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="code">Hostel Code *</Label>
                    <Input 
                      id="code" 
                      value={code} 
                      onChange={(e) => setCode(e.target.value.toUpperCase())} 
                      required 
                      placeholder="e.g. BHA"
                      className="uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="wardenName">Warden Name *</Label>
                    <Input 
                      id="wardenName" 
                      value={wardenName} 
                      onChange={(e) => setWardenName(e.target.value)} 
                      required 
                      placeholder="Dr. John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wardenEmail">Warden Email *</Label>
                    <Input 
                      id="wardenEmail" 
                      type="email" 
                      value={wardenEmail} 
                      onChange={(e) => setWardenEmail(e.target.value)} 
                      required 
                      placeholder="warden@example.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="wardenPhone">Warden Phone *</Label>
                    <Input 
                      id="wardenPhone" 
                      value={wardenPhone} 
                      onChange={(e) => setWardenPhone(e.target.value)} 
                      required 
                      placeholder="+91 9876543210"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Address</Label>
                  <Input 
                    id="address" 
                    value={address} 
                    onChange={(e) => setAddress(e.target.value)} 
                    placeholder="Full address of the hostel"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea 
                    id="description" 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                    placeholder="Brief description about the hostel"
                    className="resize-none"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="totalRooms">Total Rooms</Label>
                    <Input 
                      id="totalRooms" 
                      type="number" 
                      min="0"
                      value={totalRooms} 
                      onChange={(e) => setTotalRooms(e.target.value)} 
                      placeholder="e.g. 100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="capacity">Total Capacity</Label>
                    <Input 
                      id="capacity" 
                      type="number" 
                      min="0"
                      value={capacity} 
                      onChange={(e) => setCapacity(e.target.value)} 
                      placeholder="e.g. 300"
                    />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="bg-muted/30 border-t border-border pt-6 flex justify-between items-center">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.push("/login/superadmin")}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Cancel
              </Button>
              <Button
                type="submit"
                className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white shadow-md border-0 px-8"
                disabled={loading || !!success}
              >
                {loading ? (
                  <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Creating...</>
                ) : (
                  <><Building2 className="mr-2 h-4 w-4" /> Create Hostel</>
                )}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
