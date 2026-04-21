"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

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

  const getRoomClass = (room: Room) => {
    if (room.occupied >= room.capacity) return "room-full";
    if (room.occupied > 0) return "room-partial";
    return "room-empty";
  };

  const getStatusEmoji = (room: Room) => {
    if (room.occupied >= room.capacity) return "🔴";
    if (room.occupied > 0) return "🟡";
    return "🟢";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">🏢 Room Grid</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Airplane seating view — click a room for details</p>
        </div>
        <div className="flex items-center gap-4">
          <button 
            className="btn btn-primary"
            onClick={() => setIsCreateModalOpen(true)}
          >
            <span>+ Add Room</span>
          </button>
          <div className="flex items-center gap-2 text-xs">
            <span>🟢 Empty</span>
            <span>🟡 Partial</span>
            <span>🔴 Full</span>
          </div>
          <select
            className="input"
            style={{ width: 'auto' }}
            value={filterFloor === "all" ? "all" : filterFloor}
            onChange={(e) => setFilterFloor(e.target.value === "all" ? "all" : Number(e.target.value))}
          >
            <option value="all">All Floors</option>
            {floors.map((f) => (
              <option key={f} value={f}>Floor {f}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Room Grid */}
      {floors.filter((f) => filterFloor === "all" || f === filterFloor).map((floor) => (
        <div key={floor} className="glass p-5">
          <h3 className="font-bold text-sm mb-4" style={{ color: 'var(--color-text-muted)' }}>
            Floor {floor}
          </h3>
          <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-2">
            {filteredRooms
              .filter((r) => r.floor === floor)
              .map((room) => (
                <button
                  key={room.id}
                  className={`${getRoomClass(room)} p-3 rounded-lg border cursor-pointer transition-all hover:scale-105 text-center`}
                  onClick={() => setSelectedRoom(room)}
                  title={`Room ${room.number} - ${room.roomType} (${room.occupied}/${room.capacity})`}
                >
                  <div className="text-xs font-bold">{room.number}</div>
                  <div className="text-lg">{getStatusEmoji(room)}</div>
                  <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                    {room.occupied}/{room.capacity}
                  </div>
                </button>
              ))}
          </div>
        </div>
      ))}

      {/* Room Detail Modal */}
      {selectedRoom && (
        <div className="modal-overlay" onClick={() => setSelectedRoom(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold">Room {selectedRoom.number}</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    Floor {selectedRoom.floor} • {selectedRoom.roomType}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    className="btn btn-secondary btn-sm"
                    style={{ color: 'var(--color-danger)', fontSize: '11px', padding: '4px 8px' }}
                    onClick={() => handleDeleteRoom(selectedRoom.id, selectedRoom.number)}
                  >
                    Delete Room
                  </button>
                  <button onClick={() => setSelectedRoom(null)} className="text-2xl" style={{ color: 'var(--color-text-muted)' }}>×</button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3 mb-6">
                <div className="glass p-3 text-center">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Capacity</p>
                  <p className="text-lg font-bold">{selectedRoom.capacity}</p>
                </div>
                <div className="glass p-3 text-center">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Occupied</p>
                  <p className="text-lg font-bold">{selectedRoom.occupied}</p>
                </div>
                <div className="glass p-3 text-center">
                  <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Available</p>
                  <p className="text-lg font-bold">{selectedRoom.capacity - selectedRoom.occupied}</p>
                </div>
              </div>

              <h3 className="font-bold text-sm mb-3">👥 Occupants</h3>
              {selectedRoom.occupants.length === 0 ? (
                <p className="text-sm py-4 text-center" style={{ color: 'var(--color-text-muted)' }}>No occupants</p>
              ) : (
                <div className="space-y-2">
                  {selectedRoom.occupants.map((o) => (
                    <div 
                      key={o.id} 
                      className="glass p-3 flex items-center justify-between cursor-pointer hover:bg-white/5 transition-colors"
                      onClick={() => {
                        setSelectedStudent(o);
                        setIsStudentModalOpen(true);
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gradient-aurora)' }}>
                          {o.profileImage ? (
                            <img src={o.profileImage} alt={o.name} className="w-full h-full object-cover rounded-lg" />
                          ) : (
                            o.name.charAt(0)
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium">{o.name}</p>
                          <p className="text-xs" style={{ color: 'var(--color-text-muted)' }}>{o.email}</p>
                        </div>
                      </div>
                      <span className={`badge ${o.status === "ACTIVE" ? "badge-success" : o.status === "ON_LEAVE" ? "badge-info" : "badge-warning"}`}>
                        {o.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Room Modal */}
      {isCreateModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateModalOpen(false)}>
          <div className="modal-content max-w-sm" onClick={(e) => e.stopPropagation()}>
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold">Add New Room</h2>
                <button onClick={() => setIsCreateModalOpen(false)} className="text-2xl" style={{ color: 'var(--color-text-muted)' }}>×</button>
              </div>

              <form onSubmit={handleCreateRoom} className="space-y-4">
                {formError && (
                  <div className="p-3 rounded-lg text-xs font-medium" style={{ background: 'rgba(239,68,68,0.1)', color: 'var(--color-danger)' }}>
                    {formError}
                  </div>
                )}

                <div>
                  <label className="input-label">Room Number</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="e.g., 101"
                    value={newRoom.number}
                    onChange={(e) => setNewRoom({...newRoom, number: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Floor</label>
                  <input 
                    type="number" 
                    className="input" 
                    placeholder="e.g., 1"
                    min="1"
                    value={newRoom.floor}
                    onChange={(e) => setNewRoom({...newRoom, floor: e.target.value})}
                    required
                  />
                </div>

                <div>
                  <label className="input-label">Room Type</label>
                  <select 
                    className="input"
                    value={newRoom.roomType}
                    onChange={(e) => {
                      const type = e.target.value;
                      const cap = type === "Single" ? "1" : type === "Double Sharing" ? "2" : "3";
                      setNewRoom({...newRoom, roomType: type, capacity: cap});
                    }}
                  >
                    <option value="Single">Single</option>
                    <option value="Double Sharing">Double Sharing</option>
                    <option value="Triple Sharing">Triple Sharing</option>
                  </select>
                </div>

                <div>
                  <label className="input-label">Capacity (Auto-set)</label>
                  <input 
                    type="number" 
                    className="input" 
                    value={newRoom.capacity}
                    disabled
                  />
                </div>

                <div className="pt-2">
                  <button 
                    type="submit" 
                    className="btn btn-primary w-full"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating..." : "Create Room"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>

      {/* Student Detail Modal */}
      {isStudentModalOpen && selectedStudent && (
        <div className="modal-overlay" style={{ zIndex: 1100 }} onClick={() => setIsStudentModalOpen(false)}>
          <div className="modal-content glass p-0 max-w-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
            {/* Modal Header */}
            <div className="p-6 pb-0 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-2xl" style={{ background: 'var(--gradient-aurora)' }}>
                  {selectedStudent.profileImage ? (
                    <img src={selectedStudent.profileImage} alt={selectedStudent.name} className="w-full h-full object-cover rounded-2xl" />
                  ) : (
                    selectedStudent.name.charAt(0)
                  )}
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{selectedStudent.name}</h2>
                  <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>{selectedStudent.email}</p>
                </div>
              </div>
              <button 
                className="btn btn-secondary p-2 min-w-0 leading-none hover:bg-white/10" 
                onClick={() => setIsStudentModalOpen(false)}
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Phone Number</label>
                    <p className="font-medium">{selectedStudent.phone || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Aadhar Number</label>
                    <p className="font-medium">{selectedStudent.aadharNumber || "Not provided"}</p>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">College ID</label>
                    <p className="font-medium">{selectedStudent.collegeId || "Not provided"}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Room Details</label>
                    {selectedRoom ? (
                      <div className="glass p-3 rounded-lg border border-white/5">
                        <p className="font-bold text-sm">Room {selectedRoom.number}</p>
                        <p className="text-xs text-muted">Floor {selectedRoom.floor} • {selectedRoom.roomType}</p>
                        <p className="text-[10px] mt-1 text-muted">Bed Number: {selectedStudent.bedNumber}</p>
                      </div>
                    ) : (
                      <p className="font-medium text-amber-500">Unassigned</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Account Status</label>
                    <span className={`badge ${selectedStudent.status === "ACTIVE" ? "badge-success" : selectedStudent.status === "ON_LEAVE" ? "badge-info" : "badge-warning"}`}>
                      {selectedStudent.status}
                    </span>
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-wider mb-1 block text-muted">Joined Date</label>
                    <p className="font-medium">{new Date(selectedStudent.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-6 bg-white/5 flex justify-end gap-3">
              <button className="btn btn-secondary" onClick={() => setIsStudentModalOpen(false)}>Close</button>
              <button 
                className="btn btn-primary" 
                style={{ background: 'var(--color-danger)' }}
                disabled={processingId === selectedStudent.id}
                onClick={() => {
                  handleStudentCheckout(selectedStudent.id, selectedStudent.name).then(() => {
                    setIsStudentModalOpen(false);
                    setSelectedRoom(null);
                  });
                }}
              >
                {processingId === selectedStudent.id ? "..." : "Checkout Student"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
