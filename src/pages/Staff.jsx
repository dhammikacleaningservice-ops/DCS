import React, { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Plus, Phone, Building2, User, Search, Upload, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import StaffProfileCard from "../components/staff/StaffProfileCard";

const emptyCleaner = {
  photo_url: "", name: "", role: "Cleaner", phone: "", assigned_branch: "", status: "Active",
};

export default function Staff() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyCleaner);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const queryClient = useQueryClient();

  const { data: cleaners = [] } = useQuery({
    queryKey: ["cleaners"],
    queryFn: () => base44.entities.Cleaner.list(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => base44.entities.Branch.list(),
  });

  const { data: salaryLogs = [] } = useQuery({
    queryKey: ["salaryLogs"],
    queryFn: () => base44.entities.SalaryLog.list(),
  });

  const createMut = useMutation({
    mutationFn: (data) => base44.entities.Cleaner.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cleaners"] }); closeDialog(); },
  });

  const updateMut = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Cleaner.update(id, data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cleaners"] }); closeDialog(); },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Cleaner.delete(id),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["cleaners"] }); setSelectedStaff(null); },
  });

  const openCreate = () => { setEditing(null); setForm(emptyCleaner); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); setForm(emptyCleaner); setIsDragging(false); };

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setForm({ ...form, photo_url: e.target.result });
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleSave = () => {
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  const filtered = cleaners.filter(
    (c) => c.name?.toLowerCase().includes(searchTerm.toLowerCase()) || c.assigned_branch?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <PageHeader
        title="Staff Directory"
        subtitle={`${cleaners.length} team members`}
        action={
          <Button onClick={openCreate} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full px-5 gap-2 shadow-lg shadow-emerald-500/30">
            <Plus className="h-4 w-4" /> Add Staff
          </Button>
        }
      />

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          placeholder="Search by name or branch..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 rounded-full border-slate-200"
        />
      </div>

      {/* Profile Card */}
      <AnimatePresence>
        {selectedStaff && (
          <StaffProfileCard
            staff={selectedStaff}
            salaryLogs={salaryLogs.filter((s) => s.staff_name === selectedStaff.name)}
            onClose={() => setSelectedStaff(null)}
            onEdit={() => openEdit(selectedStaff)}
            onDelete={() => deleteMut.mutate(selectedStaff.id)}
          />
        )}
      </AnimatePresence>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((c, idx) => (
            <motion.div
              key={c.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: idx * 0.04 }}
              onClick={() => setSelectedStaff(c)}
              className="cursor-pointer group rounded-2xl border border-slate-200 bg-white p-4 hover:shadow-md hover:border-teal-200 transition-all duration-200"
            >
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center overflow-hidden flex-shrink-0">
                  {c.photo_url ? (
                    <img src={c.photo_url} alt={c.name} className="h-full w-full object-cover rounded-xl" />
                  ) : (
                    <User className="h-5 w-5 text-emerald-500" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800 truncate">{c.name}</p>
                  <p className="text-xs text-slate-400">{c.role}</p>
                </div>
                <StatusBadge status={c.status} />
              </div>
              <div className="mt-3 flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><Phone className="h-3 w-3" />{c.phone || "—"}</span>
                <span className="flex items-center gap-1"><Building2 className="h-3 w-3" />{c.assigned_branch || "—"}</span>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-slate-400">
          <User className="h-10 w-10 mx-auto mb-3 text-slate-300" />
          <p className="text-sm">No staff members found</p>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Staff" : "Add New Staff"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {/* Photo Upload Area */}
            <div className="grid gap-2">
              <Label>Staff Photo</Label>
              <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-xl p-4 cursor-pointer transition-all ${
                  isDragging
                    ? 'border-emerald-500 bg-emerald-50'
                    : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
                }`}
              >
                {form.photo_url ? (
                  <div className="relative group">
                    <img
                      src={form.photo_url}
                      alt="Preview"
                      className="w-full h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setForm({ ...form, photo_url: '' });
                      }}
                      className="absolute top-2 right-2 p-1.5 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 py-6">
                    <Upload className={`h-8 w-8 ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`} />
                    <div className="text-center">
                      <p className="text-sm font-medium text-slate-700">
                        {isDragging ? 'Drop image here' : 'Click or drag to upload'}
                      </p>
                      <p className="text-xs text-slate-400 mt-1">PNG, JPG up to 5MB</p>
                    </div>
                  </div>
                )}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => handleImageUpload(e.target.files[0])}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Full Name</Label>
              <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Kamal Perera" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Role</Label>
                <Select value={form.role} onValueChange={(v) => setForm({ ...form, role: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Cleaner">Cleaner</SelectItem>
                    <SelectItem value="Assistant">Assistant</SelectItem>
                    <SelectItem value="Supervisor">Supervisor</SelectItem>
                    <SelectItem value="Manager">Manager</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Phone</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="07X XXX XXXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Assigned Branch</Label>
                <Select value={form.assigned_branch} onValueChange={(v) => setForm({ ...form, assigned_branch: v })}>
                  <SelectTrigger className="bg-white">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <SelectItem key={b.id} value={b.branch_name}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span>{b.branch_name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No branches available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="On Leave">On Leave</SelectItem>
                    <SelectItem value="Resigned">Resigned</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="rounded-full">Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full shadow-lg" disabled={!form.name}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}