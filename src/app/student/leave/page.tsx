"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

const STATUS_BADGES: Record<string, string> = {
  PENDING: "badge-warning", APPROVED: "badge-success", REJECTED: "badge-danger",
  ACTIVE: "badge-info", EXTENSION_REQUESTED: "badge-purple",
  RETURN_REQUESTED: "badge-info", COMPLETED: "badge-success", CANCELLED: "badge-gray",
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
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">✈️ Leave Management</h1>
        {!activeLeave && (
          <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Apply for Leave</button>
        )}
      </div>

      {/* Apply Form */}
      {showForm && (
        <div className="glass p-6 animate-fade-in">
          <h2 className="font-bold mb-4">New Leave Request</h2>
          {error && <div className="p-3 rounded-lg text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>{error}</div>}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div><label className="input-label">Start Date</label><input type="date" className="input" value={startDate} onChange={(e) => setStartDate(e.target.value)} /></div>
            <div><label className="input-label">End Date</label><input type="date" className="input" value={endDate} onChange={(e) => setEndDate(e.target.value)} /></div>
          </div>
          <div className="mb-4"><label className="input-label">Reason</label><textarea className="input" rows={3} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Reason for leave..." style={{ resize: 'vertical' }} /></div>
          <div className="flex gap-3">
            <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Request"}</button>
            <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Active Leave Card */}
      {activeLeave && (
        <div className="glass p-6" style={{ borderLeftWidth: '4px', borderLeftColor: 'var(--color-primary)' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold">Active Leave</h3>
            <span className={`badge ${STATUS_BADGES[activeLeave.status]}`}>{activeLeave.status.replace(/_/g, " ")}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
            <div className="glass p-3"><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Period</p><p className="font-medium text-sm">{new Date(activeLeave.startDate).toLocaleDateString()} → {new Date(activeLeave.endDate).toLocaleDateString()}</p></div>
            <div className="glass p-3"><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Reason</p><p className="text-sm">{activeLeave.reason}</p></div>
            {activeLeave.adminNotes && <div className="glass p-3"><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Admin Notes</p><p className="text-sm">{activeLeave.adminNotes}</p></div>}
          </div>

          <div className="flex gap-3 flex-wrap">
            {activeLeave.status === "PENDING" && (
              <button className="btn btn-danger btn-sm" onClick={() => handleAction(activeLeave.id, "cancel")}>Cancel Request</button>
            )}

            {(activeLeave.status === "APPROVED" || activeLeave.status === "ACTIVE") && (
              <>
                <button className="btn btn-primary btn-sm" onClick={() => setExtLeaveId(activeLeave.id)}>📅 Request Extension</button>
                <button className="btn btn-success btn-sm" onClick={() => handleAction(activeLeave.id, "request-return")}>🏠 Request Return Confirmation</button>
              </>
            )}
          </div>

          {/* Extension Form */}
          {extLeaveId === activeLeave.id && (
            <div className="mt-4 glass p-4 animate-fade-in">
              <h4 className="font-bold text-sm mb-3">Request Extension</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                <div><label className="input-label">New End Date</label><input type="date" className="input" value={extDate} onChange={(e) => setExtDate(e.target.value)} /></div>
                <div><label className="input-label">Reason</label><input className="input" value={extReason} onChange={(e) => setExtReason(e.target.value)} placeholder="Reason for extension..." /></div>
              </div>
              <div className="flex gap-2">
                <button className="btn btn-primary btn-sm" onClick={() => handleAction(activeLeave.id, "request-extension", { extensionReason: extReason, newEndDate: extDate })}>Submit Extension</button>
                <button className="btn btn-secondary btn-sm" onClick={() => setExtLeaveId(null)}>Cancel</button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Leave History */}
      <div>
        <h2 className="font-bold mb-4">Leave History</h2>
        {leaves.length === 0 ? (
          <div className="glass p-12 text-center"><p style={{ color: 'var(--color-text-muted)' }}>No leave requests yet</p></div>
        ) : (
          <div className="space-y-3">
            {leaves.filter((l) => l !== activeLeave).map((leave) => (
              <div key={leave.id} className="glass p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-sm">{leave.reason}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                      {new Date(leave.startDate).toLocaleDateString()} → {new Date(leave.endDate).toLocaleDateString()}
                    </p>
                  </div>
                  <span className={`badge ${STATUS_BADGES[leave.status]}`}>{leave.status}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
