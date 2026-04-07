"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";

export default function MyRoomPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🛏️ My Room</h1>

      {user?.room ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="glass p-6">
            <h2 className="font-bold mb-4">Room Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Room Number</span>
                <span className="font-semibold">{user.room.number}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Floor</span>
                <span className="font-semibold">{user.room.floor}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Room Type</span>
                <span className="font-semibold">{user.room.roomType}</span>
              </div>
              {user.bedNumber && (
                <div className="flex justify-between py-2">
                  <span style={{ color: 'var(--color-text-muted)' }}>Bed Number</span>
                  <span className="font-semibold">{user.bedNumber}</span>
                </div>
              )}
            </div>
          </div>

          <div className="glass p-6">
            <h2 className="font-bold mb-4">Hostel Info</h2>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Hostel</span>
                <span className="font-semibold">{user.hostel?.name}</span>
              </div>
              <div className="flex justify-between py-2 border-b" style={{ borderColor: 'var(--color-border)' }}>
                <span style={{ color: 'var(--color-text-muted)' }}>Status</span>
                <span className={`badge ${user.status === "ACTIVE" ? "badge-success" : "badge-info"}`}>{user.status}</span>
              </div>
              <div className="flex justify-between py-2">
                <span style={{ color: 'var(--color-text-muted)' }}>Member Since</span>
                <span className="font-semibold">—</span>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="glass p-16 text-center">
          <p className="text-5xl mb-4">🏠</p>
          <h3 className="text-lg font-bold mb-2">No Room Assigned Yet</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Your room hasn&apos;t been assigned yet. Please contact your hostel admin.
          </p>
        </div>
      )}
    </div>
  );
}
