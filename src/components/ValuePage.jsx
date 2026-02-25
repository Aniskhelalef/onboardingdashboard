'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const theralysLogo = '/images/theralys-logo.svg'

export default function ValuePage() {
  const router = useRouter()
  const [userData, setUserData] = useState({ prenom: '', profession: '', ville: '' })
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(1)

  useEffect(() => {
    const saved = localStorage.getItem('userData')
    if (saved) setUserData(JSON.parse(saved))
    setTimeout(() => setMounted(true), 100)
  }, [])

  const prenom = userData?.prenom || 'Théo'
  const profession = userData?.profession || 'Kinésithérapeute'
  const ville = userData?.ville || 'Lyon'
  const domain = `www.${prenom.toLowerCase()}-${profession.toLowerCase().replace(/é/g,'e').replace(/[^a-z]/g,'').slice(0,8)}-${ville.toLowerCase()}.fr`
  const handleContinue = () => router.push('/pre-dashboard')

  const steps = [
    { text: 'Génération de votre page d\'accueil', status: 'done' },
    { text: 'Activer vos 14 jours gratuits', status: 'current' },
    { text: 'Ajouter vos photos sur votre accueil', status: 'locked' },
    { text: 'Retravailler vos textes de votre accueil', status: 'locked' },
    { text: 'Publier votre page d\'accueil et commencer à être visible', status: 'locked' },
    { text: 'Définir et générer vos 6 pages de spécialités', status: 'locked' },
    { text: 'Activer vos 30 articles de blog SEO automatiques', status: 'locked' },
    { text: 'Commencer à remplir votre agenda', status: 'locked' },
  ]

  const specialties = [
    { title: 'Douleurs lombaires', icon: '🔴' },
    { title: 'Burn-out & stress', icon: '🟣' },
    { title: 'Femme enceinte', icon: '🩷' },
    { title: 'Nourrisson', icon: '🔵' },
    { title: 'Sportif', icon: '🟢' },
    { title: 'Post-opératoire', icon: '🟡' },
  ]

  /* ─── Right column: what / why per step ─── */
  const previews = {
    0: {
      icon: '🏠',
      title: 'Votre page d\'accueil',
      what: `On a généré une page d'accueil complète pour ${prenom}, ${profession} à ${ville}. Elle présente vos 6 profils de patients pour que chaque visiteur se reconnaisse.`,
      why: 'C\'est la première chose qu\'un patient voit quand il cherche un praticien. Une page claire et rassurante, c\'est plus de rendez-vous.',
      items: [
        'Présentation de votre profil',
        '6 profils de patients mis en avant',
        'Bouton de prise de rendez-vous',
        'Optimisée pour mobile',
      ],
    },
    1: {
      icon: '🔓',
      title: 'Pourquoi activer maintenant ?',
      what: 'La pré-activation débloque tous les outils pour personnaliser, publier et développer votre visibilité. C\'est gratuit pendant 14 jours.',
      why: 'Plus vous activez tôt, plus vite votre site travaille pour vous. Le référencement Google prend du temps — chaque jour compte.',
      items: [
        'Éditeur de photos et textes',
        '6 pages de spécialités',
        '30 articles SEO automatiques / mois',
        'Collecte d\'avis assistée',
        'Tableau de bord complet',
      ],
    },
    2: {
      icon: '📸',
      title: 'Vos photos font la différence',
      what: 'Ajoutez votre photo de profil, des photos de votre cabinet et de vos séances. C\'est ce qui transforme un site générique en votre site.',
      why: 'Un patient hésite entre 3 praticiens. Celui avec de vraies photos inspire confiance — il se projette avant même de prendre rendez-vous.',
      items: [
        'Photo de profil professionnelle',
        'Photos de votre cabinet',
        'Photos de vos séances',
        'Modifiables à tout moment',
      ],
    },
    3: {
      icon: '✍️',
      title: 'Des textes qui vous ressemblent',
      what: 'Les textes sont pré-rédigés pour vous, mais vous pouvez tout modifier : votre approche, votre parcours, vos spécialités. Chaque mot compte.',
      why: 'Un patient veut sentir qui vous êtes avant de prendre rendez-vous. Des textes personnels et authentiques créent un lien de confiance.',
      items: [
        'Titre et sous-titre de votre page',
        'Texte de présentation "À propos"',
        'Description de votre approche',
        'Texte par spécialité',
      ],
    },
    4: {
      icon: '🌐',
      title: 'Vous devenez visible',
      what: `Une fois publié, votre site apparaît sur Google quand un patient cherche « ${profession.toLowerCase()} ${ville.toLowerCase()} ». C'est le début de votre visibilité.`,
      why: 'Aujourd\'hui, 8 patients sur 10 cherchent un praticien sur Google. Sans site, vous êtes invisible pour eux.',
      items: [
        'Indexation sur Google',
        'Accessible sur mobile et desktop',
        `Visible pour « ${profession.toLowerCase()} ${ville.toLowerCase()} »`,
        'Lien partageable à vos patients',
      ],
    },
    5: {
      icon: '🎯',
      title: '6 pages pour capter plus de patients',
      what: 'Chaque page de spécialité cible un profil de patient ou un motif de consultation précis. Un sportif qui cherche un spécialiste du sport tombe sur votre page dédiée.',
      why: 'Un patient qui trouve une page dédiée à son problème se dit « il peut m\'aider ». C\'est bien plus convaincant qu\'une page générique.',
      items: specialties.map(s => s.icon + ' ' + s.title),
    },
    6: {
      icon: '📝',
      title: 'Le moteur de votre visibilité',
      what: '30 articles publiés automatiquement chaque mois. Ils répondent aux questions que vos futurs patients tapent dans Google.',
      why: 'Les articles ne génèrent pas de visites directes. Leur rôle : montrer à Google que vous êtes un expert. Plus d\'articles = meilleur classement = plus de patients.',
      items: [
        'Publiés automatiquement',
        'Adaptés à votre spécialité',
        'Optimisés pour le référencement',
        'Vous n\'écrivez rien',
      ],
    },
    7: {
      icon: '📅',
      title: 'L\'objectif : remplir votre agenda',
      what: 'Page d\'accueil + spécialités + articles + avis = un système complet qui travaille 24h/24 pour remplir votre agenda.',
      why: 'Le top 3 Google capte 80% des demandes de rendez-vous. Tout ce qu\'on construit ensemble vise cette place.',
      items: [
        'Top 3 Google = 80% des RDV',
        'Résultats visibles en 3 à 6 mois',
        'Le système travaille pour vous',
        'Votre agenda se remplit progressivement',
      ],
    },
  }

  return (
    <div className="h-screen bg-white overflow-hidden flex flex-col">
      {/* ─── Header ─── */}
      <div className="shrink-0 flex items-center justify-center px-6 h-12 border-b border-gray-100/80">
        <img src={theralysLogo} alt="Theralys" className="h-5" />
      </div>

      {/* ─── Content: two columns ─── */}
      <div className="flex-1 overflow-hidden flex">

        {/* ── Left: roadmap ── */}
        <div className="w-[440px] shrink-0 flex flex-col justify-center px-10 border-r border-gray-100/80">
          <div className={`transition-all duration-500 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
            <div className="mb-6">
              <h1 className="text-[22px] font-black text-color-1 tracking-tight leading-[1.2]">
                Voici la suite, {prenom}.
              </h1>
              <p className="text-[12px] text-gray-400 mt-1.5">Votre parcours pour être visible en ligne.</p>
            </div>

            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[13px] top-3 bottom-3 w-[2px] bg-gray-100 rounded-full" />
              <div className="absolute left-[13px] top-3 w-[2px] rounded-full bg-color-2 transition-all duration-500" style={{ height: `${(1 / (steps.length - 1)) * 100}%` }} />

              <div className="flex flex-col">
                {steps.map((s, i) => (
                  <div key={i} className="relative">
                    <button
                      onClick={() => setActiveStep(i)}
                      className={`w-full flex items-start gap-3 py-2 pl-0 pr-2 rounded-lg text-left transition-all cursor-pointer ${
                        activeStep === i ? 'bg-gray-50/80' : 'hover:bg-gray-50/40'
                      }`}
                    >
                      {/* Dot */}
                      <div className={`w-[28px] h-[28px] rounded-full flex items-center justify-center shrink-0 relative z-10 transition-all ${
                        s.status === 'done'
                          ? 'bg-color-2 text-white'
                          : s.status === 'current'
                            ? 'bg-white ring-2 ring-color-2 text-color-2'
                            : 'bg-gray-100 text-gray-300'
                      } ${activeStep === i && s.status !== 'done' && s.status !== 'current' ? 'ring-2 ring-gray-300' : ''}`}>
                        {s.status === 'done' ? (
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                        ) : s.status === 'current' ? (
                          <span className="text-xs">⭐</span>
                        ) : (
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                        )}
                      </div>

                      {/* Text */}
                      <div className="flex-1 min-w-0 pt-1">
                        {s.status === 'current' && (
                          <p className="text-[9px] font-bold text-color-2 mb-0.5">Vous êtes ici 👉</p>
                        )}
                        <p className={`text-[12px] leading-snug ${
                          s.status === 'done'
                            ? 'text-color-1 font-semibold line-through decoration-color-2/30'
                            : s.status === 'current'
                              ? 'text-color-1 font-bold'
                              : 'text-gray-300 font-medium'
                        }`}>
                          {s.text}
                        </p>
                      </div>
                    </button>

                  </div>
                ))}
              </div>
            </div>

            {/* Navigation */}
            <div className="mt-6 flex items-center gap-3">
              {activeStep > 0 && (
                <button
                  onClick={() => setActiveStep(activeStep - 1)}
                  className="flex items-center gap-1 text-[12px] font-medium text-gray-400 hover:text-color-1 transition-all cursor-pointer"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="15 18 9 12 15 6"/></svg>
                  Précédent
                </button>
              )}
              <div className="flex-1" />
              {activeStep < steps.length - 1 ? (
                <button
                  onClick={() => setActiveStep(activeStep + 1)}
                  className="flex items-center gap-1 text-[13px] font-bold text-color-2 hover:text-color-2-dark transition-all cursor-pointer"
                >
                  Suivant
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                </button>
              ) : (
                <div className="flex-1">
                  <button
                    onClick={handleContinue}
                    className="w-full py-3 rounded-xl bg-color-2 hover:bg-color-2-dark active:scale-[0.98] transition-all text-white font-bold text-[13px] cursor-pointer shadow-[0_2px_12px_rgba(252,109,65,0.25)]"
                  >
                    Activer mes 14 jours gratuits
                  </button>
                  <p className="text-[10px] text-gray-300 mt-1.5 font-medium text-center">Annulable à tout moment</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: what / why ── */}
        <div className="flex-1 bg-gray-50/40 flex items-center justify-center p-10 overflow-hidden">
          <div className={`w-full max-w-[400px] transition-all duration-300 ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-95'}`}>
            {previews[activeStep] && (
              <div key={activeStep} className="animate-[fadeIn_0.25s_ease-out]">
                {/* Icon + title */}
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-12 h-12 rounded-2xl bg-white ring-1 ring-gray-200/80 shadow-sm flex items-center justify-center">
                    <span className="text-xl">{previews[activeStep].icon}</span>
                  </div>
                  <h2 className="text-[17px] font-black text-color-1 leading-tight">{previews[activeStep].title}</h2>
                </div>

                {/* What */}
                <div className="mb-4">
                  <p className="text-[9px] font-bold text-color-2 uppercase tracking-wider mb-1.5">Ce que c'est</p>
                  <p className="text-[13px] text-gray-600 leading-relaxed">{previews[activeStep].what}</p>
                </div>

                {/* Why */}
                <div className="mb-5 bg-color-2/[0.04] rounded-xl ring-1 ring-color-2/10 p-4">
                  <p className="text-[9px] font-bold text-color-2 uppercase tracking-wider mb-1.5">Pourquoi c'est important</p>
                  <p className="text-[13px] text-color-1 leading-relaxed font-medium">{previews[activeStep].why}</p>
                </div>

                {/* Items */}
                <div className="flex flex-col gap-1.5">
                  {previews[activeStep].items.map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 py-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-color-2 shrink-0" />
                      <p className="text-[12px] text-gray-500">{item}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  )
}
