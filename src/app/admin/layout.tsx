"use client";

import { NotificationProvider } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/layout/DashboardShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: "📊" },
  { href: "/admin/rooms", label: "Room Grid", icon: "🏢" },
  { href: "/admin/applications", label: "Applications", icon: "📋" },
  { href: "/admin/students", label: "Students", icon: "👥" },
  { href: "/admin/leaves", label: "Leave Requests", icon: "✈️" },
  { href: "/admin/complaints", label: "Complaints", icon: "📢" },
  { href: "/admin/mess-menu", label: "Mess Menu", icon: "🍽️" },
  { href: "/admin/admin-mgmt", label: "Admin Mgmt", icon: "🛡️" },
  { href: "/admin/checkout", label: "Checkout", icon: "🚪" },
  { href: "/admin/notifications", label: "Notifications", icon: "🔔" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN" && user.role !== "SUPER_ADMIN"))) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || (user.role !== "ADMIN" && user.role !== "PRIMARY_ADMIN" && user.role !== "SUPER_ADMIN")) {
    return null;
  }

  return (
    <NotificationProvider>
      <DashboardShell links={adminLinks} title="Admin Panel">
        {children}
      </DashboardShell>
    </NotificationProvider>
  );
}
