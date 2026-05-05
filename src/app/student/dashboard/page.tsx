"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Plane, UtensilsCrossed, Bell, Speaker, LogOut } from "lucide-react";

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
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome */}
      <Card className="border-none shadow-sm bg-gradient-to-br from-blue-50 to-indigo-50 overflow-hidden relative">
        <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
          <BedDouble className="w-32 h-32" />
        </div>
        <CardContent className="p-8 relative z-10">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Welcome, {user?.name} 👋</h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="font-medium text-primary">{user?.hostel?.name}</span> • 
            <Badge variant={user?.status === "ON_LEAVE" ? "secondary" : "outline"} className="font-normal">
              {user?.status === "ON_LEAVE" ? "Currently on leave" : "In Hostel"}
            </Badge>
          </p>
        </CardContent>
      </Card>

      {/* Quick Info Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/student/my-room" className="block outline-none">
          <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <BedDouble className="w-5 h-5" />
                </div>
                <span className="text-xl font-bold tracking-tight">{user?.room ? `#${user.room.number}` : "—"}</span>
              </div>
              <p className="text-sm font-medium text-muted-foreground">My Room</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/leave" className="block outline-none">
          <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-600">
                  <Plane className="w-5 h-5" />
                </div>
                <Badge variant={leaveStatus ? "default" : "secondary"} className={leaveStatus ? "bg-cyan-500 hover:bg-cyan-600" : ""}>
                  {leaveStatus ? leaveStatus.replace(/_/g, " ") : "None Active"}
                </Badge>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Leave Status</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/mess-menu" className="block outline-none">
          <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-pink-50 flex items-center justify-center text-pink-600">
                  <UtensilsCrossed className="w-5 h-5" />
                </div>
              </div>
              <p className="text-sm font-medium text-muted-foreground">Mess Menu</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/student/notifications" className="block outline-none">
          <Card className="hover:border-primary/50 hover:shadow-md transition-all cursor-pointer h-full border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center text-amber-600 relative">
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                  )}
                </div>
                {unreadCount > 0 && <Badge variant="destructive">{unreadCount} new</Badge>}
              </div>
              <p className="text-sm font-medium text-muted-foreground">Notifications</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card className="border-border shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Link href="/student/leave">
              <Button variant="outline" className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground">
                <Plane className="w-4 h-4" /> Apply Leave
              </Button>
            </Link>
            <Link href="/student/complaints">
              <Button variant="outline" className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground">
                <Speaker className="w-4 h-4" /> Raise Complaint
              </Button>
            </Link>
            <Link href="/student/mess-menu">
              <Button variant="outline" className="w-full h-12 gap-2 text-muted-foreground hover:text-foreground">
                <UtensilsCrossed className="w-4 h-4" /> Rate Meal
              </Button>
            </Link>
            <Button 
              variant="outline"
              onClick={handleSelfCheckout}
              disabled={isCheckingOut}
              className="h-12 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
            >
              <LogOut className="w-4 h-4" />
              {isCheckingOut ? "Checking out..." : "Permanent Checkout"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
