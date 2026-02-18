import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import theralysLogo from '../assets/theralys-logo.svg'
import articleImg1 from '../assets/pexels-yankrukov-5794010-min.webp'
import articleImg2 from '../assets/pexels-yankrukov-5794024-min.webp'
import articleImg3 from '../assets/pexels-yankrukov-5793897-min.webp'
import articleImg4 from '../assets/pexels-yankrukov-5793920-min.webp'
// Additional Pexels library images
import pexGrab1 from '../assets/pexels-karolina-grabowska-4506071-min.webp'
import pexGrab2 from '../assets/pexels-karolina-grabowska-4506076-min.webp'
import pexGrab3 from '../assets/pexels-karolina-grabowska-4506106-min.webp'
import pexGrab4 from '../assets/pexels-karolina-grabowska-4506109-min.webp'
import pexGrab5 from '../assets/pexels-karolina-grabowska-4506113-min.webp'
import pexGrab6 from '../assets/pexels-karolina-grabowska-4506161-min.webp'
import pexGrab7 from '../assets/pexels-karolina-grabowska-4506162-min.webp'
import pexGrab8 from '../assets/pexels-karolina-grabowska-4506169-min.webp'
import pexRyu1 from '../assets/pexels-ryutaro-5473179 (1)-min.webp'
import pexRyu2 from '../assets/pexels-ryutaro-5473182.webp'
import pexRyu3 from '../assets/pexels-ryutaro-5473186_11zon.webp'
import pexRyu4 from '../assets/pexels-ryutaro-5473223.webp'
import pexYank5 from '../assets/pexels-yankrukov-5793909-min.webp'
import pexYank6 from '../assets/pexels-yankrukov-5794043-min.webp'
import pexYank7 from '../assets/pexels-yankrukov-7155367 (1).webp'
import pexYank8 from '../assets/pexels-yankrukov-7155532.webp'
import pexYank9 from '../assets/pexels-yankrukov-7155534 (1).webp'
import pexPolina from '../assets/pexels-polina-tankilevitch-3735747-2048x1365.jpg'

