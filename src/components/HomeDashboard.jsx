import { useState, useRef, useEffect, useCallback } from 'react'
import theralysLogo from '../assets/theralys-logo.svg'
import articleImg1 from '../assets/pexels-yankrukov-5794010-min.webp'
import articleImg2 from '../assets/pexels-yankrukov-5794024-min.webp'
import articleImg3 from '../assets/pexels-yankrukov-5793897-min.webp'
import articleImg4 from '../assets/pexels-yankrukov-5793920-min.webp'

const HomeDashboard = ({ userData, onGoToOnboarding, onGoToSiteEditor }) => {
  const [dashboardState, setDashboardState] = useState(0)
  const [devNavVisible, setDevNavVisible] = useState(true)
  const [timePeriod, setTimePeriod] = useState('Depuis la dernière connexion')
  const [timePeriodOpen, setTimePeriodOpen] = useState(false)
  const [customDateFrom, setCustomDateFrom] = useState(null)
  const [customDateTo, setCustomDateTo] = useState(null)
  const [calendarMonth, setCalendarMonth] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const prenom = userData?.prenom || 'Théo'
  const profession = userData?.profession || 'Kinésithérapeute'
  const ville = userData?.ville || 'Lyon'
  const [articleIdx, setArticleIdx] = useState(0)
  const [newsIdx, setNewsIdx] = useState(0)
  const [showSettings, setShowSettings] = useState(false)
  const [settingsTab, setSettingsTab] = useState('compte')
  const [billingPeriod, setBillingPeriod] = useState('annual')

  // Tour state
  const [tourStep, setTourStep] = useState(0)
  const [tourActive, setTourActive] = useState(true)
  const [spotlightRect, setSpotlightRect] = useState(null)

  // Tour refs
  const kpiCardsRef = useRef(null)
  const chartRef = useRef(null)
  const actionsRef = useRef(null)
  const articlesRef = useRef(null)
  const rankingRef = useRef(null)
  const newsRef = useRef(null)
  const news = [
    { title: 'Offre parrainage — Invitez un confrère, gagnez 2 mois', desc: 'Partagez votre lien de parrainage et recevez jusqu\'à 2 mois offerts pour chaque inscription.', date: '15 fév.', tag: 'Offre' },
    { title: 'Boostoncab — Boostez votre visibilité avec Google Ads', desc: 'Nouveau partenariat avec Boostoncab : lancez vos campagnes Google Ads en quelques clics et attirez plus de patients.', date: '12 fév.', tag: 'Partenaire' },
    { title: 'Génération d\'articles V2 — Plus rapide, plus pertinent', desc: 'Vos articles sont désormais générés avec un style plus naturel et adapté à votre spécialité.', date: '11 fév.', tag: 'Nouveau' },
    { title: 'Tableau de bord repensé', desc: 'Visualisez vos statistiques clés en un coup d\'œil avec le nouveau design.', date: '3 fév.', tag: 'Mise à jour' },
    { title: 'Collecte d\'avis automatisée', desc: 'Envoyez automatiquement des demandes d\'avis à vos patients après chaque séance.', date: '20 jan.', tag: 'Nouveau' },
  ]
  const articles = [
    { title: '5 étirements essentiels après une séance de kinésithérapie', date: '12 fév.', status: 'published', img: articleImg1 },
    { title: 'Comment soulager les douleurs lombaires au quotidien', date: '19 fév.', status: 'scheduled', img: articleImg2 },
    { title: 'Les bienfaits du massage sportif pour la récupération', date: '26 fév.', status: 'scheduled', img: articleImg3 },
    { title: 'Prévenir les blessures : conseils pour les coureurs', date: '5 mar.', status: 'scheduled', img: articleImg4 },
  ]

  const calendarDays = (() => {
    const year = calendarMonth.getFullYear()
    const month = calendarMonth.getMonth()
    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const offset = firstDay === 0 ? 6 : firstDay - 1 // Monday start
    const days = []
    for (let i = 0; i < offset; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(new Date(year, month, d))
    return days
  })()

  const handleDayClick = (day) => {
    if (!day) return
    if (!customDateFrom || (customDateFrom && customDateTo)) {
      setCustomDateFrom(day)
      setCustomDateTo(null)
    } else if (day < customDateFrom) {
      setCustomDateFrom(day)
    } else {
      setCustomDateTo(day)
    }
  }

  const isInRange = (day) => {
    if (!day || !customDateFrom || !customDateTo) return false
    return day > customDateFrom && day < customDateTo
  }

  const isSameDay = (a, b) => a && b && a.toDateString() === b.toDateString()

  const [selectedKpi, setSelectedKpi] = useState('visites')
  const [hoveredKpi, setHoveredKpi] = useState(null) // index into activeCard.data
  const [hoveredRank, setHoveredRank] = useState(null) // index into slicedRanking

  // Full 12-month data (Jul–Jun) and month labels
  const allMonths = ['Juil', 'Août', 'Sep', 'Oct', 'Nov', 'Déc', 'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin']
  const fullKpiData = {
    visites: { data: [45, 72, 120, 95, 130, 140, 180, 230, 220, 210, 195, 190] },
    clics:   { data: [20, 35, 50, 45, 60, 70, 90, 110, 105, 100, 95, 88] },
    avis:    { data: [10, 18, 25, 30, 35, 42, 55, 68, 72, 70, 65, 60] },
  }
  const fullRankingData = [27, 24, 19, 18, 15, 12, 8, 5, 3, 3, 4, 3]

  // Determine visible window based on period
  const periodSlice = (() => {
    // Index 0 = Jul, 11 = Jun. "Now" = index 7 (Feb)
    const now = 7
    switch (timePeriod) {
      case "Aujourd'hui": return { start: now, end: now + 1 }
      case 'Semaine': return { start: Math.max(0, now - 1), end: now + 1 }
      case 'Mois': return { start: Math.max(0, now - 1), end: now + 1 }
      case 'Année': return { start: 0, end: 12 }
      case 'Personnaliser': return { start: 0, end: 12 }
      default: return { start: 0, end: 12 } // Depuis la dernière connexion = all
    }
  })()
  // Ensure at least 3 points for a nice curve
  const sliceStart = Math.min(periodSlice.start, periodSlice.end - 3 < 0 ? 0 : periodSlice.end - 3)
  const sliceEnd = Math.max(periodSlice.end, sliceStart + 3)

  const slicedMonths = allMonths.slice(sliceStart, sliceEnd)
  const slicedRanking = fullRankingData.slice(sliceStart, sliceEnd)

  // KPI config with sliced data
  const kpiConfig = {
    visites: {
      label: 'Visites', bg: 'bg-orange-50', activeBorder: 'border-color-2', color: '#FC6D41',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    },
    clics: {
      label: 'Clics RDV', bg: 'bg-indigo-50', activeBorder: 'border-indigo-400', color: '#6366F1',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    avis: {
      label: 'Avis Google', bg: 'bg-amber-50', activeBorder: 'border-amber-400', color: '#F59E0B',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
    },
  }

  // Compute dynamic KPI values from sliced data
  const kpiCards = Object.entries(kpiConfig).map(([key, cfg]) => {
    const sliced = fullKpiData[key].data.slice(sliceStart, sliceEnd)
    const current = sliced[sliced.length - 1]
    const first = sliced[0]
    const change = first > 0 ? Math.round(((current - first) / first) * 100) : 0
    return { key, ...cfg, value: current, change, data: sliced }
  })

  const activeCard = kpiCards.find((c) => c.key === selectedKpi)
  const chartMax = Math.max(...activeCard.data) * 1.15

  // Shared path generator (0–100 space)
  const toPath = (data, max, close, invert = false) => {
    const points = data.map((v, i) => ({
      x: (i / (data.length - 1)) * 100,
      y: invert ? ((v - 1) / (max - 1)) * 100 : 100 - (v / max) * 100,
    }))
    let d = `M${points[0].x},${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const curr = points[i]
      const cpx = (prev.x + curr.x) / 2
      d += ` C${cpx},${prev.y} ${cpx},${curr.y} ${curr.x},${curr.y}`
    }
    if (close) d += ' L100,100 L0,100 Z'
    return d
  }

  // Peak for KPI chart
  const peakIdx = activeCard.data.indexOf(Math.max(...activeCard.data))
  const peakX = (peakIdx / (activeCard.data.length - 1)) * 100
  const peakY = 100 - (activeCard.data[peakIdx] / chartMax) * 100

  const yLabels = (() => {
    const max = Math.ceil(chartMax / 50) * 50
    return [max, Math.round(max * 0.8), Math.round(max * 0.6), Math.round(max * 0.4), Math.round(max * 0.2), 0]
  })()

  // Ranking chart
  const rankingMax = 30
  const rankBestIdx = slicedRanking.indexOf(Math.min(...slicedRanking))
  const rankBestX = (rankBestIdx / (slicedRanking.length - 1)) * 100
  const rankBestY = ((slicedRanking[rankBestIdx] - 1) / (rankingMax - 1)) * 100
  const rankCurrent = slicedRanking[slicedRanking.length - 1]
  const rankFirst = slicedRanking[0]
  const rankChange = rankFirst - rankCurrent

  // Tour steps configuration
  const tourSteps = [
    { ref: kpiCardsRef, title: 'Vos indicateurs clés', description: 'Suivez en un coup d\'œil vos visites, prises de rendez-vous et avis Google. Ces métriques se mettent à jour en temps réel.', icon: '📊', position: 'bottom', padding: 12 },
    { ref: chartRef, title: 'Suivi de performance', description: 'Ce graphique retrace l\'évolution de vos indicateurs dans le temps. Sélectionnez une métrique dans les cartes ci-dessus pour changer la vue.', icon: '📈', position: 'right', padding: 12 },
    { ref: actionsRef, title: 'Vos prochaines étapes', description: 'Votre liste de tâches personnalisée pour maximiser votre visibilité en ligne. Complétez-les une par une pour débloquer tout le potentiel de Theralys.', icon: '✅', position: 'left', padding: 8 },
    { ref: articlesRef, title: 'Articles SEO automatiques', description: 'Des articles optimisés pour le référencement sont publiés automatiquement sur votre site pour attirer de nouveaux patients via Google.', icon: '📝', position: 'left', padding: 8 },
    { ref: rankingRef, title: 'Votre position locale', description: 'Suivez votre classement Google pour votre mot-clé principal. L\'objectif : atteindre le top 3 local pour capter un maximum de patients.', icon: '🏆', position: 'top', padding: 12 },
    { ref: newsRef, title: 'Nouveautés produit', description: 'Restez informé des dernières fonctionnalités et améliorations de Theralys. Nous ajoutons régulièrement de nouveaux outils pour vous.', icon: '✨', position: 'left', padding: 8 },
  ]

  // Spotlight rect calculation
  const updateSpotlightRect = useCallback(() => {
    if (!tourActive || !tourSteps[tourStep]) return
    const el = tourSteps[tourStep].ref.current
    if (!el) return
    const rect = el.getBoundingClientRect()
    const pad = tourSteps[tourStep].padding || 8
    setSpotlightRect({
      top: rect.top - pad,
      left: rect.left - pad,
      width: rect.width + pad * 2,
      height: rect.height + pad * 2,
    })
  }, [tourStep, tourActive])

  useEffect(() => {
    updateSpotlightRect()
    window.addEventListener('resize', updateSpotlightRect)
    return () => window.removeEventListener('resize', updateSpotlightRect)
  }, [updateSpotlightRect])

  // Tour navigation
  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1)
    } else {
      setTourActive(false)
    }
  }
  const handleTourPrev = () => {
    if (tourStep > 0) setTourStep(tourStep - 1)
  }
  const handleTourSkip = () => {
    setTourActive(false)
  }

  // Keyboard navigation
  useEffect(() => {
    if (!tourActive || dashboardState !== 0) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleTourNext()
      if (e.key === 'ArrowLeft') handleTourPrev()
      if (e.key === 'Escape') handleTourSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [tourActive, tourStep, dashboardState])

  // Auto-rotate news every 2s, loop back to first
  useEffect(() => {
    if (showSettings) return
    const interval = setInterval(() => {
      setNewsIdx(prev => (prev + 1) % news.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [showSettings, news.length])

  // Restart tour when switching to state 0
  useEffect(() => {
    if (dashboardState === 0) {
      setTourStep(0)
      setTourActive(true)
    }
  }, [dashboardState])

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col items-center">
      {/* Dev nav — bottom bar */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-50">
        {devNavVisible ? (
          <div className="flex items-center gap-1 bg-gray-900/90 backdrop-blur rounded-t-lg px-2 py-1">
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
            <div className="h-3 w-px bg-gray-600 mx-1" />
            <button
              onClick={onGoToOnboarding}
              className="px-2.5 py-1 rounded text-[11px] font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              Onboarding
            </button>
            <div className="h-3 w-px bg-gray-600 mx-1" />
            <button
              onClick={() => setDevNavVisible(false)}
              className="px-1.5 py-1 rounded text-[11px] font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              ✕
            </button>
          </div>
        ) : (
          <button
            onClick={() => setDevNavVisible(true)}
            className="bg-gray-900/90 backdrop-blur rounded-t-lg px-3 py-0.5 text-[10px] font-medium text-gray-400 hover:text-white transition-colors cursor-pointer"
          >
            DEV
          </button>
        )}
      </div>

      {/* Top nav */}
      <nav className="w-full max-w-[1200px] px-6 pt-4 pb-1">
        <div className="flex items-center justify-between relative">
          {/* Logo */}
          <img src={theralysLogo} alt="Theralys" className="h-6" />

          {/* Center nav — floating pill */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white border border-gray-200 rounded-2xl p-1 gap-0.5">
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-color-1 text-white text-xs font-medium cursor-pointer transition-colors">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
              Accueil
            </button>
            {[
              { label: 'Référencement', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { label: 'Site', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
              { label: 'Parrainage', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
            ].map((item) => (
              <button key={item.label} onClick={item.label === 'Site' ? onGoToSiteEditor : undefined} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs text-gray-400 hover:text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-2">
<button onClick={() => setShowSettings(!showSettings)} className={`w-8 h-8 rounded-full bg-color-2 flex items-center justify-center text-white text-xs font-bold cursor-pointer transition-all ${showSettings ? 'ring-2 ring-color-2/30' : 'hover:ring-2 hover:ring-color-2/30'}`}>
              {prenom.charAt(0)}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-hidden px-6 py-4 w-full max-w-[1200px]">
        {!showSettings ? (
        <div key="dashboard" className="grid grid-cols-[2fr_1fr] grid-rows-[3fr_2fr] gap-3 w-full h-full" style={{ animation: 'settings-slide-out 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* 1 — Top left */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-color-1">Bonjour {prenom}</h1>
                <div className="relative mt-2 inline-block">
                  <button
                    onClick={() => dashboardState === 1 && setTimePeriodOpen(!timePeriodOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-xs text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
                  >
                    {timePeriod === 'Personnaliser' && customDateFrom && customDateTo
                      ? `${customDateFrom.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} — ${customDateTo.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}`
                      : timePeriod}
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${timePeriodOpen ? 'rotate-180' : ''}`}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                  {timePeriodOpen && (
                    <div className="absolute top-full left-0 mt-1 bg-gray-100 rounded-xl py-2 px-1 z-10 min-w-[200px]">
                      {['Depuis la dernière connexion', "Aujourd'hui", 'Semaine', 'Mois', 'Année', 'Personnaliser'].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setTimePeriod(option)
                            if (option !== 'Personnaliser') setTimePeriodOpen(false)
                          }}
                          className={`block w-full text-left px-3 py-2 text-sm rounded-lg transition-colors cursor-pointer ${
                            timePeriod === option ? 'font-semibold text-color-1' : 'text-color-1 hover:bg-gray-200'
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                      {timePeriod === 'Personnaliser' && (
                        <div className="px-2 pt-2 pb-2 border-t border-gray-200 mt-1">
                          {/* Month nav */}
                          <div className="flex items-center justify-between mb-2">
                            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 18l-6-6 6-6"/></svg>
                            </button>
                            <span className="text-xs font-semibold text-color-1 capitalize">
                              {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                          </div>
                          {/* Day headers */}
                          <div className="grid grid-cols-7 mb-1">
                            {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((d) => (
                              <span key={d} className="text-center text-[9px] text-gray-400 font-medium">{d}</span>
                            ))}
                          </div>
                          {/* Days grid */}
                          <div className="grid grid-cols-7 gap-y-0.5">
                            {calendarDays.map((day, i) => {
                              if (!day) return <div key={`e${i}`} />
                              const isStart = isSameDay(day, customDateFrom)
                              const isEnd = isSameDay(day, customDateTo)
                              const inRange = isInRange(day)
                              const isToday = isSameDay(day, new Date())
                              return (
                                <button
                                  key={i}
                                  onClick={() => handleDayClick(day)}
                                  className={`h-6 w-full text-[10px] font-medium cursor-pointer transition-colors ${
                                    isStart || isEnd
                                      ? 'bg-color-1 text-white rounded-full'
                                      : inRange
                                        ? 'bg-gray-200 text-color-1'
                                        : isToday
                                          ? 'text-color-2 font-bold'
                                          : 'text-color-1 hover:bg-gray-200 rounded-full'
                                  } ${isStart ? 'rounded-r-none' : ''} ${isEnd ? 'rounded-l-none' : ''}`}
                                >
                                  {day.getDate()}
                                </button>
                              )
                            })}
                          </div>
                          {/* Apply */}
                          <button
                            onClick={() => setTimePeriodOpen(false)}
                            disabled={!customDateFrom || !customDateTo}
                            className={`w-full py-1.5 mt-2 rounded-lg text-xs font-medium transition-colors ${
                              customDateFrom && customDateTo
                                ? 'bg-color-2 text-white cursor-pointer hover:opacity-90'
                                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            }`}
                          >
                            Appliquer
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div ref={kpiCardsRef} className="flex gap-3">
                {kpiCards.map((kpi) => (
                  <button
                    key={kpi.key}
                    onClick={() => setSelectedKpi(kpi.key)}
                    className={`${kpi.bg} rounded-xl px-4 py-3 min-w-[120px] text-left transition-all cursor-pointer border-2 ${
                      selectedKpi === kpi.key ? kpi.activeBorder : 'border-transparent'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      {kpi.icon}
                      <span className="text-xs font-medium text-color-1">{kpi.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-color-1">{kpi.value}</span>
                      <span className={`text-xs font-semibold ${kpi.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div ref={chartRef} className="flex-1 mt-4 min-h-0 flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between pr-2 text-[10px] text-gray-400 shrink-0 text-right">
                {yLabels.map((v) => <span key={v}>{v}</span>)}
              </div>

              {/* Chart + X-axis */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Curve area */}
                <div
                  className="flex-1 relative min-h-0"
                  onMouseMove={dashboardState === 1 ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const idx = Math.round(x * (activeCard.data.length - 1))
                    setHoveredKpi(Math.max(0, Math.min(idx, activeCard.data.length - 1)))
                  } : undefined}
                  onMouseLeave={dashboardState === 1 ? () => setHoveredKpi(null) : undefined}
                >
                  {/* Grid lines */}
                  {[0, 20, 40, 60, 80, 100].map((pct) => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${pct}%` }} />
                  ))}
                  {/* SVG curve — stretches to fill */}
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={activeCard.color} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={activeCard.color} stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <path d={toPath(activeCard.data, chartMax, true)} fill="url(#areaGrad)" />
                    <path d={toPath(activeCard.data, chartMax, false)} fill="none" stroke={activeCard.color} strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  </svg>

                  {/* Hover tooltip */}
                  {hoveredKpi !== null && (() => {
                    const hx = (hoveredKpi / (activeCard.data.length - 1)) * 100
                    const hy = 100 - (activeCard.data[hoveredKpi] / chartMax) * 100
                    return <>
                      <div className="absolute w-px pointer-events-none" style={{ left: `${hx}%`, top: 0, bottom: 0, backgroundColor: activeCard.color, opacity: 0.2 }} />
                      <div className="absolute pointer-events-none" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -100%)' }}>
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-white text-[10px] font-semibold whitespace-nowrap mb-1 mx-auto w-fit shadow-sm" style={{ borderColor: activeCard.color, color: activeCard.color }}>
                          {activeCard.data[hoveredKpi]}
                          <span className="text-gray-400 font-normal">{slicedMonths[hoveredKpi]}</span>
                        </div>
                      </div>
                      <div className="absolute w-2.5 h-2.5 rounded-full pointer-events-none border-2 border-white shadow-sm" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -50%)', backgroundColor: activeCard.color }} />
                    </>
                  })()}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-[10px] text-gray-400 pt-1.5 shrink-0">
                  {slicedMonths.map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            {/* State 0 overlay */}
            {dashboardState === 0 && !tourActive && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
                <div className="bg-orange-50 rounded-2xl px-6 py-5 max-w-[380px] w-full text-left shadow-sm">
                  <h3 className="text-base font-bold text-color-1 mb-1">🔥 Disponible dans 7 jours</h3>
                  <p className="text-xs text-gray-500 mb-4">Les premières statistiques de votre site seront disponibles au bout de 7 jours de mise en ligne.</p>
                  <div className="w-full h-2 bg-orange-100 rounded-full overflow-hidden">
                    <div className="h-full bg-color-2 rounded-full" style={{ width: '15%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right column — spans both rows */}
          <div className="row-span-2 flex flex-col gap-2.5">

            {/* Actions */}
            <div ref={actionsRef} className="flex-[2.5] bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col min-h-0">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-sm font-bold text-color-1">Actions</h2>
                <div className="flex items-center gap-1">
                  <div className="w-3.5 h-1.5 bg-green-500 rounded-full" />
                  <div className="w-3.5 h-1.5 bg-green-500 rounded-full" />
                  <div className="w-3.5 h-1.5 bg-gray-200 rounded-full" />
                </div>
              </div>
              <div className="flex flex-col gap-2.5 flex-1 justify-center">
                {/* Pending action card — animated border */}
                <div className="relative rounded-xl p-[2px] overflow-hidden" style={{ boxShadow: '0 0 12px rgba(255,69,0,0.3), 0 0 4px rgba(255,215,0,0.2)' }}>
                  <div
                    className="absolute top-1/2 left-1/2"
                    style={{
                      width: '200%',
                      height: '800%',
                      background: 'conic-gradient(from 0deg, #FF4500, #FFD700, #FF1493, #FF4500, #FFD700, #FF6347, #FF4500)',
                      animation: 'border-spin 3s linear infinite',
                    }}
                  />
                  <button className="relative flex items-center gap-3 bg-white rounded-[10px] px-3 py-3 w-full text-left cursor-pointer hover:bg-gray-50 transition-colors">
                    <div className="w-5 h-5 rounded-md border-2 border-color-2 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold text-color-1">Finir de publier le site</p>
                      <p className="text-[9px] text-gray-400 leading-tight mt-0.5">Complétez et mettez en ligne votre site web.</p>
                    </div>
                  </button>
                </div>
                {/* Completed action card */}
                <button className="flex items-center gap-3 bg-green-50 rounded-xl px-3 py-3 w-full text-left cursor-pointer hover:bg-green-100 transition-colors">
                  <div className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-green-600 line-through">Compléter votre profil</p>
                    <p className="text-[9px] text-green-500/70 leading-tight mt-0.5">Ajoutez vos informations professionnelles.</p>
                  </div>
                </button>
                {/* Completed action card */}
                <button className="flex items-center gap-3 bg-green-50 rounded-xl px-3 py-3 w-full text-left cursor-pointer hover:bg-green-100 transition-colors">
                  <div className="w-5 h-5 rounded-md bg-green-500 flex items-center justify-center flex-shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-semibold text-green-600 line-through">Configurer la collecte d'avis</p>
                    <p className="text-[9px] text-green-500/70 leading-tight mt-0.5">Obtenez plus d'avis Google automatiquement.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* Articles carousel */}
            <div ref={articlesRef} className="flex-[2] bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-sm font-bold text-color-1">Articles</h2>
                {dashboardState !== 0 && (
                  <div className="flex items-center gap-1.5 -mr-0.5">
                    {articles.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setArticleIdx(i)}
                        className={`rounded-full transition-all cursor-pointer ${i === articleIdx ? 'w-4 h-1.5 bg-color-2' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Image area — clickable */}
              <button className="relative flex-1 min-h-0 rounded-xl overflow-hidden cursor-pointer group text-left">
                <img src={articles[articleIdx].img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* Badge */}
                <div className="absolute top-1.5 left-2.5">
                  {articles[articleIdx].status === 'published' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-500 text-white text-[9px] font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-white" />
                      Publié le {articles[articleIdx].date}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-color-2 text-white text-[9px] font-semibold">
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      Programmé le {articles[articleIdx].date}
                    </span>
                  )}
                </div>
                {/* Nav arrows on image */}
                {articleIdx > 0 && (
                  <div
                    onClick={(e) => { e.stopPropagation(); setArticleIdx(articleIdx - 1) }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </div>
                )}
                {articleIdx < articles.length - 1 && (
                  <div
                    onClick={(e) => { e.stopPropagation(); setArticleIdx(articleIdx + 1) }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                )}
                {/* Title overlay */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="text-white text-xs font-bold leading-tight drop-shadow-sm">{articles[articleIdx].title}</p>
                </div>
              </button>
              {/* State 0 overlay */}
              {dashboardState === 0 && !tourActive && (
                <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
                  <div className="bg-orange-50 rounded-2xl px-5 py-4 max-w-[260px] w-full text-left shadow-sm">
                    <h3 className="text-sm font-bold text-color-1 mb-1">📝 Publication d'articles SEO</h3>
                    <p className="text-[10px] text-gray-500">Des articles optimisés pour le référencement sont publiés automatiquement sur votre site. Disponible après la mise en ligne.</p>
                  </div>
                </div>
              )}
            </div>

            {/* Quoi de neuf — carousel like Articles */}
            <div ref={newsRef} className="flex-[2] bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0">
              {/* Header */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-sm font-bold text-color-1">Quoi de neuf</h2>
                <div className="flex items-center gap-1.5 -mr-0.5">
                  {news.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setNewsIdx(i)}
                      className={`rounded-full transition-all cursor-pointer ${i === newsIdx ? 'w-4 h-1.5 bg-color-2' : 'w-1.5 h-1.5 bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              </div>
              {/* Card area */}
              <button className="relative flex-1 min-h-0 rounded-xl overflow-hidden cursor-pointer group text-left bg-gradient-to-br from-color-1 to-gray-700">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-3 text-6xl">✨</div>
                </div>
                {/* Tag + Date */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-color-2 text-white text-[9px] font-semibold">
                    {news[newsIdx].tag}
                  </span>
                  <span className="text-white/60 text-[9px] font-medium">{news[newsIdx].date}</span>
                </div>
                {/* Nav arrows */}
                {newsIdx > 0 && (
                  <div
                    onClick={(e) => { e.stopPropagation(); setNewsIdx(newsIdx - 1) }}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </div>
                )}
                {newsIdx < news.length - 1 && (
                  <div
                    onClick={(e) => { e.stopPropagation(); setNewsIdx(newsIdx + 1) }}
                    className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors"
                  >
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                )}
                {/* Title overlay */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="text-white text-xs font-bold leading-tight drop-shadow-sm">{news[newsIdx].title}</p>
                </div>
              </button>
            </div>

          </div>

          {/* 3 — Bottom left — Ranking chart */}
          <div ref={rankingRef} className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-bold text-color-1">Classement Google</h2>
                <p className="text-[10px] text-gray-400 mt-0.5">"{profession} {ville}"</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-2.5">
                <div className="flex items-center gap-2 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-[10px] text-gray-500">Position actuelle</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-color-1">{rankCurrent}<span className="text-xs font-semibold">ème</span></span>
                  <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${rankChange > 0 ? 'text-green-500 bg-green-50' : rankChange < 0 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>{rankChange > 0 ? '↑' : rankChange < 0 ? '↓' : '='} {Math.abs(rankChange)}</span>
                </div>
              </div>
            </div>

            {/* Ranking chart */}
            <div className="flex-1 mt-3 min-h-0 flex">
              {/* Y-axis labels (ranking: 1 at top, 30 at bottom) */}
              <div className="flex flex-col justify-between pr-2 text-[10px] text-gray-400 shrink-0 text-right">
                <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>30</span>
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div
                  className="flex-1 relative min-h-0"
                  onMouseMove={dashboardState === 1 ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const idx = Math.round(x * (slicedRanking.length - 1))
                    setHoveredRank(Math.max(0, Math.min(idx, slicedRanking.length - 1)))
                  } : undefined}
                  onMouseLeave={dashboardState === 1 ? () => setHoveredRank(null) : undefined}
                >
                  {/* Grid lines */}
                  {[0, 20, 40, 60, 80, 100].map((pct) => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${pct}%` }} />
                  ))}
                  {/* SVG curve */}
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="rankGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#22C55E" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#22C55E" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <path d={toPath(slicedRanking, rankingMax, true, true)} fill="url(#rankGrad)" />
                    <path d={toPath(slicedRanking, rankingMax, false, true)} fill="none" stroke="#22C55E" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  </svg>

                  {/* Hover tooltip */}
                  {hoveredRank !== null && (() => {
                    const hx = (hoveredRank / (slicedRanking.length - 1)) * 100
                    const hy = ((slicedRanking[hoveredRank] - 1) / (rankingMax - 1)) * 100
                    return <>
                      <div className="absolute w-px pointer-events-none" style={{ left: `${hx}%`, top: 0, bottom: 0, backgroundColor: '#22C55E', opacity: 0.2 }} />
                      <div className="absolute pointer-events-none" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -100%)' }}>
                        <div className="px-2 py-0.5 rounded-md border border-green-400 bg-white text-[10px] font-semibold text-green-600 whitespace-nowrap mb-1 mx-auto w-fit shadow-sm">
                          #{slicedRanking[hoveredRank]} <span className="text-gray-400 font-normal">{slicedMonths[hoveredRank]}</span>
                        </div>
                      </div>
                      <div className="absolute w-2.5 h-2.5 rounded-full pointer-events-none border-2 border-white bg-green-500 shadow-sm" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -50%)' }} />
                    </>
                  })()}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-[10px] text-gray-400 pt-1.5 shrink-0">
                  {slicedMonths.map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            {/* State 0 overlay */}
            {dashboardState === 0 && !tourActive && (
              <div className="absolute inset-0 z-10 flex items-center justify-center" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
                <div className="bg-green-50 rounded-2xl px-6 py-5 max-w-[380px] w-full text-left shadow-sm">
                  <h3 className="text-base font-bold text-color-1 mb-1">✅ Disponible dans 30 jours</h3>
                  <p className="text-xs text-gray-500 mb-4">L'outils de gestion du classement local s'active après 30 jours de collecte de données.</p>
                  <div className="w-full h-2 bg-green-100 rounded-full overflow-hidden">
                    <div className="h-full bg-green-500 rounded-full" style={{ width: '5%' }} />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        ) : (
        <div key="settings" className="flex gap-6 h-full" style={{ animation: 'settings-slide-in 0.35s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* Left column */}
          <div className="w-[240px] shrink-0 flex flex-col gap-4">
            {/* Settings sidebar */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-5">
              <h2 className="text-base font-bold text-color-1 mb-4">Paramètres</h2>
              <div className="flex flex-col gap-0.5">
                {[
                  { id: 'compte', label: 'Compte' },
                  { id: 'upgrade', label: 'Mise à niveau' },
                  { id: 'billing', label: 'Facturation' },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setSettingsTab(tab.id)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-colors cursor-pointer text-left ${
                      settingsTab === tab.id ? 'text-color-2 font-semibold' : 'text-gray-600 hover:bg-gray-50'
                    }`}
                  >
                    {settingsTab === tab.id && <div className="w-2 h-2 rounded-full bg-color-2" />}
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cancellation card — Notion style */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col">
              <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
              </div>
              <h3 className="text-sm font-bold text-color-1 mb-1">Annulation prévue</h3>
              <p className="text-[11px] text-gray-400 leading-relaxed">Votre abonnement sera annulé le <span className="font-semibold text-red-500">22/02/26.</span></p>
              <button onClick={() => setSettingsTab('billing')} className="mt-3 px-4 py-2 rounded-xl border border-gray-200 text-sm font-semibold text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">
                Réactiver
              </button>
            </div>

            {/* Referral card — animated border */}
            <div className="mt-auto relative rounded-2xl p-[2px] overflow-hidden" style={{ boxShadow: '0 0 12px rgba(255,69,0,0.3), 0 0 4px rgba(255,215,0,0.2)' }}>
              <div
                className="absolute top-1/2 left-1/2"
                style={{
                  width: '200%',
                  height: '800%',
                  background: 'conic-gradient(from 0deg, #FF4500, #FFD700, #FF1493, #FF4500, #FFD700, #FF6347, #FF4500)',
                  animation: 'border-spin 3s linear infinite',
                }}
              />
              <div className="relative rounded-[14px] p-5 flex flex-col overflow-hidden">
                <img src={articleImg1} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: '90% 0%', transform: 'scale(1.3)' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.08) 100%)' }} />
                <div className="relative w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                </div>
                <h3 className="relative text-sm font-bold text-white mb-1">Parrainage</h3>
                <p className="relative text-[11px] text-gray-300 leading-relaxed">Invitez un confrère et gagnez jusqu'à <span className="text-color-2 font-semibold">2 mois offerts.</span></p>
                <button className="relative mt-3 px-4 py-2 rounded-xl bg-color-2 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                  Inviter un confrère
                </button>
              </div>
            </div>
          </div>

          {/* Settings content */}
          <div className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-8 flex flex-col overflow-hidden">
           <div key={settingsTab} className="flex-1 flex flex-col" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
            {/* Compte tab */}
            {settingsTab === 'compte' && (
              <>
                <h2 className="text-xl font-bold text-color-1 mb-6">Compte</h2>
                <div className="flex-1 flex flex-col gap-5">
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-color-1 mb-1.5">Prénom</label>
                      <input type="text" className="input-base" />
                    </div>
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-color-1 mb-1.5">Nom</label>
                      <input type="text" className="input-base" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-1 mb-1.5">Adresse e-mail</label>
                    <input type="email" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-1 mb-1.5">Numéro de téléphone</label>
                    <input type="tel" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-color-1 mb-1.5">Adresse (professionelle)</label>
                    <input type="text" className="input-base" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-color-1 mb-1">Mot de passe</h3>
                    <p className="text-xs text-gray-500 mb-3">Protégez votre compte en réinitialisant votre mot de passe tous les quelques mois.</p>
                    <button className="px-4 py-2 rounded-xl bg-color-2 text-white text-xs font-semibold hover:bg-orange-600 transition-colors cursor-pointer">
                      réinitialiser le mot de passe
                    </button>
                  </div>
                </div>
                <div className="flex items-center justify-between pt-4 mt-auto border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <button className="px-5 py-2 rounded-xl bg-color-2 text-white text-sm font-semibold hover:bg-orange-600 transition-colors cursor-pointer">Sauvegarder</button>
                    <button className="px-5 py-2 rounded-xl border-2 border-gray-300 text-sm font-medium text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">Annuler</button>
                  </div>
                  <button className="px-5 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors cursor-pointer">Supprimer le compte</button>
                </div>
              </>
            )}

            {/* Mise à niveau tab */}
            {settingsTab === 'upgrade' && (() => {
              const prices = {
                starter: { monthly: 59, quarterly: 53, annual: 41 },
                visibilite: { monthly: 79, quarterly: 71, annual: 55 },
              }
              const suffix = { monthly: '/mois', quarterly: '/mois/trimestre', annual: '/mois/an' }
              const currentStarter = prices.starter[billingPeriod]
              const currentVisibilite = prices.visibilite[billingPeriod]
              const currentSuffix = suffix[billingPeriod]

              return (
                <>
                  <h2 className="text-xl font-bold text-color-1 mb-4">Mise à niveau</h2>

                  {/* Billing toggle */}
                  <div className="flex mb-5">
                    <div className="inline-flex items-center gap-0.5 bg-gray-100 rounded-full p-0.5">
                      {[
                        { id: 'monthly', label: 'Mensuel' },
                        { id: 'quarterly', label: 'Trimestriel', badge: '-10%' },
                        { id: 'annual', label: 'Annuel', badge: '-30%' },
                      ].map((period) => (
                        <button
                          key={period.id}
                          onClick={() => setBillingPeriod(period.id)}
                          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            billingPeriod === period.id
                              ? 'bg-white text-color-1 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {period.label}
                          {period.badge && (
                            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${
                              billingPeriod === period.id ? 'bg-color-2/15 text-color-2' : 'bg-gray-200 text-gray-500'
                            }`}>
                              {period.badge}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Pricing cards */}
                  <div className="flex-1 grid grid-cols-2 gap-5 min-h-0">
                    {/* Starter */}
                    <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col">
                      <div className="min-h-[70px]">
                        <h3 className="text-lg font-bold text-color-1 mb-2">Starter</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">Idéal pour un site vitrine design et optimisé pour transformer vos visiteurs en rendez-vous.</p>
                      </div>
                      <p className="text-xs font-semibold text-color-1 mb-3 mt-3">Prix tout inclus</p>
                      <div className="space-y-2.5">
                        {['1 page', 'Aide au copywriting et au positionnement', 'Avis Google automatique', 'Hébergement + domaine + maintenance 5/7'].map((f) => (
                          <div key={f} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-color-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                            </div>
                            <span className="text-sm text-gray-700">{f}</span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-5">
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl font-extrabold text-color-1">{currentStarter}€</span>
                          <span className="text-gray-400 text-xs">{currentSuffix}</span>
                          <span className="text-gray-400 text-xs">engagement 1 an</span>
                        </div>
                        <button className="w-full px-5 py-3 border-2 border-color-2 text-color-2 rounded-full font-semibold text-sm hover:bg-orange-50 transition-colors cursor-pointer">
                          Commencer l'essai gratuit
                        </button>
                      </div>
                    </div>

                    {/* Visibilité */}
                    <div className="border-2 border-color-2 rounded-2xl p-6 flex flex-col relative bg-orange-50/40">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-color-2 text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5">
                        <span>🚀</span> Référencement 3,5x plus rapide
                      </div>
                      <div className="min-h-[70px] mt-1">
                        <h3 className="text-lg font-bold text-color-2 mb-2">Visibilité</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">Idéal vous référencer durablement sur Google et capter les recherches les plus qualifiées de votre secteur.</p>
                      </div>
                      <p className="text-xs font-bold text-color-1 mb-3 mt-3">Tout le forfait basique plus...</p>
                      <div className="space-y-2.5">
                        {[
                          { text: 'Pages ', highlight: 'illimitées' },
                          { text: 'SEO ', highlight: 'accéléré', rest: ' : 30 articles de blog/mois' },
                          { text: 'Analyse des ', highlight: 'mots clés + ranking', rest: ' en temps réel' },
                          { text: 'Statistiques avancées' },
                        ].map((f, i) => (
                          <div key={i} className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-color-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><path d="M20 6L9 17l-5-5"/></svg>
                            </div>
                            <span className="text-sm text-gray-700">
                              {f.text}
                              {f.highlight && <span className="text-color-2 font-semibold">{f.highlight}</span>}
                              {f.rest || ''}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="mt-auto pt-5">
                        <div className="flex items-baseline gap-2 mb-4">
                          <span className="text-3xl font-extrabold text-color-1">{currentVisibilite}€</span>
                          <span className="text-gray-400 text-xs">{currentSuffix}</span>
                          <span className="text-gray-400 text-xs">engagement 1 an</span>
                        </div>
                        <button className="w-full px-5 py-3 bg-color-2 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer">
                          Commencer l'essai gratuit
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )
            })()}

            {/* Facturation tab */}
            {settingsTab === 'billing' && (
              <>
                <h2 className="text-xl font-bold text-color-1 mb-5">Facturation</h2>

                {/* Current plan */}
                <div className="flex items-center justify-between border-2 border-color-2 rounded-2xl px-6 py-4 mb-5" style={{ background: 'linear-gradient(135deg, rgba(252,109,65,0.06) 0%, rgba(252,109,65,0.15) 100%)' }}>
                  <p className="text-sm text-color-1">
                    <span className="font-bold text-color-2">Plan Starter 39€</span> /mois, facturé annuellement
                  </p>
                  <button onClick={() => setSettingsTab('upgrade')} className="px-6 py-2.5 rounded-full bg-color-2 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                    Mettre à niveau
                  </button>
                </div>

                {/* Payment methods */}
                <h3 className="text-sm font-bold text-color-1 mb-2">Vos moyens de paiement</h3>
                <div className="flex items-center justify-between border border-gray-200 rounded-xl px-4 py-3 mb-5">
                  <div className="flex items-center gap-2.5 border border-gray-200 rounded-lg px-3 py-2">
                    <div className="flex items-center gap-0.5">
                      <div className="w-4 h-4 rounded-full bg-red-500 -mr-1.5" />
                      <div className="w-4 h-4 rounded-full bg-yellow-400" />
                    </div>
                    <span className="text-sm font-medium text-color-1">•••• 9464</span>
                  </div>
                  <button className="text-sm text-gray-400 hover:text-color-1 transition-colors cursor-pointer">+ ajouter un moyen de paiement</button>
                </div>

                {/* Invoices */}
                <h3 className="text-sm font-bold text-color-1 mb-2">Vos factures</h3>
                <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden min-h-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Date</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Montant</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Statut</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-xs">Carte</th>
                        <th className="text-center font-medium text-gray-500 px-4 py-2.5 text-xs">Télécharger</th>
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { date: '14/12/25', amount: '39€', status: 'Programmé', statusColor: 'text-gray-400' },
                        { date: '14/11/25', amount: '39€', status: 'Gratuit (parrainage)', statusColor: 'text-green-500' },
                        { date: '14/10/25', amount: '39€', status: 'Payé', statusColor: 'text-green-500' },
                        { date: '14/09/25', amount: '39€', status: 'Payé', statusColor: 'text-green-500' },
                      ].map((inv, i) => (
                        <tr key={i} className="border-b border-gray-100 last:border-0">
                          <td className="px-4 py-3 text-color-1 text-xs">{inv.date}</td>
                          <td className="px-4 py-3 text-color-1 font-semibold text-xs">{inv.amount}</td>
                          <td className={`px-4 py-3 text-xs font-medium ${inv.statusColor}`}>{inv.status}</td>
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center gap-1.5 border border-gray-200 rounded px-2 py-0.5">
                              <div className="flex items-center gap-0">
                                <div className="w-3 h-3 rounded-full bg-red-500 -mr-1" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                              </div>
                              <span className="text-[10px] text-gray-500">•••• 9464</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button className="text-gray-400 hover:text-color-2 transition-colors cursor-pointer">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}

           </div>
          </div>
        </div>
        )}
      </div>

      {/* Tour overlay */}
      {dashboardState === 0 && tourActive && spotlightRect && (() => {
        const step = tourSteps[tourStep]
        const gap = 16
        const cardStyle = { position: 'fixed', zIndex: 50, width: 300 }

        switch (step.position) {
          case 'bottom':
            cardStyle.top = spotlightRect.top + spotlightRect.height + gap
            cardStyle.left = spotlightRect.left
            break
          case 'top':
            cardStyle.bottom = window.innerHeight - spotlightRect.top + gap
            cardStyle.left = spotlightRect.left
            break
          case 'right':
            cardStyle.top = spotlightRect.top
            cardStyle.left = spotlightRect.left + spotlightRect.width + gap
            break
          case 'left':
            cardStyle.top = spotlightRect.top
            cardStyle.right = window.innerWidth - spotlightRect.left + gap
            break
        }

        return (
          <>
            {/* Click capture background */}
            <div className="fixed inset-0 z-40" />
            {/* Spotlight hole */}
            <div
              className="fixed z-40 rounded-2xl pointer-events-none"
              style={{
                top: spotlightRect.top,
                left: spotlightRect.left,
                width: spotlightRect.width,
                height: spotlightRect.height,
                boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
              }}
            />
            {/* Tour card */}
            <div key={tourStep} style={{ ...cardStyle, animation: 'tour-fade-in 0.3s ease' }} className="bg-white rounded-2xl shadow-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-gray-400">{tourStep + 1} / {tourSteps.length}</span>
                <button onClick={handleTourSkip} className="text-xs text-gray-400 hover:text-color-1 cursor-pointer transition-colors">Passer</button>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{step.icon}</span>
                <h3 className="text-sm font-bold text-color-1">{step.title}</h3>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-4">{step.description}</p>
              <div className="flex items-center justify-center gap-1.5 mb-4">
                {tourSteps.map((_, i) => (
                  <div key={i} className={`rounded-full transition-all ${i === tourStep ? 'w-4 h-1.5 bg-color-2' : 'w-1.5 h-1.5 bg-gray-300'}`} />
                ))}
              </div>
              <div className="flex items-center gap-2">
                {tourStep > 0 && (
                  <button onClick={handleTourPrev} className="flex-1 py-2 rounded-xl text-xs font-semibold text-color-1 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">Retour</button>
                )}
                <button onClick={handleTourNext} className="flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-color-1 hover:bg-gray-800 transition-colors cursor-pointer">
                  {tourStep === tourSteps.length - 1 ? 'Commencer' : 'Suivant'}
                </button>
              </div>
            </div>
          </>
        )
      })()}
    </div>
  )
}

export default HomeDashboard
