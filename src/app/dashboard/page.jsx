'use client'

import HomeDashboard from '@/components/HomeDashboard'
import { usePreDashboardGate } from '@/lib/usePreDashboardGate'

export default function DashboardPage() {
  const { ready } = usePreDashboardGate()
  if (!ready) return null
  return <HomeDashboard initialTab="accueil" />
}
