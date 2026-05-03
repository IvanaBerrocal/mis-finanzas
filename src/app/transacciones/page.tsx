"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, Pencil, Trash2, Search, RefreshCw } from "lucide-react";
import { loadTransactions, removeTransaction } from "@/lib/storage";
import { Transaction, TransactionType, TYPE_LABELS, TYPE_COLORS, CATEGORIES } from "@/lib/types";
import TransactionForm from "@/components/TransactionForm";
import ExportButton from "@/components/ExportButton";

const ALL = "all" as const;
type Filter = TransactionType | typeof ALL;

const ALL_CATEGORIES = Array.from(
  new Set(Object.values(CATEGORIES).flat())
).sort();

export default function TransaccionesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Transaction | undefined>();
  const [filter, setFilter] = useState<Filter>(ALL);
  const [catFilter, setCatFilter] = useState("all");
  const [search, setSearch] = useState("");
  const [toDelete, setToDelete] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);
  const [syncError, setSyncError] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    const { transactions: t } = await loadTransactions();
    setTransactions(t);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const visible = transactions.filter((t) => {
    if (filter !== ALL && t.type !== filter) return false;
    if (catFilter !== "all" && t.category !== catFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return t.category.toLowerCase().includes(q) || t.description.toLowerCase().includes(q);
    }
    return true;
  });

  async function handleDelete(id: string) {
    setDeleting(true);
    const { ok, error } = await removeTransaction(id);
    if (!ok && error) setSyncError(error);
    setToDelete(null);
    setDeleting(false);
    load();
  }

  function openEdit(t: Transaction) {
    setEditing(t);
    setShowForm(true);
  }

  function closeForm() {
    setShowForm(false);
    setEditing(undefined);
  }

  const fmt = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 });
  const filterButtons: { key: Filter; label: string }[] = [
    { key: ALL, label: "Todos" },
    { key: "ingreso", label: "Ingresos" },
    { key: "gasto", label: "Gastos" },
    { key: "ahorro", label: "Ahorro" },
    { key: "inversion", label: "Inversión" },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">{transactions.length} registros totales</p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton transactions={visible} label={`Exportar (${visible.length})`} />
          <button onClick={load} className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors" title="Recargar">
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button onClick={() => setShowForm(true)} className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors">
            <Plus size={16} /> Nueva transacción
          </button>
        </div>
      </div>

      {syncError && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 flex justify-between">
          <span>⚠ {syncError} — guardado localmente.</span>
          <button onClick={() => setSyncError("")} className="text-red-400 hover:text-red-600">✕</button>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex rounded-lg border border-gray-200 bg-white overflow-hidden text-sm">
          {filterButtons.map(({ key, label }) => (
            <button key={key} onClick={() => setFilter(key)} className={`px-3 py-1.5 font-medium transition-colors ${filter === key ? "bg-emerald-600 text-white" : "text-gray-600 hover:bg-gray-50"}`}>
              {label}
            </button>
          ))}
        </div>

        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value)}
          className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-600 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="all">Todas las categorías</option>
          {ALL_CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <div className="relative flex-1 min-w-40">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
      </div>

      {/* Tabla */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-gray-400">Cargando desde GitHub...</div>
        ) : visible.length === 0 ? (
          <div className="py-16 text-center text-gray-400">
            <p className="text-lg font-medium">Sin transacciones</p>
            <p className="text-sm mt-1">Agrega una o espera que llegue desde Telegram</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Categoría</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Descripción</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Monto</th>
                <th className="px-4 py-3"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {visible.map((t) => (
                <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500">{t.date}</td>
                  <td className="px-4 py-3">
                    <span className="inline-block px-2 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: TYPE_COLORS[t.type] + "20", color: TYPE_COLORS[t.type] }}>
                      {TYPE_LABELS[t.type]}
                    </span>
                  </td>
                  <td className="px-4 py-3 font-medium text-gray-800">{t.category}</td>
                  <td className="px-4 py-3 text-gray-500 max-w-xs truncate">{t.description || "—"}</td>
                  <td className="px-4 py-3 text-right font-semibold" style={{ color: TYPE_COLORS[t.type] }}>
                    {t.type === "gasto" ? "-" : "+"}{fmt.format(t.amount)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2 justify-end">
                      <button onClick={() => openEdit(t)} className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"><Pencil size={14} /></button>
                      <button onClick={() => setToDelete(t.id)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {toDelete && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 shadow-xl max-w-sm w-full mx-4">
            <h3 className="font-semibold text-gray-900 text-lg mb-2">¿Eliminar transacción?</h3>
            <p className="text-gray-500 text-sm mb-5">Esta acción no se puede deshacer.</p>
            <div className="flex gap-3">
              <button onClick={() => setToDelete(null)} className="flex-1 py-2 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50">Cancelar</button>
              <button onClick={() => handleDelete(toDelete)} disabled={deleting} className="flex-1 py-2 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 disabled:opacity-50">
                {deleting ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showForm && <TransactionForm initial={editing} onClose={closeForm} onSaved={load} />}
    </div>
  );
}
