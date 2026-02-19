'use client'

import { useSearchParams } from 'next/navigation'
import SiteEditor from '@/components/site-editor/SiteEditor'

export default function EditorPage({ params }) {
  const searchParams = useSearchParams()
  const page = params.page?.[0] || 'accueil'
  const openStyle = params.page?.[1] === 'style'
  const isValidationMode = searchParams.get('mode') === 'validate'
  return <SiteEditor initialPage={page} initialOpenStyle={openStyle} initialValidationMode={isValidationMode} />
}
