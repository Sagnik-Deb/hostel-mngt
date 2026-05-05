"use client";

import { NotificationProvider } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/layout/DashboardShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, Building2, FileText, Users, Plane, MessageSquareWarning, UtensilsCrossed, Shield, DoorOpen, Bell } from "lucide-react";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/rooms", label: "Room Grid", icon: Building2 },
  { href: "/admin/applications", label: "Applications", icon: FileText },
  { href: "/admin/students", label: "Students", icon: Users },
  { href: "/admin/leaves", label: "Leave Requests", icon: Plane },
  { href: "/admin/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/admin/mess-menu", label: "Mess Menu", icon: UtensilsCrossed },
  { href: "/admin/admin-mgmt", label: "Admin Mgmt", icon: Shield },
  { href: "/admin/checkout", label: "Checkout", icon: DoorOpen },
  { href: "/admin/notifications", label: "Notifications", icon: Bell },
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
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4 border-primary"></div>
          <p className="text-muted-foreground">Loading...</p>
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
