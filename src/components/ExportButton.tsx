"use client";
import { Download } from "lucide-react";
import { Transaction, TYPE_LABELS } from "@/lib/types";

interface Props {
  transactions: Transaction[];
  label?: string;
}

export default function ExportButton({ transactions, label = "Exportar CSV" }: Props) {
  function handleExport() {
    if (transactions.length === 0) return;

    const header = ["Fecha", "Tipo", "Categoría", "Descripción", "Monto (S/)"];
    const rows = transactions.map((t) => [
      t.date,
      TYPE_LABELS[t.type],
      t.category,
      t.description || "",
      t.amount.toFixed(2),
    ]);

    const csv = [header, ...rows]
      .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `finanzas-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button
      onClick={handleExport}
      disabled={transactions.length === 0}
      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
    >
      <Download size={15} />
      {label}
    </button>
  );
}
