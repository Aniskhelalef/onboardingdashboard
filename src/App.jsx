import { useState } from 'react'
import OnboardingDashboard from './components/OnboardingDashboard'
import HomeDashboard from './components/HomeDashboard'

function App() {
  const [currentPage, setCurrentPage] = useState('onboarding')
  const [userData, setUserData] = useState({ prenom: '', profession: '', ville: '' })

  return (
    <div className="min-h-screen bg-white">
      {currentPage === 'onboarding' ? (
        <OnboardingDashboard
          onComplete={(data) => {
            setUserData(data)
            setCurrentPage('home')
          }}
        />
      ) : (
        <HomeDashboard
          userData={userData}
          onGoToOnboarding={() => setCurrentPage('onboarding')}
        />
      )}
    </div>
  )
}

export default App
