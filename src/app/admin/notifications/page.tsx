"use client";

import React from "react";
import { useNotifications } from "@/context/NotificationContext";

export default function AdminNotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold mb-1">🔔 Notifications</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>All notification history</p>
        </div>
        <button className="btn btn-secondary btn-sm" onClick={markAllAsRead}>Mark All Read</button>
      </div>

      {notifications.length === 0 ? (
        <div className="glass p-16 text-center">
          <p className="text-5xl mb-4">🔕</p>
          <p className="font-bold">No notifications</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className="glass p-4 cursor-pointer transition-all"
              style={{
                background: n.read ? 'var(--color-surface)' : 'var(--color-primary-light)',
                borderColor: n.read ? 'var(--color-border)' : 'var(--color-primary)',
              }}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) window.location.href = n.link;
              }}
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-semibold text-sm">{n.title}</p>
                  <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>{n.message}</p>
                </div>
                <p className="text-xs whitespace-nowrap ml-4" style={{ color: 'var(--color-text-muted)' }}>
                  {new Date(n.createdAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
