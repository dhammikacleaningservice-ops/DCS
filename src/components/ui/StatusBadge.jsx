import React from "react";

const statusStyles = {
  "Active": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Minor Issue": "bg-amber-50 text-amber-700 border-amber-200",
  "Critical": "bg-red-50 text-red-700 border-red-200",
  "Renovation": "bg-blue-50 text-blue-700 border-blue-200",
  "On Leave": "bg-amber-50 text-amber-700 border-amber-200",
  "Resigned": "bg-red-50 text-red-700 border-red-200",
  "Open": "bg-blue-50 text-blue-700 border-blue-200",
  "In Progress": "bg-amber-50 text-amber-700 border-amber-200",
  "Resolved": "bg-emerald-50 text-emerald-700 border-emerald-200",
  "Closed": "bg-slate-50 text-slate-500 border-slate-200",
  "Low": "bg-slate-50 text-slate-600 border-slate-200",
  "Medium": "bg-amber-50 text-amber-700 border-amber-200",
  "High": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function StatusBadge({ status }) {
  const style = statusStyles[status] || "bg-slate-100 text-slate-600 border-slate-200";
  
  return (
    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}