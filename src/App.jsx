import { useState } from 'react'
import OnboardingDashboard from './components/OnboardingDashboard'
import HomeDashboard from './components/HomeDashboard'
import SiteEditor from './components/site-editor/SiteEditor'
import Setup from './components/site-editor/Setup'

function App() {
  const [currentPage, setCurrentPage] = useState('onboarding')
  const [userData, setUserData] = useState({ prenom: '', profession: '', ville: '' })

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
          onGoToOnboarding={() => setCurrentPage('onboarding')}
          onGoToSiteEditor={() => setCurrentPage('site-editor')}
        />
      )}
      {currentPage === 'site-editor' && (
        <SiteEditor
          onGoToSetup={() => setCurrentPage('site-setup')}
          onBackToDashboard={() => setCurrentPage('home')}
        />
      )}
      {currentPage === 'site-setup' && (
        <Setup
          onBackToEditor={() => setCurrentPage('site-editor')}
        />
      )}
    </div>
  )
}

export default App
