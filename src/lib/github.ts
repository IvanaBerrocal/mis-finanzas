"use client";
import { Transaction, GithubConfig } from "./types";

const DATA_PATH = "data/transactions.json";

function getConfig(): GithubConfig | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("finanzas_github_config");
  if (!raw) return null;
  try { return JSON.parse(raw); } catch { return null; }
}

export function saveConfig(config: GithubConfig) {
  localStorage.setItem("finanzas_github_config", JSON.stringify(config));
}

export function clearConfig() {
  localStorage.removeItem("finanzas_github_config");
}

export function getStoredConfig(): GithubConfig | null {
  return getConfig();
}

async function apiRequest(path: string, token: string, options?: RequestInit) {
  return fetch(`https://api.github.com/repos/${path}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28",
      "Content-Type": "application/json",
      ...(options?.headers ?? {}),
    },
  });
}

export async function fetchTransactions(): Promise<Transaction[]> {
  const cfg = getConfig();
  const owner = cfg?.owner ?? "IvanaBerrocal";
  const repo = cfg?.repo ?? "mis-finanzas";
  const token = cfg?.token;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github.raw+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/contents/${DATA_PATH}`,
      { headers, cache: "no-store" }
    );
    if (!res.ok) return [];
    const data = await res.json();
    // Raw+json returns content directly; fallback: decode base64
    if (Array.isArray(data)) return data;
    if (data.content) {
      const decoded = atob(data.content.replace(/\n/g, ""));
      return JSON.parse(decoded);
    }
    return [];
  } catch {
    return [];
  }
}

export async function writeTransactions(transactions: Transaction[]): Promise<{ ok: boolean; error?: string }> {
  const cfg = getConfig();
  if (!cfg?.token) return { ok: false, error: "No hay token de GitHub configurado" };

  const { token, owner, repo } = cfg;

  // Get current SHA
  const fileRes = await apiRequest(`${owner}/${repo}/contents/${DATA_PATH}`, token);
  if (!fileRes.ok && fileRes.status !== 404) {
    return { ok: false, error: "No se pudo leer el archivo en GitHub" };
  }
  const sha = fileRes.ok ? (await fileRes.json()).sha : undefined;

  // Encode content
  const content = btoa(unescape(encodeURIComponent(JSON.stringify(transactions, null, 2))));

  const body: Record<string, string> = {
    message: `Actualizar finanzas - ${new Date().toISOString().split("T")[0]}`,
    content,
  };
  if (sha) body.sha = sha;

  const putRes = await apiRequest(`${owner}/${repo}/contents/${DATA_PATH}`, token, {
    method: "PUT",
    body: JSON.stringify(body),
  });

  if (!putRes.ok) {
    const err = await putRes.json().catch(() => ({}));
    return { ok: false, error: err.message ?? "Error al escribir en GitHub" };
  }
  return { ok: true };
}
