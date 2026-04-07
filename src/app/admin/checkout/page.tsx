"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  room: { number: string } | null;
  createdAt: string;
}

interface PastStudent {
  id: string;
  name: string;
  email: string;
  roomNumber: string | null;
  checkedOutAt: string;
}

export default function CheckoutPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [pastStudents, setPastStudents] = useState<PastStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"active" | "past">("active");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = () => {
    if (!token) return;
    Promise.all([
      fetch("/api/admin/students", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
      fetch("/api/admin/checkout", { headers: { Authorization: `Bearer ${token}` } }).then((r) => r.json()),
    ])
      .then(([studentsData, pastData]) => {
        if (studentsData.success) setStudents(studentsData.data);
        if (pastData.success) setPastStudents(pastData.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleCheckout = async (studentId: string, name: string) => {
    if (!confirm(`Permanently check out ${name}? This action CANNOT be undone. The student will lose all access.`)) return;

    setActionLoading(studentId);
    try {
      const res = await fetch("/api/admin/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ studentId }),
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
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-1">🚪 Permanent Checkout</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Check out students who are permanently leaving the hostel
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1 rounded-lg" style={{ background: 'var(--color-surface)', width: 'fit-content' }}>
        <button className={`px-4 py-2 rounded-md text-sm font-semibold ${tab === "active" ? "text-white" : ""}`} style={tab === "active" ? { background: 'var(--gradient-primary)' } : { color: 'var(--color-text-muted)' }} onClick={() => setTab("active")}>Active Students</button>
        <button className={`px-4 py-2 rounded-md text-sm font-semibold ${tab === "past" ? "text-white" : ""}`} style={tab === "past" ? { background: 'var(--gradient-primary)' } : { color: 'var(--color-text-muted)' }} onClick={() => setTab("past")}>Past Students</button>
      </div>

      {tab === "active" && (
        <div className="glass overflow-hidden">
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Room</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {students.map((s) => (
                <tr key={s.id}>
                  <td>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.email}</p>
                    </div>
                  </td>
                  <td className="text-sm">{s.room?.number || "—"}</td>
                  <td><span className={`badge ${s.status === "ACTIVE" ? "badge-success" : "badge-info"}`}>{s.status}</span></td>
                  <td>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleCheckout(s.id, s.name)}
                      disabled={actionLoading === s.id}
                    >
                      {actionLoading === s.id ? "..." : "🚪 Checkout"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {tab === "past" && (
        <div className="glass overflow-hidden">
          <table className="data-table">
            <thead>
              <tr><th>Student</th><th>Email</th><th>Last Room</th><th>Checked Out</th></tr>
            </thead>
            <tbody>
              {pastStudents.length === 0 ? (
                <tr><td colSpan={4} className="text-center py-8" style={{ color: 'var(--color-text-muted)' }}>No past students</td></tr>
              ) : (
                pastStudents.map((s) => (
                  <tr key={s.id}>
                    <td className="font-medium text-sm">{s.name}</td>
                    <td className="text-sm">{s.email}</td>
                    <td className="text-sm">{s.roomNumber || "—"}</td>
                    <td className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{new Date(s.checkedOutAt).toLocaleDateString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
