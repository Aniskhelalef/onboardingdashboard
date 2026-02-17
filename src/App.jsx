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
          onGoToSiteEditor={() => setCurrentPage('site-editor')}
          onGoToSetup={(step) => { setSetupStep(step || null); setCurrentPage('site-setup') }}
        />
      )}
      {currentPage === 'site-editor' && (
        <SiteEditor
          onGoToSetup={(step) => { setSetupStep(step || null); setCurrentPage('site-setup') }}
          onBackToDashboard={(tab) => { setHomeTab(tab || 'accueil'); setCurrentPage('home') }}
        />
      )}
      {currentPage === 'site-setup' && (
        <Setup
          onBackToEditor={() => setCurrentPage('site-editor')}
          onBackToDashboard={() => setCurrentPage('home')}
          initialStep={setupStep}
        />
      )}
    </div>
  )
}

export default App
