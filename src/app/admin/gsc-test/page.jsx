"use client";

import { useState, useCallback } from "react";

function Spinner() {
  return (
    <svg
      className="animate-spin h-4 w-4"
      viewBox="0 0 24 24"
      fill="none"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
      />
    </svg>
  );
}

function DebugJson({ label, data }) {
  const [open, setOpen] = useState(false);
  if (!data) return null;
  return (
    <div className="mt-2">
      <button
        onClick={() => setOpen(!open)}
        className="text-xs text-muted-foreground underline"
      >
        {open ? "Hide" : "Show"} {label} response
      </button>
      {open && (
        <pre className="mt-1 p-3 bg-gray-50 border rounded text-xs overflow-x-auto max-h-60">
          {JSON.stringify(data, null, 2)}
        </pre>
      )}
    </div>
  );
}

function StepHeader({ number, title, active }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className={`flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold ${
          active
            ? "bg-primary text-white"
            : "bg-gray-200 text-gray-500"
        }`}
      >
        {number}
      </span>
      <h2 className="text-h2 font-semibold">{title}</h2>
    </div>
  );
}

async function apiCall(endpoint, body) {
  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (!res.ok && !data.error && !data.success === false) {
    throw new Error(`HTTP ${res.status}`);
  }
  return data;
}

