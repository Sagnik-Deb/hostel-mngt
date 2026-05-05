"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plane, CheckCircle2, XCircle, CalendarClock, CalendarDays, FileText, MapPin, Search } from "lucide-react";

interface Leave {
  id: string;
  userId: string;
  reason: string;
  startDate: string;
  endDate: string;
  originalEnd: string | null;
  extensionReason: string | null;
  returnReason: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; room?: { number: string } };
}

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", bg?: string }> = {
  PENDING: { variant: "secondary", bg: "bg-amber-100 text-amber-800 border-amber-200" },
  APPROVED: { variant: "default", bg: "bg-emerald-500 text-white" },
  REJECTED: { variant: "destructive" },
  ACTIVE: { variant: "default", bg: "bg-blue-500 text-white" },
  EXTENSION_REQUESTED: { variant: "secondary", bg: "bg-purple-100 text-purple-800 border-purple-200" },
  RETURN_REQUESTED: { variant: "secondary", bg: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  COMPLETED: { variant: "outline", bg: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  CANCELLED: { variant: "outline" },
};

export default function AdminLeavesPage() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [notes, setNotes] = useState("");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchLeaves = () => {
    if (!token) return;
    fetch("/api/leaves", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setLeaves(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [token]);

  const handleAction = async (leaveId: string, action: string) => {
    setActionLoading(leaveId);
    try {
      const res = await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, adminNotes: notes }),
      });
      const data = await res.json();
      if (data.success) {
        setNotes("");
        fetchLeaves();
      } else {
        alert(data.error);
      }
    } catch (err) { console.error(err); }
    finally { setActionLoading(null); }
  };

  const filteredLeaves = leaves.filter((l) => {
    const matchFilter = filter === "all" || l.status === filter;
    const matchSearch = l.user.name.toLowerCase().includes(search.toLowerCase()) || 
                        l.user.email.toLowerCase().includes(search.toLowerCase());
    return matchFilter && matchSearch;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
            <Plane className="w-6 h-6 text-primary" /> Leave Requests
          </h1>
          <p className="text-sm text-muted-foreground">{leaves.length} total requests</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-[250px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              className="pl-9 bg-background shadow-sm" 
              placeholder="Search student..." 
              value={search} 
              onChange={(e) => setSearch(e.target.value)} 
            />
          </div>
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-full sm:w-[180px] bg-background shadow-sm">
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="APPROVED">Approved</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="EXTENSION_REQUESTED">Extension Requested</SelectItem>
              <SelectItem value="RETURN_REQUESTED">Return Requested</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredLeaves.length === 0 ? (
        <Card className="border-dashed bg-transparent border-border">
          <CardContent className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <Plane className="w-16 h-16 mb-4 text-primary opacity-20" />
            <h3 className="text-xl font-bold mb-2 text-foreground">No leave requests found</h3>
            <p className="text-sm max-w-sm mx-auto">There are no leave requests matching your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => {
            const statusStyle = STATUS_CONFIG[leave.status] || { variant: "outline" };
            
            return (
              <Card key={leave.id} className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  {/* Card Header (Student Info & Status) */}
                  <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-muted/20 border-b border-border">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shrink-0">
                        {leave.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-lg text-foreground leading-tight mb-1">{leave.user.name}</p>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
                          <span>{leave.user.email}</span>
                          {leave.user.room && (
                            <span className="flex items-center gap-1 bg-background border border-border px-2 py-0.5 rounded-full">
                              <MapPin className="w-3 h-3" /> Room {leave.user.room.number}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <Badge variant={statusStyle.variant} className={`shrink-0 text-xs px-2.5 py-0.5 ${statusStyle.bg || ""}`}>
                      {leave.status.replace(/_/g, " ")}
                    </Badge>
                  </div>

                  {/* Card Body (Details) */}
                  <div className="p-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                          <CalendarDays className="w-3.5 h-3.5" /> Period
                        </p>
                        <p className="font-medium text-sm text-foreground">
                          {new Date(leave.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} 
                          <span className="mx-1.5 text-muted-foreground">→</span> 
                          {new Date(leave.endDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                        <p className="text-xs font-semibold text-muted-foreground uppercase flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" /> Reason
                        </p>
                        <p className="text-sm text-foreground line-clamp-2" title={leave.reason}>{leave.reason}</p>
                      </div>
                      {leave.extensionReason && (
                        <div className="space-y-1 bg-purple-50 p-3 rounded-lg border border-purple-100">
                          <p className="text-xs font-semibold text-purple-700 uppercase flex items-center gap-1.5">
                            <CalendarClock className="w-3.5 h-3.5" /> Extension Reason
                          </p>
                          <p className="text-sm text-purple-900 line-clamp-2" title={leave.extensionReason}>{leave.extensionReason}</p>
                        </div>
                      )}
                    </div>

                    {/* Action Area */}
                    {["PENDING", "EXTENSION_REQUESTED", "RETURN_REQUESTED", "APPROVED", "ACTIVE"].includes(leave.status) && (
                      <div className="pt-4 border-t border-border flex flex-col sm:flex-row sm:items-center gap-3">
                        <Input
                          className="flex-1 bg-background"
                          placeholder="Add admin notes (optional)..."
                          value={notes}
                          onChange={(e) => setNotes(e.target.value)}
                        />

                        <div className="flex gap-2 shrink-0">
                          {leave.status === "PENDING" && (
                            <>
                              <Button 
                                className="gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white" 
                                size="sm"
                                onClick={() => handleAction(leave.id, "approve")} 
                                disabled={actionLoading === leave.id}
                              >
                                {actionLoading === leave.id ? "Processing..." : <><CheckCircle2 className="w-4 h-4" /> Approve</>}
                              </Button>
                              <Button 
                                variant="destructive" 
                                size="sm"
                                className="gap-1.5"
                                onClick={() => handleAction(leave.id, "reject")} 
                                disabled={actionLoading === leave.id}
                              >
                                {actionLoading === leave.id ? "Processing..." : <><XCircle className="w-4 h-4" /> Reject</>}
                              </Button>
                            </>
                          )}

                          {leave.status === "EXTENSION_REQUESTED" && (
                            <>
                              <Button 
                                className="gap-1.5 bg-purple-600 hover:bg-purple-700 text-white" 
                                size="sm"
                                onClick={() => handleAction(leave.id, "approve-extension")} 
                                disabled={actionLoading === leave.id}
                              >
                                {actionLoading === leave.id ? "Processing..." : <><CheckCircle2 className="w-4 h-4" /> Approve Ext.</>}
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                className="gap-1.5 text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
                                onClick={() => handleAction(leave.id, "reject-extension")} 
                                disabled={actionLoading === leave.id}
                              >
                                {actionLoading === leave.id ? "Processing..." : <><XCircle className="w-4 h-4" /> Reject Ext.</>}
                              </Button>
                            </>
                          )}

                          {(leave.status === "RETURN_REQUESTED" || leave.status === "APPROVED" || leave.status === "ACTIVE") && (
                            <Button 
                              variant={leave.status === "RETURN_REQUESTED" ? "default" : "secondary"}
                              className={`gap-1.5 ${leave.status === "RETURN_REQUESTED" ? "bg-indigo-600 hover:bg-indigo-700 text-white" : ""}`}
                              size="sm"
                              onClick={() => handleAction(leave.id, "confirm-return")} 
                              disabled={actionLoading === leave.id}
                            >
                              {actionLoading === leave.id ? "Processing..." : <><CheckCircle2 className="w-4 h-4" /> Confirm Return</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
