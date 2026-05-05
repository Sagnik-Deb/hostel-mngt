"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Building2, Plus, Trash2, Users, Phone, CreditCard, FileText, DoorOpen, LogOut, ArrowRightCircle, Clock, Mail } from "lucide-react";

interface Occupant {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  bedNumber: number;
  profileImage: string | null;
  aadharNumber: string | null;
  collegeId: string | null;
  createdAt: string;
}

interface Room {
  id: string;
  number: string;
  floor: number;
  capacity: number;
  occupied: number;
  roomType: string;
  occupants: Occupant[];
}

export default function RoomsPage() {
  const { token } = useAuth();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [filterFloor, setFilterFloor] = useState<number | "all">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newRoom, setNewRoom] = useState({
    number: "",
    floor: "",
    capacity: "3",
    roomType: "Triple Sharing"
  });
  const [formError, setFormError] = useState("");
  const [selectedStudent, setSelectedStudent] = useState<Occupant | null>(null);
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRooms = () => {
    if (!token) return;
    setLoading(true);
    fetch("/api/rooms", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setRooms(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRooms();
  }, [token]);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const response = await fetch("/api/rooms", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(newRoom)
      });

      const data = await response.json();
      if (data.success) {
        setIsCreateModalOpen(false);
        setNewRoom({ number: "", floor: "", capacity: "3", roomType: "Triple Sharing" });
        fetchRooms();
      } else {
        setFormError(data.error || "Failed to create room");
      }
    } catch (err) {
      setFormError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStudentCheckout = async (studentId: string, name: string) => {
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
        fetchRooms(); // Refresh the grid
      } else {
        alert(data.error || "Checkout failed");
      }
    } catch (err) {
      alert("An error occurred");
    } finally {
      setProcessingId(null);
    }
  };

  const handleDeleteRoom = async (roomId: string, number: string) => {
    if (!confirm(`Are you sure you want to delete Room ${number}? This action cannot be undone.`)) {
      return;
    }

    try {
      const resp = await fetch(`/api/rooms?roomId=${roomId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      const data = await resp.json();
      if (data.success) {
        alert(data.message);
        setSelectedRoom(null);
        fetchRooms();
      } else {
        alert(data.error || "Failed to delete room");
      }
    } catch (err) {
      alert("An error occurred");
    }
  };

  const floors = [...new Set(rooms.map((r) => r.floor))].sort();
  const filteredRooms = filterFloor === "all" ? rooms : rooms.filter((r) => r.floor === filterFloor);

  const getRoomColor = (room: Room) => {
    if (room.occupied >= room.capacity) return "bg-red-50 hover:bg-red-100 border-red-200 text-red-900";
    if (room.occupied > 0) return "bg-amber-50 hover:bg-amber-100 border-amber-200 text-amber-900";
    return "bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-900";
  };

  const getStatusEmoji = (room: Room) => {
    if (room.occupied >= room.capacity) return "🔴";
    if (room.occupied > 0) return "🟡";
    return "🟢";
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
            <Building2 className="w-6 h-6 text-primary" /> Room Grid
          </h1>
          <p className="text-sm text-muted-foreground">Airplane seating view — click a room for details</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-3 text-xs bg-muted/50 px-3 py-2 rounded-lg border border-border">
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Empty</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Partial</span>
            <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-red-500"></span> Full</span>
          </div>
          <Select 
            value={filterFloor === "all" ? "all" : filterFloor.toString()} 
            onValueChange={(v) => setFilterFloor(v === "all" ? "all" : Number(v))}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="All Floors" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Floors</SelectItem>
              {floors.map((f) => (
                <SelectItem key={f} value={f.toString()}>Floor {f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsCreateModalOpen(true)} className="gap-2">
            <Plus className="w-4 h-4" /> Add Room
          </Button>
        </div>
      </div>

      {/* Room Grid */}
      <div className="space-y-6">
        {floors.filter((f) => filterFloor === "all" || f === filterFloor).map((floor) => (
          <Card key={floor} className="border-border shadow-sm">
            <CardHeader className="pb-4 bg-muted/30 border-b border-border">
              <CardTitle className="text-lg text-muted-foreground">Floor {floor}</CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
                {filteredRooms
                  .filter((r) => r.floor === floor)
                  .map((room) => (
                    <button
                      key={room.id}
                      className={`p-3 rounded-xl border-2 transition-all hover:-translate-y-1 hover:shadow-md flex flex-col items-center justify-center gap-1 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${getRoomColor(room)}`}
                      onClick={() => setSelectedRoom(room)}
                      title={`Room ${room.number} - ${room.roomType} (${room.occupied}/${room.capacity})`}
                    >
                      <div className="text-xs font-bold tracking-tight">{room.number}</div>
                      <div className="text-lg drop-shadow-sm">{getStatusEmoji(room)}</div>
                      <div className="text-[10px] font-semibold opacity-70">
                        {room.occupied}/{room.capacity}
                      </div>
                    </button>
                  ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Room Detail Dialog */}
      <Dialog open={!!selectedRoom} onOpenChange={(open) => !open && setSelectedRoom(null)}>
        {selectedRoom && (
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-2xl font-bold">Room {selectedRoom.number}</DialogTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    Floor {selectedRoom.floor} • {selectedRoom.roomType}
                  </p>
                </div>
                <Button 
                  variant="destructive" 
                  size="sm"
                  className="gap-1.5 h-8 text-xs"
                  onClick={() => handleDeleteRoom(selectedRoom.id, selectedRoom.number)}
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </Button>
              </div>
            </DialogHeader>

            <div className="space-y-6 py-4">
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-muted/50 p-3 rounded-xl text-center border border-border">
                  <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">Capacity</p>
                  <p className="text-2xl font-bold text-foreground">{selectedRoom.capacity}</p>
                </div>
                <div className="bg-amber-50 p-3 rounded-xl text-center border border-amber-100">
                  <p className="text-xs text-amber-700 font-medium uppercase tracking-wider mb-1">Occupied</p>
                  <p className="text-2xl font-bold text-amber-600">{selectedRoom.occupied}</p>
                </div>
                <div className="bg-emerald-50 p-3 rounded-xl text-center border border-emerald-100">
                  <p className="text-xs text-emerald-700 font-medium uppercase tracking-wider mb-1">Available</p>
                  <p className="text-2xl font-bold text-emerald-600">{selectedRoom.capacity - selectedRoom.occupied}</p>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-foreground flex items-center gap-2 mb-3">
                  <Users className="w-4 h-4 text-primary" /> Occupants
                </h3>
                {selectedRoom.occupants.length === 0 ? (
                  <div className="bg-muted/30 border border-dashed border-border rounded-xl p-8 text-center">
                    <p className="text-sm text-muted-foreground">No occupants currently in this room.</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {selectedRoom.occupants.map((o) => (
                      <div 
                        key={o.id} 
                        className="bg-background border border-border p-3 rounded-xl flex items-center justify-between cursor-pointer hover:border-primary/50 hover:shadow-sm transition-all"
                        onClick={() => {
                          setSelectedStudent(o);
                          setIsStudentModalOpen(true);
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm shrink-0 overflow-hidden">
                            {o.profileImage ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={o.profileImage} alt={o.name} className="w-full h-full object-cover" />
                            ) : (
                              o.name.charAt(0).toUpperCase()
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-medium text-foreground">{o.name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[150px] sm:max-w-[200px]">{o.email}</p>
                          </div>
                        </div>
                        <Badge variant={o.status === "ACTIVE" ? "default" : o.status === "ON_LEAVE" ? "secondary" : "destructive"}
                               className={o.status === "ACTIVE" ? "bg-emerald-500 hover:bg-emerald-600 text-white" : ""}>
                          {o.status.replace(/_/g, " ")}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </DialogContent>
        )}
      </Dialog>

      {/* Add Room Dialog */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Room</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateRoom} className="space-y-4 py-4">
            {formError && (
              <div className="p-3 rounded-lg text-sm bg-red-50 text-red-600 border border-red-100 font-medium">
                {formError}
              </div>
            )}
            <div className="space-y-2">
              <Label>Room Number</Label>
              <Input 
                placeholder="e.g., 101"
                value={newRoom.number}
                onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Floor</Label>
              <Input 
                type="number" 
                placeholder="e.g., 1"
                min="1"
                value={newRoom.floor}
                onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Room Type</Label>
              <Select 
                value={newRoom.roomType}
                onValueChange={(type) => {
                  const cap = type === "Single" ? "1" : type === "Double Sharing" ? "2" : "3";
                  setNewRoom({...newRoom, roomType: type, capacity: cap});
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Single">Single</SelectItem>
                  <SelectItem value="Double Sharing">Double Sharing</SelectItem>
                  <SelectItem value="Triple Sharing">Triple Sharing</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Capacity (Auto-set)</Label>
              <Input type="number" value={newRoom.capacity} disabled className="bg-muted/50" />
            </div>
            <div className="pt-4 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateModalOpen(false)}>Cancel</Button>
              <Button type="submit" className="flex-1" disabled={isSubmitting}>
                {isSubmitting ? "Creating..." : "Create Room"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Student Detail Modal */}
      <Dialog open={isStudentModalOpen} onOpenChange={setIsStudentModalOpen}>
        {selectedStudent && (
          <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden" style={{ zIndex: 110 }}>
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
                    {selectedRoom ? (
                      <div className="bg-muted/30 p-3 rounded-xl border border-border/50">
                        <p className="font-semibold text-sm text-foreground">Room {selectedRoom.number}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">Floor {selectedRoom.floor} • {selectedRoom.roomType}</p>
                        <p className="text-[10px] font-medium mt-1.5 text-primary">Bed Number: {selectedStudent.bedNumber}</p>
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
              <Button variant="outline" onClick={() => setIsStudentModalOpen(false)}>Close</Button>
              <Button 
                variant="destructive"
                className="gap-2"
                disabled={processingId === selectedStudent.id}
                onClick={() => {
                  handleStudentCheckout(selectedStudent.id, selectedStudent.name).then(() => {
                    setIsStudentModalOpen(false);
                    setSelectedRoom(null);
                  });
                }}
              >
                {processingId === selectedStudent.id ? "Processing..." : <><LogOut className="w-4 h-4" /> Checkout Student</>}
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
