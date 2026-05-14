"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DoorOpen, CheckCircle, XCircle, Building, Clock, History, AlertCircle } from "lucide-react";

interface PendingRequest {
  id: string;
  userId: string;
  reason: string | null;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
    phone: string | null;
    room: { number: string } | null;
  };
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
  const [pendingRequests, setPendingRequests] = useState<PendingRequest[]>([]);
  const [pastStudents, setPastStudents] = useState<PastStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = () => {
    if (!token) return;
    fetch("/api/admin/checkout", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => {
        if (data.success) {
          setPendingRequests(data.data.pendingRequests || []);
          setPastStudents(data.data.pastStudents || []);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchData(); }, [token]);

  const handleAction = async (requestId: string, action: "approve" | "reject", name: string) => {
    if (action === "approve") {
      if (!confirm(`Approve permanent checkout for ${name}? This will DEACTIVATE their account and move them to past students. This CANNOT be undone.`)) return;
    } else {
      if (!confirm(`Reject checkout request for ${name}?`)) return;
    }

    setActionLoading(requestId);
    try {
      const res = await fetch("/api/admin/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ requestId, action }),
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
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
          <DoorOpen className="w-6 h-6 text-primary" /> Permanent Checkout
        </h1>
        <p className="text-sm text-muted-foreground">
          Manage permanent checkout requests from students
        </p>
      </div>

      <Tabs defaultValue="pending" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending" className="gap-2 relative">
            <AlertCircle className="w-4 h-4" /> 
            Pending Requests
            {pendingRequests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-[10px] text-white flex items-center justify-center rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="past" className="gap-2"><History className="w-4 h-4" /> Past Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px]">Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead>Requested</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingRequests.map((r) => (
                    <TableRow key={r.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-amber-500 to-orange-600 shadow-sm shrink-0">
                            {r.user.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{r.user.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{r.user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {r.user.room ? (
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            {r.user.room.number}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm max-w-[200px] truncate" title={r.reason || ""}>
                        {r.reason ? r.reason : <span className="text-muted-foreground italic text-xs">No reason provided</span>}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(r.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => handleAction(r.id, "reject", r.user.name)}
                            disabled={actionLoading === r.id}
                          >
                            <XCircle className="w-4 h-4 mr-1" /> Reject
                          </Button>
                          <Button
                            variant="default"
                            size="sm"
                            className="bg-emerald-500 hover:bg-emerald-600 text-white"
                            onClick={() => handleAction(r.id, "approve", r.user.name)}
                            disabled={actionLoading === r.id}
                          >
                            <CheckCircle className="w-4 h-4 mr-1" /> Approve
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pendingRequests.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                        No pending checkout requests.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="past">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px]">Student</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Last Room</TableHead>
                    <TableHead className="text-right">Checked Out</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pastStudents.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell className="font-medium text-foreground">{s.name}</TableCell>
                      <TableCell className="text-sm text-muted-foreground">{s.email}</TableCell>
                      <TableCell className="text-sm">
                        {s.roomNumber ? (
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            {s.roomNumber}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">—</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <span className="flex items-center justify-end gap-1.5 text-sm text-muted-foreground whitespace-nowrap">
                          <Clock className="w-3.5 h-3.5" />
                          {new Date(s.checkedOutAt).toLocaleDateString()}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                  {pastStudents.length === 0 && (
                     <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No past students found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
