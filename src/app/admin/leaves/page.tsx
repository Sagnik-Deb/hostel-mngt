"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

const STATUS_BADGES: Record<string, string> = {
  PENDING: "badge-warning",
  APPROVED: "badge-success",
  REJECTED: "badge-danger",
  ACTIVE: "badge-info",
  EXTENSION_REQUESTED: "badge-purple",
  RETURN_REQUESTED: "badge-info",
  COMPLETED: "badge-success",
  CANCELLED: "badge-gray",
};

export default function AdminLeavesPage() {
  const { token } = useAuth();
  const [leaves, setLeaves] = useState<Leave[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
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

  const filteredLeaves = filter === "all" ? leaves : leaves.filter((l) => l.status === filter);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">✈️ Leave Requests</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{leaves.length} total requests</p>
        </div>
        <select className="input" style={{ width: 'auto' }} value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="all">All</option>
          <option value="PENDING">Pending</option>
          <option value="APPROVED">Approved</option>
          <option value="ACTIVE">Active</option>
          <option value="EXTENSION_REQUESTED">Extension Requested</option>
          <option value="RETURN_REQUESTED">Return Requested</option>
          <option value="COMPLETED">Completed</option>
        </select>
      </div>

      {filteredLeaves.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="text-5xl mb-4">📭</p>
          <p className="font-bold">No leave requests found</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => (
            <div key={leave.id} className="glass p-5 animate-fade-in">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold" style={{ background: 'var(--gradient-aurora)' }}>
                    {leave.user.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold">{leave.user.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {leave.user.email} {leave.user.room && `• Room ${leave.user.room.number}`}
                    </p>
                  </div>
                </div>
                <span className={`badge ${STATUS_BADGES[leave.status] || "badge-gray"}`}>{leave.status.replace(/_/g, " ")}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
                <div className="glass p-3">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Period</p>
                  <p className="text-sm font-medium">
                    {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                  </p>
                </div>
                <div className="glass p-3">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Reason</p>
                  <p className="text-sm">{leave.reason}</p>
                </div>
                {leave.extensionReason && (
                  <div className="glass p-3">
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Extension Reason</p>
                    <p className="text-sm">{leave.extensionReason}</p>
                  </div>
                )}
              </div>

              {/* Action buttons based on status */}
              {(leave.status === "PENDING" || leave.status === "EXTENSION_REQUESTED" || leave.status === "RETURN_REQUESTED") && (
                <div className="flex items-center gap-3 flex-wrap pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <input
                    className="input flex-1"
                    placeholder="Admin notes (optional)"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    style={{ maxWidth: '300px' }}
                  />

                  {leave.status === "PENDING" && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => handleAction(leave.id, "approve")} disabled={actionLoading === leave.id}>✅ Approve</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleAction(leave.id, "reject")} disabled={actionLoading === leave.id}>❌ Reject</button>
                    </>
                  )}

                  {leave.status === "EXTENSION_REQUESTED" && (
                    <>
                      <button className="btn btn-success btn-sm" onClick={() => handleAction(leave.id, "approve-extension")} disabled={actionLoading === leave.id}>✅ Approve Extension</button>
                      <button className="btn btn-danger btn-sm" onClick={() => handleAction(leave.id, "reject-extension")} disabled={actionLoading === leave.id}>❌ Reject Extension</button>
                    </>
                  )}

                  {leave.status === "RETURN_REQUESTED" && (
                    <button className="btn btn-success btn-sm" onClick={() => handleAction(leave.id, "confirm-return")} disabled={actionLoading === leave.id}>
                      ✅ Confirm Physical Return
                    </button>
                  )}
                </div>
              )}

              {(leave.status === "APPROVED" || leave.status === "ACTIVE") && (
                <div className="flex items-center gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  <input className="input flex-1" placeholder="Admin notes" value={notes} onChange={(e) => setNotes(e.target.value)} style={{ maxWidth: '300px' }} />
                  <button className="btn btn-primary btn-sm" onClick={() => handleAction(leave.id, "confirm-return")} disabled={actionLoading === leave.id}>
                    ✅ Confirm Physical Return
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
