"use client";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend,
} from "recharts";
import { Transaction, TYPE_COLORS } from "@/lib/types";

interface Props {
  transactions: Transaction[];
}

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

const CATEGORY_COLORS = [
  "#10b981", "#3b82f6", "#8b5cf6", "#f59e0b", "#ef4444",
  "#06b6d4", "#ec4899", "#84cc16", "#f97316", "#6366f1",
];

export function SpendingPieChart({ transactions }: Props) {
  const gastos = transactions.filter((t) => t.type === "gasto");
  const map: Record<string, number> = {};
  gastos.forEach((t) => {
    map[t.category] = (map[t.category] ?? 0) + t.amount;
  });
  const data = Object.entries(map)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return <EmptyState text="Sin gastos registrados" />;
  }

  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie data={data} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
          {data.map((_, i) => (
            <Cell key={i} fill={CATEGORY_COLORS[i % CATEGORY_COLORS.length]} />
          ))}
        </Pie>
        <Tooltip formatter={(v: number) => `S/ ${v.toFixed(2)}`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

export function MonthlyBarChart({ transactions }: Props) {
  const now = new Date();
  const months: { month: string; Ingresos: number; Gastos: number; Ahorro: number; Inversión: number }[] = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const label = MONTH_NAMES[d.getMonth()];
    const filtered = transactions.filter((t) => t.date.startsWith(key));
    months.push({
      month: label,
      Ingresos: filtered.filter((t) => t.type === "ingreso").reduce((s, t) => s + t.amount, 0),
      Gastos: filtered.filter((t) => t.type === "gasto").reduce((s, t) => s + t.amount, 0),
      Ahorro: filtered.filter((t) => t.type === "ahorro").reduce((s, t) => s + t.amount, 0),
      Inversión: filtered.filter((t) => t.type === "inversion").reduce((s, t) => s + t.amount, 0),
    });
  }

  const hasData = months.some((m) => m.Ingresos + m.Gastos + m.Ahorro + m.Inversión > 0);
  if (!hasData) return <EmptyState text="Sin datos en los últimos 6 meses" />;

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={months} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis dataKey="month" tick={{ fontSize: 12 }} />
        <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `S/${v}`} />
        <Tooltip formatter={(v: number) => `S/ ${v.toFixed(2)}`} />
        <Legend />
        <Bar dataKey="Ingresos" fill={TYPE_COLORS.ingreso} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Gastos" fill={TYPE_COLORS.gasto} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Ahorro" fill={TYPE_COLORS.ahorro} radius={[3, 3, 0, 0]} />
        <Bar dataKey="Inversión" fill={TYPE_COLORS.inversion} radius={[3, 3, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="h-60 flex items-center justify-center text-gray-400 text-sm">{text}</div>
  );
}
