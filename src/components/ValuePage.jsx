'use client'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'

const theralysLogo = '/images/theralys-logo.svg'
const TOTAL_STEPS = 10

/* ─── Animated counter ─── */
function AnimNum({ value, suffix = '' }) {
  const [display, setDisplay] = useState(0)
  const ref = useRef()
  useEffect(() => {
    const target = parseInt(value)
    if (isNaN(target)) return
    const duration = 900
    const t0 = performance.now()
    const tick = (now) => {
      const p = Math.min((now - t0) / duration, 1)
      const ease = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(ease * target))
      if (p < 1) ref.current = requestAnimationFrame(tick)
    }
    ref.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(ref.current)
  }, [value])
  return <>{display}{suffix}</>
}

/* ─── Mini browser chrome ─── */
function Browser({ children, url }) {
  return (
    <div className="rounded-xl overflow-hidden shadow-[0_1px_16px_rgba(0,0,0,0.06),0_0_0_1px_rgba(0,0,0,0.04)]">
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAFAFA] border-b border-gray-100">
        <span className="w-2 h-2 rounded-full bg-[#FF5F57]" />
        <span className="w-2 h-2 rounded-full bg-[#FEBC2E]" />
        <span className="w-2 h-2 rounded-full bg-[#28C840]" />
        {url && (
          <div className="flex-1 flex justify-center">
            <span className="text-[9px] text-gray-400 bg-white rounded px-2 py-0.5 border border-gray-200/80 font-medium">{url}</span>
          </div>
        )}
      </div>
      <div className="bg-white">{children}</div>
    </div>
  )
}

/* ─── Google result ─── */
function GResult({ title, url, desc, you }) {
  return (
    <div className={`py-2 px-2.5 rounded-lg ${you ? 'bg-color-2/[0.04] ring-1 ring-color-2/15' : ''}`}>
      <p className="text-[9px] text-gray-400 truncate">{url}</p>
      <p className={`text-[11px] font-semibold mt-0.5 ${you ? 'text-color-2' : 'text-blue-700'}`}>{title}</p>
      <p className="text-[9px] text-gray-500 mt-0.5 line-clamp-1">{desc}</p>
    </div>
  )
}

/* ─── Step label ─── */
function StepLabel({ icon, text }) {
  return (
    <div className="inline-flex items-center gap-1.5 bg-color-2/[0.06] text-color-2 rounded-full px-2.5 py-0.5 mb-3">
      <span className="text-[10px]">{icon}</span>
      <span className="text-[9px] font-bold uppercase tracking-wider">{text}</span>
    </div>
  )
}

