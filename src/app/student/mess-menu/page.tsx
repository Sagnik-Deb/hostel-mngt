"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UtensilsCrossed, Coffee, Sun, Cookie, Moon, Star, Check } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEALS = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];
const MEAL_ICONS: Record<string, React.ReactNode> = { 
  BREAKFAST: <Coffee className="w-6 h-6 text-orange-500" />, 
  LUNCH: <Sun className="w-6 h-6 text-yellow-500" />, 
  SNACKS: <Cookie className="w-6 h-6 text-amber-600" />, 
  DINNER: <Moon className="w-6 h-6 text-indigo-500" /> 
};

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
    return <div className="flex items-center justify-center py-20"><div className="w-10 h-10 border-4 border-t-transparent rounded-full animate-spin border-primary"></div></div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground">
          <UtensilsCrossed className="w-6 h-6 text-primary" /> Mess Menu
        </h1>
      </div>

      {/* Day Selector */}
      <div className="flex gap-2 overflow-x-auto pb-4 scrollbar-hide">
        {DAYS.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? "default" : "outline"}
            className={`rounded-full px-6 ${selectedDay === day ? "shadow-sm" : "text-muted-foreground"}`}
            onClick={() => setSelectedDay(day)}
          >
            {day.slice(0, 3)}
          </Button>
        ))}
      </div>

      {/* Meals for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {MEALS.map((meal) => {
          const menu = dayMenus.find((m) => m.mealType === meal);
          return (
            <Card key={meal} className="border-border shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <CardHeader className="bg-muted/30 border-b border-border pb-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-background shadow-sm flex items-center justify-center">
                      {MEAL_ICONS[meal]}
                    </div>
                    {meal}
                  </CardTitle>
                  {menu && menu.avgRating > 0 && (
                    <div className="flex items-center gap-1.5 bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-sm font-semibold border border-amber-100">
                      <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                      {menu.avgRating.toFixed(1)} <span className="text-amber-600/60 font-normal">({menu.totalRatings})</span>
                    </div>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6">
                {menu ? (
                  <>
                    <ul className="space-y-3 mb-6">
                      {menu.items.map((item, i) => (
                        <li key={i} className="text-sm flex items-center gap-3 text-foreground">
                          <Check className="w-4 h-4 text-emerald-500 shrink-0" /> 
                          <span className="leading-snug">{item}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="pt-4 border-t border-border">
                      {ratingMenuId === menu.id ? (
                        <div className="bg-muted/50 p-4 rounded-xl animate-in slide-in-from-top-2">
                          <div className="flex gap-1 mb-3">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <button 
                                key={s} 
                                onClick={() => setRating(s)} 
                                className="focus:outline-none transition-transform hover:scale-110"
                              >
                                <Star className={`w-6 h-6 ${s <= rating ? 'fill-amber-500 text-amber-500' : 'text-muted-foreground'}`} />
                              </button>
                            ))}
                          </div>
                          <Input 
                            className="mb-3 bg-background" 
                            placeholder="Add a comment (optional)..." 
                            value={comment} 
                            onChange={(e) => setComment(e.target.value)} 
                          />
                          <div className="flex gap-2">
                            <Button size="sm" onClick={handleRate} disabled={rating === 0}>Submit Rating</Button>
                            <Button size="sm" variant="outline" onClick={() => setRatingMenuId(null)}>Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        <Button variant="secondary" size="sm" className="w-full gap-2" onClick={() => setRatingMenuId(menu.id)}>
                          <Star className="w-4 h-4" /> Rate This Meal
                        </Button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-muted-foreground">
                    <UtensilsCrossed className="w-12 h-12 mb-3 opacity-20" />
                    <p className="text-sm">Menu not updated yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
