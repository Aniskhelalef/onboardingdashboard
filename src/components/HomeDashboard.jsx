import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { SetupProvider } from '@/components/site-editor/setup/SetupContext'
import SetupShell from '@/components/site-editor/setup/SetupShell'
const theralysLogo = '/images/theralys-logo.svg'
const articleImg1 = '/images/pexels-yankrukov-5794010-min.webp'
const articleImg2 = '/images/pexels-yankrukov-5794024-min.webp'
const articleImg3 = '/images/pexels-yankrukov-5793897-min.webp'
const articleImg4 = '/images/pexels-yankrukov-5793920-min.webp'
const pexGrab1 = '/images/pexels-karolina-grabowska-4506071-min.webp'
const pexGrab2 = '/images/pexels-karolina-grabowska-4506076-min.webp'
const pexGrab3 = '/images/pexels-karolina-grabowska-4506106-min.webp'
const pexGrab4 = '/images/pexels-karolina-grabowska-4506109-min.webp'
const pexGrab5 = '/images/pexels-karolina-grabowska-4506113-min.webp'
const pexGrab6 = '/images/pexels-karolina-grabowska-4506161-min.webp'
const pexGrab7 = '/images/pexels-karolina-grabowska-4506162-min.webp'
const pexGrab8 = '/images/pexels-karolina-grabowska-4506169-min.webp'
const pexRyu1 = '/images/pexels-ryutaro-5473179-1-min.webp'
const pexRyu2 = '/images/pexels-ryutaro-5473182.webp'
const pexRyu3 = '/images/pexels-ryutaro-5473186_11zon.webp'
const pexRyu4 = '/images/pexels-ryutaro-5473223.webp'
const pexYank5 = '/images/pexels-yankrukov-5793909-min.webp'
const pexYank6 = '/images/pexels-yankrukov-5794043-min.webp'
const pexYank7 = '/images/pexels-yankrukov-7155367-1.webp'
const pexYank8 = '/images/pexels-yankrukov-7155532.webp'
const pexYank9 = '/images/pexels-yankrukov-7155534-1.webp'
const pexPolina = '/images/pexels-polina-tankilevitch-3735747-2048x1365.jpg'

