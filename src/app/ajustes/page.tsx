"use client";
import { useState, useEffect } from "react";
import { saveConfig, clearConfig, getStoredConfig } from "@/lib/github";
import { Settings, CheckCircle, XCircle, Eye, EyeOff } from "lucide-react";

export default function AjustesPage() {
  const [token, setToken] = useState("");
  const [owner, setOwner] = useState("IvanaBerrocal");
  const [repo, setRepo] = useState("mis-finanzas");
  const [showToken, setShowToken] = useState(false);
  const [saved, setSaved] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<"ok" | "fail" | null>(null);

  useEffect(() => {
    const cfg = getStoredConfig();
    if (cfg) {
      setToken(cfg.token);
      setOwner(cfg.owner);
      setRepo(cfg.repo);
    }
  }, []);

  function handleSave() {
    saveConfig({ token, owner, repo });
    setSaved(true);
    setTestResult(null);
    setTimeout(() => setSaved(false), 2500);
  }

  function handleClear() {
    clearConfig();
    setToken("");
    setTestResult(null);
  }

  async function handleTest() {
    setTesting(true);
    setTestResult(null);
    try {
      const res = await fetch(
        `https://api.github.com/repos/${owner}/${repo}/contents/data/transactions.json`,
        { headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json" } }
      );
      setTestResult(res.ok ? "ok" : "fail");
    } catch {
      setTestResult("fail");
    } finally {
      setTesting(false);
    }
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Settings size={24} className="text-gray-700" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Ajustes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Configura la sincronización con GitHub</p>
        </div>
      </div>

      {/* Explicación */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-6 text-sm text-blue-800">
        <p className="font-semibold mb-1">¿Para qué sirve esto?</p>
        <p>Al configurar tu token de GitHub, tus transacciones se guardan en tu repositorio (<code>data/transactions.json</code>). Esto permite que el bot de Telegram agregue gastos automáticamente y que los veas aquí.</p>
        <p className="mt-2">
          Crea un token en:{" "}
          <span className="font-mono bg-blue-100 px-1 rounded">
            github.com → Settings → Developer settings → Personal access tokens → Fine-grained → Repo contents: Read & Write
          </span>
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Usuario GitHub</label>
            <input
              value={owner}
              onChange={(e) => setOwner(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Repositorio</label>
            <input
              value={repo}
              onChange={(e) => setRepo(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Token de GitHub (PAT)</label>
          <div className="relative">
            <input
              type={showToken ? "text" : "password"}
              value={token}
              onChange={(e) => setToken(e.target.value)}
              placeholder="github_pat_..."
              className="w-full border border-gray-300 rounded-lg px-3 py-2 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button
              onClick={() => setShowToken(!showToken)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
            >
              {showToken ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          <p className="text-xs text-gray-400 mt-1">Se guarda solo en tu navegador, nunca se envía a terceros.</p>
        </div>

        {testResult && (
          <div className={`flex items-center gap-2 text-sm px-3 py-2 rounded-lg ${testResult === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"}`}>
            {testResult === "ok" ? <CheckCircle size={16} /> : <XCircle size={16} />}
            {testResult === "ok" ? "Conexión exitosa — GitHub configurado correctamente" : "Error: verifica el token y que el repo exista"}
          </div>
        )}

        <div className="flex gap-3 pt-1">
          <button
            onClick={handleTest}
            disabled={!token || testing}
            className="px-4 py-2 text-sm font-medium border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 transition-colors"
          >
            {testing ? "Probando..." : "Probar conexión"}
          </button>
          <button
            onClick={handleSave}
            disabled={!token}
            className="flex-1 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-40 transition-colors"
          >
            {saved ? "¡Guardado!" : "Guardar configuración"}
          </button>
          {token && (
            <button
              onClick={handleClear}
              className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition-colors"
            >
              Borrar
            </button>
          )}
        </div>
      </div>

      {/* Estado actual */}
      <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-600">
        <p className="font-medium mb-1">Estado actual</p>
        {token ? (
          <p className="text-emerald-600">✓ Sincronización con GitHub activada — los cambios se guardan en <code>{owner}/{repo}</code></p>
        ) : (
          <p className="text-yellow-600">⚠ Sin token — los datos se guardan solo en este navegador (localStorage)</p>
        )}
      </div>
    </div>
  );
}
