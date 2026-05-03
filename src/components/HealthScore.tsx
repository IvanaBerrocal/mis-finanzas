interface Props {
  score: number;
  details: { label: string; ok: boolean; note: string }[];
}

export default function HealthScore({ score, details }: Props) {
  const color =
    score >= 80 ? "text-emerald-600" : score >= 50 ? "text-yellow-600" : "text-red-600";
  const ring =
    score >= 80 ? "stroke-emerald-500" : score >= 50 ? "stroke-yellow-500" : "stroke-red-500";
  const label =
    score >= 80 ? "Excelente" : score >= 60 ? "Buena" : score >= 40 ? "Regular" : "Necesita atención";

  const r = 52;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      <h2 className="font-semibold text-gray-800 mb-4">Salud Financiera</h2>
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 shrink-0">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r={r} fill="none" stroke="#f3f4f6" strokeWidth="10" />
            <circle
              cx="60" cy="60" r={r} fill="none"
              className={ring} strokeWidth="10"
              strokeDasharray={`${dash} ${circ}`}
              strokeLinecap="round"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold ${color}`}>{score}</span>
            <span className="text-xs text-gray-400">/100</span>
          </div>
        </div>
        <div className="flex-1 space-y-2">
          <p className={`font-semibold ${color}`}>{label}</p>
          {details.map((d, i) => (
            <div key={i} className="flex items-start gap-2 text-sm">
              <span className={d.ok ? "text-emerald-500" : "text-red-400"}>
                {d.ok ? "✓" : "✗"}
              </span>
              <div>
                <span className="font-medium text-gray-700">{d.label}:</span>{" "}
                <span className="text-gray-500">{d.note}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