const HomeDashboard = ({ userData, initialTab, onGoToOnboarding, onGoToSiteEditor, onGoToSetup }) => {
  const [activeTab, setActiveTab] = useState(initialTab || 'accueil')
  const [tourFlags, setTourFlags] = useState(() => {
    try { return JSON.parse(localStorage.getItem("tourFlags") || "{}"); } catch { return {}; }
  })
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
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)
  const profileBtnRef = useRef(null)
  const [billingPeriod, setBillingPeriod] = useState('annual')

  // SEO / Référencement tab state
  const [autoPublish, setAutoPublish] = useState(true)
  const [customTitles, setCustomTitles] = useState({}) // key: 'YYYY-M-D' → custom title

  // Specialty distribution state
  const allSpecialties = [
    { id: '1', icon: '\u{1F9B4}', title: 'Douleurs musculaires' },
    { id: '2', icon: '\u{1F930}', title: 'Femmes enceintes' },
    { id: '3', icon: '\u{1F476}', title: 'Nourrissons' },
    { id: '4', icon: '\u26BD', title: 'Sportifs' },
    { id: '5', icon: '\u{1F4BC}', title: 'Troubles posturaux' },
    { id: '6', icon: '\u{1F9D3}', title: 'Seniors' },
  ]
  const [checkedSpecs, setCheckedSpecs] = useState(['1', '2', '3', '4', '5', '6'])
  const [rebalanceMode, setRebalanceMode] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null) // set by useEffect after batch computed
  const [showRepartition, setShowRepartition] = useState(false)
  const [showPexels, setShowPexels] = useState(false)
  const [showParrainageVideo, setShowParrainageVideo] = useState(false)
  const [showNewsModal, setShowNewsModal] = useState(null) // index of news item or null
  const [completedActions, setCompletedActions] = useState(() => {
    try { return JSON.parse(localStorage.getItem("completedActions") || "[]") } catch { return [] }
  })

  // Load specialties from localStorage for granular review actions
  const specialties = (() => {
    try {
      const saved = JSON.parse(localStorage.getItem("setupData") || "{}")
      return saved.specialties || [
        { id: "1", icon: "🦴", title: "Douleurs dorsales" },
        { id: "2", icon: "🤕", title: "Maux de tête" },
        { id: "3", icon: "🏃", title: "Blessures sportives" },
        { id: "4", icon: "👶", title: "Pédiatrie" },
        { id: "5", icon: "🤰", title: "Grossesse" },
        { id: "6", icon: "😴", title: "Troubles du sommeil" },
      ]
    } catch { return [] }
  })()

  const allActions = [
    { id: 'setup', label: 'Configuration du cabinet', phase: 'Identité', action: () => onGoToSetup('contact'), subIds: ['contact', 'cabinet', 'therapists', 'specialties', 'google', 'avis'] },
    { id: 'style', label: 'Choisir le style du site', phase: 'Relecture', action: () => onGoToSiteEditor({ openStyle: true }) },
    { id: 'review-home', label: 'Relire la page d\'accueil', phase: 'Relecture', action: () => onGoToSiteEditor() },
    ...specialties.map(spec => ({
      id: `review-spec-${spec.id}`,
      label: `Relire ${spec.title}`,
      phase: 'Relecture',
      action: () => onGoToSiteEditor(),
    })),
    { id: 'review-blog', label: 'Relire le blog', phase: 'Relecture', action: () => onGoToSiteEditor() },
    { id: 'review-mentions', label: 'Vérifier les mentions légales', phase: 'Relecture', action: () => onGoToSiteEditor() },
    { id: 'domain', label: 'Connecter votre domaine', phase: 'Lancement', action: () => onGoToSetup('domain') },
    { id: 'publish', label: 'Publier votre site', phase: 'Lancement', action: () => onGoToSiteEditor() },
  ]

  const isActionDone = (a) => {
    if (a.subIds) return a.subIds.every(sub => completedActions.includes(sub))
    return completedActions.includes(a.id)
  }
  const pendingActions = allActions.filter(a => !isActionDone(a))
  const doneActions = allActions.filter(a => isActionDone(a))
  const sortedActions = [...pendingActions, ...doneActions]
  const completionPercent = Math.round((doneActions.length / allActions.length) * 100)

  // Dashboard state machine (0-5)
  const dashboardState = (() => {
    if (completionPercent < 100) return 0
    if (!tourFlags.tour1Done) return 1
    if (!tourFlags.delayMet) return 2
    if (!tourFlags.tour2Done) return 3
    return 5
  })()

  const updateTourFlag = (flag) => {
    setTourFlags(prev => {
      const next = { ...prev, ...flag }
      localStorage.setItem("tourFlags", JSON.stringify(next))
      return next
    })
  }

  const toggleAction = (action, e) => {
    e.stopPropagation()
    setCompletedActions(prev => {
      const ids = action.subIds || [action.id]
      const allDone = ids.every(id => prev.includes(id))
      const next = allDone ? prev.filter(x => !ids.includes(x)) : [...new Set([...prev, ...ids])]
      localStorage.setItem("completedActions", JSON.stringify(next))
      return next
    })
  }

  // Sync completed actions when returning from Setup
  useEffect(() => {
    const handler = () => {
      try { setCompletedActions(JSON.parse(localStorage.getItem("completedActions") || "[]")) } catch {}
    }
    window.addEventListener("actionsUpdated", handler)
    // Also re-read on focus (when navigating back)
    window.addEventListener("focus", handler)
    return () => { window.removeEventListener("actionsUpdated", handler); window.removeEventListener("focus", handler) }
  }, [])
  const [pexelsSearch, setPexelsSearch] = useState('')
  const [customArticleImages, setCustomArticleImages] = useState({}) // dayIndex → image
  const [customArticleTitles, setCustomArticleTitles] = useState({}) // dayIndex → title
  const [weekOffset, setWeekOffset] = useState(0) // 0 = this week + next, -1 = prev, +1 = forward
  const [seoFilter, setSeoFilter] = useState(null)
  const activeSpecCount = checkedSpecs.length
  const [seoBadgeIdx, setSeoBadgeIdx] = useState(0)

  const seoItems = [
    { score: 93, label: 'SEO', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { score: 98, label: 'Régularité', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { score: 85, label: 'Balises', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
    { score: 95, label: 'Meta desc.', color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200' },
    { score: 88, label: 'Mots-clés', color: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-200' },
  ]

  const articleImgs = [articleImg1, articleImg2, articleImg3, articleImg4]

  const articleTitlesMap = {
    'Douleurs musculaires': ['5 étirements pour soulager les tensions', 'Prévenir les courbatures après le sport', 'Les causes des douleurs au dos'],
    'Femmes enceintes': ['Exercices doux pendant la grossesse', 'Préparer son corps à l\u2019accouchement', 'Soulager les jambes lourdes enceinte'],
    'Nourrissons': ['Les bienfaits de la kiné pour bébé', 'Torticolis du nourrisson : quand consulter\u00a0?', 'Massage bébé : les gestes essentiels'],
    'Sportifs': ['Récupération sportive : les bons réflexes', 'Prévenir les entorses de cheville', 'Tendinite du coureur : causes et solutions'],
    'Troubles posturaux': ['Améliorer sa posture au bureau', 'Scoliose : exercices de correction', 'Les effets du télétravail sur le dos'],
    'Seniors': ['Garder son équilibre après 60 ans', 'Exercices doux pour l\u2019arthrose', 'Prévenir les chutes : guide pratique'],
  }

  // Rolling 2-week view — continuous, no batch boundaries
  // Published & programmed have fixed specialties (from epoch, never change).
  // Only préprogrammé articles are distributed by current répartition settings.
  const viewData = useMemo(() => {
    const activeSpecs = allSpecialties.filter(s => checkedSpecs.includes(s.id))
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const currentMonday = new Date(today)
    const dow = currentMonday.getDay()
    currentMonday.setDate(currentMonday.getDate() + (dow === 0 ? -6 : 1 - dow))
    const viewStart = new Date(currentMonday)
    viewStart.setDate(viewStart.getDate() + weekOffset * 7)
    // Fixed epoch for deterministic specialty assignment (used for published/programmed)
    const epoch = new Date(2026, 0, 5) // Monday Jan 5 2026
    // Fixed specs snapshot for published/programmed — all 6 specialties always
    const fixedSpecs = allSpecialties
    const days = []
    // First pass: determine status and assign fixed specs to published/programmed
    let preProgIndex = 0
    for (let i = 0; i < 30; i++) {
      const date = new Date(viewStart)
      date.setDate(viewStart.getDate() + i)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const daysSinceEpoch = Math.round((date - epoch) / (1000 * 60 * 60 * 24))
      const daysFromToday = Math.round((date - today) / (1000 * 60 * 60 * 24))
      const published = isPast || isToday
      const programmed = !published && daysFromToday <= 4
      const preProgrammed = !published && daysFromToday > 4
      // Published & programmed use fixed specs (don't change with répartition)
      // Préprogrammé uses current active specs (répartition)
      let spec = null
      if (published || programmed) {
        spec = fixedSpecs[((daysSinceEpoch % fixedSpecs.length) + fixedSpecs.length) % fixedSpecs.length]
      } else if (preProgrammed && activeSpecs.length > 0) {
        spec = activeSpecs[preProgIndex % activeSpecs.length]
        preProgIndex++
      }
      let articleTitle = null, articleImage = null
      if (spec) {
        const titles = articleTitlesMap[spec.title] || ['Article SEO optimis\u00e9']
        articleTitle = titles[((daysSinceEpoch % titles.length) + titles.length) % titles.length]
        articleImage = articleImgs[((daysSinceEpoch % articleImgs.length) + articleImgs.length) % articleImgs.length]
      }
      // Deterministic SEO scores per article (min 93)
      const seed = Math.abs(daysSinceEpoch * 7 + 13)
      const seoRegularite = 93 + (seed % 8)
      const seoBalises = 93 + ((seed * 3 + 5) % 8)
      const seoMeta = 93 + ((seed * 7 + 11) % 8)
      const seoMotsCles = 93 + ((seed * 11 + 3) % 8)
      const seoGlobal = Math.round((seoRegularite + seoBalises + seoMeta + seoMotsCles) / 4)
      days.push({
        index: i, date, dayNum: date.getDate(),
        monthShort: date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', ''),
        published, programmed, preProgrammed,
        specId: spec?.id || null, icon: spec?.icon || null, title: spec?.title || null,
        isToday, daysFromToday, articleTitle, articleImage,
        seo: { global: seoGlobal, regularite: seoRegularite, balises: seoBalises, meta: seoMeta, motsCles: seoMotsCles },
      })
    }
    const readyDays = days.filter(d => d.published || d.programmed).length
    const preProgDays = days.filter(d => d.preProgrammed)
    // Count préprogrammé articles per specialty
    const preProgCounts = {}
    allSpecialties.forEach(s => { preProgCounts[s.id] = 0 })
    preProgDays.forEach(d => { if (d.specId) preProgCounts[d.specId] = (preProgCounts[d.specId] || 0) + 1 })
    const week1Start = `${days[0].dayNum} ${days[0].monthShort}`
    const week2End = `${days[29].dayNum} ${days[29].monthShort}`
    const hasPrev = weekOffset > -4
    const hasNext = weekOffset < 4
    return { days, readyDays, preProgDays: preProgDays.length, preProgCounts, week1Start, week2End, hasPrev, hasNext }
  }, [checkedSpecs, weekOffset])

  // Total published articles (all-time from epoch to today) — fixed, uses all 6 specs
  const totalStats = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const epoch = new Date(2026, 0, 5)
    const totalDays = Math.max(0, Math.round((today - epoch) / (1000 * 60 * 60 * 24)) + 1)
    const counts = {}
    allSpecialties.forEach(s => { counts[s.id] = 0 })
    for (let i = 0; i < totalDays; i++) {
      const spec = allSpecialties[((i % allSpecialties.length) + allSpecialties.length) % allSpecialties.length]
      counts[spec.id] = (counts[spec.id] || 0) + 1
    }
    return { total: totalDays, counts }
  }, [])

  // No auto-select — default to "Sélectionnez un article" empty state

  // Tour state
  const [tourStep, setTourStep] = useState(0)
  const [tourActive, setTourActive] = useState(false)
  const [spotlightRect, setSpotlightRect] = useState(null)

  // Per-block info popup (replaces tour for state 0)
  const [activeBlockInfo, setActiveBlockInfo] = useState(null)
  const [blockInfoDetail, setBlockInfoDetail] = useState(0)
  const [blockSpotlightRect, setBlockSpotlightRect] = useState(null)
  const [seoHighlight, setSeoHighlight] = useState(null)

  // Tour refs
  const statsBlockRef = useRef(null)
  const kpiCardsRef = useRef(null)
  const chartRef = useRef(null)
  const actionsRef = useRef(null)
  const articlesRef = useRef(null)
  const rankingRef = useRef(null)
  const newsRef = useRef(null)
  const seoCalendarRef = useRef(null)
  const seoArticleRef = useRef(null)
  const seoPublicationsRef = useRef(null)
  const news = [
    { title: 'Offre parrainage — Invitez un confrère, gagnez 2 mois', desc: 'Partagez votre lien de parrainage et recevez jusqu\'à 2 mois offerts pour chaque inscription.', date: '15 fév.', tag: 'Offre' },
    { title: 'Boostoncab — Boostez votre visibilité avec Google Ads', desc: 'Nouveau partenariat avec Boostoncab : lancez vos campagnes Google Ads en quelques clics et attirez plus de patients.', date: '12 fév.', tag: 'Partenaire' },
    { title: 'Génération d\'articles V2 — Plus rapide, plus pertinent', desc: 'Vos articles sont désormais générés avec un style plus naturel et adapté à votre spécialité.', date: '11 fév.', tag: 'Nouveau' },
    { title: 'Tableau de bord repensé', desc: 'Visualisez vos statistiques clés en un coup d\'œil avec le nouveau design.', date: '3 fév.', tag: 'Mise à jour' },
    { title: 'Collecte d\'avis automatisée', desc: 'Envoyez automatiquement des demandes d\'avis à vos patients après chaque séance.', date: '20 jan.', tag: 'Nouveau' },
  ]
  const articles = [
    { title: '5 étirements essentiels après une séance de kinésithérapie', date: '12 fév.', realDate: new Date(2026, 1, 12), status: 'published', img: articleImg1 },
    { title: 'Comment soulager les douleurs lombaires au quotidien', date: '19 fév.', realDate: new Date(2026, 1, 19), status: 'scheduled', img: articleImg2 },
    { title: 'Les bienfaits du massage sportif pour la récupération', date: '26 fév.', realDate: new Date(2026, 1, 26), status: 'scheduled', img: articleImg3 },
    { title: 'Prévenir les blessures : conseils pour les coureurs', date: '5 mar.', realDate: new Date(2026, 2, 5), status: 'scheduled', img: articleImg4 },
  ]

  const navigateToArticle = (article) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const currentMonday = new Date(today)
    const dow = currentMonday.getDay()
    currentMonday.setDate(currentMonday.getDate() + (dow === 0 ? -6 : 1 - dow))
    const targetDate = new Date(article.realDate); targetDate.setHours(0, 0, 0, 0)
    // Find which weekOffset puts targetDate in view (30-day window from viewStart)
    const diffDays = Math.round((targetDate - currentMonday) / (1000 * 60 * 60 * 24))
    const neededOffset = Math.floor(diffDays / 7)
    // Clamp offset to valid range
    const clampedOffset = Math.max(-4, Math.min(4, neededOffset))
    setWeekOffset(clampedOffset)
    // Calculate dayIndex within the 30-day window
    const viewStart = new Date(currentMonday)
    viewStart.setDate(viewStart.getDate() + clampedOffset * 7)
    const dayIndex = Math.round((targetDate - viewStart) / (1000 * 60 * 60 * 24))
    if (dayIndex >= 0 && dayIndex < 30) {
      setSelectedDay(dayIndex)
    }
    setActiveTab('referencement')
    setShowSettings(false)
  }

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
  const [hoveredSeoVisit, setHoveredSeoVisit] = useState(null) // for référencement chart

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

  // Article visits mock data (matches slicedMonths length)
  const articleVisitsData = [45, 78, 120, 195, 310, 480, 620, 890, 1150, 1680, 2100, 2454]
  const slicedArticleVisits = articleVisitsData.slice(articleVisitsData.length - slicedMonths.length)
  const articleVisitsMax = Math.max(...slicedArticleVisits) * 1.1

  // KPI config with sliced data
  const kpiConfig = {
    visites: {
      label: 'Visites', bg: 'bg-gray-50', activeBg: 'bg-orange-50', activeBorder: 'border-color-2', color: '#FC6D41',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>,
    },
    clics: {
      label: 'Clics RDV', bg: 'bg-gray-50', activeBg: 'bg-orange-50', activeBorder: 'border-color-2', color: '#FC6D41',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
    },
    avis: {
      label: 'Avis Google', bg: 'bg-gray-50', activeBg: 'bg-orange-50', activeBorder: 'border-color-2', color: '#FC6D41',
      icon: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
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

  // Tour steps configuration per state
  const tour0Steps = [
    { ref: kpiCardsRef, title: 'Vos indicateurs clés', description: 'Suivez en un coup d\'œil vos visites, prises de rendez-vous et avis Google. Ces métriques se mettent à jour en temps réel.', icon: '📊', position: 'bottom', padding: 12 },
    { ref: chartRef, title: 'Suivi de performance', description: 'Ce graphique retrace l\'évolution de vos indicateurs dans le temps. Sélectionnez une métrique dans les cartes ci-dessus pour changer la vue.', icon: '📈', position: 'right', padding: 12 },
    { ref: actionsRef, title: 'Vos prochaines étapes', description: 'Votre liste de tâches personnalisée pour maximiser votre visibilité en ligne. Complétez-les une par une pour débloquer tout le potentiel de Theralys.', icon: '✅', position: 'left', padding: 8 },
    { ref: articlesRef, title: 'Articles SEO automatiques', description: 'Des articles optimisés pour le référencement sont publiés automatiquement sur votre site pour attirer de nouveaux patients via Google.', icon: '📝', position: 'left', padding: 8 },
    { ref: rankingRef, title: 'Votre position locale', description: 'Suivez votre classement Google pour votre mot-clé principal. L\'objectif : atteindre le top 3 local pour capter un maximum de patients.', icon: '🏆', position: 'top', padding: 12 },
    { ref: newsRef, title: 'Nouveautés produit', description: 'Restez informé des dernières fonctionnalités et améliorations de Theralys. Nous ajoutons régulièrement de nouveaux outils pour vous.', icon: '✨', position: 'left', padding: 8 },
  ]
  const tour1Steps = [
    { ref: actionsRef, title: 'Vos prochaines étapes', description: 'Votre site est en ligne ! Retrouvez ici les actions à venir pour développer votre visibilité. Les statistiques seront disponibles dans quelques jours.', icon: '✅', position: 'left', padding: 8 },
    { ref: articlesRef, title: 'Articles SEO automatiques', description: 'Des articles optimisés sont déjà publiés sur votre site pour attirer de nouveaux patients via Google. Ils apparaissent automatiquement.', icon: '📝', position: 'left', padding: 8 },
    { ref: newsRef, title: 'Nouveautés produit', description: 'Restez informé des nouvelles fonctionnalités de Theralys. Nous améliorons la plateforme en continu.', icon: '✨', position: 'left', padding: 8 },
  ]
  const tour2Steps = [
    { ref: kpiCardsRef, title: 'Vos indicateurs clés', description: 'Vos premières statistiques sont arrivées ! Suivez vos visites, clics RDV et avis Google en temps réel.', icon: '📊', position: 'bottom', padding: 12 },
    { ref: chartRef, title: 'Suivi de performance', description: 'Visualisez l\'évolution de vos indicateurs dans le temps. Sélectionnez une métrique pour changer la vue du graphique.', icon: '📈', position: 'right', padding: 12 },
    { ref: rankingRef, title: 'Votre position locale', description: 'Suivez votre classement Google pour votre mot-clé principal. L\'objectif : atteindre le top 3 pour capter un maximum de patients.', icon: '🏆', position: 'top', padding: 12 },
  ]

  const tourSteps = dashboardState === 0 ? tour0Steps : dashboardState === 1 ? tour1Steps : dashboardState === 3 ? tour2Steps : tour0Steps

  // Per-block info configs (for disabled block CTAs)
  const blockInfos = {
    stats: {
      ref: statsBlockRef, title: 'Vos indicateurs clés', icon: '📊', position: 'bottom', padding: 12,
      details: [
        { label: 'Visites', desc: 'Le nombre de personnes qui ont consulté votre site web. Chaque visite est comptée une seule fois par jour et par visiteur. Utilisez le filtre de période en haut pour comparer différentes plages de temps.', sync: () => { setSelectedKpi('visites'); setSeoHighlight('kpi-visites') } },
        { label: 'Clics RDV', desc: 'Combien de visiteurs ont cliqué sur votre bouton de prise de rendez-vous. C\'est l\'indicateur le plus direct de conversion : plus ce chiffre monte, plus votre site génère de patients.', sync: () => { setSelectedKpi('clics'); setSeoHighlight('kpi-clics') } },
        { label: 'Avis Google', desc: 'Le nombre total d\'avis laissés sur votre fiche Google Business. Les avis influencent directement votre classement local et la confiance des nouveaux patients.', sync: () => { setSelectedKpi('avis'); setSeoHighlight('kpi-avis') } },
      ],
    },
    articles: {
      ref: articlesRef, title: 'Articles SEO automatiques', icon: '📝', position: 'left', padding: 8,
      details: [
        { label: 'Rédaction IA', desc: 'Nos algorithmes rédigent des articles de blog adaptés à votre spécialité et votre ville. Chaque article cible un mot-clé stratégique pour attirer des patients qui cherchent un praticien près de chez eux.' },
        { label: 'Optimisation', desc: 'Chaque article est structuré pour plaire à Google : balises, mots-clés longue traîne, maillage interne. Le score SEO vous indique la qualité de l\'optimisation en temps réel.' },
        { label: 'Publication', desc: 'Les articles sont publiés automatiquement sur votre site aux dates programmées. Vous pouvez modifier le titre, l\'image et le contenu avant publication si vous le souhaitez.' },
      ],
    },
    news: {
      ref: newsRef, title: 'Nouveautés produit', icon: '✨', position: 'left', padding: 8,
      details: [
        { label: 'Fonctions', desc: 'De nouvelles fonctionnalités sont ajoutées régulièrement pour vous aider à développer votre cabinet : outils d\'analyse, automatisations, intégrations avec vos outils existants.' },
        { label: 'Partenaires', desc: 'Accédez à des offres exclusives négociées pour les membres Theralys : logiciels de gestion, formations continues, équipements de cabinet à tarif préférentiel.' },
        { label: 'Mises à jour', desc: 'La plateforme évolue en continu grâce aux retours de nos praticiens. Chaque mise à jour améliore la performance, la stabilité et l\'expérience utilisateur.' },
      ],
    },
    seoCalendar: {
      ref: seoCalendarRef, title: 'Calendrier éditorial', icon: '📅', position: 'right', padding: 8,
      details: [
        { label: 'Planning', desc: 'Visualisez le planning de publication de vos articles SEO sur un calendrier. Chaque case représente un jour avec un article prévu, programmé ou déjà publié.', sync: () => setSeoHighlight('planning') },
        { label: 'Images', desc: 'Cliquez sur un article pour personnaliser son image de couverture via notre bibliothèque Pexels intégrée. Une bonne image améliore le taux de clic de vos articles.', sync: () => setSeoHighlight('images') },
        { label: 'Statuts', desc: 'Les articles verts sont publiés, les articles avec photo sont programmés, et les cases vides sont des créneaux réservés pour vos prochains contenus.', sync: () => setSeoHighlight('statuts') },
      ],
    },
    seoArticle: {
      ref: seoArticleRef, title: 'Aperçu article', icon: '🔍', position: 'left', padding: 8,
      details: [
        { label: 'Contenu', desc: 'Prévisualisez chaque article avant publication. Vous pouvez modifier le titre, changer l\'image et vérifier le score SEO pour vous assurer de la qualité du contenu.', sync: () => setSeoHighlight('contenu') },
        { label: 'Score SEO', desc: 'Chaque article reçoit un score d\'optimisation en temps réel. Plus le score est élevé, meilleures sont vos chances d\'apparaître dans les résultats Google.', sync: () => setSeoHighlight('seo') },
        { label: 'Actions', desc: 'Modifiez le contenu de l\'article, changez l\'image via Pexels, ou consultez-le tel qu\'il apparaîtra sur votre site une fois publié.', sync: () => setSeoHighlight('actions') },
      ],
    },
    seoPublications: {
      ref: seoPublicationsRef, title: 'Répartition thématique', icon: '📊', position: 'left', padding: 8,
      details: [
        { label: 'Thématiques', desc: 'Vos articles sont répartis par thématique selon vos spécialités. Chaque thème cible des mots-clés différents pour couvrir un maximum de recherches patients.', sync: () => setSeoHighlight('themes') },
        { label: 'Équilibre', desc: 'Cliquez sur "Modifier" pour activer ou désactiver des thématiques. Les articles sont redistribués équitablement entre les thèmes actifs.', sync: () => setSeoHighlight('equilibre') },
        { label: 'Volume', desc: 'Suivez le nombre d\'articles à venir et le total déjà publié par thématique. Plus le volume est élevé, plus votre autorité SEO grandit sur chaque sujet.', sync: () => setSeoHighlight('volume') },
      ],
    },
    ranking: {
      ref: rankingRef, title: 'Votre position locale', icon: '🏆', position: 'top', padding: 12,
      details: [
        { label: 'Mot-clé', desc: `Nous suivons votre position sur la recherche "${profession} ${ville}". C'est la requête que tapent vos futurs patients pour trouver un praticien dans votre zone.`, sync: () => setSeoHighlight('rank-keyword') },
        { label: 'Objectif', desc: 'Atteindre le top 3 des résultats locaux Google. Les 3 premiers résultats captent plus de 75% des clics. Chaque position gagnée = plus de patients potentiels.', sync: () => setSeoHighlight('rank-objective') },
        { label: 'Évolution', desc: 'Le graphique retrace votre progression mois par mois. Une tendance à la hausse signifie que votre stratégie SEO fonctionne et que Google vous fait de plus en plus confiance.', sync: () => setSeoHighlight('rank-evolution') },
      ],
    },
  }

  // Block info spotlight rect
  useEffect(() => {
    if (!activeBlockInfo) { setBlockSpotlightRect(null); return }
    const info = blockInfos[activeBlockInfo]
    if (!info?.ref?.current) { setBlockSpotlightRect(null); return }
    const updateRect = () => {
      const el = info.ref.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const pad = info.padding || 8
      setBlockSpotlightRect({
        top: rect.top - pad,
        left: rect.left - pad,
        width: rect.width + pad * 2,
        height: rect.height + pad * 2,
      })
    }
    updateRect()
    window.addEventListener('resize', updateRect)
    return () => window.removeEventListener('resize', updateRect)
  }, [activeBlockInfo])

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
  const handleTourComplete = () => {
    setTourActive(false)
    if (dashboardState === 1) {
      updateTourFlag({ tour1Done: true })
    } else if (dashboardState === 3) {
      updateTourFlag({ tour2Done: true })
    }
  }
  const handleTourNext = () => {
    if (tourStep < tourSteps.length - 1) {
      setTourStep(tourStep + 1)
    } else {
      handleTourComplete()
    }
  }
  const handleTourPrev = () => {
    if (tourStep > 0) setTourStep(tourStep - 1)
  }
  const handleTourSkip = () => {
    handleTourComplete()
  }

  // Keyboard navigation
  useEffect(() => {
    if (!tourActive || (dashboardState !== 0 && dashboardState !== 1 && dashboardState !== 3)) return
    const handleKey = (e) => {
      if (e.key === 'ArrowRight' || e.key === 'Enter') handleTourNext()
      if (e.key === 'ArrowLeft') handleTourPrev()
      if (e.key === 'Escape') handleTourSkip()
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [tourActive, tourStep, dashboardState])

  // Cycle SEO badge every 3s
  useEffect(() => {
    const timer = setInterval(() => setSeoBadgeIdx(i => (i + 1) % seoItems.length), 3000)
    return () => clearInterval(timer)
  }, [])

  // Auto-rotate articles every 4s, loop
  useEffect(() => {
    if (showSettings || activeTab !== 'accueil' || dashboardState === 0) return
    const interval = setInterval(() => {
      setArticleIdx(prev => (prev + 1) % articles.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [showSettings, activeTab, dashboardState, articles.length])

  // Auto-rotate news every 4.5s, loop
  useEffect(() => {
    if (showSettings) return
    const interval = setInterval(() => {
      setNewsIdx(prev => (prev + 1) % news.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [showSettings, news.length])

  // Restart tour when entering a tour-able state (states 1 and 3 only)
  useEffect(() => {
    if (dashboardState === 1 || dashboardState === 3) {
      setTourStep(0)
      setTourActive(true)
    }
  }, [dashboardState])

  // Close profile menu on outside click
  useEffect(() => {
    if (!showProfileMenu) return
    const handler = (e) => {
      if (
        profileMenuRef.current && !profileMenuRef.current.contains(e.target) &&
        profileBtnRef.current && !profileBtnRef.current.contains(e.target)
      ) {
        setShowProfileMenu(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showProfileMenu])

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col items-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Dev nav — tiny bottom-left pill */}
      <div className="fixed bottom-1 left-1 z-50">
        {devNavVisible ? (
          <div className="flex items-center gap-px bg-gray-900/80 backdrop-blur rounded px-1 py-px" style={{ fontSize: '9px' }}>
            {[0, 1, 2, 3, 5].map((s) => (
              <button
                key={s}
                onClick={() => {
                  if (s === 0) {
                    // Reset all actions + tour flags
                    localStorage.setItem("completedActions", "[]")
                    setCompletedActions([])
                    localStorage.setItem("tourFlags", "{}")
                    setTourFlags({})
                    window.dispatchEvent(new Event("actionsUpdated"))
                  } else if (s === 1) {
                    // All actions done, no tours
                    const allIds = allActions.flatMap(a => a.subIds || [a.id])
                    localStorage.setItem("completedActions", JSON.stringify(allIds))
                    setCompletedActions(allIds)
                    setTourFlags({})
                    localStorage.setItem("tourFlags", "{}")
                    window.dispatchEvent(new Event("actionsUpdated"))
                  } else if (s === 2) {
                    const allIds = allActions.flatMap(a => a.subIds || [a.id])
                    localStorage.setItem("completedActions", JSON.stringify(allIds))
                    setCompletedActions(allIds)
                    updateTourFlag({ tour1Done: true, delayMet: false, tour2Done: false })
                    window.dispatchEvent(new Event("actionsUpdated"))
                  } else if (s === 3) {
                    const allIds = allActions.flatMap(a => a.subIds || [a.id])
                    localStorage.setItem("completedActions", JSON.stringify(allIds))
                    setCompletedActions(allIds)
                    updateTourFlag({ tour1Done: true, delayMet: true, tour2Done: false })
                    window.dispatchEvent(new Event("actionsUpdated"))
                  } else if (s === 5) {
                    const allIds = allActions.flatMap(a => a.subIds || [a.id])
                    localStorage.setItem("completedActions", JSON.stringify(allIds))
                    setCompletedActions(allIds)
                    updateTourFlag({ tour1Done: true, delayMet: true, tour2Done: true })
                    window.dispatchEvent(new Event("actionsUpdated"))
                  }
                }}
                className={`px-1.5 py-px rounded font-medium transition-colors cursor-pointer ${
                  dashboardState === s ? 'bg-white text-gray-900' : 'text-gray-500 hover:text-white'
                }`}
                style={{ fontSize: '9px' }}
              >
                {s}
              </button>
            ))}
            <span className="text-gray-600 mx-px">|</span>
            <button onClick={onGoToOnboarding} className="px-1 py-px rounded font-medium text-gray-500 hover:text-white transition-colors cursor-pointer" style={{ fontSize: '9px' }}>OB</button>
            <button onClick={() => setDevNavVisible(false)} className="px-1 py-px rounded text-gray-500 hover:text-white transition-colors cursor-pointer" style={{ fontSize: '9px' }}>✕</button>
          </div>
        ) : (
          <button
            onClick={() => setDevNavVisible(true)}
            className="bg-gray-900/60 backdrop-blur rounded px-1.5 py-px text-gray-500 hover:text-white transition-colors cursor-pointer"
            style={{ fontSize: '8px' }}
          >
            DEV
          </button>
        )}
      </div>

      {/* Top nav */}
      <nav className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0">
        <div className="flex items-center justify-between relative h-10">
          {/* Logo */}
          <img src={theralysLogo} alt="Theralys" className="h-6 cursor-pointer" onClick={() => { setActiveTab('accueil'); setShowSettings(false); }} />

          {/* Center nav — floating pill */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white border border-gray-200 rounded-2xl p-1 gap-0.5">
            {[
              { id: 'accueil', label: 'Accueil', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
              { id: 'referencement', label: 'Référencement', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { id: 'site', label: 'Site', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg> },
              { id: 'options', label: 'Options du site', icon: null },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.id === 'site') { onGoToSiteEditor(); return }
                  if (item.id === 'options') { onGoToSetup('contact'); return }
                  setActiveTab(item.id)
                  setShowSettings(false)
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === item.id && !showSettings
                    ? 'bg-color-1 text-white font-medium'
                    : 'text-gray-400 hover:text-color-1 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
            <div className="w-px h-5 bg-gray-200 mx-0.5" />
            <button
              onClick={() => { setActiveTab('parrainage'); setShowSettings(false) }}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                activeTab === 'parrainage' && !showSettings
                  ? 'bg-color-1 text-white font-medium'
                  : 'text-gray-400 hover:text-color-1 hover:bg-gray-50'
              }`}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
              Parrainage
            </button>
          </div>

          {/* Right actions */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => window.open('https://theralys-web.fr/', '_blank')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-sm font-medium text-color-1 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              Voir le site
            </button>
            <button
              onClick={() => { setShowSettings(true); setSettingsTab('compte'); }}
              className={`w-8 h-8 rounded-full bg-color-2 flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all ${showSettings ? 'ring-2 ring-color-2/30' : 'hover:ring-2 hover:ring-color-2/30'}`}
            >
              {prenom.charAt(0)}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-hidden px-6 py-4 w-full max-w-[1200px]">
        {showSettings ? (
        null
        ) : activeTab === 'referencement' ? (
        <div key="referencement" className="grid grid-cols-[2fr_1fr] gap-3 w-full h-full relative" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>

          {/* Top-left — Article calendar */}
          <div ref={seoCalendarRef} className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
              <div className="flex items-center gap-3">
                <h2 className="text-base font-bold text-color-1">Articles SEO</h2>
                <span className="text-sm text-gray-300">·</span>
                <span className="text-sm text-gray-400">{totalStats.total} publiés · 18 742 vues</span>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1">
                  <button disabled={!viewData.hasPrev} onClick={() => { setWeekOffset(o => o - 1); setSelectedDay(null) }} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${viewData.hasPrev ? 'hover:bg-gray-100 cursor-pointer text-gray-400' : 'text-gray-200 cursor-not-allowed'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </button>
                  <span className="text-sm text-gray-400">{viewData.week1Start} – {viewData.week2End}</span>
                  <button disabled={!viewData.hasNext} onClick={() => { setWeekOffset(o => o + 1); setSelectedDay(null) }} className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${viewData.hasNext ? 'hover:bg-gray-100 cursor-pointer text-gray-400' : 'text-gray-200 cursor-not-allowed'}`}>
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </button>
                  {weekOffset !== 0 && (
                    <button onClick={() => { setWeekOffset(0); setSelectedDay(null) }} className="text-xs text-color-2 font-medium ml-1 cursor-pointer hover:underline">Aujourd'hui</button>
                  )}
                </div>
                <button className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer text-gray-400 hover:text-color-1">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
                  <span className="text-xs font-medium">Créer un article</span>
                </button>
              </div>
            </div>

            {/* 5×3 article grid */}
            <div className={`grid grid-cols-6 gap-2 mt-4 flex-1 min-h-0 transition-all rounded-xl ${seoHighlight === 'planning' ? 'ring-2 ring-color-2 ring-offset-4' : ''}`} style={{ gridTemplateRows: 'repeat(5, 1fr)' }}>
              {(() => { let publishedSeen = 0, programmedSeen = 0, preProgrammedSeen = 0; return viewData.days.map((item) => {
                const isSelected = selectedDay === item.index

                {/* Published — green tint overlay: "done" */}
                if (item.published) {
                  publishedSeen++
                  const hlImages = seoHighlight === 'images' && publishedSeen <= 2
                  const hlStatuts = seoHighlight === 'statuts' && publishedSeen === 1
                  return (
                    <div
                      key={item.index}
                      onClick={() => setSelectedDay(item.index)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-color-2 ring-offset-2' : (hlImages || hlStatuts) ? 'ring-2 ring-color-2 ring-offset-2' : 'hover:shadow-md'}`}
                    >
                      <img src={customArticleImages[item.index] || item.articleImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-green-600/40" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white/60 text-[10px] font-medium mb-0.5">{item.dayNum} {item.monthShort}</p>
                        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{item.articleTitle}</p>
                      </div>
                    </div>
                  )
                }

                {/* Programmé — full opacity. The richness IS the signal. */}
                if (item.programmed) {
                  programmedSeen++
                  const hlImages = seoHighlight === 'images' && programmedSeen <= 2
                  const hlStatuts = seoHighlight === 'statuts' && programmedSeen === 1
                  return (
                    <div
                      key={item.index}
                      onClick={() => setSelectedDay(item.index)}
                      className={`relative rounded-xl overflow-hidden cursor-pointer transition-all ${isSelected ? 'ring-2 ring-color-2 ring-offset-2' : (hlImages || hlStatuts) ? 'ring-2 ring-color-2 ring-offset-2' : 'hover:shadow-md'}`}
                    >
                      <img src={customArticleImages[item.index] || item.articleImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                      <div className="absolute bottom-0 left-0 right-0 p-2">
                        <p className="text-white/60 text-[10px] font-medium mb-0.5">{item.dayNum} {item.monthShort}</p>
                        <p className="text-white text-xs font-semibold leading-tight line-clamp-2">{item.articleTitle}</p>
                      </div>
                    </div>
                  )
                }

                {/* Préprogrammé — empty card. The absence of image IS the signal. */}
                if (item.preProgrammed) {
                  preProgrammedSeen++
                  const hlStatuts = seoHighlight === 'statuts' && preProgrammedSeen === 1
                  return (
                    <div
                      key={item.index}
                      onClick={() => setSelectedDay(item.index)}
                      className={`relative rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all bg-gray-50 hover:bg-gray-100 ${isSelected ? 'ring-2 ring-color-2 ring-offset-1' : hlStatuts ? 'ring-2 ring-color-2 ring-offset-1' : ''}`}
                    >
                      <span className="text-2xl opacity-30">{item.icon}</span>
                      <span className={`text-sm font-bold mt-1 ${item.isToday ? 'text-color-2' : 'text-gray-300'}`}>{item.dayNum}</span>
                      {item.dayNum === 1 && <span className="text-[8px] text-gray-300">{item.monthShort}</span>}
                    </div>
                  )
                }

                return (
                  <div key={item.index} className="rounded-xl bg-gray-50/50 flex items-center justify-center">
                    <span className="text-sm font-medium text-gray-200">{item.dayNum}</span>
                  </div>
                )
              }) })()}
            </div>
            {/* Calendar locked overlay — state 0 */}
            {dashboardState === 0 && activeBlockInfo !== 'seoCalendar' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <button
                  onClick={() => { setActiveBlockInfo('seoCalendar'); setBlockInfoDetail(0); setSeoHighlight('planning') }}
                  className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.05] transition-transform duration-200 group border border-color-2/20"
                    style={{ animation: 'locked-float 2.5s ease-in-out infinite, locked-glow 2.5s ease-in-out infinite' }}
                >
                  <span className="text-lg">📅</span>
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-color-1">Calendrier éditorial</h3>
                    <p className="text-[10px] text-gray-400 mt-0.5">Débloqué après la mise en ligne — {completionPercent}% complété</p>
                    <p className="text-[10px] text-color-2 font-medium flex items-center gap-0.5 mt-1">
                      En savoir plus
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'locked-chevron 1.5s ease-in-out infinite' }}><path d="M9 18l6-6-6-6"/></svg>
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right column */}
          <div className="flex flex-col gap-2.5">

            {/* Article preview card */}
            <div ref={seoArticleRef} className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden">
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-base font-bold text-color-1">Article</h2>
                {selectedDay !== null && viewData.days[selectedDay] && (viewData.days[selectedDay].published || viewData.days[selectedDay].programmed) && (
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-sm font-semibold ${viewData.days[selectedDay].published ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-color-2'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${viewData.days[selectedDay].published ? 'bg-green-500' : 'bg-color-2'}`} />
                    {viewData.days[selectedDay].published ? 'Publié' : 'Programmé'}
                  </span>
                )}
              </div>
              {(() => {
                const item = selectedDay !== null ? viewData.days[selectedDay] : null
                if (!item) return (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-300">Sélectionnez un article</p>
                  </div>
                )
                if (item.published || item.programmed) {
                  const displayImage = customArticleImages[item.index] || item.articleImage
                  const displayTitle = customArticleTitles[item.index] || item.articleTitle
                  return (
                    <div className="flex-1 flex flex-col min-h-0">
                      <button
                        className={`relative flex-1 min-h-0 rounded-xl overflow-hidden cursor-pointer group text-left transition-all ${seoHighlight === 'contenu' ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}
                        onClick={() => { setPexelsSearch(''); setShowPexels(true) }}
                      >
                        <img src={displayImage} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        {/* Pexels overlay */}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            <span className="text-white text-xs font-medium">Changer l'image</span>
                          </div>
                        </div>
                      </button>
                      {/* Notion-style properties */}
                      <div className="mt-2.5 flex flex-col gap-1.5 shrink-0">
                        <div className="flex items-start gap-2">
                          <span className="text-sm text-gray-400 w-16 shrink-0 mt-0.5">Titre</span>
                          <input
                            type="text"
                            value={displayTitle}
                            onChange={e => setCustomArticleTitles(prev => ({ ...prev, [item.index]: e.target.value }))}
                            className="flex-1 text-sm font-semibold text-color-1 bg-transparent outline-none border-b border-transparent hover:border-gray-200 focus:border-color-2 transition-colors py-0.5 -my-0.5"
                          />
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 w-16 shrink-0">Thème</span>
                          <span className="text-sm font-medium text-color-1">{item.icon} {item.title}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-400 w-16 shrink-0">Date</span>
                          <span className="text-sm font-medium text-color-1">{item.dayNum} {item.monthShort}</span>
                        </div>
                        <div className={`flex items-center gap-2 transition-all rounded-lg ${seoHighlight === 'seo' ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}>
                          <span className="text-sm text-gray-400 w-16 shrink-0">SEO</span>
                          <div className="flex items-center gap-1.5">
                            <div className="w-16 h-1.5 rounded-full bg-gray-100"><div className="h-full rounded-full bg-green-400" style={{ width: `${item.seo.global}%` }} /></div>
                            <span className="text-sm font-semibold text-green-600">{item.seo.global}</span>
                          </div>
                        </div>
                      </div>
                      <div className={`flex gap-2 mt-3 shrink-0 transition-all rounded-xl ${seoHighlight === 'actions' ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}>
                        <button className="flex-1 py-2 rounded-xl bg-gray-50 text-sm font-medium text-color-1 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">Modifier</button>
                        <button className="flex-1 py-2 rounded-xl bg-color-1 text-sm font-medium text-white hover:bg-color-1/90 transition-colors cursor-pointer">Voir</button>
                      </div>
                    </div>
                  )
                }
                {/* Pre-programmed article */}
                const preDisplayImage = customArticleImages[item.index]
                const preDisplayTitle = customArticleTitles[item.index] || item.articleTitle || ''
                return (
                  <div className="flex-1 flex flex-col min-h-0">
                    {/* Image area — either custom image or placeholder */}
                    <button
                      className="relative rounded-xl overflow-hidden cursor-pointer group text-left shrink-0"
                      style={{ height: preDisplayImage ? '45%' : 80 }}
                      onClick={() => { setPexelsSearch(''); setShowPexels(true) }}
                    >
                      {preDisplayImage ? (
                        <>
                          <img src={preDisplayImage} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                          <span className="text-3xl">{item.icon}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                          <span className="text-white text-xs font-medium">Choisir une image</span>
                        </div>
                      </div>
                    </button>
                    {/* Notion-style properties */}
                    <div className="mt-2.5 flex flex-col gap-1.5 shrink-0">
                      <div className="flex items-start gap-2">
                        <span className="text-sm text-gray-400 w-16 shrink-0 mt-0.5">Titre</span>
                        <input
                          type="text"
                          value={preDisplayTitle}
                          onChange={e => setCustomArticleTitles(prev => ({ ...prev, [item.index]: e.target.value }))}
                          placeholder="Titre de l'article..."
                          className="flex-1 text-sm font-semibold text-color-1 bg-transparent outline-none border-b border-transparent hover:border-gray-200 focus:border-color-2 transition-colors py-0.5 -my-0.5 placeholder:text-gray-300 placeholder:font-normal"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-16 shrink-0">Thème</span>
                        <span className="text-sm font-medium text-color-1">{item.icon} {item.title}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400 w-16 shrink-0">Date</span>
                        <span className="text-sm font-medium text-color-1">{item.dayNum} {item.monthShort}</span>
                      </div>
                    </div>
                    <div className="flex-1" />
                    <div className="flex items-center justify-center gap-2 py-2 shrink-0 text-gray-400">
                      <span className="inline-block animate-spin" style={{ animationDuration: '3s' }}>&#9203;</span>
                      <span className="text-sm font-medium">Rédaction dans {item.daysFromToday} j</span>
                    </div>
                  </div>
                )
              })()}
              {/* Article preview locked overlay — state 0 */}
              {dashboardState === 0 && activeBlockInfo !== 'seoArticle' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                  <button
                    onClick={() => { setActiveBlockInfo('seoArticle'); setBlockInfoDetail(0); setSeoHighlight('contenu'); const idx = viewData.days.findIndex(d => d.published || d.programmed); if (idx >= 0) setSelectedDay(idx) }}
                    className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.05] transition-transform duration-200 group border border-color-2/20"
                    style={{ animation: 'locked-float 2.5s ease-in-out infinite, locked-glow 2.5s ease-in-out infinite' }}
                  >
                    <span className="text-lg">🔍</span>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-color-1">Aperçu article</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Débloqué après la mise en ligne — {completionPercent}% complété</p>
                      <p className="text-[10px] text-color-2 font-medium flex items-center gap-0.5 mt-1">
                        En savoir plus
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'locked-chevron 1.5s ease-in-out infinite' }}><path d="M9 18l6-6-6-6"/></svg>
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Articles par thème — only préprogrammé batch */}
            <div ref={seoPublicationsRef} className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col min-h-0 relative overflow-hidden">
              <div className="flex items-center justify-between mb-1 shrink-0">
                <h2 className="text-base font-bold text-color-1">Prochaines publications</h2>
                <button onClick={() => setShowRepartition(true)} className={`text-sm text-color-2 font-medium hover:underline cursor-pointer transition-all rounded-lg px-1.5 -mx-1.5 ${seoHighlight === 'equilibre' ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}>Modifier</button>
              </div>
              <div className="flex items-center justify-between mb-2 shrink-0">
                <p className="text-xs text-gray-400">{viewData.preProgDays} articles programmés</p>
                <div className="flex items-center gap-4">
                  <span className="text-[10px] text-gray-300 uppercase tracking-wide">À venir</span>
                  <span className="text-[10px] text-gray-300 uppercase tracking-wide">Total</span>
                </div>
              </div>
              <div className={`flex flex-col gap-0.5 flex-1 justify-center transition-all rounded-xl ${seoHighlight === 'themes' ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}>
                {allSpecialties.map(spec => {
                  const isActive = checkedSpecs.includes(spec.id)
                  const upcoming = viewData.preProgCounts[spec.id] || 0
                  const allTime = totalStats.counts[spec.id] || 0
                  return (
                    <div key={spec.id} className={`flex items-center py-1.5 ${isActive ? '' : 'opacity-30'}`}>
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span className="text-base shrink-0">{spec.icon}</span>
                        <span className="text-sm text-color-1 font-medium truncate">{spec.title}</span>
                      </div>
                      <span className={`text-sm font-bold text-color-1 tabular-nums w-8 text-right transition-all rounded ${seoHighlight === 'volume' ? 'ring-2 ring-color-2 ring-offset-1' : ''}`}>{isActive ? upcoming : '–'}</span>
                      <span className={`text-sm text-gray-400 tabular-nums w-8 text-right ml-3 transition-all rounded ${seoHighlight === 'volume' ? 'ring-2 ring-color-2 ring-offset-1' : ''}`}>{allTime}</span>
                    </div>
                  )
                })}
              </div>
              <div className="flex items-center pt-2 mt-1 border-t border-gray-100 shrink-0">
                <span className="text-sm font-bold text-color-1 flex-1">Total</span>
                <span className="text-sm font-bold text-color-1 tabular-nums w-8 text-right">{viewData.preProgDays}</span>
                <span className="text-sm font-bold text-gray-400 tabular-nums w-8 text-right ml-3">{totalStats.total}</span>
              </div>
              {/* Publications locked overlay — state 0 */}
              {dashboardState === 0 && activeBlockInfo !== 'seoPublications' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                  <button
                    onClick={() => { setActiveBlockInfo('seoPublications'); setBlockInfoDetail(0); setSeoHighlight('themes') }}
                    className="bg-white rounded-xl px-4 py-3 shadow-lg flex items-center gap-3 cursor-pointer hover:scale-[1.05] transition-transform duration-200 group border border-color-2/20"
                    style={{ animation: 'locked-float 2.5s ease-in-out infinite, locked-glow 2.5s ease-in-out infinite' }}
                  >
                    <span className="text-lg">📊</span>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-color-1">Répartition</h3>
                      <p className="text-[10px] text-gray-400 mt-0.5">Débloqué après la mise en ligne — {completionPercent}% complété</p>
                      <p className="text-[10px] text-color-2 font-medium flex items-center gap-0.5 mt-1">
                        En savoir plus
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'locked-chevron 1.5s ease-in-out infinite' }}><path d="M9 18l6-6-6-6"/></svg>
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>
          </div>


          {/* Répartition modal */}
          {showRepartition && (() => {
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowRepartition(false)}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div className="relative bg-white rounded-2xl shadow-xl w-[380px] overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
                  <div className="px-5 pt-5 pb-3">
                    <div className="flex items-center justify-between mb-1">
                      <h2 className="text-base font-bold text-color-1">De quoi parleront vos articles ?</h2>
                      <button onClick={() => setShowRepartition(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <p className="text-[13px] text-gray-400">Activez les thématiques qui vous intéressent. Les {viewData.preProgDays} articles programmés seront répartis équitablement.</p>
                  </div>
                  <div className="px-5 pb-4 flex flex-col gap-1.5">
                    {allSpecialties.map((spec) => {
                      const isActive = checkedSpecs.includes(spec.id)
                      const count = viewData.preProgCounts[spec.id] || 0
                      return (
                        <button
                          key={spec.id}
                          onClick={() => setCheckedSpecs(prev => prev.includes(spec.id) ? prev.filter(id => id !== spec.id) : [...prev, spec.id])}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all cursor-pointer ${isActive ? 'bg-gray-50' : 'opacity-30'}`}
                        >
                          <span className="text-lg shrink-0">{spec.icon}</span>
                          <span className="text-[13px] font-medium text-color-1 flex-1">{spec.title}</span>
                          {isActive && <span className="text-[13px] font-semibold text-color-1 tabular-nums">{count} art.</span>}
                        </button>
                      )
                    })}
                  </div>
                  <div className="px-5 py-3 border-t border-gray-100">
                    <p className="text-[13px] text-gray-400 text-center">
                      {activeSpecCount > 0
                        ? <>{activeSpecCount} thématique{activeSpecCount > 1 ? 's' : ''} · ~{Math.round(viewData.preProgDays / activeSpecCount)} articles chacune</>
                        : 'Sélectionnez au moins une thématique'
                      }
                    </p>
                  </div>
                </div>
              </div>
            )
          })()}

          {/* Pexels image library modal */}
          {showPexels && (() => {
            const pexelsImages = [
              { id: 1, src: articleImg1, label: 'Physiothérapie épaule' },
              { id: 2, src: articleImg2, label: 'Consultation ostéo' },
              { id: 3, src: articleImg3, label: 'Massage thérapeutique' },
              { id: 4, src: articleImg4, label: 'Rééducation sportive' },
              { id: 5, src: pexGrab1, label: 'Massage du dos' },
              { id: 6, src: pexGrab2, label: 'Soin cervical' },
              { id: 7, src: pexGrab3, label: 'Thérapie manuelle' },
              { id: 8, src: pexGrab4, label: 'Consultation cabinet' },
              { id: 9, src: pexGrab5, label: 'Palpation dorsale' },
              { id: 10, src: pexGrab6, label: 'Traitement articulaire' },
              { id: 11, src: pexGrab7, label: 'Mobilisation épaule' },
              { id: 12, src: pexGrab8, label: 'Étirement guidé' },
              { id: 13, src: pexRyu1, label: 'Rééducation posturale' },
              { id: 14, src: pexRyu2, label: 'Exercice thérapeutique' },
              { id: 15, src: pexRyu3, label: 'Renforcement musculaire' },
              { id: 16, src: pexRyu4, label: 'Séance de kiné' },
              { id: 17, src: pexYank5, label: 'Soin du patient' },
              { id: 18, src: pexYank6, label: 'Bilan postural' },
              { id: 19, src: pexYank7, label: 'Récupération sportive' },
              { id: 20, src: pexYank8, label: 'Traitement en cabinet' },
              { id: 21, src: pexYank9, label: 'Manipulation douce' },
              { id: 22, src: pexPolina, label: 'Bien-être et détente' },
            ]
            const filtered = pexelsSearch
              ? pexelsImages.filter(img => img.label.toLowerCase().includes(pexelsSearch.toLowerCase()))
              : pexelsImages
            return (
              <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowPexels(false)}>
                <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
                <div className="relative bg-white rounded-2xl shadow-xl w-[440px] max-h-[70vh] flex flex-col overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
                  <div className="px-5 pt-5 pb-3 shrink-0">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <svg width="18" height="18" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="6" fill="#05A081"/><path d="M13.5 10.2h-3.3v11.6h3.3v-4.6c0-1.7 1-2.6 2.3-2.6 1.2 0 2 .8 2 2.4v4.8h3.3v-5.5c0-3-1.7-4.7-4.2-4.7-1.5 0-2.5.7-3.1 1.5l-.3-1.3z" fill="white"/></svg>
                        <h2 className="text-base font-bold text-color-1">Pexels</h2>
                      </div>
                      <button onClick={() => setShowPexels(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>
                    <div className="relative">
                      <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                      <input
                        type="text"
                        value={pexelsSearch}
                        onChange={e => setPexelsSearch(e.target.value)}
                        placeholder="Rechercher des photos..."
                        className="w-full pl-9 pr-3 py-2 rounded-xl bg-gray-50 text-[13px] text-color-1 placeholder:text-gray-300 outline-none focus:ring-2 focus:ring-color-2/30 transition-shadow"
                      />
                    </div>
                  </div>
                  <div className="px-5 pb-5 flex-1 min-h-0 overflow-y-auto">
                    {filtered.length > 0 ? (
                      <div className="grid grid-cols-2 gap-2">
                        {filtered.map(img => (
                          <button
                            key={img.id}
                            onClick={() => {
                              if (selectedDay !== null) {
                                setCustomArticleImages(prev => ({ ...prev, [selectedDay]: img.src }))
                              }
                              setShowPexels(false)
                            }}
                            className="relative aspect-[4/3] rounded-xl overflow-hidden cursor-pointer group/pex"
                          >
                            <img src={img.src} alt={img.label} className="absolute inset-0 w-full h-full object-cover transition-transform group-hover/pex:scale-105" />
                            <div className="absolute inset-0 bg-black/0 group-hover/pex:bg-black/30 transition-colors" />
                            <div className="absolute bottom-0 left-0 right-0 p-2 opacity-0 group-hover/pex:opacity-100 transition-opacity">
                              <p className="text-white text-[11px] font-medium">{img.label}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-10 text-center">
                        <p className="text-sm text-gray-300">Aucune photo trouvée</p>
                        <p className="text-[11px] text-gray-300 mt-1">Essayez un autre terme</p>
                      </div>
                    )}
                  </div>
                  <div className="px-5 py-2 border-t border-gray-100 shrink-0">
                    <p className="text-[10px] text-gray-300 text-center">Photos gratuites fournies par Pexels</p>
                  </div>
                </div>
              </div>
            )
          })()}
        </div>
        ) : activeTab === 'parrainage' ? (
        <div key="parrainage" className="flex flex-col gap-3 w-full h-full relative" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* State 0 overlay */}
          {dashboardState === 0 && (
            <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(255,255,255,0.4)' }}>
              <div className="bg-orange-50 rounded-2xl px-6 py-5 max-w-[380px] w-full text-center shadow-sm">
                <h3 className="text-base font-bold text-color-1 mb-1">🎁 Parrainage</h3>
                <p className="text-sm text-gray-500">Disponible après la mise en ligne de votre site.</p>
              </div>
            </div>
          )}

          {/* Hero section — warm bg with floating emojis */}
          <div className="relative border-2 border-gray-200 rounded-2xl flex flex-col items-center justify-center py-6 px-8 shrink-0 overflow-hidden" style={{ backgroundColor: '#fef4f1' }}>
            {/* Floating emojis */}
            <span className="absolute text-2xl opacity-30" style={{ top: '10%', left: '8%' }}>🤩</span>
            <span className="absolute text-xl opacity-20" style={{ top: '15%', right: '12%' }}>👌</span>
            <span className="absolute text-xl opacity-20" style={{ top: '55%', left: '15%' }}>🎁</span>
            <span className="absolute text-lg opacity-15" style={{ top: '40%', left: '25%' }}>🏁</span>
            <span className="absolute text-xl opacity-20" style={{ top: '50%', right: '8%' }}>🎊</span>
            <span className="absolute text-lg opacity-15" style={{ top: '25%', right: '25%' }}>😍</span>
            {/* Headline */}
            <h2 className="text-2xl font-bold text-color-1 text-center">
              Offrez 1 mois & <span className="text-color-2">Gagnez 2 mois gratuits</span>
            </h2>
            <p className="text-lg font-semibold text-color-1/60 text-center mt-0.5">pour chaque parrainage !</p>
            <p className="text-sm text-gray-400 text-center mt-2 max-w-[480px]">Offrez 1 mois d'essai et recevez 2 mois offerts du montant de votre forfait.</p>
            {/* CTA buttons */}
            <div className="flex items-center gap-3 mt-4">
              <button onClick={() => setShowParrainageVideo(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium text-color-1 hover:bg-gray-50 transition-colors cursor-pointer">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none"/></svg>
                Voir la vidéo
              </button>
              <button
                onClick={() => { navigator.clipboard.writeText('https://theralys.com/ref/theo-osteo') }}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border-2 border-color-2/30 bg-white text-sm font-medium text-color-1 hover:bg-color-2/5 transition-colors cursor-pointer"
              >
                Copier le lien
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
              </button>
            </div>
            {/* Link display */}
            <div className="flex items-center gap-2 mt-3">
              <div className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm text-gray-400 font-mono flex items-center gap-2">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>
                https://theralys.fr?feg745fe7cc
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex gap-3 shrink-0">
            {[
              { label: 'Clics sur le lien', value: '11' },
              { label: 'Inscrits', value: '3' },
              { label: 'Parrainage activés', value: '3' },
              { label: 'Commission gagnée', value: '165 €' },
            ].map((kpi) => (
              <div key={kpi.label} className="flex-1 bg-white border-2 border-gray-200 rounded-2xl px-4 py-3">
                <p className="text-sm text-gray-400 font-medium">{kpi.label}</p>
                <p className="text-2xl font-bold text-color-1 mt-1">{kpi.value}</p>
              </div>
            ))}
          </div>

          {/* Parrainage table */}
          <div className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col min-h-0">
            <h2 className="text-base font-bold text-color-1 mb-3 shrink-0">Parrainage</h2>
            <div className="flex-1 min-h-0">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-100">
                    {['Date d\'inscription', 'Adresse e-mail', 'Statut', 'Commissions', 'Utilisation'].map((h) => (
                      <th key={h} className="pb-2.5 text-sm font-medium text-gray-400 pr-4">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    { date: '12 jan. 2026', email: 'marie.dupont@gmail.com', status: 'Inscrit', statusColor: 'text-green-500', commission: '78 €', usage: '+2 mois offerts' },
                    { date: '28 déc. 2025', email: 'thomas.b@outlook.fr', status: 'Inscrit', statusColor: 'text-green-500', commission: '78 €', usage: '+2 mois offerts' },
                    { date: '15 nov. 2025', email: 'sophie.martin@gmail.com', status: 'Annulé', statusColor: 'text-gray-400', commission: '0 €', usage: 'pas d\'utilisation' },
                  ].map((row, i) => (
                    <tr key={i} className="border-b border-gray-50">
                      <td className="py-2.5 text-sm text-color-1 pr-4">{row.date}</td>
                      <td className="py-2.5 text-sm text-color-1 pr-4">{row.email}</td>
                      <td className={`py-2.5 text-sm font-medium pr-4 ${row.statusColor}`}>{row.status}</td>
                      <td className="py-2.5 text-sm text-color-1 pr-4">{row.commission}</td>
                      <td className="py-2.5 text-sm text-gray-400">{row.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 3 step cards */}
          <div className="flex gap-3 shrink-0">
            {[
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round"><path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z"/></svg>, title: 'Partagez votre lien à un ami', desc: 'Cliquez ci-dessus pour copier le lien et l\'envoyer à votre ami via email, SMS et autre.' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>, title: 'Attendez qu\'il devienne client', desc: 'Votre ami doit s\'inscrire via votre lien et utiliser entièrement la période d\'essai.' },
              { icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 8v6M23 11h-6"/></svg>, title: 'Recevez vos commissions', desc: 'Une fois la période d\'essai écoulé, recevez 2 mensualités de votre abonnement en revenu.' },
            ].map((s, i) => (
              <div key={i} className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-4 flex flex-col items-center text-center">
                <div className="w-10 h-10 rounded-xl bg-color-2/10 flex items-center justify-center mb-2">
                  {s.icon}
                </div>
                <p className="text-sm font-semibold text-color-1 mb-1">{s.title}</p>
                <p className="text-xs text-gray-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>

          {/* Parrainage video modal */}
          {showParrainageVideo && (
            <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowParrainageVideo(false)}>
              <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
              <div className="relative bg-white rounded-2xl shadow-xl w-[520px] overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
                {/* Video placeholder */}
                <div className="w-full aspect-video bg-gray-100 flex items-center justify-center">
                  <p className="text-sm text-gray-400">Vidéo explicative</p>
                </div>
                {/* Content */}
                <div className="p-5">
                  <p className="text-xs text-gray-400 mb-1">Programme de parrainage Theralys</p>
                  <h3 className="text-lg font-bold text-color-1 mb-3">Offrez 1 mois & <span className="text-color-2">Gagnez 2 mois gratuits</span></h3>
                  <p className="text-sm font-semibold text-color-1 mb-2">Comment ça marche ?</p>
                  <ol className="space-y-1.5 mb-4">
                    <li className="text-sm text-gray-500 flex gap-2"><span className="text-color-1 font-semibold">1.</span>Copiez votre lien de parrainage généré.</li>
                    <li className="text-sm text-gray-500 flex gap-2"><span className="text-color-1 font-semibold">2.</span>Partagez le lien à d'autres thérapeutes.</li>
                    <li className="text-sm text-gray-500 flex gap-2"><span className="text-color-1 font-semibold">3.</span>Une fois leur période d'essai (ou 2 mois si mensuel), vous obtiendrez une réduction sur vos prochaines factures équivalent à 2 mois de votre forfait.</li>
                  </ol>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-400 font-mono truncate">
                      https://theralys.fr?feg745fe
                    </div>
                    <button
                      onClick={() => { navigator.clipboard.writeText('https://theralys.com/ref/theo-osteo'); setShowParrainageVideo(false) }}
                      className="px-4 py-2 rounded-lg bg-color-2/10 border border-color-2/30 text-sm font-medium text-color-1 hover:bg-color-2/15 transition-colors cursor-pointer flex items-center gap-1.5 shrink-0"
                    >
                      Copier votre lien de parrainage
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round"><path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
        ) : (
        <div key="dashboard" className="grid grid-cols-[2fr_1fr] grid-rows-[1fr_1fr] gap-3 w-full h-full" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* 1 — Top left */}
          <div ref={statsBlockRef} className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-color-1">Bonjour {prenom}</h1>
                <div className="relative mt-2 inline-block">
                  <button
                    onClick={() => dashboardState >= 1 && setTimePeriodOpen(!timePeriodOpen)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gray-300 text-sm text-gray-600 hover:border-gray-400 transition-colors cursor-pointer"
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
                            <span className="text-sm font-semibold text-color-1 capitalize">
                              {calendarMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))} className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-gray-200 cursor-pointer">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M9 18l6-6-6-6"/></svg>
                            </button>
                          </div>
                          {/* Day headers */}
                          <div className="grid grid-cols-7 mb-1">
                            {['Lu', 'Ma', 'Me', 'Je', 'Ve', 'Sa', 'Di'].map((d) => (
                              <span key={d} className="text-center text-sm text-gray-400 font-medium">{d}</span>
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
                                  className={`h-6 w-full text-sm font-medium cursor-pointer transition-colors ${
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
                            className={`w-full py-1.5 mt-2 rounded-lg text-sm font-medium transition-colors ${
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
                    className={`rounded-xl px-4 py-3 min-w-[120px] text-left transition-all cursor-pointer border-2 ${
                      selectedKpi === kpi.key ? `${kpi.activeBg} ${kpi.activeBorder}` : `${kpi.bg} border-transparent`
                    } ${seoHighlight === `kpi-${kpi.key}` ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}
                  >
                    <div className="flex items-center gap-1.5 mb-2">
                      {kpi.icon}
                      <span className="text-sm font-medium text-color-1">{kpi.label}</span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-color-1">{kpi.value}</span>
                      <span className={`text-sm font-semibold ${kpi.change >= 0 ? 'text-green-500' : 'text-red-500'}`}>{kpi.change >= 0 ? '↑' : '↓'} {Math.abs(kpi.change)}%</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div ref={chartRef} className="flex-1 mt-4 min-h-0 flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between pr-2 text-sm text-gray-400 shrink-0 text-right">
                {yLabels.map((v) => <span key={v}>{v}</span>)}
              </div>

              {/* Chart + X-axis */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Curve area */}
                <div
                  className="flex-1 relative min-h-0"
                  onMouseMove={dashboardState >= 1 ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const idx = Math.round(x * (activeCard.data.length - 1))
                    setHoveredKpi(Math.max(0, Math.min(idx, activeCard.data.length - 1)))
                  } : undefined}
                  onMouseLeave={dashboardState >= 1 ? () => setHoveredKpi(null) : undefined}
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
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md border bg-white text-sm font-semibold whitespace-nowrap mb-1 mx-auto w-fit shadow-sm" style={{ borderColor: activeCard.color, color: activeCard.color }}>
                          {activeCard.data[hoveredKpi]}
                          <span className="text-gray-400 font-normal">{slicedMonths[hoveredKpi]}</span>
                        </div>
                      </div>
                      <div className="absolute w-2.5 h-2.5 rounded-full pointer-events-none border-2 border-white shadow-sm" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -50%)', backgroundColor: activeCard.color }} />
                    </>
                  })()}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-sm text-gray-400 pt-1.5 shrink-0">
                  {slicedMonths.map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            {/* Stats locked overlay — states 0-2 */}
            {dashboardState <= 2 && activeBlockInfo !== 'stats' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <button
                  onClick={() => { setActiveBlockInfo('stats'); setBlockInfoDetail(0); setSelectedKpi('visites'); setSeoHighlight('kpi-visites') }}
                  className="bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.05] transition-transform duration-200 group border border-color-2/20"
                    style={{ animation: 'locked-float 2.5s ease-in-out infinite, locked-glow 2.5s ease-in-out infinite' }}
                >
                  <span className="text-sm">📊</span>
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-color-1">Statistiques</h3>
                    <p className="text-[10px] text-color-2 font-medium flex items-center gap-0.5">
                      En savoir plus
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'locked-chevron 1.5s ease-in-out infinite' }}><path d="M9 18l6-6-6-6"/></svg>
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>

          {/* Right column — spans both rows */}
          <div className="row-span-2 flex flex-col gap-2.5">

            {/* Actions */}
            <div ref={actionsRef} className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-3 flex flex-col min-h-0">
              {completionPercent < 100 && (
                <>
                  <div className="flex items-center justify-between mb-2 shrink-0">
                    <h2 className="text-sm font-bold text-color-1">Actions</h2>
                    <span className="text-[10px] text-gray-400 font-medium">{doneActions.length}/{allActions.length} · {completionPercent}%</span>
                  </div>
                  <div className="w-full h-1 bg-gray-100 rounded-full mb-2 shrink-0 overflow-hidden">
                    <div className="h-full bg-color-2 rounded-full transition-all duration-500" style={{ width: `${completionPercent}%` }} />
                  </div>
                </>
              )}
              {completionPercent === 100 ? (
                <div className="flex-1 flex flex-col gap-1 pt-0.5">
                  <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider px-1 pt-0.5 pb-0.5">Prochaines étapes</p>
                  {[
                    { label: 'Collecter 3 avis clients', action: () => onGoToSetup('avis') },
                    { label: 'Vérifier vos articles', action: () => { const scheduled = articles.find(a => a.status === 'scheduled'); if (scheduled) navigateToArticle(scheduled) } },
                    { label: 'Parrainer un confrère', action: () => { setActiveTab('parrainage'); setShowSettings(false) } },
                  ].map((item, i) => (
                    <div key={i} className="relative rounded-lg p-[1.5px] overflow-hidden" style={{ boxShadow: i === 0 ? '0 0 6px rgba(255,69,0,0.2)' : 'none' }}>
                      {i === 0 && (
                        <div
                          className="absolute inset-0"
                          style={{
                            width: '200%',
                            background: 'linear-gradient(90deg, #FF4500, #FFD700, #FF1493, #FF4500, #FFD700, #FF4500)',
                            animation: 'border-slide 3s linear infinite',
                          }}
                        />
                      )}
                      <button onClick={() => item.action()} className={`relative flex items-center gap-2 bg-white rounded-[7px] px-2.5 py-2 w-full text-left cursor-pointer hover:bg-gray-50 transition-colors ${i > 0 ? 'border border-gray-100' : ''}`}>
                        <div className={`w-4 h-4 rounded border-2 flex-shrink-0 ${i === 0 ? 'border-color-2' : 'border-gray-200'}`} />
                        <p className={`text-xs min-w-0 flex-1 ${i === 0 ? 'font-semibold text-color-1' : 'font-medium text-gray-500'}`}>{item.label}</p>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
              <div className="flex-1 overflow-y-auto min-h-0 flex flex-col gap-0.5 pr-0.5" style={{ scrollbarWidth: 'thin', scrollbarColor: '#e5e5e5 transparent' }}>
                {(() => {
                  let currentPhase = null
                  return sortedActions.map((action) => {
                    const isDone = isActionDone(action)
                    const isNext = !isDone && pendingActions[0]?.id === action.id
                    const showPhase = !isDone && action.phase !== currentPhase
                    if (!isDone) currentPhase = action.phase
                    return (
                      <div key={action.id}>
                        {showPhase && (
                          <p className="text-[9px] font-semibold text-gray-300 uppercase tracking-wider px-1 pt-1.5 pb-0.5">{action.phase}</p>
                        )}
                        {isNext ? (
                          <div className="relative rounded-lg p-[1.5px] overflow-hidden" style={{ boxShadow: '0 0 6px rgba(255,69,0,0.2)' }}>
                            <div
                              className="absolute inset-0"
                              style={{
                                width: '200%',
                                background: 'linear-gradient(90deg, #FF4500, #FFD700, #FF1493, #FF4500, #FFD700, #FF4500)',
                                animation: 'border-slide 3s linear infinite',
                              }}
                            />
                            <button onClick={() => action.action()} className="relative flex items-center gap-2 bg-white rounded-[7px] px-2.5 py-1.5 w-full text-left cursor-pointer hover:bg-gray-50 transition-colors">
                              <div onClick={(e) => toggleAction(action, e)} className="w-4 h-4 rounded border-2 border-color-2 flex-shrink-0 hover:bg-color-2/10 transition-colors cursor-pointer" />
                              <p className="text-xs font-semibold text-color-1 min-w-0 flex-1">{action.label}</p>
                              {action.subIds && <span className="text-[9px] text-gray-400 font-medium shrink-0">{action.subIds.filter(s => completedActions.includes(s)).length}/{action.subIds.length}</span>}
                            </button>
                          </div>
                        ) : isDone ? (
                          <button onClick={() => action.action()} className="flex items-center gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5 w-full text-left cursor-pointer hover:bg-gray-100 transition-colors">
                            <div onClick={(e) => toggleAction(action, e)} className="w-4 h-4 rounded bg-gray-300 flex items-center justify-center flex-shrink-0 hover:bg-gray-400 transition-colors cursor-pointer">
                              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12" />
                              </svg>
                            </div>
                            <p className="text-xs font-medium text-gray-400 line-through min-w-0">{action.label}</p>
                          </button>
                        ) : (
                          <button onClick={() => action.action()} className="flex items-center gap-2 rounded-lg px-2.5 py-1.5 w-full text-left cursor-pointer hover:bg-gray-50 transition-colors">
                            <div onClick={(e) => toggleAction(action, e)} className="w-4 h-4 rounded border-2 border-gray-200 flex-shrink-0 hover:border-gray-400 transition-colors cursor-pointer" />
                            <p className="text-xs font-medium text-gray-600 min-w-0 flex-1">{action.label}</p>
                            {action.subIds && <span className="text-[9px] text-gray-400 font-medium shrink-0">{action.subIds.filter(s => completedActions.includes(s)).length}/{action.subIds.length}</span>}
                          </button>
                        )}
                      </div>
                    )
                  })
                })()}
              </div>
              )}
            </div>

            {/* Articles carousel */}
            <div ref={articlesRef} className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-base font-bold text-color-1">Articles</h2>
                {dashboardState !== 0 && (
                  <div className="flex items-center gap-1.5 -mr-0.5">
                    {articles.map((_, i) => (
                      <button
                        key={i}
                        onClick={() => setArticleIdx(i)}
                        className={`rounded-full transition-all cursor-pointer block ${i === articleIdx ? 'w-4 h-[6px] bg-color-2' : 'w-[6px] h-[6px] bg-gray-300 hover:bg-gray-400'}`}
                      />
                    ))}
                  </div>
                )}
              </div>
              {/* Image area — clickable → navigates to referencement */}
              <button onClick={() => navigateToArticle(articles[articleIdx])} className="relative flex-1 min-h-0 rounded-xl overflow-hidden cursor-pointer group text-left">
                <img src={articles[articleIdx].img} alt="" className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {/* Badge */}
                <div className="absolute top-1.5 left-2.5">
                  {articles[articleIdx].status === 'published' ? (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-color-1 text-sm font-semibold backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                      Publié le {articles[articleIdx].date}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-color-1 text-sm font-semibold backdrop-blur-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-color-2 shrink-0" />
                      Programmé le {articles[articleIdx].date}
                    </span>
                  )}
                </div>
                {/* Nav arrows on image */}
                <div
                  onClick={(e) => { e.stopPropagation(); setArticleIdx((articleIdx - 1 + articles.length) % articles.length) }}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); setArticleIdx((articleIdx + 1) % articles.length) }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/80 hover:bg-white flex items-center justify-center cursor-pointer transition-colors shadow-sm"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
                {/* Title overlay */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="text-white text-sm font-bold leading-tight drop-shadow-sm">{articles[articleIdx].title}</p>
                </div>
              </button>
              {/* State 0 overlay */}
              {dashboardState === 0 && activeBlockInfo !== 'articles' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                  <button
                    onClick={() => { setActiveBlockInfo('articles'); setBlockInfoDetail(0) }}
                    className="bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.05] transition-transform duration-200 group border border-color-2/20"
                    style={{ animation: 'locked-float 2.5s ease-in-out infinite, locked-glow 2.5s ease-in-out infinite' }}
                  >
                    <span className="text-sm">📝</span>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-color-1">Articles SEO</h3>
                      <p className="text-[10px] text-color-2 font-medium flex items-center gap-0.5">
                        En savoir plus
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'locked-chevron 1.5s ease-in-out infinite' }}><path d="M9 18l6-6-6-6"/></svg>
                      </p>
                    </div>
                  </button>
                </div>
              )}
            </div>

            {/* Quoi de neuf — carousel like Articles */}
            <div ref={newsRef} className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden">
              {/* State 0 overlay */}
              {dashboardState === 0 && activeBlockInfo !== 'news' && (
                <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                  <button
                    onClick={() => { setActiveBlockInfo('news'); setBlockInfoDetail(0) }}
                    className="bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.05] transition-transform duration-200 group border border-color-2/20"
                    style={{ animation: 'locked-float 2.5s ease-in-out infinite, locked-glow 2.5s ease-in-out infinite' }}
                  >
                    <span className="text-sm">✨</span>
                    <div className="text-left">
                      <h3 className="text-xs font-bold text-color-1">Nouveautés</h3>
                      <p className="text-[10px] text-color-2 font-medium flex items-center gap-0.5">
                        En savoir plus
                        <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'locked-chevron 1.5s ease-in-out infinite' }}><path d="M9 18l6-6-6-6"/></svg>
                      </p>
                    </div>
                  </button>
                </div>
              )}
              {/* Header */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-base font-bold text-color-1">Quoi de neuf</h2>
                <div className="flex items-center gap-1.5 -mr-0.5">
                  {news.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setNewsIdx(i)}
                      className={`rounded-full transition-all cursor-pointer block ${i === newsIdx ? 'w-4 h-[6px] bg-color-2' : 'w-[6px] h-[6px] bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              </div>
              {/* Card area */}
              <button onClick={() => setShowNewsModal(newsIdx)} className="relative flex-1 min-h-0 rounded-xl overflow-hidden cursor-pointer group text-left bg-gradient-to-br from-color-1 to-gray-700">
                {/* Background pattern */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-2 right-3 text-6xl">✨</div>
                </div>
                {/* Tag + Date */}
                <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between">
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-color-2 text-white text-sm font-semibold">
                    {news[newsIdx].tag}
                  </span>
                  <span className="text-white/60 text-sm font-medium">{news[newsIdx].date}</span>
                </div>
                {/* Nav arrows */}
                <div
                  onClick={(e) => { e.stopPropagation(); setNewsIdx((newsIdx - 1 + news.length) % news.length) }}
                  className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                </div>
                <div
                  onClick={(e) => { e.stopPropagation(); setNewsIdx((newsIdx + 1) % news.length) }}
                  className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors"
                >
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                </div>
                {/* Title overlay */}
                <div className="absolute bottom-2.5 left-3 right-3">
                  <p className="text-white text-sm font-bold leading-tight drop-shadow-sm">{news[newsIdx].title}</p>
                </div>
              </button>
            </div>

          </div>

          {/* 3 — Bottom left — Ranking chart */}
          <div ref={rankingRef} className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-color-1">Classement Google</h2>
                <p className={`text-sm text-gray-400 mt-0.5 transition-all rounded-lg ${seoHighlight === 'rank-keyword' ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}>"{profession} {ville}"</p>
              </div>
              <div className={`bg-gray-50 rounded-xl px-4 py-2.5 transition-all ${seoHighlight === 'rank-objective' ? 'ring-2 ring-color-2 ring-offset-2' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18A10.96 10.96 0 001 12c0 1.77.42 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  <span className="text-sm text-gray-500">Position actuelle</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-xl font-bold text-color-1">{rankCurrent}<span className="text-sm font-semibold">ème</span></span>
                  <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${rankChange > 0 ? 'text-green-500 bg-green-50' : rankChange < 0 ? 'text-red-500 bg-red-50' : 'text-gray-500 bg-gray-50'}`}>{rankChange > 0 ? '↑' : rankChange < 0 ? '↓' : '='} {Math.abs(rankChange)}</span>
                </div>
              </div>
            </div>

            {/* Ranking chart */}
            <div className={`flex-1 mt-3 min-h-0 flex transition-all rounded-xl ${seoHighlight === 'rank-evolution' ? 'ring-2 ring-color-2 ring-offset-4' : ''}`}>
              {/* Y-axis labels (ranking: 1 at top, 30 at bottom) */}
              <div className="flex flex-col justify-between pr-2 text-sm text-gray-400 shrink-0 text-right">
                <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>30</span>
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div
                  className="flex-1 relative min-h-0"
                  onMouseMove={dashboardState >= 1 ? (e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const idx = Math.round(x * (slicedRanking.length - 1))
                    setHoveredRank(Math.max(0, Math.min(idx, slicedRanking.length - 1)))
                  } : undefined}
                  onMouseLeave={dashboardState >= 1 ? () => setHoveredRank(null) : undefined}
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
                        <div className="px-2 py-0.5 rounded-md border border-green-400 bg-white text-sm font-semibold text-green-600 whitespace-nowrap mb-1 mx-auto w-fit shadow-sm">
                          #{slicedRanking[hoveredRank]} <span className="text-gray-400 font-normal">{slicedMonths[hoveredRank]}</span>
                        </div>
                      </div>
                      <div className="absolute w-2.5 h-2.5 rounded-full pointer-events-none border-2 border-white bg-green-500 shadow-sm" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -50%)' }} />
                    </>
                  })()}
                </div>

                {/* X-axis labels */}
                <div className="flex justify-between text-sm text-gray-400 pt-1.5 shrink-0">
                  {slicedMonths.map((m) => <span key={m}>{m}</span>)}
                </div>
              </div>
            </div>

            {/* Ranking locked overlay — states 0-2 */}
            {dashboardState <= 2 && activeBlockInfo !== 'ranking' && (
              <div className="absolute inset-0 z-10 flex items-center justify-center rounded-2xl overflow-hidden" style={{ backdropFilter: 'blur(4px) brightness(0.7)', backgroundColor: 'rgba(0,0,0,0.15)' }}>
                <button
                  onClick={() => { setActiveBlockInfo('ranking'); setBlockInfoDetail(0); setSeoHighlight('rank-keyword') }}
                  className="bg-white rounded-xl px-3 py-2 shadow-lg flex items-center gap-2 cursor-pointer hover:scale-[1.05] transition-transform duration-200 group border border-color-2/20"
                    style={{ animation: 'locked-float 2.5s ease-in-out infinite, locked-glow 2.5s ease-in-out infinite' }}
                >
                  <span className="text-sm">🏆</span>
                  <div className="text-left">
                    <h3 className="text-xs font-bold text-color-1">Classement Google</h3>
                    <p className="text-[10px] text-color-2 font-medium flex items-center gap-0.5">
                      En savoir plus
                      <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'locked-chevron 1.5s ease-in-out infinite' }}><path d="M9 18l6-6-6-6"/></svg>
                    </p>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
        )}
      </div>

      {/* Settings panel — rendered on top when active */}
      {showSettings && (
      <div className="absolute inset-0 top-[52px] px-6 py-4 w-full max-w-[1200px] mx-auto">
        <div key="settings" className="flex gap-6 h-full" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
          {/* Left column — single unified card */}
          <div className="w-[260px] shrink-0 bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col">
            {/* Settings nav */}
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

            {/* Bottom cards */}
            <div className="mt-auto flex flex-col gap-2.5">
              {/* Cancellation card */}
              <div className="bg-gray-50 rounded-xl p-4 flex flex-col">
                <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center mb-2">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                </div>
                <h3 className="text-sm font-bold text-color-1 mb-0.5">Annulation prévue</h3>
                <p className="text-xs text-gray-400 leading-relaxed">Votre abonnement sera annulé le <span className="font-semibold text-red-500">22/02/26.</span></p>
                <button onClick={() => setSettingsTab('billing')} className="mt-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-color-1 hover:bg-white transition-colors cursor-pointer">
                  Réactiver
                </button>
              </div>

              {/* Referral card */}
              <div className="relative rounded-xl overflow-hidden" style={{ boxShadow: '0 0 8px rgba(255,69,0,0.2)' }}>
                <div className="relative p-4 flex flex-col overflow-hidden">
                  <img src={articleImg1} alt="" className="absolute inset-0 w-full h-full object-cover" style={{ objectPosition: '90% 0%', transform: 'scale(1.3)' }} />
                  <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 30%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.08) 100%)' }} />
                  <div className="relative w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center mb-2">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                  </div>
                  <h3 className="relative text-sm font-bold text-white mb-0.5">Parrainage</h3>
                  <p className="relative text-xs text-gray-300 leading-relaxed">Invitez un confrère et gagnez jusqu'à <span className="text-color-2 font-semibold">2 mois offerts.</span></p>
                  <button onClick={() => { setShowSettings(false); setActiveTab('parrainage'); }} className="relative mt-2 px-3 py-1.5 rounded-lg bg-color-2 text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer">
                    Inviter un confrère
                  </button>
                </div>
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
                    <h3 className="text-base font-bold text-color-1 mb-1">Mot de passe</h3>
                    <p className="text-sm text-gray-500 mb-3">Protégez votre compte en réinitialisant votre mot de passe tous les quelques mois.</p>
                    <button className="px-4 py-2 rounded-xl bg-color-2 text-white text-sm font-semibold hover:bg-orange-600 transition-colors cursor-pointer">
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
                          className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all cursor-pointer flex items-center justify-center gap-1 ${
                            billingPeriod === period.id
                              ? 'bg-white text-color-1 shadow-sm'
                              : 'text-gray-500 hover:text-gray-700'
                          }`}
                        >
                          {period.label}
                          {period.badge && (
                            <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${
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
                        <p className="text-sm text-gray-400 leading-relaxed">Idéal pour un site vitrine design et optimisé pour transformer vos visiteurs en rendez-vous.</p>
                      </div>
                      <p className="text-sm font-semibold text-color-1 mb-3 mt-3">Prix tout inclus</p>
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
                          <span className="text-gray-400 text-sm">{currentSuffix}</span>
                          <span className="text-gray-400 text-sm">engagement 1 an</span>
                        </div>
                        <button className="w-full px-5 py-3 border-2 border-color-2 text-color-2 rounded-full font-semibold text-sm hover:bg-orange-50 transition-colors cursor-pointer">
                          Commencer l'essai gratuit
                        </button>
                      </div>
                    </div>

                    {/* Visibilité */}
                    <div className="border-2 border-color-2 rounded-2xl p-6 flex flex-col relative bg-orange-50/40">
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-color-2 text-white text-sm font-semibold px-4 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5">
                        <span>🚀</span> Référencement 3,5x plus rapide
                      </div>
                      <div className="min-h-[70px] mt-1">
                        <h3 className="text-lg font-bold text-color-2 mb-2">Visibilité</h3>
                        <p className="text-sm text-gray-400 leading-relaxed">Idéal vous référencer durablement sur Google et capter les recherches les plus qualifiées de votre secteur.</p>
                      </div>
                      <p className="text-base font-bold text-color-1 mb-3 mt-3">Tout le forfait basique plus...</p>
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
                          <span className="text-gray-400 text-sm">{currentSuffix}</span>
                          <span className="text-gray-400 text-sm">engagement 1 an</span>
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
                <h3 className="text-base font-bold text-color-1 mb-2">Vos moyens de paiement</h3>
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
                <h3 className="text-base font-bold text-color-1 mb-2">Vos factures</h3>
                <div className="flex-1 border border-gray-200 rounded-xl overflow-hidden min-h-0">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-200">
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-sm">Date</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-sm">Montant</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-sm">Statut</th>
                        <th className="text-left font-medium text-gray-500 px-4 py-2.5 text-sm">Carte</th>
                        <th className="text-center font-medium text-gray-500 px-4 py-2.5 text-sm">Télécharger</th>
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
                          <td className="px-4 py-3 text-color-1 text-sm">{inv.date}</td>
                          <td className="px-4 py-3 text-color-1 font-semibold text-sm">{inv.amount}</td>
                          <td className={`px-4 py-3 text-sm font-medium ${inv.statusColor}`}>{inv.status}</td>
                          <td className="px-4 py-3">
                            <div className="inline-flex items-center gap-1.5 border border-gray-200 rounded px-2 py-0.5">
                              <div className="flex items-center gap-0">
                                <div className="w-3 h-3 rounded-full bg-red-500 -mr-1" />
                                <div className="w-3 h-3 rounded-full bg-yellow-400" />
                              </div>
                              <span className="text-sm text-gray-500">•••• 9464</span>
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
      </div>
      )}

      {/* Per-block info spotlight */}
      {activeBlockInfo && (() => {
        const info = blockInfos[activeBlockInfo]
        if (!info) return null
        const hasSpotlight = !!blockSpotlightRect
        const gap = 16
        const cardStyle = hasSpotlight
          ? { position: 'fixed', zIndex: 50, width: 300 }
          : { position: 'fixed', zIndex: 50, width: 340, top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }

        if (hasSpotlight) {
          switch (info.position) {
            case 'bottom':
              cardStyle.top = blockSpotlightRect.top + blockSpotlightRect.height + gap
              cardStyle.left = blockSpotlightRect.left
              break
            case 'top':
              cardStyle.bottom = window.innerHeight - blockSpotlightRect.top + gap
              cardStyle.left = blockSpotlightRect.left
              break
            case 'right':
              cardStyle.top = blockSpotlightRect.top
              cardStyle.left = blockSpotlightRect.left + blockSpotlightRect.width + gap
              break
            case 'left':
              cardStyle.top = blockSpotlightRect.top
              cardStyle.right = window.innerWidth - blockSpotlightRect.left + gap
              break
          }
          // Clamp to viewport
          if (cardStyle.top !== undefined && cardStyle.top > window.innerHeight - 280) {
            cardStyle.top = Math.max(16, window.innerHeight - 280)
          }
          if (cardStyle.left !== undefined && cardStyle.left > window.innerWidth - 320) {
            cardStyle.left = Math.max(16, window.innerWidth - 320)
          }
        }

        return (
          <>
            {/* Click capture background */}
            <div className={`fixed inset-0 z-40 ${hasSpotlight ? '' : 'bg-black/60'}`} onClick={() => { setActiveBlockInfo(null); setSeoHighlight(null) }} />
            {/* Spotlight hole — only if ref exists */}
            {hasSpotlight && (
              <div
                className="fixed z-40 rounded-2xl pointer-events-none"
                style={{
                  top: blockSpotlightRect.top,
                  left: blockSpotlightRect.left,
                  width: blockSpotlightRect.width,
                  height: blockSpotlightRect.height,
                  boxShadow: '0 0 0 9999px rgba(0,0,0,0.75)',
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              />
            )}
            {/* Info card */}
            <div key={activeBlockInfo} style={{ ...cardStyle, animation: 'tour-fade-in 0.3s ease', maxWidth: 360 }} className="bg-white rounded-2xl shadow-2xl p-4">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-lg">{info.icon}</span>
                <h3 className="text-sm font-bold text-color-1">{info.title}</h3>
              </div>
              {info.details && (() => {
                const isLast = blockInfoDetail >= info.details.length - 1;
                const current = info.details[blockInfoDetail];
                return (
                  <>
                    <div className="flex gap-1.5 mb-2.5">
                      {info.details.map((d, i) => (
                        <div
                          key={i}
                          className={`flex-1 py-1.5 rounded-lg text-[11px] font-semibold text-center transition-all ${
                            blockInfoDetail === i
                              ? 'bg-color-2 text-white shadow-sm'
                              : i < blockInfoDetail
                              ? 'bg-orange-100 text-color-2'
                              : 'bg-gray-100 text-gray-400'
                          }`}
                        >
                          {d.label}
                        </div>
                      ))}
                    </div>
                    <p className="text-xs text-gray-500 leading-relaxed mb-3 min-h-[32px]">{current.desc}</p>
                    <button
                      onClick={() => {
                        if (isLast) {
                          setActiveBlockInfo(null);
                          setBlockInfoDetail(0);
                          setSeoHighlight(null);
                        } else {
                          const next = blockInfoDetail + 1;
                          setBlockInfoDetail(next);
                          if (info.details[next]?.sync) info.details[next].sync();
                        }
                      }}
                      className="w-full py-2 rounded-xl text-xs font-semibold text-white bg-color-1 hover:bg-gray-800 transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                    >
                      {isLast ? 'Compris' : (
                        <>
                          Suivant
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                        </>
                      )}
                    </button>
                  </>
                );
              })()}
            </div>
          </>
        )
      })()}
      {/* News modal */}
      {showNewsModal !== null && news[showNewsModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewsModal(null)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          <div className="relative bg-white rounded-2xl shadow-xl w-[520px] overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
            {/* Header area */}
            {/* Header — special design for Boostoncab */}
            {news[showNewsModal].tag === 'Partenaire' ? (
              <div className="w-full aspect-video relative overflow-hidden flex flex-col items-center justify-center" style={{ background: 'linear-gradient(135deg, #1a2744 0%, #243352 40%, #1e2d4a 100%)' }}>
                {/* Paper texture overlay */}
                <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'200\' height=\'200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'n\'%3E%3CfeTurbulence baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%25\' height=\'100%25\' filter=\'url(%23n)\' opacity=\'0.5\'/%3E%3C/svg%3E")' }} />
                {/* Decorative arrows */}
                <svg className="absolute left-8 top-6 opacity-20" width="40" height="80" viewBox="0 0 40 80" fill="none">
                  <path d="M20 80V10M20 10L5 25M20 10L35 25" stroke="#7ba0cc" strokeWidth="2" />
                </svg>
                <svg className="absolute left-16 top-3 opacity-15" width="30" height="60" viewBox="0 0 30 60" fill="none">
                  <path d="M15 60V8M15 8L4 19M15 8L26 19" stroke="#7ba0cc" strokeWidth="1.5" />
                </svg>
                {/* Paper airplane */}
                <div className="absolute left-6 bottom-4 opacity-30">
                  <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#8bafd4" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" style={{ transform: 'rotate(-20deg)' }}>
                    <path d="M22 2L11 13" /><path d="M22 2L15 22L11 13L2 9L22 2Z" />
                  </svg>
                </div>
                {/* Main text */}
                <h2 className="relative text-3xl font-bold text-center" style={{ color: '#e8dfc4', fontFamily: 'Georgia, "Times New Roman", serif' }}>Plateforme Privée</h2>
                <p className="relative text-sm text-center mt-2 max-w-[320px] leading-relaxed" style={{ color: '#b0bfd4', fontFamily: 'Georgia, "Times New Roman", serif' }}>Accessible uniquement aux membres de l'accompagnement BoostTonCab</p>
                {/* Bottom-right branding */}
                <div className="absolute bottom-3 right-4 flex items-center gap-2">
                  <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
                    <span className="text-sm font-bold" style={{ color: '#e8dfc4', fontFamily: 'Georgia, serif' }}>B</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold" style={{ color: '#e8dfc4' }}>Boost ton cab</span>
                    <span className="text-[9px]" style={{ color: '#7b8da6' }}>© 2024</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="w-full aspect-video bg-gradient-to-br from-color-1 to-gray-700 flex items-center justify-center relative overflow-hidden">
                <div className="absolute top-2 right-3 text-6xl opacity-10">✨</div>
                <div className="absolute top-4 left-5 right-5 flex items-center justify-between">
                  <span className="inline-flex items-center px-2.5 py-1 rounded-full bg-color-2 text-white text-sm font-semibold">
                    {news[showNewsModal].tag}
                  </span>
                  <span className="text-white/60 text-sm">{news[showNewsModal].date}</span>
                </div>
                <p className="text-white/30 text-sm">Contenu à venir</p>
              </div>
            )}
            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-color-1 mb-2">{news[showNewsModal].title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{news[showNewsModal].desc}</p>
              <button
                onClick={() => setShowNewsModal(null)}
                className="px-4 py-2 rounded-xl bg-color-1 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default HomeDashboard
