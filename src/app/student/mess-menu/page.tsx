"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEALS = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
const MEAL_ICONS: Record<string, string> = { BREAKFAST: "🌅", LUNCH: "☀️", SNACKS: "🍪", DINNER: "🌙" };

interface Menu {
  id: string;
  day: string;
  mealType: string;
  items: string[];
  avgRating: number;
  totalRatings: number;
}

export default function StudentMessMenuPage() {
  const { token } = useAuth();
  const [menus, setMenus] = useState<Menu[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(DAYS[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1]);
  const [ratingMenuId, setRatingMenuId] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const fetchMenus = () => {
    if (!token) return;
    fetch("/api/mess", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setMenus(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchMenus(); }, [token]);

  const handleRate = async () => {
    if (!ratingMenuId || rating === 0) return;
    try {
      await fetch("/api/mess/rate", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ menuId: ratingMenuId, rating, comment }),
      });
      setRatingMenuId(null);
      setRating(0);
      setComment("");
      fetchMenus();
    } catch (err) { console.error(err); }
  };

  const dayMenus = menus.filter((m) => m.day === selectedDay);

  if (loading) {
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin" style={{ borderColor: 'var(--color-primary)', borderTopColor: 'transparent' }}></div></div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">🍽️ Mess Menu</h1>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {DAYS.map((day) => (
          <button
            key={day}
            className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap ${selectedDay === day ? "text-white" : ""}`}
            style={selectedDay === day ? { background: 'var(--gradient-primary)' } : { background: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
            onClick={() => setSelectedDay(day)}
          >
            {day.slice(0, 3)}
          </button>
        ))}
      </div>

      {/* Meals for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {MEALS.map((meal) => {
          const menu = dayMenus.find((m) => m.mealType === meal);
          return (
            <div key={meal} className="glass p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-bold flex items-center gap-2">
                  <span className="text-2xl">{MEAL_ICONS[meal]}</span>
                  {meal}
                </h3>
                {menu && menu.avgRating > 0 && (
                  <span className="text-sm" style={{ color: 'var(--color-warning)' }}>
                    ⭐ {menu.avgRating.toFixed(1)} ({menu.totalRatings})
                  </span>
                )}
              </div>

              {menu ? (
                <>
                  <ul className="space-y-1 mb-4">
                    {menu.items.map((item, i) => (
                      <li key={i} className="text-sm flex items-center gap-2">
                        <span style={{ color: 'var(--color-primary)' }}>•</span> {item}
                      </li>
                    ))}
                  </ul>

                  {ratingMenuId === menu.id ? (
                    <div className="glass p-3 animate-fade-in">
                      <div className="star-rating mb-2">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <button key={s} onClick={() => setRating(s)} style={{ color: s <= rating ? '#f59e0b' : 'var(--color-text-muted)' }}>★</button>
                        ))}
                      </div>
                      <input className="input mb-2" placeholder="Comment (optional)" value={comment} onChange={(e) => setComment(e.target.value)} />
                      <div className="flex gap-2">
                        <button className="btn btn-primary btn-sm" onClick={handleRate}>Submit</button>
                        <button className="btn btn-secondary btn-sm" onClick={() => setRatingMenuId(null)}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <button className="btn btn-secondary btn-sm" onClick={() => setRatingMenuId(menu.id)}>⭐ Rate This Meal</button>
                  )}
                </>
              ) : (
                <p className="text-sm py-4" style={{ color: 'var(--color-text-muted)' }}>Menu not set yet</p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
