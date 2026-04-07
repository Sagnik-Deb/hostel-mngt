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
}

const STATUS_BADGES: Record<string, string> = {
  OPEN: "badge-info", IN_PROGRESS: "badge-warning", RESOLVED: "badge-success", CLOSED: "badge-gray",
};

export default function StudentComplaintsPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComplaints = () => {
    if (!token) return;
    fetch("/api/complaints", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setComplaints(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, [token]);

  const handleSubmit = async () => {
    if (!subject || !description) { setError("Subject and description required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, description, category, priority }),
      });
      const data = await res.json();
      if (data.success) { setShowForm(false); setSubject(""); setDescription(""); fetchComplaints(); }
      else setError(data.error);
    } catch { setError("Failed to submit"); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">📢 Complaints</h1>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>+ Raise Complaint</button>
      </div>

      {showForm && (
        <div className="glass p-6 animate-fade-in">
          <h2 className="font-bold mb-4">New Complaint</h2>
          {error && <div className="p-3 rounded-lg text-sm mb-4" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>{error}</div>}
          <div className="space-y-4">
            <div><label className="input-label">Subject</label><input className="input" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of the issue" /></div>
            <div><label className="input-label">Description</label><textarea className="input" rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description..." style={{ resize: 'vertical' }} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="input-label">Category</label>
                <select className="input" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">Select category</option>
                  <option value="Maintenance">Maintenance</option>
                  <option value="Cleanliness">Cleanliness</option>
                  <option value="Food">Food</option>
                  <option value="Security">Security</option>
                  <option value="Noise">Noise</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="input-label">Priority</label>
                <select className="input" value={priority} onChange={(e) => setPriority(e.target.value)}>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3">
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>{submitting ? "Submitting..." : "Submit Complaint"}</button>
              <button className="btn btn-secondary" onClick={() => setShowForm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {complaints.length === 0 ? (
        <div className="glass p-12 text-center"><p style={{ color: 'var(--color-text-muted)' }}>No complaints yet</p></div>
      ) : (
        <div className="space-y-3">
          {complaints.map((c) => (
            <div key={c.id} className="glass p-4">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-bold text-sm">{c.subject}</h3>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {c.category && `${c.category} • `}{new Date(c.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <span className={`badge ${STATUS_BADGES[c.status]}`}>{c.status}</span>
              </div>
              <p className="text-sm mb-2">{c.description}</p>
              {c.response && (
                <div className="glass p-3" style={{ borderLeftWidth: '3px', borderLeftColor: 'var(--color-success)' }}>
                  <p className="text-xs font-semibold" style={{ color: 'var(--color-success)' }}>Admin Response:</p>
                  <p className="text-sm">{c.response}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
