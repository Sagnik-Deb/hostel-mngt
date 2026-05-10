"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Plane, Bell, Home, User, Users, ArrowRight, Sparkles } from "lucide-react";

interface Hostel {
  id: string;
  name: string;
  code: string;
  description: string;
  wardenName: string;
  wardenEmail: string;
  wardenPhone: string;
  address: string;
  rules: string[];
  totalRooms: number;
  capacity: number;
  currentOccupancy: number;
}

export default function HomePage() {
  const [hostels, setHostels] = useState<Hostel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/hostels")
      .then((res) => res.json())
      .then((data) => {
        if (data.success) setHostels(data.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-50/30 to-primary/[0.02]"></div>
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl bg-primary"></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl bg-blue-300"></div>

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ">
              {/* <Building2 className="w-5 h-5" /> */}
              <img src="/logo.png" alt="" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">AUSHostel</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="outline">Login</Button></Link>
            <Link href="/signup"><Button>Register</Button></Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium bg-blue-50 text-blue-600 border border-blue-100">
            <Sparkles className="w-4 h-4" /> Smart Hostel Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight text-foreground">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-blue-400">
              AUSHostel
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 text-muted-foreground">
            Industry-grade hostel management across 12 premier hostels. Smart room allocation, leave management, instant notifications, and seamless admin workflows.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-md px-8 shadow-sm">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#hostels">
              <Button variant="secondary" size="lg" className="gap-2 text-md px-8 shadow-sm">
                <Home className="w-4 h-4" /> Explore Hostels
              </Button>
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-border bg-slate-50/50">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: <Building2 className="w-10 h-10 mb-5 text-primary mx-auto" />, title: "12 Hostel Silos", desc: "Each hostel operates independently with dedicated admin, rooms, and student management." },
            { icon: <Plane className="w-10 h-10 mb-5 text-primary mx-auto" />, title: "Smart Leave Engine", desc: "Apply for leave, get automated 24h return reminders, request extensions — all digitally." },
            { icon: <Bell className="w-10 h-10 mb-5 text-primary mx-auto" />, title: "Instant Notifications", desc: "Real-time in-app and email notifications for every system action and update." },
          ].map((f, i) => (
            <Card key={i} className="text-center hover:border-primary/50 transition-colors shadow-sm bg-card border-border">
              <CardContent className="pt-10 pb-10 px-6">
                {f.icon}
                <h3 className="text-xl font-semibold mb-3 tracking-tight text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Hostels Grid */}
      <section id="hostels" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Our 12 Hostels</h2>
          <p className="text-muted-foreground">Browse details, wardens, and rules for each hostel</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hostels.map((hostel, i) => (
              <Link
                key={hostel.id}
                href={`/hostels/${hostel.code.toLowerCase()}`}
                className="block group"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Card className="overflow-hidden h-full hover:shadow-md hover:border-primary/40 transition-all border-border">
                  <div className="aspect-video w-full flex items-center justify-center bg-blue-50/50 border-b border-border/50 relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('/images/gallery/hostel-building.png')] bg-cover bg-center opacity-20 group-hover:opacity-30 transition-opacity"></div>
                    <Home className="w-12 h-12 text-blue-500 relative z-10 opacity-50" />
                  </div>
                  <CardContent className="p-5">
                    <h3 className="font-semibold text-lg mb-1 tracking-tight text-foreground">{hostel.name}</h3>
                    <p className="text-xs mb-4 text-muted-foreground line-clamp-2 leading-relaxed">{hostel.description}</p>
                    <div className="flex items-center justify-between text-xs">
                      <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                        <Users className="w-3.5 h-3.5" /> {hostel.currentOccupancy}/{hostel.capacity}
                      </span>
                      <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-none gap-1">
                        View <ArrowRight className="w-3 h-3" />
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t py-12 px-6 border-border mt-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-6 h-6 rounded flex items-center justify-center text-white bg-primary">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <span className="font-semibold tracking-tight text-foreground">AUSHostel</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 AUSHostel. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}