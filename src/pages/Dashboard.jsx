import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Link } from "react-router-dom";
import { createPageUrl } from "../util";
import { Building2, Users, AlertTriangle, Wallet, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import StatCard from "../components/ui/StatCard";
import StatusBadge from "../components/ui/StatusBadge";

export default function Dashboard() {
  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.entities.Branch.list(),
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ["cleaners"],
    queryFn: () => apiClient.entities.Cleaner.list(),
  });

  const { data: complaints = [] } = useQuery({
    queryKey: ["complaints"],
    queryFn: () => apiClient.entities.Complaint.list(),
  });

  const { data: salaryLogs = [] } = useQuery({
    queryKey: ["salaryLogs"],
    queryFn: () => apiClient.entities.SalaryLog.list("-created_date", 5),
  });

  const openComplaints = complaints.filter((c) => c.status === "Open" || c.status === "In Progress");
  const activeBranches = branches.filter((b) => b.status === "Active");
  const activeCleaners = cleaners.filter((c) => c.status === "Active");

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2"
      >
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-slate-800 tracking-tight">
            Good {new Date().getHours() < 12 ? "Morning" : new Date().getHours() < 18 ? "Afternoon" : "Evening"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">Here's your business overview</p>
        </div>
        <p className="text-xs text-slate-400 font-medium">
          {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        </p>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Active Branches"
          value={activeBranches.length}
          icon={Building2}
          color="teal"
          subtitle={`${branches.length} total`}
        />
        <StatCard
          title="Staff Members"
          value={activeCleaners.length}
          icon={Users}
          color="blue"
          subtitle={`${cleaners.length} total`}
        />
        <StatCard
          title="Open Complaints"
          value={openComplaints.length}
          icon={AlertTriangle}
          color={openComplaints.length > 0 ? "amber" : "teal"}
          subtitle={`${complaints.length} total`}
        />
        <StatCard
          title="Payments Made"
          value={salaryLogs.length}
          icon={Wallet}
          color="violet"
          subtitle="Recent period"
        />
      </div>

      {/* Quick Access Cards */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent Complaints */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          transition={{ delay: 0.15 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Complaints</h3>
            <Link
              to={createPageUrl("Complaints")}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {complaints.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No complaints yet</p>
            ) : (
              complaints.slice(0, 4).map((c) => (
                <div key={c.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{c.branch}</p>
                    <p className="text-xs text-slate-400 mt-0.5 line-clamp-1">{c.description}</p>
                  </div>
                  <StatusBadge status={c.status} />
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* Recent Payments */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          whileHover={{ y: -4, transition: { duration: 0.2 } }}
          transition={{ delay: 0.25 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-800">Recent Payments</h3>
            <Link
              to={createPageUrl("Payroll")}
              className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              View all <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="space-y-3">
            {salaryLogs.length === 0 ? (
              <p className="text-sm text-slate-400 py-4 text-center">No payments recorded</p>
            ) : (
              salaryLogs.slice(0, 4).map((s) => (
                <div key={s.id} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                  <div>
                    <p className="text-sm font-medium text-slate-700">{s.staff_name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">{s.month} • {s.role}</p>
                  </div>
                  <p className="text-sm font-semibold text-slate-800">
                    LKR {s.net_pay?.toLocaleString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>
      </div>

      {/* Branch Status */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -4, transition: { duration: 0.2 } }}
        transition={{ delay: 0.35 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-5 shadow-lg"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-800">Branch Status</h3>
          <Link
            to={createPageUrl("Branches")}
            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
          >
            Manage <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {branches.map((b) => (
            <div key={b.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <Building2 className="h-4 w-4 text-emerald-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">{b.branch_name}</p>
                  <p className="text-xs text-slate-400">{b.manager || "No manager"}</p>
                </div>
              </div>
              <StatusBadge status={b.status} />
            </div>
          ))}
          {branches.length === 0 && (
            <p className="col-span-full text-sm text-slate-400 text-center py-4">No branches added yet</p>
          )}
        </div>
      </motion.div>
    </div>
  );
}