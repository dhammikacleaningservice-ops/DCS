import React, { useState } from "react";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { apiClient } from "@/api/apiClient";
import { Calculator, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";
import PayrollCalculator from "../components/payroll/PayrollCalculator";
import { toast } from "sonner";

export default function Payroll() {
  const [showCalc, setShowCalc] = useState(false);
  const [editingPayment, setEditingPayment] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const queryClient = useQueryClient();

  const { data: salaryLogs = [] } = useQuery({
    queryKey: ["salaryLogs"],
    queryFn: () => apiClient.entities.SalaryLog.list("-created_date"),
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ["cleaners"],
    queryFn: () => apiClient.entities.Cleaner.list(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => apiClient.entities.Branch.list(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => apiClient.entities.SalaryLog.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["salaryLogs"] });
      toast.success("Payment deleted successfully");
      setDeleteConfirm(null);
    },
    onError: (error) => {
      toast.error("Failed to delete payment: " + error.message);
    },
  });

  const columns = [
    { key: "date", label: "Date" },
    { key: "month", label: "Month" },
    { key: "staff_name", label: "Staff" },
    { key: "role", label: "Role" },
    { key: "gross_total", label: "Gross" },
    { key: "deductions", label: "Deductions" },
    { key: "net_pay", label: "Net Pay" },
    { key: "actions", label: "Actions" },
  ];

  const renderCell = (key, value, row) => {
    if (["gross_total", "deductions", "net_pay"].includes(key)) {
      return <span className="font-medium">LKR {Number(value || 0).toLocaleString()}</span>;
    }
    if (key === "staff_name") return <span className="font-medium">{value}</span>;
    if (key === "actions") {
      return (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setEditingPayment(row);
              setShowCalc(true);
            }}
            className="h-8 px-3 gap-1.5 rounded-full"
          >
            <Pencil className="h-3.5 w-3.5" />
            Edit
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              setDeleteConfirm(row);
            }}
            className="h-8 px-3 gap-1.5 rounded-full text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </Button>
        </div>
      );
    }
    return value;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        subtitle={`${salaryLogs.length} payment records`}
        action={
          <Button
            onClick={() => {
              if (showCalc) {
                setShowCalc(false);
                setEditingPayment(null);
              } else {
                setShowCalc(true);
                setEditingPayment(null);
              }
            }}
            className={`rounded-full px-5 gap-2 shadow-lg ${showCalc ? "bg-slate-600 hover:bg-slate-700" : "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-emerald-500/30"}`}
          >
            <Calculator className="h-4 w-4" />
            {showCalc ? "Close Calculator" : "New Payment"}
          </Button>
        }
      />

      {showCalc && (
        <PayrollCalculator
          cleaners={cleaners}
          branches={branches}
          editingPayment={editingPayment}
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["salaryLogs"] });
            setShowCalc(false);
            setEditingPayment(null);
          }}
          onCancel={() => {
            setShowCalc(false);
            setEditingPayment(null);
          }}
        />
      )}

      <DataTable columns={columns} data={salaryLogs} renderCell={renderCell} />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Payment Record</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete the payment for{" "}
              <strong>{deleteConfirm?.staff_name}</strong> dated{" "}
              <strong>{deleteConfirm?.date}</strong>? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteMutation.mutate(deleteConfirm.id)}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}