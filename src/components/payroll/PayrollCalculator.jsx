import React, { useState, useRef } from "react";
import { apiClient } from "@/api/apiClient";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, Check, Building2, Upload, X, Download, Receipt } from "lucide-react";
import { toast } from "sonner";
import { generatePDFReceipt } from "@/util/pdfReceiptGenerator";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function PayrollCalculator({ cleaners, branches, editingPayment, onSaved, onCancel }) {
  const [payee, setPayee] = useState(editingPayment?.staff_name || "");
  const [month, setMonth] = useState(editingPayment?.month || MONTHS[new Date().getMonth()]);
  const [payDate, setPayDate] = useState(editingPayment?.date || new Date().toISOString().split("T")[0]);
  const [advance, setAdvance] = useState(editingPayment?.deductions?.toString() || "");
  const [workLog, setWorkLog] = useState(() => {
    if (editingPayment?.work_log) {
      try {
        const parsed = typeof editingPayment.work_log === 'string' 
          ? JSON.parse(editingPayment.work_log) 
          : editingPayment.work_log;
        return parsed.length > 0 ? parsed : [{ branch: "", days: "", rate: 500 }];
      } catch {
        return [{ branch: "", days: "", rate: 500 }];
      }
    }
    return [{ branch: "", days: "", rate: 500 }];
  });
  const [transactionSlip, setTransactionSlip] = useState(editingPayment?.transaction_slip_url || "");
  const [isDragging, setIsDragging] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef(null);

  const isEditing = !!editingPayment;

  const payeeRole = cleaners.find((c) => c.name === payee)?.role || "—";

  const addRow = () => setWorkLog([...workLog, { branch: "", days: "", rate: 500 }]);
  const removeRow = (idx) => setWorkLog(workLog.filter((_, i) => i !== idx));
  const updateRow = (idx, field, value) => {
    const updated = [...workLog];
    updated[idx] = { ...updated[idx], [field]: value };
    setWorkLog(updated);
  };

  const grossTotal = workLog.reduce((sum, r) => sum + (Number(r.days) || 0) * (Number(r.rate) || 0), 0);
  const netPay = grossTotal - (Number(advance) || 0);

  const handleImageUpload = (file) => {
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => setTransactionSlip(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageUpload(file);
  };

  const handleSave = async () => {
    if (!payee || grossTotal <= 0) {
      toast.error("Please select a staff member and add work log entries");
      return;
    }
    
    const validWorkLog = workLog.filter((r) => r.branch && Number(r.days) > 0);
    if (validWorkLog.length === 0) {
      toast.error("Please add at least one valid work log entry");
      return;
    }

    setSaving(true);
    try {
      const workLogData = validWorkLog.map((r) => ({
        branch: r.branch,
        days: Number(r.days),
        rate: Number(r.rate),
        total: Number(r.days) * Number(r.rate),
      }));

      const paymentData = {
        payment_id: isEditing ? editingPayment.payment_id : `PAY-${Date.now()}`,
        date: payDate,
        month,
        staff_name: payee,
        role: payeeRole,
        gross_total: grossTotal,
        deductions: Number(advance) || 0,
        net_pay: netPay,
        transaction_slip_url: transactionSlip || null,
        status: 'Paid',
        work_log: JSON.stringify(workLogData), // Convert to JSON string for Supabase
      };
      
      console.log(isEditing ? 'Updating payment data:' : 'Saving payment data:', paymentData);
      
      const result = isEditing 
        ? await apiClient.entities.SalaryLog.update(editingPayment.id, paymentData)
        : await apiClient.entities.SalaryLog.create(paymentData);
      
      console.log('Payment saved successfully:', result);
      
      // Generate and download PDF receipt
      const receiptData = {
        ...paymentData,
        work_log: workLogData // Use array for receipt generation
      };
      generatePDFReceipt(receiptData);
      
      toast.success(isEditing ? "Payment updated & PDF receipt downloaded!" : "Payment recorded & PDF receipt downloaded!");
      setSaving(false);
      onSaved();
    } catch (error) {
      console.error('Save error:', error);
      toast.error("Failed to save payment: " + (error.message || "Unknown error"));
      setSaving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/40 to-white p-5 md:p-6 shadow-lg"
      >
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-lg font-bold text-slate-800">
          {isEditing ? "Edit Payment" : "Payroll Calculator"}
        </h3>
        {onCancel && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onCancel}
            className="text-slate-500 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Left: Payee Info */}
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label>Staff Member</Label>
            <Select value={payee} onValueChange={setPayee} disabled={isEditing}>
              <SelectTrigger><SelectValue placeholder="Select staff" /></SelectTrigger>
              <SelectContent>
                {cleaners.map((c) => (
                  <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {payee && <p className="text-xs text-slate-500">Role: {payeeRole}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Month</Label>
              <Select value={month} onValueChange={setMonth}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MONTHS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label>Date</Label>
              <Input type="date" value={payDate} onChange={(e) => setPayDate(e.target.value)} />
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Advance / Deductions (LKR)</Label>
            <Input 
              type="number" 
              min={0} 
              step={500} 
              value={advance} 
              onChange={(e) => setAdvance(e.target.value)}
              placeholder="0"
              tabIndex={0}
            />
          </div>

          {/* Transaction Slip Upload */}
          <div className="grid gap-2">
            <Label>Transaction Slip (optional)</Label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-xl p-3 cursor-pointer transition-all ${
                isDragging
                  ? 'border-emerald-500 bg-emerald-50'
                  : 'border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              {transactionSlip ? (
                <div className="relative group">
                  <img
                    src={transactionSlip}
                    alt="Transaction slip"
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setTransactionSlip('');
                    }}
                    className="absolute top-1 right-1 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center gap-1 py-3">
                  <Upload className={`h-6 w-6 ${isDragging ? 'text-emerald-500' : 'text-slate-400'}`} />
                  <p className="text-xs text-slate-600">
                    {isDragging ? 'Drop here' : 'Upload bank slip'}
                  </p>
                </div>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleImageUpload(e.target.files[0])}
              />
            </div>
          </div>
        </div>

        {/* Right: Work Log */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label>Work Log</Label>
            <Button variant="outline" size="sm" onClick={addRow} className="rounded-full text-xs gap-1">
              <Plus className="h-3 w-3" /> Add Row
            </Button>
          </div>

          <div className="space-y-2">
            {workLog.map((row, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <Select value={row.branch} onValueChange={(v) => updateRow(idx, "branch", v)}>
                  <SelectTrigger className="flex-1 text-xs bg-white">
                    <SelectValue placeholder="Select branch" />
                  </SelectTrigger>
                  <SelectContent className="max-h-[200px]">
                    {branches.length > 0 ? (
                      branches.map((b) => (
                        <SelectItem key={b.id} value={b.branch_name}>
                          <div className="flex items-center gap-2">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span>{b.branch_name}</span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>No branches available</SelectItem>
                    )}
                  </SelectContent>
                </Select>
                <Input
                  type="number" 
                  min={0} 
                  step={1}
                  className="w-16 text-center text-xs"
                  placeholder="Days"
                  value={row.days}
                  onChange={(e) => updateRow(idx, "days", e.target.value)}
                  tabIndex={0}
                />
                <Input
                  type="number" 
                  min={0} 
                  step={100}
                  className="w-20 text-center text-xs"
                  placeholder="Rate"
                  value={row.rate}
                  onChange={(e) => updateRow(idx, "rate", e.target.value)}
                  tabIndex={0}
                />
                <span className="text-xs font-medium text-slate-600 w-20 text-right">
                  {((Number(row.days) || 0) * (Number(row.rate) || 0)).toLocaleString()}
                </span>
                {workLog.length > 1 && (
                  <button onClick={() => removeRow(idx)} className="p-1 text-slate-400 hover:text-red-500">
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="mt-6 pt-5 border-t border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-6">
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Gross</p>
              <p className="text-lg font-bold text-slate-700">LKR {grossTotal.toLocaleString()}</p>
            </div>
            <div className="text-slate-300">−</div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Deductions</p>
              <p className="text-lg font-bold text-slate-700">LKR {(Number(advance) || 0).toLocaleString()}</p>
            </div>
            <div className="text-slate-300">=</div>
            <div>
              <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold">Net Pay</p>
              <p className="text-xl font-bold text-emerald-700">LKR {netPay.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={() => {
                if (!payee || grossTotal <= 0) {
                  toast.error("Fill in payment details first");
                  return;
                }
                const testData = {
                  payment_id: `PAY-${Date.now()}`,
                  date: payDate,
                  month,
                  staff_name: payee,
                  role: payeeRole,
                  gross_total: grossTotal,
                  deductions: Number(advance) || 0,
                  net_pay: netPay,
                  work_log: workLog.filter((r) => r.branch && Number(r.days) > 0).map((r) => ({
                    branch: r.branch,
                    days: Number(r.days),
                    rate: Number(r.rate),
                    total: Number(r.days) * Number(r.rate),
                  })),
                };
                generatePDFReceipt(testData);
                toast.success("PDF receipt downloaded!");
              }}
              className="rounded-full gap-2"
            >
              <Receipt className="h-4 w-4" />
              Test Receipt
            </Button>

            <Button
              onClick={handleSave}
              disabled={saving || !payee || grossTotal <= 0}
              className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-full px-6 gap-2 shadow-lg shadow-emerald-500/30"
            >
              <Check className="h-4 w-4" />
              {saving ? "Saving..." : isEditing ? "Update Payment" : "Confirm Payment"}
            </Button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}