"use client";
import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Globe, Images, UserCog, Wifi, Award, Plus, Trash2, Upload, Pencil, X, Check, CalendarDays } from "lucide-react";
import Image from "next/image";

type Tab = "images" | "about" | "administration" | "facilities" | "achievements";

interface GalleryImage { id: string; url: string; caption?: string; }
interface StaffMember { id: string; name: string; role: string; photoUrl?: string; }
interface Facility { id: string; name: string; description?: string; icon?: string; }
interface Achievement { id: string; title: string; description?: string; photoUrl?: string; date: string; }

export default function HostelOverviewAdmin() {
  const { token } = useAuth();
  const [activeTab, setActiveTab] = useState<Tab>("images");

  // --- Gallery ---
  const [images, setImages] = useState<GalleryImage[]>([]);
  const [imgFile, setImgFile] = useState<File | null>(null);
  const [imgCaption, setImgCaption] = useState("");
  const [imgLoading, setImgLoading] = useState(false);

  // --- About ---
  const [aboutUs, setAboutUs] = useState("");
  const [aboutLoading, setAboutLoading] = useState(false);
  const [aboutSaved, setAboutSaved] = useState(false);

  // --- Administration ---
  const [staff, setStaff] = useState<StaffMember[]>([]);
  const [staffForm, setStaffForm] = useState({ name: "", role: "" });
  const [staffPhoto, setStaffPhoto] = useState<File | null>(null);
  const [staffLoading, setStaffLoading] = useState(false);
  const [editStaff, setEditStaff] = useState<StaffMember | null>(null);

  // --- Facilities ---
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [facForm, setFacForm] = useState({ name: "", description: "" });
  const [facLoading, setFacLoading] = useState(false);
  const [editFac, setEditFac] = useState<Facility | null>(null);

  // --- Achievements ---
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [achForm, setAchForm] = useState({ title: "", description: "", date: "" });
  const [achPhoto, setAchPhoto] = useState<File | null>(null);
  const [achLoading, setAchLoading] = useState(false);
  const [editAch, setEditAch] = useState<Achievement | null>(null);

  const imgRef = useRef<HTMLInputElement>(null);
  const staffPhotoRef = useRef<HTMLInputElement>(null);
  const achPhotoRef = useRef<HTMLInputElement>(null);

  const headers = { Authorization: `Bearer ${token}` };

  // Fetch all data
  useEffect(() => {
    if (!token) return;
    fetch("/api/admin/hostel-overview/images", { headers }).then(r => r.json()).then(d => { if (d.success) setImages(d.data); });
    fetch("/api/admin/hostel-overview/administration", { headers }).then(r => r.json()).then(d => { if (d.success) setStaff(d.data); });
    fetch("/api/admin/hostel-overview/facilities", { headers }).then(r => r.json()).then(d => { if (d.success) setFacilities(d.data); });
    fetch("/api/admin/hostel-overview/achievements", { headers }).then(r => r.json()).then(d => { if (d.success) setAchievements(d.data); });
    fetch("/api/admin/dashboard", { headers }).then(r => r.json()).then(d => { if (d.success && d.data?.aboutUs) setAboutUs(d.data.aboutUs || ""); });
  }, [token]);

  // ── Gallery handlers ──
  async function uploadImage() {
    if (!imgFile) return;
    setImgLoading(true);
    const fd = new FormData();
    fd.append("file", imgFile);
    fd.append("caption", imgCaption);
    const res = await fetch("/api/admin/hostel-overview/images", { method: "POST", headers, body: fd });
    const d = await res.json();
    if (d.success) { setImages(p => [...p, d.data]); setImgFile(null); setImgCaption(""); }
    else alert(d.error);
    setImgLoading(false);
  }
  async function deleteImage(id: string) {
    await fetch(`/api/admin/hostel-overview/images?id=${id}`, { method: "DELETE", headers });
    setImages(p => p.filter(x => x.id !== id));
  }

  // ── About handler ──
  async function saveAbout() {
    setAboutLoading(true);
    const res = await fetch("/api/admin/hostel-overview/about", { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ aboutUs }) });
    const d = await res.json();
    if (d.success) setAboutSaved(true);
    else alert(d.error);
    setAboutLoading(false);
    setTimeout(() => setAboutSaved(false), 2000);
  }

  // ── Staff handlers ──
  async function addStaff() {
    if (!staffForm.name || !staffForm.role) return;
    setStaffLoading(true);
    const fd = new FormData();
    fd.append("name", staffForm.name);
    fd.append("role", staffForm.role);
    if (staffPhoto) fd.append("photo", staffPhoto);
    const res = await fetch("/api/admin/hostel-overview/administration", { method: "POST", headers, body: fd });
    const d = await res.json();
    if (d.success) { setStaff(p => [...p, d.data]); setStaffForm({ name: "", role: "" }); setStaffPhoto(null); }
    else alert(d.error);
    setStaffLoading(false);
  }
  async function updateStaff() {
    if (!editStaff) return;
    setStaffLoading(true);
    const fd = new FormData();
    fd.append("name", editStaff.name);
    fd.append("role", editStaff.role);
    if (staffPhoto) fd.append("photo", staffPhoto);
    const res = await fetch(`/api/admin/hostel-overview/administration?id=${editStaff.id}`, { method: "PATCH", headers, body: fd });
    const d = await res.json();
    if (d.success) { setStaff(p => p.map(s => s.id === editStaff.id ? d.data : s)); setEditStaff(null); setStaffPhoto(null); }
    else alert(d.error);
    setStaffLoading(false);
  }
  async function deleteStaff(id: string) {
    await fetch(`/api/admin/hostel-overview/administration?id=${id}`, { method: "DELETE", headers });
    setStaff(p => p.filter(x => x.id !== id));
  }

  // ── Facility handlers ──
  async function addFacility() {
    if (!facForm.name) return;
    setFacLoading(true);
    const res = await fetch("/api/admin/hostel-overview/facilities", { method: "POST", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(facForm) });
    const d = await res.json();
    if (d.success) { setFacilities(p => [...p, d.data]); setFacForm({ name: "", description: "" }); }
    else alert(d.error);
    setFacLoading(false);
  }
  async function updateFacility() {
    if (!editFac) return;
    setFacLoading(true);
    const res = await fetch(`/api/admin/hostel-overview/facilities?id=${editFac.id}`, { method: "PATCH", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify(editFac) });
    const d = await res.json();
    if (d.success) { setFacilities(p => p.map(f => f.id === editFac.id ? d.data : f)); setEditFac(null); }
    else alert(d.error);
    setFacLoading(false);
  }
  async function deleteFacility(id: string) {
    await fetch(`/api/admin/hostel-overview/facilities?id=${id}`, { method: "DELETE", headers });
    setFacilities(p => p.filter(x => x.id !== id));
  }

  // ── Achievement handlers ──
  async function addAchievement() {
    if (!achForm.title || !achForm.date) return;
    setAchLoading(true);
    const fd = new FormData();
    fd.append("title", achForm.title);
    fd.append("description", achForm.description);
    fd.append("date", achForm.date);
    if (achPhoto) fd.append("photo", achPhoto);
    const res = await fetch("/api/admin/hostel-overview/achievements", { method: "POST", headers, body: fd });
    const d = await res.json();
    if (d.success) { setAchievements(p => [d.data, ...p]); setAchForm({ title: "", description: "", date: "" }); setAchPhoto(null); }
    else alert(d.error);
    setAchLoading(false);
  }
  async function updateAchievement() {
    if (!editAch) return;
    setAchLoading(true);
    const fd = new FormData();
    fd.append("title", editAch.title);
    fd.append("description", editAch.description || "");
    fd.append("date", editAch.date);
    if (achPhoto) fd.append("photo", achPhoto);
    const res = await fetch(`/api/admin/hostel-overview/achievements?id=${editAch.id}`, { method: "PATCH", headers, body: fd });
    const d = await res.json();
    if (d.success) { setAchievements(p => p.map(a => a.id === editAch.id ? d.data : a)); setEditAch(null); setAchPhoto(null); }
    else alert(d.error);
    setAchLoading(false);
  }
  async function deleteAchievement(id: string) {
    await fetch(`/api/admin/hostel-overview/achievements?id=${id}`, { method: "DELETE", headers });
    setAchievements(p => p.filter(x => x.id !== id));
  }

  const tabs = [
    { key: "images" as Tab, label: "Gallery Images", icon: <Images className="w-4 h-4" /> },
    { key: "about" as Tab, label: "About Us", icon: <Globe className="w-4 h-4" /> },
    { key: "administration" as Tab, label: "Administration", icon: <UserCog className="w-4 h-4" /> },
    { key: "facilities" as Tab, label: "Facilities", icon: <Wifi className="w-4 h-4" /> },
    { key: "achievements" as Tab, label: "Achievements", icon: <Award className="w-4 h-4" /> },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2 text-foreground mb-1">
          <Globe className="w-6 h-6 text-primary" /> Hostel Overview
        </h1>
        <p className="text-sm text-muted-foreground">Manage your hostel's public-facing overview page</p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-border pb-4">
        {tabs.map(t => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === t.key ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
          >
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* ── GALLERY IMAGES ── */}
      {activeTab === "images" && (
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Upload className="w-4 h-4 text-primary" /> Upload Image</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div
                className="border-2 border-dashed border-border rounded-xl p-8 text-center cursor-pointer hover:border-primary/50 hover:bg-blue-50/30 transition-all"
                onClick={() => imgRef.current?.click()}
              >
                {imgFile ? (
                  <p className="text-sm font-medium text-foreground">{imgFile.name}</p>
                ) : (
                  <>
                    <Images className="w-10 h-10 text-muted-foreground mx-auto mb-2 opacity-40" />
                    <p className="text-sm text-muted-foreground">Click to select an image (JPG/PNG/WebP, max 5 MB)</p>
                  </>
                )}
              </div>
              <input ref={imgRef} type="file" accept="image/*" className="hidden" onChange={e => setImgFile(e.target.files?.[0] || null)} />
              <Input placeholder="Caption (optional)" value={imgCaption} onChange={e => setImgCaption(e.target.value)} />
              <Button onClick={uploadImage} disabled={!imgFile || imgLoading} className="w-full">
                {imgLoading ? "Uploading..." : "Upload to Gallery"}
              </Button>
            </CardContent>
          </Card>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {images.map(img => (
              <div key={img.id} className="relative group rounded-xl overflow-hidden border border-border aspect-video">
                <Image src={img.url} alt={img.caption || ""} fill className="object-cover" />
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="destructive" size="sm" onClick={() => deleteImage(img.id)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                {img.caption && <div className="absolute bottom-0 left-0 right-0 bg-black/60 text-white text-xs px-2 py-1 truncate">{img.caption}</div>}
              </div>
            ))}
            {images.length === 0 && <p className="col-span-4 text-center text-muted-foreground py-10">No images yet</p>}
          </div>
        </div>
      )}

      {/* ── ABOUT ── */}
      {activeTab === "about" && (
        <Card className="border-border">
          <CardHeader><CardTitle className="text-base">About Us Text</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Textarea rows={10} placeholder="Write about your hostel — history, culture, values…" value={aboutUs} onChange={e => setAboutUs(e.target.value)} className="resize-none" />
            <Button onClick={saveAbout} disabled={aboutLoading} className="gap-2">
              {aboutSaved ? <><Check className="w-4 h-4" /> Saved!</> : aboutLoading ? "Saving…" : "Save About Us"}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ── ADMINISTRATION ── */}
      {activeTab === "administration" && (
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> {editStaff ? "Edit Staff Member" : "Add Staff Member"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Input
                  placeholder="Full Name"
                  value={editStaff ? editStaff.name : staffForm.name}
                  onChange={e => editStaff ? setEditStaff({ ...editStaff, name: e.target.value }) : setStaffForm(p => ({ ...p, name: e.target.value }))}
                />
                <Input
                  placeholder="Role (e.g. Senior Warden, Warden, Prefect…)"
                  value={editStaff ? editStaff.role : staffForm.role}
                  onChange={e => editStaff ? setEditStaff({ ...editStaff, role: e.target.value }) : setStaffForm(p => ({ ...p, role: e.target.value }))}
                />
              </div>
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => staffPhotoRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" /> {staffPhoto ? staffPhoto.name : "Upload Photo"}
                </Button>
                {staffPhoto && <button onClick={() => setStaffPhoto(null)}><X className="w-4 h-4 text-muted-foreground" /></button>}
              </div>
              <input ref={staffPhotoRef} type="file" accept="image/*" className="hidden" onChange={e => setStaffPhoto(e.target.files?.[0] || null)} />
              <div className="flex gap-2">
                {editStaff && <Button variant="outline" onClick={() => { setEditStaff(null); setStaffPhoto(null); }}>Cancel</Button>}
                <Button onClick={editStaff ? updateStaff : addStaff} disabled={staffLoading}>
                  {staffLoading ? "Saving…" : editStaff ? "Update" : "Add Staff"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {staff.map(s => (
              <Card key={s.id} className="overflow-hidden border-border">
                <div className="aspect-square bg-blue-50 relative overflow-hidden">
                  {s.photoUrl ? <Image src={s.photoUrl} alt={s.name} fill className="object-cover" /> : <div className="absolute inset-0 flex items-center justify-center"><UserCog className="w-12 h-12 text-blue-200" /></div>}
                </div>
                <CardContent className="p-3 text-center">
                  <p className="font-semibold text-sm truncate">{s.name}</p>
                  <Badge variant="secondary" className="mt-1 text-xs">{s.role}</Badge>
                  <div className="flex gap-2 mt-3 justify-center">
                    <Button size="sm" variant="outline" onClick={() => { setEditStaff(s); setStaffPhoto(null); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteStaff(s.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {staff.length === 0 && <p className="col-span-4 text-center text-muted-foreground py-10">No staff added yet</p>}
          </div>
        </div>
      )}

      {/* ── FACILITIES ── */}
      {activeTab === "facilities" && (
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> {editFac ? "Edit Facility" : "Add Facility"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Facility name (e.g. Wi-Fi, Laundry, Gym…)"
                value={editFac ? editFac.name : facForm.name}
                onChange={e => editFac ? setEditFac({ ...editFac, name: e.target.value }) : setFacForm(p => ({ ...p, name: e.target.value }))}
              />
              <Textarea
                rows={3}
                placeholder="Description (optional)"
                value={editFac ? (editFac.description || "") : facForm.description}
                onChange={e => editFac ? setEditFac({ ...editFac, description: e.target.value }) : setFacForm(p => ({ ...p, description: e.target.value }))}
              />
              <div className="flex gap-2">
                {editFac && <Button variant="outline" onClick={() => setEditFac(null)}>Cancel</Button>}
                <Button onClick={editFac ? updateFacility : addFacility} disabled={facLoading}>
                  {facLoading ? "Saving…" : editFac ? "Update" : "Add Facility"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {facilities.map(f => (
              <Card key={f.id} className="border-border">
                <CardContent className="p-4 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center shrink-0"><Wifi className="w-5 h-5 text-blue-500" /></div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-foreground">{f.name}</p>
                    {f.description && <p className="text-sm text-muted-foreground mt-0.5">{f.description}</p>}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => setEditFac(f)}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteFacility(f.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {facilities.length === 0 && <p className="col-span-2 text-center text-muted-foreground py-10">No facilities added yet</p>}
          </div>
        </div>
      )}

      {/* ── ACHIEVEMENTS ── */}
      {activeTab === "achievements" && (
        <div className="space-y-6">
          <Card className="border-border">
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Plus className="w-4 h-4 text-primary" /> {editAch ? "Edit Achievement" : "Add Achievement"}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="Title"
                value={editAch ? editAch.title : achForm.title}
                onChange={e => editAch ? setEditAch({ ...editAch, title: e.target.value }) : setAchForm(p => ({ ...p, title: e.target.value }))}
              />
              <div className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={editAch ? editAch.date.slice(0, 10) : achForm.date}
                  onChange={e => editAch ? setEditAch({ ...editAch, date: e.target.value }) : setAchForm(p => ({ ...p, date: e.target.value }))}
                />
              </div>
              <Textarea
                rows={3}
                placeholder="Short description (optional)"
                value={editAch ? (editAch.description || "") : achForm.description}
                onChange={e => editAch ? setEditAch({ ...editAch, description: e.target.value }) : setAchForm(p => ({ ...p, description: e.target.value }))}
              />
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" onClick={() => achPhotoRef.current?.click()} className="gap-2">
                  <Upload className="w-4 h-4" /> {achPhoto ? achPhoto.name : "Upload Photo (optional)"}
                </Button>
                {achPhoto && <button onClick={() => setAchPhoto(null)}><X className="w-4 h-4 text-muted-foreground" /></button>}
              </div>
              <input ref={achPhotoRef} type="file" accept="image/*" className="hidden" onChange={e => setAchPhoto(e.target.files?.[0] || null)} />
              <div className="flex gap-2">
                {editAch && <Button variant="outline" onClick={() => { setEditAch(null); setAchPhoto(null); }}>Cancel</Button>}
                <Button onClick={editAch ? updateAchievement : addAchievement} disabled={achLoading}>
                  {achLoading ? "Saving…" : editAch ? "Update" : "Add Achievement"}
                </Button>
              </div>
            </CardContent>
          </Card>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {achievements.map(a => (
              <Card key={a.id} className="overflow-hidden border-border">
                {a.photoUrl && (
                  <div className="aspect-video relative bg-blue-50 overflow-hidden">
                    <Image src={a.photoUrl} alt={a.title} fill className="object-cover" />
                  </div>
                )}
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1"><CalendarDays className="w-3 h-3" />{new Date(a.date).toLocaleDateString("en-IN")}</p>
                  <p className="font-semibold text-foreground">{a.title}</p>
                  {a.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{a.description}</p>}
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="outline" onClick={() => { setEditAch(a); setAchPhoto(null); }}><Pencil className="w-3.5 h-3.5" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => deleteAchievement(a.id)}><Trash2 className="w-3.5 h-3.5" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
            {achievements.length === 0 && <p className="col-span-3 text-center text-muted-foreground py-10">No achievements added yet</p>}
          </div>
        </div>
      )}
    </div>
  );
}
