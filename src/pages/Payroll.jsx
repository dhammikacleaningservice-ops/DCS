import React, { useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { base44 } from "@/api/base44Client";
import { Calculator } from "lucide-react";
import { Button } from "@/components/ui/button";
import PageHeader from "../components/ui/PageHeader";
import DataTable from "../components/ui/DataTable";
import PayrollCalculator from "../components/payroll/PayrollCalculator";

export default function Payroll() {
  const [showCalc, setShowCalc] = useState(false);
  const queryClient = useQueryClient();

  const { data: salaryLogs = [] } = useQuery({
    queryKey: ["salaryLogs"],
    queryFn: () => base44.entities.SalaryLog.list("-created_date"),
  });

  const { data: cleaners = [] } = useQuery({
    queryKey: ["cleaners"],
    queryFn: () => base44.entities.Cleaner.list(),
  });

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: () => base44.entities.Branch.list(),
  });

  const columns = [
    { key: "date", label: "Date" },
    { key: "month", label: "Month" },
    { key: "staff_name", label: "Staff" },
    { key: "role", label: "Role" },
    { key: "gross_total", label: "Gross" },
    { key: "deductions", label: "Deductions" },
    { key: "net_pay", label: "Net Pay" },
  ];

  const renderCell = (key, value) => {
    if (["gross_total", "deductions", "net_pay"].includes(key)) {
      return <span className="font-medium">LKR {Number(value || 0).toLocaleString()}</span>;
    }
    if (key === "staff_name") return <span className="font-medium">{value}</span>;
    return value;
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Payroll"
        subtitle={`${salaryLogs.length} payment records`}
        action={
          <Button
            onClick={() => setShowCalc(!showCalc)}
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
          onSaved={() => {
            queryClient.invalidateQueries({ queryKey: ["salaryLogs"] });
            setShowCalc(false);
          }}
        />
      )}

      <DataTable columns={columns} data={salaryLogs} renderCell={renderCell} />
    </div>
  );
}