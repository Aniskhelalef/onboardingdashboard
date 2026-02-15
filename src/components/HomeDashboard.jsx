import { useState } from 'react'
import theralysLogo from '../assets/theralys-logo.svg'

// ── Mock Data ────────────────────────────────────────────
const TRAFFIC_DATA = [20, 35, 45, 55, 80, 95, 120, 160, 190, 175, 200, 185]
const TRAFFIC_MONTHS = ['Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan 25', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
const RANKING_DATA = [45, 42, 38, 35, 28, 20, 14, 9, 6, 4, 3, 3]
const RANKING_MONTHS = ['Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan 25', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']

// ── Smooth bezier path helper ────────────────────────────
const pointsToPath = (points) => {
  if (points.length < 2) return ''
  let d = `M${points[0].x},${points[0].y}`
  for (let i = 1; i < points.length; i++) {
    const prev = points[i - 1]
    const curr = points[i]
    const cpx = (prev.x + curr.x) / 2
    d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
  }
  return d
}

// ── Traffic Chart (orange area) ──────────────────────────
const TrafficChart = ({ isEmpty }) => {
  const W = 700, H = 240, PAD_L = 50, PAD_R = 20, PAD_T = 30, PAD_B = 35
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B
  const maxVal = 250
  const yTicks = [0, 50, 100, 150, 200, 250]

  const points = TRAFFIC_DATA.map((v, i) => ({
    x: PAD_L + (i / (TRAFFIC_DATA.length - 1)) * chartW,
    y: PAD_T + chartH - (v / maxVal) * chartH,
  }))

  const linePath = pointsToPath(points)
  const areaPath = linePath + ` L${points[points.length - 1].x},${PAD_T + chartH} L${points[0].x},${PAD_T + chartH} Z`

  // Highlighted point (index 7 = Fév, value 160)
  const hlIdx = 7
  const hlPoint = points[hlIdx]

  return (
    <div className="relative flex-1 min-h-0">
      <svg viewBox={`0 0 ${W} ${H}`} className={`absolute inset-0 w-full h-full ${isEmpty ? 'opacity-15' : ''}`} preserveAspectRatio="xMinYMin meet" style={{ fontFamily: 'Inter, sans-serif' }}>
        <defs>
          <linearGradient id="trafficGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#FC6D41" stopOpacity="0.25" />
            <stop offset="100%" stopColor="#FC6D41" stopOpacity="0.02" />
          </linearGradient>
        </defs>

        {/* Grid lines + Y labels */}
        {yTicks.map((tick) => {
          const y = PAD_T + chartH - (tick / maxVal) * chartH
          return (
            <g key={tick}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
              <text x={PAD_L - 10} y={y + 4} textAnchor="end" fill="#9CA3AF" fontSize="11">{tick}</text>
            </g>
          )
        })}

        {/* X labels */}
        {TRAFFIC_MONTHS.map((m, i) => {
          const x = PAD_L + (i / (TRAFFIC_MONTHS.length - 1)) * chartW
          const anchor = i === 0 ? 'start' : i === TRAFFIC_MONTHS.length - 1 ? 'end' : 'middle'
          return <text key={m} x={x} y={H - 8} textAnchor={anchor} fill="#9CA3AF" fontSize="11">{m}</text>
        })}

        {!isEmpty && (
          <>
            {/* Area fill */}
            <path d={areaPath} fill="url(#trafficGrad)" />

            {/* Line */}
            <path d={linePath} fill="none" stroke="#FC6D41" strokeWidth="2.5" strokeLinecap="round" />

            {/* Highlighted point */}
            <line x1={hlPoint.x} y1={hlPoint.y} x2={hlPoint.x} y2={PAD_T + chartH} stroke="#FC6D41" strokeWidth="1" strokeDasharray="4 3" />
            <circle cx={hlPoint.x} cy={hlPoint.y} r="5" fill="#FC6D41" stroke="white" strokeWidth="2" />

            {/* Tooltip */}
            <g transform={`translate(${hlPoint.x - 28}, ${hlPoint.y - 34})`}>
              <rect x="0" y="0" width="56" height="26" rx="6" fill="white" stroke="#E5E7EB" strokeWidth="1" />
              <text x="16" y="17" fill="#F59E0B" fontSize="13">★</text>
              <text x="30" y="17" fill="#2D2D2D" fontSize="12" fontWeight="600">{TRAFFIC_DATA[hlIdx]}</text>
            </g>
          </>
        )}
      </svg>

    </div>
  )
}

// ── Ranking Chart (green line, inverted Y) ───────────────
const RankingChart = ({ isEmpty }) => {
  const W = 700, H = 200, PAD_L = 50, PAD_R = 20, PAD_T = 20, PAD_B = 30
  const chartW = W - PAD_L - PAD_R
  const chartH = H - PAD_T - PAD_B
  const minRank = 1, maxRank = 50
  const yTicks = [1, 10, 20, 30, 40, 50]

  // Inverted: rank 1 at top, rank 50 at bottom
  const rankToY = (rank) => PAD_T + ((rank - minRank) / (maxRank - minRank)) * chartH

  const points = RANKING_DATA.map((v, i) => ({
    x: PAD_L + (i / (RANKING_DATA.length - 1)) * chartW,
    y: rankToY(v),
  }))

  const linePath = pointsToPath(points)

  return (
    <div className="relative flex-1 min-h-0">
      <svg viewBox={`0 0 ${W} ${H}`} className={`absolute inset-0 w-full h-full ${isEmpty ? 'opacity-15' : ''}`} preserveAspectRatio="xMinYMin meet" style={{ fontFamily: 'Inter, sans-serif' }}>
        {/* Grid lines + Y labels */}
        {yTicks.map((tick) => {
          const y = rankToY(tick)
          return (
            <g key={tick}>
              <line x1={PAD_L} y1={y} x2={W - PAD_R} y2={y} stroke="#E5E7EB" strokeWidth="1" strokeDasharray="4 3" />
              <text x={PAD_L - 10} y={y + 4} textAnchor="end" fill="#9CA3AF" fontSize="11">{tick}</text>
            </g>
          )
        })}

        {/* X labels */}
        {RANKING_MONTHS.map((m, i) => {
          const x = PAD_L + (i / (RANKING_MONTHS.length - 1)) * chartW
          const anchor = i === 0 ? 'start' : i === RANKING_MONTHS.length - 1 ? 'end' : 'middle'
          return <text key={m} x={x} y={H - 8} textAnchor={anchor} fill="#9CA3AF" fontSize="11">{m}</text>
        })}

        {!isEmpty && (
          <>
            <path d={linePath} fill="none" stroke="#22C55E" strokeWidth="2.5" strokeLinecap="round" />
            {/* End point */}
            <circle cx={points[points.length - 1].x} cy={points[points.length - 1].y} r="4" fill="#22C55E" stroke="white" strokeWidth="2" />
          </>
        )}
      </svg>

    </div>
  )
}

// ── Main Component ───────────────────────────────────────
const HomeDashboard = ({ userData, onGoToOnboarding }) => {
  const [dashboardState, setDashboardState] = useState(0)
  const [timePeriod, setTimePeriod] = useState('Semaine')
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [customRange, setCustomRange] = useState({ from: '2026-02-01', to: '2026-02-15' })
  const prenom = userData?.prenom || 'Théo'
  const profession = userData?.profession || 'Naturopathe'
  const ville = userData?.ville || 'Lyon'

  const isEmpty = dashboardState === 0

  const stats = [
    {
      label: 'Visites',
      value: 75,
      change: 33,
      color: '#FC6D41',
      bgColor: 'bg-orange-50',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2">
          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      ),
    },
    {
      label: 'Clics RDV',
      value: 75,
      change: 33,
      color: '#8B5CF6',
      bgColor: 'bg-violet-50',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
      ),
    },
    {
      label: 'Avis Google',
      value: 75,
      change: 33,
      color: '#F59E0B',
      bgColor: 'bg-amber-50',
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#F59E0B">
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ),
    },
  ]

  const actions = isEmpty
    ? [
        { label: 'Finir mon site et le publier 🔥', done: false },
        { label: 'Activer le SEO Automatique 🔥', done: false },
        { label: "Découvrir l'outils de collecte d'Avis", done: false },
      ]
    : [
        { label: 'Finir mon site et le publier 🔥', done: true },
        { label: 'Activer le SEO Automatique 🔥', done: true },
        { label: "Découvrir l'outils de collecte d'Avis", done: false },
      ]

  const actionsDone = actions.filter((a) => a.done).length
  const actionsProgress = Math.round((actionsDone / actions.length) * 100)

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col">
      {/* Dev nav */}
      <div className="fixed top-1/2 -translate-y-1/2 right-0 z-50 flex flex-col gap-1 bg-gray-900/90 backdrop-blur rounded-l-lg px-2 py-2">
        {[
          { id: 0, label: 'State 0 (New)' },
          { id: 1, label: 'State 1 (Active)' },
        ].map((s) => (
          <button
            key={s.id}
            onClick={() => setDashboardState(s.id)}
            className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
              dashboardState === s.id ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            {s.label}
          </button>
        ))}
        <div className="w-px h-4 bg-gray-600 self-center mx-1" />
        <button
          onClick={onGoToOnboarding}
          className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
        >
          ← Onboarding
        </button>
      </div>

      {/* Top nav */}
      <nav className="bg-white border-b border-gray-100 px-8 py-3 flex items-center justify-between">
        {/* Logo */}
        <img src={theralysLogo} alt="Theralys" className="h-7" />

        {/* Nav items */}
        <div className="flex items-center gap-1">
          <button className="flex items-center gap-2 px-4 py-2 rounded-full border border-color-1 text-color-1 text-sm font-medium cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Accueil
          </button>
          {[
            { label: 'Référencement', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
            { label: 'Modification du Site', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
            { label: 'Parrainage', icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg> },
          ].map((item) => (
            <button key={item.label} className="flex items-center gap-2 px-4 py-2 text-sm text-gray-500 hover:text-color-1 transition-colors cursor-pointer">
              {item.icon}
              {item.label}
            </button>
          ))}
        </div>

        {/* Right icons */}
        <div className="flex items-center gap-3">
          <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-color-1 hover:border-gray-300 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-color-1 hover:border-gray-300 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
              <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
            </svg>
          </button>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex gap-6 p-6 max-w-[1400px] mx-auto flex-1 overflow-hidden w-full">
        {/* ── Left column ── */}
        <div className="flex-[7] space-y-4 overflow-hidden flex flex-col">
          {/* Stats header card */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex-[3] min-h-0 flex flex-col relative overflow-hidden">
            {/* Row 1: Greeting + period controls */}
            <div className="flex items-center justify-between mb-3">
              <h1 className="text-xl font-bold text-color-1">Bonjour {prenom}</h1>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <select
                    value={timePeriod}
                    onChange={(e) => {
                      const val = e.target.value
                      setTimePeriod(val)
                      if (val === 'Personnaliser') setShowDatePicker(true)
                      else setShowDatePicker(false)
                    }}
                    className="appearance-none bg-gray-100 rounded-full pl-3 pr-7 py-1.5 text-xs font-medium text-color-1 cursor-pointer focus:outline-none"
                  >
                    <option value="Aujourd'hui">Aujourd'hui</option>
                    <option value="Semaine">Semaine</option>
                    <option value="Mois">Mois</option>
                    <option value="Année">Année</option>
                    <option value="Personnaliser">Personnaliser</option>
                  </select>
                  <svg className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>

                  {/* Custom date range popover */}
                  {showDatePicker && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-xl border border-gray-200 shadow-lg p-4 z-30 w-64">
                      <p className="text-xs font-semibold text-color-1 mb-3">Période personnalisée</p>
                      <div className="space-y-2">
                        <div>
                          <label className="text-[11px] text-gray-400 mb-0.5 block">Du</label>
                          <input
                            type="date"
                            value={customRange.from}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, from: e.target.value }))}
                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-color-1 focus:outline-none focus:border-color-2"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] text-gray-400 mb-0.5 block">Au</label>
                          <input
                            type="date"
                            value={customRange.to}
                            onChange={(e) => setCustomRange(prev => ({ ...prev, to: e.target.value }))}
                            className="w-full text-xs border border-gray-200 rounded-lg px-3 py-2 text-color-1 focus:outline-none focus:border-color-2"
                          />
                        </div>
                      </div>
                      <button
                        onClick={() => setShowDatePicker(false)}
                        className="mt-3 w-full py-2 bg-color-2 text-white text-xs font-semibold rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                      >
                        Appliquer
                      </button>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-color-1 transition-colors cursor-pointer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  </button>
                  <span className="text-xs text-gray-500 font-medium px-1 min-w-[80px] text-center">
                    {timePeriod === 'Aujourd\'hui' ? '15 févr. 2026'
                      : timePeriod === 'Semaine' ? '9–15 févr.'
                      : timePeriod === 'Mois' ? 'Février 2026'
                      : timePeriod === 'Année' ? '2026'
                      : `${new Date(customRange.from).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} – ${new Date(customRange.to).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`}
                  </span>
                  <button className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 hover:text-color-1 transition-colors cursor-pointer">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                  </button>
                </div>
              </div>
            </div>

            {/* Row 2: 3 stat cards */}
            <div className="grid grid-cols-3 gap-3 mb-2">
              {stats.map((stat) => (
                <div key={stat.label} className="border border-gray-100 rounded-xl p-3 flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-lg ${stat.bgColor} flex items-center justify-center flex-shrink-0`}>
                    {stat.icon}
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 mb-0.5">{stat.label}</p>
                    <div className="flex items-baseline gap-1.5">
                      <span className="text-xl font-bold text-color-1">{isEmpty ? '--' : stat.value}</span>
                      {!isEmpty && (
                        <span className="text-xs font-medium text-green-500">↑ {stat.change}%</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <TrafficChart isEmpty={isEmpty} />

            {isEmpty && (
              <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="bg-orange-50 rounded-2xl px-6 py-5 flex items-start gap-4 max-w-md shadow-sm">
                  <span className="text-3xl flex-shrink-0">🔥</span>
                  <div>
                    <p className="font-bold text-color-1 mb-1">Disponible dans 7 jours</p>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">Les premières statistiques de votre site seront disponibles au bout de 7 jours de mise en ligne.</p>
                    <div className="w-full h-2.5 bg-orange-100 rounded-full overflow-hidden">
                      <div className="h-full bg-color-2 rounded-full" style={{ width: '45%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* SEO / Ranking section */}
          <div className="bg-white rounded-2xl border border-gray-100 p-4 flex-[2] min-h-0 flex flex-col relative overflow-hidden">
            {/* Keyword pill + ranking card */}
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="px-4 py-1.5 rounded-full border border-gray-200 text-sm text-gray-600">
                  Mot clé "<span className="font-medium">{profession}</span>" + "<span className="font-medium">{ville}</span>"
                </span>
              </div>
              <div className="flex items-center gap-3 border border-gray-100 rounded-xl px-4 py-2">
                {/* Google G logo */}
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                <div>
                  <p className="text-xs text-gray-400">Classement Google</p>
                  <div className="flex items-baseline gap-2">
                    {isEmpty ? (
                      <span className="text-2xl font-bold text-color-1">--</span>
                    ) : (
                      <>
                        <span className="text-2xl font-bold text-color-1">3<span className="text-base">ème</span></span>
                        <span className="text-xs font-medium text-green-500">↑ 24 places</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <RankingChart isEmpty={isEmpty} />

            {isEmpty && (
              <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                <div className="bg-green-50 rounded-2xl px-6 py-5 flex items-start gap-4 max-w-md shadow-sm">
                  <div className="w-10 h-10 rounded-lg bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  </div>
                  <div>
                    <p className="font-bold text-color-1 mb-1">Disponible dans 30 jours</p>
                    <p className="text-sm text-gray-500 mb-3 leading-relaxed">L'outils de gestion du classement local s'active après 30 jours de collecte de données.</p>
                    <div className="w-full h-2.5 bg-green-100 rounded-full overflow-hidden">
                      <div className="h-full bg-green-500 rounded-full" style={{ width: '60%' }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ── Right sidebar ── */}
        <div className="flex-[3] space-y-3 overflow-hidden flex flex-col">
          {/* Actions card — matches left traffic card height */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5 flex-[3] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-color-1">Actions</h3>
              <span className={`text-sm font-bold ${actionsProgress > 0 ? 'text-green-500' : 'text-gray-300'}`}>{actionsProgress}%</span>
            </div>

            {/* Progress bar */}
            <div className="w-full h-2 bg-gray-100 rounded-full mb-5 overflow-hidden">
              <div
                className="h-full bg-green-500 rounded-full transition-all duration-500"
                style={{ width: `${actionsProgress}%` }}
              />
            </div>

            {/* Checklist */}
            <div className="space-y-3">
              {actions.map((action, i) => (
                <div key={i} className="flex items-center gap-3">
                  {action.done ? (
                    <div className="w-5 h-5 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                  ) : (
                    <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${action.done ? 'line-through text-green-500' : 'text-color-1'}`}>
                    {action.label}
                  </span>
                </div>
              ))}
            </div>

            {/* Suggestion CTA — inside actions card */}
            <div className="mt-auto pt-4">
              <div className="bg-orange-50 rounded-xl p-4 flex items-start gap-3">
                <div className="w-9 h-9 rounded-lg bg-white border border-orange-100 flex items-center justify-center flex-shrink-0">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2">
                    <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                    <polyline points="9 22 9 12 15 12 15 22" />
                  </svg>
                </div>
                <div>
                  <p className="font-semibold text-sm text-color-1">Obtenez + d'avis Google</p>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">Configurez votre outils de collecte d'avis pour renforcer votre crédibilité locale.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Last article */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h3 className="font-semibold text-color-1 mb-3">Dernier article</h3>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <p className="text-sm font-medium text-color-1">Titre de l'article</p>
                <p className="text-xs text-gray-400 mt-0.5">sujet de l'article</p>
              </div>
              <div className="w-14 h-14 rounded-lg bg-gradient-to-br from-orange-100 to-amber-50 flex items-center justify-center flex-shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="1.5">
                  <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              </div>
            </div>
          </div>

          {/* Quoi de neuf */}
          <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#8B5CF6" strokeWidth="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-sm text-color-1">Quoi de neuf ?</p>
                  <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">3</span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">Génération d'article V2 · 11 fev. 26</p>
              </div>
            </div>
            {/* Carousel dots */}
            <div className="flex items-center gap-1.5 mt-3 justify-end">
              <div className="w-6 h-2 rounded-full bg-color-2" />
              <div className="w-2 h-2 rounded-full bg-gray-200" />
              <div className="w-2 h-2 rounded-full bg-gray-200" />
            </div>
          </div>

          {/* Referral banner */}
          <div className="bg-color-2 rounded-2xl p-5 text-white">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
                </svg>
              </div>
              <div>
                <p className="font-bold text-sm">Bénéficier de 2 mois gratuits</p>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">Parrainez un ami(e). Il bénéficie d'un mois gratuit et vous bénéficiez de 2 mois gratuits.</p>
              </div>
            </div>
          </div>

          {/* Paramètres */}
          <button className="w-full bg-white rounded-2xl border border-gray-100 p-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-600 hover:text-color-1 hover:border-gray-200 transition-colors cursor-pointer">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z" />
            </svg>
            Paramètres
          </button>
        </div>
      </div>
    </div>
  )
}

export default HomeDashboard
