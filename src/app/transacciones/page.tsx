"use client";
import { useState, useEffect, useCallback } from "react";
import { Plus, RefreshCw, Pencil, Trash2, Search } from "lucide-react";
import { loadTransactions, removeTransaction } from "@/lib/storage";
import { Transaction, TransactionType, TransactionOwner, TYPE_LABELS, OWNER_LABELS, TYPE_COLORS } from "@/lib/types";
import TransactionForm from "@/components/TransactionForm";
import ExportButton from "@/components/ExportButton";

const typeTextColor: Record<TransactionType, string> = {
  ingreso: "text-emerald-600",
  gasto: "text-red-500",
  ahorro: "text-blue-600",
  inversion: "text-purple-600",
};

const typeBadge: Record<TransactionType, string> = {
  ingreso: "bg-emerald-100 text-emerald-700",
  gasto: "bg-red-100 text-red-700",
  ahorro: "bg-blue-100 text-blue-700",
  inversion: "bg-purple-100 text-purple-700",
};

const ownerBadge: Record<TransactionOwner, string> = {
  propios: "bg-teal-100 text-teal-700",
  mama: "bg-pink-100 text-pink-700",
};

export default function TransaccionesPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filtros
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<TransactionType | "todas">("todas");
  const [filterOwner, setFilterOwner] = useState<TransactionOwner | "todas">("todas");
  const [filterMonth, setFilterMonth] = useState<string>(""); // "YYYY-MM" o ""

  const load = useCallback(async () => {
    setLoading(true);
    const { transactions: t } = await loadTransactions();
    setTransactions(t);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  // Meses disponibles para el filtro
  const availableMonths = Array.from(
    new Set(transactions.map((t) => t.date.slice(0, 7)))
  ).sort((a, b) => b.localeCompare(a));

  // Filtrado
  const filtered = transactions.filter((t) => {
    if (filterType !== "todas" && t.type !== filterType) return false;
    if (filterOwner !== "todas" && t.owner !== filterOwner) return false;
    if (filterMonth && !t.date.startsWith(filterMonth)) return false;
    if (search) {
      const q = search.toLowerCase();
      if (
        !t.category.toLowerCase().includes(q) &&
        !t.description.toLowerCase().includes(q) &&
        !t.amount.toString().includes(q)
      ) return false;
    }
    return true;
  });

  async function handleDelete(id: string) {
    setDeletingId(id);
    await removeTransaction(id);
    setDeletingId(null);
    setConfirmDeleteId(null);
    load();
  }

  return (
    <div className="p-4 sm:p-6 max-w-5xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Transacciones</h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            {loading ? "Cargando..." : `${filtered.length} registros`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <ExportButton transactions={filtered} label="Exportar" />
          <button
            onClick={load}
            className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
            title="Recargar"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 bg-emerald-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-emerald-700 transition-colors"
          >
            <Plus size={15} /> Nueva
          </button>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 mb-4 space-y-3">

        {/* Búsqueda */}
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por categoría, descripción o monto..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {/* Filtros de tipo, cuenta y mes */}
        <div className="flex flex-wrap gap-2">

          {/* Tipo */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value as TransactionType | "todas")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todas">Todos los tipos</option>
            {(Object.keys(TYPE_LABELS) as TransactionType[]).map((t) => (
              <option key={t} value={t}>{TYPE_LABELS[t]}</option>
            ))}
          </select>

          {/* Cuenta */}
          <select
            value={filterOwner}
            onChange={(e) => setFilterOwner(e.target.value as TransactionOwner | "todas")}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="todas">Todas las cuentas</option>
            {(Object.keys(OWNER_LABELS) as TransactionOwner[]).map((o) => (
              <option key={o} value={o}>{OWNER_LABELS[o]}</option>
            ))}
          </select>

          {/* Mes */}
          <select
            value={filterMonth}
            onChange={(e) => setFilterMonth(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">Todos los meses</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>

          {/* Limpiar filtros */}
          {(filterType !== "todas" || filterOwner !== "todas" || filterMonth || search) && (
            <button
              onClick={() => { setFilterType("todas"); setFilterOwner("todas"); setFilterMonth(""); setSearch(""); }}
              className="text-sm text-gray-500 hover:text-red-500 px-3 py-1.5 rounded-lg border border-gray-200 hover:border-red-200 transition-colors"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      </div>

      {/* Lista */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-16">
            {loading ? "Cargando transacciones..." : "No hay transacciones que coincidan"}
          </p>
        ) : (
          <div className="divide-y divide-gray-50">
            {filtered.map((t) => (
              <div key={t.id} className="flex items-center justify-between px-4 py-3 hover:bg-gray-50 transition-colors group">

                {/* Info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-800 text-sm truncate">{t.category}</p>
                    <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${typeBadge[t.type]}`}>
                      {TYPE_LABELS[t.type]}
                    </span>
                    {t.owner && (
                      <span className={`text-xs px-1.5 py-0.5 rounded-full font-medium ${ownerBadge[t.owner]}`}>
                        {OWNER_LABELS[t.owner]}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    {t.date}{t.description && ` · ${t.description}`}
                  </p>
                </div>

                {/* Monto + acciones */}
                <div className="flex items-center gap-2 shrink-0 ml-3">
                  <span className={`font-semibold text-sm whitespace-nowrap ${typeTextColor[t.type]}`}>
                    {t.type === "gasto" ? "-" : "+"}S/ {t.amount.toFixed(2)}
                  </span>

                  {/* Botones — visibles en hover */}
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditingTransaction(t)}
                      className="p-1.5 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                      title="Editar"
                    >
                      <Pencil size={13} />
                    </button>

                    {confirmDeleteId === t.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleDelete(t.id)}
                          disabled={deletingId === t.id}
                          className="text-xs px-2 py-1 bg-red-500 text-white rounded-md hover:bg-red-600 transition-colors disabled:opacity-60"
                        >
                          {deletingId === t.id ? "..." : "Confirmar"}
                        </button>
                        <button
                          onClick={() => setConfirmDeleteId(null)}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-md hover:bg-gray-200 transition-colors"
                        >
                          No
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setConfirmDeleteId(t.id)}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 size={13} />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal nueva transacción */}
      {showForm && (
        <TransactionForm
          onClose={() => setShowForm(false)}
          onSaved={load}
        />
      )}

      {/* Modal editar transacción */}
      {editingTransaction && (
        <TransactionForm
          initial={editingTransaction}
          onClose={() => setEditingTransaction(null)}
          onSaved={() => { setEditingTransaction(null); load(); }}
        />
      )}
    </div>
  );
}
