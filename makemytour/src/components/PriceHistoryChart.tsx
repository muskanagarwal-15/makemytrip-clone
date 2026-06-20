import { useEffect, useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { getPriceHistory } from "@/api";

type Snapshot = { price: number; reason: string; timestamp: number };

const REASON_COLOR: Record<string, string> = {
  HIGH_DEMAND:     "text-red-600 bg-red-50",
  MODERATE_DEMAND: "text-amber-600 bg-amber-50",
  LOW_DEMAND:      "text-emerald-600 bg-emerald-50",
  NORMAL:          "text-gray-600 bg-gray-100",
};

export default function PriceHistoryChart({ resourceId }: { resourceId: string }) {
  const [history, setHistory] = useState<Snapshot[]>([]);

  useEffect(() => {
    if (!resourceId) return;
    getPriceHistory(resourceId).then(setHistory);
  }, [resourceId]);

  if (history.length < 2) return null;

  const data = history.map((s) => ({
    price: s.price,
    reason: s.reason,
    time: new Date(s.timestamp).toLocaleTimeString("en-IN", {
      hour: "2-digit", minute: "2-digit",
    }),
  }));

  const latest = data[data.length - 1];
  const prev   = data[data.length - 2];
  const diff   = latest.price - prev.price;
  const TrendIcon = diff > 0 ? TrendingUp : diff < 0 ? TrendingDown : Minus;
  const trendColor = diff > 0 ? "text-red-500" : diff < 0 ? "text-emerald-500" : "text-gray-400";

  return (
    <div className="bg-white rounded-xl shadow-sm p-5 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-800 text-sm">Price History</h3>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${REASON_COLOR[latest.reason] ?? REASON_COLOR.NORMAL}`}>
            {latest.reason.replace("_", " ")}
          </span>
          <TrendIcon className={`w-4 h-4 ${trendColor}`} />
          <span className={`text-xs font-semibold ${trendColor}`}>
            {diff === 0 ? "Stable" : `${diff > 0 ? "+" : ""}₹${Math.abs(diff).toLocaleString("en-IN")}`}
          </span>
        </div>
      </div>
      <ResponsiveContainer width="100%" height={120}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis dataKey="time" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis hide domain={["auto", "auto"]} />
          <Tooltip
            formatter={(val) => [`₹${Number(val).toLocaleString("en-IN")}`, "Price"]}
            contentStyle={{ fontSize: 12, borderRadius: 8 }}
          />
          <Line
            type="monotone"
            dataKey="price"
            stroke="#e11d48"
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}