import React from "react";

export default function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between mb-6 md:mb-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
      </div>
      {action && <div className="mt-3 sm:mt-0">{action}</div>}
    </div>
  );
}