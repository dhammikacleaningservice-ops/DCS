import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Plus, Pencil, Trash2, MapPin, Phone, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import DataTable from "../components/ui/DataTable";

const emptyBranch = {
  branch_name: "", manager: "", manager_phone: "", branch_contact: "", backup_contact: "", status: "Active", map_link: "",
};

export default function Branches() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyBranch);
  const queryClient = useQueryClient();

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.entities.Branch.list(),
  });

  const createMut = useMutation({
    mutationFn: (data) => apiClient.entities.Branch.create(data),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["branches"] }); closeDialog(); },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }) => {
      const updated = await apiClient.entities.Branch.update(id, data);
      
      // Trigger notification for Minor Issue or Critical status
      if (data.status === "Minor Issue" || data.status === "Critical") {
        await apiClient.entities.Notification.create({
          title: `Branch Status: ${data.status}`,
          message: `${data.branch_name} status changed to ${data.status}. ${data.status === "Critical" ? "Immediate attention required!" : "Please review the situation."}`,
          type: "branch_status",
          priority: data.status === "Critical" ? "critical" : "high",
          related_id: id,
          related_entity: "branch",
          is_read: false,
        });
      }
      
      return updated;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["branches"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      closeDialog(); 
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => apiClient.entities.Branch.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["branches"] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyBranch); setDialogOpen(true); };
  const openEdit = (b) => { setEditing(b); setForm({ ...b }); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); setForm(emptyBranch); };

  const handleSave = () => {
    if (editing) {
      updateMut.mutate({ id: editing.id, data: form });
    } else {
      createMut.mutate(form);
    }
  };

  const columns = [
    { key: "branch_name", label: "Branch Name" },
    { key: "manager", label: "Manager" },
    { key: "contacts", label: "Contact Details" },
    { key: "status", label: "Status" },
    { key: "actions", label: "" },
  ];

  const renderCell = (key, value, row) => {
    if (key === "status") return <StatusBadge status={value} />;
    if (key === "branch_name") return <span className="font-medium text-slate-800">{value}</span>;
    if (key === "contacts") {
      return (
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-3.5 w-3.5 text-emerald-500" />
            <span className="font-medium text-slate-700">{row.manager_phone || '—'}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />
            <span>{row.branch_contact || '—'}</span>
          </div>
        </div>
      );
    }
    if (key === "actions") {
      return (
        <div className="flex items-center gap-1 justify-end">
          {row.map_link && (
            <a 
              href={row.map_link} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors text-xs font-medium"
            >
              <MapPin className="h-3.5 w-3.5" />
              Maps
            </a>
          )}
          <button onClick={(e) => { e.stopPropagation(); openEdit(row); }}
            className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors">
            <Pencil className="h-4 w-4" />
          </button>
          <button onClick={(e) => { e.stopPropagation(); deleteMut.mutate(row.id); }}
            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      );
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Branches"
        subtitle={`${branches.length} locations managed`}
        action={
          <Button onClick={openCreate} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full px-5 gap-2 shadow-lg shadow-emerald-500/30">
            <Plus className="h-4 w-4" /> Add Branch
          </Button>
        }
      />

      <DataTable columns={columns} data={branches} renderCell={renderCell} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Branch" : "Add New Branch"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Branch Name</Label>
              <Input value={form.branch_name} onChange={(e) => setForm({ ...form, branch_name: e.target.value })} placeholder="e.g. Colombo Main Office" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Manager</Label>
                <Input value={form.manager} onChange={(e) => setForm({ ...form, manager: e.target.value })} placeholder="Manager name" />
              </div>
              <div className="grid gap-2">
                <Label>Manager Phone</Label>
                <Input value={form.manager_phone} onChange={(e) => setForm({ ...form, manager_phone: e.target.value })} placeholder="07X XXX XXXX" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Branch Contact</Label>
                <Input value={form.branch_contact} onChange={(e) => setForm({ ...form, branch_contact: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Backup Contact</Label>
                <Input value={form.backup_contact} onChange={(e) => setForm({ ...form, backup_contact: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Minor Issue">Minor Issue</SelectItem>
                    <SelectItem value="Critical">Critical</SelectItem>
                    <SelectItem value="Renovation">Renovation</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Map Link</Label>
                <Input value={form.map_link} onChange={(e) => setForm({ ...form, map_link: e.target.value })} placeholder="https://maps.google.com/..." />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="rounded-full">Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full shadow-lg" disabled={!form.branch_name}>
              {editing ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}