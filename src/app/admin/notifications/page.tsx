"use client";

import React from "react";
import { useNotifications } from "@/context/NotificationContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Bell, BellOff, CheckCircle2, Circle } from "lucide-react";

export default function AdminNotificationsPage() {
  const { notifications, markAsRead, markAllAsRead } = useNotifications();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
            <Bell className="w-6 h-6 text-primary" /> Notifications
          </h1>
          <p className="text-sm text-muted-foreground">All your notification history</p>
        </div>
        <Button variant="outline" size="sm" onClick={markAllAsRead} className="gap-2 shrink-0">
          <CheckCircle2 className="w-4 h-4" /> Mark All Read
        </Button>
      </div>

      {notifications.length === 0 ? (
        <Card className="border-dashed bg-transparent border-border mt-8">
          <CardContent className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <BellOff className="w-16 h-16 mb-4 text-primary opacity-20" />
            <h3 className="text-xl font-bold mb-2 text-foreground">No notifications yet</h3>
            <p className="text-sm">You&apos;re all caught up!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3 mt-6">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`overflow-hidden transition-all cursor-pointer hover:shadow-md border-border ${
                n.read 
                  ? "bg-background shadow-sm" 
                  : "bg-primary/5 shadow-sm"
              }`}
              onClick={() => {
                markAsRead(n.id);
                if (n.link) window.location.href = n.link;
              }}
            >
              <CardContent className="p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    {n.read ? (
                      <Circle className="w-2.5 h-2.5 text-muted-foreground/30 fill-muted-foreground/30" />
                    ) : (
                      <Circle className="w-2.5 h-2.5 text-primary fill-primary animate-pulse" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 mb-1">
                      <p className={`font-semibold text-sm truncate ${n.read ? "text-foreground/80" : "text-foreground"}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {new Date(n.createdAt).toLocaleString(undefined, { 
                          month: 'short', 
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    <p className={`text-sm leading-relaxed ${n.read ? "text-muted-foreground" : "text-foreground/90"}`}>
                      {n.message}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
