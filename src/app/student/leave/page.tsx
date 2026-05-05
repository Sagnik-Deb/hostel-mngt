"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Plane, Plus, Calendar, FileText, CalendarClock, Home, XCircle, Info } from "lucide-react";

interface Leave {
  id: string;
  reason: string;
  startDate: string;
  endDate: string;
  originalEnd: string | null;
  extensionReason: string | null;
  status: string;
  adminNotes: string | null;
  createdAt: string;
}

const STATUS_BADGES: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
  PENDING: "secondary", 
  APPROVED: "default", 
  REJECTED: "destructive",
  ACTIVE: "default", 
  EXTENSION_REQUESTED: "secondary",
  RETURN_REQUESTED: "default", 
  COMPLETED: "outline", 
  CANCELLED: "outline",
};

export default function StudentLeavePage() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [reason, setReason] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [extLeaveId, setExtLeaveId] = useState<string | null>(null);
  const [extReason, setExtReason] = useState("");
  const [extDate, setExtDate] = useState("");

  const fetchLeaves = () => {
    if (!token) return;
    fetch("/api/leaves", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setLeaves(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchLeaves(); }, [token]);

  const handleSubmit = async () => {
    if (!reason || !startDate || !endDate) { setError("All fields required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ reason, startDate, endDate }),
      });
      const data = await res.json();
      if (data.success) { setShowForm(false); setReason(""); setStartDate(""); setEndDate(""); fetchLeaves(); }
      else setError(data.error);
    } catch { setError("Failed to submit"); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (leaveId: string, action: string, extra?: Record<string, string>) => {
    try {
      await fetch(`/api/leaves/${leaveId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ action, ...extra }),
      });
      fetchLeaves();
      setExtLeaveId(null);
    } catch (err) { console.error(err); }
  };

  const activeLeave = leaves.find((l) => ["PENDING", "APPROVED", "ACTIVE", "EXTENSION_REQUESTED", "RETURN_REQUESTED"].includes(l.status));

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <Plane className="w-6 h-6 text-primary" /> Leave Management
        </h1>
        {!activeLeave && !showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Apply for Leave
          </Button>
        )}
      </div>

      {/* Apply Form */}
      {showForm && (
        <Card className="border-border shadow-sm animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>New Leave Request</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-100">{error}</div>}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Start Date</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>End Date</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Reason</Label>
              <Textarea rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave..." className="resize-none" />
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Request"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Active Leave Card */}
      {activeLeave && (
        <Card className="border-l-4 border-l-primary shadow-sm overflow-hidden">
          <CardHeader className="bg-muted/30 pb-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <CardTitle className="text-lg flex items-center gap-2">
                Active Leave
              </CardTitle>
              <Badge variant={STATUS_BADGES[activeLeave.status]}>
                {activeLeave.status.replace(/_/g, " ")}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1"><Calendar className="w-3 h-3" /> Period</p>
                <p className="font-medium text-sm text-foreground">{new Date(activeLeave.startDate).toLocaleDateString()} → {new Date(activeLeave.endDate).toLocaleDateString()}</p>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1"><FileText className="w-3 h-3" /> Reason</p>
                <p className="text-sm text-foreground">{activeLeave.reason}</p>
              </div>
              {activeLeave.adminNotes && (
                <div className="space-y-1">
                  <p className="text-xs font-medium text-muted-foreground uppercase flex items-center gap-1"><Info className="w-3 h-3" /> Admin Notes</p>
                  <p className="text-sm text-foreground">{activeLeave.adminNotes}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 flex-wrap border-t border-border pt-4">
              {activeLeave.status === "PENDING" && (
                <Button variant="destructive" size="sm" className="gap-2" onClick={() => handleAction(activeLeave.id, "cancel")}>
                  <XCircle className="w-4 h-4" /> Cancel Request
                </Button>
              )}

              {(activeLeave.status === "APPROVED" || activeLeave.status === "ACTIVE") && (
                <>
                  <Button variant="secondary" size="sm" className="gap-2" onClick={() => setExtLeaveId(activeLeave.id)}>
                    <CalendarClock className="w-4 h-4" /> Request Extension
                  </Button>
                  <Button size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleAction(activeLeave.id, "request-return")}>
                    <Home className="w-4 h-4" /> Request Return Confirmation
                  </Button>
                </>
              )}
            </div>

            {/* Extension Form */}
            {extLeaveId === activeLeave.id && (
              <div className="mt-4 bg-muted/50 p-4 rounded-lg animate-in slide-in-from-top-2">
                <h4 className="font-semibold text-sm mb-3 text-foreground">Request Extension</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="space-y-2">
                    <Label>New End Date</Label>
                    <Input type="date" value={extDate} onChange={(e) => setExtDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Reason</Label>
                    <Input value={extReason} onChange={(e) => setExtReason(e.target.value)} placeholder="Reason for extension..." />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="sm" onClick={() => handleAction(activeLeave.id, "request-extension", { extensionReason: extReason, newEndDate: extDate })}>Submit Extension</Button>
                  <Button variant="outline" size="sm" onClick={() => setExtLeaveId(null)}>Cancel</Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Leave History */}
      <div>
        <h2 className="font-bold mb-4 tracking-tight text-lg text-foreground">Leave History</h2>
        {leaves.length === 0 ? (
          <Card className="border-dashed bg-transparent border-border">
            <CardContent className="p-12 text-center text-muted-foreground">
              No leave requests yet
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {leaves.filter((l) => l !== activeLeave).map((leave) => (
              <Card key={leave.id} className="shadow-none border-border">
                <CardContent className="p-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm text-foreground">{leave.reason}</p>
                    <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <Badge variant={STATUS_BADGES[leave.status]}>{leave.status.replace(/_/g, " ")}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
