"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquareWarning, Plus, CheckCircle2, Clock, AlertCircle, XCircle, MessageSquare } from "lucide-react";

interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: string | null;
  priority: string;
  status: string;
  response: string | null;
  createdAt: string;
}

const STATUS_BADGES: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode }> = {
  OPEN: { variant: "secondary", icon: <AlertCircle className="w-3 h-3 mr-1" /> }, 
  IN_PROGRESS: { variant: "default", icon: <Clock className="w-3 h-3 mr-1" /> }, 
  RESOLVED: { variant: "default", icon: <CheckCircle2 className="w-3 h-3 mr-1" /> }, 
  CLOSED: { variant: "outline", icon: <XCircle className="w-3 h-3 mr-1" /> },
};

export default function StudentComplaintsPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [priority, setPriority] = useState("MEDIUM");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fetchComplaints = () => {
    if (!token) return;
    fetch("/api/complaints", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setComplaints(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, [token]);

  const handleSubmit = async () => {
    if (!subject || !description) { setError("Subject and description required"); return; }
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ subject, description, category, priority }),
      });
      const data = await res.json();
      if (data.success) { setShowForm(false); setSubject(""); setDescription(""); fetchComplaints(); }
      else setError(data.error);
    } catch { setError("Failed to submit"); }
    finally { setSubmitting(false); }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div></div>;
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <MessageSquareWarning className="w-6 h-6 text-primary" /> Complaints
        </h1>
        {!showForm && (
          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Raise Complaint
          </Button>
        )}
      </div>

      {showForm && (
        <Card className="border-border shadow-sm animate-in slide-in-from-top-4 duration-300">
          <CardHeader>
            <CardTitle>New Complaint</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-100">{error}</div>}
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Brief description of the issue" />
            </div>
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea rows={4} value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detailed description..." className="resize-none" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Maintenance">Maintenance</SelectItem>
                    <SelectItem value="Cleanliness">Cleanliness</SelectItem>
                    <SelectItem value="Food">Food</SelectItem>
                    <SelectItem value="Security">Security</SelectItem>
                    <SelectItem value="Noise">Noise</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={setPriority}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low</SelectItem>
                    <SelectItem value="MEDIUM">Medium</SelectItem>
                    <SelectItem value="HIGH">High</SelectItem>
                    <SelectItem value="URGENT">Urgent</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <Button onClick={handleSubmit} disabled={submitting}>
                {submitting ? "Submitting..." : "Submit Complaint"}
              </Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {complaints.length === 0 ? (
        <Card className="border-dashed bg-transparent border-border">
          <CardContent className="p-12 text-center text-muted-foreground flex flex-col items-center">
            <MessageSquareWarning className="w-12 h-12 mb-3 opacity-20" />
            <p>No complaints yet</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {complaints.map((c) => {
            const statusConfig = STATUS_BADGES[c.status] || { variant: "outline", icon: null };
            return (
              <Card key={c.id} className="shadow-sm border-border overflow-hidden">
                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                    <div>
                      <h3 className="font-semibold text-foreground text-lg leading-tight mb-1">{c.subject}</h3>
                      <p className="text-xs text-muted-foreground flex items-center gap-2">
                        {c.category && <span className="bg-muted px-2 py-0.5 rounded-full">{c.category}</span>}
                        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                      </p>
                    </div>
                    <Badge variant={statusConfig.variant} className={c.status === "RESOLVED" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                      {statusConfig.icon}
                      {c.status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="text-sm text-foreground/80 mb-4 bg-muted/30 p-3 rounded-lg leading-relaxed">{c.description}</p>
                  
                  {c.response && (
                    <div className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                      <MessageSquare className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-semibold text-emerald-600 uppercase tracking-wider mb-1">Admin Response</p>
                        <p className="text-sm text-emerald-900 leading-relaxed">{c.response}</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
