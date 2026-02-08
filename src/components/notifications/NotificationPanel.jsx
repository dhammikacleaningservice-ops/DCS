import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { motion, AnimatePresence } from "framer-motion";
import { X, AlertTriangle, Building2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

const typeIcons = {
  complaint: AlertTriangle,
  branch_status: Building2,
  payment: Check,
  staff: Check,
  system: Check,
};

const priorityColors = {
  critical: "bg-red-50 border-red-200 text-red-800",
  high: "bg-orange-50 border-orange-200 text-orange-800",
  medium: "bg-amber-50 border-amber-200 text-amber-800",
  low: "bg-slate-50 border-slate-200 text-slate-600",
};

export default function NotificationPanel({ isOpen, onClose }) {
  const queryClient = useQueryClient();

  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => base44.entities.Notification.list("-created_date", 50),
    enabled: isOpen,
  });

  const markAsReadMut = useMutation({
    mutationFn: (id) => base44.entities.Notification.update(id, { is_read: true }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const deleteMut = useMutation({
    mutationFn: (id) => base44.entities.Notification.delete(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  const markAllAsReadMut = useMutation({
    mutationFn: async () => {
      const unread = notifications.filter((n) => !n.is_read);
      await Promise.all(unread.map((n) => base44.entities.Notification.update(n.id, { is_read: true })));
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["notifications"] }),
  });

  if (!isOpen) return null;

  const unreadNotifications = notifications.filter((n) => !n.is_read);

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/20 backdrop-blur-sm z-40"
      />

      {/* Panel */}
      <motion.div
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 flex flex-col"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h3 className="font-bold text-slate-800">Notifications</h3>
            <p className="text-xs text-slate-500">{unreadNotifications.length} unread</p>
          </div>
          <div className="flex items-center gap-1">
            {unreadNotifications.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => markAllAsReadMut.mutate()}
                className="text-xs text-emerald-600 hover:text-emerald-700"
              >
                Mark all read
              </Button>
            )}
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-slate-200 transition-colors">
              <X className="h-4 w-4 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Notifications List */}
        <div className="flex-1 overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-400 px-6">
              <AlertTriangle className="h-12 w-12 mb-3 text-slate-300" />
              <p className="text-sm text-center">No notifications yet</p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              <AnimatePresence>
                {notifications.map((notif) => {
                  const Icon = typeIcons[notif.type] || AlertTriangle;
                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      className={`p-4 transition-colors ${
                        notif.is_read ? "bg-white" : "bg-emerald-50/30"
                      } hover:bg-slate-50 group relative`}
                    >
                      {/* Unread indicator */}
                      {!notif.is_read && (
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-emerald-500" />
                      )}

                      <div className="flex gap-3">
                        <div
                          className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${
                            priorityColors[notif.priority] || priorityColors.medium
                          }`}
                        >
                          <Icon className="h-4 w-4" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-slate-800 line-clamp-1">{notif.title}</h4>
                            {notif.priority === "critical" && (
                              <span className="text-[10px] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1.5 py-0.5 rounded">
                                Critical
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-600 mt-1 line-clamp-2">{notif.message}</p>
                          <p className="text-[10px] text-slate-400 mt-2">
                            {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true })}
                          </p>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!notif.is_read && (
                          <button
                            onClick={() => markAsReadMut.mutate(notif.id)}
                            className="text-xs text-emerald-600 hover:text-emerald-700 font-medium px-2 py-1 rounded hover:bg-emerald-50"
                          >
                            Mark read
                          </button>
                        )}
                        <button
                          onClick={() => deleteMut.mutate(notif.id)}
                          className="text-xs text-slate-400 hover:text-red-500 font-medium px-2 py-1 rounded hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </motion.div>
    </>
  );
}