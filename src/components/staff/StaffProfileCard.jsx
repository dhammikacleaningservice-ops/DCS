import React from "react";
import { motion } from "framer-motion";
import { X, Pencil, Trash2, Phone, Building2, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatusBadge from "../ui/StatusBadge";

export default function StaffProfileCard({ staff, salaryLogs, onClose, onEdit, onDelete }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-lg"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-teal-50 flex items-center justify-center overflow-hidden">
            {staff.photo_url ? (
              <img src={staff.photo_url} alt={staff.name} className="h-full w-full object-cover rounded-2xl" />
            ) : (
              <User className="h-8 w-8 text-emerald-400" />
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-800">{staff.name}</h3>
            <p className="text-sm text-slate-500">{staff.role}</p>
            <div className="flex items-center gap-3 mt-1.5">
              <StatusBadge status={staff.status} />
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" onClick={onEdit} className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <Pencil className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onDelete} className="h-8 w-8 text-slate-400 hover:text-red-500">
            <Trash2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-600">
            <X className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-4">
        <div className="rounded-xl bg-white border border-slate-100 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Phone</p>
          <p className="text-sm font-medium text-slate-700 mt-1 flex items-center gap-1.5">
            <Phone className="h-3.5 w-3.5 text-slate-400" />{staff.phone || "—"}
          </p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Branch</p>
          <p className="text-sm font-medium text-slate-700 mt-1 flex items-center gap-1.5">
            <Building2 className="h-3.5 w-3.5 text-slate-400" />{staff.assigned_branch || "—"}
          </p>
        </div>
        <div className="rounded-xl bg-white border border-slate-100 p-3">
          <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Payments</p>
          <p className="text-sm font-medium text-slate-700 mt-1">{salaryLogs.length} records</p>
        </div>
      </div>

      {salaryLogs.length > 0 && (
        <div>
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">Payment History</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {salaryLogs.map((s) => (
              <div key={s.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-white border border-slate-100 text-sm">
                <div>
                  <span className="font-medium text-slate-700">{s.month}</span>
                  <span className="text-slate-400 ml-2 text-xs">{s.date}</span>
                </div>
                <span className="font-semibold text-slate-800">LKR {s.net_pay?.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}