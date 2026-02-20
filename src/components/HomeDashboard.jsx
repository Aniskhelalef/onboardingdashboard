import { useState, useRef, useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
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
  const [showRepartition, setShowRepartition] = useState(false)
  const [seoSearchQuery, setSeoSearchQuery] = useState('')
  const [seoFilterStatus, setSeoFilterStatus] = useState(null) // null | 'published' | 'unpublished'
  const [seoFilterSpec, setSeoFilterSpec] = useState(null) // null = all, or specialty id
  const [showFilterMenu, setShowFilterMenu] = useState(false)
  const filterMenuRef = useRef(null)
  const [showPexels, setShowPexels] = useState(false)
  // Article modal states removed — Voir/Modifier/Créer navigate to SiteEditor
  const [showParrainageVideo, setShowParrainageVideo] = useState(false)
  const [showNewsModal, setShowNewsModal] = useState(null) // index of news item or null




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

  const news = [
    { title: 'Offre parrainage — Invitez un confrère, gagnez 2 mois', desc: 'Partagez votre lien de parrainage et recevez jusqu\'à 2 mois offerts pour chaque inscription.', date: '15 fév.', tag: 'Offre', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Boostoncab — Boostez votre visibilité avec Google Ads', desc: 'Nouveau partenariat avec Boostoncab : lancez vos campagnes Google Ads en quelques clics et attirez plus de patients.', date: '12 fév.', tag: 'Partenaire', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Génération d\'articles V2 — Plus rapide, plus pertinent', desc: 'Vos articles sont désormais générés avec un style plus naturel et adapté à votre spécialité.', date: '11 fév.', tag: 'Nouveau', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Tableau de bord repensé', desc: 'Visualisez vos statistiques clés en un coup d\'œil avec le nouveau design.', date: '3 fév.', tag: 'Mise à jour', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
    { title: 'Collecte d\'avis automatisée', desc: 'Envoyez automatiquement des demandes d\'avis à vos patients après chaque séance.', date: '20 jan.', tag: 'Nouveau', video: 'https://www.youtube.com/embed/dQw4w9WgXcQ' },
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

  // Close filter menu on outside click
  useEffect(() => {
    if (!showFilterMenu) return
    const handler = (e) => {
      if (filterMenuRef.current && !filterMenuRef.current.contains(e.target)) setShowFilterMenu(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [showFilterMenu])

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
        <div key="referencement" className="grid grid-cols-[2fr_1fr] grid-rows-[1fr_1fr] gap-3 w-full h-full relative" style={{ animation: 'tab-fade-in 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>

          {/* Top-left — Article calendar */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative overflow-hidden col-start-1 row-start-1">
            {/* Header — z-30 so toggle stays above pause overlay, but under tour overlay in state 0 */}
            <div className="flex items-center gap-2.5 shrink-0 relative z-30">
              <h2 className={`text-base font-bold shrink-0 transition-colors ${autoPublish ? 'text-color-1' : 'text-white'}`}>Articles</h2>

              {/* On/Off toggle pill */}
              <button
                onClick={() => setAutoPublish(!autoPublish)}
                className={`relative w-9 h-5 rounded-full transition-colors duration-200 cursor-pointer shrink-0 ${autoPublish ? 'bg-green-400' : 'bg-red-400'}`}
              >
                <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-200 ${autoPublish ? 'left-[18px]' : 'left-0.5'}`} />
              </button>

              {autoPublish && <>
              {/* Active filter tags */}
              {seoFilterStatus && (
                <span className="inline-flex items-center gap-1 pl-2 pr-0.5 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-color-1">
                  <span className={`w-1.5 h-1.5 rounded-full ${seoFilterStatus === 'published' ? 'bg-green-400' : 'bg-orange-400'}`} />
                  {seoFilterStatus === 'published' ? 'Publiés' : 'Programmés'}
                  <button onClick={() => setSeoFilterStatus(null)} className="w-4 h-4 rounded hover:bg-gray-300 flex items-center justify-center cursor-pointer transition-colors">
                    <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                </span>
              )}
              {seoFilterSpec && (() => {
                const spec = allSpecialties.find(s => s.id === seoFilterSpec)
                return spec ? (
                  <span className="inline-flex items-center gap-1 pl-2 pr-0.5 py-0.5 rounded-md bg-gray-100 text-[11px] font-medium text-color-1">
                    {spec.icon} {spec.title}
                    <button onClick={() => setSeoFilterSpec(null)} className="w-4 h-4 rounded hover:bg-gray-300 flex items-center justify-center cursor-pointer transition-colors">
                      <svg width="7" height="7" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                    </button>
                  </span>
                ) : null
              })()}

              {/* Spacer */}
              <div className="flex-1" />

              {/* Search — flexible width */}
              <div className="relative flex-1 min-w-[140px] max-w-[320px]">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2" strokeLinecap="round" className="absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
                <input type="text" value={seoSearchQuery} onChange={e => setSeoSearchQuery(e.target.value)} placeholder="Rechercher..." className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-gray-100 text-xs text-color-1 placeholder:text-gray-400 outline-none focus:ring-1 focus:ring-color-2/30 transition-all" />
                {seoSearchQuery && (
                  <button onClick={() => setSeoSearchQuery('')} className="absolute right-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full hover:bg-gray-200 flex items-center justify-center cursor-pointer transition-colors">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="#9CA3AF" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
                  </button>
                )}
              </div>

              {/* Filter button — right side */}
              <div ref={filterMenuRef} className="relative">
                <button
                  onClick={() => setShowFilterMenu(!showFilterMenu)}
                  className={`h-8 px-2.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer text-sm ${
                    showFilterMenu || seoFilterStatus || seoFilterSpec ? 'bg-gray-200 text-color-1 font-medium' : 'text-gray-400 hover:bg-gray-100 hover:text-gray-600'
                  }`}
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/></svg>
                  <span>Filtrer</span>
                </button>
                {showFilterMenu && (
                  <div className="absolute top-full right-0 mt-1 bg-white rounded-xl shadow-lg border border-gray-200 py-1.5 z-20 min-w-[180px]">
                    <p className="px-3 py-1 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Statut</p>
                    {[
                      { key: 'published', label: 'Publiés', dot: 'bg-green-400' },
                      { key: 'unpublished', label: 'Programmés', dot: 'bg-orange-400' },
                    ].map(f => (
                      <button
                        key={f.key}
                        onClick={() => { setSeoFilterStatus(seoFilterStatus === f.key ? null : f.key); setShowFilterMenu(false) }}
                        className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors cursor-pointer ${
                          seoFilterStatus === f.key ? 'text-color-1 font-semibold bg-gray-50' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${f.dot}`} />
                        {f.label}
                        {seoFilterStatus === f.key && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="ml-auto"><path d="M20 6L9 17l-5-5"/></svg>}
                      </button>
                    ))}
                    <div className="h-px bg-gray-100 my-1" />
                    <p className="px-3 py-1 text-[10px] font-semibold text-gray-300 uppercase tracking-wider">Spécialité</p>
                    {allSpecialties.filter(s => checkedSpecs.includes(s.id)).map(spec => (
                      <button
                        key={spec.id}
                        onClick={() => { setSeoFilterSpec(seoFilterSpec === spec.id ? null : spec.id); setShowFilterMenu(false) }}
                        className={`flex items-center gap-2 w-full px-3 py-1.5 text-sm text-left transition-colors cursor-pointer ${
                          seoFilterSpec === spec.id ? 'text-color-1 font-semibold bg-gray-50' : 'text-gray-600 hover:bg-gray-50'
                        }`}
                      >
                        <span className="text-xs">{spec.icon}</span>
                        {spec.title}
                        {seoFilterSpec === spec.id && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" className="ml-auto"><path d="M20 6L9 17l-5-5"/></svg>}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              </>}
            </div>

            {/* Cards — search results or Hier/Aujourd'hui/Demain */}
            <div className="flex flex-col mt-2 flex-1 min-h-0 transition-all rounded-xl">
              {(() => {
                const q = seoSearchQuery.toLowerCase().trim()
                const todayIdx = viewData.days.findIndex(d => d.isToday)
                const hasFilters = q || seoFilterStatus !== null || seoFilterSpec !== null

                const matchesFilters = (d) => {
                  if (seoFilterStatus === 'published' && !d.published) return false
                  if (seoFilterStatus === 'unpublished' && !(d.programmed || d.preProgrammed)) return false
                  if (seoFilterSpec && d.specId !== seoFilterSpec) return false
                  if (q) {
                    const title = (customArticleTitles[d.index] || d.articleTitle || '').toLowerCase()
                    const spec = (d.title || '').toLowerCase()
                    if (!title.includes(q) && !spec.includes(q)) return false
                  }
                  return true
                }

                // If searching or filtering, show filtered list; otherwise show trio
                let displayItems
                if (hasFilters) {
                  displayItems = viewData.days
                    .filter(matchesFilters)
                    .map(item => {
                      const diff = item.index - todayIdx
                      const label = diff === -1 ? 'Hier' : diff === 0 ? "Aujourd'hui" : diff === 1 ? 'Demain' : `${item.dayNum} ${item.monthShort}`
                      return { item, label }
                    })
                } else {
                  displayItems = [
                    { item: viewData.days[todayIdx - 1], label: 'Hier' },
                    { item: viewData.days[todayIdx], label: "Aujourd'hui" },
                    { item: viewData.days[todayIdx + 1], label: 'Demain' },
                  ].filter(d => d.item)
                }

                if (hasFilters && displayItems.length === 0) {
                  return (
                    <div className="flex-1 flex items-center justify-center text-gray-300">
                      <p className="text-sm">{q ? `Aucun article trouvé pour « ${seoSearchQuery} »` : 'Aucun article trouvé'}</p>
                    </div>
                  )
                }

                // Filtered/search results — scrollable list
                if (hasFilters) {
                  return (
                    <div className="flex-1 overflow-y-auto flex flex-col gap-1.5 min-h-0">
                      {displayItems.map(({ item, label }) => {
                        const isSelected = selectedDay === item.index
                        const displayImage = customArticleImages[item.index] || item.articleImage
                        const displayTitle = customArticleTitles[item.index] || item.articleTitle
                        return (
                          <div
                            key={item.index}
                            onClick={() => setSelectedDay(item.index)}
                            className={`flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all shrink-0 ${isSelected ? 'bg-gray-100 border-l-2 border-color-2' : 'hover:bg-gray-50'}`}
                          >
                            {displayImage && <img src={displayImage} alt="" className="w-12 h-12 rounded-lg object-cover shrink-0" />}
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-semibold text-color-1 truncate">{displayTitle}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-xs text-gray-400">{item.icon} {item.title}</span>
                                <span className="text-xs text-gray-300">·</span>
                                <span className="text-xs text-gray-400">{label}</span>
                                {item.published && <span className="w-1.5 h-1.5 rounded-full bg-green-400" />}
                                {item.programmed && <span className="w-1.5 h-1.5 rounded-full bg-orange-400" />}
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                }

                // Default — 4×7 calendar board
                const gridDays = viewData.days.slice(0, 28)
                const dayLabels = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
                const rangeStart = `${gridDays[0].dayNum} ${gridDays[0].monthShort}`
                const rangeEnd = `${gridDays[27].dayNum} ${gridDays[27].monthShort}`

                return (
                  <div className="flex-1 min-h-0 flex flex-col">
                    {/* Week navigation */}
                    <div className="flex items-center justify-between mb-2">
                      <button
                        onClick={() => viewData.hasPrev && setWeekOffset(weekOffset - 1)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${viewData.hasPrev ? 'text-gray-400 hover:bg-gray-100 hover:text-color-1' : 'text-gray-200 cursor-not-allowed'}`}
                        disabled={!viewData.hasPrev}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
                      </button>
                      <span className="text-xs font-medium text-gray-400">{rangeStart} — {rangeEnd}</span>
                      <button
                        onClick={() => viewData.hasNext && setWeekOffset(weekOffset + 1)}
                        className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${viewData.hasNext ? 'text-gray-400 hover:bg-gray-100 hover:text-color-1' : 'text-gray-200 cursor-not-allowed'}`}
                        disabled={!viewData.hasNext}
                      >
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
                      </button>
                    </div>
                    {/* Day-of-week headers */}
                    <div className="grid grid-cols-7 gap-1.5 mb-1">
                      {dayLabels.map(d => (
                        <div key={d} className="text-center text-[10px] font-medium text-gray-300 uppercase">{d}</div>
                      ))}
                    </div>
                    {/* 4×7 grid */}
                    <div className="grid grid-cols-7 gap-1.5 flex-1 min-h-0">
                      {gridDays.map((item) => {
                        const isSelected = selectedDay === item.index
                        return (
                          <div
                            key={item.index}
                            onClick={() => setSelectedDay(item.index)}
                            className={`rounded-xl flex flex-col items-center justify-center cursor-pointer transition-all ${
                              item.published ? 'bg-[#FC6D41] text-white' :
                              item.programmed ? 'bg-[#FC6D41]/15 text-[#FC6D41]' :
                              'bg-gray-50 text-gray-300'
                            } ${isSelected ? 'ring-2 ring-[#FC6D41] ring-offset-1' : ''} ${item.isToday && !isSelected ? 'ring-2 ring-[#2D2D2D]' : ''}`}
                          >
                            <span className="text-xs font-bold">{item.dayNum}</span>
                            {item.icon && <span className="text-[10px] mt-0.5 leading-none">{item.icon}</span>}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })()}
            </div>
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

          {/* Bottom-left — Cumulative Views Chart (rank-chart style) */}
          <div className="bg-white border-2 border-gray-200 rounded-2xl p-5 flex flex-col relative overflow-hidden col-start-1 row-start-2">
            {/* Header */}
            <div className="flex items-center justify-between shrink-0">
              <div>
                <h2 className="text-base font-bold text-color-1">Vues cumulées</h2>
                <p className="text-sm text-gray-400 mt-0.5">Évolution du trafic sur vos articles SEO</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round"><path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>
                    <span className="text-sm text-gray-500">Articles publiés</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-color-1">{totalStats.total}</span>
                  </div>
                </div>
                <div className="bg-gray-50 rounded-xl px-4 py-2.5">
                  <div className="flex items-center gap-2 mb-1">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#FC6D41" strokeWidth="2" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    <span className="text-sm text-gray-500">Total actuel</span>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-xl font-bold text-color-1">{(slicedArticleVisits[slicedArticleVisits.length - 1] || 0).toLocaleString('fr-FR')}</span>
                    {(() => {
                      const current = slicedArticleVisits[slicedArticleVisits.length - 1] || 0
                      const first = slicedArticleVisits[0] || 0
                      const pctChange = first > 0 ? Math.round(((current - first) / first) * 100) : 0
                      return pctChange !== 0 && (
                        <span className={`text-sm font-semibold px-1.5 py-0.5 rounded-full ${pctChange > 0 ? 'text-green-500 bg-green-50' : 'text-red-500 bg-red-50'}`}>{pctChange > 0 ? '↑' : '↓'} {Math.abs(pctChange)}%</span>
                      )
                    })()}
                  </div>
                </div>
              </div>
            </div>

            {/* Chart */}
            <div className="flex-1 mt-3 min-h-0 flex">
              {/* Y-axis labels */}
              <div className="flex flex-col justify-between pr-2 text-sm text-gray-400 shrink-0 text-right">
                {(() => {
                  const max = Math.ceil(articleVisitsMax)
                  const steps = [max, Math.round(max * 0.75), Math.round(max * 0.5), Math.round(max * 0.25), 0]
                  return steps.map((v, i) => <span key={i}>{v >= 1000 ? `${(v / 1000).toFixed(1)}k` : v}</span>)
                })()}
              </div>

              <div className="flex-1 flex flex-col min-w-0">
                <div
                  className="flex-1 relative min-h-0"
                  onMouseMove={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect()
                    const x = (e.clientX - rect.left) / rect.width
                    const idx = Math.round(x * (slicedArticleVisits.length - 1))
                    setHoveredSeoVisit(Math.max(0, Math.min(idx, slicedArticleVisits.length - 1)))
                  }}
                  onMouseLeave={() => setHoveredSeoVisit(null)}
                >
                  {/* Grid lines */}
                  {[0, 25, 50, 75, 100].map((pct) => (
                    <div key={pct} className="absolute left-0 right-0 border-t border-gray-100" style={{ top: `${pct}%` }} />
                  ))}
                  {/* SVG curve */}
                  <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full">
                    <defs>
                      <linearGradient id="seoVisitGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#FC6D41" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#FC6D41" stopOpacity="0.01" />
                      </linearGradient>
                    </defs>
                    <path d={toPath(slicedArticleVisits, articleVisitsMax, true)} fill="url(#seoVisitGrad)" />
                    <path d={toPath(slicedArticleVisits, articleVisitsMax, false)} fill="none" stroke="#FC6D41" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
                  </svg>

                  {/* Hover tooltip */}
                  {hoveredSeoVisit !== null && (() => {
                    const hx = (hoveredSeoVisit / (slicedArticleVisits.length - 1)) * 100
                    const hy = 100 - (slicedArticleVisits[hoveredSeoVisit] / articleVisitsMax) * 100
                    return <>
                      <div className="absolute w-px pointer-events-none" style={{ left: `${hx}%`, top: 0, bottom: 0, backgroundColor: '#FC6D41', opacity: 0.2 }} />
                      <div className="absolute pointer-events-none" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -100%)' }}>
                        <div className="px-2 py-0.5 rounded-md border border-color-2 bg-white text-sm font-semibold text-color-2 whitespace-nowrap mb-1 mx-auto w-fit shadow-sm">
                          {slicedArticleVisits[hoveredSeoVisit].toLocaleString('fr-FR')} <span className="text-gray-400 font-normal">{slicedMonths[hoveredSeoVisit]}</span>
                        </div>
                      </div>
                      <div className="absolute w-2.5 h-2.5 rounded-full pointer-events-none border-2 border-white bg-color-2 shadow-sm" style={{ left: `${hx}%`, top: `${hy}%`, transform: 'translate(-50%, -50%)' }} />
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

          {/* Right column — Article + SEO panel */}
          <div className="flex flex-col col-start-2 row-start-1 row-span-2 min-w-0 overflow-hidden">
            <div className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden">
              {(() => {
                const item = selectedDay !== null ? viewData.days[selectedDay] : null
                if (!item) return (
                  <div className="flex-1 flex items-center justify-center">
                    <p className="text-sm text-gray-300">Sélectionnez un article</p>
                  </div>
                )
                const content = articleContentMap[item.title] || articleContentMap['Douleurs dorsales']
                if (item.published || item.programmed) {
                  const displayImage = customArticleImages[item.index] || item.articleImage
                  const displayTitle = customArticleTitles[item.index] || item.articleTitle
                  return (
                    <div className="flex-1 flex flex-col min-h-0">
                      {/* Image — fixed */}
                      <button
                        className="relative h-28 shrink-0 rounded-xl overflow-hidden cursor-pointer group text-left transition-all"
                        onClick={() => { setPexelsSearch(''); setShowPexels(true) }}
                      >
                        <img src={displayImage} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                            <span className="text-white text-sm font-medium">Changer</span>
                          </div>
                        </div>
                        <div className="absolute top-2 left-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/90 text-color-1 text-sm font-semibold backdrop-blur-sm">
                            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${item.published ? 'bg-green-500' : 'bg-color-2'}`} />
                            {item.published ? `Publié le ${item.dayNum} ${item.monthShort}` : `Programmé le ${item.dayNum} ${item.monthShort}`}
                          </span>
                        </div>
                      </button>
                      {/* Content area */}
                      <div className="flex-1 min-h-0 overflow-y-auto mt-1.5 flex flex-col justify-between">
                        {/* Title + meta */}
                        <div>
                          <input
                            type="text"
                            value={displayTitle}
                            onChange={e => setCustomArticleTitles(prev => ({ ...prev, [item.index]: e.target.value }))}
                            className="w-full text-sm font-bold text-color-1 bg-transparent outline-none border-b border-transparent hover:border-gray-200 focus:border-color-2 transition-colors"
                          />
                          <div className="flex items-center gap-2 mt-1 text-sm text-gray-400">
                            <span>{item.icon} {item.title}</span>
                            <span>·</span>
                            <span>{item.dayNum} {item.monthShort}</span>
                            <span>·</span>
                            <span>{content.wordCount} mots</span>
                          </div>
                        </div>
                        {/* SEO score ring + individual scores */}
                        <div className="flex items-center gap-3 px-2.5 py-1.5 rounded-xl bg-gray-50 transition-all">
                          <div className="relative w-10 h-10 shrink-0">
                            <svg viewBox="0 0 36 36" className="w-full h-full -rotate-90">
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#E5E7EB" strokeWidth="3" />
                              <circle cx="18" cy="18" r="15.5" fill="none" stroke="#22C55E" strokeWidth="3" strokeDasharray={`${item.seo.global * 0.975} 100`} strokeLinecap="round" />
                            </svg>
                            <div className="absolute inset-0 flex items-center justify-center">
                              <span className="text-sm font-bold text-green-600">{item.seo.global}</span>
                            </div>
                          </div>
                          <div className="flex-1 flex flex-col gap-1 min-w-0">
                            {[
                              { label: 'Régularité', score: item.seo.regularite },
                              { label: 'Balises', score: item.seo.balises },
                              { label: 'Meta', score: item.seo.meta },
                              { label: 'Mots-clés', score: item.seo.motsCles },
                            ].map(s => (
                              <div key={s.label} className="flex items-center gap-2">
                                <span className="text-xs text-gray-400 shrink-0 whitespace-nowrap">{s.label}</span>
                                <div className="flex-1 h-1.5 rounded-full bg-gray-200"><div className="h-full rounded-full bg-green-400" style={{ width: `${s.score}%` }} /></div>
                                <span className="text-xs font-semibold text-green-600 shrink-0">{s.score}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Keywords */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Mots-clés ciblés</p>
                          <div className="flex flex-wrap gap-1.5">
                            {content.keywords.map((kw, ki) => (
                              <span key={ki} className="px-2 py-0.5 rounded bg-color-2/10 text-sm font-medium text-color-2">{kw}</span>
                            ))}
                          </div>
                        </div>
                        {/* SEO checklist */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Optimisations</p>
                          <div className="flex flex-col gap-1">
                            {[
                              { ok: true, text: 'Mot-clé dans le titre' },
                              { ok: true, text: 'Meta description < 160 car.' },
                              { ok: true, text: 'Balises H2 structurées' },
                              { ok: true, text: `${content.wordCount} mots (min. 300)` },
                              { ok: true, text: 'Image avec alt renseigné' },
                            ].map((c, ci) => (
                              <div key={ci} className="flex items-center gap-1.5">
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#22C55E" strokeWidth="3" strokeLinecap="round"><path d="M20 6L9 17l-5-5"/></svg>
                                <span className="text-xs text-gray-500">{c.text}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                        {/* Google preview */}
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wide font-medium mb-1">Aperçu Google</p>
                          <div className="rounded-lg border border-gray-200 p-2.5 bg-white">
                            <p className="text-sm text-blue-700 font-medium truncate">{displayTitle}</p>
                            <p className="text-xs text-green-700 truncate">theralys.fr/blog/{(displayTitle || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}</p>
                            <p className="text-xs text-gray-500 line-clamp-2 leading-tight mt-0.5">{content.metaDesc}</p>
                          </div>
                        </div>
                      </div>
                      {/* Actions — pinned bottom */}
                      <div className="flex gap-2 shrink-0 mt-1.5 transition-all rounded-xl">
                        <button onClick={() => router.push(`/editor/article-${item.specId}`)} className="flex-1 py-2 rounded-xl bg-gray-50 text-sm font-medium text-color-1 hover:bg-gray-100 transition-colors cursor-pointer border border-gray-200">Modifier</button>
                        <button onClick={() => router.push(`/editor/article-${item.specId}`)} className="flex-1 py-2 rounded-xl bg-color-1 text-sm font-medium text-white hover:bg-color-1/90 transition-colors cursor-pointer">Voir</button>
                      </div>
                    </div>
                  )
                }
                {/* Pre-programmed article */}
                const preDisplayImage = customArticleImages[item.index]
                const preDisplayTitle = customArticleTitles[item.index] || item.articleTitle || ''
                return (
                  <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
                    <button
                      className="relative rounded-xl overflow-hidden cursor-pointer group text-left shrink-0"
                      style={{ height: preDisplayImage ? 100 : 70 }}
                      onClick={() => { setPexelsSearch(''); setShowPexels(true) }}
                    >
                      {preDisplayImage ? (
                        <>
                          <img src={preDisplayImage} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300" />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors" />
                        </>
                      ) : (
                        <div className="absolute inset-0 bg-gray-50 flex items-center justify-center group-hover:bg-gray-100 transition-colors">
                          <span className="text-2xl">{item.icon}</span>
                        </div>
                      )}
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>
                          <span className="text-white text-[11px] font-medium">Choisir une image</span>
                        </div>
                      </div>
                    </button>
                    <div className="mt-2 flex flex-col gap-1 shrink-0">
                      <input
                        type="text"
                        value={preDisplayTitle}
                        onChange={e => setCustomArticleTitles(prev => ({ ...prev, [item.index]: e.target.value }))}
                        placeholder="Titre de l'article..."
                        className="w-full text-sm font-bold text-color-1 bg-transparent outline-none border-b border-transparent hover:border-gray-200 focus:border-color-2 transition-colors placeholder:text-gray-300 placeholder:font-normal"
                      />
                      <div className="flex items-center gap-2 text-sm text-gray-400">
                        <span>{item.icon} {item.title}</span>
                        <span>·</span>
                        <span>{item.dayNum} {item.monthShort}</span>
                      </div>
                    </div>
                    <div className="flex-1 flex items-center justify-center">
                      <div className="text-center text-gray-400">
                        <span className="inline-block animate-spin text-lg" style={{ animationDuration: '3s' }}>&#9203;</span>
                        <p className="text-sm font-medium mt-1">Rédaction dans {item.daysFromToday} j</p>
                      </div>
                    </div>
                    <button
                      onClick={() => { const specId = item.specId || '1'; router.push(`/editor/article-${specId}`) }}
                      className="w-full py-2 rounded-xl bg-color-2/10 text-sm font-medium text-color-2 hover:bg-color-2/20 transition-colors cursor-pointer shrink-0"
                    >Pré-visualiser</button>
                  </div>
                )
              })()}
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
              <h2 className="text-base font-bold text-color-1 mb-2.5">Actions</h2>
              <div className="flex flex-col gap-1.5">
                {[
                  { id: 'setup', label: 'Paramétrer les options du site', desc: 'Configurer les informations et préférences', requires: null, href: '/setup',
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> },
                  { id: 'publish', label: 'Valider et publier votre site', desc: 'Vérifier vos pages, choisir un domaine et publier', requires: 'setup', href: '/editor/accueil?mode=validate',
                    icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg> },
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

            {/* Articles carousel */}
            <div className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between mb-2 shrink-0">
                <h2 className="text-base font-bold text-color-1">Articles</h2>
                <div className="flex items-center gap-1.5 -mr-0.5">
                  {articles.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setArticleIdx(i)}
                      className={`rounded-full transition-all cursor-pointer block ${i === articleIdx ? 'w-4 h-[6px] bg-color-2' : 'w-[6px] h-[6px] bg-gray-300 hover:bg-gray-400'}`}
                    />
                  ))}
                </div>
              </div>
              {/* Image area — clickable → navigates to referencement */}
              <button onClick={() => navigateToArticle(articles[articleIdx])} className="relative flex-1 min-h-0 rounded-xl overflow-hidden cursor-pointer group text-left">
                <img src={articles[articleIdx].img} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-300" />
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
            </div>

            {/* Quoi de neuf — carousel like Articles */}
            <div className="flex-1 bg-white border-2 border-gray-200 rounded-2xl p-3.5 flex flex-col min-h-0 relative overflow-hidden">
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
