"use client";
import { Transaction } from "./types";
import { fetchTransactions, writeTransactions } from "./github";

const LOCAL_KEY = "finanzas_transactions";

// --- localStorage fallback ---
export function getLocalTransactions(): Transaction[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(LOCAL_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function setLocalTransactions(t: Transaction[]) {
  localStorage.setItem(LOCAL_KEY, JSON.stringify(t));
}

// --- Primary: GitHub, fallback: localStorage ---
export async function loadTransactions(): Promise<{ transactions: Transaction[]; source: "github" | "local" }> {
  const remote = await fetchTransactions();
  if (remote.length > 0 || localStorage.getItem("finanzas_github_config")) {
    setLocalTransactions(remote); // cache locally
    return { transactions: remote, source: "github" };
  }
  return { transactions: getLocalTransactions(), source: "local" };
}

export async function saveTransaction(t: Transaction): Promise<{ ok: boolean; error?: string }> {
  const current = getLocalTransactions();
  const idx = current.findIndex((x) => x.id === t.id);
  if (idx >= 0) current[idx] = t; else current.unshift(t);
  setLocalTransactions(current);

  return writeTransactions(current);
}

export async function removeTransaction(id: string): Promise<{ ok: boolean; error?: string }> {
  const current = getLocalTransactions().filter((t) => t.id !== id);
  setLocalTransactions(current);
  return writeTransactions(current);
}

export function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
