"use client";
import { useState, useEffect, useCallback } from "react";
import { TrendingUp, TrendingDown, PiggyBank, LineChart, Plus } from "lucide-react";
import { getTransactions } from "@/lib/storage";
import { Transaction } from "@/lib/types";
import MetricCard from "@/components/MetricCard";
import { SpendingPieChart, MonthlyBarChart } from "@/components/DashboardCharts";
import HealthScore from "@/components/HealthScore";
import TransactionForm from "@/components/TransactionForm";

function computeScore(ingresos: number, gastos: number, ahorro: number, inversion: number) {
  let score = 0;
  const details: { label: string; ok: boolean; note: string }[] = [];

  // 1. Ratio ahorro/ingresos >= 20%
  const savingRate = ingresos > 0 ? ahorro / ingresos : 0;
  const savingOk = savingRate >= 0.2;
  score += savingOk ? 30 : Math.round(savingRate * 150);
  details.push({
    label: "Tasa de ahorro",
    ok: savingOk,
    note: `${(savingRate * 100).toFixed(1)}% de ingresos (meta: 20%)`,
  });

  // 2. Gastos < 70% de ingresos
  const expenseRate = ingresos > 0 ? gastos / ingresos : 1;
  const expenseOk = expenseRate < 0.7;
  score += expenseOk ? 25 : Math.round((1 - expenseRate) * 25);
  details.push({
    label: "Control de gastos",
    ok: expenseOk,
    note: `${(expenseRate * 100).toFixed(1)}% de ingresos (meta: <70%)`,
  });

  // 3. Inversión > 0
  const investOk = inversion > 0;
  score += investOk ? 25 : 0;
  details.push({
    label: "Inversión",
    ok: investOk,
    note: investOk ? `S/ ${inversion.toFixed(2)} invertidos` : "No tienes inversiones aún",
  });

  // 4. Balance positivo
  const balance = ingresos - gastos;
  const balanceOk = balance > 0;
  score += balanceOk ? 20 : 0;
  details.push({
    label: "Balance positivo",
    ok: balanceOk,
    note: `S/ ${balance.toFixed(2)} ${balanceOk ? "de superávit" : "de déficit"}`,
  });

  return { score: Math.max(0, Math.min(100, score)), details };
}

export default function DashboardPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [period, setPeriod] = useState<"mes" | "año" | "todo">("mes");

  const load = useCallback(() => setTransactions(getTransactions()), []);
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

  const periodLabel = { mes: "Este mes", año: "Este año", todo: "Todo el tiempo" };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tu resumen financiero personal</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
            {(["mes", "año", "todo"] as const).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 font-medium transition-colors ${
                  period === p ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"
                }`}
              >
                {periodLabel[p]}
              </button>
            ))}
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={16} /> Nueva
          </button>
        </div>
      </div>

      {/* Métricas */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard title="Ingresos" amount={ingresos} color="green" icon={<TrendingUp size={20} />} />
        <MetricCard title="Gastos" amount={gastos} color="red" icon={<TrendingDown size={20} />} />
        <MetricCard title="Ahorro" amount={ahorro} color="blue" icon={<PiggyBank size={20} />} />
        <MetricCard title="Inversión" amount={inversion} color="purple" icon={<LineChart size={20} />} />
      </div>

      {/* Balance */}
      <div className={`rounded-xl p-4 mb-6 flex items-center justify-between ${balance >= 0 ? "bg-emerald-50 border border-emerald-200" : "bg-red-50 border border-red-200"}`}>
        <div>
          <p className="text-sm font-medium text-gray-600">Balance neto ({periodLabel[period].toLowerCase()})</p>
          <p className={`text-3xl font-bold mt-1 ${balance >= 0 ? "text-emerald-700" : "text-red-700"}`}>
            S/ {Math.abs(balance).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            <span className="text-base ml-2 font-normal">{balance >= 0 ? "superávit" : "déficit"}</span>
          </p>
        </div>
        {ingresos > 0 && (
          <div className="text-right text-sm text-gray-500">
            <p>Ahorro: {((ahorro / ingresos) * 100).toFixed(1)}%</p>
            <p>Gastos: {((gastos / ingresos) * 100).toFixed(1)}%</p>
          </div>
        )}
      </div>

      {/* Gráficos + Score */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Gastos por categoría</h2>
          <SpendingPieChart transactions={filtered} />
        </div>
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
          <h2 className="font-semibold text-gray-800 mb-3">Últimos 6 meses</h2>
          <MonthlyBarChart transactions={transactions} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <HealthScore score={score} details={details} />

        {/* Últimas transacciones */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-semibold text-gray-800 mb-4">Últimas transacciones</h2>
          {recent.length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Aún no tienes transacciones</p>
          ) : (
            <div className="space-y-3">
              {recent.map((t) => {
                const typeColor = { ingreso: "text-emerald-600", gasto: "text-red-500", ahorro: "text-blue-600", inversion: "text-purple-600" }[t.type];
                const sign = t.type === "gasto" ? "-" : "+";
                return (
                  <div key={t.id} className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-800">{t.category}</p>
                      <p className="text-gray-400 text-xs">{t.date} {t.description && `· ${t.description}`}</p>
                    </div>
                    <span className={`font-semibold ${typeColor}`}>{sign}S/ {t.amount.toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}
    </div>
  );
}
