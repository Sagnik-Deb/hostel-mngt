"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Building2,
  Home,
  Users,
  Hash,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Award,
  Wifi,
  BookOpen,
  Info,
  UserCog,
  CalendarDays,
  Sparkles,
} from "lucide-react";

interface HostelImage {
  id: string;
  url: string;
  caption?: string;
}
interface AdminStaff {
  id: string;
  name: string;
  role: string;
  photoUrl?: string;
}
interface Facility {
  id: string;
  name: string;
  description?: string;
  icon?: string;
}
interface Achievement {
  id: string;
  title: string;
  description?: string;
  photoUrl?: string;
  date: string;
}
interface HostelData {
  id: string;
  name: string;
  code: string;
  description?: string;
  aboutUs?: string;
  address?: string;
  rules: string[];
  totalRooms: number;
  capacity: number;
  currentOccupancy: number;
  galleryImages: HostelImage[];
  administrations: AdminStaff[];
  facilities: Facility[];
  achievements: Achievement[];
}

type Tab = "overview" | "administration" | "facilities" | "achievements";

export default function HostelOverviewPage() {
  const params = useParams();
  const code = params?.code as string;
  const [hostel, setHostel] = useState<HostelData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [galleryIndex, setGalleryIndex] = useState(0);

  useEffect(() => {
    if (!code) return;
    fetch(`/api/hostels/${code}`)
      .then((r) => r.json())
      .then((d) => { if (d.success) setHostel(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="w-12 h-12 border-4 border-t-transparent border-primary rounded-full animate-spin" />
      </div>
    );
  }

  if (!hostel) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-background">
        <Building2 className="w-16 h-16 text-muted-foreground opacity-30" />
        <h1 className="text-2xl font-bold text-foreground">Hostel not found</h1>
        <Link href="/"><Button variant="outline">← Back to Home</Button></Link>
      </div>
    );
  }

  const hasGallery = hostel.galleryImages.length > 0;
  const currentImage = hasGallery ? hostel.galleryImages[galleryIndex] : null;

  const tabs: { key: Tab; label: string; icon: React.ReactNode }[] = [
    { key: "overview", label: "Overview", icon: <Info className="w-4 h-4" /> },
    { key: "administration", label: "Administration", icon: <UserCog className="w-4 h-4" /> },
    { key: "facilities", label: "Facilities", icon: <Wifi className="w-4 h-4" /> },
    { key: "achievements", label: "Achievements", icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeft className="w-4 h-4" />
            <span className="text-sm font-medium">All Hostels</span>
          </Link>
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="logo" className="w-8 h-8" />
            <span className="font-bold text-foreground">Assam University</span>
          </div>
          <Link href="/signup"><Button size="sm">Apply Now <ArrowRight className="w-3 h-3 ml-1" /></Button></Link>
        </div>
      </nav>

      {/* Hero Gallery */}
      <section className="relative h-72 md:h-96 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 overflow-hidden">
        {currentImage ? (
          <Image
            src={currentImage.url}
            alt={currentImage.caption || hostel.name}
            fill
            className="object-cover opacity-70"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center opacity-10">
            <Home className="w-48 h-48 text-white" />
          </div>
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

        {/* Gallery navigation */}
        {hasGallery && hostel.galleryImages.length > 1 && (
          <>
            <button
              onClick={() => setGalleryIndex((i) => (i - 1 + hostel.galleryImages.length) % hostel.galleryImages.length)}
              className="absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={() => setGalleryIndex((i) => (i + 1) % hostel.galleryImages.length)}
              className="absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm flex items-center justify-center text-white transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            {/* Dots */}
            <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
              {hostel.galleryImages.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setGalleryIndex(i)}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${i === galleryIndex ? "bg-white w-4" : "bg-white/50"}`}
                />
              ))}
            </div>
          </>
        )}

        {/* Hostel name overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 z-10">
          <div className="max-w-7xl mx-auto">
            <Badge className="mb-3 bg-white/20 text-white border-white/30 backdrop-blur-sm hover:bg-white/30">
              {hostel.code}
            </Badge>
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight">{hostel.name}</h1>
            {hostel.address && (
              <p className="text-white/70 mt-1 text-sm">{hostel.address}</p>
            )}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <div className="bg-primary text-white">
        <div className="max-w-7xl mx-auto px-6 py-4 grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-2xl font-bold">{hostel.totalRooms}</p>
            <p className="text-xs text-primary-foreground/70 flex items-center justify-center gap-1"><Hash className="w-3 h-3" /> Rooms</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{hostel.capacity}</p>
            <p className="text-xs text-primary-foreground/70 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Capacity</p>
          </div>
          <div>
            <p className="text-2xl font-bold">{hostel.currentOccupancy}</p>
            <p className="text-xs text-primary-foreground/70 flex items-center justify-center gap-1"><Users className="w-3 h-3" /> Residents</p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="sticky top-[65px] z-40 bg-background border-b border-border shadow-sm">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex gap-1 overflow-x-auto scrollbar-hide py-2">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${activeTab === tab.key
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                  }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">

        {/* ─── OVERVIEW ─── */}
        {activeTab === "overview" && (
          <div className="space-y-10 animate-in fade-in duration-300">
            {hostel.description && (
              <section>
                <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" /> About the Hostel
                </h2>
                <p className="text-muted-foreground leading-relaxed text-base">{hostel.description}</p>
              </section>
            )}
            {hostel.aboutUs && (
              <section className="bg-blue-50/50 rounded-2xl p-8 border border-blue-100">
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <Info className="w-5 h-5 text-blue-600" /> Who We Are
                </h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-line">{hostel.aboutUs}</p>
              </section>
            )}
            {hostel.rules.length > 0 && (
              <section>
                <h2 className="text-xl font-bold text-foreground mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" /> Hostel Rules
                </h2>
                <ul className="space-y-2">
                  {hostel.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-3 text-muted-foreground">
                      <span className="mt-0.5 w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-bold shrink-0">
                        {i + 1}
                      </span>
                      <span className="leading-relaxed">{rule}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>
        )}

        {/* ─── ADMINISTRATION ─── */}
        {activeTab === "administration" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <UserCog className="w-6 h-6 text-primary" /> Administration
            </h2>
            {hostel.administrations.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <UserCog className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No administration staff listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {hostel.administrations.map((staff) => (
                  <Card key={staff.id} className="overflow-hidden hover:shadow-md transition-all border-border group">
                    <div className="aspect-square bg-gradient-to-br from-blue-50 to-blue-100 relative overflow-hidden">
                      {staff.photoUrl ? (
                        <Image
                          src={staff.photoUrl}
                          alt={staff.name}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-20 h-20 rounded-full bg-blue-200 flex items-center justify-center">
                            <Users className="w-10 h-10 text-blue-400" />
                          </div>
                        </div>
                      )}
                    </div>
                    <CardContent className="p-4 text-center">
                      <h3 className="font-semibold text-foreground truncate">{staff.name}</h3>
                      <Badge variant="secondary" className="mt-1.5 text-xs bg-blue-50 text-blue-700 border-none hover:bg-blue-100">
                        {staff.role}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── FACILITIES ─── */}
        {activeTab === "facilities" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Wifi className="w-6 h-6 text-primary" /> Facilities
            </h2>
            {hostel.facilities.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Wifi className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No facilities listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {hostel.facilities.map((facility) => (
                  <Card key={facility.id} className="hover:shadow-md hover:border-primary/40 transition-all border-border">
                    <CardContent className="p-6 flex gap-4 items-start">
                      <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
                        <Wifi className="w-6 h-6 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground mb-1">{facility.name}</h3>
                        {facility.description && (
                          <p className="text-sm text-muted-foreground leading-relaxed">{facility.description}</p>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ─── ACHIEVEMENTS ─── */}
        {activeTab === "achievements" && (
          <div className="animate-in fade-in duration-300">
            <h2 className="text-2xl font-bold text-foreground mb-8 flex items-center gap-2">
              <Award className="w-6 h-6 text-primary" /> Achievements
            </h2>
            {hostel.achievements.length === 0 ? (
              <div className="text-center py-20 text-muted-foreground">
                <Award className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p>No achievements listed yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {hostel.achievements.map((ach) => (
                  <Card key={ach.id} className="overflow-hidden hover:shadow-md transition-all border-border group">
                    {ach.photoUrl && (
                      <div className="aspect-video relative overflow-hidden bg-blue-50">
                        <Image
                          src={ach.photoUrl}
                          alt={ach.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <CardContent className="p-5">
                      <div className="flex items-center gap-2 mb-3">
                        <CalendarDays className="w-3.5 h-3.5 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">
                          {new Date(ach.date).toLocaleDateString("en-IN", { year: "numeric", month: "long", day: "numeric" })}
                        </span>
                      </div>
                      <h3 className="font-semibold text-foreground mb-2 leading-snug">{ach.title}</h3>
                      {ach.description && (
                        <p className="text-sm text-muted-foreground leading-relaxed">{ach.description}</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Footer CTA */}
      <section className="border-t border-border bg-gradient-to-br from-blue-50 to-white py-16 px-6 mt-10">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-foreground mb-4">Interested in {hostel.name}?</h2>
          <p className="text-muted-foreground mb-8">Apply now and become part of our vibrant hostel community.</p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/signup">
              <Button size="lg" className="gap-2 px-8">Apply Now <ArrowRight className="w-4 h-4" /></Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="lg">Explore All Hostels</Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
