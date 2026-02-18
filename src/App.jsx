import { useState } from 'react'
import OnboardingDashboard from './components/OnboardingDashboard'
import HomeDashboard from './components/HomeDashboard'
import SiteEditor from './components/site-editor/SiteEditor'
import Setup from './components/site-editor/Setup'

function App() {
  const [currentPage, setCurrentPage] = useState('onboarding')
  const [userData, setUserData] = useState({ prenom: '', profession: '', ville: '' })
  const [homeTab, setHomeTab] = useState('accueil')
  const [setupStep, setSetupStep] = useState(null)
  const [editorOpenStyle, setEditorOpenStyle] = useState(false)
  const [editorInitialPage, setEditorInitialPage] = useState(null)

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'onboarding' && (
        <OnboardingDashboard
          onComplete={(data) => {
            setUserData(data)
            setCurrentPage('home')
          }}
          onGoToDashboard={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'home' && (
        <HomeDashboard
          userData={userData}
          initialTab={homeTab}
          onGoToOnboarding={() => setCurrentPage('onboarding')}
          onGoToSiteEditor={(opts) => { setEditorOpenStyle(opts?.openStyle || false); setEditorInitialPage(opts?.page || null); setCurrentPage('site-editor') }}
          onGoToSetup={(step) => { setSetupStep(step || null); setCurrentPage('site-setup') }}
        />
      )}
      {currentPage === 'site-editor' && (
        <SiteEditor
          onGoToSetup={(step) => { setSetupStep(step || null); setCurrentPage('site-setup') }}
          onBackToDashboard={(tab) => { setHomeTab(tab || 'accueil'); setCurrentPage('home') }}
          initialOpenStyle={editorOpenStyle}
          initialPage={editorInitialPage}
        />
      )}
      {currentPage === 'site-setup' && (
        <Setup
          onBackToDashboard={(tab) => { setHomeTab(tab || 'accueil'); setCurrentPage('home') }}
          onGoToSiteEditor={() => setCurrentPage('site-editor')}
          initialStep={setupStep}
        />
      )}
    </div>
  )
}

export default App
