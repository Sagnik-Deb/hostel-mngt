"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";

interface SidebarLink {
  href: string;
  label: string;
  icon: string;
}

interface DashboardShellProps {
  children: React.ReactNode;
  links: SidebarLink[];
  title: string;
}

export default function DashboardShell({ children, links, title }: DashboardShellProps) {
  const { user, logout } = useAuth();
  const { unreadCount, notifications, markAsRead, markAllAsRead } = useNotifications();
  const pathname = usePathname();
  const [showNotifs, setShowNotifs] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'block' : 'hidden'} md:block`}>
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center gap-3 text-decoration-none">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg" style={{ background: 'var(--gradient-primary)' }}>
              H
            </div>
            <div>
              <h1 className="text-base font-bold" style={{ color: 'var(--color-text)' }}>HostelHub</h1>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{title}</p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`sidebar-link ${pathname === link.href ? 'active' : ''}`}
            >
              <span className="text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </Link>
          ))}
        </nav>

        <div className="mt-auto px-4 pt-8">
          <div className="glass p-4">
            <div className="flex items-center gap-3 mb-3">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                style={{ background: user?.role === 'SUPER_ADMIN' ? 'linear-gradient(135deg,#ef4444,#7c3aed)' : 'var(--gradient-aurora)' }}
              >
                {user?.role === 'SUPER_ADMIN' ? '👑' : (user?.name?.charAt(0) || "?")}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{user?.name}</p>
                <p className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                  {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : user?.email}
                </p>
              </div>
            </div>
            <button onClick={logout} className="btn btn-secondary btn-sm w-full">
              🚪 Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-[260px]">
        {/* Topbar */}
        <div className="topbar">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              ☰
            </button>
            <div className="flex items-center gap-3">
            <div>
              <h2 className="text-base font-semibold">
                {user?.hostel?.name || user?.hostelName || "Hostel"}
              </h2>
              <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                {user?.role === "SUPER_ADMIN"
                  ? "Super Admin"
                  : user?.role === "PRIMARY_ADMIN"
                  ? "Primary Admin"
                  : user?.role === "ADMIN"
                  ? "Admin"
                  : "Student"}
              </p>
            </div>
            {user?.role === "SUPER_ADMIN" && (
              <span
                className="text-xs font-bold px-2 py-1 rounded-full"
                style={{ background: 'linear-gradient(135deg,#ef4444,#7c3aed)', color: 'white' }}
              >
                👑 SUPER
              </span>
            )}
          </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="notification-bell"
                onClick={() => setShowNotifs(!showNotifs)}
                id="notification-bell"
              >
                <span className="text-xl">🔔</span>
                {unreadCount > 0 && (
                  <span className="notification-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 glass p-0 z-50 max-h-96 overflow-hidden" style={{ boxShadow: 'var(--shadow-lg)' }}>
                  <div className="flex items-center justify-between p-4 border-b" style={{ borderColor: 'var(--color-border)' }}>
                    <h3 className="font-semibold text-sm">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs font-medium"
                        style={{ color: 'var(--color-primary)' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm" style={{ color: 'var(--color-text-muted)' }}>
                        No notifications yet
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className="p-3 border-b cursor-pointer transition-colors"
                          style={{
                            borderColor: 'var(--color-border)',
                            background: n.read ? 'transparent' : 'var(--color-primary-light)',
                          }}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.link) window.location.href = n.link;
                          }}
                        >
                          <p className="text-sm font-medium">{n.title}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>{n.message}</p>
                          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
                            {new Date(n.createdAt).toLocaleString()}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href={user?.role === "STUDENT" ? "/student/notifications" : "/admin/notifications"}
                    className="block p-3 text-center text-xs font-medium border-t"
                    style={{ borderColor: 'var(--color-border)', color: 'var(--color-primary)' }}
                    onClick={() => setShowNotifs(false)}
                  >
                    View All Notifications →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6 animate-fade-in">
          {children}
        </main>
      </div>
    </div>
  );
}
