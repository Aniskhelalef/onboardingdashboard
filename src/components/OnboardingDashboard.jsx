import { useState, useEffect, useRef, useCallback } from 'react'
import theralysLogo from '../assets/theralys-logo.svg'
import mountainClimber from '../assets/mountain-climber.png'
import metierVille from '../assets/metier-ville.png'
import onboardingImage from '../assets/onboardingimage.png'
import iphoneFrame from '../assets/apple-iphone-17-pro-2025-medium.png'
import surveyImage from '../assets/survey.png'

// Composant pour le lien "Renvoyer l'e-mail"
const ResendEmailLink = () => {
  const [showSuccess, setShowSuccess] = useState(false)

  const handleResend = () => {
    setShowSuccess(true)
    // Masquer le message après 3 secondes
    setTimeout(() => setShowSuccess(false), 3000)
  }

  return (
    <div className="text-center">
      {showSuccess ? (
        <p className="text-green-600 text-sm font-medium">
          ✓ E-mail renvoyé avec succès
        </p>
      ) : (
        <button
          onClick={handleResend}
          className="text-color-2 text-sm font-medium hover:underline cursor-pointer"
        >
          Renvoyer l'e-mail
        </button>
      )}
    </div>
  )
}

const OnboardingDashboard = ({ onComplete }) => {
  const [currentView, setCurrentView] = useState('index') // 'index', 'signup', 'signin', 'email-verification', 'objectives', 'site-step1', 'site-step2', 'site-step3', 'site-step4', ou 'site-step5'
  const [userEmail, setUserEmail] = useState('')
  const [userPrenom, setUserPrenom] = useState('')
  const [userNom, setUserNom] = useState('')
  const [isGoogleLoading, setIsGoogleLoading] = useState(false) // État de chargement pour la simulation Google OAuth
  const [selectedObjectives, setSelectedObjectives] = useState([]) // Objectifs sélectionnés par l'utilisateur
  const [customObjective, setCustomObjective] = useState('') // Objectif personnalisé quand "Autres" est sélectionné
  const [profession, setProfession] = useState('')
  const [ville, setVille] = useState('')
  const [loadedTasks, setLoadedTasks] = useState(0)
  const [loadedSummaryTasks, setLoadedSummaryTasks] = useState(0)
  const [selectedPalette, setSelectedPalette] = useState('warm')
  const [selectedTypography, setSelectedTypography] = useState('modern')
  const [selectedRadius, setSelectedRadius] = useState('medium')
  const [uploadedImage, setUploadedImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [billingPeriod, setBillingPeriod] = useState('annual') // 'monthly', 'quarterly', 'annual'
  const [selectedPlan, setSelectedPlan] = useState('starter') // 'starter' or 'visibilite'
  const [selectedReferral, setSelectedReferral] = useState('') // How did you hear about us
  const [customReferral, setCustomReferral] = useState('') // Custom text when "Autres" selected
  const fileInputRef = useRef(null)

  // Simuler le flux Google OAuth
  const handleGoogleSignIn = (isLogin = false) => {
    setIsGoogleLoading(true)

    // Simuler le délai de l'OAuth (redirect vers Google et retour)
    setTimeout(() => {
      setIsGoogleLoading(false)

      if (isLogin) {
        // Connexion → tableau de bord (à implémenter plus tard)
        console.log('✓ Connexion Google réussie - Redirection vers le tableau de bord...')
        alert('✓ Connexion réussie avec Google !\n\nVous seriez redirigé vers votre tableau de bord.')
        setCurrentView('index')
      } else {
        // Inscription → onboarding objectifs
        console.log('✓ Inscription Google réussie - Redirection vers les objectifs...')
        setCurrentView('objectives')
      }
    }, 2000) // 2 secondes pour simuler le processus OAuth
  }

  // Toggle un objectif dans la sélection
  const toggleObjective = (objective) => {
    setSelectedObjectives(prev => {
      if (prev.includes(objective)) {
        if (objective === 'Autres') setCustomObjective('')
        return prev.filter(o => o !== objective)
      }
      return [...prev, objective]
    })
  }

  // Image upload handlers
  const handleFileUpload = useCallback((file) => {
    const reader = new FileReader()
    reader.onload = (e) => setUploadedImage(e.target.result)
    reader.readAsDataURL(file)
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith('image/')) handleFileUpload(file)
  }, [handleFileUpload])

  const handleDragOver = useCallback((e) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragging(false), [])

  const handleFileInputChange = useCallback((e) => {
    const file = e.target.files?.[0]
    if (file) handleFileUpload(file)
  }, [handleFileUpload])

  // Style data (HSL values from layout-guardian-editor StylePanel)
  const colorPalettes = [
    { id: 'warm', name: 'Chaleureux', colors: ['#C4A77D', '#E8DDD4', '#FAF7F5', '#5C4A3D'], accent: '36 35% 63%', accentDark: '36 35% 45%', background: '30 30% 97%', heroBg: '30 25% 92%', text: '30 25% 25%', textMuted: '30 15% 50%' },
    { id: 'ocean', name: 'Océan', colors: ['#7EB8DA', '#B8D4E8', '#F0F7FB', '#3D6B8C'], accent: '200 55% 67%', accentDark: '200 45% 40%', background: '200 50% 98%', heroBg: '200 45% 93%', text: '200 40% 25%', textMuted: '200 20% 50%' },
    { id: 'forest', name: 'Forêt', colors: ['#7EB897', '#B8D8C8', '#F0F8F4', '#3D6B52'], accent: '145 35% 60%', accentDark: '145 35% 35%', background: '145 40% 98%', heroBg: '145 35% 93%', text: '145 35% 25%', textMuted: '145 20% 50%' },
    { id: 'sunset', name: 'Coucher de soleil', colors: ['#E8A87C', '#F5D4C0', '#FDF8F5', '#A65D3F'], accent: '25 70% 70%', accentDark: '25 55% 45%', background: '25 60% 98%', heroBg: '25 55% 93%', text: '25 45% 25%', textMuted: '25 25% 50%' },
    { id: 'lavender', name: 'Lavande', colors: ['#B4A7D6', '#D8D0EB', '#F8F6FC', '#6B5B95'], accent: '260 40% 75%', accentDark: '260 35% 47%', background: '260 50% 98%', heroBg: '260 45% 93%', text: '260 35% 25%', textMuted: '260 20% 50%' },
    { id: 'minimal', name: 'Minimal', colors: ['#6B7280', '#9CA3AF', '#F9FAFB', '#374151'], accent: '220 9% 46%', accentDark: '220 13% 26%', background: '220 14% 98%', heroBg: '220 12% 93%', text: '220 13% 20%', textMuted: '220 9% 46%' },
  ]

  const typographyPairs = [
    { id: 'modern', display: 'Inter', label: 'Moderne', googleFont: 'Inter:wght@400;600;700' },
    { id: 'classic', display: 'Playfair Display', label: 'Classique', googleFont: 'Playfair+Display:wght@400;600;700' },
    { id: 'elegant', display: 'Cormorant Garamond', label: 'Élégant', googleFont: 'Cormorant+Garamond:wght@400;600;700' },
    { id: 'friendly', display: 'Poppins', label: 'Convivial', googleFont: 'Poppins:wght@400;600;700' },
  ]

  const radiusOptions = [
    { id: 'none', value: '0px', label: 'Aucun' },
    { id: 'small', value: '6px', label: 'Petit' },
    { id: 'medium', value: '12px', label: 'Moyen' },
    { id: 'large', value: '20px', label: 'Grand' },
  ]

  const objectives = [
    'Générer plus de visibilité',
    'Créer un site internet',
    "Optimiser l'efficacité de ma prise de rendez-vous",
    'Référencer mon activité 1ère sur Google',
    'Autres',
  ]

  // Tâches de base (toujours affichées)
  const baseTasks = [
    `Analyse du marché des ${profession} à ${ville}`,
    'Création d\'une structure SEO pour du référencement local',
    'Analyse des opportunités de mots-clés',
    'Analyse des Fiches Google My Business',
    'Optimisation de la vitesse de chargement à 0,9 sec',
    'Intégration des bonnes pratiques Google',
  ]

  // Tâches supplémentaires selon les objectifs sélectionnés
  const objectiveTaskMap = {
    'Générer plus de visibilité': ['Optimisation du référencement naturel local'],
    'Créer un site internet': ['Génération de la structure du site'],
    'Optimiser l\'efficacité de ma prise de rendez-vous': ['Configuration du module de prise de rendez-vous'],
    'Référencer mon activité 1ère sur Google': ['Analyse de la concurrence Google Maps'],
  }

  // Construction dynamique de la liste de tâches (max 6)
  const objectiveTasks = selectedObjectives.flatMap(obj => objectiveTaskMap[obj] || [])
  const allTasks = [baseTasks[0], ...objectiveTasks, ...baseTasks.slice(1)]
  const preparationTasks = allTasks.slice(0, 6)

  // Animation : charger les tâches une par une
  useEffect(() => {
    if (currentView !== 'site-step2') return
    setLoadedTasks(0)
    const interval = setInterval(() => {
      setLoadedTasks(prev => {
        if (prev >= preparationTasks.length) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1500)
    return () => clearInterval(interval)
  }, [currentView, preparationTasks.length])

  // Summary tasks for step 4
  const summaryTasks = [
    { label: '80% du site crée (3 pages + Blog)', auto: true },
    { label: '546 mots clés analysés, 11 opportunités identifiées', auto: true },
    { label: 'Score SEO à 91/100 (excellent)', auto: true },
    { label: '4 articles de blog rédigés & prêt à publication', auto: true },
    { label: 'Relecture du site & mise en ligne', auto: false },
    { label: 'Activation du référencement automatique', auto: false },
  ]

  // Animation step 4: load summary tasks one by one (only the auto ones)
  useEffect(() => {
    if (currentView !== 'site-step4') return
    setLoadedSummaryTasks(0)
    const interval = setInterval(() => {
      setLoadedSummaryTasks(prev => {
        const autoCount = summaryTasks.filter(t => t.auto).length
        if (prev >= autoCount) {
          clearInterval(interval)
          return prev
        }
        return prev + 1
      })
    }, 1200)
    return () => clearInterval(interval)
  }, [currentView])

  // Computed preview values for site-step3
  const previewPalette = colorPalettes.find(p => p.id === selectedPalette) || colorPalettes[0]
  const previewTypo = typographyPairs.find(t => t.id === selectedTypography) || typographyPairs[0]
  const previewRadius = radiusOptions.find(r => r.id === selectedRadius) || radiusOptions[2]

  const pages = [
    { id: 'index', label: 'Accueil' },
    { id: 'signup', label: 'Inscription' },
    { id: 'signin', label: 'Connexion' },
    { id: 'email-verification', label: 'Email' },
    { id: 'objectives', label: 'Objectifs' },
    { id: 'site-step1', label: 'Step 1' },
    { id: 'site-step2', label: 'Step 2' },
    { id: 'site-step3', label: 'Step 3' },
    { id: 'site-step4', label: 'Step 4' },
    { id: 'site-step5', label: 'Pricing' },
    { id: 'checkout', label: 'Checkout' },
    { id: 'survey', label: 'Survey' },
  ]

  return (
    <div className={`h-screen overflow-hidden bg-white grid grid-cols-1 ${currentView === 'site-step5' || currentView === 'checkout' ? '' : 'lg:grid-cols-2'}`}>
      {/* Dev nav */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 z-50 flex gap-0.5 bg-gray-900/90 backdrop-blur rounded-b-lg px-1.5 py-1">
        {pages.map((p) => (
          <button
            key={p.id}
            onClick={() => setCurrentView(p.id)}
            className={`px-1.5 py-0.5 rounded text-[9px] font-medium transition-colors cursor-pointer ${
              currentView === p.id ? 'bg-white text-gray-900' : 'text-gray-400 hover:text-white'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      {/* Left side - Form content */}
      <div className="flex items-center justify-center px-8 sm:px-12 lg:px-16 py-6 relative overflow-y-auto">
        <div className={`flex flex-col w-full ${currentView === 'site-step5' || currentView === 'checkout' ? 'max-w-4xl' : 'max-w-md'}`}>
        {/* Shared back button — always same position */}
        {(() => {
          const backTarget = {
            objectives: 'email-verification',
            'site-step1': 'objectives',
            'site-step2': 'site-step1',
            'site-step3': 'site-step2',
            'site-step4': 'site-step3',
            'site-step5': 'site-step4',
            checkout: 'site-step5',
            survey: 'checkout',
          }[currentView]
          if (!backTarget) return null
          return (
            <button
              onClick={() => setCurrentView(backTarget)}
              className="text-gray-400 hover:text-color-1 flex items-center gap-1.5 text-xs mb-4 cursor-pointer transition-colors"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M19 12H5M12 19l-7-7 7-7"/>
              </svg>
              Retour
            </button>
          )
        })()}
        {/* Vue Index - Page d'accueil */}
        {currentView === 'index' && (
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-6">
              <img src={theralysLogo} alt="Theralys" className="h-7" />
            </div>

            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Bienvenue sur Theralys
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Créez votre site internet professionnel et lancez votre stratégie de référencement local en quelques clics.
            </p>

            {/* Google sign-in button */}
            <button
              onClick={() => handleGoogleSignIn(false)}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-2.5 border-2 border-gray-300 rounded-full text-sm text-color-1 font-medium hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-color-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC04"/>
                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">ou</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Email button */}
            <button
              onClick={() => setCurrentView('signup')}
              className="w-full px-5 py-2.5 bg-color-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity mb-8"
            >
              Continuer avec l'e-mail
            </button>

            {/* Sign in link */}
            <p className="text-center text-gray-600">
              J'ai déjà un compte{' '}
              <span
                onClick={() => setCurrentView('signin')}
                className="text-color-2 font-medium cursor-pointer hover:underline"
              >
                Se connecter
              </span>
            </p>
          </div>
        )}

        {/* Vue Signup - Formulaire complet */}
        {currentView === 'signup' && (
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-6">
              <img src={theralysLogo} alt="Theralys" className="h-7" />
            </div>

            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Créez votre compte Theralys
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Essayez gratuitement Theralys. En quelques clics, créez votre site internet et lancer sa technologie de référencement locale.
            </p>

            {/* Google sign-in button */}
            <button
              onClick={() => handleGoogleSignIn(false)}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-2.5 border-2 border-gray-300 rounded-full text-sm text-color-1 font-medium hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-color-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC04"/>
                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.11l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                  </svg>
                  Continuer avec Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">ou</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Email form */}
            <form
              className="space-y-4 mb-6"
              onSubmit={(e) => {
                e.preventDefault()
                const formData = new FormData(e.currentTarget)
                const email = formData.get('email')
                setUserEmail(email)
                setUserPrenom(formData.get('prenom'))
                setUserNom(formData.get('nom'))
                setCurrentView('email-verification')
              }}
            >
              <div>
                <label htmlFor="email" className="block text-xs text-gray-500 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="prenom" className="block text-xs text-gray-500 mb-1">
                    Prénom
                  </label>
                  <input
                    type="text"
                    id="prenom"
                    name="prenom"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="nom" className="block text-xs text-gray-500 mb-1">
                    Nom
                  </label>
                  <input
                    type="text"
                    id="nom"
                    name="nom"
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="password" className="block text-xs text-gray-500 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full px-5 py-2.5 bg-color-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Commencer
              </button>
            </form>

            {/* Sign in link */}
            <p className="text-center text-color-2 mb-6">
              J'ai déjà un compte{' '}
              <span
                onClick={() => setCurrentView('signin')}
                className="font-medium cursor-pointer hover:underline"
              >
                Se connecter
              </span>
            </p>

            {/* Terms and privacy */}
            <p className="text-sm text-gray-600 text-center">
              En poursuivant, vous acceptez nos{' '}
              <a
                href="https://theralys-web.fr/cgv/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-color-2 font-medium hover:underline"
              >
                Conditions d'utilisation
              </a>{' '}
              et{' '}
              <a
                href="https://theralys-web.fr/cgv/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-color-2 font-medium hover:underline"
              >
                Politique de confidentialité
              </a>.
            </p>
          </div>
        )}

        {/* Vue Signin - Page de connexion */}
        {currentView === 'signin' && (
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-6">
              <img src={theralysLogo} alt="Theralys" className="h-7" />
            </div>

            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Se connecter
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Entrez vos informations pour vous connecter à votre compte Theralys
            </p>

            {/* Google sign-in button */}
            <button
              onClick={() => handleGoogleSignIn(true)}
              disabled={isGoogleLoading}
              className="w-full flex items-center justify-center gap-3 px-5 py-2.5 border-2 border-gray-300 rounded-full text-sm text-color-1 font-medium hover:bg-gray-50 transition-colors mb-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGoogleLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-color-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Connexion en cours...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M19.6 10.227c0-.709-.064-1.39-.182-2.045H10v3.868h5.382a4.6 4.6 0 01-1.996 3.018v2.51h3.232c1.891-1.742 2.982-4.305 2.982-7.35z" fill="#4285F4"/>
                    <path d="M10 20c2.7 0 4.964-.895 6.618-2.423l-3.232-2.509c-.895.6-2.04.955-3.386.955-2.605 0-4.81-1.76-5.595-4.123H1.064v2.59A9.996 9.996 0 0010 20z" fill="#34A853"/>
                    <path d="M4.405 11.9c-.2-.6-.314-1.24-.314-1.9 0-.66.114-1.3.314-1.9V5.51H1.064A9.996 9.996 0 000 10c0 1.614.386 3.14 1.064 4.49l3.34-2.59z" fill="#FBBC04"/>
                    <path d="M10 3.977c1.468 0 2.786.505 3.823 1.496l2.868-2.868C14.959.99 12.695 0 10 0 6.09 0 2.71 2.24 1.064 5.51l3.34 2.59C5.19 5.736 7.395 3.977 10 3.977z" fill="#EA4335"/>
                  </svg>
                  Se connecter avec Google
                </>
              )}
            </button>

            {/* Divider */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-500 text-sm">ou</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* Sign-in form */}
            <form className="space-y-4 mb-6">
              <div>
                <label htmlFor="signin-email" className="block text-xs text-gray-500 mb-1">
                  E-mail
                </label>
                <input
                  type="email"
                  id="signin-email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="signin-password" className="block text-xs text-gray-500 mb-1">
                  Mot de passe
                </label>
                <input
                  type="password"
                  id="signin-password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                />
              </div>

              {/* Remember me checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="remember"
                  className="w-4 h-4 text-color-2 border-gray-300 rounded focus:ring-2 focus:ring-color-2"
                />
                <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                  Enregistrer mes informations pour la prochaine connexion
                </label>
              </div>

              <button
                type="submit"
                className="w-full px-5 py-2.5 bg-color-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                Se connecter
              </button>
            </form>

            {/* Sign up link */}
            <p className="text-center text-gray-600">
              Vous n'avez pas de compte ?{' '}
              <span
                onClick={() => setCurrentView('signup')}
                className="text-color-2 font-medium cursor-pointer hover:underline"
              >
                Créer un compte
              </span>
            </p>
          </div>
        )}

        {/* Vue EmailVerification - Vérification d'email */}
        {currentView === 'email-verification' && (
          <div className="w-full max-w-md">
            {/* Logo */}
            <div className="mb-6">
              <img src={theralysLogo} alt="Theralys" className="h-7" />
            </div>

            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Vérifiez votre e-mail
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Nous avons envoyé un e-mail à{' '}
              <span className="font-semibold">{userEmail}</span>. Connectez vous à votre
              boîte mail et cliquez sur le lien pour vérifier votre e-mail.
            </p>

            {/* Email provider buttons */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <a
                href="https://mail.google.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0l-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z" fill="#EA4335"/>
                </svg>
                Gmail
              </a>

              <a
                href="https://outlook.live.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M7 9l5 3.5L17 9v11H7V9zm5-7l10 6v13H2V8l10-6z" fill="#0078D4"/>
                </svg>
                Outlook
              </a>

              <a
                href="https://mail.yahoo.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2l3.5 8h8.5l-7 5 2.5 8-7.5-5.5L5 23l2.5-8-7-5h8.5L12 2z" fill="#6001D2"/>
                </svg>
                Yahoo
              </a>

              <a
                href="https://mail.proton.me"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2L2 7v10c0 5.5 3.8 10.7 10 12 6.2-1.3 10-6.5 10-12V7l-10-5z" fill="#6D4AFF"/>
                </svg>
                Proton
              </a>
            </div>

            {/* Resend email link with success message */}
            <ResendEmailLink />

            {/* Bouton pour continuer après vérification */}
            <div className="mt-8">
              <button
                onClick={() => setCurrentView('objectives')}
                className="w-full px-5 py-2.5 bg-color-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity"
              >
                J'ai vérifié mon e-mail
              </button>
            </div>
          </div>
        )}

        {/* Vue Objectives - Choix des objectifs */}
        {currentView === 'objectives' && (
          <div className="w-full max-w-md">
            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Quels sont vos objectifs ?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Personnalisez votre expérience et dépassez vos objectifs en un temps record ! (plusieurs reponses possibles)
            </p>

            {/* Objectives selection */}
            <div className="flex flex-wrap gap-3 mb-4">
              {objectives.map((objective) => {
                const isSelected = selectedObjectives.includes(objective)
                return (
                  <button
                    key={objective}
                    onClick={() => toggleObjective(objective)}
                    className={`px-5 py-3 rounded-full border-2 text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-color-2 text-color-2 bg-white'
                        : 'border-gray-300 text-color-1 bg-white hover:border-gray-400'
                    }`}
                  >
                    {objective}
                  </button>
                )
              })}
            </div>

            {/* Custom objective input - shown when "Autres" is selected */}
            {selectedObjectives.includes('Autres') && (
              <div className="mb-4">
                <input
                  type="text"
                  value={customObjective}
                  onChange={(e) => setCustomObjective(e.target.value)}
                  placeholder="Partagez-nous ici votre objectif !"
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:border-color-2 transition-colors"
                />
              </div>
            )}

            <div className="mb-8"></div>

            {/* Continuer button */}
            <button
              disabled={selectedObjectives.length === 0}
              onClick={() => {
                console.log('Objectifs sélectionnés:', selectedObjectives)
                setCurrentView('site-step1')
              }}
              className={`w-full max-w-xs px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity ${
                selectedObjectives.length === 0
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-color-2 hover:opacity-90 cursor-pointer'
              }`}
            >
              Continuer
            </button>
          </div>
        )}

        {/* Vue Site Step 1 - Analyse de marché */}
        {currentView === 'site-step1' && (
          <div className="w-full max-w-md">
            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Créez votre site internet
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette première version ne sera pas publiée automatiquement. Vous pourrez la modifier librement et décider de sa mise en ligne.
            </p>

            {/* Step indicator */}
            <h3 className="text-lg font-bold text-color-1 mb-2">
              Étape 1 sur 3 : Analyse de marché
            </h3>
            <p className="text-sm text-gray-500 mb-6">
              Vos informations sont utilisées uniquement pour la création de votre site internet.
            </p>

            {/* Form fields */}
            <div className="space-y-4 mb-8">
              <div>
                <label htmlFor="profession" className="block text-sm font-medium text-color-1 mb-2">
                  Profession
                </label>
                <input
                  type="text"
                  id="profession"
                  value={profession}
                  onChange={(e) => setProfession(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                />
              </div>

              <div>
                <label htmlFor="ville" className="block text-sm font-medium text-color-1 mb-2">
                  Ville d'exercice
                </label>
                <input
                  type="text"
                  id="ville"
                  value={ville}
                  onChange={(e) => setVille(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                />
              </div>
            </div>

            {/* Continuer button */}
            <button
              disabled={!profession.trim() || !ville.trim()}
              onClick={() => {
                console.log('Profession:', profession, 'Ville:', ville)
                setCurrentView('site-step2')
              }}
              className={`w-full max-w-xs px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity ${
                !profession.trim() || !ville.trim()
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-color-2 hover:opacity-90 cursor-pointer'
              }`}
            >
              Continuer
            </button>
          </div>
        )}

        {/* Vue Site Step 2 - Préparation du site */}
        {currentView === 'site-step2' && (
          <div className="w-full max-w-md">
            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Créez votre site internet
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette première version ne sera pas publiée automatiquement. Vous pourrez la modifier librement et décider de sa mise en ligne.
            </p>

            {/* Step indicator */}
            <h3 className="text-base font-bold text-color-1 mb-4">
              Étape 2/3 : Préparation du site
            </h3>

            {/* Task list */}
            <div className="space-y-4 mb-8">
              {preparationTasks.map((task, index) => (
                <div
                  key={task}
                  className={`flex items-center gap-3 transition-opacity duration-300 ${
                    index < loadedTasks ? 'opacity-100' : 'opacity-40'
                  }`}
                >
                  {index < loadedTasks ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5"/>
                      </svg>
                    </div>
                  ) : (
                    <div className="w-6 h-6 flex-shrink-0">
                      <svg className="animate-spin w-6 h-6 text-color-2" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                      </svg>
                    </div>
                  )}
                  <span className="text-sm text-gray-700">{task}</span>
                </div>
              ))}
            </div>

            {/* Continuer button */}
            <button
              disabled={loadedTasks < preparationTasks.length}
              onClick={() => {
                console.log('Préparation terminée')
                setCurrentView('site-step3')
              }}
              className={`w-full max-w-xs px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity ${
                loadedTasks < preparationTasks.length
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-color-2 hover:opacity-90 cursor-pointer'
              }`}
            >
              Continuer
            </button>
          </div>
        )}

        {/* Vue Site Step 3 - Designs du site */}
        {currentView === 'site-step3' && (
          <div className="w-full max-w-md">
            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Créez votre site internet
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette première version ne sera pas publiée automatiquement. Vous pourrez la modifier librement et décider de sa mise en ligne.
            </p>

            {/* Step indicator */}
            <h3 className="text-base font-bold text-color-1 mb-4">
              Étape 3/3 : Designs du site
            </h3>

            {/* Couleurs + Style side by side */}
            <div className="flex gap-6 mb-4">
              {/* Color palettes */}
              <div>
                <span className="text-xs font-medium text-color-1 block mb-2">Couleurs</span>
                <div className="grid grid-cols-2 gap-1.5">
                  {colorPalettes.map((palette) => (
                    <button
                      key={palette.id}
                      onClick={() => setSelectedPalette(palette.id)}
                      className={`p-2 rounded-lg border-2 transition-all text-left ${
                        selectedPalette === palette.id
                          ? 'border-color-2 bg-orange-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex gap-1 mb-1">
                        {palette.colors.map((color, i) => (
                          <div
                            key={i}
                            className="w-4 h-4 rounded-full border border-black/10"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-medium text-color-1">{palette.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Typography + Radius */}
              <div>
                <span className="text-xs font-medium text-color-1 block mb-2">Style</span>
                <div className="grid grid-cols-2 gap-1.5 mb-3">
                  {typographyPairs.map((typo) => (
                    <button
                      key={typo.id}
                      onClick={() => setSelectedTypography(typo.id)}
                      className={`p-2 rounded-lg border-2 transition-all text-left ${
                        selectedTypography === typo.id
                          ? 'border-color-2 bg-orange-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <link rel="stylesheet" href={`https://fonts.googleapis.com/css2?family=${typo.googleFont}&display=swap`} />
                      <div
                        className="text-xl font-semibold mb-0.5"
                        style={{ fontFamily: `"${typo.display}", serif` }}
                      >
                        Aa
                      </div>
                      <span className="text-[10px] text-gray-500">{typo.label}</span>
                    </button>
                  ))}
                </div>

                {/* Border radius */}
                <div className="flex gap-1.5">
                  {radiusOptions.map((radius) => (
                    <button
                      key={radius.id}
                      onClick={() => setSelectedRadius(radius.id)}
                      className={`flex-1 p-1.5 flex flex-col items-center gap-1 border-2 transition-all rounded-lg ${
                        selectedRadius === radius.id
                          ? 'border-color-2 bg-orange-50'
                          : 'border-gray-200 bg-gray-50 hover:border-gray-300'
                      }`}
                    >
                      <div
                        className="w-7 h-4 bg-gray-300"
                        style={{ borderRadius: radius.value }}
                      />
                      <span className="text-[9px] text-gray-500">{radius.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Image upload */}
            <div className="mb-4">
              <span className="text-xs font-medium text-color-1 block mb-2">
                Importez une image professionelle de vous
              </span>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
              <div
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`border-2 border-dashed rounded-lg p-3 text-center cursor-pointer transition-colors ${
                  isDragging
                    ? 'border-color-2 bg-orange-50'
                    : 'border-gray-300 hover:border-color-2 hover:bg-gray-50'
                }`}
              >
                {uploadedImage ? (
                  <div className="space-y-1">
                    <img src={uploadedImage} alt="Photo" className="max-h-14 mx-auto rounded object-contain" />
                    <p className="text-[10px] text-gray-500">Cliquez pour remplacer</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    <svg className="w-6 h-6 mx-auto text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12"/>
                    </svg>
                    <p className="text-xs text-gray-500">Glissez une image ou cliquez</p>
                  </div>
                )}
              </div>
            </div>

            {/* Continuer button */}
            <button
              onClick={() => {
                console.log('Design terminé:', { selectedPalette, selectedTypography, selectedRadius, uploadedImage })
                setCurrentView('site-step4')
              }}
              className="w-full max-w-xs px-5 py-2.5 bg-color-2 rounded-full text-white text-sm font-medium hover:opacity-90 transition-opacity cursor-pointer"
            >
              Continuer
            </button>
          </div>
        )}

        {/* Vue Site Step 4 - Résumé */}
        {currentView === 'site-step4' && (
          <div className="w-full max-w-md">
            {/* Title and subtitle */}
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Créez votre site internet
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Cette première version ne sera pas publiée automatiquement. Vous pourrez la modifier librement et décider de sa mise en ligne.
            </p>

            {/* Summary heading */}
            <h3 className="text-base font-bold text-color-1 mb-4">
              Tout est prêt !
            </h3>

            {/* Checklist */}
            <div className="space-y-4 mb-8">
              {summaryTasks.map((task, index) => (
                <div
                  key={task.label}
                  className={`flex items-center gap-3 transition-opacity duration-300 ${
                    task.auto ? (index < loadedSummaryTasks ? 'opacity-100' : 'opacity-40') : 'opacity-100'
                  }`}
                >
                  {task.auto ? (
                    index < loadedSummaryTasks ? (
                      <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                          <path d="M20 6L9 17l-5-5"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="w-6 h-6 flex-shrink-0">
                        <svg className="animate-spin w-6 h-6 text-color-2" viewBox="0 0 24 24" fill="none">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3"/>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                        </svg>
                      </div>
                    )
                  ) : (
                    <div className="w-6 h-6 rounded-full border-2 border-gray-300 flex-shrink-0" />
                  )}
                  <span className={`text-sm ${task.auto ? 'text-gray-700' : 'text-gray-400'}`}>{task.label}</span>
                </div>
              ))}
            </div>

            {/* Continuer button */}
            <button
              disabled={loadedSummaryTasks < summaryTasks.filter(t => t.auto).length}
              onClick={() => {
                console.log('Résumé terminé')
                setCurrentView('site-step5')
              }}
              className={`w-full max-w-xs px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity ${
                loadedSummaryTasks < summaryTasks.filter(t => t.auto).length
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-color-2 hover:opacity-90 cursor-pointer'
              }`}
            >
              Continuer
            </button>
          </div>
        )}

        {/* Vue Site Step 5 - Pricing */}
        {currentView === 'site-step5' && (() => {
          const prices = {
            starter: { monthly: 59, quarterly: 53, annual: 41 },
            visibilite: { monthly: 79, quarterly: 71, annual: 55 },
          }
          const suffix = { monthly: '/mois', quarterly: '/mois/trimestre', annual: '/mois/an' }
          const currentStarter = prices.starter[billingPeriod]
          const currentVisibilite = prices.visibilite[billingPeriod]
          const currentSuffix = suffix[billingPeriod]

          return (
            <div className="w-full max-w-4xl max-h-full overflow-hidden">
              {/* Title */}
              <h2 className="text-xl font-bold text-color-1 mb-2">
                Choisissez votre forfait
              </h2>
              <p className="text-sm text-gray-500 mb-4">
                Profitez de 3 jours d'essai gratuit pour découvrir Theralys, période sans engagement.
              </p>

              {/* Billing toggle */}
              <div className="inline-flex items-center gap-1 mb-4 bg-gray-100 rounded-full p-1">
                {[
                  { id: 'monthly', label: 'Mensuel' },
                  { id: 'quarterly', label: 'Trimestriel', badge: '-10%' },
                  { id: 'annual', label: 'Annuel', badge: '-30%' },
                ].map((period) => (
                  <button
                    key={period.id}
                    onClick={() => setBillingPeriod(period.id)}
                    className={`px-4 py-2 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
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

              {/* Pricing cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl">
                {/* Starter */}
                <div className="border-2 border-gray-200 rounded-2xl p-6 flex flex-col">
                  <div className="min-h-[80px]">
                    <h3 className="text-lg font-bold text-color-1 mb-2">Starter</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Idéal pour un site vitrine design et optimisé pour transformer vos visiteurs en rendez-vous.
                    </p>
                  </div>

                  <p className="text-xs font-semibold text-color-1 mb-3 mt-3">Prix tout inclus</p>

                  <div className="space-y-3">
                    {[
                      '1 page',
                      'Aide au copywriting et au positionnement',
                      'Avis Google automatique',
                      'Hébergement + domaine + maintenance 5/7',
                    ].map((feature) => (
                      <div key={feature} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-color-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-extrabold text-color-1">{currentStarter}€</span>
                      <span className="text-gray-400 text-xs">{currentSuffix}</span>
                      <span className="text-gray-400 text-xs">engagement 1 an</span>
                    </div>

                    <button
                      onClick={() => { setSelectedPlan('starter'); setCurrentView('checkout') }}
                      className="w-full px-5 py-3 border-2 border-color-2 text-color-2 rounded-full font-semibold text-sm hover:bg-orange-50 transition-colors cursor-pointer"
                    >
                      Commencer l'essai gratuit
                    </button>
                  </div>
                </div>

                {/* Visibilité */}
                <div className="border-2 border-color-2 rounded-2xl p-6 flex flex-col relative bg-orange-50/40">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-color-2 text-white text-xs font-semibold px-4 py-1.5 rounded-full whitespace-nowrap flex items-center gap-1.5">
                    <span>🚀</span> Référencement 3,5x plus rapide
                  </div>

                  <div className="min-h-[80px] mt-1">
                    <h3 className="text-lg font-bold text-color-2 mb-2">Visibilité</h3>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      Idéal vous référencer durablement sur Google et capter les recherches les plus qualifiées de votre secteur.
                    </p>
                  </div>

                  <p className="text-xs font-bold text-color-1 mb-3 mt-3">Tout le forfait basique plus...</p>

                  <div className="space-y-3">
                    {[
                      { text: 'Pages ', highlight: 'illimitées' },
                      { text: 'SEO ', highlight: 'accéléré', rest: ' : 30 articles de blog/mois' },
                      { text: 'Analyse des ', highlight: 'mots clés + ranking', rest: ' en temps réel' },
                      { text: 'Statistiques avancées' },
                    ].map((feature, i) => (
                      <div key={i} className="flex items-start gap-2">
                        <div className="w-5 h-5 rounded-full bg-color-2 flex items-center justify-center flex-shrink-0 mt-0.5">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                            <path d="M20 6L9 17l-5-5"/>
                          </svg>
                        </div>
                        <span className="text-sm text-gray-700">
                          {feature.text}
                          {feature.highlight && <span className="text-color-2 font-semibold">{feature.highlight}</span>}
                          {feature.rest || ''}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-auto pt-6">
                    <div className="flex items-baseline gap-2 mb-4">
                      <span className="text-3xl font-extrabold text-color-1">{currentVisibilite}€</span>
                      <span className="text-gray-400 text-xs">{currentSuffix}</span>
                      <span className="text-gray-400 text-xs">engagement 1 an</span>
                    </div>

                    <button
                      onClick={() => { setSelectedPlan('visibilite'); setCurrentView('checkout') }}
                      className="w-full px-5 py-3 bg-color-2 text-white rounded-full font-semibold text-sm hover:opacity-90 transition-opacity cursor-pointer"
                    >
                      Commencer l'essai gratuit
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Vue Checkout - Mock Stripe */}
        {currentView === 'checkout' && (() => {
          const plans = {
            starter: { name: 'Starter', monthly: 59, quarterly: 53, annual: 41 },
            visibilite: { name: 'Visibilité', monthly: 79, quarterly: 71, annual: 55 },
          }
          const plan = plans[selectedPlan]
          const price = plan[billingPeriod]
          const periodLabel = { monthly: 'Mensuel', quarterly: 'Trimestriel', annual: 'Annuel' }[billingPeriod]
          const trialEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })

          return (
            <div className="w-full max-w-5xl mx-auto max-h-full overflow-hidden">
              <div className="grid grid-cols-1 lg:grid-cols-2 rounded-2xl overflow-hidden border border-gray-200 shadow-sm">
                {/* Left — Order summary */}
                <div className="bg-gray-50 p-10 flex flex-col">
                  {/* Brand */}
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-10 h-10 rounded-full bg-color-2 flex items-center justify-center">
                      <span className="text-white font-bold text-lg">T</span>
                    </div>
                    <span className="font-semibold text-color-1">Theralys</span>
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-color-2 px-2 py-0.5 rounded">Test</span>
                  </div>

                  <p className="text-sm text-gray-500 mb-1">S'abonner à</p>
                  <h2 className="text-2xl font-bold text-color-1 mb-8">Forfait {plan.name}</h2>

                  {/* Line items */}
                  <div className="space-y-5 flex-1">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2">
                            <path d="M12 2L8 8H2l4.5 5L4 22l8-5 8 5-2.5-9L22 8h-6L12 2z"/>
                          </svg>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-color-1">Forfait {plan.name} — {periodLabel}</p>
                          <p className="text-xs text-gray-400">Facturation {periodLabel.toLowerCase()}</p>
                        </div>
                      </div>
                      <span className="text-sm font-medium text-color-1">{price},00 €</span>
                    </div>

                    {billingPeriod !== 'monthly' && (
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="2">
                              <path d="M20 6L9 17l-5-5"/>
                            </svg>
                          </div>
                          <div>
                            <p className="text-sm font-medium text-green-600">Réduction {billingPeriod === 'quarterly' ? '-10%' : '-30%'}</p>
                            <p className="text-xs text-gray-400">Appliquée automatiquement</p>
                          </div>
                        </div>
                        <span className="text-sm font-medium text-green-600">
                          -{billingPeriod === 'quarterly' ? (Math.round(79 * 0.1)) : (Math.round(79 * 0.3))},00 €
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Totals */}
                  <div className="border-t border-gray-200 pt-5 mt-6 space-y-3">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Sous-total</span>
                      <span className="text-color-1 font-medium">{price},00 €</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-gray-500">Essai gratuit</span>
                        <p className="text-xs text-gray-400">3 jours, jusqu'au {trialEnd}</p>
                      </div>
                      <span className="text-green-600 font-medium">-{price},00 €</span>
                    </div>
                    <div className="border-t border-gray-200 pt-3 flex justify-between">
                      <span className="font-semibold text-color-1">Total dû aujourd'hui</span>
                      <span className="font-bold text-xl text-color-1">0,00 €</span>
                    </div>
                    <p className="text-xs text-gray-400">Puis {price},00 €/mois à partir du {trialEnd}</p>
                  </div>

                  {/* Powered by */}
                  <div className="mt-8 flex items-center gap-2 text-xs text-gray-400">
                    <span>Powered by</span>
                    <span className="font-bold text-gray-500 tracking-tight text-sm">stripe</span>
                  </div>
                </div>

                {/* Right — Payment form */}
                <div className="bg-white p-10 flex flex-col">
                  {/* Apple Pay */}
                  <button onClick={() => setCurrentView('survey')} className="w-full bg-black text-white rounded-lg py-3.5 font-medium text-sm flex items-center justify-center gap-2 mb-5 cursor-pointer hover:bg-gray-900 transition-colors">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="white">
                      <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
                    </svg>
                    Pay
                  </button>

                  {/* Divider */}
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-gray-200"></div>
                    <span className="text-xs text-gray-400">Ou payer par carte</span>
                    <div className="flex-1 h-px bg-gray-200"></div>
                  </div>

                  {/* Email */}
                  <div className="mb-5">
                    <label className="text-sm text-gray-600 mb-1.5 block">E-mail</label>
                    <input
                      type="email"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                      placeholder="votre@email.com"
                    />
                  </div>

                  {/* Card */}
                  <div className="mb-5">
                    <label className="text-sm text-gray-600 mb-1.5 block">Informations de carte</label>
                    <div className="border border-gray-300 rounded-lg overflow-hidden">
                      <div className="flex items-center px-4 py-3 border-b border-gray-200">
                        <input
                          type="text"
                          className="flex-1 text-sm focus:outline-none"
                          placeholder="1234 1234 1234 1234"
                        />
                        <div className="flex items-center gap-1.5">
                          <div className="w-8 h-5 rounded bg-[#1A1F71] flex items-center justify-center">
                            <span className="text-white text-[8px] font-bold italic">VISA</span>
                          </div>
                          <div className="w-8 h-5 rounded bg-[#EB001B]/10 flex items-center justify-center">
                            <div className="flex -space-x-1">
                              <div className="w-3 h-3 rounded-full bg-[#EB001B]"></div>
                              <div className="w-3 h-3 rounded-full bg-[#F79E1B]"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex">
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 text-sm border-r border-gray-200 focus:outline-none"
                          placeholder="MM / AA"
                        />
                        <input
                          type="text"
                          className="flex-1 px-4 py-3 text-sm focus:outline-none"
                          placeholder="CVC"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Name on card */}
                  <div className="mb-5">
                    <label className="text-sm text-gray-600 mb-1.5 block">Nom sur la carte</label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent"
                      placeholder="Nom complet"
                    />
                  </div>

                  {/* Country */}
                  <div className="mb-8">
                    <label className="text-sm text-gray-600 mb-1.5 block">Pays</label>
                    <select className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-color-2 focus:border-transparent bg-white text-gray-700">
                      <option>France</option>
                      <option>Belgique</option>
                      <option>Suisse</option>
                      <option>Canada</option>
                    </select>
                  </div>

                  {/* Pay button */}
                  <button onClick={() => setCurrentView('survey')} className="w-full bg-color-2 text-white rounded-lg py-4 font-semibold text-[15px] hover:opacity-90 transition-opacity cursor-pointer mt-auto">
                    Démarrer l'essai gratuit
                  </button>

                  <p className="text-[11px] text-gray-400 mt-4 text-center leading-relaxed">
                    En confirmant, vous autorisez Theralys à débiter votre carte de {price},00 €/mois après la période d'essai. Vous pouvez annuler à tout moment.
                  </p>
                </div>
              </div>
            </div>
          )
        })()}

        {/* Vue Survey — Comment nous avez-vous connus ? */}
        {currentView === 'survey' && (
          <div className="w-full max-w-md">
            <h2 className="text-xl font-bold text-color-1 mb-2">
              Comment nous avez-vous connus ?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              Personnalisez votre expérience et dépassez vos objectifs en un temps record !
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              {['Bouche-à-oreille', 'Recherche Google', 'Publicités', 'Réseaux sociaux', 'Grâce à BoostTonCab', 'Autres'].map((option) => {
                const isSelected = selectedReferral === option
                return (
                  <button
                    key={option}
                    onClick={() => setSelectedReferral(prev => prev === option ? '' : option)}
                    className={`px-5 py-3 rounded-full border-2 text-sm font-medium transition-colors cursor-pointer ${
                      isSelected
                        ? 'border-color-2 text-color-2 bg-white'
                        : 'border-gray-300 text-color-1 bg-white hover:border-gray-400'
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>

            {selectedReferral === 'Autres' && (
              <div className="mb-4">
                <input
                  type="text"
                  value={customReferral}
                  onChange={(e) => setCustomReferral(e.target.value)}
                  placeholder="Précisez comment vous nous avez connus..."
                  className="w-full px-5 py-3 border-2 border-gray-300 rounded-full text-sm focus:outline-none focus:border-color-2 transition-colors"
                />
              </div>
            )}

            <div className="mb-8"></div>

            <button
              disabled={!selectedReferral}
              onClick={() => onComplete && onComplete({ prenom: userPrenom, profession, ville })}
              className={`w-full max-w-xs px-5 py-2.5 rounded-full text-white text-sm font-medium transition-opacity ${
                !selectedReferral
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-color-2 hover:opacity-90 cursor-pointer'
              }`}
            >
              Terminer
            </button>
          </div>
        )}

        </div>
      </div>

      {/* Right side - Illustration */}
      {currentView !== 'site-step5' && currentView !== 'checkout' && <div className="hidden lg:flex items-center justify-center bg-gradient-to-br from-primary-50 to-primary-100 bg-grid-pattern px-8 lg:px-12 py-6 overflow-hidden">
        {currentView === 'site-step4' ? (
          <div className="w-full max-w-2xl max-h-full flex flex-col items-center overflow-hidden">
            {/* Estimation chart — coded SVG */}
            <div className="w-full rounded-2xl shadow-lg bg-white p-8">
              {/* Header */}
              <div className="flex items-center gap-3 mb-8">
                <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center flex-shrink-0">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L8 8H2l4.5 5L4 22l8-5 8 5-2.5-9L22 8h-6L12 2z" fill="#FC6D41" opacity="0.7"/>
                  </svg>
                </div>
                <p className="text-[14px] text-gray-700 leading-snug">
                  Estimation de performance <span className="font-bold text-color-1">Theralys vs Site Web classique</span> pour "<span className="font-semibold">{profession || 'Profession'}</span>" à "<span className="font-semibold">{ville || 'Ville'}</span>"
                </p>
              </div>

              {/* Chart */}
              <svg viewBox="0 0 560 300" className="w-full" style={{ fontFamily: 'Inter, sans-serif' }}>
                {/* Y-axis labels */}
                <text x="30" y="28" textAnchor="end" fill="#9CA3AF" fontSize="12">600</text>
                <text x="30" y="73" textAnchor="end" fill="#9CA3AF" fontSize="12">500</text>
                <text x="30" y="118" textAnchor="end" fill="#9CA3AF" fontSize="12">400</text>
                <text x="30" y="163" textAnchor="end" fill="#9CA3AF" fontSize="12">300</text>
                <text x="30" y="208" textAnchor="end" fill="#9CA3AF" fontSize="12">200</text>
                <text x="30" y="253" textAnchor="end" fill="#9CA3AF" fontSize="12">100</text>
                <text x="30" y="290" textAnchor="end" fill="#9CA3AF" fontSize="12">0</text>

                {/* Grid lines */}
                {[25, 70, 115, 160, 205, 250, 287].map((y) => (
                  <line key={y} x1="40" y1={y} x2="540" y2={y} stroke="#F3F4F6" strokeWidth="1"/>
                ))}

                {/* X-axis labels */}
                <text x="60" y="300" fill="#9CA3AF" fontSize="11" textAnchor="middle">mois 1</text>
                <text x="155" y="300" fill="#9CA3AF" fontSize="11" textAnchor="middle">mois 3</text>
                <text x="250" y="300" fill="#9CA3AF" fontSize="11" textAnchor="middle">mois 6</text>
                <text x="345" y="300" fill="#9CA3AF" fontSize="11" textAnchor="middle">mois 12</text>
                <text x="440" y="300" fill="#9CA3AF" fontSize="11" textAnchor="middle">mois 24</text>
                <text x="530" y="300" fill="#9CA3AF" fontSize="11" textAnchor="middle">mois 36</text>

                {/* Classic website line (gray) */}
                <path
                  d="M60,275 C100,268 130,260 155,255 C190,248 220,245 250,242 C290,238 320,237 345,234 C390,228 420,220 440,210 C480,198 510,190 530,182"
                  fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />

                {/* Theralys line (orange) */}
                <path
                  d="M60,275 C85,258 110,235 155,195 C190,165 220,148 250,130 C290,112 320,100 345,90 C390,75 420,62 440,55 C480,42 510,32 530,25"
                  fill="none" stroke="#FC6D41" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
                />

                {/* Theralys data point at mois 3 */}
                <circle cx="155" cy="195" r="5" fill="#FC6D41"/>

                {/* Classic data point at mois 3 */}
                <circle cx="155" cy="255" r="5" fill="#6B7280"/>

                {/* Theralys tooltip */}
                <g transform="translate(168, 175)">
                  <rect x="0" y="0" width="108" height="36" rx="8" fill="white" stroke="#F3F4F6" strokeWidth="1"/>
                  <circle cx="14" cy="12" r="6" fill="#FC6D41" opacity="0.2"/>
                  <circle cx="14" cy="12" r="3" fill="#FC6D41"/>
                  <text x="26" y="14" fill="#374151" fontSize="9" fontWeight="600">224 visites/mois</text>
                  <text x="26" y="28" fill="#FC6D41" fontSize="8.5" fontWeight="500">11 rendez-vous</text>
                </g>

                {/* Classic tooltip */}
                <g transform="translate(168, 240)">
                  <rect x="0" y="0" width="100" height="36" rx="8" fill="white" stroke="#F3F4F6" strokeWidth="1"/>
                  <circle cx="14" cy="12" r="6" fill="#9CA3AF" opacity="0.2"/>
                  <circle cx="14" cy="12" r="3" fill="#9CA3AF"/>
                  <text x="26" y="14" fill="#374151" fontSize="9" fontWeight="600">64 visites/mois</text>
                  <text x="26" y="28" fill="#9CA3AF" fontSize="8.5" fontWeight="500">0 rendez-vous</text>
                </g>
              </svg>
            </div>
          </div>
        ) : currentView === 'site-step3' ? (
          <div className="flex flex-col items-center space-y-3 max-h-full overflow-hidden">
            <h3 className="text-sm font-semibold text-color-1">Aperçu mobile</h3>
            {/* Mobile preview with iPhone frame — scaled down via transform */}
            <div style={{ width: 280, height: 574 }}>
              <div className="relative origin-top-left" style={{ width: 400, height: 820, transform: 'scale(0.7)' }}>
              {/* iPhone frame overlay */}
              <img
                src={iphoneFrame}
                alt=""
                className="absolute inset-0 w-full h-full z-10 pointer-events-none"
              />
              {/* Screen content inside the frame */}
              <div
                className="absolute overflow-hidden flex flex-col"
                style={{
                  top: 4,
                  left: 5,
                  right: 5,
                  bottom: 4,
                  borderRadius: 60,
                  fontFamily: `"${previewTypo.display}", serif`,
                  backgroundColor: `hsl(${previewPalette.heroBg})`,
                }}
              >
                {/* Off-canvas menu */}
                <div
                  className="absolute inset-0 z-[5] transition-opacity duration-300 ease-in-out"
                  style={{
                    opacity: menuOpen ? 1 : 0,
                    pointerEvents: menuOpen ? 'auto' : 'none',
                  }}
                >
                  {/* Backdrop */}
                  <div
                    className="absolute inset-0 bg-black/30"
                    onClick={() => setMenuOpen(false)}
                  />
                  {/* Menu panel */}
                  <div
                    className="absolute top-0 right-0 h-full w-3/4 pl-7 pr-8 pt-16 pb-12 flex flex-col shadow-xl transition-transform duration-300 ease-in-out"
                    style={{
                      backgroundColor: `hsl(${previewPalette.background})`,
                      transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
                    }}
                  >
                    {/* Close button */}
                    <button
                      onClick={() => setMenuOpen(false)}
                      className="self-end mb-10 cursor-pointer p-1"
                    >
                      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={`hsl(${previewPalette.text})`} strokeWidth="2.5">
                        <path d="M18 6L6 18M6 6l12 12"/>
                      </svg>
                    </button>
                    {/* Menu links */}
                    <nav className="flex flex-col gap-6">
                      {['Accueil', 'À propos', 'Services', 'Témoignages', 'Contact'].map((item) => (
                        <span
                          key={item}
                          className="text-[17px] font-medium"
                          style={{ color: `hsl(${previewPalette.text})` }}
                        >
                          {item}
                        </span>
                      ))}
                    </nav>
                    {/* CTA in menu */}
                    <button
                      className="mt-auto px-6 py-3.5 text-white text-[14px] font-semibold"
                      style={{
                        backgroundColor: `hsl(${previewPalette.accent})`,
                        borderRadius: previewRadius.value,
                      }}
                    >
                      Prendre RDV
                    </button>
                  </div>
                </div>

                {/* Nav — top padding clears Dynamic Island */}
                <div className="px-7 pt-14 pb-4 flex items-center justify-between" style={{ backgroundColor: `hsl(${previewPalette.heroBg})` }}>
                  <h2 className="text-[1.3rem] font-bold leading-snug" style={{ color: `hsl(${previewPalette.text})` }}>
                    {userPrenom || 'Votre'} {userNom || 'Nom'}
                  </h2>
                  {/* Burger menu */}
                  <div
                    className="flex flex-col items-end gap-[5px] cursor-pointer p-1"
                    onClick={() => setMenuOpen(true)}
                  >
                    <div className="w-6 h-[2.5px] rounded-full transition-all duration-300" style={{ backgroundColor: `hsl(${previewPalette.text})` }} />
                    <div className="w-4 h-[2.5px] rounded-full transition-all duration-300" style={{ backgroundColor: `hsl(${previewPalette.accent})` }} />
                  </div>
                </div>

                {/* Hero */}
                <div className="px-7 pt-4 pb-8" style={{ backgroundColor: `hsl(${previewPalette.heroBg})` }}>
                  <span
                    className="inline-block px-4 py-1.5 text-[13px] font-medium mb-6"
                    style={{
                      color: `hsl(${previewPalette.accent})`,
                      border: `1px solid hsl(${previewPalette.accent} / 0.25)`,
                      borderRadius: previewRadius.value,
                    }}
                  >
                    {profession || 'Thérapeute'} à {ville || 'Paris'}
                  </span>

                  <h1 className="text-[1.75rem] font-bold leading-[1.2] mb-4" style={{ color: `hsl(${previewPalette.text})` }}>
                    Soulagez vos<br />douleurs chroniques.
                  </h1>

                  <p className="text-[14px] leading-relaxed mb-7" style={{ color: `hsl(${previewPalette.textMuted})` }}>
                    Reprenez pleinement le contrôle de vos douleurs pour retrouver une liberté de mouvement optimale.
                  </p>

                  <button
                    className="px-6 py-3 text-white text-[14px] font-semibold tracking-wide"
                    style={{
                      backgroundColor: `hsl(${previewPalette.accent})`,
                      borderRadius: previewRadius.value,
                    }}
                  >
                    Prendre Rendez-Vous En Ligne
                  </button>
                </div>

                {/* Image — fills remaining space */}
                <div className="relative flex-1 min-h-0">
                  {uploadedImage ? (
                    <img src={uploadedImage} alt="Photo" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full" style={{ backgroundColor: `hsl(${previewPalette.textMuted} / 0.15)` }} />
                  )}
                  <div className="absolute top-4 left-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl backdrop-blur-sm" style={{ backgroundColor: `hsl(${previewPalette.accentDark} / 0.8)` }}>
                    <span className="text-yellow-300 text-[16px]">&#9733;</span>
                    <div>
                      <p className="text-white text-[15px] font-bold leading-none">5/5</p>
                      <p className="text-white/70 text-[11px] leading-none mt-1">Avis patients</p>
                    </div>
                  </div>
                  <div className="absolute bottom-4 right-4 flex items-center gap-2 px-3.5 py-2.5 rounded-xl backdrop-blur-sm" style={{ backgroundColor: `hsl(${previewPalette.accentDark} / 0.8)` }}>
                    <span className="text-[16px]">&#128522;</span>
                    <div>
                      <p className="text-white text-[15px] font-bold leading-none">+100</p>
                      <p className="text-white/70 text-[11px] leading-none mt-1">Patients accompagnés</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            </div>
          </div>
        ) : currentView === 'site-step2' ? (
          <div className="w-full max-w-lg max-h-full flex flex-col items-start space-y-6 overflow-hidden">
            {/* Stat text */}
            <p className="text-lg leading-relaxed">
              <span className="font-bold text-color-2">La technologie Theralys</span>{' '}
              <span className="text-color-1">sont référencés sur la première page de Google grâce à sa technologie de référencement automatique.</span>
            </p>

            {/* Blurred website preview */}
            <div className="w-full relative rounded-2xl overflow-hidden">
              <img src={metierVille} alt="Aperçu du site" className="w-full blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-xl px-8 py-6 shadow-lg text-center">
                  <p className="text-color-1 font-medium">L'aperçu sera disponible</p>
                  <p className="text-color-1 font-medium">à la prochaine étape</p>
                </div>
              </div>
            </div>
          </div>
        ) : currentView === 'site-step1' ? (
          <div className="w-full max-w-lg max-h-full flex flex-col items-start space-y-6 overflow-hidden">
            {/* Stat text */}
            <p className="text-lg leading-relaxed">
              <span className="font-bold text-color-2">Sur + de 400 praticiens, 95% des sites theralys</span>{' '}
              <span className="text-color-1">sont référencés sur la première page de Google grâce à sa technologie de référencement automatique.</span>
            </p>

            {/* Blurred website preview placeholder */}
            <div className="w-full relative rounded-2xl overflow-hidden">
              <img src={metierVille} alt="Aperçu du site" className="w-full blur-sm" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white rounded-xl px-8 py-6 shadow-lg text-center">
                  <p className="text-color-1 font-medium">L'aperçu sera disponible</p>
                  <p className="text-color-1 font-medium">à l'étape 3</p>
                </div>
              </div>
            </div>
          </div>
        ) : currentView === 'objectives' ? (
          <div className="w-full max-w-lg max-h-full flex flex-col items-center text-center space-y-8 overflow-hidden">
            {/* Vision text */}
            <p className="text-xl leading-relaxed">
              <span className="font-bold text-color-2">La vision de Theralys</span>{' '}
              <span className="text-color-1">est de concevoir des sites simples, performants et fidèles à l'identité de chaque thérapeute afin d'agir comme un catalyseur de croissance.</span>
            </p>

            {/* Mountain climber illustration */}
            <img src={mountainClimber} alt="Illustration d'une personne au sommet d'une montagne" className="w-full max-w-sm max-h-[50vh] object-contain" />
          </div>
        ) : currentView === 'survey' ? (
          <div className="w-full max-w-lg max-h-full flex flex-col items-start space-y-6 overflow-hidden">
            <p className="text-lg leading-relaxed">
              <span className="font-bold text-color-2">Theralys vous remercie pour votre confiance.</span>{' '}
              <span className="text-gray-700">L'équipe reste disponible à travers le chat intégré à la plateforme.</span>
            </p>
            <img src={surveyImage} alt="Illustration survey" className="w-full max-w-md max-h-[50vh] object-contain" />
          </div>
        ) : (
          <div className="w-full max-w-lg max-h-full flex flex-col items-center space-y-6 overflow-hidden">
            <div className="space-y-3">
              <p className="text-base text-gray-700 leading-relaxed">
                <span className="font-bold text-color-2">85% des français utilisent Google</span> comme premier réflexe pour consulter un praticien des medecines douces.
              </p>
              <p className="text-lg leading-relaxed">
                <span className="font-bold text-color-2">78 % des clics vont aux 5 premiers résultats Google.</span>
                <br />
                <span className="text-gray-700">Avec Theralys, créez votre site et générez une visibilité durable grâce à sa technologie de référencement.</span>
              </p>
            </div>
            <img src={onboardingImage} alt="Parcours de référencement Theralys" className="w-full max-w-md max-h-[50vh] object-contain rounded-2xl" />
          </div>
        )}
      </div>}
    </div>
  )
}

export default OnboardingDashboard
