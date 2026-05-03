export type TransactionType = "ingreso" | "gasto" | "ahorro" | "inversion";

export const CATEGORIES: Record<TransactionType, string[]> = {
  ingreso: ["Salario", "Freelance", "Negocio", "Inversión", "Bono", "Regalo", "Otro ingreso"],
  gasto: [
    "Comida y bebida",
    "Supermercado",
    "Restaurante / Delivery",
    "Transporte",
    "Gasolina",
    "Vivienda / Alquiler",
    "Servicios básicos",
    "Salud y farmacia",
    "Educación",
    "Entretenimiento",
    "Ropa y calzado",
    "Tecnología",
    "Viajes",
    "Deporte",
    "Cuidado personal",
    "Mascotas",
    "Regalos",
    "Suscripciones",
    "Otro gasto",
  ],
  ahorro: ["Fondo de emergencia", "Meta corto plazo", "Meta largo plazo", "Otro ahorro"],
  inversion: ["Acciones", "Criptomonedas", "Fondos mutuos", "Negocio", "Bienes raíces", "Otra inversión"],
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
  date: string;
  createdAt: string;
}

export interface GithubConfig {
  token: string;
  owner: string;
  repo: string;
}
