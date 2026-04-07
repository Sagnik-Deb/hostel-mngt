"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

interface Stats {
  totalStudents: number;
  totalRooms: number;
  occupiedBeds: number;
  totalCapacity: number;
  activeLeaves: number;
  pendingApplications: number;
  pendingLeaves: number;
  openComplaints: number;
  pendingAdmins: number;
}

export default function AdminDashboard() {
  const { token } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents || 0, icon: "👥", color: "stat-card-purple", href: "/admin/students" },
    { label: "Rooms", value: stats?.totalRooms || 0, icon: "🏢", color: "stat-card-cyan", href: "/admin/rooms" },
    { label: "Bed Occupancy", value: `${stats?.occupiedBeds || 0}/${stats?.totalCapacity || 0}`, icon: "🛏️", color: "stat-card-pink", href: "/admin/rooms" },
    { label: "Active Leaves", value: stats?.activeLeaves || 0, icon: "✈️", color: "stat-card-amber", href: "/admin/leaves" },
  ];

  const actionCards = [
    { label: "Pending Applications", count: stats?.pendingApplications || 0, icon: "📋", href: "/admin/applications", badge: "badge-warning" },
    { label: "Pending Leaves", count: stats?.pendingLeaves || 0, icon: "⏳", href: "/admin/leaves", badge: "badge-info" },
    { label: "Open Complaints", count: stats?.openComplaints || 0, icon: "📢", href: "/admin/complaints", badge: "badge-danger" },
    { label: "Pending Admins", count: stats?.pendingAdmins || 0, icon: "🛡️", href: "/admin/admin-mgmt", badge: "badge-purple" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Overview of your hostel</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className={`stat-card ${card.color} glass-hover`} style={{ textDecoration: 'none' }}>
            <div className="flex items-center justify-between mb-3">
              <span className="text-2xl">{card.icon}</span>
              <span className="text-2xl font-bold">{card.value}</span>
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{card.label}</p>
          </Link>
        ))}
      </div>

      {/* Action Queue Cards */}
      <div>
        <h2 className="text-lg font-bold mb-4">⚡ Action Required</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionCards.map((card, i) => (
            <Link key={i} href={card.href} className="glass p-5 glass-hover flex items-center gap-4" style={{ textDecoration: 'none' }}>
              <span className="text-3xl">{card.icon}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{card.label}</p>
                <span className={`badge ${card.badge} mt-1`}>{card.count} pending</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="glass p-6">
        <h2 className="text-lg font-bold mb-4">🚀 Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/admin/rooms" className="btn btn-secondary text-center">🏢 Room Grid</Link>
          <Link href="/admin/applications" className="btn btn-secondary text-center">📋 Applications</Link>
          <Link href="/admin/leaves" className="btn btn-secondary text-center">✈️ Leaves</Link>
          <Link href="/admin/checkout" className="btn btn-secondary text-center">🚪 Checkout</Link>
        </div>
      </div>
    </div>
  );
}
