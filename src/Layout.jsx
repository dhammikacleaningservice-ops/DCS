import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "./util";
import {
  LayoutDashboard,
  Building2,
  Users,
  AlertTriangle,
  Wallet,
  Menu,
  X,
  ChevronRight,
  Sparkles,
  TrendingUp,
  Moon,
  Sun,
} from "lucide-react";
import { AnimatePresence } from "framer-motion";
import { useTheme } from "./lib/ThemeContext";
import NotificationBadge from "./components/notifications/NotificationBadge";
import NotificationPanel from "./components/notifications/NotificationPanel";

const navItems = [
  { label: "Dashboard", page: "Dashboard", icon: LayoutDashboard },
  { label: "Branches", page: "Branches", icon: Building2 },
  { label: "Staff", page: "Staff", icon: Users },
  { label: "Complaints", page: "Complaints", icon: AlertTriangle },
  { label: "Payroll", page: "Payroll", icon: Wallet },
  { label: "Financials", page: "Financials", icon: TrendingUp },
];

export default function Layout({ children, currentPageName }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationPanelOpen, setNotificationPanelOpen] = useState(false);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 font-sans transition-colors duration-300">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap');
        * { font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #94a3b8; border-radius: 999px; }
        ::-webkit-scrollbar-thumb:hover { background: #64748b; }
        
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
      `}</style>

      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-teal-500 to-teal-700 flex items-center justify-center overflow-hidden">
            <img src="/favicon.png" alt="DCS Logo" className="h-7 w-7 object-contain" loading="lazy" />
          </div>
          <span className="font-bold text-slate-800 dark:text-slate-100 text-sm">Dhammika Cleaning Service</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5 text-slate-300" />
            ) : (
              <Moon className="h-5 w-5 text-slate-600" />
            )}
          </button>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {sidebarOpen ? <X className="h-5 w-5 dark:text-slate-300" /> : <Menu className="h-5 w-5 dark:text-slate-300" />}
          </button>
        </div>
      </div>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 border-r border-slate-800/50 shadow-2xl transform transition-transform duration-300 ease-in-out
          lg:translate-x-0 ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex flex-col h-full">
          {/* Accent glow at top */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50"></div>
          {/* Logo */}
          <div className="px-5 pt-6 pb-8">
            <div className="flex items-center gap-3">
              <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-emerald-400 via-teal-500 to-green-600 flex items-center justify-center shadow-lg shadow-emerald-500/30 overflow-hidden">
                <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-emerald-400 to-green-600 blur-md opacity-50"></div>
                <img src="/favicon.png" alt="DCS Logo" className="relative h-9 w-9 object-contain" loading="lazy" />
              </div>
              <div>
                <h1 className="text-white font-bold text-base leading-tight">Dhammika</h1>
                <p className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 text-xs font-semibold">Cleaning Service</p>
              </div>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex-1 px-3 space-y-1">
            {navItems.map((item) => {
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  onClick={() => setSidebarOpen(false)}
                  className={`group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-300
                    ${isActive
                      ? "bg-gradient-to-r from-emerald-500/20 to-teal-500/20 text-white shadow-lg shadow-emerald-500/10"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                    }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-sm"></div>
                  )}
                  <item.icon className={`relative h-4.5 w-4.5 ${isActive ? "text-emerald-400" : "text-slate-500 group-hover:text-slate-300"}`} />
                  <span className="relative">{item.label}</span>
                  {isActive && <ChevronRight className="ml-auto h-3.5 w-3.5 text-emerald-400 relative" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="px-5 py-4 border-t border-slate-800/50 flex items-center justify-between bg-gradient-to-r from-slate-900/50 to-slate-950/50">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-white/5 transition-colors group"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-slate-400 group-hover:text-yellow-400 transition-colors" />
              ) : (
                <Moon className="h-4 w-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
              )}
            </button>
            <p className="text-[10px] text-slate-600 uppercase tracking-widest">Business Mgmt</p>
            <NotificationBadge onClick={() => setNotificationPanelOpen(true)} />
          </div>
        </div>
      </aside>

      {/* Notification Panel */}
      <AnimatePresence>
        {notificationPanelOpen && (
          <NotificationPanel
            isOpen={notificationPanelOpen}
            onClose={() => setNotificationPanelOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
          {children}
        </div>
      </main>
    </div>
  );
}