import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Plus, Pencil, Trash2, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import PageHeader from "../components/ui/PageHeader";
import StatusBadge from "../components/ui/StatusBadge";
import DataTable from "../components/ui/DataTable";

const emptyComplaint = {
  date: new Date().toISOString().split("T")[0],
  branch: "", complaint_type: "Service Quality", description: "", priority: "Medium", status: "Open",
};

export default function Complaints() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(emptyComplaint);
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints"],
    queryFn: () => apiClient.entities.Complaint.list("-created_date"),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.entities.Branch.list(),
  });

  const createMut = useMutation({
    mutationFn: async (data) => {
      const complaint = await apiClient.entities.Complaint.create(data);
      
      // Trigger notification for High or Critical priority complaints
      if (data.priority === "High" || data.priority === "Critical") {
        await apiClient.entities.Notification.create({
          title: `${data.priority} Priority Complaint`,
          message: `New ${data.priority.toLowerCase()} priority complaint logged at ${data.branch}: ${data.description}`,
          type: "complaint",
          priority: data.priority.toLowerCase(),
          related_id: complaint.id,
          related_entity: "complaint",
          is_read: false,
        });
      }
      
      return complaint;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      closeDialog(); 
    },
  });

  const updateMut = useMutation({
    mutationFn: async ({ id, data }) => {
      const updated = await apiClient.entities.Complaint.update(id, data);
      
      // Trigger notification if priority changed to High or Critical
      if (data.priority === "High" || data.priority === "Critical") {
        await apiClient.entities.Notification.create({
          title: `${data.priority} Priority Complaint Updated`,
          message: `Complaint at ${data.branch} updated to ${data.priority.toLowerCase()} priority: ${data.description}`,
          type: "complaint",
          priority: data.priority.toLowerCase(),
          related_id: id,
          related_entity: "complaint",
          is_read: false,
        });
      }
      
      return updated;
    },
    onSuccess: () => { 
      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      closeDialog(); 
    },
  });

  const deleteMut = useMutation({
    mutationFn: (id) => apiClient.entities.Complaint.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["complaints"] }),
  });

  const openCreate = () => { setEditing(null); setForm(emptyComplaint); setDialogOpen(true); };
  const openEdit = (c) => { setEditing(c); setForm({ ...c }); setDialogOpen(true); };
  const closeDialog = () => { setDialogOpen(false); setEditing(null); };

  const handleSave = () => {
    if (editing) updateMut.mutate({ id: editing.id, data: form });
    else createMut.mutate(form);
  };

  const filtered = filter === "all" ? complaints : complaints.filter((c) => c.status === filter);

  const columns = [
    { key: "date", label: "Date" },
    { key: "branch", label: "Branch" },
    { key: "complaint_type", label: "Type" },
    { key: "description", label: "Description" },
    { key: "priority", label: "Priority" },
    { key: "status", label: "Status" },
    { key: "actions", label: "" },
  ];

  const renderCell = (key, value, row) => {
    if (key === "status") return <StatusBadge status={value} />;
    if (key === "priority") return <StatusBadge status={value} />;
    if (key === "description") return <span className="line-clamp-1 max-w-[200px] text-slate-500">{value}</span>;
    if (key === "actions") {
      return (
        <div className="flex items-center gap-1 justify-end">
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
        title="Complaints"
        subtitle={`${complaints.length} total • ${complaints.filter((c) => c.status === "Open").length} open`}
        action={
          <Button onClick={openCreate} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full px-5 gap-2 shadow-lg shadow-emerald-500/30">
            <Plus className="h-4 w-4" /> Log Complaint
          </Button>
        }
      />

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {["all", "Open", "In Progress", "Resolved", "Closed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === s
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600"
            }`}
          >
            {s === "all" ? "All" : s}
          </button>
        ))}
      </div>

      <DataTable columns={columns} data={filtered} renderCell={renderCell} />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Complaint" : "Log New Complaint"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Date</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label>Branch <span className="text-red-500">*</span></Label>
                <Select value={form.branch} onValueChange={(v) => setForm({ ...form, branch: v })}>
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
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Type</Label>
                <Select value={form.complaint_type} onValueChange={(v) => setForm({ ...form, complaint_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Service Quality", "Staff Behavior", "Equipment", "Schedule", "Safety", "Other"].map((t) => (
                      <SelectItem key={t} value={t}>{t}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-2">
                <Label>Priority</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Low", "Medium", "High", "Critical"].map((p) => (
                      <SelectItem key={p} value={p}>{p}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Description</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Describe the issue..." className="h-24" />
            </div>
            {editing && (
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {["Open", "In Progress", "Resolved", "Closed"].map((s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog} className="rounded-full">Cancel</Button>
            <Button onClick={handleSave} className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full shadow-lg" disabled={!form.branch || !form.description}>
              {editing ? "Update" : "Submit"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}