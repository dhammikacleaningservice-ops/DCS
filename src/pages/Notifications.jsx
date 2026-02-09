import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { AlertTriangle, Building2, Check, Trash2, Eye } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/ui/PageHeader";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  complaint: AlertTriangle,
  branch_status: Building2,
  payment: Check,
  staff: Check,
  system: Check,
};

const priorityColors = {
  critical: "bg-red-50 border-red-200",
  high: "bg-orange-50 border-orange-200",
  medium: "bg-amber-50 border-amber-200",
  low: "bg-slate-50 border-slate-200",
};

export default function Notifications() {
  const [filter, setFilter] = useState("all");
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.entities.Notification.list("-created_date"),
  });

  const markAsReadMut = useMutation({
    mutationFn: (id) => apiClient.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => apiClient.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsReadMut = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => apiClient.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const filtered =
    filter === "all"
      ? notifications
      : filter === "unread"
      ? notifications.filter((n) => !n.is_read)
      : notifications.filter((n) => n.priority === filter);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle={`${notifications.length} total • ${unreadCount} unread`}
        action={
          unreadCount > 0 && (
            <Button
              onClick={() => markAllAsReadMut.mutate()}
              disabled={markAllAsReadMut.isPending}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full px-5 gap-2 shadow-lg shadow-emerald-500/30"
            >
              <Check className="h-4 w-4" /> {markAllAsReadMut.isPending ? "Marking..." : "Mark All Read"}
            </Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {["all", "unread", "critical", "high", "medium"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition-all ${
              filter === f
                ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg shadow-emerald-500/30"
                : "bg-white text-slate-500 border border-slate-200 hover:border-emerald-200 hover:text-emerald-600"
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Notifications Grid */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto mb-3 text-slate-300" />
            <p className="text-slate-400">No notifications found</p>
          </div>
        ) : (
          filtered.map((notif, idx) => {
            const Icon = typeIcons[notif.type] || AlertTriangle;
            return (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.03 }}
                className={`rounded-2xl border p-4 transition-all hover:shadow-sm ${
                  notif.is_read ? "bg-white border-slate-200" : "bg-teal-50/30 border-teal-200"
                } ${priorityColors[notif.priority]}`}
              >
                <div className="flex gap-4">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center flex-shrink-0 border ${
                      notif.priority === "critical"
                        ? "bg-red-100 border-red-200 text-red-600"
                        : notif.priority === "high"
                        ? "bg-orange-100 border-orange-200 text-orange-600"
                        : "bg-amber-100 border-amber-200 text-amber-600"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-slate-800">{notif.title}</h3>
                          {notif.priority === "critical" && (
                            <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                              Critical
                            </span>
                          )}
                          {!notif.is_read && (
                            <span className="h-2 w-2 bg-teal-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{notif.message}</p>
                        <p className="text-xs text-slate-400 mt-2">
                          {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true })}
                        </p>
                      </div>

                      <div className="flex items-center gap-1">
                        {!notif.is_read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => markAsReadMut.mutate(notif.id)}
                            disabled={markAsReadMut.isPending}
                            className="h-8 w-8 text-slate-400 hover:text-teal-600"
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => deleteMut.mutate(notif.id)}
                          disabled={deleteMut.isPending}
                          className="h-8 w-8 text-slate-400 hover:text-red-500"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </div>
  );
}