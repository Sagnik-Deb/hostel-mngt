"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DoorOpen, LogOut, Building, Clock, UserCheck, History } from "lucide-react";

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
          Check out students who are permanently leaving the hostel
        </p>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="active" className="gap-2"><UserCheck className="w-4 h-4" /> Active Students</TabsTrigger>
          <TabsTrigger value="past" className="gap-2"><History className="w-4 h-4" /> Past Students</TabsTrigger>
        </TabsList>
        
        <TabsContent value="active">
          <Card className="border-border shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader className="bg-muted/50">
                  <TableRow>
                    <TableHead className="w-[300px]">Student</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((s) => (
                    <TableRow key={s.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-sm text-foreground truncate">{s.name}</p>
                            <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {s.room ? (
                          <span className="flex items-center gap-1.5 text-foreground">
                            <Building className="w-3.5 h-3.5 text-muted-foreground" />
                            {s.room.number}
                          </span>
                        ) : (
                          <span className="text-muted-foreground italic text-xs">Unassigned</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge variant={s.status === "ACTIVE" ? "default" : s.status === "ON_LEAVE" ? "secondary" : "destructive"} 
                               className={s.status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                          {s.status.replace(/_/g, " ")}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="destructive"
                          size="sm"
                          className="gap-1.5"
                          onClick={() => handleCheckout(s.id, s.name)}
                          disabled={actionLoading === s.id}
                        >
                          {actionLoading === s.id ? "Processing..." : <><LogOut className="w-4 h-4" /> Checkout</>}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {students.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No active students found.
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
