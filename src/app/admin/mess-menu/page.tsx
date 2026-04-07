"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEALS = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

interface Menu {
  id: string;
  day: string;
  mealType: string;
  items: string[];
  avgRating: number;
  totalRatings: number;
}

export default function AdminMessMenuPage() {
  const { token } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [editDay, setEditDay] = useState(DAYS[0]);
  const [editMeal, setEditMeal] = useState(MEALS[0]);
  const [editItems, setEditItems] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchMenus = () => {
    if (!token) return;
    fetch("/api/mess", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setMenus(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, [token]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const items = editItems.split("\n").map((i) => i.trim()).filter(Boolean);
      await fetch("/api/mess", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ day: editDay, mealType: editMeal, items }),
      });
      setEditItems("");
      fetchMenus();
    } catch (err) { console.error(err); }
    finally { setSaving(false); }
  };

  const getMenu = (day: string, meal: string) => menus.find((m) => m.day === day && m.mealType === meal);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🍽️ Mess Menu Management</h1>

      {/* Add/Edit Form */}
      <div className="glass p-5">
        <h2 className="font-bold mb-4">Add / Update Menu</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="input-label">Day</label>
            <select className="input" value={editDay} onChange={(e) => setEditDay(e.target.value)}>
              {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Meal</label>
            <select className="input" value={editMeal} onChange={(e) => setEditMeal(e.target.value)}>
              {MEALS.map((m) => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="input-label">Items (one per line)</label>
            <textarea className="input" rows={3} value={editItems} onChange={(e) => setEditItems(e.target.value)} placeholder="Rice&#10;Dal&#10;Paneer" style={{ resize: 'vertical' }} />
          </div>
        </div>
        <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
          {saving ? "Saving..." : "💾 Save Menu"}
        </button>
      </div>

      {/* Weekly Menu View */}
      <div className="glass overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th>Day</th>
              {MEALS.map((m) => <th key={m}>{m}</th>)}
            </tr>
          </thead>
          <tbody>
            {DAYS.map((day) => (
              <tr key={day}>
                <td className="font-semibold text-sm">{day}</td>
                {MEALS.map((meal) => {
                  const menu = getMenu(day, meal);
                  return (
                    <td key={meal} className="text-sm">
                      {menu ? (
                        <div>
                          <p>{menu.items.join(", ")}</p>
                          {menu.totalRatings > 0 && (
                            <p className="text-xs mt-1" style={{ color: 'var(--color-warning)' }}>
                              ⭐ {menu.avgRating.toFixed(1)} ({menu.totalRatings})
                            </p>
                          )}
                        </div>
                      ) : (
                        <span style={{ color: 'var(--color-text-muted)' }}>—</span>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
