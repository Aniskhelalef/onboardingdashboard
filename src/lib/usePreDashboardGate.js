'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

const GATED_PATHS = ['/dashboard', '/referencement', '/parrainage', '/compte']

export function usePreDashboardGate() {
  const router = useRouter()
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const complete = localStorage.getItem('preDashboardComplete') === 'true'
    const path = window.location.pathname
    const onPreDash = path === '/pre-dashboard'
    const isGated = GATED_PATHS.some(p => path === p || path.startsWith(p + '/'))

    if (!complete && isGated) {
      router.replace('/pre-dashboard')
      return
    }
    if (complete && onPreDash) {
      router.replace('/dashboard')
      return
    }
    setReady(true)
  }, [router])

  return { ready }
}
