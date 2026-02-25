'use client'

import { useState } from 'react'

export default function TestOnboard() {
  const [url, setUrl] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [step, setStep] = useState(null) // null | 'token' | 'verifying' | 'done'

  const getToken = async () => {
    setLoading(true)
    setResult(null)
    try {
      const res = await fetch('/api/therapist/onboard-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl: url.trim() }),
      })
      const data = await res.json()
      setResult(data)
      if (data.ok) setStep('token')
    } catch (err) {
      setResult({ ok: false, error: err.message })
    }
    setLoading(false)
  }

  const verify = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/therapist/onboard-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ siteUrl: url.trim(), fileReady: true }),
      })
      const data = await res.json()
      setResult(data)
      if (data.ok) setStep('done')
    } catch (err) {
      setResult({ ok: false, error: err.message })
    }
    setLoading(false)
  }

  const checkFile = async () => {
    if (!result?.fileName) return
    const siteUrl = url.trim().endsWith('/') ? url.trim() : url.trim() + '/'
    try {
      const res = await fetch(siteUrl + result.fileName, { mode: 'no-cors' })
      alert(res.ok ? 'Fichier accessible !' : `Status: ${res.status} — le fichier n'est pas encore servi`)
    } catch {
      alert('Impossible de vérifier (CORS). Teste manuellement dans ton navigateur.')
    }
  }

  return (
    <div style={{ maxWidth: 600, margin: '60px auto', fontFamily: 'system-ui' }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Test Onboarding Search Console</h1>
      <p style={{ color: '#888', fontSize: 14, marginBottom: 24 }}>
        Entre l'URL d'un site client pour lancer le pipeline de vérification.
      </p>

      {/* Step 1: Enter URL */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <input
          type="url"
          placeholder="https://mon-site-client.fr"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={step === 'token'}
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 10, border: '1px solid #ddd',
            fontSize: 14, outline: 'none',
          }}
        />
        {!step && (
          <button
            onClick={getToken}
            disabled={loading || !url.trim()}
            style={{
              padding: '10px 20px', borderRadius: 10, border: 'none',
              background: '#22C55E', color: '#fff', fontWeight: 600, fontSize: 14,
              cursor: loading ? 'wait' : 'pointer', opacity: loading || !url.trim() ? 0.5 : 1,
            }}
          >
            {loading ? '...' : '1. Obtenir le token'}
          </button>
        )}
      </div>

      {/* Step 1 result: show token */}
      {step === 'token' && result?.ok && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 600, marginBottom: 8 }}>Fichier de vérification :</p>
          <code style={{ display: 'block', background: '#fff', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 8 }}>
            Nom : {result.fileName}
          </code>
          <code style={{ display: 'block', background: '#fff', padding: 10, borderRadius: 8, fontSize: 13, marginBottom: 12 }}>
            Contenu : {result.fileContent}
          </code>
          <p style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
            Place ce fichier à la racine du site : <strong>{url.trim()}/{result.fileName}</strong>
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={checkFile}
              style={{
                padding: '8px 16px', borderRadius: 8, border: '1px solid #ddd',
                background: '#fff', fontSize: 13, cursor: 'pointer',
              }}
            >
              Vérifier le fichier
            </button>
            <button
              onClick={verify}
              disabled={loading}
              style={{
                padding: '8px 16px', borderRadius: 8, border: 'none',
                background: '#22C55E', color: '#fff', fontWeight: 600, fontSize: 13,
                cursor: loading ? 'wait' : 'pointer', opacity: loading ? 0.5 : 1,
              }}
            >
              {loading ? 'Vérification...' : '2. Vérifier + Ajouter à SC'}
            </button>
          </div>
        </div>
      )}

      {/* Step 2 done */}
      {step === 'done' && result?.ok && (
        <div style={{ background: '#F0FDF4', border: '1px solid #BBF7D0', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 600, color: '#16A34A', fontSize: 16 }}>
            Site vérifié et ajouté à Search Console !
          </p>
          <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>
            Les données commenceront à remonter dans 24-48h.
          </p>
        </div>
      )}

      {/* Error */}
      {result && !result.ok && (
        <div style={{ background: '#FEF2F2', border: '1px solid #FECACA', borderRadius: 12, padding: 16, marginBottom: 16 }}>
          <p style={{ fontWeight: 600, color: '#DC2626' }}>Erreur</p>
          <p style={{ fontSize: 13, color: '#666', marginTop: 4 }}>{result.error}</p>
        </div>
      )}

      {/* Reset */}
      {step && (
        <button
          onClick={() => { setStep(null); setResult(null); setUrl('') }}
          style={{ fontSize: 13, color: '#888', background: 'none', border: 'none', cursor: 'pointer', textDecoration: 'underline' }}
        >
          Recommencer
        </button>
      )}

      {/* Raw JSON */}
      {result && (
        <details style={{ marginTop: 16 }}>
          <summary style={{ fontSize: 12, color: '#aaa', cursor: 'pointer' }}>Réponse API brute</summary>
          <pre style={{ background: '#f5f5f5', padding: 12, borderRadius: 8, fontSize: 11, overflow: 'auto', marginTop: 8 }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </details>
      )}
    </div>
  )
}
