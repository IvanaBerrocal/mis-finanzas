"use client";
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, PiggyBank, LineChart, Plus, RefreshCw } from "lucide-react";
import { loadTransactions } from "@/lib/storage";
import { Transaction } from "@/lib/types";
import MetricCard from "@/components/MetricCard";
import { SpendingPieChart, MonthlyBarChart } from "@/components/DashboardCharts";
import HealthScore from "@/components/HealthScore";
import TransactionForm from "@/components/TransactionForm";
import ExportButton from "@/components/ExportButton";

function computeScore(ingresos: number, gastos: number, ahorro: number, inversion: number) {
  let score = 0;
  const details: { label: string; ok: boolean; note: string }[] = [];

  const savingRate = ingresos > 0 ? ahorro / ingresos : 0;
  const savingOk = savingRate >= 0.2;
  score += savingOk ? 30 : Math.round(savingRate * 150);
  details.push({ label: "Tasa de ahorro", ok: savingOk, note: `${(savingRate * 100).toFixed(1)}% de ingresos (meta: 20%)` });

  const expenseRate = ingresos > 0 ? gastos / ingresos : 1;
  const expenseOk = expenseRate < 0.7;
  score += expenseOk ? 25 : Math.round((1 - expenseRate) * 25);
  details.push({ label: "Control de gastos", ok: expenseOk, note: `${(expenseRate * 100).toFixed(1)}% de ingresos (meta: <70%)` });

  const investOk = inversion > 0;
  score += investOk ? 25 : 0;
  details.push({ label: "Inversión", ok: investOk, note: investOk ? `S/ ${inversion.toFixed(2)} invertidos` : "No tienes inversiones aún" });

  const balance = ingresos - gastos;
  const balanceOk = balance > 0;
  score += balanceOk ? 20 : 0;
  details.push({ label: "Balance positivo", ok: balanceOk, note: `S/ ${balance.toFixed(2)} ${balanceOk ? "de superávit" : "de déficit"}` });

  return { score: Math.max(0, Math.min(100, score)), details };
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [source, setSource] = useState<"github" | "local">("local");
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState<"mes" | "año" | "todo">("mes");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const { transactions: t, source: s } = await loadTransactions();
    setTransactions(t);
    setSource(s);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const now = new Date();
  const filtered = transactions.filter((t) => {
    if (period === "todo") return true;
    if (period === "mes") return t.date.startsWith(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
    return t.date.startsWith(`${now.getFullYear()}`);
  });

  const sum = (type: string) => filtered.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);
  const ingresos = sum("ingreso");
  const gastos = sum("gasto");
  const ahorro = sum("ahorro");
  const inversion = sum("inversion");
  const balance = ingresos - gastos;
  const { score, details } = computeScore(ingresos, gastos, ahorro, inversion);
  const recent = [...transactions].slice(0, 5);
  const periodLabel = { mes: "Este mes", año: "Este año", todo: "Todo" };

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">

      {/* Header */}
      <div className="mb-6">

        {/* Fila 1: Título + Reload */}
        <div className="flex items-center justify-between mb-3">
          <div className="min-w-0 mr-2">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 truncate">Dashboard</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-0.5 truncate">
              {loading
                ? "Cargando..."
                : source === "github"
                ? "✓ GitHub"
                : "⚠ Modo local"}
            </p>
          </div>
          <button
            onClick={load}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors shrink-0"
            title="Recargar"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
        </div>

        {/* Fila 2: Período + Exportar + Nueva */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm flex-1 sm:flex-none">
            {(["mes", "año", "todo"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`flex-1 sm:flex-none px-3 py-1.5 font-medium transition-colors whitespace-nowrap ${
                  period === p ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {periodLabel[p]}
              </button>
            ))}
          </div>
          <ExportButton transactions={filtered} label="Exportar" />
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors ml-auto sm:ml-0"
          >
            <Plus size={15} /> Nueva
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <MetricCard title="Ingresos" amount={ingresos} color="green" icon={<TrendingUp size={18} />} />
        <MetricCard title="Gastos" amount={gastos} color="red" icon={<TrendingDown size={18} />} />
        <MetricCard title="Ahorro" amount={ahorro} color="blue" icon={<PiggyBank size={18} />} />
        <MetricCard title="Inversión" amount={inversion} color="purple" icon={<LineChart size={18} />} />
      </div>

      {/* Balance */}
      <div className={`rounded-xl p-4 mb-6 ${balance >= 0 ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <p className="text-sm font-medium text-gray-600">
              Balance neto ({periodLabel[period].toLowerCase()})
            </p>
            <p className={`text-2xl sm:text-3xl font-bold mt-1 ${balance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
              S/ {Math.abs(balance).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
              <span className="text-sm sm:text-base ml-2 font-normal">
                {balance >= 0 ? "superávit" : "déficit"}
              </span>
            </p>
          </div>
          {ingresos > 0 && (
            <div className="flex sm:flex-col gap-4 sm:gap-0 sm:text-right text-sm text-gray-500">
              <p>Ahorro: <span className="font-medium">{((ahorro / ingresos) * 100).toFixed(1)}%</span></p>
              <p>Gastos: <span className="font-medium">{((gastos / ingresos) * 100).toFixed(1)}%</span></p>
            </div>
          )}
        </div>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Gastos por categoría</h2>
          <SpendingPieChart transactions={filtered} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-5">
          <h2 className="font-semibold text-gray-800 mb-3 text-sm sm:text-base">Últimos 6 meses</h2>
          <MonthlyBarChart transactions={transactions} />
        </div>
      </div>

      {/* Health + Transacciones */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        <HealthScore score={score} details={details} />
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 sm:p-6">
          <h2 className="font-semibold text-gray-800 mb-4 text-sm sm:text-base">Últimas transacciones</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aún no hay transacciones</p>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => {
                const typeColor = {
                  ingreso: "text-emerald-600",
                  gasto: "text-red-500",
                  ahorro: "text-blue-600",
                  inversion: "text-purple-600",
                }[t.type];
                return (
                  <div key={t.id} className="flex items-center justify-between text-sm gap-2">
                    <div className="min-w-0">
                      <p className="font-medium text-gray-800 truncate">{t.category}</p>
                      <p className="text-gray-400 text-xs truncate">
                        {t.date}{t.description && ` · ${t.description}`}
                      </p>
                    </div>
                    <span className={`font-semibold whitespace-nowrap shrink-0 ${typeColor}`}>
                      {t.type === "gasto" ? "-" : "+"}S/ {t.amount.toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && <TransactionForm onClose={() => setShowForm(false)} onSaved={load} />}
    </div>
  );
}
