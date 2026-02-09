import React, { useMemo, useState, useEffect, lazy, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { TrendingUp, Users, Building2, Calendar, ArrowUpRight, ArrowDownRight, DollarSign, TrendingDown, ChevronDown, ChevronUp } from "lucide-react";
import { motion } from "framer-motion";
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import PageHeader from "../components/ui/PageHeader";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useMobileOptimizations } from "@/hooks/use-mobile-optimizations";

const COLORS = ["#059669", "#10b981", "#14b8a6", "#0d9488", "#047857", "#f59e0b"];

export default function Financials() {
  const { shouldReduceMotion } = useMobileOptimizations();
  const queryClient = useQueryClient();
  
  // Force fresh data on mount
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["salaryLogs"] });
    queryClient.invalidateQueries({ queryKey: ["branches"] });
    queryClient.invalidateQueries({ queryKey: ["cleaners"] });
  }, [queryClient]);
  // Load saved revenues from localStorage
  const [branchRevenues, setBranchRevenues] = useState(() => {
    try {
      const saved = localStorage.getItem('branchRevenues');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Save revenues to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('branchRevenues', JSON.stringify(branchRevenues));
  }, [branchRevenues]);

  // Track expanded staff members
  const [expandedStaff, setExpandedStaff] = useState({});

  const { data: salaryLogs = [] } = useQuery({
    queryKey: ["salaryLogs"],
    queryFn: () => apiClient.entities.SalaryLog.list("-created_date"),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.entities.Branch.list(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ["cleaners"],
    queryFn: () => apiClient.entities.Cleaner.list(),
    staleTime: 0,
    gcTime: 0,
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
  });

  // Calculate totals
  const totalPayroll = useMemo(() => salaryLogs.reduce((sum, s) => sum + Number(s.net_pay || 0), 0), [salaryLogs]);
  const totalDeductions = useMemo(() => salaryLogs.reduce((sum, s) => sum + Number(s.deductions || 0), 0), [salaryLogs]);
  const totalGross = useMemo(() => salaryLogs.reduce((sum, s) => sum + Number(s.gross_total || 0), 0), [salaryLogs]);

  // Monthly trend
  const monthlyData = useMemo(() => {
    const months = {};
    salaryLogs.forEach((s) => {
      const month = s.month || "Unknown";
      if (!months[month]) months[month] = { month, payroll: 0, deductions: 0 };
      months[month].payroll += Number(s.net_pay || 0);
      months[month].deductions += Number(s.deductions || 0);
    });
    return Object.values(months);
  }, [salaryLogs]);

  // Branch spending with monthly breakdown
  const branchSpending = useMemo(() => {
    const spending = {};
    const monthlySpending = {};
    
    salaryLogs.forEach((s) => {
      try {
        const workLog = typeof s.work_log === 'string' ? JSON.parse(s.work_log) : (s.work_log || []);
        const month = s.month || 'Unknown';
        
        workLog.forEach((w) => {
          // Total spending
          if (!spending[w.branch]) spending[w.branch] = 0;
          spending[w.branch] += Number(w.total || 0);
          
          // Monthly spending per branch
          const key = `${w.branch}-${month}`;
          if (!monthlySpending[key]) {
            monthlySpending[key] = { branch: w.branch, month, amount: 0 };
          }
          monthlySpending[key].amount += Number(w.total || 0);
        });
      } catch (e) {
        console.warn('Invalid work_log data:', s.work_log);
      }
    });
    
    return {
      total: Object.entries(spending).map(([name, value]) => ({ name, value })),
      monthly: Object.values(monthlySpending)
    };
  }, [salaryLogs]);

  // Branch profit calculation
  const branchProfits = useMemo(() => {
    return branchSpending.total.map(branch => {
      const revenue = Number(branchRevenues[branch.name] || 0);
      const expense = branch.value;
      const profit = revenue - expense;
      const profitMargin = revenue > 0 ? (profit / revenue * 100) : 0;
      
      return {
        name: branch.name,
        revenue,
        expense,
        profit,
        profitMargin: profitMargin.toFixed(1)
      };
    });
  }, [branchSpending, branchRevenues]);

  // Total personnel cost
  const totalPersonnelCost = useMemo(() => {
    return cleaners.reduce((total, cleaner) => {
      const staffPayments = salaryLogs.filter(log => log.staff_name === cleaner.name);
      const staffTotal = staffPayments.reduce((sum, log) => sum + Number(log.net_pay || 0), 0);
      return total + staffTotal;
    }, 0);
  }, [cleaners, salaryLogs]);

  // Staff payment history
  const staffPaymentHistory = useMemo(() => {
    return cleaners.map(cleaner => {
      const payments = salaryLogs
        .filter(log => log.staff_name === cleaner.name)
        .sort((a, b) => new Date(b.date || b.created_date) - new Date(a.date || a.created_date));
      
      const totalPaid = payments.reduce((sum, log) => sum + Number(log.net_pay || 0), 0);
      const latestPayment = payments[0];
      
      return {
        name: cleaner.name,
        role: cleaner.role,
        totalPaid,
        paymentCount: payments.length,
        latestPayment,
        allPayments: payments
      };
    }).sort((a, b) => b.totalPaid - a.totalPaid); // Sort by highest paid
  }, [cleaners, salaryLogs]);

  // Role distribution
  const roleDistribution = useMemo(() => {
    const roles = {};
    salaryLogs.forEach((s) => {
      const role = s.role || "Unknown";
      if (!roles[role]) roles[role] = 0;
      roles[role] += Number(s.net_pay || 0);
    });
    return Object.entries(roles).map(([name, value]) => ({ name, value }));
  }, [salaryLogs]);

  const avgPayment = salaryLogs.length > 0 ? totalPayroll / salaryLogs.length : 0;

  return (
    <div className="space-y-8">
      <PageHeader
        title="Financial Analytics"
        subtitle="Complete overview of payroll and expenses"
      />

      {/* Key Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.1 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 p-6 shadow-xl shadow-emerald-500/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-emerald-200">Total Payroll</p>
            <p className="mt-2 text-3xl font-bold text-white">LKR {totalPayroll.toLocaleString()}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-emerald-100">
              <TrendingUp className="h-3.5 w-3.5" />
              <span>All time</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.2 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-teal-600 via-green-700 to-emerald-800 p-6 shadow-xl shadow-teal-500/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-teal-200">Gross Total</p>
            <p className="mt-2 text-3xl font-bold text-white">LKR {totalGross.toLocaleString()}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-teal-100">
              <ArrowUpRight className="h-3.5 w-3.5" />
              <span>Before deductions</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.3 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-600 via-yellow-700 to-amber-800 p-6 shadow-xl shadow-amber-500/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-amber-200">Deductions</p>
            <p className="mt-2 text-3xl font-bold text-white">LKR {totalDeductions.toLocaleString()}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-amber-100">
              <ArrowDownRight className="h-3.5 w-3.5" />
              <span>Advances paid</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.4 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-green-600 via-emerald-700 to-teal-800 p-6 shadow-xl shadow-green-500/30"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
          <div className="relative">
            <p className="text-xs font-semibold uppercase tracking-wider text-green-200">Avg Payment</p>
            <p className="mt-2 text-3xl font-bold text-white">LKR {avgPayment.toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
            <div className="mt-3 flex items-center gap-1 text-xs text-green-100">
              <Users className="h-3.5 w-3.5" />
              <span>{salaryLogs.length} payments</span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Branch Profit & Expense Analysis */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? {} : { delay: 0.5 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Building2 className="h-5 w-5 text-emerald-600" />
          Branch Financial Overview
        </h3>
        
        <div className="space-y-4">
          {branchProfits.map((branch, idx) => {
            const isProfitable = branch.profit >= 0;
            
            return (
              <div key={branch.name} className="p-4 rounded-xl bg-gradient-to-r from-slate-50 to-white border border-slate-200">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-bold text-slate-800">{branch.name}</h4>
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="Revenue"
                      value={branchRevenues[branch.name] || ''}
                      onChange={(e) => setBranchRevenues({ ...branchRevenues, [branch.name]: e.target.value })}
                      className="w-32 h-8 text-xs"
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-3 text-center">
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">Revenue</p>
                    <p className="text-sm font-bold text-emerald-700">LKR {branch.revenue.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">Expense</p>
                    <p className="text-sm font-bold text-red-600">LKR {branch.expense.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">Profit</p>
                    <p className={`text-sm font-bold ${isProfitable ? 'text-emerald-700' : 'text-red-600'}`}>
                      {isProfitable ? '+' : ''}LKR {branch.profit.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase text-slate-500 font-semibold">Margin</p>
                    <p className={`text-sm font-bold ${isProfitable ? 'text-emerald-700' : 'text-red-600'} flex items-center justify-center gap-1`}>
                      {isProfitable ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {branch.profitMargin}%
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Monthly Branch Expenses */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? {} : { delay: 0.6 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-teal-600" />
          Monthly Branch Expenses
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="text-left py-2 px-3 text-xs font-bold uppercase text-slate-600">Branch</th>
                <th className="text-left py-2 px-3 text-xs font-bold uppercase text-slate-600">Month</th>
                <th className="text-right py-2 px-3 text-xs font-bold uppercase text-slate-600">Amount</th>
              </tr>
            </thead>
            <tbody>
              {branchSpending.monthly.map((item, idx) => (
                <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                  <td className="py-2 px-3 font-medium text-slate-700">{item.branch}</td>
                  <td className="py-2 px-3 text-slate-600">{item.month}</td>
                  <td className="py-2 px-3 text-right font-bold text-emerald-700">LKR {item.amount.toLocaleString()}</td>
                </tr>
              ))}
              {branchSpending.monthly.length === 0 && (
                <tr>
                  <td colSpan="3" className="py-8 text-center text-slate-400">No expense data available</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </motion.div>

      {/* Total Personnel Cost Summary */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? {} : { delay: 0.7 }}
        className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Total Personnel Cost
        </h3>
        
        <div className="grid md:grid-cols-3 gap-4">
          <div className="p-4 rounded-xl bg-white border border-emerald-100">
            <p className="text-xs uppercase text-slate-500 font-semibold mb-2">Total Staff</p>
            <p className="text-3xl font-bold text-emerald-700">{cleaners.length}</p>
            <p className="text-xs text-slate-500 mt-1">Active employees</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-emerald-100">
            <p className="text-xs uppercase text-slate-500 font-semibold mb-2">Total Paid</p>
            <p className="text-3xl font-bold text-emerald-700">LKR {totalPersonnelCost.toLocaleString()}</p>
            <p className="text-xs text-slate-500 mt-1">All time payroll</p>
          </div>
          <div className="p-4 rounded-xl bg-white border border-emerald-100">
            <p className="text-xs uppercase text-slate-500 font-semibold mb-2">Avg per Person</p>
            <p className="text-3xl font-bold text-emerald-700">
              LKR {cleaners.length > 0 ? (totalPersonnelCost / cleaners.length).toLocaleString(undefined, {maximumFractionDigits: 0}) : 0}
            </p>
            <p className="text-xs text-slate-500 mt-1">Average payment</p>
          </div>
        </div>
      </motion.div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Trend */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, x: -20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.5 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Calendar className="h-5 w-5 text-emerald-600" />
            Monthly Payroll Trend
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <defs>
                <linearGradient id="colorPayroll" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="month" stroke="#64748b" style={{ fontSize: '12px' }} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Line type="monotone" dataKey="payroll" stroke="#10b981" strokeWidth={3} fill="url(#colorPayroll)" />
            </LineChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Branch Spending */}
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, x: 20 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, x: 0 }}
          transition={shouldReduceMotion ? {} : { delay: 0.9 }}
          className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
        >
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-teal-600" />
            Branch-wise Spending
          </h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={branchSpending.total}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
              <XAxis dataKey="name" stroke="#64748b" style={{ fontSize: '11px' }} angle={-15} textAnchor="end" height={80} />
              <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {branchSpending.total.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Staff Payment History */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? {} : { delay: 0.8 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Staff Payment History
        </h3>
        
        <div className="space-y-3">
          {staffPaymentHistory.map((staff) => {
            const isExpanded = expandedStaff[staff.name];
            
            return (
              <div key={staff.name} className="border border-slate-200 rounded-xl overflow-hidden">
                {/* Header - Always visible */}
                <div
                  onClick={() => setExpandedStaff({ ...expandedStaff, [staff.name]: !isExpanded })}
                  className="p-4 bg-gradient-to-r from-slate-50 to-white cursor-pointer hover:from-slate-100 hover:to-slate-50 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h4 className="font-bold text-slate-800">{staff.name}</h4>
                        <span className="text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-700 font-medium">
                          {staff.role}
                        </span>
                      </div>
                      
                      {staff.latestPayment && (
                        <div className="mt-2 flex items-center gap-4 text-xs text-slate-500">
                          <span>Latest: {staff.latestPayment.month} - LKR {Number(staff.latestPayment.net_pay || 0).toLocaleString()}</span>
                          <span>•</span>
                          <span>{staff.latestPayment.date || 'No date'}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-xs uppercase text-slate-500 font-semibold">Lifetime Total</p>
                        <p className="text-xl font-bold text-emerald-700">LKR {staff.totalPaid.toLocaleString()}</p>
                        <p className="text-xs text-slate-400">{staff.paymentCount} payment{staff.paymentCount !== 1 ? 's' : ''}</p>
                      </div>
                      
                      <div className="ml-2">
                        {isExpanded ? (
                          <ChevronUp className="h-5 w-5 text-slate-400" />
                        ) : (
                          <ChevronDown className="h-5 w-5 text-slate-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Expanded Payment History */}
                {isExpanded && (
                  <div className="border-t border-slate-200 bg-slate-50/50">
                    <div className="p-4">
                      <h5 className="text-xs uppercase font-bold text-slate-600 mb-3">Payment History</h5>
                      <div className="space-y-2">
                        {staff.allPayments.map((payment, idx) => (
                          <div
                            key={payment.id || idx}
                            className="p-3 bg-white rounded-lg border border-slate-100 flex items-center justify-between"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-3">
                                <span className="text-sm font-semibold text-slate-700">{payment.month}</span>
                                <span className="text-xs text-slate-400">{payment.date || 'Date N/A'}</span>
                              </div>
                              <div className="mt-1 text-xs text-slate-500">
                                Gross: LKR {Number(payment.gross_total || 0).toLocaleString()} | 
                                Deductions: LKR {Number(payment.deductions || 0).toLocaleString()}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-bold text-emerald-700">
                                LKR {Number(payment.net_pay || 0).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
          
          {staffPaymentHistory.length === 0 && (
            <div className="text-center py-12 text-slate-400">
              <Users className="h-10 w-10 mx-auto mb-3 text-slate-300" />
              <p>No staff payment data available</p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Role Distribution */}
      <motion.div
        initial={shouldReduceMotion ? {} : { opacity: 0, y: 20 }}
        animate={shouldReduceMotion ? {} : { opacity: 1, y: 0 }}
        transition={shouldReduceMotion ? {} : { delay: 0.7 }}
        className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg"
      >
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <Users className="h-5 w-5 text-emerald-600" />
          Payroll by Role
        </h3>
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={roleDistribution}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {roleDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          <div className="space-y-3">
            {roleDistribution.map((role, idx) => (
              <div key={role.name} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                <div className="flex items-center gap-3">
                  <div
                    className="h-3 w-3 rounded-full"
                    style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                  ></div>
                  <span className="text-sm font-medium text-slate-700">{role.name}</span>
                </div>
                <span className="text-sm font-bold text-slate-800">LKR {role.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-5">
        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? {} : { delay: 0.8 }}
          className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Branches</p>
          <p className="mt-3 text-4xl font-bold text-white">{branches.length}</p>
          <p className="mt-2 text-xs text-slate-400">Operational locations</p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? {} : { delay: 0.9 }}
          className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Total Staff</p>
          <p className="mt-3 text-4xl font-bold text-white">{cleaners.length}</p>
          <p className="mt-2 text-xs text-slate-400">Team members</p>
        </motion.div>

        <motion.div
          initial={shouldReduceMotion ? {} : { opacity: 0, scale: 0.95 }}
          animate={shouldReduceMotion ? {} : { opacity: 1, scale: 1 }}
          transition={shouldReduceMotion ? {} : { delay: 1.0 }}
          className="rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 p-6 shadow-xl"
        >
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Payment Records</p>
          <p className="mt-3 text-4xl font-bold text-white">{salaryLogs.length}</p>
          <p className="mt-2 text-xs text-slate-400">Transactions logged</p>
        </motion.div>
      </div>
    </div>
  );
}