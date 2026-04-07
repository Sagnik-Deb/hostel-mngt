"use client";

import { NotificationProvider } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import DashboardShell from "@/components/layout/DashboardShell";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const studentLinks = [
  { href: "/student/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/student/my-room", label: "My Room", icon: "🛏️" },
  { href: "/student/leave", label: "Leave", icon: "✈️" },
  { href: "/student/mess-menu", label: "Mess Menu", icon: "🍽️" },
  { href: "/student/complaints", label: "Complaints", icon: "📢" },
  { href: "/student/notifications", label: "Notifications", icon: "🔔" },
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
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
          <p style={{ color: 'var(--color-text-muted)' }}>Loading...</p>
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
