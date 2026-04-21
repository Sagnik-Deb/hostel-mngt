"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, token, logout } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!token) return;
    // Fetch active leave status
    fetch("/api/leaves", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        if (d.success && d.data.length > 0) {
          const active = d.data.find((l: { status: string }) =>
            ["PENDING", "APPROVED", "ACTIVE", "EXTENSION_REQUESTED", "RETURN_REQUESTED"].includes(l.status)
          );
          if (active) setLeaveStatus(active.status);
        }
      })
      .catch(console.error);

    // Fetch notification count
    fetch("/api/notifications?limit=1", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setUnreadCount(d.data.unreadCount); })
      .catch(console.error);
  }, [token]);

  const handleSelfCheckout = async () => {
    const confirmed = confirm(
      "⚠ PERMANENT CHECKOUT WARNING ⚠\n\n" +
      "This action is IRREVERSIBLE. Your account will be deleted and you will be archived as a past student. " +
      "You will NOT be able to log in again.\n\n" +
      "Are you absolutely sure you want to proceed?"
    );

    if (!confirmed) return;

    setIsCheckingOut(true);
    try {
      const resp = await fetch("/api/student/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        }
      });

      const data = await resp.json();
      if (data.success) {
        alert(data.message);
        logout();
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("An error occurred during checkout");
    } finally {
      setIsCheckingOut(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="glass p-8" style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.15) 0%, rgba(6,182,212,0.1) 100%)' }}>
        <h1 className="text-3xl font-bold mb-2">Welcome, {user?.name} 👋</h1>
        <p style={{ color: 'var(--color-text-muted)' }}>
          {user?.hostel?.name} • {user?.status === "ON_LEAVE" ? "Currently on leave" : "In Hostel"}
        </p>
      </div>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/student/my-room" className="stat-card stat-card-purple glass-hover" style={{ textDecoration: 'none' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🛏️</span>
            <span className="text-lg font-bold">{user?.room ? `#${user.room.number}` : "—"}</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>My Room</p>
        </Link>

        <Link href="/student/leave" className="stat-card stat-card-cyan glass-hover" style={{ textDecoration: 'none' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">✈️</span>
            <span className={`badge ${leaveStatus ? "badge-info" : "badge-success"}`}>
              {leaveStatus ? leaveStatus.replace(/_/g, " ") : "None Active"}
            </span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Leave Status</p>
        </Link>

        <Link href="/student/mess-menu" className="stat-card stat-card-pink glass-hover" style={{ textDecoration: 'none' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🍽️</span>
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Mess Menu</p>
        </Link>

        <Link href="/student/notifications" className="stat-card stat-card-amber glass-hover" style={{ textDecoration: 'none' }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl">🔔</span>
            {unreadCount > 0 && <span className="badge badge-danger">{unreadCount} new</span>}
          </div>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Notifications</p>
        </Link>
      </div>

      {/* Quick Actions */}
      <div className="glass p-6">
        <h2 className="font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <Link href="/student/leave" className="btn btn-secondary text-center">✈️ Apply Leave</Link>
          <Link href="/student/complaints" className="btn btn-secondary text-center">📢 Raise Complaint</Link>
          <Link href="/student/mess-menu" className="btn btn-secondary text-center">🍽️ Rate Meal</Link>
          <button 
            onClick={handleSelfCheckout}
            disabled={isCheckingOut}
            className="btn btn-secondary text-center"
            style={{ color: 'var(--color-danger)', border: '1px solid rgba(239,68,68,0.2)' }}
          >
            {isCheckingOut ? "Checking out..." : "🏠 Permanent Checkout"}
          </button>
        </div>
      </div>
    </div>
  );
}
