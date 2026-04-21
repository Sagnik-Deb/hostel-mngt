"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  aadharNumber: string | null;
  collegeId: string | null;
  profileImage: string | null;
  room: { number: string; floor: number; roomType: string } | null;
  createdAt: string;
}

export default function StudentsPage() {
  const { token } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  useEffect(() => {
    fetchStudents();
  }, [token]);

  const fetchStudents = () => {
    if (!token) return;
    fetch("/api/admin/students", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setStudents(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  const handleCheckout = async (studentId: string, name: string) => {
    if (!confirm(`Are you sure you want to PERMANENTLY checkout ${name}? Their account will be deleted and archived.`)) {
      return;
    }

    setProcessingId(studentId);
    try {
      const resp = await fetch("/api/admin/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ studentId })
      });

      const data = await resp.json();
      if (data.success) {
        alert(data.message);
        fetchStudents();
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

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
    <>
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
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) => (
              <tr key={s.id}>
                <td>
                  <div 
                    className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                    onClick={() => {
                      setSelectedStudent(s);
                      setIsDetailModalOpen(true);
                    }}
                  >
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gradient-aurora)' }}>
                      {s.profileImage ? (
                        <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        s.name.charAt(0)
                      )}
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
                <td className="text-right">
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--color-danger)', fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => handleCheckout(s.id, s.name)}
                    disabled={processingId === s.id}
                  >
                    {processingId === s.id ? "..." : "Checkout"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>

      {/* Student Detail Modal */}
      {isDetailModalOpen && selectedStudent && (
        <div className="modal-overlay" onClick={() => setIsDetailModalOpen(false)}>
          <div className="modal-content glass p-0 max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 pb-0 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ background: 'var(--gradient-aurora)' }}>
                  {selectedStudent.profileImage ? (
                    <img src={selectedStudent.profileImage} alt={selectedStudent.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    selectedStudent.name.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selectedStudent.email}</p>
                </div>
              </div>
              <button 
                className="btn btn-secondary p-2 min-w-0 leading-none hover:bg-white/10" 
                onClick={() => setIsDetailModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Phone Number</label>
                    <p className="font-medium">{selectedStudent.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Aadhar Number</label>
                    <p className="font-medium">{selectedStudent.aadharNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">College ID</label>
                    <p className="font-medium">{selectedStudent.collegeId || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Room Details</label>
                    {selectedStudent.room ? (
                      <div className="glass p-3 rounded-lg border border-white/5">
                        <p className="font-bold text-sm">Room {selectedStudent.room.number}</p>
                        <p className="text-xs text-muted">Floor {selectedStudent.room.floor} • {selectedStudent.room.roomType}</p>
                      </div>
                    ) : (
                      <p className="font-medium text-amber-500">Unassigned</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Account Status</label>
                    <span className={`badge ${selectedStudent.status === "ACTIVE" ? "badge-success" : selectedStudent.status === "ON_LEAVE" ? "badge-info" : "badge-warning"}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Joined Date</label>
                    <p className="font-medium">{new Date(selectedStudent.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white/5 flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setIsDetailModalOpen(false)}>Close</button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--color-danger)' }}
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleCheckout(selectedStudent.id, selectedStudent.name);
                }}
              >
                Checkout Student
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
