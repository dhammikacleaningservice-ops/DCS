import React from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { motion } from "framer-motion";

export default function DataTable({ columns, data, onRowClick, renderCell }) {
  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100/50 border-b border-slate-200">
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className="text-xs font-bold uppercase tracking-wider text-slate-600 py-3.5 px-4"
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-12 text-slate-400">
                  No records found
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, idx) => (
                <motion.tr
                  key={row.id || idx}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: idx * 0.03 }}
                  onClick={() => onRowClick?.(row)}
                  className={`border-b border-slate-100 transition-colors hover:bg-slate-50/60 ${
                    onRowClick ? "cursor-pointer" : ""
                  } ${idx % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                >
                  {columns.map((col) => (
                    <TableCell key={col.key} className="py-3 px-4 text-sm text-slate-700">
                      {renderCell ? renderCell(col.key, row[col.key], row) : row[col.key]}
                    </TableCell>
                  ))}
                </motion.tr>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}