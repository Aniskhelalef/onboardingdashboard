'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { SetupProvider } from '@/components/site-editor/setup/SetupContext'
import SetupInfoModal from '@/components/site-editor/setup/modals/SetupInfoModal'
import SetupSpecModal from '@/components/site-editor/setup/modals/SetupSpecModal'
import SetupVisModal from '@/components/site-editor/setup/modals/SetupVisModal'

const theralysLogo = '/images/theralys-logo.svg'

const allSpecialties = [
  { id: '1', icon: '🦴', title: 'Douleurs dorsales' },
  { id: '2', icon: '🤕', title: 'Maux de tête' },
  { id: '3', icon: '🏃', title: 'Blessures sportives' },
  { id: '4', icon: '👶', title: 'Pédiatrie' },
  { id: '5', icon: '🤰', title: 'Grossesse' },
  { id: '6', icon: '😴', title: 'Troubles du sommeil' },
]

const ACTIONS = [
  {
    id: 'setup-info',
    label: 'Informations',
    desc: 'Contact, cabinet et thérapeutes',
    requires: null,
    subSteps: [
      { id: 'contact', label: 'Contact' },
      { id: 'cabinet', label: 'Cabinet' },
      { id: 'therapists', label: 'Thérapeutes' },
    ],
    setupGroup: true,
    firstStep: 'contact',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
  {
    id: 'setup-specialties',
    label: 'Spécialités',
    desc: 'Définir vos domaines d\'expertise',
    requires: 'setup-info',
    subSteps: [
      { id: 'specialties', label: 'Spécialités' },
    ],
    setupGroup: true,
    firstStep: 'specialties',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
      </svg>
    ),
  },
  {
    id: 'setup-visibility',
    label: 'Visibilité',
    desc: 'Google Business et avis patients',
    requires: 'setup-specialties',
    subSteps: [
      { id: 'google', label: 'Google' },
      { id: 'avis', label: 'Avis' },
    ],
    setupGroup: true,
    firstStep: 'google',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
      </svg>
    ),
  },
  {
    id: 'publish',
    label: 'Publier',
    desc: 'Vérifier et valider chaque page',
    requires: 'setup-visibility',
    subSteps: [
      { id: 'review-home', label: 'Accueil' },
      { id: 'review-specs', label: 'Spécialités' },
      { id: 'review-mentions', label: 'Mentions' },
    ],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12"/>
      </svg>
    ),
  },
  {
    id: 'domain',
    label: 'Nom d\'hébergeur',
    desc: 'Choisir l\'adresse de votre site',
    requires: 'publish',
    subSteps: [],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    id: 'seo',
    label: 'Paramétrage SEO',
    desc: 'Optimiser le référencement',
    requires: 'domain',
    subSteps: [
      { id: 'seo-redaction', label: 'Rédaction' },
      { id: 'seo-repartition', label: 'Répartition' },
    ],
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/>
      </svg>
    ),
  },
]

const SETUP_ACTIONS = ACTIONS.filter(a => a.setupGroup)
const OTHER_ACTIONS = ACTIONS.filter(a => !a.setupGroup)

