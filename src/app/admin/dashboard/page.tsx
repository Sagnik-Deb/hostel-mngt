"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Users, Building2, BedDouble, Plane, FileText, Clock, MessageSquareWarning, Shield, DoorOpen, Crown, LayoutDashboard, Settings } from "lucide-react";

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
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const statCards = [
    { label: "Total Students", value: stats?.totalStudents || 0, icon: <Users className="w-5 h-5 text-indigo-600" />, bg: "bg-indigo-50", href: "/admin/students" },
    { label: "Rooms", value: stats?.totalRooms || 0, icon: <Building2 className="w-5 h-5 text-cyan-600" />, bg: "bg-cyan-50", href: "/admin/rooms" },
    { label: "Bed Occupancy", value: `${stats?.occupiedBeds || 0}/${stats?.totalCapacity || 0}`, icon: <BedDouble className="w-5 h-5 text-pink-600" />, bg: "bg-pink-50", href: "/admin/rooms" },
    { label: "Active Leaves", value: stats?.activeLeaves || 0, icon: <Plane className="w-5 h-5 text-amber-600" />, bg: "bg-amber-50", href: "/admin/leaves" },
  ];

  const actionCards = [
    { label: "Pending Applications", count: stats?.pendingApplications || 0, icon: <FileText className="w-6 h-6 text-amber-500" />, href: "/admin/applications", variant: "warning" as const },
    { label: "Pending Leaves", count: stats?.pendingLeaves || 0, icon: <Clock className="w-6 h-6 text-cyan-500" />, href: "/admin/leaves", variant: "default" as const },
    { label: "Open Complaints", count: stats?.openComplaints || 0, icon: <MessageSquareWarning className="w-6 h-6 text-red-500" />, href: "/admin/complaints", variant: "destructive" as const },
    { label: "Pending Admins", count: stats?.pendingAdmins || 0, icon: <Shield className="w-6 h-6 text-indigo-500" />, href: "/admin/admin-mgmt", variant: "secondary" as const },
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
            <LayoutDashboard className="w-6 h-6 text-primary" /> Dashboard
          </h1>
          <p className="text-sm text-muted-foreground">Overview of your hostel</p>
        </div>

        {/* Self-Resign button — only for regular ADMIN */}
        {user?.role === "ADMIN" && (
          <div className="shrink-0">
            {!showResignConfirm ? (
              <Button
                variant="outline"
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-2"
                onClick={() => setShowResignConfirm(true)}
              >
                <DoorOpen className="w-4 h-4" /> Resign as Admin
              </Button>
            ) : (
              <Card className="border-red-200 shadow-sm max-w-sm">
                <CardContent className="p-4 space-y-3">
                  <p className="text-sm font-semibold text-red-600 flex items-center gap-2">
                    <MessageSquareWarning className="w-4 h-4" /> Are you sure?
                  </p>
                  <p className="text-xs text-muted-foreground">
                    This will revoke your admin access and convert your account back to a student.
                  </p>
                  <div className="flex gap-2 justify-end pt-2">
                    <Button variant="outline" size="sm" onClick={() => setShowResignConfirm(false)}>
                      Cancel
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleSelfResign}
                      disabled={resignLoading}
                    >
                      {resignLoading ? "Processing..." : "Yes, Resign"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>

      {/* Superadmin notice */}
      {user?.role === "SUPER_ADMIN" && (
        <Card className="bg-gradient-to-r from-red-50 to-indigo-50 border-indigo-100 shadow-sm">
          <CardContent className="p-4 flex flex-col sm:flex-row items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center shrink-0">
              <Crown className="w-6 h-6 text-indigo-600" />
            </div>
            <div className="text-center sm:text-left">
              <p className="font-semibold text-indigo-900">You are logged in as Super Admin</p>
              <p className="text-sm text-indigo-700/80 mt-1">
                Managing: <strong className="text-indigo-900">{user?.hostelName || user?.hostel?.name}</strong>.
                {" "}To switch hostels, <a href="/login/superadmin" className="font-medium underline underline-offset-2 hover:text-indigo-900">log in again</a>.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, i) => (
          <Link key={i} href={card.href} className="block outline-none">
            <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full border-border">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${card.bg}`}>
                    {card.icon}
                  </div>
                  <span className="text-2xl font-bold tracking-tight">{card.value}</span>
                </div>
                <p className="text-sm font-medium text-muted-foreground">{card.label}</p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Action Queue Cards */}
      <div>
        <h2 className="text-lg font-bold mb-4 tracking-tight">Action Required</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {actionCards.map((card, i) => (
            <Link key={i} href={card.href} className="block outline-none">
              <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full border-border bg-muted/20">
                <CardContent className="p-5 flex items-center gap-4">
                  <div className="shrink-0">
                    {card.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate text-foreground">{card.label}</p>
                    <Badge 
                      variant={card.variant === "warning" ? "secondary" : card.variant} 
                      className={`mt-1.5 ${card.variant === "warning" ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : ""}`}
                    >
                      {card.count} pending
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/admin/rooms">
              <Button variant="outline" className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground">
                <Building2 className="w-4 h-4" /> Room Grid
              </Button>
            </Link>
            <Link href="/admin/applications">
              <Button variant="outline" className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground">
                <FileText className="w-4 h-4" /> Applications
              </Button>
            </Link>
            <Link href="/admin/leaves">
              <Button variant="outline" className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground">
                <Plane className="w-4 h-4" /> Leaves
              </Button>
            </Link>
            <Link href="/admin/checkout">
              <Button variant="outline" className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground">
                <DoorOpen className="w-4 h-4" /> Checkout
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
