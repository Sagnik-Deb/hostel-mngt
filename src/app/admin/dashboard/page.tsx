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
  const { token, user, logout } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [resignLoading, setResignLoading] = useState(false);
  const [showResignConfirm, setShowResignConfirm] = useState(false);

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/dashboard", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStats(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const handleSelfResign = async () => {
    setResignLoading(true);
    try {
      const res = await fetch("/api/admin/self-resign", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        alert("You have resigned as admin. You will be redirected to student portal.");
        logout();
      } else {
        alert(data.error || "Failed to resign");
      }
    } catch {
      alert("Something went wrong");
    } finally {
      setResignLoading(false);
      setShowResignConfirm(false);
    }
  };

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
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Overview of your hostel</p>
        </div>

        {/* Self-Resign button — only for regular ADMIN (not PRIMARY_ADMIN/SUPER_ADMIN) */}
        {user?.role === "ADMIN" && (
          <div>
            {!showResignConfirm ? (
              <button
                className="btn btn-sm"
                style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.3)' }}
                onClick={() => setShowResignConfirm(true)}
                id="resign-admin-btn"
              >
                🚪 Resign as Admin
              </button>
            ) : (
              <div className="glass p-4 text-right space-y-2" style={{ border: '1px solid rgba(239,68,68,0.3)', minWidth: '240px' }}>
                <p className="text-sm font-medium" style={{ color: 'var(--color-danger)' }}>Are you sure?</p>
                <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                  This will revoke your admin access and convert your account back to a student.
                </p>
                <div className="flex gap-2 justify-end">
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowResignConfirm(false)}>
                    Cancel
                  </button>
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={handleSelfResign}
                    disabled={resignLoading}
                    id="resign-admin-confirm"
                  >
                    {resignLoading ? "Processing..." : "Yes, Resign"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Superadmin notice */}
      {user?.role === "SUPER_ADMIN" && (
        <div
          className="p-4 rounded-xl text-sm flex items-center gap-3"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.08), rgba(124,58,237,0.08))',
            border: '1px solid rgba(124,58,237,0.2)',
          }}
        >
          <span className="text-2xl">👑</span>
          <div>
            <p className="font-semibold">You are logged in as Super Admin</p>
            <p style={{ color: 'var(--color-text-muted)' }}>
              Managing: <strong>{user?.hostelName || user?.hostel?.name}</strong>.
              {" "}To switch hostels, <a href="/login/superadmin" style={{ color: 'var(--color-primary)' }}>log in again</a>.
            </p>
          </div>
        </div>
      )}

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
