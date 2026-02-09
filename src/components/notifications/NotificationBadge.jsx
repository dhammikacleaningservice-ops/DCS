import React from "react";
import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Bell } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function NotificationBadge({ onClick, className = "" }) {
  const { data: notifications = [] } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => apiClient.entities.Notification.filter({ is_read: false }, "-created_date"),
    refetchInterval: 30000, // Poll every 30 seconds
  });

  const unreadCount = notifications.length;

  return (
    <button
      onClick={onClick}
      className={`relative p-2 rounded-lg hover:bg-white/5 transition-colors ${className}`}
    >
      <Bell className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
      <AnimatePresence>
        {unreadCount > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 rounded-full flex items-center justify-center"
          >
            <span className="text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  );
}