"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquareWarning, AlertCircle, Clock, CheckCircle2, XCircle, MessageSquare, MapPin, Search } from "lucide-react";

interface Complaint {
  id: string;
  subject: string;
  description: string;
  category: string | null;
  priority: string;
  status: string;
  response: string | null;
  createdAt: string;
  user: { id: string; name: string; email: string; room?: { number: string } };
}

const PRIORITY_CONFIG: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", className?: string }> = {
  LOW: { variant: "outline", className: "text-muted-foreground" },
  MEDIUM: { variant: "secondary", className: "bg-blue-50 text-blue-700 border-blue-200" },
  HIGH: { variant: "secondary", className: "bg-amber-50 text-amber-700 border-amber-200" },
  URGENT: { variant: "destructive" },
};

const STATUS_CONFIG: Record<string, { variant: "default" | "secondary" | "destructive" | "outline", icon: React.ReactNode, className?: string }> = {
  OPEN: { variant: "secondary", className: "bg-blue-100 text-blue-800 border-blue-200", icon: <AlertCircle className="w-3 h-3 mr-1.5" /> },
  IN_PROGRESS: { variant: "secondary", className: "bg-amber-100 text-amber-800 border-amber-200", icon: <Clock className="w-3 h-3 mr-1.5" /> },
  RESOLVED: { variant: "default", className: "bg-emerald-500 text-white", icon: <CheckCircle2 className="w-3 h-3 mr-1.5" /> },
  CLOSED: { variant: "outline", className: "text-muted-foreground", icon: <XCircle className="w-3 h-3 mr-1.5" /> },
};

export default function AdminComplaintsPage() {
  const { token } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [response, setResponse] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchComplaints = () => {
    if (!token) return;
    fetch("/api/complaints", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setComplaints(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchComplaints(); }, [token]);

  const handleUpdate = async (id: string, status: string) => {
    try {
      await fetch("/api/complaints", {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ complaintId: id, status, response }),
      });
      setResponse("");
      setSelectedId(null);
      fetchComplaints();
    } catch (err) { console.error(err); }
  };

  const filteredComplaints = complaints.filter((c) => 
    c.user.name.toLowerCase().includes(search.toLowerCase()) || 
    c.subject.toLowerCase().includes(search.toLowerCase())
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
            <MessageSquareWarning className="w-6 h-6 text-primary" /> Complaints
          </h1>
          <p className="text-sm text-muted-foreground">{complaints.length} total complaints</p>
        </div>
        <div className="relative w-full md:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input 
            className="pl-9 bg-background shadow-sm" 
            placeholder="Search by student or subject..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
          />
        </div>
      </div>

      {filteredComplaints.length === 0 ? (
        <Card className="border-dashed bg-transparent border-border">
          <CardContent className="p-16 text-center text-muted-foreground flex flex-col items-center justify-center">
            <CheckCircle2 className="w-16 h-16 mb-4 text-emerald-500 opacity-80" />
            <h3 className="text-xl font-bold mb-2 text-foreground">All caught up!</h3>
            <p className="text-sm max-w-sm mx-auto">There are no complaints matching your current filters.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => {
            const prioStyle = PRIORITY_CONFIG[c.priority] || { variant: "outline" };
            const statStyle = STATUS_CONFIG[c.status] || { variant: "outline", icon: null };
            
            return (
              <Card key={c.id} className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
                <CardContent className="p-0">
                  <div className="p-5 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                    <div className="flex items-start gap-4 flex-1 min-w-0">
                      <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shrink-0 mt-1">
                        {c.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1.5">
                          <h3 className="font-bold text-lg text-foreground truncate">{c.subject}</h3>
                          <Badge variant={prioStyle.variant} className={prioStyle.className}>{c.priority}</Badge>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground mb-3">
                          <span className="font-medium text-foreground">{c.user.name}</span>
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {c.user.room ? `Room ${c.user.room.number}` : "Unassigned"}</span>
                          <span>{new Date(c.createdAt).toLocaleDateString()}</span>
                          {c.category && <span className="bg-muted px-2 py-0.5 rounded-full">{c.category}</span>}
                        </div>
                        <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-3 rounded-lg border border-border/50">
                          {c.description}
                        </p>
                      </div>
                    </div>
                    
                    <div className="shrink-0 flex sm:flex-col items-center sm:items-end gap-2">
                      <Badge variant={statStyle.variant} className={`text-xs px-2.5 py-0.5 ${statStyle.className || ""}`}>
                        {statStyle.icon}
                        {c.status.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </div>

                  {c.response && (
                    <div className="px-5 pb-5">
                      <div className="bg-indigo-50/50 p-4 rounded-xl border border-indigo-100 flex gap-3">
                        <MessageSquare className="w-5 h-5 text-indigo-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wider mb-1">Admin Response</p>
                          <p className="text-sm text-indigo-900 leading-relaxed">{c.response}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {(c.status === "OPEN" || c.status === "IN_PROGRESS") && (
                    <div className="p-4 bg-muted/20 border-t border-border flex flex-col sm:flex-row gap-3">
                      {selectedId === c.id ? (
                        <div className="flex flex-col sm:flex-row gap-3 w-full animate-in fade-in zoom-in-95 duration-200">
                          <Input 
                            className="flex-1 bg-background" 
                            placeholder="Type your response here..." 
                            value={response} 
                            onChange={(e) => setResponse(e.target.value)} 
                            autoFocus
                          />
                          <div className="flex gap-2 shrink-0">
                            <Button 
                              size="sm"
                              className="bg-amber-500 hover:bg-amber-600 text-white gap-1.5" 
                              onClick={() => handleUpdate(c.id, "IN_PROGRESS")}
                            >
                              <Clock className="w-4 h-4" /> In Progress
                            </Button>
                            <Button 
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5" 
                              onClick={() => handleUpdate(c.id, "RESOLVED")}
                            >
                              <CheckCircle2 className="w-4 h-4" /> Resolve
                            </Button>
                            <Button variant="outline" size="sm" onClick={() => setSelectedId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          variant="secondary" 
                          size="sm"
                          className="w-full sm:w-auto gap-2" 
                          onClick={() => {
                            setSelectedId(c.id);
                            setResponse(c.response || "");
                          }}
                        >
                          <MessageSquare className="w-4 h-4" /> {c.response ? "Edit Response" : "Respond to Complaint"}
                        </Button>
                      )}
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
