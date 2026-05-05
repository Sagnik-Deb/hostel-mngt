"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Users, Search, Building, Phone, Mail, FileText, CreditCard, DoorOpen, LogOut, ArrowRightCircle, Clock } from "lucide-react";

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
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
            <Users className="w-6 h-6 text-primary" /> Students
          </h1>
          <p className="text-sm text-muted-foreground">{students.length} active students</p>
        </div>
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-background shadow-sm" 
            placeholder="Search students by name or email..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[300px]">Student</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Room</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((s) => (
                <TableRow key={s.id}>
                  <TableCell>
                    <div 
                      className="flex items-center gap-3 cursor-pointer group"
                      onClick={() => {
                        setSelectedStudent(s);
                        setIsDetailModalOpen(true);
                      }}
                    >
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shrink-0 overflow-hidden group-hover:scale-105 transition-transform">
                        {s.profileImage ? (
                          /* eslint-disable-next-line @next/next/no-img-element */
                          <img src={s.profileImage} alt={s.name} className="w-full h-full object-cover" />
                        ) : (
                          s.name.charAt(0).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm text-foreground truncate group-hover:text-primary transition-colors">{s.name}</p>
                        <p className="text-xs text-muted-foreground truncate">{s.email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground/80">{s.phone || "—"}</TableCell>
                  <TableCell className="text-sm">
                    {s.room ? (
                      <span className="flex items-center gap-1.5 text-foreground">
                        <Building className="w-3.5 h-3.5 text-muted-foreground" />
                        {s.room.number} <span className="text-muted-foreground text-xs">({s.room.roomType})</span>
                      </span>
                    ) : (
                      <span className="text-muted-foreground italic text-xs">Unassigned</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.status === "ACTIVE" ? "default" : s.status === "ON_LEAVE" ? "secondary" : "destructive"} 
                           className={s.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100" : ""}>
                      {s.status.replace(/_/g, " ")}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                    {new Date(s.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 gap-1.5 h-8 px-3"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCheckout(s.id, s.name);
                      }}
                      disabled={processingId === s.id}
                    >
                      {processingId === s.id ? (
                        <span className="w-3 h-3 border-2 border-red-600 border-t-transparent rounded-full animate-spin shrink-0"></span>
                      ) : (
                        <LogOut className="w-3.5 h-3.5" />
                      )}
                      Checkout
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No students found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Student Detail Modal */}
      <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
        {selectedStudent && (
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
            <div className="bg-gradient-to-br from-indigo-50 to-purple-50 p-6 pb-8 border-b border-border">
              <div className="flex items-center gap-5">
                <div className="w-20 h-20 rounded-2xl flex items-center justify-center text-white font-bold text-3xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md shrink-0 overflow-hidden">
                  {selectedStudent.profileImage ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img src={selectedStudent.profileImage} alt={selectedStudent.name} className="w-full h-full object-cover" />
                  ) : (
                    selectedStudent.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-foreground">{selectedStudent.name}</h2>
                  <p className="text-sm font-medium text-muted-foreground flex items-center gap-1.5 mt-1">
                    <Mail className="w-3.5 h-3.5" /> {selectedStudent.email}
                  </p>
                </div>
              </div>
            </div>

            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5" /> Phone Number
                    </p>
                    <p className="font-medium text-foreground">{selectedStudent.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Aadhar Number
                    </p>
                    <p className="font-medium text-foreground">{selectedStudent.aadharNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <FileText className="w-3.5 h-3.5" /> College ID
                    </p>
                    <p className="font-medium text-foreground">{selectedStudent.collegeId || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-5">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <DoorOpen className="w-3.5 h-3.5" /> Room Details
                    </p>
                    {selectedStudent.room ? (
                      <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                        <p className="font-semibold text-sm text-foreground">Room {selectedStudent.room.number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Floor {selectedStudent.room.floor} • {selectedStudent.room.roomType}</p>
                      </div>
                    ) : (
                      <Badge variant="outline" className="text-amber-600 border-amber-200 bg-amber-50">Unassigned</Badge>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <ArrowRightCircle className="w-3.5 h-3.5" /> Account Status
                    </p>
                    <Badge variant={selectedStudent.status === "ACTIVE" ? "default" : selectedStudent.status === "ON_LEAVE" ? "secondary" : "destructive"}
                           className={selectedStudent.status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600" : ""}>
                      {selectedStudent.status}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5 flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5" /> Joined Date
                    </p>
                    <p className="font-medium text-foreground">{new Date(selectedStudent.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>
              </div>
            </div>

            <DialogFooter className="p-4 bg-muted/20 border-t border-border flex justify-end gap-3 sm:gap-3">
              <Button variant="outline" onClick={() => setIsDetailModalOpen(false)}>Close</Button>
              <Button 
                variant="destructive"
                className="gap-2"
                onClick={() => {
                  setIsDetailModalOpen(false);
                  handleCheckout(selectedStudent.id, selectedStudent.name);
                }}
              >
                <LogOut className="w-4 h-4" /> Checkout Student
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
