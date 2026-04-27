"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

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

const HOSTEL_GRADIENTS = [
  "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
  "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
  "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
  "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
  "linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)",
  "linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)",
  "linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)",
  "linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%)",
  "linear-gradient(135deg, #d4fc79 0%, #96e6a1 100%)",
  "linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)",
  "linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)",
  "linear-gradient(135deg, #f5576c 0%, #ff6a88 100%)",
];

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
    <div className="min-h-screen">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 50%, rgba(124,58,237,0.05) 100%)' }}></div>
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl" style={{ background: 'var(--color-primary)' }}></div>
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full opacity-10 blur-3xl" style={{ background: 'var(--color-accent)' }}></div>

        <nav className="relative z-10 flex items-center justify-between max-w-7xl mx-auto px-6 py-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold" style={{ background: 'var(--gradient-primary)' }}>H</div>
            <span className="text-xl font-bold">HostelHub</span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="btn btn-secondary">Login</Link>
            <Link href="/signup" className="btn btn-primary">Register</Link>
          </div>
        </nav>

        <div className="relative z-10 max-w-7xl mx-auto px-6 py-24 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-medium" style={{ background: 'var(--color-primary-light)', color: 'var(--color-primary)' }}>
            ✨ Smart Hostel Management
          </div>
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
            Welcome to{" "}
            <span className="bg-clip-text text-transparent" style={{ backgroundImage: 'var(--gradient-primary)' }}>
              HostelHub
            </span>
          </h1>
          <p className="text-lg md:text-xl max-w-2xl mx-auto mb-10" style={{ color: 'var(--color-text-muted)' }}>
            Industry-grade hostel management across 12 premier hostels. Smart room allocation, leave management, instant notifications, and seamless admin workflows.
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <Link href="/signup" className="btn btn-primary btn-lg">
              🚀 Get Started
            </Link>
            <a href="#hostels" className="btn btn-secondary btn-lg">
              🏠 Explore Hostels
            </a>
          </div>
        </div>
      </header>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { icon: "🏢", title: "12 Hostel Silos", desc: "Each hostel operates independently with dedicated admin, rooms, and student management." },
            { icon: "✈️", title: "Smart Leave Engine", desc: "Apply for leave, get automated 24h return reminders, request extensions — all digitally." },
            { icon: "🔔", title: "Instant Notifications", desc: "Real-time in-app and email notifications for every system action and update." },
          ].map((f, i) => (
            <div key={i} className="glass p-8 text-center glass-hover" style={{ transition: 'all 0.3s ease' }}>
              <div className="text-5xl mb-4">{f.icon}</div>
              <h3 className="text-lg font-bold mb-2">{f.title}</h3>
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Hostels Grid */}
      <section id="hostels" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Our 12 Hostels</h2>
          <p style={{ color: 'var(--color-text-muted)' }}>Browse details, wardens, and rules for each hostel</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {hostels.map((hostel, i) => (
              <div
                key={hostel.id}
                className="glass glass-hover cursor-pointer overflow-hidden animate-fade-in"
                style={{ animationDelay: `${i * 50}ms` }}
                onClick={() => setSelectedHostel(hostel)}
              >
                <div className="h-32 flex items-center justify-center" style={{ background: HOSTEL_GRADIENTS[i % 12] }}>
                  <span className="text-5xl">🏠</span>
                </div>
                <div className="p-5">
                  <h3 className="font-bold text-base mb-1">{hostel.name}</h3>
                  <p className="text-xs mb-3" style={{ color: 'var(--color-text-muted)' }}>{hostel.description}</p>
                  <div className="flex items-center justify-between text-xs">
                    <span style={{ color: 'var(--color-text-muted)' }}>
                      👨‍💼 {hostel.wardenName}
                    </span>
                    <span className="badge badge-info">
                      {hostel.currentOccupancy}/{hostel.capacity}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Hostel Detail Modal */}
      {selectedHostel && (
        <div className="modal-overlay" onClick={() => setSelectedHostel(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="h-40 flex items-center justify-center" style={{ background: HOSTEL_GRADIENTS[hostels.indexOf(selectedHostel) % 12], borderRadius: 'var(--radius-lg) var(--radius-lg) 0 0' }}>
              <h2 className="text-2xl font-bold text-white">{selectedHostel.name}</h2>
            </div>
            <div className="p-6">
              <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>{selectedHostel.description}</p>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="glass p-3">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Admin(s)</p>
                  <p className="font-semibold text-sm">{selectedHostel.wardenName}</p>
                </div>
                <div className="glass p-3">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Contact</p>
                  <p className="font-semibold text-sm">{selectedHostel.wardenPhone}</p>
                </div>
                <div className="glass p-3">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Total Rooms</p>
                  <p className="font-semibold text-sm">{selectedHostel.totalRooms}</p>
                </div>
                <div className="glass p-3">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Occupancy</p>
                  <p className="font-semibold text-sm">{selectedHostel.currentOccupancy} / {selectedHostel.capacity}</p>
                </div>
              </div>

              <div className="mb-4">
                <h4 className="font-semibold text-sm mb-2">📋 Hostel Rules</h4>
                <ul className="space-y-2">
                  {selectedHostel.rules.map((rule, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm" style={{ color: 'var(--color-text-muted)' }}>
                      <span className="mt-0.5">•</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="flex gap-3">
                <Link href="/signup" className="btn btn-primary flex-1">Apply Now</Link>
                <button onClick={() => setSelectedHostel(null)} className="btn btn-secondary">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="border-t py-12 px-6" style={{ borderColor: 'var(--color-border)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            © 2024 HostelHub — Smart Hostel Management System. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
