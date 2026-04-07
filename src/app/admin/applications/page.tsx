"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

interface Application {
  id: string;
  email: string;
  name: string;
  phone: string;
  aadharNumber: string;
  collegeIdUpload: string;
  hostelId: string;
  emailVerified: boolean;
  roommatePreference: string;
  createdAt: string;
}

interface Room {
  id: string;
  number: string;
  floor: number;
  capacity: number;
  occupied: number;
  roomType: string;
}

export default function ApplicationsPage() {
  const { token } = useAuth();
  const [apps, setApps] = useState<Application[]>([]);
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApp, setSelectedApp] = useState<Application | null>(null);
  const [assignRoom, setAssignRoom] = useState("");
  const [assignBed, setAssignBed] = useState(1);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchApps = () => {
    if (!token) return;
    fetch("/api/admin/applications", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setApps(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchApps();
    if (token) {
      fetch("/api/rooms", { headers: { Authorization: `Bearer ${token}` } })
        .then((r) => r.json())
        .then((d) => { if (d.success) setRooms(d.data.filter((r: Room) => r.occupied < r.capacity)); })
        .catch(console.error);
    }
  }, [token]);

  const handleAction = async (appId: string, action: string) => {
    setActionLoading(true);
    try {
      const body: Record<string, unknown> = { applicationId: appId, action };
      if (action === "approve" && assignRoom) {
        body.roomId = assignRoom;
        body.bedNumber = assignBed;
      }

      const res = await fetch("/api/admin/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setSelectedApp(null);
        fetchApps();
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
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
        <h1 className="text-2xl font-bold mb-1">📋 Student Applications</h1>
        <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          {apps.length} pending application{apps.length !== 1 ? "s" : ""}
        </p>
      </div>

      {apps.length === 0 ? (
        <div className="glass p-16 text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h3 className="text-lg font-bold mb-2">All caught up!</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>No pending applications to review</p>
        </div>
      ) : (
        <div className="glass overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Contact</th>
                <th>Documents</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {apps.map((app) => (
                <tr key={app.id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gradient-aurora)' }}>
                        {app.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{app.name}</p>
                        <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{app.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm">{app.phone || "—"}</td>
                  <td>
                    <div className="flex gap-1">
                      {app.aadharNumber && <span className="badge badge-success">Aadhar</span>}
                      {app.collegeIdUpload && <span className="badge badge-success">College ID</span>}
                      {!app.aadharNumber && !app.collegeIdUpload && <span className="badge badge-warning">None</span>}
                    </div>
                  </td>
                  <td className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {new Date(app.createdAt).toLocaleDateString()}
                  </td>
                  <td>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => setSelectedApp(app)}
                    >
                      Review
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Review Modal */}
      {selectedApp && (
        <div className="modal-overlay" onClick={() => setSelectedApp(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Review Application</h2>
                <button onClick={() => setSelectedApp(null)} className="text-xl" style={{ color: 'var(--color-text-muted)' }}>×</button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="glass p-3"><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Name</p><p className="font-medium text-sm">{selectedApp.name}</p></div>
                <div className="glass p-3"><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Email</p><p className="font-medium text-sm">{selectedApp.email}</p></div>
                <div className="glass p-3"><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Phone</p><p className="font-medium text-sm">{selectedApp.phone || "—"}</p></div>
                <div className="glass p-3"><p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Aadhar</p><p className="font-medium text-sm">{selectedApp.aadharNumber || "—"}</p></div>
              </div>

              {selectedApp.roommatePreference && (
                <div className="glass p-3">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Roommate Preference</p>
                  <p className="text-sm mt-1">{selectedApp.roommatePreference}</p>
                </div>
              )}

              <div>
                <label className="input-label">Assign Room (optional)</label>
                <select className="input" value={assignRoom} onChange={(e) => setAssignRoom(e.target.value)}>
                  <option value="">Don&apos;t assign yet</option>
                  {rooms.map((r) => (
                    <option key={r.id} value={r.id}>
                      Room {r.number} ({r.roomType}) — {r.occupied}/{r.capacity}
                    </option>
                  ))}
                </select>
              </div>

              {assignRoom && (
                <div>
                  <label className="input-label">Bed Number</label>
                  <input type="number" className="input" value={assignBed} onChange={(e) => setAssignBed(Number(e.target.value))} min={1} />
                </div>
              )}

              <div className="flex gap-3">
                <button
                  className="btn btn-success flex-1"
                  onClick={() => handleAction(selectedApp.id, "approve")}
                  disabled={actionLoading}
                >
                  ✅ Approve
                </button>
                <button
                  className="btn btn-danger flex-1"
                  onClick={() => handleAction(selectedApp.id, "reject")}
                  disabled={actionLoading}
                >
                  ❌ Reject
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
