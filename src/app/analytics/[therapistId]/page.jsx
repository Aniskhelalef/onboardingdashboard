"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Loader2, Eye, MousePointerClick, BarChart3, ArrowUpRight, RefreshCw } from "lucide-react";

const PLACEMENTS = [
  { key: "navbar", label: "Navbar" },
  { key: "hero", label: "Hero" },
  { key: "after_specialties", label: "Après Spécialités" },
  { key: "after_deroulement", label: "Après Déroulement" },
  { key: "after_faq", label: "Après FAQ" },
  { key: "sticky_footer", label: "Footer sticky" },
];

function StatCard({ icon: Icon, label, value, sub, accent }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${accent ? "bg-[#FC6D41]/10" : "bg-gray-100"}`}>
          <Icon className={`w-4.5 h-4.5 ${accent ? "text-[#FC6D41]" : "text-gray-500"}`} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold text-[#2D2D2D]">{value}</p>
        <p className="text-xs text-gray-400 mt-0.5">{label}</p>
        {sub && <p className="text-[10px] text-gray-300 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

function PlacementRow({ label, count, max }) {
  const pct = max > 0 ? (count / max) * 100 : 0;
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500 w-36 shrink-0 truncate">{label}</span>
      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
        <div
          className="h-full bg-[#FC6D41] rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-[#2D2D2D] w-10 text-right">{count}</span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { therapistId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [range, setRange] = useState("30d");

  const getDateRange = (r) => {
    const to = new Date();
    to.setDate(to.getDate() + 1); // Include all of today regardless of timezone
    const from = new Date();
    if (r === "7d") from.setDate(from.getDate() - 7);
    else if (r === "30d") from.setDate(from.getDate() - 30);
    else if (r === "90d") from.setDate(from.getDate() - 90);
    else from.setFullYear(from.getFullYear() - 1);
    return {
      from: from.toISOString().split("T")[0],
      to: to.toISOString().split("T")[0],
    };
  };

  const fetchData = useCallback((showLoader = true) => {
    if (!therapistId) return;
    if (showLoader) setLoading(true);

    const { from, to } = getDateRange(range);
    fetch(`/api/analytics/${therapistId}?from=${from}&to=${to}&_t=${Date.now()}`)
      .then((res) => res.json())
      .then((json) => setData(json))
      .catch(() => setData(null))
      .finally(() => setLoading(false));
  }, [therapistId, range]);

  // Initial load + when range changes
  useEffect(() => { fetchData(); }, [fetchData]);

  // Auto-refresh every 30s
  useEffect(() => {
    const interval = setInterval(() => fetchData(false), 30_000);
    return () => clearInterval(interval);
  }, [fetchData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-gray-300 animate-spin" />
      </div>
    );
  }

  if (!data || data.error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-sm text-gray-400">{data?.error || "Erreur de chargement."}</p>
      </div>
    );
  }

  const conversionRate = data.visits > 0
    ? ((data.clickSessions / data.visits) * 100).toFixed(1)
    : "0.0";

  const maxPlacement = Math.max(...Object.values(data.clicksByPlacement || {}), 1);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-3xl mx-auto px-5 py-10">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-lg font-bold text-[#2D2D2D]">Analytiques</h1>
            <p className="text-xs text-gray-400 mt-0.5">ID: {therapistId}</p>
          </div>

          <div className="flex items-center gap-2">
            {/* Refresh button */}
            <button
              onClick={() => fetchData(false)}
              className="p-2 rounded-lg border border-gray-200 bg-white text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors cursor-pointer"
              title="Rafraîchir"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
            {/* Date range picker */}
            <div className="flex items-center gap-1 bg-white rounded-xl border border-gray-200 p-1">
              {[
                { key: "7d", label: "7j" },
                { key: "30d", label: "30j" },
                { key: "90d", label: "90j" },
                { key: "1y", label: "1 an" },
              ].map((r) => (
                <button
                  key={r.key}
                  onClick={() => setRange(r.key)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    range === r.key
                      ? "bg-[#2D2D2D] text-white"
                      : "text-gray-500 hover:bg-gray-100"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <StatCard
            icon={Eye}
            label="Visites"
            value={data.visits.toLocaleString("fr-FR")}
            sub="Total pages vues"
          />
          <StatCard
            icon={MousePointerClick}
            label="Clics RDV"
            value={data.clickSessions.toLocaleString("fr-FR")}
            sub="Sessions uniques avec clic"
            accent
          />
          <StatCard
            icon={ArrowUpRight}
            label="Taux de conversion"
            value={`${conversionRate}%`}
            sub="Clics / Visites"
          />
        </div>

        {/* Clicks by placement */}
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
          <div className="flex items-center gap-2 mb-4">
            <BarChart3 className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-[#2D2D2D]">Clics par emplacement</h2>
            <span className="text-xs text-gray-300 ml-auto">{data.totalClicks} clics total</span>
          </div>
          <div className="flex flex-col gap-3">
            {PLACEMENTS.map((p) => (
              <PlacementRow
                key={p.key}
                label={p.label}
                count={data.clicksByPlacement?.[p.key] || 0}
                max={maxPlacement}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
