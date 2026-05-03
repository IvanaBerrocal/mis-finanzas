export type TransactionType = "ingreso" | "gasto" | "ahorro" | "inversion";

export const CATEGORIES: Record<TransactionType, string[]> = {
  ingreso: ["Salario", "Freelance", "Negocio", "Inversión", "Regalo", "Otro"],
  gasto: ["Alimentación", "Transporte", "Vivienda", "Salud", "Educación", "Entretenimiento", "Ropa", "Servicios", "Otro"],
  ahorro: ["Fondo emergencia", "Metas corto plazo", "Metas largo plazo", "Otro"],
  inversion: ["Acciones", "Criptomonedas", "Fondos mutuos", "Bienes raíces", "Negocio", "Otro"],
};

export const TYPE_LABELS: Record<TransactionType, string> = {
  ingreso: "Ingreso",
  gasto: "Gasto",
  ahorro: "Ahorro",
  inversion: "Inversión",
};

export const TYPE_COLORS: Record<TransactionType, string> = {
  ingreso: "#10b981",
  gasto: "#ef4444",
  ahorro: "#3b82f6",
  inversion: "#8b5cf6",
};

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  amount: number;
  description: string;
  date: string; // ISO date string YYYY-MM-DD
  createdAt: string;
}