const PreDashboard = () => {
  const router = useRouter()
  const [completedActions, setCompletedActions] = useState([])
  const [prenom, setPrenom] = useState('')
  const [nom, setNom] = useState('')
  const [profession, setProfession] = useState('')
  const [ville, setVille] = useState('')
  // Modal states
  const [showInfoModal, setShowInfoModal] = useState(false)
  const [showSpecModal, setShowSpecModal] = useState(false)
  const [showVisModal, setShowVisModal] = useState(false)
  const [showDomainModal, setShowDomainModal] = useState(false)
  const [selectedDomain, setSelectedDomain] = useState(null)
  const [showSeoModal, setShowSeoModal] = useState(false)
  const [settingsSection, setSettingsSection] = useState('redaction')
  const [redTone, setRedTone] = useState('professionnel')
  const [redStyle, setRedStyle] = useState('informatif')
  const [redPronoun, setRedPronoun] = useState('nous')
  const [redPrompt, setRedPrompt] = useState('')
  const [checkedSpecs, setCheckedSpecs] = useState(['1', '2', '3', '4', '5', '6'])
  const [settingsInitial, setSettingsInitial] = useState(null)

  const refreshActions = () => {
    try { setCompletedActions(JSON.parse(localStorage.getItem('completedActions') || '[]')) } catch {}
  }

  // Hydrate from localStorage
  useEffect(() => {
    try {
      const ud = JSON.parse(localStorage.getItem('userData') || '{}')
      setPrenom(ud.prenom || 'Théo')
      setNom(ud.nom || 'Dupont')
      setProfession(ud.profession || 'Kinésithérapeute')
      setVille(ud.ville || 'Lyon')
    } catch { setPrenom('Théo'); setNom('Dupont'); setProfession('Kinésithérapeute'); setVille('Lyon') }
    refreshActions()
  }, [])

  // Listen for completedActions changes
  useEffect(() => {
    const handler = () => refreshActions()
    window.addEventListener('actionsUpdated', handler)
    window.addEventListener('storage', handler)
    return () => {
      window.removeEventListener('actionsUpdated', handler)
      window.removeEventListener('storage', handler)
    }
  }, [])

  // Check if a sub-step is done
  const isSubStepDone = (actionId, subStepId) => {
    if (actionId === 'publish') {
      if (subStepId === 'review-specs') return completedActions.some(a => a.startsWith('review-spec-'))
      return completedActions.includes(subStepId)
    }
    if (actionId === 'seo') {
      const seoStep = typeof window !== 'undefined' ? localStorage.getItem('seoSetupStep') : null
      if (subStepId === 'seo-redaction') return seoStep === 'repartition' || completedActions.includes('seo')
      if (subStepId === 'seo-repartition') return completedActions.includes('seo')
    }
    return completedActions.includes(subStepId)
  }

  const isActionDone = (actionId) => {
    const action = ACTIONS.find(a => a.id === actionId)
    if (!action) return completedActions.includes(actionId)
    if (action.subSteps.length > 0) return action.subSteps.every(s => isSubStepDone(action.id, s.id))
    return completedActions.includes(actionId)
  }

  // Auto-mark 'setup' when all 3 setup groups done
  useEffect(() => {
    const allSetupDone = SETUP_ACTIONS.every(a => isActionDone(a.id))
    if (allSetupDone && !completedActions.includes('setup')) {
      const next = [...completedActions, 'setup']
      localStorage.setItem('completedActions', JSON.stringify(next))
      setCompletedActions(next)
      window.dispatchEvent(new Event('actionsUpdated'))
    }
  }, [completedActions])

  // Auto-redirect when all actions complete
  useEffect(() => {
    if (ACTIONS.every(a => isActionDone(a.id))) {
      localStorage.setItem('preDashboardComplete', 'true')
      router.replace('/dashboard')
    }
  }, [completedActions, router])

  const getCompletedSubSteps = (action) => action.subSteps.filter(s => isSubStepDone(action.id, s.id)).length
  const totalSteps = ACTIONS.reduce((sum, a) => sum + (a.subSteps.length || 1), 0)
  const completedSteps = ACTIONS.reduce((sum, a) => {
    if (a.subSteps.length === 0) return sum + (isActionDone(a.id) ? 1 : 0)
    return sum + getCompletedSubSteps(a)
  }, 0)

  // Domain suggestions
  const slugify = (str) => str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const domainSuggestions = [
    { label: `${slugify(profession)}-${slugify(ville)}.fr`, desc: 'Métier + Ville' },
    { label: `${slugify(prenom)}-${slugify(profession)}.fr`, desc: 'Prénom + Métier' },
    { label: `${slugify(nom)}-${slugify(profession)}.fr`, desc: 'Nom + Métier' },
    { label: `${slugify(nom)}-${slugify(prenom)}.fr`, desc: 'Nom + Prénom' },
  ]

  const handleDomainConfirm = () => {
    if (!selectedDomain) return
    const existing = JSON.parse(localStorage.getItem('completedActions') || '[]')
    if (!existing.includes('domain')) existing.push('domain')
    localStorage.setItem('completedActions', JSON.stringify(existing))
    localStorage.setItem('chosenDomain', selectedDomain)
    setCompletedActions([...existing])
    window.dispatchEvent(new Event('actionsUpdated'))
    setShowDomainModal(false)
  }

  // Action click handlers
  const handleActionClick = (action) => {
    if (action.id === 'setup-info') setShowInfoModal(true)
    else if (action.id === 'setup-specialties') setShowSpecModal(true)
    else if (action.id === 'setup-visibility') setShowVisModal(true)
    else if (action.id === 'publish') router.push('/editor/accueil?mode=validate&from=pre-dashboard')
    else if (action.id === 'domain') { setSelectedDomain(null); setShowDomainModal(true) }
    else if (action.id === 'seo') {
      const savedStep = localStorage.getItem('seoSetupStep') || 'redaction'
      setSettingsSection(savedStep)
      setSettingsInitial({ tone: redTone, style: redStyle, pronoun: redPronoun, prompt: redPrompt, checkedSpecs: [...checkedSpecs] })
      setShowSeoModal(true)
    }
  }

  // SEO modal data
  const tones = [
    { id: 'professionnel', label: 'Professionnel' },
    { id: 'chaleureux', label: 'Chaleureux' },
    { id: 'expert', label: 'Expert' },
  ]
  const styles = [
    { id: 'informatif', label: 'Informatif' },
    { id: 'conversationnel', label: 'Conversationnel' },
    { id: 'pedagogique', label: 'Pédagogique' },
  ]
  const pronouns = [
    { id: 'nous', label: 'Nous', desc: '"Nous vous accueillons..."' },
    { id: 'je', label: 'Je', desc: '"Je vous accueille..."' },
    { id: 'on', label: 'On', desc: '"On vous accueille..."' },
  ]
  const p = { nous: { s: 'Nous', v: 'proposons', a: 'accueillons', poss: 'notre', possPl: 'nos' }, je: { s: 'Je', v: 'propose', a: 'accueille', poss: 'mon', possPl: 'mes' }, on: { s: 'On', v: 'propose', a: 'accueille', poss: 'notre', possPl: 'nos' } }[redPronoun]
  const previews = {
    professionnel: { informatif: `${p.s} ${p.v} des séances de kinésithérapie adaptées à chaque patient. ${p.possPl.charAt(0).toUpperCase() + p.possPl.slice(1)} protocoles sont élaborés selon les dernières recommandations de la HAS.`, conversationnel: `${p.s} ${p.a} chaque patient avec attention. Vous avez des douleurs lombaires ? ${p.possPl.charAt(0).toUpperCase() + p.possPl.slice(1)} séances sont conçues pour y répondre.`, pedagogique: `La kinésithérapie vise à restaurer la mobilité et réduire la douleur. ${p.s} ${p.v} un bilan initial complet, puis un plan de traitement personnalisé.` },
    chaleureux: { informatif: `${p.s} ${p.a} dans un cadre bienveillant pour prendre soin de votre bien-être. ${p.possPl.charAt(0).toUpperCase() + p.possPl.slice(1)} séances sont pensées pour que vous vous sentiez accompagné.`, conversationnel: `Bienvenue ! ${p.s} souhaite avant tout que vous vous sentiez à l'aise. Découvrez ${p.poss} approche douce et personnalisée.`, pedagogique: `Prendre soin de soi, c'est d'abord comprendre son corps. ${p.s} ${p.v} de vous guider avec bienveillance, pas à pas.` },
    expert: { informatif: `${p.s} ${p.v} une prise en charge basée sur les données probantes. Évaluation posturale, thérapie manuelle et exercices fonctionnels ciblés.`, conversationnel: `Vous ressentez une raideur cervicale ? ${p.s} ${p.v} une analyse biomécanique approfondie pour identifier les causes et adapter le traitement.`, pedagogique: `Le rachis lombaire supporte l'essentiel des contraintes mécaniques du quotidien. ${p.s} ${p.v} de vous expliquer les mécanismes en jeu.` },
  }
  const preview = previews[redTone]?.[redStyle] || previews.professionnel.informatif

  // Compact action card renderer
  const renderCard = (action) => {
    const done = isActionDone(action.id)
    const locked = action.requires && !isActionDone(action.requires)
    const isActive = !done && !locked
    const completedCount = getCompletedSubSteps(action)
    const totalCount = action.subSteps.length

    return (
      <button
        key={action.id}
        onClick={() => isActive && handleActionClick(action)}
        className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl border-2 text-left transition-all ${
          done ? 'bg-green-50 border-green-200'
          : locked ? 'bg-gray-50/50 border-gray-100 opacity-40 cursor-default'
          : 'bg-white border-gray-200 hover:border-gray-300 cursor-pointer'
        }`}
      >
        {/* Icon */}
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
          done ? 'bg-green-100 text-green-600'
          : locked ? 'bg-gray-100 text-gray-300'
          : 'bg-color-2/10 text-color-2'
        }`}>
          {done ? (
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
          ) : locked ? (
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          ) : action.icon}
        </div>

        {/* Label + desc */}
        <div className="flex-1 min-w-0">
          <p className={`text-[13px] font-semibold leading-tight ${
            done ? 'text-green-700' : locked ? 'text-gray-400' : 'text-color-1'
          }`}>{action.label}</p>
          {!done && <p className="text-[11px] text-gray-400 leading-tight mt-0.5">{action.desc}</p>}
        </div>

        {/* Progress dots */}
        {totalCount > 0 && !done && !locked && (
          <div className="flex items-center gap-1 shrink-0">
            {action.subSteps.map(s => (
              <div key={s.id} className={`w-2 h-2 rounded-full ${
                isSubStepDone(action.id, s.id) ? 'bg-green-500' : 'bg-gray-200'
              }`} />
            ))}
          </div>
        )}

        {/* Chevron for active */}
        {isActive && (
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2.5" strokeLinecap="round" className="shrink-0"><path d="M9 18l6-6-6-6"/></svg>
        )}
      </button>
    )
  }

  return (
    <div className="h-screen bg-gray-50 overflow-hidden flex flex-col items-center" style={{ backgroundImage: 'linear-gradient(rgba(0,0,0,0.04) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,0.04) 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
      {/* Top bar */}
      <div className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0">
        <img src={theralysLogo} alt="Theralys" className="h-6" />
      </div>

      {/* Centered content */}
      <div className="flex-1 flex items-center justify-center px-6">
        <div className="w-full max-w-[480px]">
          {/* Welcome */}
          <div className="mb-5">
            <h1 className="text-xl font-bold text-color-1">Bonjour {prenom}</h1>
            <p className="text-[13px] text-gray-400 mt-0.5">Complétez ces étapes pour activer votre site</p>
          </div>

          {/* Progress bar */}
          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-color-2 rounded-full transition-all duration-500" style={{ width: `${totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0}%` }} />
            </div>
            <span className="text-[11px] font-semibold text-gray-400 shrink-0">{completedSteps}/{totalSteps}</span>
          </div>

          {/* Setup group */}
          <div className="mb-2">
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5 px-1">Configuration</p>
            <div className="flex flex-col gap-1.5">
              {SETUP_ACTIONS.map(renderCard)}
            </div>
          </div>

          {/* Other actions */}
          <div>
            <p className="text-[10px] font-semibold text-gray-300 uppercase tracking-wider mb-1.5 px-1 mt-3">Lancement</p>
            <div className="flex flex-col gap-1.5">
              {OTHER_ACTIONS.map(renderCard)}
            </div>
          </div>
        </div>
      </div>

      {/* Setup Info modal */}
      {showInfoModal && (
        <SetupProvider initialStep="contact" isModal hideAdvanced onClose={() => { setShowInfoModal(false); refreshActions() }}>
          <SetupInfoModal onClose={() => { setShowInfoModal(false); refreshActions() }} />
        </SetupProvider>
      )}

      {/* Setup Specialties modal */}
      {showSpecModal && (
        <SetupProvider initialStep="specialties" isModal hideAdvanced onClose={() => { setShowSpecModal(false); refreshActions() }}>
          <SetupSpecModal onClose={() => { setShowSpecModal(false); refreshActions() }} />
        </SetupProvider>
      )}

      {/* Setup Visibility modal */}
      {showVisModal && (
        <SetupProvider initialStep="google" isModal hideAdvanced onClose={() => { setShowVisModal(false); refreshActions() }}>
          <SetupVisModal onClose={() => { setShowVisModal(false); refreshActions() }} />
        </SetupProvider>
      )}

      {/* Domain modal */}
      {showDomainModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowDomainModal(false)} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
            <div className="px-6 pt-6 pb-4">
              <div className="flex items-center gap-3 mb-1">
                <div className="w-9 h-9 rounded-xl bg-color-2/15 flex items-center justify-center shrink-0">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
                </div>
                <div>
                  <h3 className="text-base font-bold text-color-1">Nom de domaine</h3>
                  <p className="text-xs text-gray-400">Choisissez l'adresse de votre site</p>
                </div>
              </div>
            </div>
            <div className="px-6 pb-2 flex flex-col gap-1.5">
              {domainSuggestions.map((d) => {
                const isSelected = selectedDomain === d.label
                return (
                  <button
                    key={d.label}
                    onClick={() => setSelectedDomain(d.label)}
                    className={`flex items-center gap-3 px-3.5 py-3 rounded-xl border-2 transition-all text-left cursor-pointer ${
                      isSelected ? 'border-color-2 bg-color-2/5' : 'border-gray-200 bg-white hover:border-gray-300'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${
                      isSelected ? 'border-color-2' : 'border-gray-300'
                    }`}>
                      {isSelected && <div className="w-2 h-2 rounded-full bg-color-2" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="text-sm font-semibold text-color-1">{d.label}</span>
                    </div>
                    <span className="text-[11px] text-gray-400 font-medium shrink-0">{d.desc}</span>
                  </button>
                )
              })}
            </div>
            <div className="px-6 pt-3 pb-5">
              <button
                onClick={handleDomainConfirm}
                disabled={!selectedDomain}
                className={`w-full py-3 rounded-xl text-sm font-semibold transition-colors flex items-center justify-center gap-2 ${
                  selectedDomain ? 'bg-color-2 text-white hover:opacity-90 cursor-pointer' : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                }`}
              >
                Confirmer
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SEO modal */}
      {showSeoModal && (() => {
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => { localStorage.setItem('seoSetupStep', settingsSection); setShowSeoModal(false) }}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative bg-white rounded-2xl overflow-hidden w-[720px] max-w-[90vw] h-[520px] flex"
              onClick={e => e.stopPropagation()}
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'tab-fade-in 0.15s ease-out' }}
            >
              {/* Left sidebar */}
              <div className="w-[200px] shrink-0 border-r border-gray-100 py-5 px-3 flex flex-col">
                <h2 className="text-[13px] font-semibold text-gray-400 px-2.5 mb-3">Paramétrage SEO</h2>
                <div className="flex flex-col gap-0.5">
                  {[
                    { id: 'redaction', label: 'Rédaction IA', step: 1 },
                    { id: 'repartition', label: 'Répartition', step: 2 },
                  ].map(item => {
                    const isCurrent = settingsSection === item.id
                    const isDone = item.id === 'redaction' && settingsSection === 'repartition'
                    return (
                      <div
                        key={item.id}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all ${isCurrent ? 'bg-color-2/10 text-color-2' : isDone ? 'text-green-600' : 'text-gray-300'}`}
                      >
                        <span className={`w-5 h-5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 ${isCurrent ? 'bg-color-2 text-white' : isDone ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
                          {isDone ? <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg> : item.step}
                        </span>
                        {item.label}
                      </div>
                    )
                  })}
                </div>
              </div>
              {/* Right content */}
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-color-1">{settingsSection === 'redaction' ? 'Rédaction IA' : 'Répartition'}</h3>
                    <span className="text-[11px] font-medium text-gray-300">Étape {settingsSection === 'redaction' ? '1' : '2'} / 2</span>
                  </div>
                  <button onClick={() => { localStorage.setItem('seoSetupStep', settingsSection); setShowSeoModal(false) }} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                <div className="flex-1 px-6 py-4 flex flex-col">
                  {settingsSection === 'redaction' ? (
                    <div className="flex flex-col gap-3 flex-1" style={{ animation: 'tab-fade-in 0.2s ease' }}>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[11px] font-medium text-gray-500 mb-1.5 block">Ton de communication</span>
                          <div className="flex flex-col gap-1">
                            {tones.map(t => (
                              <button key={t.id} onClick={() => setRedTone(t.id)} className={`w-full py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${redTone === t.id ? 'bg-color-1 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{t.label}</button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-gray-500 mb-1.5 block">Style de rédaction</span>
                          <div className="flex flex-col gap-1">
                            {styles.map(s => (
                              <button key={s.id} onClick={() => setRedStyle(s.id)} className={`w-full py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${redStyle === s.id ? 'bg-color-1 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>{s.label}</button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div>
                        <span className="text-[11px] font-medium text-gray-500 mb-1.5 block">Pronom utilisé</span>
                        <div className="flex gap-2">
                          {pronouns.map(pr => (
                            <button key={pr.id} onClick={() => setRedPronoun(pr.id)} className={`flex-1 py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer flex flex-col items-center gap-0.5 ${redPronoun === pr.id ? 'bg-color-1 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                              <span>{pr.label}</span>
                              <span className={`text-[9px] ${redPronoun === pr.id ? 'text-white/60' : 'text-gray-400'}`}>{pr.desc}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-gray-500 mb-1.5 block">Instructions supplémentaires</span>
                          <textarea value={redPrompt} onChange={e => setRedPrompt(e.target.value)} placeholder="Ex: Toujours mentionner que le cabinet est accessible PMR..." className="w-full flex-1 text-[12px] text-color-1 bg-gray-50 rounded-xl px-3 py-2.5 outline-none border border-gray-200 focus:border-color-2 transition-colors resize-none leading-relaxed" />
                        </div>
                        <div className="flex flex-col">
                          <div className="flex items-center gap-1.5 mb-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg>
                            <span className="text-[11px] font-medium text-gray-500">Aperçu du style</span>
                          </div>
                          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex-1">
                            <p className="text-[12px] text-gray-600 leading-relaxed">{preview}</p>
                          </div>
                        </div>
                      </div>
                      <button onClick={() => { localStorage.setItem('seoSetupStep', 'repartition'); setSettingsSection('repartition') }} className="w-full py-2.5 rounded-xl text-[13px] font-medium shrink-0 flex items-center justify-center gap-2 transition-all bg-[#FC6D41] text-white hover:bg-[#e55e35] cursor-pointer">
                        Suivant <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg>
                      </button>
                    </div>
                  ) : (
                    <div className="flex flex-col h-full" style={{ animation: 'tab-fade-in 0.2s ease' }}>
                      <p className="text-[12px] text-gray-400 mb-3">Déplacez les thématiques entre les deux colonnes pour choisir vos sujets d'articles.</p>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <span className="text-[11px] font-semibold text-green-600 mb-1.5 block">Écrire des articles pour</span>
                          <div className="flex flex-col gap-0.5">
                            {allSpecialties.filter(s => checkedSpecs.includes(s.id)).map(spec => (
                              <button key={spec.id} onClick={() => { if (checkedSpecs.length <= 1) return; setCheckedSpecs(prev => prev.filter(id => id !== spec.id)) }} className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all bg-green-50 hover:bg-green-100 ${checkedSpecs.length <= 1 ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}>
                                <span className="text-sm shrink-0">{spec.icon}</span>
                                <span className="text-[12px] font-medium text-color-1 flex-1">{spec.title}</span>
                                {checkedSpecs.length > 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Ne pas écrire pour</span>
                          <div className="flex flex-col gap-0.5">
                            {allSpecialties.filter(s => !checkedSpecs.includes(s.id)).map(spec => (
                              <button key={spec.id} onClick={() => setCheckedSpecs(prev => [...prev, spec.id])} className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer bg-gray-50 hover:bg-gray-100 opacity-50 hover:opacity-80">
                                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                                <span className="text-sm shrink-0">{spec.icon}</span>
                                <span className="text-[12px] font-medium text-color-1 flex-1">{spec.title}</span>
                              </button>
                            ))}
                            {allSpecialties.filter(s => !checkedSpecs.includes(s.id)).length === 0 && (
                              <p className="text-[11px] text-gray-300 text-center py-2">Toutes sélectionnées</p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-auto pt-3 shrink-0">
                        <div className="pt-3 border-t border-gray-100 flex items-center gap-2 px-1 mb-3">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                          <p className="text-[11px] text-gray-400 leading-snug">
                            La répartition choisie sera prise en compte pour la génération des articles à partir du <span className="font-semibold text-color-1">{(() => { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) })()}</span>.
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            localStorage.removeItem('seoSetupStep')
                            const prev = JSON.parse(localStorage.getItem('completedActions') || '[]')
                            if (!prev.includes('seo')) {
                              const next = [...prev, 'seo']
                              localStorage.setItem('completedActions', JSON.stringify(next))
                              window.dispatchEvent(new Event('actionsUpdated'))
                            }
                            setShowSeoModal(false)
                          }}
                          className="w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all bg-[#FC6D41] text-white hover:bg-[#e55e35] cursor-pointer"
                        >
                          Terminer <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      <style>{`
        @keyframes tab-fade-in {
          from { opacity: 0; transform: translateY(4px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export default PreDashboard
