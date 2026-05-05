"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FileText, CheckCircle2, XCircle, Image as ImageIcon, Eye, PartyPopper } from "lucide-react";

interface Application {
  id: string;
  email: string;
  name: string;
  phone: string;
  aadharNumber: string;
  collegeIdUpload: string;
  allotmentCertificate: string | null;
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
  const [assignBed, setAssignBed] = useState("1");
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
      if (action === "approve" && assignRoom && assignRoom !== "none") {
        body.roomId = assignRoom;
        body.bedNumber = parseInt(assignBed, 10);
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
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
          <FileText className="w-6 h-6 text-primary" /> Student Applications
        </h1>
        <p className="text-sm text-muted-foreground">
          {apps.length} pending application{apps.length !== 1 ? "s" : ""}
        </p>
      </div>

      {apps.length === 0 ? (
        <Card className="border-dashed bg-transparent border-border">
          <CardContent className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <PartyPopper className="w-16 h-16 mb-4 text-emerald-500 opacity-80" />
            <h3 className="text-xl font-bold mb-2 text-foreground">All caught up!</h3>
            <p className="text-sm max-w-sm mx-auto">No pending applications to review right now.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-muted/50">
                <TableRow>
                  <TableHead className="w-[300px]">Student</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Documents</TableHead>
                  <TableHead>Applied</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {apps.map((app) => (
                  <TableRow key={app.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm bg-primary shadow-sm shrink-0">
                          {app.name.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-medium text-sm text-foreground truncate">{app.name}</p>
                          <p className="text-xs text-muted-foreground truncate">{app.email}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-foreground/80">{app.phone || "—"}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1.5">
                        {app.aadharNumber && <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 font-normal text-xs">Aadhar</Badge>}
                        {app.collegeIdUpload && <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 font-normal text-xs">College ID</Badge>}
                        {app.allotmentCertificate && <Badge variant="secondary" className="bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100 font-normal text-xs">Certificate</Badge>}
                        {!app.aadharNumber && !app.collegeIdUpload && !app.allotmentCertificate && <Badge variant="secondary" className="bg-amber-50 text-amber-600 border-amber-100 hover:bg-amber-100 font-normal text-xs">None</Badge>}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {new Date(app.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="secondary" className="gap-2" onClick={() => setSelectedApp(app)}>
                        <Eye className="w-4 h-4" /> Review
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedApp} onOpenChange={(open) => !open && setSelectedApp(null)}>
        {selectedApp && (
          <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <FileText className="w-5 h-5 text-primary" />
                Review Application
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Name</p>
                  <p className="font-semibold text-sm text-foreground">{selectedApp.name}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Email</p>
                  <p className="font-semibold text-sm text-foreground truncate" title={selectedApp.email}>{selectedApp.email}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Phone</p>
                  <p className="font-semibold text-sm text-foreground">{selectedApp.phone || "—"}</p>
                </div>
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Aadhar</p>
                  <p className="font-semibold text-sm text-foreground">{selectedApp.aadharNumber || "—"}</p>
                </div>
              </div>

              {selectedApp.roommatePreference && (
                <div className="space-y-1 bg-muted/30 p-3 rounded-lg border border-border/50">
                  <p className="text-xs font-medium text-muted-foreground uppercase">Roommate Preference</p>
                  <p className="text-sm text-foreground leading-relaxed">{selectedApp.roommatePreference}</p>
                </div>
              )}

              {selectedApp.allotmentCertificate && (
                <div className="space-y-3">
                  <Label className="text-xs font-medium text-muted-foreground uppercase">Allotment Certificate</Label>
                  <div className="rounded-xl overflow-hidden border border-border bg-muted/10 p-2 flex justify-center">
                    {selectedApp.allotmentCertificate.endsWith('.pdf') ? (
                      <a href={selectedApp.allotmentCertificate} target="_blank" rel="noopener noreferrer" className="w-full">
                        <Button variant="outline" className="w-full h-12 gap-2 bg-background hover:bg-muted/50">
                          <FileText className="w-5 h-5 text-blue-500" /> View PDF Certificate
                        </Button>
                      </a>
                    ) : (
                      <a href={selectedApp.allotmentCertificate} target="_blank" rel="noopener noreferrer" className="block max-h-48 overflow-hidden rounded-lg group relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={selectedApp.allotmentCertificate} 
                          alt="Allotment Certificate" 
                          className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                        />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-300">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </a>
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="assign-room">Assign Room (optional)</Label>
                  <Select value={assignRoom} onValueChange={setAssignRoom}>
                    <SelectTrigger id="assign-room">
                      <SelectValue placeholder="Don't assign yet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">Don&apos;t assign yet</SelectItem>
                      {rooms.map((r) => (
                        <SelectItem key={r.id} value={r.id}>
                          Room {r.number} ({r.roomType}) — {r.occupied}/{r.capacity} beds filled
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {assignRoom && assignRoom !== "none" && (
                  <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                    <Label htmlFor="assign-bed">Bed Number</Label>
                    <Input 
                      id="assign-bed" 
                      type="number" 
                      value={assignBed} 
                      onChange={(e) => setAssignBed(e.target.value)} 
                      min={1} 
                    />
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={() => handleAction(selectedApp.id, "approve")}
                  disabled={actionLoading}
                >
                  <CheckCircle2 className="w-4 h-4" /> Approve
                </Button>
                <Button
                  variant="destructive"
                  className="flex-1 gap-2"
                  onClick={() => handleAction(selectedApp.id, "reject")}
                  disabled={actionLoading}
                >
                  <XCircle className="w-4 h-4" /> Reject
                </Button>
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
