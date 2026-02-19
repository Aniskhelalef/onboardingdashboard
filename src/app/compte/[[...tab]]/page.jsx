'use client'

import HomeDashboard from '@/components/HomeDashboard'

export default function ComptePage({ params }) {
  const subTab = params.tab?.[0] || 'compte'
  return <HomeDashboard initialTab="account" initialSettingsTab={subTab} />
}
