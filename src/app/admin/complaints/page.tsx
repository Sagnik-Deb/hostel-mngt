"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: string | null;
  priority: string;
  status: string;
  response: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; room?: { number: string } };
}

const PRIORITY_BADGES: Record<string, string> = {
  LOW: "badge-gray", MEDIUM: "badge-info", HIGH: "badge-warning", URGENT: "badge-danger",
};
const STATUS_BADGES: Record<string, string> = {
  OPEN: "badge-info", IN_PROGRESS: "badge-warning", RESOLVED: "badge-success", CLOSED: "badge-gray",
};

export default function AdminComplaintsPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const fetchComplaints = () => {
    if (!token) return;
    fetch("/api/complaints", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setComplaints(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, [token]);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ complaintId: id, status, response }),
      });
      setResponse("");
      setSelectedId(null);
      fetchComplaints();
    } catch (err) { console.error(err); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">📢 Complaints</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{complaints.length} total complaints</p>
      </div>

      {complaints.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="text-5xl mb-4">✅</p>
          <p className="font-bold">No complaints</p>
        </div>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => (
            <div key={c.id} className="glass p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-bold">{c.subject}</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    by {c.user.name} {c.user.room && `• Room ${c.user.room.number}`} • {new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex gap-2">
                  <span className={`badge ${PRIORITY_BADGES[c.priority]}`}>{c.priority}</span>
                  <span className={`badge ${STATUS_BADGES[c.status]}`}>{c.status}</span>
                </div>
              </div>
              <p className="text-sm mb-3">{c.description}</p>
              {c.response && (
                <div className="glass p-3 mb-3">
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-text-muted)' }}>Admin Response:</p>
                  <p className="text-sm">{c.response}</p>
                </div>
              )}
              {(c.status === "OPEN" || c.status === "IN_PROGRESS") && (
                <div className="flex gap-3 pt-3 border-t" style={{ borderColor: 'var(--color-border)' }}>
                  {selectedId === c.id ? (
                    <>
                      <input className="input flex-1" placeholder="Response..." value={response} onChange={(e) => setResponse(e.target.value)} />
                      <button className="btn btn-warning btn-sm" onClick={() => handleUpdate(c.id, "IN_PROGRESS")}>In Progress</button>
                      <button className="btn btn-success btn-sm" onClick={() => handleUpdate(c.id, "RESOLVED")}>Resolve</button>
                      <button className="btn btn-secondary btn-sm" onClick={() => setSelectedId(null)}>Cancel</button>
                    </>
                  ) : (
                    <button className="btn btn-primary btn-sm" onClick={() => setSelectedId(c.id)}>Respond</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
