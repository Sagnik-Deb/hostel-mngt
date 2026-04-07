"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  room: { number: string; floor: number; roomType: string } | null;
  createdAt: string;
}

export default function StudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/students", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudents(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

  const filtered = students.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.email.toLowerCase().includes(search.toLowerCase())
  );

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
          <h1 className="text-2xl font-bold mb-1">👥 Students</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{students.length} active students</p>
        </div>
        <input className="input" style={{ maxWidth: '300px' }} placeholder="Search students..." value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      <div className="glass overflow-hidden">
        <table className="data-table">
          <thead>
            <tr>
              <th>Student</th>
              <th>Phone</th>
              <th>Room</th>
              <th>Status</th>
              <th>Joined</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gradient-aurora)' }}>
                      {s.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-sm">{s.name}</p>
                      <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.email}</p>
                    </div>
                  </div>
                </td>
                <td className="text-sm">{s.phone || "—"}</td>
                <td className="text-sm">{s.room ? `${s.room.number} (${s.room.roomType})` : "Unassigned"}</td>
                <td>
                  <span className={`badge ${s.status === "ACTIVE" ? "badge-success" : s.status === "ON_LEAVE" ? "badge-info" : "badge-warning"}`}>
                    {s.status}
                  </span>
                </td>
                <td className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(s.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
