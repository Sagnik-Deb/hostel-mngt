"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  const pendingAdmins = admins.filter((a) => a.adminState === "PENDING");
  const approvedAdmins = admins.filter((a) => a.adminState === "APPROVED" || a.role === "PRIMARY_ADMIN");

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">🛡️ Admin Management</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Manage admin access for this hostel</p>
        </div>
        {pendingAdmins.length > 0 && (
          <div
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
            style={{ background: 'rgba(245,158,11,0.15)', color: 'var(--color-warning)' }}
          >
            ⏳ {pendingAdmins.length} Pending Approval
          </div>
        )}
      </div>

      {/* Pending Admins (Needs Approval) */}
      {pendingAdmins.length > 0 && (
        <div className="glass p-5" style={{ borderLeft: '3px solid var(--color-warning)' }}>
          <h2 className="font-bold mb-1 flex items-center gap-2">
            <span>⏳ Pending Approval</span>
            <span
              className="px-2 py-0.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.2)', color: 'var(--color-warning)' }}
            >
              {pendingAdmins.length}
            </span>
          </h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            These admins have registered and verified their email. Approve to grant full access.
          </p>
          <div className="space-y-3">
            {pendingAdmins.map((admin) => (
              <div
                key={admin.id}
                className="glass p-4 flex items-center justify-between"
                style={{ background: 'rgba(245,158,11,0.05)' }}
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ background: 'var(--gradient-warm)' }}
                  >
                    {admin.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-medium">{admin.name}</p>
                    <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{admin.email}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                      Registered {new Date(admin.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="badge badge-warning">PENDING</span>
                  <button
                    className="btn btn-success btn-sm"
                    onClick={() => handleAction(admin.id, "approve")}
                    disabled={actionLoading === admin.id}
                    id={`approve-admin-${admin.id}`}
                  >
                    {actionLoading === admin.id ? "..." : "✓ Approve"}
                  </button>
                  {user?.role === "PRIMARY_ADMIN" && (
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => {
                        if (confirm(`Reject and remove ${admin.name}'s admin application?`)) {
                          handleAction(admin.id, "revoke");
                        }
                      }}
                      disabled={actionLoading === admin.id}
                    >
                      ✕ Reject
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Current Approved Admins */}
      <div className="glass p-5">
        <h2 className="font-bold mb-4">Current Admins</h2>
        <div className="space-y-3">
          {approvedAdmins.length === 0 && (
            <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No admins found</p>
          )}
          {approvedAdmins.map((admin) => (
            <div key={admin.id} className="glass p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                  style={{ background: admin.role === "PRIMARY_ADMIN" ? 'var(--gradient-warm)' : 'var(--gradient-aurora)' }}
                >
                  {admin.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-medium">{admin.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{admin.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`badge ${admin.role === "PRIMARY_ADMIN" ? "badge-danger" : "badge-success"}`}>
                  {admin.role === "PRIMARY_ADMIN" ? "Primary Admin" : "Admin"}
                </span>

                {(user?.role === "PRIMARY_ADMIN" || user?.role === "SUPER_ADMIN") && admin.role === "ADMIN" && admin.adminState === "APPROVED" && (
                  <button
                    className="btn btn-danger btn-sm"
                    onClick={() => handleAction(admin.id, "revoke")}
                    disabled={actionLoading === admin.id}
                  >
                    Revoke
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Promote Student to Admin (Primary Admin / Super Admin only) */}
      {(user?.role === "PRIMARY_ADMIN" || user?.role === "SUPER_ADMIN") && (
        <div className="glass p-5">
          <h2 className="font-bold mb-4">Promote Student to Admin</h2>
          <p className="text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Promoted students will have a PENDING state until an existing admin approves their access.
          </p>
          <div className="space-y-2">
            {students.filter((s) => s.status === "ACTIVE").map((s) => (
              <div key={s.id} className="glass p-3 flex items-center justify-between">
                <div>
                  <p className="font-medium text-sm">{s.name}</p>
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{s.email}</p>
                </div>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => {
                    if (confirm(`Promote ${s.name} to Admin?`)) handleAction(s.id, "promote");
                  }}
                  disabled={actionLoading === s.id}
                >
                  👑 Promote
                </button>
              </div>
            ))}
            {students.filter((s) => s.status === "ACTIVE").length === 0 && (
              <p className="text-sm text-center py-4" style={{ color: 'var(--color-text-muted)' }}>No students to promote</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
