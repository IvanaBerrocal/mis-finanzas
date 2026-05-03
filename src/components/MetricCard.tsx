interface Props {
  title: string;
  amount: number;
  subtitle?: string;
  color: "green" | "red" | "blue" | "purple" | "yellow";
  icon: React.ReactNode;
}

const colorMap = {
  green: "bg-emerald-50 border-emerald-200 text-emerald-700",
  red: "bg-red-50 border-red-200 text-red-700",
  blue: "bg-blue-50 border-blue-200 text-blue-700",
  purple: "bg-purple-50 border-purple-200 text-purple-700",
  yellow: "bg-yellow-50 border-yellow-200 text-yellow-700",
};

const amountColor = {
  green: "text-emerald-600",
  red: "text-red-600",
  blue: "text-blue-600",
  purple: "text-purple-600",
  yellow: "text-yellow-600",
};

export default function MetricCard({ title, amount, subtitle, color, icon }: Props) {
  const fmt = new Intl.NumberFormat("es-PE", { style: "currency", currency: "PEN", minimumFractionDigits: 2 });
  return (
    <div className={`rounded-xl border p-5 flex flex-col gap-2 ${colorMap[color]}`}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium opacity-80">{title}</span>
        <span className="opacity-60">{icon}</span>
      </div>
      <p className={`text-2xl font-bold ${amountColor[color]}`}>{fmt.format(amount)}</p>
      {subtitle && <p className="text-xs opacity-60">{subtitle}</p>}
    </div>
  );
}
