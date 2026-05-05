"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plane, Bell, Home, User, Users, Phone, Hash, ArrowRight, Sparkles, BookOpen } from "lucide-react";

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
  const [selectedHostel, setSelectedHostel] = useState<Hostel | null>(null);

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
              <Card
                key={hostel.id}
                className="cursor-pointer overflow-hidden hover:shadow-md hover:border-primary/40 transition-all border-border"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setSelectedHostel(hostel)}
              >
                <div className="aspect-video w-full flex items-center justify-center bg-blue-50/50 border-b border-border/50 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('/images/gallery/hostel-building.png')] bg-cover bg-center opacity-20"></div>
                  <Home className="w-12 h-12 text-blue-500 relative z-10 opacity-50" />
                </div>
                <CardContent className="p-5">
                  <h3 className="font-semibold text-lg mb-1 tracking-tight text-foreground">{hostel.name}</h3>
                  <p className="text-xs mb-4 text-muted-foreground line-clamp-2 leading-relaxed">{hostel.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                      <User className="w-3.5 h-3.5" /> {hostel.wardenName}
                    </span>
                    <Badge variant="secondary" className="font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 border-none">
                      {hostel.currentOccupancy}/{hostel.capacity}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Hostel Detail Modal */}
      <Dialog open={!!selectedHostel} onOpenChange={(open) => !open && setSelectedHostel(null)}>
        {selectedHostel && (
          <DialogContent className="sm:max-w-4xl md:max-w-4xl p-0 overflow-hidden border-none shadow-xl rounded-xl flex flex-col md:flex-row h-[90vh] md:h-[600px]">
            <div className="w-full md:w-2/5 h-48 md:h-full flex flex-col items-center justify-center bg-blue-50 border-b md:border-b-0 md:border-r border-blue-100 relative overflow-hidden shrink-0">
              <div className="absolute inset-0 bg-[url('/images/gallery/hostel-building.png')] bg-cover bg-center opacity-30"></div>
              <Home className="w-16 h-16 text-blue-500 relative z-10 opacity-50 mb-4" />
              <div className="relative z-10 text-center px-6 hidden md:block">
                <h3 className="text-xl font-bold text-blue-900 mb-2">{selectedHostel.name}</h3>
                <Badge variant="secondary" className="bg-white/80 text-blue-700 hover:bg-white border-none">
                  {selectedHostel.currentOccupancy}/{selectedHostel.capacity} Occupied
                </Badge>
              </div>
            </div>
            <div className="w-full md:w-3/5 flex flex-col h-full overflow-hidden">
              <div className="p-8 overflow-y-auto flex-1">
                <DialogHeader className="mb-2 md:hidden">
                  <DialogTitle className="text-2xl font-bold tracking-tight text-foreground">{selectedHostel.name}</DialogTitle>
                </DialogHeader>
                <div className="hidden md:block mb-2">
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">Overview</h2>
                </div>
                <p className="text-sm mb-6 text-muted-foreground leading-relaxed">{selectedHostel.description}</p>

                <div className="grid grid-cols-2 gap-3 mb-8">
                  <Card className="bg-slate-50 border-none shadow-none rounded-lg">
                    <CardContent className="p-4 flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <User className="w-4 h-4" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Admin</span>
                      </div>
                      <p className="font-semibold text-sm truncate w-full text-foreground">{selectedHostel.wardenName}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50 border-none shadow-none rounded-lg">
                    <CardContent className="p-4 flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <Phone className="w-4 h-4" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Contact</span>
                      </div>
                      <p className="font-semibold text-sm truncate w-full text-foreground">{selectedHostel.wardenPhone}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50 border-none shadow-none rounded-lg">
                    <CardContent className="p-4 flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <Hash className="w-4 h-4" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Rooms</span>
                      </div>
                      <p className="font-semibold text-sm text-foreground">{selectedHostel.totalRooms}</p>
                    </CardContent>
                  </Card>
                  <Card className="bg-slate-50 border-none shadow-none rounded-lg">
                    <CardContent className="p-4 flex flex-col items-start gap-1">
                      <div className="flex items-center gap-1.5 text-primary mb-1">
                        <Users className="w-4 h-4" />
                        <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">Occupancy</span>
                      </div>
                      <p className="font-semibold text-sm text-foreground">{selectedHostel.currentOccupancy} / {selectedHostel.capacity}</p>
                    </CardContent>
                  </Card>
                </div>

                <div className="mb-2">
                  <h4 className="font-semibold text-sm mb-3 flex items-center gap-2 text-foreground">
                    <BookOpen className="w-4 h-4 text-primary" /> Hostel Rules
                  </h4>
                  <ul className="space-y-2 bg-slate-50 p-4 rounded-lg">
                    {selectedHostel.rules.map((rule, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                        <span className="text-primary mt-0.5">•</span>
                        <span className="leading-relaxed">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="flex justify-end gap-3 p-6 border-t border-border bg-background mt-auto shrink-0">
                <Button variant="ghost" onClick={() => setSelectedHostel(null)}>Cancel</Button>
                <Link href="/signup">
                  <Button className="gap-2 px-6">Apply Now <ArrowRight className="w-4 h-4" /></Button>
                </Link>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

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