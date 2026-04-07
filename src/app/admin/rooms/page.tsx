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

  useEffect(() => {
    if (!token) return;
    fetch("/api/rooms", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setRooms(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [token]);

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
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold mb-1">🏢 Room Grid</h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Airplane seating view — click a room for details</p>
        </div>
        <div className="flex items-center gap-4">
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
                <button onClick={() => setSelectedRoom(null)} className="text-2xl" style={{ color: 'var(--color-text-muted)' }}>×</button>
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
                    <div key={o.id} className="glass p-3 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm" style={{ background: 'var(--gradient-aurora)' }}>
                          {o.name.charAt(0)}
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
    </div>
  );
}
