"use client";

import React, { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { UtensilsCrossed, Save, Star, Coffee, Sun, Cookie, Moon, Calendar, ListPlus } from "lucide-react";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];
const MEALS = ["BREAKFAST", "LUNCH", "SNACKS", "DINNER"];

const MEAL_ICONS: Record<string, React.ReactNode> = { 
  BREAKFAST: <Coffee className="w-4 h-4 text-orange-500" />, 
  LUNCH: <Sun className="w-4 h-4 text-amber-500" />, 
  SNACKS: <Cookie className="w-4 h-4 text-amber-700" />, 
  DINNER: <Moon className="w-4 h-4 text-indigo-500" /> 
};

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
    if (!editItems.trim()) return;
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
          <UtensilsCrossed className="w-6 h-6 text-primary" /> Mess Menu Management
        </h1>
        <p className="text-sm text-muted-foreground">Configure the weekly meal plan for the hostel</p>
      </div>

      {/* Add/Edit Form */}
      <Card className="border-border shadow-sm">
        <CardHeader className="bg-muted/30 border-b border-border pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <ListPlus className="w-5 h-5 text-primary" /> Add / Update Menu
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="day" className="flex items-center gap-1.5 text-muted-foreground uppercase text-xs tracking-wider">
                <Calendar className="w-3.5 h-3.5" /> Day
              </Label>
              <Select value={editDay} onValueChange={setEditDay}>
                <SelectTrigger id="day" className="bg-background">
                  <SelectValue placeholder="Select day" />
                </SelectTrigger>
                <SelectContent>
                  {DAYS.map((d) => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-3 space-y-2">
              <Label htmlFor="meal" className="flex items-center gap-1.5 text-muted-foreground uppercase text-xs tracking-wider">
                <UtensilsCrossed className="w-3.5 h-3.5" /> Meal
              </Label>
              <Select value={editMeal} onValueChange={setEditMeal}>
                <SelectTrigger id="meal" className="bg-background">
                  <SelectValue placeholder="Select meal" />
                </SelectTrigger>
                <SelectContent>
                  {MEALS.map((m) => (
                    <SelectItem key={m} value={m}>
                      <span className="flex items-center gap-2">
                        {MEAL_ICONS[m]} {m}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="md:col-span-6 space-y-3">
              <Label htmlFor="items" className="flex items-center gap-1.5 text-muted-foreground uppercase text-xs tracking-wider">
                <ListPlus className="w-3.5 h-3.5" /> Items (one per line)
              </Label>
              <Textarea 
                id="items"
                rows={4} 
                value={editItems} 
                onChange={(e) => setEditItems(e.target.value)} 
                placeholder="E.g.&#10;Rice&#10;Dal Tadka&#10;Paneer Butter Masala" 
                className="resize-y bg-background font-medium" 
              />
              <Button 
                className="w-full gap-2 bg-primary hover:bg-primary/90" 
                onClick={handleSave} 
                disabled={saving || !editItems.trim()}
              >
                {saving ? "Saving..." : <><Save className="w-4 h-4" /> Save Menu Settings</>}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Menu View */}
      <Card className="border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/50">
              <TableRow>
                <TableHead className="w-[120px] font-semibold">Day</TableHead>
                {MEALS.map((m) => (
                  <TableHead key={m} className="font-semibold whitespace-nowrap min-w-[200px]">
                    <span className="flex items-center gap-2">
                      {MEAL_ICONS[m]} {m}
                    </span>
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {DAYS.map((day) => (
                <TableRow key={day}>
                  <TableCell className="font-medium text-foreground bg-muted/10 border-r border-border">
                    {day.substring(0, 3)}
                  </TableCell>
                  {MEALS.map((meal) => {
                    const menu = getMenu(day, meal);
                    return (
                      <TableCell key={meal} className="align-top">
                        {menu ? (
                          <div className="space-y-2">
                            <ul className="text-sm text-foreground/90 leading-relaxed list-disc list-inside">
                              {menu.items.map((item, idx) => (
                                <li key={idx} className="truncate" title={item}>{item}</li>
                              ))}
                            </ul>
                            {menu.totalRatings > 0 && (
                              <div className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 px-2 py-0.5 rounded text-xs font-semibold border border-amber-100">
                                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                                {menu.avgRating.toFixed(1)} <span className="text-amber-700/60 font-normal ml-0.5">({menu.totalRatings})</span>
                              </div>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground italic text-sm">Not set</span>
                        )}
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  );
}
