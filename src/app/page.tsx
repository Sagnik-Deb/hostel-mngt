//@ts-nocheck

"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Bell, Home, User, Users, ArrowRight, Sparkles } from "lucide-react";

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

  console.log(hostels)

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
        {/* Background image at 80% opacity */}
        <div
          className="absolute inset-0 opacity-80"
          style={{
            backgroundImage: "url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        {/* Dark overlay for readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60"></div>

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold ">
              {/* <Building2 className="w-5 h-5" /> */}
              <img src="/logo.png" alt="" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">Assam University</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login"><Button variant="outline" className="bg-white/10 border-white/30 text-white hover:bg-white/20">Login</Button></Link>
            <Link href="/signup"><Button className="bg-blue-600 hover:bg-blue-700 text-white">Register</Button></Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium bg-white/10 text-white border border-white/20 backdrop-blur-sm">
            <Sparkles className="w-4 h-4" /> Smart Hostel Management
          </div>
          <h1 className="font-bold leading-tight tracking-tight text-white drop-shadow-lg mb-2">
            <span className="block text-5xl md:text-7xl bg-clip-text text-transparent bg-gradient-to-r from-blue-300 to-blue-400">
              Assam University
            </span>
            <span className="block text-4xl md:text-6xl text-white mt-1">
              Hostels
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10 mt-6 text-white/80">
            Streamlined allocation for university hostels.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup">
              <Button size="lg" className="gap-2 text-md px-8 shadow-lg bg-blue-600 hover:bg-blue-700 text-white">
                Get Started <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <a href="#hostels">
              <Button variant="secondary" size="lg" className="gap-2 text-md px-8 shadow-lg bg-white/10 hover:bg-white/20 text-white border border-white/30 backdrop-blur-sm">
                <Home className="w-4 h-4" /> Explore Hostels
              </Button>
            </a>
          </div>
        </div>
      </header>


      {/* Registration Process */}
      <section className="max-w-7xl mx-auto px-6 py-20 border-b border-border bg-slate-50/50">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-3 tracking-tight text-foreground">How to Register</h2>
          <p className="text-muted-foreground max-w-xl mx-auto">Follow these simple steps to apply for hostel accommodation at Assam University</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8">
          {[
            {
              step: "01",
              icon: <User className="w-8 h-8 text-primary" />,
              title: "Create Account",
              desc: "Click 'Get Started' and fill in your personal details — name, email, college ID, and contact information.",
            },
            {
              step: "02",
              icon: <Building2 className="w-8 h-8 text-primary" />,
              title: "Select Hostel",
              desc: "Choose your preferred hostel from the list of available university hostels and your room type.",
            },
            {
              step: "03",
              icon: <Users className="w-8 h-8 text-primary" />,
              title: "Upload Documents",
              desc: "Upload your Aadhar card, hostel allotment certificate, and other required identity documents.",
            },
            {
              step: "04",
              icon: <Bell className="w-8 h-8 text-primary" />,
              title: "Await Approval",
              desc: "The hostel admin will review your application and notify you via email once your registration is approved.",
            },
          ].map((item, i) => (
            <Card key={i} className="relative text-center h-full hover:border-primary/50 hover:shadow-md transition-all shadow-sm bg-card border-border overflow-visible mt-4">
              <CardContent className="pt-10 pb-8 px-8 flex flex-col items-center min-h-[260px]">
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center shadow-md">
                  {item.step}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5 mt-2">
                  {item.icon}
                </div>
                <h3 className="text-lg font-semibold mb-3 tracking-tight text-foreground">{item.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-10">
          <Link href="/signup">
            <Button size="lg" className="gap-2 px-10 shadow-sm">
              Start Your Registration <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </section>


      {/* Hostels Grid */}
      {/* Hostels Grid */}
      <section id="hostels" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight text-foreground">Our Hostels</h2>
          <p className="text-muted-foreground">Browse details, wardens, and rules for each hostel</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
          </div>
        ) : (
          <div className="space-y-16">
            {/* Boys Hostels Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 border-b pb-3 border-blue-100">
                <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-600 font-bold">B</div>
                <h3 className="text-2xl font-bold text-blue-900 tracking-tight">Boys Hostels</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hostels
                  .filter((hostel) => hostel.name.startsWith("BOYS-HOSTEL"))
                  .map((hostel, i) => (
                    <Link
                      key={hostel.id}
                      href={`/hostels/${hostel.code.toLowerCase()}`}
                      className="block group"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <Card className="overflow-hidden h-full hover:shadow-md hover:border-blue-400/40 transition-all border-border">
                        <div className="aspect-video w-full relative overflow-hidden border-b border-border/50">
                          <img
                            src={`/images/hostels/${hostel.code}.jpeg`}
                            alt={hostel.name}
                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-blue-50/50 items-center justify-center hidden"
                          >
                            <Home className="w-12 h-12 text-blue-500 opacity-50" />
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg mb-1 tracking-tight text-foreground">{hostel.name}</h3>
                          <p className="text-xs mb-4 text-muted-foreground line-clamp-2 leading-relaxed">{hostel.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                              <Users className="w-3.5 h-3.5" /> {hostel.currentOccupancy}/{hostel.bedOccupancy}
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
            </div>

            {/* Girls Hostels Section */}
            <div>
              <div className="flex items-center gap-3 mb-6 border-b pb-3 border-rose-100">
                <div className="w-8 h-8 rounded-lg bg-rose-100 flex items-center justify-center text-rose-600 font-bold">G</div>
                <h3 className="text-2xl font-bold text-rose-900 tracking-tight">Girls Hostels</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {hostels
                  .filter((hostel) => !hostel.name.startsWith("BOYS-HOSTEL"))
                  .map((hostel, i) => (
                    <Link
                      key={hostel.id}
                      href={`/hostels/${hostel.code.toLowerCase()}`}
                      className="block group"
                      style={{ animationDelay: `${i * 50}ms` }}
                    >
                      <Card className="overflow-hidden h-full hover:shadow-md hover:border-rose-400/40 transition-all border-border">
                        <div className="aspect-video w-full relative overflow-hidden border-b border-border/50">
                          <img
                            src={`/images/hostels/${hostel.code}.jpeg`}
                            alt={hostel.name}
                            className="w-full h-full object-cover opacity-85 group-hover:opacity-100 transition-opacity duration-300"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                              e.currentTarget.nextElementSibling.style.display = 'flex';
                            }}
                          />
                          <div
                            className="absolute inset-0 bg-blue-50/50 items-center justify-center hidden"
                          >
                            <Home className="w-12 h-12 text-blue-500 opacity-50" />
                          </div>
                        </div>
                        <CardContent className="p-5">
                          <h3 className="font-semibold text-lg mb-1 tracking-tight text-foreground">{hostel.name}</h3>
                          <p className="text-xs mb-4 text-muted-foreground line-clamp-2 leading-relaxed">{hostel.description}</p>
                          <div className="flex items-center justify-between text-xs">
                            <span className="flex items-center gap-1.5 text-muted-foreground font-medium">
                              <Users className="w-3.5 h-3.5" /> {hostel.currentOccupancy}/{hostel.bedOccupancy}
                            </span>
                            <Badge variant="secondary" className="font-medium bg-rose-50 text-rose-700 hover:bg-rose-100 border-none gap-1">
                              View <ArrowRight className="w-3 h-3" />
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
              </div>
            </div>
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
            <span className="font-semibold tracking-tight text-foreground">Assam University</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2024 Assam University. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}