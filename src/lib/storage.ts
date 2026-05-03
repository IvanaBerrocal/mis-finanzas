"use client";
import { Transaction } from "./types";

const KEY = "finanzas_transactions";

export function getTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveTransaction(t: Transaction): void {
  const all = getTransactions();
  const idx = all.findIndex((x) => x.id === t.id);
  if (idx >= 0) {
    all[idx] = t;
  } else {
    all.unshift(t);
  }
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function deleteTransaction(id: string): void {
  const all = getTransactions().filter((t) => t.id !== id);
  localStorage.setItem(KEY, JSON.stringify(all));
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
