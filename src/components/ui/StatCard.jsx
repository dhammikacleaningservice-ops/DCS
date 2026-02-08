import React from "react";
import { motion } from "framer-motion";

export default function StatCard({ title, value, icon: Icon, color = "teal", subtitle }) {
  const colorMap = {
    teal: { bg: "bg-gradient-to-br from-emerald-50 to-teal-50", icon: "bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30", border: "border-emerald-200/50" },
    blue: { bg: "bg-gradient-to-br from-teal-50 to-cyan-50", icon: "bg-gradient-to-br from-teal-500 to-cyan-600 text-white shadow-lg shadow-teal-500/30", border: "border-teal-200/50" },
    amber: { bg: "bg-gradient-to-br from-amber-50 to-yellow-50", icon: "bg-gradient-to-br from-amber-500 to-yellow-600 text-white shadow-lg shadow-amber-500/30", border: "border-amber-200/50" },
    rose: { bg: "bg-gradient-to-br from-rose-50 to-pink-50", icon: "bg-gradient-to-br from-rose-500 to-pink-600 text-white shadow-lg shadow-rose-500/30", border: "border-rose-200/50" },
    violet: { bg: "bg-gradient-to-br from-emerald-50 to-green-50", icon: "bg-gradient-to-br from-emerald-600 to-green-700 text-white shadow-lg shadow-emerald-500/30", border: "border-emerald-200/50" },
  };

  const c = colorMap[color] || colorMap.teal;

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4 }}
      className={`relative overflow-hidden rounded-2xl border ${c.border} ${c.bg} p-5 md:p-6 shadow-lg backdrop-blur-sm`}
    >
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/40 to-transparent rounded-full blur-3xl"></div>
      <div className="relative flex items-start justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-500">{title}</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{value}</p>
          {subtitle && <p className="mt-1 text-xs font-medium text-slate-500">{subtitle}</p>}
        </div>
        <motion.div 
          whileHover={{ scale: 1.1, rotate: 5 }}
          transition={{ type: "spring", stiffness: 400, damping: 10 }}
          className={`rounded-xl p-2.5 ${c.icon}`}
        >
          <Icon className="h-5 w-5" />
        </motion.div>
      </div>
    </motion.div>
  );
}