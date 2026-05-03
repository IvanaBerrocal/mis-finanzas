const fs = require("fs");
const path = require("path");

const transactions = JSON.parse(
  fs.readFileSync(path.join(__dirname, "../data/transactions.json"), "utf-8")
);

// Target: last month
const now = new Date();
const target = new Date(now.getFullYear(), now.getMonth() - 1, 1);
const year = target.getFullYear();
const month = String(target.getMonth() + 1).padStart(2, "0");
const monthKey = `${year}-${month}`;
const monthName = target.toLocaleDateString("es-PE", { month: "long", year: "numeric" });

const monthly = transactions.filter((t) => t.date.startsWith(monthKey));

const fmt = (n) => `S/ ${Number(n).toFixed(2)}`;

const sum = (type) =>
  monthly.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0);

const ingresos = sum("ingreso");
const gastos = sum("gasto");
const ahorro = sum("ahorro");
const inversion = sum("inversion");
const balance = ingresos - gastos;

// Group gastos by category
const byCategory = {};
monthly
  .filter((t) => t.type === "gasto")
  .forEach((t) => {
    byCategory[t.category] = (byCategory[t.category] || 0) + t.amount;
  });

const categoryRows = Object.entries(byCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([cat, amount]) => `| ${cat} | ${fmt(amount)} | ${ingresos > 0 ? ((amount / ingresos) * 100).toFixed(1) + "%" : "—"} |`)
  .join("\n");

const savingRate = ingresos > 0 ? ((ahorro / ingresos) * 100).toFixed(1) : "0";
const expenseRate = ingresos > 0 ? ((gastos / ingresos) * 100).toFixed(1) : "0";

const report = `# Reporte Financiero — ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}

> Generado automáticamente el ${new Date().toLocaleDateString("es-PE")}

## Resumen

| Concepto | Monto |
|---|---|
| 💚 Ingresos totales | ${fmt(ingresos)} |
| 🔴 Gastos totales | ${fmt(gastos)} |
| 🔵 Ahorro | ${fmt(ahorro)} |
| 🟣 Inversión | ${fmt(inversion)} |
| **Balance neto** | **${fmt(balance)}** ${balance >= 0 ? "✅" : "⚠️"} |

## Indicadores

- **Tasa de ahorro:** ${savingRate}% de ingresos ${Number(savingRate) >= 20 ? "✅" : "⚠️ (meta: 20%)"}
- **Gasto sobre ingresos:** ${expenseRate}% ${Number(expenseRate) < 70 ? "✅" : "⚠️ (meta: <70%)"}
- **Inversión activa:** ${inversion > 0 ? "Sí ✅" : "No ⚠️"}

## Gastos por categoría

| Categoría | Monto | % del ingreso |
|---|---|---|
${categoryRows || "| Sin gastos registrados | — | — |"}

## Transacciones del mes (${monthly.length} total)

| Fecha | Tipo | Categoría | Descripción | Monto |
|---|---|---|---|---|
${monthly
  .map(
    (t) =>
      `| ${t.date} | ${t.type} | ${t.category} | ${t.description || "—"} | ${t.type === "gasto" ? "-" : "+"}${fmt(t.amount)} |`
  )
  .join("\n") || "| Sin transacciones | | | | |"}
`;

const reportsDir = path.join(__dirname, "../reports");
if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir);
const outPath = path.join(reportsDir, `${monthKey}.md`);
fs.writeFileSync(outPath, report, "utf-8");
console.log(`Reporte generado: reports/${monthKey}.md`);