export default function GscTestPage() {
  const [domain, setDomain] = useState("");

  // Step 1
  const [tokenData, setTokenData] = useState(null);
  const [tokenLoading, setTokenLoading] = useState(false);
  const [tokenError, setTokenError] = useState(null);
  const [tokenDebug, setTokenDebug] = useState(null);
  const [copied, setCopied] = useState(false);

  // Step 2
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verifyError, setVerifyError] = useState(null);
  const [verifyDebug, setVerifyDebug] = useState(null);

  // Step 3
  const [addResult, setAddResult] = useState(null);
  const [addLoading, setAddLoading] = useState(false);
  const [addDebug, setAddDebug] = useState(null);

  const [sitemapResult, setSitemapResult] = useState(null);
  const [sitemapLoading, setSitemapLoading] = useState(false);
  const [sitemapDebug, setSitemapDebug] = useState(null);

  const [rankingsData, setRankingsData] = useState(null);
  const [rankingsLoading, setRankingsLoading] = useState(false);
  const [rankingsDebug, setRankingsDebug] = useState(null);

  const [ownerEmail, setOwnerEmail] = useState("anis.khelalef@gmail.com");
  const [ownerResult, setOwnerResult] = useState(null);
  const [ownerLoading, setOwnerLoading] = useState(false);
  const [ownerDebug, setOwnerDebug] = useState(null);

  // Quick Rankings (standalone — no wizard needed)
  const [qrDomain, setQrDomain] = useState("osteopathe-auzon.fr");
  const [qrData, setQrData] = useState(null);
  const [qrLoading, setQrLoading] = useState(false);
  const [qrSelectedKw, setQrSelectedKw] = useState(null);
  const [qrHistory, setQrHistory] = useState(null);
  const [qrHistoryLoading, setQrHistoryLoading] = useState(false);
  const [qrHovered, setQrHovered] = useState(null);

  // Quick Add Owner (standalone — no wizard needed)
  const [quickDomain, setQuickDomain] = useState("etiopathe-saint-peray.fr");
  const [quickOwnerEmail, setQuickOwnerEmail] = useState("anis.khelalef@gmail.com");
  const [quickOwnerResult, setQuickOwnerResult] = useState(null);
  const [quickOwnerLoading, setQuickOwnerLoading] = useState(false);
  const [quickOwnerDebug, setQuickOwnerDebug] = useState(null);

  const siteUrl = tokenData?.siteUrl;

  function reset() {
    setDomain("");
    setTokenData(null);
    setTokenLoading(false);
    setTokenError(null);
    setTokenDebug(null);
    setCopied(false);
    setVerifyResult(null);
    setVerifyLoading(false);
    setVerifyError(null);
    setVerifyDebug(null);
    setAddResult(null);
    setAddLoading(false);
    setAddDebug(null);
    setSitemapResult(null);
    setSitemapLoading(false);
    setSitemapDebug(null);
    setRankingsData(null);
    setRankingsLoading(false);
    setRankingsDebug(null);
    setOwnerResult(null);
    setOwnerLoading(false);
    setOwnerDebug(null);
  }

  async function handleGetToken() {
    setTokenLoading(true);
    setTokenError(null);
    setTokenData(null);
    setTokenDebug(null);
    // Reset downstream steps
    setVerifyResult(null);
    setVerifyError(null);
    setAddResult(null);
    setSitemapResult(null);
    setRankingsData(null);
    try {
      const data = await apiCall("/api/admin/gsc/get-token", { domain });
      setTokenDebug(data);
      if (data.error) {
        setTokenError(data.error);
      } else {
        setTokenData(data);
      }
    } catch (err) {
      setTokenError(err.message);
    } finally {
      setTokenLoading(false);
    }
  }

  async function handleVerify() {
    setVerifyLoading(true);
    setVerifyError(null);
    setVerifyResult(null);
    setVerifyDebug(null);
    try {
      const data = await apiCall("/api/admin/gsc/verify", { siteUrl });
      setVerifyDebug(data);
      if (data.error) {
        setVerifyError(data.error);
      } else {
        setVerifyResult(data);
      }
    } catch (err) {
      setVerifyError(err.message);
    } finally {
      setVerifyLoading(false);
    }
  }

  async function handleAddToGsc() {
    setAddLoading(true);
    setAddResult(null);
    setAddDebug(null);
    try {
      const data = await apiCall("/api/admin/gsc/add-to-gsc", { siteUrl });
      setAddDebug(data);
      setAddResult(data);
    } catch (err) {
      setAddResult({ success: false, error: err.message });
    } finally {
      setAddLoading(false);
    }
  }

  async function handleSubmitSitemap() {
    setSitemapLoading(true);
    setSitemapResult(null);
    setSitemapDebug(null);
    try {
      const data = await apiCall("/api/admin/gsc/submit-sitemap", { siteUrl });
      setSitemapDebug(data);
      setSitemapResult(data);
    } catch (err) {
      setSitemapResult({ success: false, error: err.message });
    } finally {
      setSitemapLoading(false);
    }
  }

  async function handleFetchRankings() {
    setRankingsLoading(true);
    setRankingsData(null);
    setRankingsDebug(null);
    try {
      const data = await apiCall("/api/admin/gsc/fetch-rankings", { siteUrl });
      setRankingsDebug(data);
      setRankingsData(data);
    } catch (err) {
      setRankingsData({ error: err.message });
    } finally {
      setRankingsLoading(false);
    }
  }

  function getQrSiteId() {
    const d = qrDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    return `https://${d}/`;
  }

  async function handleQuickRankings() {
    setQrLoading(true);
    setQrData(null);
    setQrSelectedKw(null);
    setQrHistory(null);
    setQrHovered(null);
    try {
      const data = await apiCall("/api/admin/gsc/fetch-rankings", { siteUrl: getQrSiteId() });
      setQrData(data);
      // Auto-select top keyword
      if (data.keywords?.length > 0) {
        handleSelectKeyword(data.keywords[0].query);
      }
    } catch (err) {
      setQrData({ error: err.message });
    } finally {
      setQrLoading(false);
    }
  }

  async function handleSelectKeyword(keyword) {
    setQrSelectedKw(keyword);
    setQrHistoryLoading(true);
    setQrHistory(null);
    setQrHovered(null);
    try {
      const data = await apiCall("/api/admin/gsc/keyword-history", {
        siteUrl: getQrSiteId(),
        keyword,
      });
      setQrHistory(data);
    } catch (err) {
      setQrHistory({ error: err.message });
    } finally {
      setQrHistoryLoading(false);
    }
  }

  // SVG path generator (matches dashboard style)
  const toPath = useCallback((data, max, close, invert = false) => {
    if (!data || data.length < 2) return "";
    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: invert ? ((v - 1) / (max - 1)) * 100 : 100 - (v / max) * 100,
    }));
    let d = `M${points[0].x},${points[0].y}`;
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1];
      const curr = points[i];
      const cpx = (prev.x + curr.x) / 2;
      d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`;
    }
    if (close) d += " L100,100 L0,100 Z";
    return d;
  }, []);

  async function handleQuickAddOwner() {
    setQuickOwnerLoading(true);
    setQuickOwnerResult(null);
    setQuickOwnerDebug(null);
    // Normalize domain to https:// URL format (Site Verification API uses URL-prefix IDs)
    let d = quickDomain.replace(/^https?:\/\//, "").replace(/^www\./, "").replace(/\/$/, "");
    const siteId = `https://${d}/`;
    try {
      const data = await apiCall("/api/admin/gsc/add-owner", {
        siteUrl: siteId,
        email: quickOwnerEmail,
      });
      setQuickOwnerDebug(data);
      setQuickOwnerResult(data);
    } catch (err) {
      setQuickOwnerResult({ success: false, error: err.message });
    } finally {
      setQuickOwnerLoading(false);
    }
  }

  async function handleAddOwner() {
    setOwnerLoading(true);
    setOwnerResult(null);
    setOwnerDebug(null);
    try {
      const data = await apiCall("/api/admin/gsc/add-owner", {
        siteUrl,
        email: ownerEmail,
      });
      setOwnerDebug(data);
      setOwnerResult(data);
    } catch (err) {
      setOwnerResult({ success: false, error: err.message });
    } finally {
      setOwnerLoading(false);
    }
  }

  function copyMetaTag() {
    navigator.clipboard.writeText(tokenData.metaTag);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const verified = verifyResult?.success;

  return (
    <div className="max-w-3xl mx-auto py-10 px-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-h1 font-bold">GSC Verification Test</h1>
          <p className="text-small text-muted-foreground mt-1">
            Internal tool — test the full Google Search Console flow
          </p>
        </div>
        {tokenData && (
          <button
            onClick={reset}
            className="text-sm px-3 py-1.5 rounded-md border border-input hover:bg-gray-50 transition-colors"
          >
            Reset
          </button>
        )}
      </div>

      {/* Quick Rankings */}
      <section className="mb-8">
        {/* Search bar */}
        <div className="flex gap-2 mb-4">
          <input
            type="text"
            value={qrDomain}
            onChange={(e) => setQrDomain(e.target.value)}
            placeholder="example.com"
            disabled={qrLoading}
            onKeyDown={(e) => e.key === "Enter" && qrDomain && handleQuickRankings()}
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleQuickRankings}
            disabled={qrLoading || !qrDomain}
            className="inline-flex items-center gap-2 h-10 px-5 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {qrLoading && <Spinner />}
            Fetch Rankings
          </button>
        </div>

        {qrData?.error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {qrData.error}
          </div>
        )}

        {qrData && !qrData.error && qrData.keywords?.length > 0 && (
          <div className="space-y-4">
            {/* Summary Cards */}
            <div className="grid grid-cols-4 gap-3">
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-color-1">{qrData.totalKeywords}</p>
                <p className="text-xs text-gray-400 mt-0.5">Keywords</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-color-1">{qrData.keywords.reduce((s, k) => s + k.clicks, 0)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total Clicks</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-color-1">{qrData.keywords.reduce((s, k) => s + k.impressions, 0)}</p>
                <p className="text-xs text-gray-400 mt-0.5">Total Impressions</p>
              </div>
              <div className="bg-white border border-gray-200 rounded-2xl p-4 text-center">
                <p className="text-2xl font-bold text-green-500">{qrData.keywords.filter((k) => k.position <= 10).length}</p>
                <p className="text-xs text-gray-400 mt-0.5">Top 10 Keywords</p>
              </div>
            </div>

            {/* Ranking Chart — Dashboard style */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col" style={{ minHeight: 340 }}>
              {/* Header */}
              <div className="flex items-center justify-between mb-1">
                <div>
                  <h2 className="text-base font-bold text-color-1">Google Ranking</h2>
                  <p className="text-sm text-gray-400 mt-0.5">{qrSelectedKw || "Select a keyword"}</p>
                </div>
                {qrHistory?.avgPosition && (
                  <div className="bg-gray-50 rounded-xl px-4 py-2.5">
                    <div className="flex items-center gap-2 mb-1">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                      </svg>
                      <span className="text-sm text-gray-500">Avg position</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-bold text-color-1">
                        {qrHistory.avgPosition}<span className="text-sm font-semibold">{qrHistory.avgPosition <= 1.5 ? "er" : "ème"}</span>
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Chart area */}
              {qrHistoryLoading ? (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  <Spinner /> <span className="ml-2">Loading history...</span>
                </div>
              ) : qrHistory?.history?.length >= 2 ? (
                <div className="flex-1 mt-3 min-h-0 flex" style={{ minHeight: 200 }}>
                  {/* Y-axis */}
                  {(() => {
                    const positions = qrHistory.history.map((h) => h.position);
                    const maxPos = Math.max(30, ...positions);
                    const yLabels = [1, 5, 10, 15, 20, Math.round(maxPos)];
                    return (
                      <div className="flex flex-col justify-between pr-2 text-xs text-gray-400 shrink-0 text-right">
                        {yLabels.map((v) => <span key={v}>{v}</span>)}
                      </div>
                    );
                  })()}

                  <div className="flex-1 flex flex-col min-w-0">
                    {/* Curve area */}
                    {(() => {
                      const positions = qrHistory.history.map((h) => h.position);
                      const rankMax = Math.max(30, ...positions);
                      const xLabels = qrHistory.history.filter((_, i) =>
                        i === 0 || i === qrHistory.history.length - 1 || i % Math.max(1, Math.floor(qrHistory.history.length / 6)) === 0
                      );

                      return (
                        <>
                          <div
                            className="flex-1 relative min-h-0"
                            onMouseMove={(e) => {
                              const rect = e.currentTarget.getBoundingClientRect();
                              const x = (e.clientX - rect.left) / rect.width;
                              const idx = Math.round(x * (positions.length - 1));
                              setQrHovered(Math.max(0, Math.min(idx, positions.length - 1)));
                            }}
                            onMouseLeave={() => setQrHovered(null)}
                          >
                            {/* Grid lines */}
                            {[0, 20, 40, 60, 80, 100].map((pct) => (
                              <div key={pct} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${pct}%` }} />
                            ))}

                            {/* SVG curve */}
                            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                              <defs>
                                <linearGradient id="qrRankGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
                                  <stop offset="100%" stopColor="#22C55E" stopOpacity="0.01" />
                                </linearGradient>
                              </defs>
                              <path d={toPath(positions, rankMax, true, true)} fill="url(#qrRankGrad)" />
                              <path d={toPath(positions, rankMax, false, true)} fill="none" stroke="#22C55E" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                            </svg>

                            {/* Hover tooltip */}
                            {qrHovered !== null && (() => {
                              const hx = (qrHovered / (positions.length - 1)) * 100;
                              const hy = ((positions[qrHovered] - 1) / (rankMax - 1)) * 100;
                              const h = qrHistory.history[qrHovered];
                              const dateLabel = new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
                              return (
                                <>
                                  <div className="absolute w-px pointer-events-none" style={{ left: `${hx}%`, top: 0, bottom: 0, backgroundColor: "#22C55E", opacity: 0.2 }} />
                                  <div className="absolute pointer-events-none" style={{ left: `${hx}%`, top: `${hy}%`, transform: "translate(-50%, -100%)" }}>
                                    <div className="px-2 py-1 rounded-md border border-green-400 bg-white text-xs font-semibold text-green-600 whitespace-nowrap mb-1 mx-auto w-fit shadow-sm">
                                      <span className="text-sm">#{h.position}</span>
                                      <span className="text-gray-400 font-normal ml-1">{dateLabel}</span>
                                      <br />
                                      <span className="text-gray-500 font-normal">{h.clicks} clicks · {h.impressions} imp</span>
                                    </div>
                                  </div>
                                  <div className="absolute w-2.5 h-2.5 rounded-full pointer-events-none border-2 border-white bg-green-500 shadow-sm" style={{ left: `${hx}%`, top: `${hy}%`, transform: "translate(-50%, -50%)" }} />
                                </>
                              );
                            })()}
                          </div>

                          {/* X-axis labels */}
                          <div className="flex justify-between text-xs text-gray-400 pt-1.5 shrink-0">
                            {xLabels.map((h) => (
                              <span key={h.date}>
                                {new Date(h.date).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}
                              </span>
                            ))}
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              ) : qrHistory && !qrHistory.error ? (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  Not enough data points for this keyword
                </div>
              ) : qrHistory?.error ? (
                <div className="flex-1 flex items-center justify-center text-sm text-red-500">
                  {qrHistory.error}
                </div>
              ) : (
                <div className="flex-1 flex items-center justify-center text-sm text-gray-400">
                  Select a keyword below to see its ranking history
                </div>
              )}
            </div>

            {/* Keyword list — clickable */}
            <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-left p-3 font-medium text-gray-500">#</th>
                    <th className="text-left p-3 font-medium text-gray-500">Keyword</th>
                    <th className="text-right p-3 font-medium text-gray-500">Position</th>
                    <th className="text-right p-3 font-medium text-gray-500">Clicks</th>
                    <th className="text-right p-3 font-medium text-gray-500">Impressions</th>
                    <th className="text-right p-3 font-medium text-gray-500">CTR</th>
                  </tr>
                </thead>
                <tbody>
                  {qrData.keywords.map((kw, i) => (
                    <tr
                      key={kw.query}
                      onClick={() => handleSelectKeyword(kw.query)}
                      className={`border-b last:border-0 cursor-pointer transition-colors ${
                        qrSelectedKw === kw.query
                          ? "bg-green-50 hover:bg-green-100"
                          : "hover:bg-gray-50"
                      }`}
                    >
                      <td className="p-3 text-gray-400">{i + 1}</td>
                      <td className="p-3 font-medium text-color-1">
                        {kw.query}
                        {qrSelectedKw === kw.query && (
                          <span className="ml-2 text-[10px] font-semibold text-green-600 bg-green-100 px-1.5 py-0.5 rounded">SELECTED</span>
                        )}
                      </td>
                      <td className={`p-3 text-right font-semibold tabular-nums ${
                        kw.position <= 3 ? "text-green-500" :
                        kw.position <= 10 ? "text-yellow-500" :
                        "text-red-500"
                      }`}>#{kw.position}</td>
                      <td className="p-3 text-right tabular-nums">{kw.clicks}</td>
                      <td className="p-3 text-right tabular-nums">{kw.impressions}</td>
                      <td className="p-3 text-right tabular-nums">{kw.ctr}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="px-3 py-2 bg-gray-50 text-xs text-gray-400 border-t">
                {qrData.totalKeywords} keywords · last 90 days · click a row to see ranking history
              </div>
            </div>
          </div>
        )}

        {qrData && !qrData.error && qrData.keywords?.length === 0 && (
          <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-2xl text-sm text-yellow-700">
            No ranking data yet. Data usually appears within 1-2 weeks after adding a site.
          </div>
        )}
      </section>

      {/* Quick Add Owner */}
      <section className="mb-8 p-6 border-2 border-primary/30 rounded-lg bg-primary/[0.02]">
        <h2 className="text-h2 font-semibold mb-1">Add email as GSC owner</h2>
        <p className="text-xs text-muted-foreground mb-4">
          Directly add a personal email as owner of a verified property (no wizard needed)
        </p>

        <div className="flex flex-col gap-3">
          <div className="flex gap-2">
            <input
              type="text"
              value={quickDomain}
              onChange={(e) => setQuickDomain(e.target.value)}
              placeholder="example.com"
              disabled={quickOwnerLoading}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
            <input
              type="email"
              value={quickOwnerEmail}
              onChange={(e) => setQuickOwnerEmail(e.target.value)}
              placeholder="your@email.com"
              disabled={quickOwnerLoading}
              className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
            />
          </div>
          <button
            onClick={handleQuickAddOwner}
            disabled={quickOwnerLoading || !quickDomain || !quickOwnerEmail}
            onKeyDown={(e) => e.key === "Enter" && quickDomain && quickOwnerEmail && handleQuickAddOwner()}
            className="inline-flex items-center justify-center gap-2 h-10 px-6 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors w-fit"
          >
            {quickOwnerLoading && <Spinner />}
            Add as Owner
          </button>
        </div>

        {quickOwnerResult && (
          <div
            className={`mt-4 p-3 rounded-md text-sm border ${
              quickOwnerResult.success
                ? "bg-green-50 border-green-200 text-green-700"
                : "bg-red-50 border-red-200 text-red-700"
            }`}
          >
            {quickOwnerResult.success ? (
              <div>
                <p>{quickOwnerResult.message || `${quickOwnerEmail} added as owner`}</p>
                {quickOwnerResult.owners && (
                  <p className="mt-1 text-xs">
                    All owners: {quickOwnerResult.owners.join(", ")}
                  </p>
                )}
              </div>
            ) : (
              quickOwnerResult.error
            )}
          </div>
        )}
        <DebugJson label="quick-add-owner" data={quickOwnerDebug} />
      </section>

      {/* Step 1: Get Token */}
      <section className="mb-8 p-6 border rounded-lg">
        <StepHeader number={1} title="Get Verification Token" active={true} />

        <div className="flex gap-3">
          <input
            type="text"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="example.com"
            disabled={tokenLoading}
            onKeyDown={(e) => e.key === "Enter" && domain && handleGetToken()}
            className="flex-1 h-10 rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
          />
          <button
            onClick={handleGetToken}
            disabled={!domain || tokenLoading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {tokenLoading && <Spinner />}
            Get Token
          </button>
        </div>

        {tokenError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
            {tokenError}
          </div>
        )}

        {tokenData && (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground mb-2">
              Site URL: <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">{tokenData.siteUrl}</code>
            </p>
            <div className="flex items-center gap-2">
              <code className="flex-1 block p-3 bg-gray-50 border rounded text-xs overflow-x-auto">
                {tokenData.metaTag}
              </code>
              <button
                onClick={copyMetaTag}
                className="shrink-0 h-10 px-3 rounded-md border border-input hover:bg-gray-50 text-sm transition-colors"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        <DebugJson label="get-token" data={tokenDebug} />
      </section>

      {/* Step 2: Verify */}
      {tokenData && (
        <section className="mb-8 p-6 border rounded-lg animate-fadeIn">
          <StepHeader number={2} title="Verify Site" active={!verified} />

          <p className="text-sm text-muted-foreground mb-4">
            Add the meta tag above to your site&apos;s{" "}
            <code className="bg-gray-100 px-1 py-0.5 rounded text-xs">&lt;head&gt;</code>
            , then click Verify.
          </p>

          <button
            onClick={handleVerify}
            disabled={verifyLoading}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
          >
            {verifyLoading && <Spinner />}
            Verify Site
          </button>

          {verifyError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
              <p>{verifyError}</p>
              <button
                onClick={handleVerify}
                disabled={verifyLoading}
                className="mt-2 inline-flex items-center gap-2 text-sm underline text-red-600 hover:text-red-800"
              >
                {verifyLoading && <Spinner />}
                Retry
              </button>
            </div>
          )}

          {verified && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-md text-sm text-green-700">
              Verification successful
            </div>
          )}

          <DebugJson label="verify" data={verifyDebug} />
        </section>
      )}

      {/* Step 3: After Verification */}
      {verified && (
        <section className="mb-8 p-6 border rounded-lg animate-fadeIn">
          <StepHeader number={3} title="Search Console Actions" active={true} />

          <div className="flex flex-wrap gap-3 mb-4">
            <button
              onClick={handleAddToGsc}
              disabled={addLoading}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-white text-sm font-medium hover:bg-primary/90 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {addLoading && <Spinner />}
              Add to Search Console
            </button>

            <button
              onClick={handleSubmitSitemap}
              disabled={sitemapLoading}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {sitemapLoading && <Spinner />}
              Submit Sitemap
            </button>

            <button
              onClick={handleFetchRankings}
              disabled={rankingsLoading}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-md border border-input bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
            >
              {rankingsLoading && <Spinner />}
              Fetch Rankings
            </button>
          </div>

          {/* Add result */}
          {addResult && (
            <div
              className={`mb-3 p-3 rounded-md text-sm border ${
                addResult.success
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {addResult.success
                ? "Site added to Search Console"
                : addResult.error}
            </div>
          )}
          <DebugJson label="add-to-gsc" data={addDebug} />

          {/* Sitemap result */}
          {sitemapResult && (
            <div
              className={`mb-3 p-3 rounded-md text-sm border ${
                sitemapResult.success
                  ? "bg-green-50 border-green-200 text-green-700"
                  : "bg-red-50 border-red-200 text-red-700"
              }`}
            >
              {sitemapResult.success ? (
                <div>
                  <p>Sitemaps submitted:</p>
                  <ul className="list-disc ml-5 mt-1">
                    {sitemapResult.sitemaps?.map((s) => (
                      <li key={s}>{s}</li>
                    ))}
                  </ul>
                  {sitemapResult.sitemaps?.length === 0 && (
                    <p className="mt-1 text-yellow-600">
                      No sitemaps could be submitted. Check that the URLs are accessible.
                    </p>
                  )}
                </div>
              ) : (
                sitemapResult.error
              )}
            </div>
          )}
          <DebugJson label="submit-sitemap" data={sitemapDebug} />

          {/* Rankings */}
          {rankingsData && (
            <div className="mt-4">
              {rankingsData.error ? (
                <div className="p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-700">
                  {rankingsData.error}
                </div>
              ) : rankingsData.keywords?.length === 0 ? (
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-700">
                  No ranking data yet. This is normal for new or recently added
                  sites. Data usually appears within 1-2 weeks.
                </div>
              ) : (
                <div className="border rounded-lg overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-gray-50 border-b">
                        <th className="text-left p-3 font-medium">#</th>
                        <th className="text-left p-3 font-medium">Keyword</th>
                        <th className="text-right p-3 font-medium">Position</th>
                        <th className="text-right p-3 font-medium">Clicks</th>
                        <th className="text-right p-3 font-medium">Impressions</th>
                        <th className="text-right p-3 font-medium">CTR</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rankingsData.keywords?.map((kw, i) => (
                        <tr
                          key={kw.query}
                          className="border-b last:border-0 hover:bg-gray-50"
                        >
                          <td className="p-3 text-muted-foreground">{i + 1}</td>
                          <td className="p-3 font-medium">{kw.query}</td>
                          <td className="p-3 text-right">{kw.position}</td>
                          <td className="p-3 text-right">{kw.clicks}</td>
                          <td className="p-3 text-right">{kw.impressions}</td>
                          <td className="p-3 text-right">{kw.ctr}%</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="px-3 py-2 bg-gray-50 text-xs text-muted-foreground border-t">
                    {rankingsData.totalKeywords} keywords (last 90 days)
                  </div>
                </div>
              )}
            </div>
          )}
          <DebugJson label="fetch-rankings" data={rankingsDebug} />

          {/* Add Owner */}
          <div className="mt-6 pt-6 border-t">
            <h4 className="text-sm font-semibold mb-3">Add personal email as owner</h4>
            <p className="text-xs text-muted-foreground mb-3">
              So the site also appears in your personal Google Search Console
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                value={ownerEmail}
                onChange={(e) => setOwnerEmail(e.target.value)}
                placeholder="your@email.com"
                className="flex-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
              />
              <button
                onClick={handleAddOwner}
                disabled={ownerLoading || !ownerEmail}
                className="inline-flex items-center gap-2 h-9 px-4 rounded-md border border-input bg-white text-sm font-medium hover:bg-gray-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                {ownerLoading && <Spinner />}
                Add as Owner
              </button>
            </div>

            {ownerResult && (
              <div
                className={`mt-3 p-3 rounded-md text-sm border ${
                  ownerResult.success
                    ? "bg-green-50 border-green-200 text-green-700"
                    : "bg-red-50 border-red-200 text-red-700"
                }`}
              >
                {ownerResult.success ? (
                  <div>
                    <p>{ownerResult.message || `${ownerEmail} added as owner`}</p>
                    {ownerResult.owners && (
                      <p className="mt-1 text-xs">
                        All owners: {ownerResult.owners.join(", ")}
                      </p>
                    )}
                  </div>
                ) : (
                  ownerResult.error
                )}
              </div>
            )}
            <DebugJson label="add-owner" data={ownerDebug} />
          </div>
        </section>
      )}

      {/* Flow Diagrams */}
      <div className="mt-12 border-t pt-10">
        <h2 className="text-h1 font-bold mb-2">How it works</h2>
        <p className="text-small text-muted-foreground mb-8">
          Current test flow vs. the automated production flow
        </p>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Current Flow */}
          <div className="border rounded-lg p-6">
            <div className="flex items-center gap-2 mb-5">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                NOW
              </span>
              <h3 className="text-h3 font-semibold">Manual Test Flow</h3>
            </div>

            <div className="space-y-0">
              <FlowStep
                number="1"
                title="Enter domain"
                desc="Admin types domain in this test page"
                actor="Admin"
              />
              <FlowArrow />
              <FlowStep
                number="2"
                title="Get meta tag token"
                desc="API calls Google Site Verification"
                actor="API"
              />
              <FlowArrow />
              <FlowStep
                number="3"
                title="Copy meta tag"
                desc="Admin manually copies the tag"
                actor="Admin"
              />
              <FlowArrow />
              <FlowStep
                number="4"
                title="Add to site &lt;head&gt;"
                desc="Admin manually edits the site HTML"
                actor="Admin"
                highlight
              />
              <FlowArrow />
              <FlowStep
                number="5"
                title="Click Verify"
                desc="API calls webResource.insert (META)"
                actor="API"
              />
              <FlowArrow />
              <FlowStep
                number="6"
                title="Add to GSC + Sitemap"
                desc="Admin clicks buttons one by one"
                actor="Admin"
              />
              <FlowArrow />
              <FlowStep
                number="7"
                title="Fetch rankings"
                desc="Manual check — data appears in 1-2 weeks"
                actor="Admin"
              />
            </div>
          </div>

          {/* Production Flow */}
          <div className="border rounded-lg p-6 border-primary/30 bg-primary/[0.02]">
            <div className="flex items-center gap-2 mb-5">
              <span className="px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                TARGET
              </span>
              <h3 className="text-h3 font-semibold">Automated Production Flow</h3>
            </div>

            <div className="space-y-0">
              <FlowStep
                number="1"
                title="Therapist signs up"
                desc="Creates account, enters their domain"
                actor="User"
              />
              <FlowArrow />
              <FlowStep
                number="2"
                title="Get meta tag token"
                desc="Backend calls Site Verification API automatically"
                actor="Backend"
                auto
              />
              <FlowArrow />
              <FlowStep
                number="3"
                title="Inject meta tag"
                desc="Platform injects tag into the generated site's &lt;head&gt; automatically"
                actor="Backend"
                auto
                highlight
              />
              <FlowArrow />
              <FlowStep
                number="4"
                title="Verify + Add to GSC"
                desc="Backend verifies, adds to SC, submits sitemap — all in one call"
                actor="Backend"
                auto
              />
              <FlowArrow />
              <FlowStep
                number="5"
                title="Cron: fetch rankings"
                desc="Daily/weekly job fetches rankings, stores in Supabase"
                actor="Cron"
                auto
              />
              <FlowArrow />
              <FlowStep
                number="6"
                title="Dashboard shows SEO data"
                desc="Therapist sees their keyword positions in real time"
                actor="User"
              />
            </div>
          </div>
        </div>

        {/* Key differences */}
        <div className="mt-6 p-4 bg-gray-50 border rounded-lg">
          <h4 className="text-sm font-semibold mb-2">Key differences</h4>
          <ul className="text-sm text-muted-foreground space-y-1">
            <li><span className="font-medium text-foreground">Meta tag injection:</span> Currently manual copy-paste — will be auto-injected since we control the generated sites</li>
            <li><span className="font-medium text-foreground">Verification + GSC:</span> Currently 3 separate button clicks — will be a single chained backend call on signup</li>
            <li><span className="font-medium text-foreground">Rankings:</span> Currently on-demand fetch — will be a cron job storing data in Supabase for the dashboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

function FlowStep({ number, title, desc, actor, auto, highlight }) {
  return (
    <div className={`flex gap-3 p-3 rounded-lg ${highlight ? "bg-primary/5 border border-primary/20" : ""}`}>
      <span className="flex items-center justify-center w-6 h-6 rounded-full bg-gray-200 text-xs font-bold text-gray-600 shrink-0 mt-0.5">
        {number}
      </span>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{title}</span>
          {auto && (
            <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-green-100 text-green-700">
              AUTO
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
      </div>
      <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded h-fit shrink-0 ${
        actor === "Admin" ? "bg-yellow-100 text-yellow-700" :
        actor === "API" || actor === "Backend" ? "bg-blue-100 text-blue-700" :
        actor === "Cron" ? "bg-purple-100 text-purple-700" :
        "bg-gray-100 text-gray-600"
      }`}>
        {actor}
      </span>
    </div>
  );
}

function FlowArrow() {
  return (
    <div className="flex justify-start pl-5">
      <div className="w-px h-4 bg-gray-300" />
    </div>
  );
}
