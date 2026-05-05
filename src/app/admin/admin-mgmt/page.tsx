"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Shield, ShieldAlert, CheckCircle2, XCircle, Crown, Clock, ShieldBan, UserPlus } from "lucide-react";

interface Admin {
  id: string;
  name: string;
  email: string;
  role: string;
  adminState: string;
  createdAt: string;
}

interface Student {
  id: string;
  name: string;
  email: string;
  status: string;
}

export default function AdminMgmtPage() {
  const { token, user } = useAuth();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = () => {
    if (!token) return;
    Promise.all([
      fetch("/api/admin/manage", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/students", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([adminsData, studentsData]) => {
        if (adminsData.success) setAdmins(adminsData.data);
        if (studentsData.success) setStudents(studentsData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleAction = async (targetUserId: string, action: string) => {
    setActionLoading(targetUserId);
    try {
      const res = await fetch("/api/admin/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, targetUserId }),
      });
      const data = await res.json();
      if (data.success) fetchData();
      else alert(data.error);
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  const pendingAdmins = admins.filter((a) => a.adminState === "PENDING");
  const approvedAdmins = admins.filter((a) => a.adminState === "APPROVED" || a.role === "PRIMARY_ADMIN");

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
            <Shield className="w-6 h-6 text-primary" /> Admin Management
          </h1>
          <p className="text-sm text-muted-foreground">Manage admin access for this hostel</p>
        </div>
        {pendingAdmins.length > 0 && (
          <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 px-3 py-1 text-sm shrink-0 gap-1.5">
            <Clock className="w-4 h-4" /> {pendingAdmins.length} Pending Approval
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          {/* Pending Admins (Needs Approval) */}
          {pendingAdmins.length > 0 && (
            <Card className="border-amber-200 shadow-sm bg-amber-50/30">
              <CardHeader className="pb-3 border-b border-amber-100 bg-amber-50/50">
                <CardTitle className="text-lg flex items-center gap-2 text-amber-900">
                  <ShieldAlert className="w-5 h-5 text-amber-600" /> Pending Approval
                  <Badge variant="outline" className="bg-amber-200 text-amber-800 border-transparent ml-2">{pendingAdmins.length}</Badge>
                </CardTitle>
                <CardDescription className="text-amber-700/80">
                  These admins have registered and verified their email. Approve to grant full access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-amber-100">
                  {pendingAdmins.map((admin) => (
                    <div key={admin.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold bg-gradient-to-br from-amber-400 to-amber-600 shadow-sm shrink-0">
                          {admin.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground leading-tight">{admin.name}</p>
                          <p className="text-sm text-muted-foreground">{admin.email}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> Registered {new Date(admin.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                          onClick={() => handleAction(admin.id, "approve")}
                          disabled={actionLoading === admin.id}
                        >
                          {actionLoading === admin.id ? "Processing..." : <><CheckCircle2 className="w-4 h-4" /> Approve</>}
                        </Button>
                        {user?.role === "PRIMARY_ADMIN" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5"
                            onClick={() => {
                              if (confirm(`Reject and remove ${admin.name}'s admin application?`)) {
                                handleAction(admin.id, "revoke");
                              }
                            }}
                            disabled={actionLoading === admin.id}
                          >
                            <XCircle className="w-4 h-4" /> Reject
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Current Approved Admins */}
          <Card className="border-border shadow-sm">
            <CardHeader className="pb-3 border-b border-border bg-muted/30">
              <CardTitle className="text-lg flex items-center gap-2">
                <Shield className="w-5 h-5 text-primary" /> Current Admins
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border">
                {approvedAdmins.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground">
                    No admins found.
                  </div>
                )}
                {approvedAdmins.map((admin) => (
                  <div key={admin.id} className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0 ${admin.role === "PRIMARY_ADMIN" ? "bg-gradient-to-br from-indigo-600 to-purple-700" : "bg-gradient-to-br from-blue-500 to-cyan-600"}`}>
                        {admin.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-foreground leading-tight flex items-center gap-2">
                          {admin.name}
                        </p>
                        <p className="text-sm text-muted-foreground">{admin.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {admin.role === "PRIMARY_ADMIN" ? (
                        <Badge className="bg-indigo-600 hover:bg-indigo-700 text-white gap-1">
                          <Crown className="w-3.5 h-3.5" /> Primary Admin
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                          Admin
                        </Badge>
                      )}

                      {(user?.role === "PRIMARY_ADMIN" || user?.role === "SUPER_ADMIN") && admin.role === "ADMIN" && admin.adminState === "APPROVED" && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5 h-8 px-2"
                          onClick={() => {
                            if (confirm(`Revoke admin access for ${admin.name}?`)) {
                              handleAction(admin.id, "revoke");
                            }
                          }}
                          disabled={actionLoading === admin.id}
                        >
                          <ShieldBan className="w-3.5 h-3.5" /> Revoke
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          {/* Promote Student to Admin (Primary Admin / Super Admin only) */}
          {(user?.role === "PRIMARY_ADMIN" || user?.role === "SUPER_ADMIN") && (
            <Card className="border-border shadow-sm">
              <CardHeader className="pb-3 border-b border-border bg-muted/30">
                <CardTitle className="text-lg flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-primary" /> Promote Student to Admin
                </CardTitle>
                <CardDescription>
                  Promoted students will have a PENDING state until an existing admin approves their access.
                </CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                <div className="divide-y divide-border max-h-[600px] overflow-y-auto">
                  {students.filter((s) => s.status === "ACTIVE").length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      No active students available to promote.
                    </div>
                  ) : (
                    students.filter((s) => s.status === "ACTIVE").map((s) => (
                      <div key={s.id} className="p-4 flex items-center justify-between gap-4 hover:bg-muted/10 transition-colors">
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{s.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                        </div>
                        <Button
                          variant="secondary"
                          size="sm"
                          className="gap-1.5 shrink-0"
                          onClick={() => {
                            if (confirm(`Promote ${s.name} to Admin?`)) handleAction(s.id, "promote");
                          }}
                          disabled={actionLoading === s.id}
                        >
                          <Crown className="w-4 h-4 text-primary" /> Promote
                        </Button>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
