"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, LogOut, Menu, X, Crown, Circle, type LucideIcon } from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
  icon: LucideIcon;
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
    <div className="flex min-h-screen bg-background">
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-[260px] bg-white border-r border-border flex flex-col py-6 transition-transform duration-200 md:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="px-6 mb-8">
          <Link href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-bold text-lg bg-primary shadow-sm">
              H
            </div>
            <div>
              <h1 className="text-base font-bold text-foreground">AUSHostel</h1>
              <p className="text-xs text-muted-foreground">{title}</p>
            </div>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 px-3 flex-1">
          {links.map((link) => {
            const isActive = pathname === link.href;
            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors no-underline ${isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
              >
                <Icon className={`w-[18px] h-[18px] shrink-0 ${isActive ? "text-primary" : "text-muted-foreground"}`} />
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 pt-4">
          <Card className="border-border shadow-sm">
            <CardContent className="p-3">
              <div className="flex items-center gap-3 mb-3">
                <div
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0 ${user?.role === "SUPER_ADMIN"
                      ? "bg-gradient-to-br from-red-500 to-purple-600"
                      : "bg-gradient-to-br from-indigo-500 to-purple-600"
                    }`}
                >
                  {user?.role === "SUPER_ADMIN" ? (
                    <Crown className="w-4 h-4" />
                  ) : (
                    user?.name?.charAt(0)?.toUpperCase() || "?"
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate text-foreground">{user?.name}</p>
                  <p className="text-xs truncate text-muted-foreground">
                    {user?.role === "SUPER_ADMIN" ? "Super Admin" : user?.email}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full gap-2 text-muted-foreground" onClick={logout}>
                <LogOut className="w-4 h-4" /> Logout
              </Button>
            </CardContent>
          </Card>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 md:ml-[260px]">
        {/* Topbar */}
        <div className="sticky top-0 z-30 h-16 flex items-center justify-between px-6 bg-white/80 backdrop-blur-lg border-b border-border">
          <div className="flex items-center gap-4">
            <button
              className="md:hidden p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div className="flex items-center gap-3">
              <div>
                <h2 className="text-sm font-semibold text-foreground leading-tight">
                  {user?.hostel?.name || user?.hostelName || "Hostel"}
                </h2>
                <p className="text-xs text-muted-foreground">
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
                <Badge className="bg-gradient-to-r from-red-500 to-purple-600 text-white border-none gap-1 text-[10px]">
                  <Crown className="w-3 h-3" /> SUPER
                </Badge>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* Notification Bell */}
            <div className="relative">
              <button
                className="relative p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
                onClick={() => setShowNotifs(!showNotifs)}
                id="notification-bell"
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center rounded-full text-[10px] font-bold bg-red-500 text-white px-1">
                    {unreadCount > 99 ? "99+" : unreadCount}
                  </span>
                )}
              </button>

              {showNotifs && (
                <Card className="absolute right-0 top-12 w-80 z-50 max-h-96 overflow-hidden shadow-lg border-border">
                  <div className="flex items-center justify-between p-4 border-b border-border">
                    <h3 className="font-semibold text-sm text-foreground">Notifications</h3>
                    {unreadCount > 0 && (
                      <button
                        onClick={() => markAllAsRead()}
                        className="text-xs font-medium text-primary hover:underline"
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-center text-sm text-muted-foreground">
                        No notifications yet
                      </p>
                    ) : (
                      notifications.slice(0, 10).map((n) => (
                        <div
                          key={n.id}
                          className={`p-3 border-b border-border cursor-pointer transition-colors hover:bg-muted/50 ${!n.read ? "bg-primary/5" : ""
                            }`}
                          onClick={() => {
                            markAsRead(n.id);
                            if (n.link) window.location.href = n.link;
                          }}
                        >
                          <div className="flex items-start gap-2">
                            <Circle
                              className={`w-2 h-2 mt-1.5 shrink-0 ${n.read
                                  ? "text-muted-foreground/30 fill-muted-foreground/30"
                                  : "text-primary fill-primary"
                                }`}
                            />
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                              <p className="text-xs mt-0.5 text-muted-foreground line-clamp-2">{n.message}</p>
                              <p className="text-[10px] mt-1 text-muted-foreground">
                                {new Date(n.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <Link
                    href={user?.role === "STUDENT" ? "/student/notifications" : "/admin/notifications"}
                    className="block p-3 text-center text-xs font-medium border-t border-border text-primary hover:bg-muted/50 transition-colors no-underline"
                    onClick={() => setShowNotifs(false)}
                  >
                    View All Notifications →
                  </Link>
                </Card>
              )}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
