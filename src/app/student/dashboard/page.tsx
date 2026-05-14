"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BedDouble, Plane, UtensilsCrossed, Bell, Speaker, LogOut, Clock, Megaphone } from "lucide-react";

export default function StudentDashboard() {
  const { user, token } = useAuth();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [leaveStatus, setLeaveStatus] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);
  const [checkoutRequest, setCheckoutRequest] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);

  const fetchData = () => {
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
      
    // Fetch checkout request
    fetch("/api/student/checkout", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setCheckoutRequest(d.data); })
      .catch(console.error);

    // Fetch notices
    fetch("/api/notices", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setNotices(d.data); })
      .catch(console.error);
  };

  useEffect(() => {
    fetchData();
  }, [token]);

  const handleCheckoutAction = async () => {
    if (checkoutRequest && checkoutRequest.status === "PENDING") {
      const confirmed = confirm("Are you sure you want to cancel your checkout request?");
      if (!confirmed) return;
      
      setIsCheckingOut(true);
      try {
        const resp = await fetch("/api/student/checkout", {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await resp.json();
        if (data.success) {
          alert(data.message);
          setCheckoutRequest(null);
        } else {
          alert(data.error || "Failed to cancel request");
        }
      } catch (err) {
        alert("An error occurred");
      } finally {
        setIsCheckingOut(false);
      }
    } else {
      const confirmed = confirm(
        "⚠ PERMANENT CHECKOUT WARNING ⚠\n\n" +
        "You are requesting to permanently check out. If approved, your account will be deleted and archived.\n\n" +
        "Are you sure you want to proceed?"
      );

      if (!confirmed) return;
      
      const reason = prompt("Optional: Please provide a reason for checking out:");
      
      setIsCheckingOut(true);
      try {
        const resp = await fetch("/api/student/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          },
          body: JSON.stringify({ reason })
        });

        const data = await resp.json();
        if (data.success) {
          alert(data.message);
          fetchData();
        } else {
          alert(data.error || "Checkout request failed");
        }
      } catch (err) {
        alert("An error occurred during checkout request");
      } finally {
        setIsCheckingOut(false);
      }
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
            {checkoutRequest?.status === "PENDING" ? (
              <Button 
                variant="outline"
                onClick={handleCheckoutAction}
                disabled={isCheckingOut}
                className="h-12 gap-2 text-amber-500 hover:text-amber-600 hover:bg-amber-50 border-amber-200"
              >
                <Clock className="w-4 h-4" />
                {isCheckingOut ? "Canceling..." : "Cancel Checkout Req"}
              </Button>
            ) : (
              <Button 
                variant="outline"
                onClick={handleCheckoutAction}
                disabled={isCheckingOut}
                className="h-12 gap-2 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200"
              >
                <LogOut className="w-4 h-4" />
                {isCheckingOut ? "Requesting..." : "Request Checkout"}
              </Button>
            )}
          </div>
          {checkoutRequest && checkoutRequest.status === "PENDING" && (
            <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-sm text-amber-800 flex items-center gap-2">
              <Clock className="w-4 h-4 shrink-0" />
              You have a pending permanent checkout request waiting for admin approval.
            </div>
          )}
          {checkoutRequest && checkoutRequest.status === "REJECTED" && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800 flex items-center gap-2">
              <Speaker className="w-4 h-4 shrink-0" />
              Your previous checkout request was rejected. You can request again if needed.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Notice Board */}
      <div>
        <h2 className="text-lg font-bold tracking-tight flex items-center gap-2 mb-4">
          <Megaphone className="w-5 h-5 text-primary" /> Notice Board
        </h2>
        
        {notices.length === 0 ? (
          <Card className="border-dashed bg-muted/10">
            <CardContent className="p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
              <Megaphone className="w-10 h-10 mb-3 opacity-20" />
              <p>No active notices right now.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {notices.map((n) => (
              <Card key={n.id} className="shadow-sm border-border">
                <CardContent className="p-5 flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                    <Megaphone className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg leading-none mb-1">{n.title}</h3>
                    <p className="text-xs text-muted-foreground mb-3 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(n.createdAt).toLocaleDateString(undefined, { dateStyle: "medium" })}
                    </p>
                    <p className="text-sm text-foreground/80 whitespace-pre-wrap">{n.message}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
