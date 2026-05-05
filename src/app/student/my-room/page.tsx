"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BedDouble, Building, Home, Hash, ArrowUpToLine, Key } from "lucide-react";

export default function MyRoomPage() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <BedDouble className="w-6 h-6 text-primary" /> My Room
        </h1>
      </div>

      {user?.room ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <Hash className="w-5 h-5 text-primary" /> Room Details
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Hash className="w-4 h-4" /> Room Number
                  </span>
                  <span className="font-semibold text-foreground text-lg">{user.room.number}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <ArrowUpToLine className="w-4 h-4" /> Floor
                  </span>
                  <span className="font-semibold text-foreground">{user.room.floor}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Key className="w-4 h-4" /> Room Type
                  </span>
                  <span className="font-semibold text-foreground">{user.room.roomType}</span>
                </div>
                {user.bedNumber && (
                  <div className="flex justify-between items-center py-2">
                    <span className="text-muted-foreground flex items-center gap-2">
                      <BedDouble className="w-4 h-4" /> Bed Number
                    </span>
                    <span className="font-semibold text-foreground">{user.bedNumber}</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border shadow-sm">
            <CardHeader className="bg-muted/30 border-b border-border">
              <CardTitle className="text-lg flex items-center gap-2">
                <Building className="w-5 h-5 text-primary" /> Hostel Info
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Home className="w-4 h-4" /> Hostel
                  </span>
                  <span className="font-semibold text-foreground">{user.hostel?.name}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border/50">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <BedDouble className="w-4 h-4" /> Status
                  </span>
                  <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"} className={user.status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                    {user.status}
                  </Badge>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-muted-foreground flex items-center gap-2">
                    <Building className="w-4 h-4" /> Member Since
                  </span>
                  <span className="font-semibold text-foreground">—</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <Card className="border-dashed bg-transparent border-border">
          <CardContent className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <Home className="w-16 h-16 mb-4 text-primary opacity-20" />
            <h3 className="text-xl font-bold mb-2 text-foreground">No Room Assigned Yet</h3>
            <p className="text-sm max-w-sm mx-auto">
              Your room hasn&apos;t been assigned yet. Please contact your hostel admin.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
