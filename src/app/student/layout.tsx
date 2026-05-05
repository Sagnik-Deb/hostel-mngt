"use client";

import { NotificationProvider } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/layout/DashboardShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { LayoutDashboard, BedDouble, Plane, UtensilsCrossed, MessageSquareWarning, Bell } from "lucide-react";

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/student/my-room", label: "My Room", icon: BedDouble },
  { href: "/student/leave", label: "Leave", icon: Plane },
  { href: "/student/mess-menu", label: "Mess Menu", icon: UtensilsCrossed },
  { href: "/student/complaints", label: "Complaints", icon: MessageSquareWarning },
  { href: "/student/notifications", label: "Notifications", icon: Bell },
];

export default function StudentLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || user.role !== "STUDENT")) {
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

  if (!user || user.role !== "STUDENT") return null;

  return (
    <NotificationProvider>
      <DashboardShell links={studentLinks} title="Student Portal">
        {children}
      </DashboardShell>
    </NotificationProvider>
  );
}