const HomeDashboard = ({ initialTab, initialSettingsTab }) => {
  const router = useRouter()
  const [userData, setUserData] = useState({ prenom: '', profession: '', ville: '' })
  const activeTab = initialTab || 'accueil'
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
  const [completedActions, setCompletedActions] = useState([])
  const [articleIdx, setArticleIdx] = useState(0)
  const [newsIdx, setNewsIdx] = useState(0)
  const settingsTab = initialSettingsTab || 'compte'
  const [showProfileMenu, setShowProfileMenu] = useState(false)
  const profileMenuRef = useRef(null)
  const profileBtnRef = useRef(null)
  const [billingPeriod, setBillingPeriod] = useState('annual')
  // SEO / Référencement tab state
  const [autoPublish, setAutoPublish] = useState(true)
  const [customTitles, setCustomTitles] = useState({}) // key: 'YYYY-M-D' → custom title

  // Specialty distribution state
  const allSpecialties = [
    { id: '1', icon: '\u{1F9B4}', title: 'Douleurs dorsales' },
    { id: '2', icon: '\u{1F915}', title: 'Maux de t\u00eate' },
    { id: '3', icon: '\u{1F3C3}', title: 'Blessures sportives' },
    { id: '4', icon: '\u{1F476}', title: 'P\u00e9diatrie' },
    { id: '5', icon: '\u{1F930}', title: 'Grossesse' },
    { id: '6', icon: '\u{1F634}', title: 'Troubles du sommeil' },
  ]
  const [checkedSpecs, setCheckedSpecs] = useState(['1', '2', '3', '4', '5', '6'])
  const [rebalanceMode, setRebalanceMode] = useState(false)
  const [selectedDay, setSelectedDay] = useState(null) // set by useEffect after batch computed
  const [seoSearchQuery, setSeoSearchQuery] = useState('')
  const [stackedStatuses, setStackedStatuses] = useState(new Set()) // 'published' | 'programmed' | 'preProgrammed'
  const [viewOffset, setViewOffset] = useState(null) // null = auto (today first)
  const toggleStack = (key) => {
    setViewOffset(null)
    setStackedStatuses(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key); else next.add(key)
      return next
    })
  }
  const [searchExpanded, setSearchExpanded] = useState(false)
  const [showPexels, setShowPexels] = useState(false)
  // Article modal states removed — Voir/Modifier/Créer navigate to SiteEditor
  const [showParrainageVideo, setShowParrainageVideo] = useState(false)
  const [showNewsModal, setShowNewsModal] = useState(null) // index of news item or null
  const [showRedactorSettings, setShowRedactorSettings] = useState(false)
  const [seoSetupMode, setSeoSetupMode] = useState(false) // true when opened from SEO action
  const [settingsSection, setSettingsSection] = useState('redaction') // 'redaction' | 'repartition'
  const [redTone, setRedTone] = useState('professionnel')
  const [redStyle, setRedStyle] = useState('informatif')
  const [redPronoun, setRedPronoun] = useState('nous')
  const [redPrompt, setRedPrompt] = useState('')
  const [showArticleCard, setShowArticleCard] = useState(false)
  const [editingTitle, setEditingTitle] = useState('')
  const [editingMeta, setEditingMeta] = useState('')
  const [cardDirty, setCardDirty] = useState(false)
  const [showArticleEditor, setShowArticleEditor] = useState(false)
  const [articleContent, setArticleContent] = useState('')
  const [editorImage, setEditorImage] = useState('')
  const editorRef = useRef(null)
  const [regenStep, setRegenStep] = useState(null) // null | 'theme' | 'title'
  const [regenTheme, setRegenTheme] = useState(null)
  const [regenTitle, setRegenTitle] = useState(null)
  const [regenManual, setRegenManual] = useState('')
  const [regenCount, setRegenCount] = useState(0) // max 3/month
  const [settingsInitial, setSettingsInitial] = useState(null) // snapshot when settings modal opens
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [deletedArticles, setDeletedArticles] = useState(new Set())
  const [showSetupModal, setShowSetupModal] = useState(false)
  const [showChangeSubject, setShowChangeSubject] = useState(false)
  const [changeSubjectTitle, setChangeSubjectTitle] = useState('')
  const [changeSubjectInstruction, setChangeSubjectInstruction] = useState('')
  const [pendingDeleteDay, setPendingDeleteDay] = useState(null)




  // Load userData + completedActions from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('userData')
      if (saved) setUserData(JSON.parse(saved))
    } catch {}
    try {
      const saved = localStorage.getItem('completedActions')
      if (saved) setCompletedActions(JSON.parse(saved))
    } catch {}
    const handler = () => {
      try { setCompletedActions(JSON.parse(localStorage.getItem('completedActions') || '[]')) } catch {}
    }
    window.addEventListener('actionsUpdated', handler)
    return () => window.removeEventListener('actionsUpdated', handler)
  }, [])

  const completeAction = (id) => {
    const existing = JSON.parse(localStorage.getItem('completedActions') || '[]')
    if (existing.includes(id)) return
    existing.push(id)
    localStorage.setItem('completedActions', JSON.stringify(existing))
    setCompletedActions([...existing])
    window.dispatchEvent(new Event('actionsUpdated'))
  }

  const [pexelsSearch, setPexelsSearch] = useState('')
  const [customArticleImages, setCustomArticleImages] = useState({}) // dayIndex → image
  const [customArticleTitles, setCustomArticleTitles] = useState({}) // dayIndex → title
  const [customArticleCategories, setCustomArticleCategories] = useState({}) // dayIndex → specId
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

  const articleImgs = [
    articleImg1, pexGrab1, pexRyu1, articleImg2, pexGrab2, pexYank5, pexRyu2,
    articleImg3, pexGrab3, pexYank6, pexRyu3, pexGrab4, articleImg4, pexYank7,
    pexGrab5, pexRyu4, pexYank8, pexGrab6, pexPolina, pexGrab7, pexYank9, pexGrab8,
  ]

  const articleTitlesMap = {
    'Douleurs dorsales': ['5 exercices pour soulager une lombalgie chronique', 'Hernie discale\u00a0: comprendre et pr\u00e9venir', 'Cervicalgie\u00a0: les causes les plus fr\u00e9quentes'],
    'Maux de t\u00eate': ['C\u00e9phal\u00e9es de tension\u00a0: 7 solutions naturelles', 'Migraine et posture\u00a0: le lien m\u00e9connu', 'Maux de t\u00eate au bureau\u00a0: les gestes qui soulagent'],
    'Blessures sportives': ['Entorse de cheville\u00a0: protocole de r\u00e9\u00e9ducation', 'Tendinite du coureur\u00a0: causes et traitements', 'Pr\u00e9venir les blessures musculaires au football'],
    'P\u00e9diatrie': ['Torticolis du nourrisson\u00a0: quand consulter\u00a0?', 'D\u00e9veloppement moteur du b\u00e9b\u00e9\u00a0: les \u00e9tapes cl\u00e9s', 'Kin\u00e9sith\u00e9rapie respiratoire chez l\u2019enfant'],
    'Grossesse': ['Douleurs lombaires pendant la grossesse\u00a0: solutions', 'Pr\u00e9parer son p\u00e9rin\u00e9e \u00e0 l\u2019accouchement', 'Exercices doux pour le troisi\u00e8me trimestre'],
    'Troubles du sommeil': ['Insomnie et tensions musculaires\u00a0: le cercle vicieux', 'Am\u00e9liorer son sommeil par la relaxation corporelle', '\u00c9tirements du soir\u00a0: routine de 10 minutes'],
  }

  // Rich structured article content per specialty — kept for future use
  const articleContentMap = {
    'Douleurs dorsales': {
      intro: 'Les douleurs dorsales repr\u00e9sentent le premier motif de consultation en kin\u00e9sith\u00e9rapie. Qu\u2019il s\u2019agisse d\u2019une lombalgie aigu\u00eb, d\u2019une cervicalgie chronique ou d\u2019une dorsalgie li\u00e9e \u00e0 la posture, une prise en charge adapt\u00e9e permet de soulager durablement la douleur et de pr\u00e9venir les r\u00e9cidives.',
      sections: [
        { heading: 'Comprendre l\u2019origine de la douleur', body: 'La colonne vert\u00e9brale est une structure complexe compos\u00e9e de 33 vert\u00e8bres, de disques intervert\u00e9braux, de ligaments et de muscles. Une mauvaise posture prolong\u00e9e, un faux mouvement ou un stress chronique peuvent d\u00e9s\u00e9quilibrer cette m\u00e9canique fine et provoquer des douleurs.', bullets: ['Contractures musculaires paravert\u00e9brales', 'Compression discale ou hernie', 'Inflammation des facettes articulaires', 'D\u00e9s\u00e9quilibre postural global'] },
        { heading: 'Les techniques de kin\u00e9sith\u00e9rapie', body: 'Le traitement repose sur une combinaison de techniques manuelles et d\u2019exercices th\u00e9rapeutiques. L\u2019objectif est double\u00a0: soulager la douleur \u00e0 court terme et renforcer les structures musculaires pour pr\u00e9venir les r\u00e9cidives.', bullets: ['Mobilisations vert\u00e9brales douces', 'Massage des tissus profonds (trigger points)', 'Exercices de gainage et renforcement du core', '\u00c9tirements cibl\u00e9s des cha\u00eenes musculaires'] },
        { heading: 'Pr\u00e9vention au quotidien', body: 'Au-del\u00e0 des s\u00e9ances, adopter les bons r\u00e9flexes posturaux au quotidien est essentiel. R\u00e9gler la hauteur de son \u00e9cran, faire des pauses r\u00e9guli\u00e8res et pratiquer 10 minutes d\u2019\u00e9tirements chaque soir r\u00e9duit consid\u00e9rablement le risque de rechute.' },
      ],
      conclusion: 'N\u2019attendez pas que la douleur devienne chronique. Un bilan postural complet permet d\u2019identifier les d\u00e9s\u00e9quilibres et de mettre en place un programme de correction personnalis\u00e9. Prenez rendez-vous d\u00e8s les premiers signes.',
      metaDesc: 'D\u00e9couvrez les causes des douleurs dorsales et les solutions en kin\u00e9sith\u00e9rapie\u00a0: techniques manuelles, exercices de renforcement et conseils de pr\u00e9vention au quotidien.',
      keywords: ['douleurs dorsales', 'lombalgie', 'kin\u00e9sith\u00e9rapie dos', 'mal de dos traitement', 'exercices lombalgie'],
      readingTime: 4,
      wordCount: 620,
    },
    'Maux de t\u00eate': {
      intro: 'Les maux de t\u00eate chroniques affectent pr\u00e8s de 30% de la population active. Si les causes sont multiples, les tensions musculaires cervicales et les d\u00e9s\u00e9quilibres posturaux jouent un r\u00f4le majeur souvent sous-estim\u00e9. La kin\u00e9sith\u00e9rapie offre des solutions concr\u00e8tes et durables.',
      sections: [
        { heading: 'C\u00e9phal\u00e9es de tension vs migraines', body: 'Les c\u00e9phal\u00e9es de tension se manifestent par une douleur diffuse en \u00e9tau, souvent li\u00e9e aux contractures des muscles cervicaux et trap\u00e8zes. Les migraines, plus intenses et pulsatiles, peuvent \u00e9galement \u00eatre d\u00e9clench\u00e9es par des facteurs musculo-squelettiques.', bullets: ['Contracture des trap\u00e8zes et sous-occipitaux', 'Blocage des premi\u00e8res vert\u00e8bres cervicales', 'Bruxisme et tension de la m\u00e2choire', 'Syndrome de la t\u00eate en avant (text neck)'] },
        { heading: 'L\u2019approche kin\u00e9sith\u00e9rapique', body: 'Le bilan commence par une analyse posturale compl\u00e8te et une \u00e9valuation des tensions musculaires. Le traitement associe des techniques manuelles de rel\u00e2chement myofascial, des mobilisations cervicales et un programme d\u2019auto-\u00e9tirements.', bullets: ['Rel\u00e2chement myofascial cervical', 'Mobilisations douces C1-C2', 'Renforcement des muscles profonds du cou', 'Correction posturale globale'] },
        { heading: 'R\u00e9sultats et suivi', body: 'La majorit\u00e9 des patients constatent une am\u00e9lioration significative d\u00e8s les 3 premi\u00e8res s\u00e9ances. Un suivi r\u00e9gulier et l\u2019int\u00e9gration des exercices au quotidien permettent de r\u00e9duire la fr\u00e9quence et l\u2019intensit\u00e9 des \u00e9pisodes de 60 \u00e0 80% en moyenne.' },
      ],
      conclusion: 'Les maux de t\u00eate ne sont pas une fatalit\u00e9. Une prise en charge kin\u00e9sith\u00e9rapique cibl\u00e9e, combin\u00e9e \u00e0 de bonnes habitudes posturales, peut transformer votre quotidien. Consultez pour un bilan personnalis\u00e9.',
      metaDesc: 'Maux de t\u00eate r\u00e9currents\u00a0? D\u00e9couvrez comment la kin\u00e9sith\u00e9rapie soulage c\u00e9phal\u00e9es de tension et migraines gr\u00e2ce aux techniques manuelles et exercices posturaux.',
      keywords: ['maux de t\u00eate', 'c\u00e9phal\u00e9es de tension', 'migraine kin\u00e9', 'cervicalgie', 'posture cervicale'],
      readingTime: 4,
      wordCount: 580,
    },
    'Blessures sportives': {
      intro: 'Que vous soyez sportif amateur ou athl\u00e8te confirm\u00e9, les blessures font partie des risques inh\u00e9rents \u00e0 la pratique. Entorse, tendinite, claquage ou fracture de fatigue\u00a0: chaque pathologie n\u00e9cessite un protocole de r\u00e9\u00e9ducation sp\u00e9cifique pour un retour au sport s\u00e9curis\u00e9.',
      sections: [
        { heading: 'Les blessures les plus fr\u00e9quentes', body: 'Selon les disciplines, certaines structures sont plus sollicit\u00e9es. La course \u00e0 pied fragilise les tendons d\u2019Achille et les genoux, les sports collectifs exposent aux entorses de cheville, et la musculation peut provoquer des l\u00e9sions de l\u2019\u00e9paule.', bullets: ['Entorse de cheville (ligament lat\u00e9ral externe)', 'Tendinopathie rotulienne ou achille\u00e9nne', 'L\u00e9sion musculaire (claquage, \u00e9longation)', 'Syndrome de la bandelette ilio-tibiale'] },
        { heading: 'Protocole de r\u00e9\u00e9ducation', body: 'La r\u00e9\u00e9ducation suit un protocole progressif en 3 phases\u00a0: r\u00e9duction de l\u2019inflammation et de la douleur, restauration de la mobilit\u00e9 et de la force, puis retour progressif \u00e0 l\u2019activit\u00e9 sportive avec tests fonctionnels.', bullets: ['Phase 1\u00a0: cryoth\u00e9rapie, d\u00e9charge, \u00e9lectrostimulation', 'Phase 2\u00a0: mobilisations, renforcement progressif', 'Phase 3\u00a0: propioception, reprise du geste sportif', 'Crit\u00e8res de reprise valid\u00e9s par tests isokin\u00e9tiques'] },
        { heading: 'Pr\u00e9vention des r\u00e9cidives', body: 'Le travail de pr\u00e9vention est tout aussi important que la r\u00e9\u00e9ducation. Un programme d\u2019\u00e9chauffement structur\u00e9, des exercices de proprioception et un suivi r\u00e9gulier r\u00e9duisent de 50% le risque de r\u00e9cidive.' },
      ],
      conclusion: 'Un retour au sport pr\u00e9cipit\u00e9 est la premi\u00e8re cause de r\u00e9cidive. Respectez les d\u00e9lais de cicatrisation et suivez un programme de r\u00e9\u00e9ducation complet. Votre kin\u00e9sith\u00e9rapeute vous accompagne \u00e0 chaque \u00e9tape.',
      metaDesc: 'Entorse, tendinite, claquage\u00a0: d\u00e9couvrez les protocoles de r\u00e9\u00e9ducation en kin\u00e9sith\u00e9rapie du sport et les cl\u00e9s pour un retour \u00e0 l\u2019activit\u00e9 sans r\u00e9cidive.',
      keywords: ['blessures sportives', 'r\u00e9\u00e9ducation sport', 'entorse cheville', 'tendinite traitement', 'kin\u00e9 du sport'],
      readingTime: 5,
      wordCount: 680,
    },
    'P\u00e9diatrie': {
      intro: 'La kin\u00e9sith\u00e9rapie p\u00e9diatrique intervient d\u00e8s les premiers mois de vie pour accompagner le d\u00e9veloppement moteur de l\u2019enfant. Torticolis, retard de marche, troubles respiratoires\u00a0: des techniques douces et adapt\u00e9es permettent de corriger ces probl\u00e9matiques pr\u00e9cocement.',
      sections: [
        { heading: 'Quand consulter pour son enfant\u00a0?', body: 'Certains signaux doivent alerter les parents\u00a0: une pr\u00e9f\u00e9rence de rotation de la t\u00eate, une asym\u00e9trie posturale, un retard dans l\u2019acquisition de la marche ou des bronchiolites \u00e0 r\u00e9p\u00e9tition. Une consultation pr\u00e9coce permet souvent une r\u00e9solution rapide.', bullets: ['Torticolis cong\u00e9nital ou positionnel', 'Plagioc\u00e9phalie (t\u00eate plate)', 'Retard d\u2019acquisition motrice', 'Bronchiolite et encombrement respiratoire'] },
        { heading: 'Des techniques adapt\u00e9es \u00e0 l\u2019enfant', body: 'Les s\u00e9ances sont ludiques et respectent le rythme de l\u2019enfant. Le kin\u00e9sith\u00e9rapeute utilise des mobilisations tr\u00e8s douces, des stimulations motrices par le jeu et des techniques de d\u00e9sencombrement bronchique non invasives.' },
      ],
      conclusion: 'Une prise en charge pr\u00e9coce est la cl\u00e9 du succ\u00e8s en kin\u00e9sith\u00e9rapie p\u00e9diatrique. N\u2019h\u00e9sitez pas \u00e0 consulter d\u00e8s le moindre doute\u00a0: plus l\u2019intervention est t\u00f4t, plus les r\u00e9sultats sont rapides.',
      metaDesc: 'Kin\u00e9sith\u00e9rapie p\u00e9diatrique\u00a0: torticolis, retard moteur, bronchiolite. D\u00e9couvrez les indications et les techniques douces adapt\u00e9es aux nourrissons et enfants.',
      keywords: ['kin\u00e9 p\u00e9diatrique', 'torticolis b\u00e9b\u00e9', 'bronchiolite kin\u00e9', 'd\u00e9veloppement moteur', 'plagioc\u00e9phalie'],
      readingTime: 3,
      wordCount: 480,
    },
    'Grossesse': {
      intro: 'La grossesse s\u2019accompagne de profondes transformations corporelles qui peuvent g\u00e9n\u00e9rer des inconforts\u00a0: douleurs lombaires, sciatique, jambes lourdes. La kin\u00e9sith\u00e9rapie p\u00e9rinatale aide \u00e0 traverser ces \u00e9tapes en toute s\u00e9r\u00e9nit\u00e9.',
      sections: [
        { heading: 'Soulager les douleurs de la grossesse', body: 'Le d\u00e9placement du centre de gravit\u00e9, le rel\u00e2chement ligamentaire et la prise de poids sollicitent la colonne vert\u00e9brale et le bassin. Des techniques manuelles douces et des exercices adapt\u00e9s soulagent efficacement ces douleurs.', bullets: ['Lombalgies et douleurs sacro-iliaques', 'Sciatique de la grossesse', 'Syndrome du canal carpien gestationnel', 'Lourdeur et \u0153d\u00e8me des jambes'] },
        { heading: 'Pr\u00e9paration \u00e0 l\u2019accouchement', body: 'La pr\u00e9paration du p\u00e9rin\u00e9e et le travail respiratoire sont essentiels pour un accouchement serein. Le kin\u00e9sith\u00e9rapeute enseigne les positions de confort, la gestion de la douleur par la respiration et les exercices de mobilit\u00e9 pelvienne.' },
      ],
      conclusion: 'Chaque grossesse est unique. Un suivi kin\u00e9sith\u00e9rapique personnalis\u00e9, du premier trimestre au post-partum, vous accompagne pour vivre cette p\u00e9riode en pleine forme.',
      metaDesc: 'Kin\u00e9sith\u00e9rapie et grossesse\u00a0: soulager les douleurs, pr\u00e9parer l\u2019accouchement et accompagner la r\u00e9cup\u00e9ration post-partum. Conseils et exercices adapt\u00e9s.',
      keywords: ['kin\u00e9 grossesse', 'douleur dos enceinte', 'pr\u00e9paration accouchement', 'p\u00e9rin\u00e9e', 'post-partum'],
      readingTime: 3,
      wordCount: 450,
    },
    'Troubles du sommeil': {
      intro: 'Les troubles du sommeil touchent 1 Fran\u00e7ais sur 3. Les tensions musculaires accumul\u00e9es, le stress et les douleurs chroniques sont des facteurs aggravants souvent n\u00e9glig\u00e9s. La kin\u00e9sith\u00e9rapie propose une approche corporelle compl\u00e9mentaire pour retrouver un sommeil r\u00e9parateur.',
      sections: [
        { heading: 'Le lien corps-sommeil', body: 'Les tensions musculaires chroniques maintiennent le syst\u00e8me nerveux en \u00e9tat d\u2019hypervigilance, emp\u00eachant l\u2019endormissement et la r\u00e9cup\u00e9ration profonde. Lib\u00e9rer ces tensions par des techniques manuelles restaure les conditions d\u2019un sommeil de qualit\u00e9.', bullets: ['Contractures cervicales et dorsales', 'Respiration thoracique superficielle', 'Bruxisme et tensions maxillaires', 'Syndrome des jambes sans repos'] },
        { heading: 'Techniques de relaxation corporelle', body: 'Les s\u00e9ances combinent massage d\u00e9contracturant, exercices de respiration diaphragmatique et \u00e9tirements myofasciaux. Le patient repart avec une routine du soir de 10 minutes pour prolonger les bienfaits.' },
      ],
      conclusion: 'Un sommeil de qualit\u00e9 commence par un corps d\u00e9tendu. Int\u00e9grez les exercices de rel\u00e2chement \u00e0 votre routine du soir et consultez si les troubles persistent.',
      metaDesc: 'Troubles du sommeil et tensions musculaires\u00a0: d\u00e9couvrez comment la kin\u00e9sith\u00e9rapie aide \u00e0 mieux dormir gr\u00e2ce \u00e0 la relaxation corporelle et aux \u00e9tirements.',
      keywords: ['insomnie', 'troubles du sommeil', 'relaxation musculaire', '\u00e9tirements soir', 'kin\u00e9 relaxation'],
      readingTime: 3,
      wordCount: 420,
    },
  }

  // Rolling 2-week view — continuous, no batch boundaries
  // Published & programmed have fixed specialties (from epoch, never change).
  // Only préprogrammé articles are distributed by current répartition settings.
  // Fixed pool of 40 articles: published (past+today), programmed (next 4 days), à venir (rest up to 40)
  const articlePool = useMemo(() => {
    const activeSpecs = allSpecialties.filter(s => checkedSpecs.includes(s.id))
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const accountCreated = new Date(2026, 0, 12); accountCreated.setHours(0, 0, 0, 0)
    const epoch = new Date(2026, 0, 5)
    const fixedSpecs = allSpecialties
    // Count published days (account creation to today inclusive)
    const publishedCount = Math.max(0, Math.round((today - accountCreated) / 86400000) + 1)
    // Programmed = next 4 days after today
    const programmedCount = 4
    // À venir: always 12 future articles beyond programmed
    const avenirCount = 12
    const totalDays = publishedCount + programmedCount + avenirCount
    const pool = new Map() // key: dateString, value: article data
    let preProgIndex = 0
    for (let i = 0; i < totalDays; i++) {
      const date = new Date(accountCreated)
      date.setDate(accountCreated.getDate() + i)
      date.setHours(0, 0, 0, 0)
      const isPast = date < today
      const isToday = date.toDateString() === today.toDateString()
      const daysSinceEpoch = Math.round((date - epoch) / 86400000)
      const daysFromToday = Math.round((date - today) / 86400000)
      const published = isPast || isToday
      const programmed = !published && daysFromToday <= 4
      const preProgrammed = !published && daysFromToday > 4
      let spec = null
      if (published || programmed) {
        spec = fixedSpecs[((daysSinceEpoch % fixedSpecs.length) + fixedSpecs.length) % fixedSpecs.length]
      } else if (preProgrammed && activeSpecs.length > 0) {
        spec = activeSpecs[preProgIndex % activeSpecs.length]
        preProgIndex++
      }
      const articleImage = articleImgs[((daysSinceEpoch % articleImgs.length) + articleImgs.length) % articleImgs.length]
      let articleTitle = null
      if (spec) {
        const titles = articleTitlesMap[spec.title] || ['Article SEO optimisé']
        articleTitle = titles[((daysSinceEpoch % titles.length) + titles.length) % titles.length]
      }
      const seed = Math.abs(daysSinceEpoch * 7 + 13)
      const seoGlobal = Math.round((93 + (seed % 8) + 93 + ((seed * 3 + 5) % 8) + 93 + ((seed * 7 + 11) % 8) + 93 + ((seed * 11 + 3) % 8)) / 4)
      pool.set(date.toDateString(), {
        date, published, programmed, preProgrammed, isToday, daysFromToday,
        specId: spec?.id || null, icon: spec?.icon || null, title: spec?.title || null,
        articleTitle, articleImage,
        seo: { global: seoGlobal, regularite: 93 + (seed % 8), balises: 93 + ((seed * 3 + 5) % 8), meta: 93 + ((seed * 7 + 11) % 8), motsCles: 93 + ((seed * 11 + 3) % 8) },
      })
    }
    // Compute boundaries
    const firstDate = new Date(accountCreated)
    const lastDate = new Date(accountCreated); lastDate.setDate(accountCreated.getDate() + totalDays - 1)
    return { pool, firstDate, lastDate, publishedCount, programmedCount, avenirCount }
  }, [checkedSpecs])

  // All 40 articles as a flat sorted array
  const viewData = useMemo(() => {
    const articles = []
    let i = 0
    for (const [, article] of articlePool.pool) {
      const dayNum = article.date.getDate()
      const monthShort = article.date.toLocaleDateString('fr-FR', { month: 'short' }).replace('.', '')
      articles.push({ ...article, index: i, dayNum, monthShort, hasArticle: true })
      i++
    }
    const readyDays = articles.filter(d => d.published || d.programmed).length
    const preProgDays = articles.filter(d => d.preProgrammed)
    const preProgCounts = {}
    allSpecialties.forEach(s => { preProgCounts[s.id] = 0 })
    preProgDays.forEach(d => { if (d.specId) preProgCounts[d.specId] = (preProgCounts[d.specId] || 0) + 1 })
    const publishedArticles = articles.filter(d => d.published)
    const programmedArticles = articles.filter(d => d.programmed)
    const avenirArticles = articles.filter(d => d.preProgrammed)
    return { articles, readyDays, preProgDays: preProgDays.length, preProgCounts, publishedArticles, programmedArticles, avenirArticles }
  }, [articlePool])

  // Streak count from account creation
  const streakInfo = useMemo(() => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const accountCreated = new Date(2026, 0, 12); accountCreated.setHours(0, 0, 0, 0)
    const currentStreak = Math.max(0, Math.round((today - accountCreated) / 86400000) + 1)
    return { currentStreak, cells: viewData.articles }
  }, [viewData])

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

  // Auto-select today's cell when entering referencement tab
  useEffect(() => {
    if (activeTab !== 'referencement') return
    const today = new Date(); today.setHours(0, 0, 0, 0)
    const todayIndex = streakInfo.cells.findIndex(c => {
      const d = new Date(c.date); d.setHours(0, 0, 0, 0)
      return d.getTime() === today.getTime()
    })
    if (todayIndex !== -1 && !deletedArticles.has(todayIndex)) {
      setSelectedDay(todayIndex)
    }
  }, [activeTab])

  const news = [
    { title: 'Offre parrainage — Invitez un confrère, gagnez 2 mois', desc: 'Partagez votre lien de parrainage et recevez jusqu\'à 2 mois offerts pour chaque inscription.', date: '15 fév.', tag: 'Offre', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Boostoncab — Boostez votre visibilité avec Google Ads', desc: 'Nouveau partenariat avec Boostoncab : lancez vos campagnes Google Ads en quelques clics et attirez plus de patients.', date: '12 fév.', tag: 'Partenaire', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Génération d\'articles V2 — Plus rapide, plus pertinent', desc: 'Vos articles sont désormais générés avec un style plus naturel et adapté à votre spécialité.', date: '11 fév.', tag: 'Nouveau', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Tableau de bord repensé', desc: 'Visualisez vos statistiques clés en un coup d\'œil avec le nouveau design.', date: '3 fév.', tag: 'Mise à jour', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Collecte d\'avis automatisée', desc: 'Envoyez automatiquement des demandes d\'avis à vos patients après chaque séance.', date: '20 jan.', tag: 'Nouveau', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
  ]
  const articles = [
    { title: 'Ostéopathe paris solution mal de dos', date: '12 fév.', realDate: new Date(2026, 1, 12), status: 'published', img: articleImg1, category: 'Spécialités', seoScore: 91 },
    { title: 'Comment soulager les douleurs lombaires au quotidien', date: '19 fév.', realDate: new Date(2026, 1, 19), status: 'published', img: articleImg2, category: 'Blog santé', seoScore: 87 },
    { title: 'Les bienfaits du massage sportif pour la récupération', date: '26 fév.', realDate: new Date(2026, 1, 26), status: 'scheduled', img: articleImg3, category: 'Bien-être', seoScore: 94 },
    { title: 'Prévenir les blessures : conseils pour les coureurs', date: '5 mar.', realDate: new Date(2026, 2, 5), status: 'scheduled', img: articleImg4, category: 'Spécialités', seoScore: 78 },
  ]

  const navigateToArticle = (article) => {
    const targetDate = new Date(article.realDate); targetDate.setHours(0, 0, 0, 0)
    // Find matching article in pool by date
    const match = viewData.articles.find(a => a.date.toDateString() === targetDate.toDateString())
    if (match) setSelectedDay(match.index)
    router.push('/referencement')
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


  // Cycle SEO badge every 3s
  useEffect(() => {
    const timer = setInterval(() => setSeoBadgeIdx(i => (i + 1) % seoItems.length), 3000)
    return () => clearInterval(timer)
  }, [])

  // Auto-rotate articles every 4s, loop
  useEffect(() => {
    if (activeTab !== 'accueil') return
    const interval = setInterval(() => {
      setArticleIdx(prev => (prev + 1) % articles.length)
    }, 4000)
    return () => clearInterval(interval)
  }, [activeTab, articles.length])

  // Auto-rotate news every 4.5s, loop
  useEffect(() => {
    if (activeTab === 'account') return
    const interval = setInterval(() => {
      setNewsIdx(prev => (prev + 1) % news.length)
    }, 4500)
    return () => clearInterval(interval)
  }, [activeTab, news.length])

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
      {/* Top nav */}
      <nav className="w-full max-w-[1200px] px-6 pt-4 pb-1 shrink-0">
        <div className="flex items-center justify-between relative h-10">
          {/* Logo */}
          <img src={theralysLogo} alt="Theralys" className="h-6 cursor-pointer" onClick={() => router.push('/dashboard')} />

          {/* Center nav — floating pill */}
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center bg-white border border-gray-200 rounded-2xl p-1 gap-0.5">
            {[
              { id: 'accueil', label: 'Accueil', href: '/dashboard', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg> },
              { id: 'referencement', label: 'Référencement', href: '/referencement', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> },
              { id: 'parrainage', label: 'Parrainage', href: '/parrainage', icon: <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg> },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => router.push(item.href)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-[13px] whitespace-nowrap cursor-pointer transition-colors ${
                  activeTab === item.id
                    ? 'bg-color-1 text-white font-medium'
                    : 'text-gray-400 hover:text-color-1 hover:bg-gray-50'
                }`}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </div>

          {/* Right actions */}
          <div className="relative flex items-center gap-2">
            <button
              onClick={() => router.push('/editor/accueil')}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-color-1 text-white text-sm font-medium hover:opacity-90 transition-colors cursor-pointer"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
              Modifier le site
            </button>
            <button
              onClick={() => router.push('/compte')}
              className={`w-8 h-8 rounded-full bg-color-2 flex items-center justify-center text-white text-sm font-bold cursor-pointer transition-all ${activeTab === 'account' ? 'ring-2 ring-color-2/30' : 'hover:ring-2 hover:ring-color-2/30'}`}
            >
              {prenom.charAt(0)}
            </button>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex-1 overflow-hidden px-6 py-4 w-full max-w-[1200px]">
        {activeTab === 'account' ? (
        null
        ) : activeTab === 'referencement' ? (
        <div key="referencement" className="w-full h-full relative" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>

          {/* Article calendar */}
          <div className="h-full bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative overflow-hidden">
            {/* Calendar board */}
            <div className="flex flex-col flex-1 min-h-0 transition-all rounded-xl">
              {(() => {
                const stackConfigs = [
                  { key: 'published', label: 'Publiés', count: viewData.publishedArticles.length, dot: 'bg-green-500', bg: 'bg-green-50', borderActive: 'border-green-300', text: 'text-green-600' },
                  { key: 'programmed', label: 'Programmés', count: viewData.programmedArticles.length, dot: 'bg-amber-400', bg: 'bg-amber-50', borderActive: 'border-amber-300', text: 'text-amber-600' },
                  { key: 'preProgrammed', label: 'À venir', count: viewData.avenirArticles.length, dot: 'bg-gray-400', bg: 'bg-gray-50', borderActive: 'border-gray-300', text: 'text-gray-500' },
                ]
                // Grid only shows unstacked articles, max 28, with navigation
                // Stacked statuses are hidden from the grid (toolbar buttons show counts)
                const unstackedArticles = []
                const statusGroups = [
                  { key: 'published', articles: viewData.publishedArticles },
                  { key: 'programmed', articles: viewData.programmedArticles },
                  { key: 'preProgrammed', articles: viewData.avenirArticles },
                ]
                statusGroups.forEach(({ key, articles: arts }) => {
                  if (!stackedStatuses.has(key)) {
                    arts.forEach(a => unstackedArticles.push({ type: 'article', ...a }))
                  }
                })

                // Find today in unstacked list for default offset
                const todayIdx = unstackedArticles.findIndex(a => a.isToday)
                const defaultStart = todayIdx >= 0 ? Math.max(0, Math.min(todayIdx, unstackedArticles.length - 28)) : 0
                const start = viewOffset !== null ? Math.min(viewOffset, Math.max(0, unstackedArticles.length - 1)) : defaultStart
                const end = Math.min(start + 28, unstackedArticles.length)
                const visibleItems = unstackedArticles.slice(start, end)
                const hasPrev = start > 0
                const hasNext = end < unstackedArticles.length

                return (
                  <div className="flex-1 min-h-0 flex flex-col">
                    {/* Toolbar */}
                    <div className="flex items-center gap-2 mb-3 shrink-0">
                      {/* Navigation buttons — always visible to prevent toolbar shift */}
                      <button
                        onClick={() => hasPrev && setViewOffset(Math.max(0, start - 7))}
                        className={`text-xs font-medium transition-colors ${hasPrev ? 'text-gray-400 hover:text-gray-600 cursor-pointer' : 'text-gray-200 cursor-default'}`}
                      >
                        ← Semaine précédente
                      </button>
                      <button
                        onClick={() => hasNext && setViewOffset(Math.min(unstackedArticles.length - 1, start + 7))}
                        className={`text-xs font-medium transition-colors ${hasNext ? 'text-gray-400 hover:text-gray-600 cursor-pointer' : 'text-gray-200 cursor-default'}`}
                      >
                        Semaine suivante →
                      </button>
                      <div className="w-px h-4 bg-gray-200" />
                      {/* Stack buttons */}
                      {stackConfigs.map(cfg => (
                        <button
                          key={cfg.key}
                          onClick={() => toggleStack(cfg.key)}
                          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border-2 ${
                            !stackedStatuses.has(cfg.key)
                              ? `${cfg.bg} ${cfg.borderActive} ${cfg.text}`
                              : 'bg-white border-gray-200 text-gray-400 hover:border-gray-300'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
                          {cfg.label}
                          <span className={`ml-0.5 px-1.5 py-0.5 rounded-md text-xs font-bold ${!stackedStatuses.has(cfg.key) ? 'bg-white/60' : 'bg-gray-100'}`}>{cfg.count}</span>
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" className={`transition-transform ${stackedStatuses.has(cfg.key) ? 'rotate-180' : ''}`}><polyline points="18 15 12 9 6 15"/></svg>
                        </button>
                      ))}

                      {/* Aujourd'hui reset button */}
                      {viewOffset !== null && (
                        <button onClick={() => setViewOffset(null)} className="text-xs font-medium text-[#FC6D41] hover:text-[#e55e35] transition-colors cursor-pointer ml-1">
                          Aujourd'hui
                        </button>
                      )}

                      <div className="ml-auto flex items-center gap-1">
                        {/* Collapsible search */}
                        <div className="flex items-center">
                          {searchExpanded ? (
                            <div className="relative w-[160px]">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" className="absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                              <input
                                autoFocus
                                type="text"
                                value={seoSearchQuery}
                                onChange={e => setSeoSearchQuery(e.target.value)}
                                onBlur={() => { if (!seoSearchQuery) setSearchExpanded(false) }}
                                placeholder="Rechercher..."
                                className="w-full pl-7 pr-6 py-1 rounded-lg bg-gray-100 text-xs text-color-1 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-color-2/30 transition-all"
                              />
                              {seoSearchQuery && (
                                <button onClick={() => { setSeoSearchQuery(''); setSearchExpanded(false) }} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                                  <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                                </button>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => setSearchExpanded(true)}
                              className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                            >
                              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                            </button>
                          )}
                        </div>

                        {/* Settings button */}
                        <button
                          onClick={() => { setSettingsInitial({ tone: redTone, style: redStyle, pronoun: redPronoun, prompt: redPrompt, checkedSpecs: [...checkedSpecs] }); setShowRedactorSettings(true) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors cursor-pointer"
                          title="Paramètres du rédacteur IA"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.32 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
                        </button>

                        {/* Streak badge */}
                        <div className="flex items-center gap-1 pl-2 border-l border-gray-200">
                          <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><path d="M8 1C8 1 3 5 3 9.5C3 12 5.2 14 8 14C10.8 14 13 12 13 9.5C13 7 11 5.5 11 5.5C11 5.5 10.5 8 9 8.5C9 8.5 10 4 8 1Z" fill="#FC6D41"/></svg>
                          <span className="text-sm font-bold text-color-1 tabular-nums">{streakInfo.currentStreak}</span>
                        </div>
                      </div>
                    </div>
                    {seoSearchQuery.trim() ? (
                      /* Search results list */
                      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-1 pt-1">
                        {(() => {
                          const q = seoSearchQuery.toLowerCase().trim()
                          const results = viewData.articles.filter(item => {
                            if (deletedArticles.has(item.index)) return false
                            const titleMatch = (customArticleTitles[item.index] || item.articleTitle || '').toLowerCase().includes(q)
                            const topicMatch = (item.title || '').toLowerCase().includes(q)
                            return titleMatch || topicMatch
                          })
                          if (!results.length) return (
                            <div className="flex-1 flex items-center justify-center">
                              <p className="text-sm text-gray-300">Aucun résultat pour « {seoSearchQuery} »</p>
                            </div>
                          )
                          return results.map(item => {
                            const displayTitle = customArticleTitles[item.index] || item.articleTitle
                            const dotColor = item.published ? 'bg-green-400' : item.programmed ? 'bg-amber-400' : 'bg-gray-400'
                            const statusLabel = item.published ? 'Publié' : item.programmed ? 'Programmé' : 'À venir'
                            return (
                              <button
                                key={item.index}
                                onClick={() => { setSelectedDay(item.index); setSeoSearchQuery(''); setSearchExpanded(false) }}
                                className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer text-left"
                              >
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-semibold text-color-1 truncate">{displayTitle}</p>
                                  <div className="flex items-center gap-1.5 mt-0.5">
                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColor}`} />
                                    <span className="text-xs text-gray-400">{statusLabel} · {item.dayNum} {item.monthShort}</span>
                                  </div>
                                </div>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>
                              </button>
                            )
                          })
                        })()}
                      </div>
                    ) : (
                    <div className="flex-1 min-h-0">
                    <div className="grid grid-cols-7 gap-1.5 h-full" style={{ gridTemplateRows: 'repeat(4, 1fr)' }}>
                      {visibleItems.map((item, idx) => {
                        // Deleted article
                        const isDeleted = deletedArticles.has(item.index)
                        if (isDeleted) return (
                          <div
                            key={`art-${item.index}`}
                            className="relative rounded-[10px] border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-colors"
                          >
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="2" strokeLinecap="round"><path d="M12 5v14"/><path d="M5 12h14"/></svg>
                          </div>
                        )

                        // Normal article card
                        const spec = allSpecialties.find(s => s.id === (customArticleCategories[item.index] || item.specId))
                        const seoScore = item.seo?.global || 0
                        const seoLabel = seoScore >= 90 ? 'Excellent' : seoScore >= 75 ? 'Bon' : 'À améliorer'
                        const seoColor = seoScore >= 90 ? 'text-green-500' : seoScore >= 75 ? 'text-amber-500' : 'text-gray-400'

                        return (
                          <div
                            key={`art-${item.index}`}
                            onClick={() => {
                              setSelectedDay(item.index)
                              const title = customArticleTitles[item.index] || item.articleTitle || ''
                              setEditingTitle(title)
                              setEditingMeta(item.metaDescription || 'Découvrez nos conseils professionnels en kinésithérapie pour améliorer votre bien-être au quotidien.')
                              setCardDirty(false)
                              setShowArticleCard(true)
                            }}
                            className={`group relative rounded-[10px] overflow-hidden cursor-pointer transition-all duration-200 border-2 ${
                              item.isToday ? 'border-[#FC6D41]' : (item.published || item.programmed) ? 'border-gray-200' : 'border-gray-100'
                            } ${item.published ? 'bg-green-50' : item.programmed ? 'bg-amber-50' : 'bg-gray-50'} flex flex-col p-2`}
                          >
                            <span className={`text-sm font-bold leading-none ${item.isToday ? 'text-[#FC6D41]' : 'text-color-1'}`}>{item.dayNum} {item.monthShort}</span>
                            {spec && <span className="mt-1 px-1.5 py-0.5 rounded-full bg-white text-color-1 text-xs font-semibold leading-none truncate self-start max-w-full">{spec.title}</span>}
                            <p className="text-xs font-semibold text-color-1 leading-tight line-clamp-2 mt-auto">{customArticleTitles[item.index] || item.articleTitle || ''}</p>
                            {(item.published || item.programmed) && seoScore > 0 && (
                              <div className="border-t border-gray-100 mt-1 pt-1">
                                <p className={`text-xs font-bold ${seoColor} leading-none`}>{seoLabel} : {seoScore}/100</p>
                              </div>
                            )}
                            {/* Hover overlay — published/programmed: delete + edit */}
                            {(item.published || item.programmed) && (
                              <div className={`absolute inset-0 rounded-[10px] flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 ${item.published ? 'bg-green-50' : 'bg-amber-50'}`}>
                                <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-[8px] ${item.published ? 'bg-green-100/50' : 'bg-amber-100/50'}`}>
                                  <span className={`w-1.5 h-1.5 rounded-full ${item.published ? 'bg-green-500' : 'bg-amber-400'}`} />
                                  <span className={`text-xs font-semibold ${item.published ? 'text-green-600' : 'text-amber-600'}`}>{item.published ? 'Publié' : 'Programmé'}</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center gap-4">
                                  <button
                                    onClick={(e) => { e.stopPropagation(); setPendingDeleteDay(item.index) }}
                                    className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                                  >
                                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 group-hover/btn:bg-red-50 group-hover/btn:text-red-500 transition-colors">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                                    </span>
                                    <span className="text-xs text-gray-400">Supprimer</span>
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedDay(item.index)
                                      setEditingTitle(customArticleTitles[item.index] || item.articleTitle || '')
                                      setEditorImage(customArticleImages[item.index] || item.articleImage)
                                      setArticleContent(
                                        `<h1>${customArticleTitles[item.index] || item.articleTitle || ''}</h1>` +
                                        `<p>Les troubles musculo-squelettiques représentent un enjeu majeur de santé publique. Cet article explore les approches thérapeutiques modernes pour accompagner les patients dans leur parcours de soins.</p>` +
                                        `<h2>Introduction</h2>` +
                                        `<p>La kinésithérapie joue un rôle essentiel dans la prise en charge des douleurs chroniques. Grâce à des techniques éprouvées et une approche personnalisée, il est possible d'améliorer significativement la qualité de vie des patients.</p>` +
                                        `<h2>Les techniques recommandées</h2>` +
                                        `<p>Parmi les méthodes les plus efficaces, on retrouve :</p>` +
                                        `<ul><li>La thérapie manuelle et les mobilisations articulaires</li><li>Les exercices de renforcement musculaire ciblés</li><li>Les étirements et la proprioception</li><li>L'éducation thérapeutique du patient</li></ul>` +
                                        `<h2>Conclusion</h2>` +
                                        `<p>Un suivi régulier et adapté permet d'obtenir des résultats durables. N'hésitez pas à consulter votre kinésithérapeute pour un bilan personnalisé.</p>`
                                      )
                                      setShowArticleEditor(true)
                                    }}
                                    className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                                  >
                                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 group-hover/btn:bg-color-2/10 group-hover/btn:text-color-2 transition-colors">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                                    </span>
                                    <span className="text-xs text-gray-400">Modifier</span>
                                  </button>
                                </div>
                              </div>
                            )}
                            {/* Hover overlay — à venir: change subject */}
                            {item.preProgrammed && (
                              <div className="absolute inset-0 bg-gray-50 rounded-[10px] flex flex-col opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10">
                                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-t-[8px] bg-gray-100/50">
                                  <span className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                                  <span className="text-xs font-semibold text-gray-500">À venir</span>
                                </div>
                                <div className="flex-1 flex items-center justify-center">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      setSelectedDay(item.index)
                                      setChangeSubjectTitle(customArticleTitles[item.index] || item.articleTitle || '')
                                      setChangeSubjectInstruction('')
                                      setShowChangeSubject(true)
                                    }}
                                    className="flex flex-col items-center gap-1 group/btn cursor-pointer"
                                  >
                                    <span className="w-9 h-9 rounded-xl flex items-center justify-center text-gray-400 group-hover/btn:bg-color-2/10 group-hover/btn:text-color-2 transition-colors">
                                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="17 1 21 5 17 9"/><path d="M3 5h18"/><polyline points="7 23 3 19 7 15"/><path d="M21 19H3"/></svg>
                                    </span>
                                    <span className="text-xs text-gray-400">Changer</span>
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                    </div>
                    )}
                  </div>
                )
              })()}
            </div>

            {/* Change subject modal */}
            {showChangeSubject && selectedDay !== null && (() => {
              const item = streakInfo.cells.find(c => c.index === selectedDay)
              if (!item) return null
              const displayImage = customArticleImages[item.index] || item.articleImage
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowChangeSubject(false)}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative bg-white rounded-2xl shadow-2xl w-[420px] overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
                    {/* Header */}
                    <div className="flex items-center justify-between px-5 pt-5 pb-3">
                      <h3 className="text-sm font-bold text-color-1">Changer le sujet</h3>
                      <button onClick={() => setShowChangeSubject(false)} className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-color-1 hover:bg-gray-100 transition-colors cursor-pointer">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                      </button>
                    </div>

                    <div className="px-5 pb-5 flex flex-col gap-4">
                      {/* Titre */}
                      <div>
                        <label className="text-xs font-semibold text-color-1 mb-1.5 block">Titre</label>
                        <input
                          type="text"
                          value={changeSubjectTitle}
                          onChange={e => { if (e.target.value.length <= 55) setChangeSubjectTitle(e.target.value) }}
                          maxLength={55}
                          className="w-full text-[13px] text-color-1 bg-gray-50 rounded-xl px-3 py-2.5 outline-none border border-gray-200 focus:border-color-2 transition-colors"
                          placeholder="Titre de l'article..."
                        />
                      </div>

                      {/* Image */}
                      <div>
                        <label className="text-xs font-semibold text-color-1 mb-1.5 block">Image</label>
                        <button
                          onClick={() => { setPexelsSearch(''); setShowPexels(true) }}
                          className="w-full h-[100px] rounded-xl overflow-hidden relative cursor-pointer group/img border-2 border-gray-100 hover:border-gray-200 transition-colors"
                        >
                          <img src={displayImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                            <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                              <span className="text-white text-[11px] font-medium">Changer</span>
                            </div>
                          </div>
                        </button>
                      </div>

                      {/* Instruction IA */}
                      <div>
                        <label className="text-xs font-semibold text-color-1 mb-1.5 block">Instruction IA</label>
                        <textarea
                          value={changeSubjectInstruction}
                          onChange={e => setChangeSubjectInstruction(e.target.value)}
                          rows={3}
                          className="w-full text-[13px] text-color-1 bg-gray-50 rounded-xl px-3 py-2.5 outline-none border border-gray-200 focus:border-color-2 transition-colors resize-none"
                          placeholder="Ex: Parler des techniques de massage pour sportifs..."
                        />
                      </div>

                      {/* Valider */}
                      <button
                        onClick={() => {
                          setCustomArticleTitles(prev => ({ ...prev, [item.index]: changeSubjectTitle }))
                          setShowChangeSubject(false)
                        }}
                        className="w-full py-2.5 rounded-xl bg-[#FC6D41] text-white text-[13px] font-semibold hover:bg-[#e55e35] transition-colors cursor-pointer"
                      >
                        Valider
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Delete confirmation modal */}
            {pendingDeleteDay !== null && (() => {
              const item = streakInfo.cells.find(c => c.index === pendingDeleteDay)
              if (!item) return null
              return (
                <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setPendingDeleteDay(null)}>
                  <div className="absolute inset-0 bg-black/40" />
                  <div className="relative bg-white rounded-2xl shadow-2xl w-[360px] p-6 flex flex-col items-center" onClick={e => e.stopPropagation()} style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
                    <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-3">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#EF4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                    </div>
                    <h4 className="text-[14px] font-bold text-color-1 mb-1">Attention</h4>
                    <p className="text-[12px] text-gray-500 text-center mb-1">Cet article sera définitivement supprimé et ne sera pas récupérable.</p>
                    <p className="text-[11px] text-gray-400 text-center mb-5">Vous pourrez réécrire un nouvel article à cette date, mais il sera considéré comme en retard.</p>
                    <div className="flex gap-2 w-full">
                      <button onClick={() => setPendingDeleteDay(null)} className="flex-1 py-2.5 rounded-xl text-[12px] font-medium bg-gray-100 text-color-1 hover:bg-gray-200 transition-colors cursor-pointer">
                        Annuler
                      </button>
                      <button onClick={() => { setDeletedArticles(prev => new Set([...prev, pendingDeleteDay])); setPendingDeleteDay(null) }} className="flex-1 py-2.5 rounded-xl text-[12px] font-medium bg-red-500 text-white hover:bg-red-600 transition-colors cursor-pointer">
                        Supprimer
                      </button>
                    </div>
                  </div>
                </div>
              )
            })()}

            {/* Paused overlay — autoPublish off */}
            {!autoPublish && (
              <div className="absolute inset-0 z-20 flex flex-col items-center justify-center rounded-2xl overflow-hidden pointer-events-none" style={{ backdropFilter: 'brightness(0.4)', backgroundColor: 'rgba(0,0,0,0.35)' }}>
                <div className="w-10 h-10 rounded-full bg-white/15 flex items-center justify-center mb-3">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>
                </div>
                <p className="text-white text-sm font-semibold">Publication en pause</p>
                <p className="text-white/60 text-xs mt-1">Aucun article n'est publié automatiquement</p>
              </div>
            )}
          </div>


          {/* Répartition modal */}

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
                                setCardDirty(true)
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

          {/* Rich text article editor modal */}
          {showArticleEditor && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => setShowArticleEditor(false)}>
              <div className="absolute inset-0 bg-black/40" />
              <div
                className="relative bg-white rounded-2xl overflow-hidden w-[95vw] max-w-[1100px] h-[92vh] flex flex-col"
                onClick={e => e.stopPropagation()}
                style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'tab-fade-in 0.15s ease-out' }}
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 shrink-0">
                  <h3 className="text-sm font-bold text-color-1">Modifier l'article</h3>
                  <button onClick={() => setShowArticleEditor(false)} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>
                {/* Image field */}
                <div className="px-5 pt-4 pb-2 shrink-0">
                  <label className="text-xs font-semibold text-color-1 mb-1.5 block">Image</label>
                  <div
                    className="relative w-full h-[80px] rounded-xl overflow-hidden border-2 border-gray-200 cursor-pointer group/img hover:border-gray-300 transition-colors"
                    onClick={() => {
                      const url = prompt('URL de l\'image (Pexels, Unsplash...)', editorImage)
                      if (url) setEditorImage(url)
                    }}
                  >
                    {editorImage ? (
                      <img src={editorImage} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-gray-50 flex items-center justify-center">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover/img:bg-black/30 transition-colors flex items-center justify-center">
                      <span className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover/img:opacity-100 transition-opacity">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                      </span>
                    </div>
                  </div>
                </div>
                {/* Toolbar */}
                <div className="flex items-center gap-0.5 px-4 py-2 border-b border-gray-100 shrink-0 flex-wrap">
                  {[
                    { cmd: 'bold', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/><path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z"/></svg>, title: 'Gras' },
                    { cmd: 'italic', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="4" x2="10" y2="4"/><line x1="14" y1="20" x2="5" y2="20"/><line x1="15" y1="4" x2="9" y2="20"/></svg>, title: 'Italique' },
                    { cmd: 'underline', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3"/><line x1="4" y1="21" x2="20" y2="21"/></svg>, title: 'Souligné' },
                    { sep: true },
                    { cmd: 'formatBlock', val: 'H1', label: 'H1', title: 'Titre 1' },
                    { cmd: 'formatBlock', val: 'H2', label: 'H2', title: 'Titre 2' },
                    { cmd: 'formatBlock', val: 'P', label: 'P', title: 'Paragraphe' },
                    { sep: true },
                    { cmd: 'insertUnorderedList', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="9" y1="6" x2="20" y2="6"/><line x1="9" y1="12" x2="20" y2="12"/><line x1="9" y1="18" x2="20" y2="18"/><circle cx="4" cy="6" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="12" r="1.5" fill="currentColor" stroke="none"/><circle cx="4" cy="18" r="1.5" fill="currentColor" stroke="none"/></svg>, title: 'Liste' },
                    { cmd: 'insertOrderedList', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="10" y1="6" x2="20" y2="6"/><line x1="10" y1="12" x2="20" y2="12"/><line x1="10" y1="18" x2="20" y2="18"/><text x="4" y="8" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">1</text><text x="4" y="14" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">2</text><text x="4" y="20" fontSize="8" fill="currentColor" stroke="none" fontWeight="600">3</text></svg>, title: 'Liste numérotée' },
                  ].map((btn, i) => btn.sep ? (
                    <div key={i} className="w-px h-5 bg-gray-200 mx-1" />
                  ) : (
                    <button
                      key={i}
                      title={btn.title}
                      onMouseDown={e => {
                        e.preventDefault()
                        if (btn.val) {
                          document.execCommand(btn.cmd, false, `<${btn.val}>`)
                        } else {
                          document.execCommand(btn.cmd, false, null)
                        }
                      }}
                      className="w-7 h-7 rounded-md flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-color-1 transition-colors cursor-pointer text-xs font-bold"
                    >
                      {btn.icon || btn.label}
                    </button>
                  ))}
                </div>
                {/* Editor area */}
                <div
                  ref={editorRef}
                  contentEditable
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: articleContent }}
                  onInput={() => setCardDirty(true)}
                  className="flex-1 overflow-y-auto px-8 py-6 outline-none text-sm text-color-1 leading-relaxed prose-editor"
                  style={{
                    fontFamily: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
                  }}
                />
                {/* Footer */}
                <div className="flex items-center justify-end gap-2 px-5 py-3 border-t border-gray-100 shrink-0">
                  <button
                    onClick={() => setShowArticleEditor(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium text-gray-500 hover:bg-gray-100 transition-colors cursor-pointer"
                  >Annuler</button>
                  <button
                    onClick={() => {
                      if (selectedDay !== null) {
                        setCustomArticleImages(prev => ({ ...prev, [selectedDay]: editorImage }))
                      }
                      setCardDirty(true)
                      setShowArticleEditor(false)
                    }}
                    className="px-5 py-2 rounded-xl text-xs font-medium bg-[#FC6D41] text-white hover:bg-[#e55e35] transition-colors cursor-pointer"
                  >Enregistrer</button>
                </div>
              </div>
              <style>{`
                .prose-editor h1 { font-size: 1.5rem; font-weight: 700; margin: 0.75rem 0 0.5rem; line-height: 1.3; }
                .prose-editor h2 { font-size: 1.15rem; font-weight: 700; margin: 0.75rem 0 0.4rem; line-height: 1.3; color: #2D2D2D; }
                .prose-editor p { margin: 0.4rem 0; }
                .prose-editor ul, .prose-editor ol { margin: 0.4rem 0; padding-left: 1.5rem; }
                .prose-editor li { margin: 0.2rem 0; }
                .prose-editor strong { font-weight: 700; }
                .prose-editor em { font-style: italic; }
                .prose-editor u { text-decoration: underline; }
              `}</style>
            </div>
          )}


        </div>
        ) : activeTab === 'parrainage' ? (
        <div key="parrainage" className="flex flex-col gap-3 w-full h-full relative" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>

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
                {/* YouTube video */}
                <div className="w-full aspect-video bg-black">
                  <iframe
                    src="https://www.youtube.com/embed/dQw4w9WgXcQ"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
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
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-bold text-color-1">Bonjour {prenom}</h1>
                <div className="relative mt-2 inline-block">
                  <button
                    onClick={() => setTimePeriodOpen(!timePeriodOpen)}
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
              <div className="flex gap-3">
                {kpiCards.map((kpi) => (
                  <button
                    key={kpi.key}
                    onClick={() => setSelectedKpi(kpi.key)}
                    className={`rounded-xl px-4 py-3 min-w-[120px] text-left transition-all cursor-pointer border-2 ${
                      selectedKpi === kpi.key ? `${kpi.activeBg} ${kpi.activeBorder}` : `${kpi.bg} border-transparent`
                    }`}
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

            <div className="flex-1 mt-4 min-h-0 flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between pr-2 text-sm text-gray-400 shrink-0 text-right">
                {yLabels.map((v) => <span key={v}>{v}</span>)}
              </div>

              {/* Chart + X-axis */}
              <div className="flex-1 flex flex-col min-w-0">
                {/* Curve area */}
                <div
                  className="flex-1 relative min-h-0"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const idx = Math.round(x * (activeCard.data.length - 1))
                    setHoveredKpi(Math.max(0, Math.min(idx, activeCard.data.length - 1)))
                  }}
                  onMouseLeave={() => setHoveredKpi(null)}
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

          </div>

          {/* Right column — spans both rows */}
          <div className="row-span-2 flex flex-col gap-2.5">

            {/* Actions */}
            <div className="bg-white border-2 border-gray-200 rounded-2xl p-3.5 shrink-0">
              <h2 className="text-base font-bold text-color-1 mb-2.5" onDoubleClick={() => { localStorage.removeItem('completedActions'); localStorage.removeItem('seoSetupStep'); localStorage.removeItem('setupStep'); setCompletedActions([]); window.dispatchEvent(new Event('actionsUpdated')) }}>Actions</h2>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'setup', label: 'Options du site', desc: 'Configurer les informations et préférences', requires: null,
                    onClick: () => setShowSetupModal(true),
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { id: 'publish', label: 'Publier', desc: 'Vérifier vos pages, choisir un domaine et publier', requires: 'setup', href: '/editor/accueil?mode=validate',
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg> },
                  { id: 'seo', label: 'Paramétrage SEO', desc: 'Optimiser le référencement de votre site', requires: 'publish',
                    onClick: () => { const savedStep = localStorage.getItem('seoSetupStep') || 'redaction'; setSeoSetupMode(true); setSettingsSection(savedStep); setSettingsInitial({ tone: redTone, style: redStyle, pronoun: redPronoun, prompt: redPrompt, checkedSpecs: [...checkedSpecs] }); setShowRedactorSettings(true) },
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg> },
                ].map((action, i) => {
                  const done = completedActions.includes(action.id)
                  const locked = action.requires && !completedActions.includes(action.requires)
                  if (done) return (
                    <div key={action.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-green-50 border border-green-200/50">
                      <div className="w-7 h-7 rounded-lg bg-green-100 flex items-center justify-center shrink-0 text-green-600">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                      </div>
                      <p className="text-sm font-medium text-green-700 line-through">{action.label}</p>
                    </div>
                  )
                  if (locked) return (
                    <div key={action.id} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-gray-50 border border-gray-200 opacity-40">
                      <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center shrink-0 text-gray-400">
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                      </div>
                      <p className="text-sm font-medium text-gray-400">{action.label}</p>
                    </div>
                  )
                  return (
                    <button key={action.id} onClick={action.onClick || (() => router.push(action.href))} className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-color-2/5 hover:bg-color-2/10 border border-color-2/20 transition-colors cursor-pointer text-left">
                      <div className="w-7 h-7 rounded-lg bg-color-2/15 flex items-center justify-center shrink-0 text-color-2">
                        {action.icon}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-color-1">{action.label}</p>
                        <p className="text-[11px] text-gray-400 leading-tight">{action.desc}</p>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Article bento */}
            <button onClick={() => navigateToArticle(articles[articleIdx])} className="flex-1 border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden cursor-pointer hover:border-gray-300 transition-colors text-left">
              {/* Background image */}
              <img src={articles[articleIdx].img} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-black/10" />
              {/* Content */}
              <div className="relative z-[1] flex flex-col flex-1 min-h-0">
                <div className="flex items-center gap-1.5 mb-2">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold ${articles[articleIdx].status === 'published' ? 'bg-white text-green-600' : 'bg-white text-amber-600'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${articles[articleIdx].status === 'published' ? 'bg-green-500' : 'bg-amber-400'}`} />
                    {articles[articleIdx].status === 'published' ? 'Publié' : 'Programmé'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-white text-[#FC6D41] text-[11px] font-semibold">{articles[articleIdx].category}</span>
                  <span className="ml-auto text-[11px] font-medium text-white/70">{articles[articleIdx].date}</span>
                </div>
                <p className="text-sm font-semibold text-white leading-snug">{articles[articleIdx].title}</p>
                <div className="border-t border-white/20 mt-auto pt-2.5 flex items-center justify-between">
                  {(() => {
                    const s = articles[articleIdx].seoScore
                    const label = s >= 90 ? 'Excellent' : s >= 75 ? 'Bon' : 'À améliorer'
                    const color = s >= 90 ? 'text-green-400' : s >= 75 ? 'text-amber-400' : 'text-red-400'
                    return <p className={`text-sm font-bold ${color}`}>{label} : {s}/100</p>
                  })()}
                  <div className="flex items-center gap-1.5">
                    <div onClick={(e) => { e.stopPropagation(); setArticleIdx((articleIdx - 1 + articles.length) % articles.length) }} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                    </div>
                    {articles.map((_, i) => (
                      <div key={i} onClick={(e) => { e.stopPropagation(); setArticleIdx(i) }} className={`rounded-full transition-all cursor-pointer block ${i === articleIdx ? 'w-4 h-[6px] bg-color-2' : 'w-[6px] h-[6px] bg-white/40 hover:bg-white/60'}`} />
                    ))}
                    <div onClick={(e) => { e.stopPropagation(); setArticleIdx((articleIdx + 1) % articles.length) }} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors">
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                    </div>
                  </div>
                </div>
              </div>
            </button>

            {/* Quoi de neuf bento */}
            <button onClick={() => setShowNewsModal(newsIdx)} className="flex-1 border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden cursor-pointer text-left bg-gradient-to-br from-color-1 to-gray-700 hover:border-gray-300 transition-colors">
              {/* Background pattern */}
              <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute top-6 right-4 text-5xl">✨</div>
              </div>
              {/* Tag + Date */}
              <div className="flex items-center justify-between mb-2 shrink-0 relative z-10">
                <span className="inline-flex items-center px-2 py-0.5 rounded-full bg-color-2 text-white text-[11px] font-semibold">
                  {news[newsIdx].tag}
                </span>
                <span className="text-white/60 text-[11px] font-medium">{news[newsIdx].date}</span>
              </div>
              {/* Title */}
              <p className="text-white text-sm font-bold leading-snug relative z-10">{news[newsIdx].title}</p>
              {/* Footer nav */}
              <div className="mt-auto pt-2.5 flex items-center justify-end relative z-10">
                <div className="flex items-center gap-1.5">
                  <div onClick={(e) => { e.stopPropagation(); setNewsIdx((newsIdx - 1 + news.length) % news.length) }} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
                  </div>
                  {news.map((_, i) => (
                    <div key={i} onClick={(e) => { e.stopPropagation(); setNewsIdx(i) }} className={`rounded-full transition-all cursor-pointer block ${i === newsIdx ? 'w-4 h-[6px] bg-color-2' : 'w-[6px] h-[6px] bg-white/30 hover:bg-white/50'}`} />
                  ))}
                  <div onClick={(e) => { e.stopPropagation(); setNewsIdx((newsIdx + 1) % news.length) }} className="w-6 h-6 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center cursor-pointer transition-colors">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
                  </div>
                </div>
              </div>
            </button>

          </div>

          {/* 3 — Bottom left — Ranking chart */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-color-1">Classement Google</h2>
                <p className="text-sm text-gray-400 mt-0.5 transition-all rounded-lg">"{profession} {ville}"</p>
              </div>
              <div className="bg-gray-50 rounded-xl px-4 py-2.5 transition-all">
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
            <div className="flex-1 mt-3 min-h-0 flex transition-all rounded-xl">
              {/* Y-axis labels (ranking: 1 at top, 30 at bottom) */}
              <div className="flex flex-col justify-between pr-2 text-sm text-gray-400 shrink-0 text-right">
                <span>1</span><span>5</span><span>10</span><span>15</span><span>20</span><span>30</span>
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div
                  className="flex-1 relative min-h-0"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const idx = Math.round(x * (slicedRanking.length - 1))
                    setHoveredRank(Math.max(0, Math.min(idx, slicedRanking.length - 1)))
                  }}
                  onMouseLeave={() => setHoveredRank(null)}
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

          </div>
        </div>
        )}
      </div>

      {/* Setup modal — Options du site flow */}
      {showSetupModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => { setShowSetupModal(false) }} />
          <div className="relative bg-white rounded-2xl shadow-2xl w-[820px] h-[520px] overflow-hidden" style={{ animation: 'tab-fade-in 0.2s ease-out' }}>
            <SetupProvider initialStep={localStorage.getItem('setupStep') || 'contact'} isModal onClose={() => { setShowSetupModal(false); try { setCompletedActions(JSON.parse(localStorage.getItem('completedActions') || '[]')) } catch {} }}>
              <SetupShell />
            </SetupProvider>
          </div>
        </div>
      )}

      {/* Settings modal — Rédaction IA + Répartition (top-level so it works from any tab) */}
      {showRedactorSettings && (() => {
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
        return (
          <div className="fixed inset-0 z-[100] flex items-center justify-center" onClick={() => { if (seoSetupMode) localStorage.setItem('seoSetupStep', settingsSection); setShowRedactorSettings(false); setSeoSetupMode(false) }}>
            <div className="absolute inset-0 bg-black/40" />
            <div
              className="relative bg-white rounded-2xl overflow-hidden w-[720px] max-w-[90vw] h-[520px] flex"
              onClick={e => e.stopPropagation()}
              style={{ boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'tab-fade-in 0.15s ease-out' }}
            >
              {/* Left sidebar */}
              <div className="w-[200px] shrink-0 border-r border-gray-100 py-5 px-3 flex flex-col">
                <h2 className="text-[13px] font-semibold text-gray-400 px-2.5 mb-3">{seoSetupMode ? 'Paramétrage SEO' : 'Paramètres'}</h2>
                {seoSetupMode ? (
                  <div className="flex flex-col gap-0.5">
                    {[
                      { id: 'redaction', label: 'Rédaction IA', step: 1, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg> },
                      { id: 'repartition', label: 'Répartition', step: 2, icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
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
                ) : (
                  <div className="flex flex-col gap-0.5">
                    {[
                      { id: 'redaction', label: 'Rédaction IA', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3l1.912 5.813a2 2 0 0 0 1.275 1.275L21 12l-5.813 1.912a2 2 0 0 0-1.275 1.275L12 21l-1.912-5.813a2 2 0 0 0-1.275-1.275L3 12l5.813-1.912a2 2 0 0 0 1.275-1.275L12 3z"/></svg> },
                      { id: 'repartition', label: 'Répartition', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg> },
                    ].map(item => (
                      <button
                        key={item.id}
                        onClick={() => setSettingsSection(item.id)}
                        className={`flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-[13px] font-medium transition-all cursor-pointer ${settingsSection === item.id ? 'bg-color-1 text-white' : 'text-gray-500 hover:bg-gray-50'}`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Right content */}
              <div className="flex-1 min-w-0 flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 shrink-0">
                  <div className="flex items-center gap-3">
                    <h3 className="text-base font-bold text-color-1">{settingsSection === 'redaction' ? 'Rédaction IA' : 'Répartition'}</h3>
                    {seoSetupMode && <span className="text-[11px] font-medium text-gray-300">Étape {settingsSection === 'redaction' ? '1' : '2'} / 2</span>}
                  </div>
                  <button onClick={() => { if (seoSetupMode) localStorage.setItem('seoSetupStep', settingsSection); setShowRedactorSettings(false); setSeoSetupMode(false) }} className="w-7 h-7 rounded-full hover:bg-gray-100 flex items-center justify-center cursor-pointer transition-colors">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </div>

                {/* Content */}
                <div className="flex-1 px-6 py-4 flex flex-col">
                  {settingsSection === 'redaction' ? (
                    <div className="flex flex-col gap-3 flex-1" style={{ animation: 'tab-fade-in 0.2s ease' }}>
                      {/* Top row: Tone + Style side by side */}
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[11px] font-medium text-gray-500 mb-1.5 block">Ton de communication</span>
                          <div className="flex flex-col gap-1">
                            {tones.map(t => (
                              <button key={t.id} onClick={() => setRedTone(t.id)} className={`w-full py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${redTone === t.id ? 'bg-color-1 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                {t.label}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <span className="text-[11px] font-medium text-gray-500 mb-1.5 block">Style de rédaction</span>
                          <div className="flex flex-col gap-1">
                            {styles.map(s => (
                              <button key={s.id} onClick={() => setRedStyle(s.id)} className={`w-full py-1.5 rounded-lg text-[12px] font-medium transition-all cursor-pointer ${redStyle === s.id ? 'bg-color-1 text-white shadow-sm' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}>
                                {s.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Pronoun */}
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

                      {/* Bottom row: Instructions + Preview side by side */}
                      <div className="grid grid-cols-2 gap-3 flex-1 min-h-0">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-medium text-gray-500 mb-1.5 block">Instructions supplémentaires</span>
                          <textarea
                            value={redPrompt}
                            onChange={e => setRedPrompt(e.target.value)}
                            placeholder="Ex: Toujours mentionner que le cabinet est accessible PMR. Éviter le jargon trop technique..."
                            className="w-full flex-1 text-[12px] text-color-1 bg-gray-50 rounded-xl px-3 py-2.5 outline-none border border-gray-200 focus:border-color-2 transition-colors resize-none leading-relaxed"
                          />
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

                      {/* Save / Next */}
                      {(() => {
                        const redDirty = seoSetupMode || !settingsInitial || redTone !== settingsInitial.tone || redStyle !== settingsInitial.style || redPronoun !== settingsInitial.pronoun || redPrompt !== settingsInitial.prompt
                        return (
                          <button
                            onClick={() => {
                              if (!redDirty) return
                              if (seoSetupMode) {
                                localStorage.setItem('seoSetupStep', 'repartition')
                                setSettingsSection('repartition')
                              } else {
                                setShowRedactorSettings(false)
                              }
                            }}
                            className={`w-full py-2.5 rounded-xl text-[13px] font-medium shrink-0 flex items-center justify-center gap-2 transition-all ${
                              redDirty
                                ? 'bg-[#FC6D41] text-white hover:bg-[#e55e35] cursor-pointer'
                                : 'bg-gray-100 text-gray-300 cursor-default'
                            }`}
                          >
                            {seoSetupMode ? <>Suivant <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14"/><path d="M12 5l7 7-7 7"/></svg></> : 'Enregistrer'}
                          </button>
                        )
                      })()}
                    </div>
                  ) : (
                    <div className="flex flex-col h-full" style={{ animation: 'tab-fade-in 0.2s ease' }}>
                      <p className="text-[12px] text-gray-400 mb-3">Déplacez les thématiques entre les deux colonnes pour choisir vos sujets d'articles.</p>
                      <div className="grid grid-cols-2 gap-3">
                        {/* Write articles for */}
                        <div>
                          <span className="text-[11px] font-semibold text-green-600 mb-1.5 block">Écrire des articles pour</span>
                          <div className="flex flex-col gap-0.5">
                            {allSpecialties.filter(s => checkedSpecs.includes(s.id)).map(spec => (
                              <button
                                key={spec.id}
                                onClick={() => { if (checkedSpecs.length <= 1) return; setCheckedSpecs(prev => prev.filter(id => id !== spec.id)) }}
                                className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all bg-green-50 hover:bg-green-100 ${checkedSpecs.length <= 1 ? 'opacity-60 cursor-default' : 'cursor-pointer'}`}
                              >
                                <span className="text-sm shrink-0">{spec.icon}</span>
                                <span className="text-[12px] font-medium text-color-1 flex-1">{spec.title}</span>
                                {checkedSpecs.length > 1 && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>}
                              </button>
                            ))}
                          </div>
                        </div>
                        {/* Don't write articles for */}
                        <div>
                          <span className="text-[11px] font-semibold text-gray-400 mb-1.5 block">Ne pas écrire pour</span>
                          <div className="flex flex-col gap-0.5">
                            {allSpecialties.filter(s => !checkedSpecs.includes(s.id)).map(spec => (
                              <button
                                key={spec.id}
                                onClick={() => setCheckedSpecs(prev => [...prev, spec.id])}
                                className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer bg-gray-50 hover:bg-gray-100 opacity-50 hover:opacity-80"
                              >
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
                      {/* Footer pinned to bottom */}
                      <div className="mt-auto pt-3 shrink-0">
                        <div className="pt-3 border-t border-gray-100 flex items-center gap-2 px-1 mb-3">
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                          <p className="text-[11px] text-gray-400 leading-snug">
                            La répartition choisie sera prise en compte pour la génération des articles à partir du <span className="font-semibold text-color-1">{(() => { const d = new Date(); d.setMonth(d.getMonth() + 1, 1); return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) })()}</span>.
                          </p>
                        </div>
                        {(() => {
                          const repDirty = seoSetupMode || !settingsInitial || JSON.stringify([...checkedSpecs].sort()) !== JSON.stringify([...settingsInitial.checkedSpecs].sort())
                          return (
                            <button
                              onClick={() => {
                                if (!repDirty) return
                                if (seoSetupMode) {
                                  localStorage.removeItem('seoSetupStep')
                                  const prev = JSON.parse(localStorage.getItem('completedActions') || '[]')
                                  if (!prev.includes('seo')) {
                                    const next = [...prev, 'seo']
                                    localStorage.setItem('completedActions', JSON.stringify(next))
                                    window.dispatchEvent(new Event('actionsUpdated'))
                                  }
                                }
                                setShowRedactorSettings(false)
                                setSeoSetupMode(false)
                              }}
                              className={`w-full py-2.5 rounded-xl text-[13px] font-medium flex items-center justify-center gap-2 transition-all ${
                                repDirty
                                  ? 'bg-[#FC6D41] text-white hover:bg-[#e55e35] cursor-pointer'
                                  : 'bg-gray-100 text-gray-300 cursor-default'
                              }`}
                            >
                              {seoSetupMode ? <>Terminer <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg></> : 'Enregistrer'}
                            </button>
                          )
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )
      })()}

      {/* Settings panel — rendered when account tab active */}
      {activeTab === 'account' && (
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
                  onClick={() => router.push(`/compte/${tab.id}`)}
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
                <button onClick={() => router.push('/compte/billing')} className="mt-2 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-color-1 hover:bg-white transition-colors cursor-pointer">
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
                  <button onClick={() => router.push('/parrainage')} className="relative mt-2 px-3 py-1.5 rounded-lg bg-color-2 text-white text-xs font-semibold hover:opacity-90 transition-opacity cursor-pointer">
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
                  <button onClick={() => router.push('/compte/upgrade')} className="px-6 py-2.5 rounded-full bg-color-2 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer">
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

      {/* News modal */}
      {showNewsModal !== null && news[showNewsModal] && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={() => setShowNewsModal(null)}>
          <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
          {/* Left arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowNewsModal((showNewsModal - 1 + news.length) % news.length) }}
            className="absolute left-[calc(50%-300px)] w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center cursor-pointer transition-colors shadow-md z-10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
          </button>
          <div className="relative bg-white rounded-2xl shadow-xl w-[520px] overflow-hidden" onClick={e => e.stopPropagation()} style={{ animation: 'tab-fade-in 0.15s ease-out' }}>
            {/* Header — YouTube video */}
            <div className="w-full aspect-video bg-black">
              <iframe
                src={news[showNewsModal].video}
                className="w-full h-full"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
            {/* Content */}
            <div className="p-5">
              <h3 className="text-lg font-bold text-color-1 mb-2">{news[showNewsModal].title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed mb-4">{news[showNewsModal].desc}</p>
              <div className="flex items-center justify-between">
                <button
                  onClick={() => setShowNewsModal(null)}
                  className="px-4 py-2 rounded-xl bg-color-1 text-white text-sm font-semibold hover:opacity-90 transition-opacity cursor-pointer"
                >
                  Fermer
                </button>
                {/* Dots */}
                <div className="flex items-center gap-1.5">
                  {news.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setShowNewsModal(i)}
                      className={`rounded-full transition-all cursor-pointer block ${i === showNewsModal ? 'w-5 h-[6px] bg-color-2' : 'w-[6px] h-[6px] bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
          {/* Right arrow */}
          <button
            onClick={(e) => { e.stopPropagation(); setShowNewsModal((showNewsModal + 1) % news.length) }}
            className="absolute right-[calc(50%-300px)] w-9 h-9 rounded-full bg-white/80 hover:bg-white flex items-center justify-center cursor-pointer transition-colors shadow-md z-10"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2D2D2D" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
          </button>
        </div>
      )}
    </div>
  )
}

export default HomeDashboard