export default function ValuePage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [userData, setUserData] = useState({ prenom: '', profession: '', ville: '' })
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState(1)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem('userData')
    if (saved) setUserData(JSON.parse(saved))
    setTimeout(() => setMounted(true), 100)
  }, [])

  const prenom = userData?.prenom || 'Théo'
  const profession = userData?.profession || 'Kinésithérapeute'
  const ville = userData?.ville || 'Lyon'
  const domain = `www.theo-${profession.toLowerCase().replace(/é/g,'e').replace(/[^a-z]/g,'').slice(0,8)}-${ville.toLowerCase()}.fr`

  const goTo = (n) => {
    if (animating || n === step) return
    setDirection(n > step ? 1 : -1)
    setAnimating(true)
    setTimeout(() => { setStep(n); setTimeout(() => setAnimating(false), 60) }, 200)
  }
  const next = () => { if (step < TOTAL_STEPS - 1) goTo(step + 1) }
  const prev = () => { if (step > 0) goTo(step - 1) }
  const handleContinue = () => router.push('/pre-dashboard')

  const specialties = [
    { title: 'Douleurs lombaires', icon: '🔴' },
    { title: 'Burn-out & stress', icon: '🟣' },
    { title: 'Femme enceinte', icon: '🩷' },
    { title: 'Nourrisson', icon: '🔵' },
    { title: 'Sportif', icon: '🟢' },
    { title: 'Post-opératoire', icon: '🟡' },
  ]

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* ─── Header ─── */}
      <div className="shrink-0 flex items-center justify-between px-6 h-12 border-b border-gray-100/80">
        <img src={theralysLogo} alt="Theralys" className="h-5" />
        <div className="flex items-center gap-0.5">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <button key={i} onClick={() => goTo(i)} className="group p-0.5 cursor-pointer">
              <div className={`rounded-full transition-all duration-500 ${
                i === step ? 'w-5 h-1.5 bg-color-2' : i < step ? 'w-1.5 h-1.5 bg-color-2/30' : 'w-1.5 h-1.5 bg-gray-200 group-hover:bg-gray-300'
              }`} />
            </button>
          ))}
        </div>
        <div className="w-12" />
      </div>

      {/* ─── Content ─── */}
      <div className="flex-1 overflow-hidden relative">
        <div className={`absolute inset-0 flex items-center justify-center transition-all duration-250 ease-out ${
          animating ? `opacity-0 ${direction > 0 ? 'translate-x-4' : '-translate-x-4'}` : `opacity-100 translate-x-0 ${mounted ? '' : 'opacity-0'}`
        }`}>
          <div className="w-full max-w-[960px] mx-auto px-8 h-full flex items-center">

            {/* ═══ STEP 0 — VUE D'ENSEMBLE ═══ */}
            {step === 0 && (
              <div className="w-full max-w-[680px] mx-auto">
                <div className="text-center mb-6">
                  <StepLabel icon="⚡" text="Le système" />
                  <h1 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                    Votre site repose sur <span className="text-color-2">3 piliers</span> pour remplir votre agenda.
                  </h1>
                  <p className="text-[12px] text-gray-400 mt-2">Voici comment ils fonctionnent ensemble.</p>
                </div>

                <div className="flex flex-col gap-3">
                  {[
                    {
                      num: '1',
                      title: 'Page d\'accueil',
                      sub: 'Votre carte de visite',
                      desc: `Quand un patient cherche « ${profession.toLowerCase()} ${ville.toLowerCase()} », il arrive ici. Votre page d'accueil présente vos 6 profils — chacun se reconnaît.`,
                      color: 'bg-color-2/[0.05] ring-color-2/15',
                      numColor: 'bg-color-2 text-white',
                    },
                    {
                      num: '2',
                      title: '6 Spécialités',
                      sub: 'Un zoom sur chaque profil',
                      desc: `Certains cherchent plus précis : « ${profession.toLowerCase()} du sport ». Chaque spécialité est une page dédiée qui convainc et renforce l'accueil.`,
                      color: 'bg-blue-50/50 ring-blue-200/20',
                      numColor: 'bg-blue-500 text-white',
                    },
                    {
                      num: '3',
                      title: 'Articles & Avis',
                      sub: 'Les moteurs du système',
                      desc: '30 articles/mois + avis clients gonflent votre expertise aux yeux de Google. Objectif : atteindre le top 3, qui capte 80% des demandes de RDV.',
                      color: 'bg-amber-50/50 ring-amber-200/20',
                      numColor: 'bg-amber-500 text-white',
                    },
                  ].map((item, i) => (
                    <div key={i} className={`flex items-center gap-4 rounded-xl p-4 ring-1 ${item.color}`}>
                      <div className={`w-8 h-8 rounded-lg ${item.numColor} flex items-center justify-center shrink-0`}>
                        <span className="text-[13px] font-black">{item.num}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <p className="text-[13px] font-bold text-color-1">{item.title}</p>
                          <span className="text-[10px] text-gray-400 font-medium">— {item.sub}</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 text-center">
                  <p className="text-[11px] text-gray-400">On vous explique chaque étape en détail →</p>
                </div>
              </div>
            )}

            {/* ═══ STEP 1 — PAGE D'ACCUEIL : CONCEPT ═══ */}
            {step === 1 && (
              <div className="w-full max-w-[600px] mx-auto text-center">
                <StepLabel icon="🏠" text="Page d'accueil" />
                <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                  Votre carte de visite<br />
                  <span className="text-color-2">pour « {profession.toLowerCase()} {ville.toLowerCase()} »</span>
                </h2>
                <p className="text-[12px] text-gray-400 mt-3 leading-relaxed max-w-[460px] mx-auto">
                  Quand quelqu'un tape cette recherche, on ne sait pas qui c'est. Une femme enceinte ? Un sportif ? Un parent pour son enfant ?
                </p>

                <div className="mt-6 flex flex-col gap-2 text-left max-w-[480px] mx-auto">
                  <div className="flex items-start gap-2.5 bg-gray-50/70 rounded-lg p-3 ring-1 ring-gray-100/60">
                    <span className="text-xs shrink-0 mt-0.5">👩</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Une femme enceinte voit <span className="font-semibold text-color-1">« Femme enceinte »</span> dans vos profils — elle se sent au bon endroit.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-gray-50/70 rounded-lg p-3 ring-1 ring-gray-100/60">
                    <span className="text-xs shrink-0 mt-0.5">🏃</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      Un sportif voit <span className="font-semibold text-color-1">« Sportif »</span> — il sait que vous pouvez l'aider.
                    </p>
                  </div>
                  <div className="flex items-start gap-2.5 bg-color-2/[0.04] rounded-lg p-3 ring-1 ring-color-2/10">
                    <span className="text-xs shrink-0 mt-0.5">💡</span>
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      <span className="font-semibold text-color-2">Pourquoi 6 profils ?</span> Trop = dictionnaire. 6 = crédible et polyvalent.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 2 — PAGE D'ACCUEIL : MOCKUP ═══ */}
            {step === 2 && (
              <div className="w-full flex gap-8 items-center">
                <div className="flex-1 min-w-0">
                  <StepLabel icon="🏠" text="Page d'accueil" />
                  <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                    Voici à quoi ressemble<br />
                    <span className="text-color-2">votre page d'accueil.</span>
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                    6 profils, un bouton de RDV, tout est clair et rassurant.
                  </p>

                  <div className="mt-5 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-color-2 shrink-0" />
                      Présentation de {prenom} + photo
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-color-2 shrink-0" />
                      6 profils : chaque visiteur se reconnaît
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-color-2 shrink-0" />
                      Bouton « Prendre rendez-vous » visible
                    </div>
                    <div className="flex items-center gap-2 text-[11px] text-gray-500">
                      <span className="w-1.5 h-1.5 rounded-full bg-color-2 shrink-0" />
                      Optimisé mobile (60% du trafic)
                    </div>
                  </div>

                  <div className="mt-4 bg-color-2/[0.04] rounded-lg ring-1 ring-color-2/10 px-3 py-2">
                    <p className="text-[10px] text-gray-600 leading-relaxed">
                      <span className="font-bold text-color-1">Personnalisé</span> pour <span className="font-semibold text-color-2">{prenom}, {profession} à {ville}</span>.
                    </p>
                  </div>
                </div>

                <div className="w-[300px] shrink-0">
                  <Browser url={domain}>
                    <div className="p-4">
                      <div className="flex items-center gap-2.5 mb-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-color-2/20 to-color-2/5 ring-1 ring-color-2/10 flex items-center justify-center">
                          <span className="text-[10px] font-black text-color-2">{prenom.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="text-[11px] font-bold text-color-1">{prenom}</p>
                          <p className="text-[9px] text-gray-400">{profession} à {ville}</p>
                        </div>
                      </div>
                      <p className="text-[9px] text-gray-500 mb-3">Voici les profils que j'accompagne :</p>
                      <div className="grid grid-cols-3 gap-1.5">
                        {specialties.map((s, i) => (
                          <div key={i} className="rounded-lg bg-gray-50 ring-1 ring-gray-100 p-1.5 text-center">
                            <span className="text-[9px]">{s.icon}</span>
                            <p className="text-[7px] font-semibold text-color-1 mt-0.5 leading-tight">{s.title}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-2.5 h-7 rounded-lg bg-color-2 flex items-center justify-center">
                        <span className="text-[9px] font-bold text-white">Prendre rendez-vous</span>
                      </div>
                    </div>
                  </Browser>
                </div>
              </div>
            )}

            {/* ═══ STEP 3 — SPÉCIALITÉS : CONCEPT ═══ */}
            {step === 3 && (
              <div className="w-full max-w-[600px] mx-auto text-center">
                <StepLabel icon="🎯" text="Spécialités" />
                <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                  Un zoom sur chaque profil<br />
                  <span className="text-color-2">pour convaincre.</span>
                </h2>
                <p className="text-[12px] text-gray-400 mt-3 leading-relaxed max-w-[460px] mx-auto">
                  Certains patients ne cherchent pas « {profession.toLowerCase()} » mais une problématique précise.
                </p>

                <div className="mt-6 flex items-start gap-2.5 bg-green-50/50 rounded-lg p-4 ring-1 ring-green-200/30 text-left max-w-[480px] mx-auto">
                  <span className="text-sm shrink-0">🏃</span>
                  <div>
                    <p className="text-[12px] font-semibold text-color-1">« Super, il a l'air d'être un spécialiste du sport. »</p>
                    <p className="text-[10px] text-gray-500 mt-1.5 leading-relaxed">
                      Le sportif tombe sur votre page dédiée — un <span className="font-semibold text-color-1">zoom complet sur son problème</span>. Il est déjà convaincu.
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap justify-center gap-1.5">
                  {specialties.map((s, i) => (
                    <div key={i} className="flex items-center gap-1 bg-gray-50 ring-1 ring-gray-100 rounded-full px-2.5 py-1">
                      <span className="text-[9px]">{s.icon}</span>
                      <span className="text-[10px] font-semibold text-color-1">{s.title}</span>
                    </div>
                  ))}
                </div>

                <p className="text-[11px] text-gray-400 mt-4">
                  Vos 6 profils d'accueil → <span className="font-semibold text-color-2">6 pages dédiées</span>, chacune personnalisée.
                </p>
              </div>
            )}

            {/* ═══ STEP 4 — SPÉCIALITÉS : GOOGLE SEARCH ═══ */}
            {step === 4 && (
              <div className="w-full flex gap-8 items-center">
                <div className="flex-1 min-w-0">
                  <StepLabel icon="🎯" text="Spécialités" />
                  <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                    Chaque spécialité<br />
                    <span className="text-color-2">apparaît dans Google.</span>
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                    Quand un patient cherche une problématique précise, votre page dédiée ressort.
                  </p>

                  <div className="mt-5 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5 bg-gray-50/70 rounded-lg p-2.5 ring-1 ring-gray-100/60">
                      <span className="text-xs shrink-0 mt-0.5">🔍</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        « <span className="font-semibold text-color-1">{profession.toLowerCase()} du sport {ville.toLowerCase()}</span> » → votre page Sportif
                      </p>
                    </div>
                    <div className="flex items-start gap-2.5 bg-gray-50/70 rounded-lg p-2.5 ring-1 ring-gray-100/60">
                      <span className="text-xs shrink-0 mt-0.5">🔍</span>
                      <p className="text-[11px] text-gray-600 leading-relaxed">
                        « <span className="font-semibold text-color-1">mal de dos {ville.toLowerCase()}</span> » → votre page Douleurs lombaires
                      </p>
                    </div>
                  </div>

                  <p className="text-[11px] text-gray-500 mt-4 leading-relaxed">
                    Chaque page attire un profil de patient différent et <span className="font-semibold text-color-2">renforce votre page d'accueil</span>.
                  </p>
                </div>

                <div className="w-[300px] shrink-0">
                  <Browser url="google.com">
                    <div className="p-3">
                      <div className="flex items-center gap-1.5 mb-2.5 bg-gray-50 rounded-lg px-2.5 py-1.5 ring-1 ring-gray-100">
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
                        <span className="text-[10px] text-gray-600 font-medium">{profession.toLowerCase()} du sport {ville.toLowerCase()}</span>
                      </div>
                      <GResult
                        title={`Rééducation sportive — ${prenom}, ${profession}`}
                        url={`${domain}/reeducation-sportive`}
                        desc={`Spécialiste de la rééducation sportive à ${ville}. Entorses, tendinites, reprise après blessure.`}
                        you
                      />
                      <GResult
                        title={`Kinésithérapeute du sport — Annuaire`}
                        url="annuaire-sante.fr/kine-sport"
                        desc="Trouvez un kinésithérapeute du sport. Liste, avis, tarifs..."
                      />
                      <div className="mt-2 border-t border-gray-100 pt-2">
                        <GResult
                          title={`Douleurs lombaires — ${prenom}`}
                          url={`${domain}/douleurs-lombaires`}
                          desc={`Spécialiste des douleurs lombaires à ${ville}. Bilan personnalisé.`}
                          you
                        />
                      </div>
                    </div>
                  </Browser>
                </div>
              </div>
            )}

            {/* ═══ STEP 5 — ARTICLES : LE MOTEUR SEO ═══ */}
            {step === 5 && (
              <div className="w-full flex gap-8 items-center">
                <div className="flex-1 min-w-0">
                  <StepLabel icon="📝" text="Articles" />
                  <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                    30 articles / mois<br />
                    <span className="text-color-2">publiés automatiquement.</span>
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                    Les articles répondent aux questions de vos futurs patients. <span className="font-semibold text-color-1">Vous n'écrivez rien.</span>
                  </p>

                  <div className="mt-5 bg-color-2/[0.04] rounded-lg ring-1 ring-color-2/10 p-3">
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      <span className="font-bold text-color-1">Leur vrai rôle :</span> gonfler votre expertise aux yeux de Google.
                    </p>
                    <p className="text-[11px] text-gray-600 mt-2 leading-relaxed">
                      « Ce thérapeute semble qualifié — <span className="font-semibold text-color-2">place 14 → place 8</span>. » Et ainsi de suite, jusqu'au top 3.
                    </p>
                  </div>

                  <div className="mt-3 flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50/50 ring-1 ring-amber-200/20">
                    <span className="text-[10px]">💡</span>
                    <p className="text-[10px] text-gray-500">Les articles ne génèrent pas de visites directes — ils <span className="font-semibold text-color-1">boostent vos pages</span> dans Google.</p>
                  </div>
                </div>

                <div className="w-[300px] shrink-0">
                  <Browser url={`${domain}/blog`}>
                    <div className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-[10px] font-bold text-color-1">Articles récents</p>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-green-400" /><span className="text-[7px] text-gray-400">Publié</span></div>
                          <div className="flex items-center gap-0.5"><span className="w-1.5 h-1.5 rounded-full bg-amber-400" /><span className="text-[7px] text-gray-400">Prog.</span></div>
                        </div>
                      </div>
                      {[
                        { t: 'Sciatique : 5 exercices pour soulager', s: 'pub' },
                        { t: 'Entorse de la cheville : protocole', s: 'pub' },
                        { t: 'Mal de dos au bureau : postures', s: 'pub' },
                        { t: 'Tendinite du coureur : prévention', s: 'pub' },
                        { t: 'Combien coûte une séance ?', s: 'pub' },
                        { t: 'Rééducation genou après croisé', s: 'prog' },
                        { t: 'Canal carpien : quand consulter ?', s: 'prog' },
                      ].map((a, i) => (
                        <div key={i} className={`flex items-center gap-2 rounded-md px-2 py-1.5 mb-1 ${a.s === 'pub' ? 'bg-green-50/50' : 'bg-amber-50/50'} ring-1 ring-gray-100/40`}>
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${a.s === 'pub' ? 'bg-green-400' : 'bg-amber-400'}`} />
                          <p className="text-[9px] font-medium text-color-1 truncate">{a.t}</p>
                        </div>
                      ))}
                    </div>
                  </Browser>
                </div>
              </div>
            )}

            {/* ═══ STEP 6 — AVIS CLIENTS ═══ */}
            {step === 6 && (
              <div className="w-full flex gap-8 items-center">
                <div className="flex-1 min-w-0">
                  <StepLabel icon="⭐" text="Avis clients" />
                  <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                    Les avis renforcent<br />
                    <span className="text-color-2">votre crédibilité.</span>
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                    Deuxième levier pour remonter dans Google et rassurer vos futurs patients.
                  </p>

                  <div className="mt-5 flex flex-col gap-2">
                    <div className="flex items-start gap-2.5 bg-gray-50/70 rounded-lg p-3 ring-1 ring-gray-100/60">
                      <span className="text-xs shrink-0 mt-0.5">📍</span>
                      <div>
                        <p className="text-[11px] font-bold text-color-1">Google Maps</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Les avis améliorent directement votre classement sur Google Maps — la recherche locale.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-gray-50/70 rounded-lg p-3 ring-1 ring-gray-100/60">
                      <span className="text-xs shrink-0 mt-0.5">🤝</span>
                      <div>
                        <p className="text-[11px] font-bold text-color-1">Confiance</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">Un patient hésite entre 3 thérapeutes — celui avec les meilleurs avis gagne.</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-color-2/[0.04] rounded-lg p-3 ring-1 ring-color-2/10">
                      <span className="text-xs shrink-0 mt-0.5">🤖</span>
                      <div>
                        <p className="text-[11px] font-bold text-color-1">Collecte automatisée</p>
                        <p className="text-[10px] text-gray-500 mt-0.5 leading-relaxed">On envoie les demandes d'avis pour vous. <span className="font-semibold text-color-2">Zéro effort.</span></p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="w-[300px] shrink-0">
                  <div className="rounded-xl ring-1 ring-gray-100 bg-gray-50/50 p-4">
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-8 h-8 rounded-lg bg-white ring-1 ring-gray-200 flex items-center justify-center">
                        <span className="text-sm font-bold text-[#4285F4]">G</span>
                      </div>
                      <div>
                        <p className="text-[11px] font-bold text-color-1">{prenom} — {profession}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          {[1,2,3,4,5].map(i => (
                            <svg key={i} width="10" height="10" viewBox="0 0 24 24" fill="#FBBF24" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                          ))}
                          <span className="text-[9px] text-gray-400 ml-0.5">4.9 (47 avis)</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {[
                        { name: 'Marie L.', text: 'Très professionnel, je recommande à 100%.', date: 'Il y a 3 jours' },
                        { name: 'Thomas D.', text: 'Excellent suivi pour ma rééducation sportive.', date: 'Il y a 1 sem.' },
                        { name: 'Sophie M.', text: 'À l\'écoute et très compétent. Merci !', date: 'Il y a 2 sem.' },
                      ].map((r, i) => (
                        <div key={i} className="bg-white rounded-lg p-2.5 ring-1 ring-gray-100">
                          <div className="flex items-center justify-between mb-1">
                            <p className="text-[10px] font-bold text-color-1">{r.name}</p>
                            <div className="flex gap-0.5">
                              {[1,2,3,4,5].map(j => (
                                <svg key={j} width="7" height="7" viewBox="0 0 24 24" fill="#FBBF24" stroke="none"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                              ))}
                            </div>
                          </div>
                          <p className="text-[9px] text-gray-500 leading-relaxed">{r.text}</p>
                          <p className="text-[8px] text-gray-300 mt-1">{r.date}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 7 — LA CASCADE ═══ */}
            {step === 7 && (
              <div className="w-full max-w-[600px] mx-auto text-center">
                <StepLabel icon="🔄" text="La cascade" />
                <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                  Chaque élément<br />
                  <span className="text-color-2">renforce les autres.</span>
                </h2>
                <p className="text-[12px] text-gray-400 mt-3 leading-relaxed max-w-[440px] mx-auto">
                  Ce n'est pas un site vitrine. C'est une mécanique cohérente de visibilité.
                </p>

                {/* Cascade visual */}
                <div className="mt-6 flex flex-col gap-2 max-w-[420px] mx-auto">
                  <div className="flex items-center gap-3 rounded-lg p-3 bg-blue-50/50 ring-1 ring-blue-200/20 text-left">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black">📝</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-color-1">30 articles / mois</p>
                      <p className="text-[9px] text-gray-400">Boostent votre expertise Google</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg p-3 bg-purple-50/50 ring-1 ring-purple-200/20 text-left">
                    <div className="w-7 h-7 rounded-lg bg-purple-500 text-white flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black">⭐</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-color-1">Avis clients</p>
                      <p className="text-[9px] text-gray-400">Renforcent crédibilité + Google Maps</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg p-3 bg-amber-50/50 ring-1 ring-amber-200/20 text-left">
                    <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black">🎯</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-color-1">6 spécialités montent</p>
                      <p className="text-[9px] text-gray-400">Attirent des patients qualifiés</p>
                    </div>
                  </div>

                  <div className="flex justify-center">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
                  </div>

                  <div className="flex items-center gap-3 rounded-lg p-3 bg-color-2/[0.05] ring-1 ring-color-2/15 text-left">
                    <div className="w-7 h-7 rounded-lg bg-color-2 text-white flex items-center justify-center shrink-0">
                      <span className="text-[10px] font-black">🏠</span>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold text-color-2">Page d'accueil au top 3</p>
                      <p className="text-[9px] text-gray-400">= 80% des demandes de RDV</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 8 — TOP 3 GOOGLE ═══ */}
            {step === 8 && (
              <div className="w-full flex gap-8 items-center">
                <div className="flex-1 min-w-0">
                  <StepLabel icon="🏆" text="L'objectif" />
                  <h2 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                    Le top 3 Google :<br />
                    <span className="text-color-2">80% des demandes de RDV.</span>
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-2 mb-5 leading-relaxed">
                    Le top 3 se partage la quasi-totalité des clics.
                  </p>

                  <div className="flex flex-col gap-1.5">
                    {[
                      { pos: 1, name: prenom + ', ' + profession, you: true, pct: '~35%' },
                      { pos: 2, name: 'Cabinet Santé Plus', you: false, pct: '~25%' },
                      { pos: 3, name: 'Centre Paramédical', you: false, pct: '~20%' },
                    ].map((r, i) => (
                      <div key={i} className={`flex items-center gap-2.5 rounded-lg p-2.5 ${r.you ? 'bg-color-2/[0.05] ring-2 ring-color-2/20' : 'bg-gray-50 ring-1 ring-gray-100'}`}>
                        <div className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black ${r.you ? 'bg-color-2 text-white' : 'bg-gray-200 text-gray-500'}`}>{r.pos}</div>
                        <p className={`text-[11px] font-bold flex-1 truncate ${r.you ? 'text-color-2' : 'text-gray-500'}`}>{r.name}</p>
                        <p className={`text-[12px] font-black ${r.you ? 'text-color-2' : 'text-gray-300'}`}>{r.pct}</p>
                      </div>
                    ))}
                    <div className="flex items-center gap-2.5 rounded-lg p-2.5 bg-gray-50/50 ring-1 ring-gray-100/50 opacity-30">
                      <div className="w-6 h-6 rounded-md bg-gray-100 flex items-center justify-center text-[9px] font-bold text-gray-400">4+</div>
                      <p className="text-[11px] text-gray-400 flex-1">Autres...</p>
                      <p className="text-[12px] font-black text-gray-300">~20%</p>
                    </div>
                  </div>
                </div>

                <div className="w-[300px] shrink-0">
                  <div className="bg-gray-50/70 rounded-xl ring-1 ring-gray-100 p-5">
                    <p className="text-[11px] font-bold text-color-1 mb-4">Progression type</p>
                    <div className="relative">
                      <div className="absolute left-[9px] top-2 bottom-2 w-[2px] bg-gradient-to-b from-gray-200 via-color-2/30 to-color-2 rounded-full" />
                      {[
                        { time: 'Mois 1', text: 'Site indexé. Page 2–3.', dot: 'bg-gray-300' },
                        { time: 'Mois 2–3', text: 'Articles travaillent. Position 8–10.', dot: 'bg-color-2/40' },
                        { time: 'Mois 3–6', text: 'Spécialités montent. Top 5.', dot: 'bg-color-2/70' },
                        { time: 'Mois 6+', text: 'Top 3 atteint. L\'agenda se remplit.', dot: 'bg-color-2', trophy: true },
                      ].map((s, i) => (
                        <div key={i} className="flex items-start gap-2.5 mb-4 last:mb-0 relative">
                          <div className={`w-5 h-5 rounded-full ${s.dot} ring-4 ring-gray-50 flex items-center justify-center shrink-0`}>
                            {s.trophy && <span className="text-[7px]">🏆</span>}
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-color-1">{s.time}</p>
                            <p className="text-[10px] text-gray-500 mt-0.5">{s.text}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-3 border-t border-gray-200/50 flex items-center gap-2">
                      <span className="text-[10px]">⏳</span>
                      <p className="text-[9px] text-gray-500"><span className="font-semibold text-color-1">3 à 6 mois</span> dans les villes compétitives.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ═══ STEP 9 — CTA ═══ */}
            {step === 9 && (
              <div className="w-full flex gap-8 items-center">
                <div className="flex-1 min-w-0">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-color-2/10 to-color-2/5 ring-1 ring-color-2/15 flex items-center justify-center mb-4">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
                    </svg>
                  </div>
                  <h2 className="text-[22px] font-black text-color-1 tracking-tight">
                    Tout est prêt, {prenom}.
                  </h2>
                  <p className="text-[12px] text-gray-400 mt-2 leading-relaxed">
                    Votre système de visibilité est prêt à être activé.
                  </p>

                  <div className="mt-4 bg-color-2/[0.04] rounded-lg ring-1 ring-color-2/10 px-3 py-2.5">
                    <p className="text-[11px] text-gray-600 leading-relaxed">
                      <span className="font-bold text-color-1">Tout est personnalisé :</span> de votre page d'accueil à chaque spécialité, en passant par chaque article — tout est rédigé pour <span className="font-semibold text-color-2">{prenom}, {profession} à {ville}</span>.
                    </p>
                  </div>

                  <button
                    onClick={handleContinue}
                    className="mt-5 w-full py-3.5 rounded-xl bg-color-2 hover:bg-color-2-dark active:scale-[0.98] transition-all text-white font-bold text-sm cursor-pointer shadow-[0_2px_12px_rgba(252,109,65,0.25)]"
                  >
                    Activer mon essai gratuit et lancer mon site
                  </button>
                  <p className="text-[10px] text-gray-300 mt-2 font-medium text-center">Sans carte bancaire · Annulable à tout moment</p>
                </div>

                <div className="w-[300px] shrink-0">
                  <div className="rounded-xl ring-1 ring-gray-100 bg-gray-50/50 p-5">
                    <p className="text-[11px] font-bold text-color-1 uppercase tracking-wider mb-4">Récapitulatif</p>
                    <div className="flex flex-col gap-3">
                      {[
                        { text: 'Page d\'accueil avec 6 profils', sub: 'Carte de visite optimisée' },
                        { text: '6 pages de spécialités', sub: 'Un zoom par profil' },
                        { text: '30 articles SEO / mois', sub: 'Publiés automatiquement' },
                        { text: 'Collecte d\'avis automatisée', sub: 'Renforcement Google Maps' },
                        { text: 'Objectif : top 3 Google', sub: '80% des demandes de RDV' },
                      ].map((item, i) => (
                        <div key={i} className="flex items-start gap-2.5">
                          <div className="w-5 h-5 mt-0.5 rounded-full bg-green-50 ring-1 ring-green-200/80 flex items-center justify-center shrink-0">
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                          </div>
                          <div>
                            <p className="text-[12px] text-color-1 font-semibold">{item.text}</p>
                            <p className="text-[9px] text-gray-400 mt-0.5">{item.sub}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ─── Footer ─── */}
      <div className="shrink-0 flex items-center justify-between px-6 h-12 border-t border-gray-100/80">
        <button onClick={prev} className={`flex items-center gap-1 text-sm font-medium transition-all cursor-pointer ${
          step === 0 ? 'text-gray-200 pointer-events-none' : 'text-gray-400 hover:text-color-1'
        }`}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
          Précédent
        </button>
        <span className="text-[10px] text-gray-300 font-semibold tabular-nums">{step + 1} / {TOTAL_STEPS}</span>
        {step < TOTAL_STEPS - 1 ? (
          <button onClick={next} className="flex items-center gap-1 text-sm font-bold text-color-2 hover:text-color-2-dark transition-all cursor-pointer">
            Suivant
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        ) : (
          <button onClick={handleContinue} className="px-4 py-1.5 rounded-lg bg-color-2 hover:bg-color-2-dark active:scale-[0.97] transition-all text-white text-sm font-bold cursor-pointer shadow-sm shadow-color-2/20">
            C'est parti
          </button>
        )}
      </div>
    </div>
  )
}
