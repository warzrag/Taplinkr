'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'

export default function TestSignIn() {
  const [email, setEmail] = useState('admin@taplinkr.com')
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus('Connexion en cours...')

    try {
      console.log('🔐 Test signin started')

      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      })

      console.log('📊 Result:', result)

      if (result?.error) {
        setStatus(`❌ Erreur: ${result.error}`)
      } else if (result?.ok) {
        setStatus('✅ Connexion réussie! Redirection...')
        window.location.href = '/dashboard'
      } else {
        setStatus(`⚠️ Résultat inattendu: ${JSON.stringify(result)}`)
      }
    } catch (error) {
      console.error('💥 Error:', error)
      setStatus(`💥 Exception: ${error}`)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ padding: '40px', maxWidth: '400px', margin: '0 auto', fontFamily: 'system-ui' }}>
      <h1 style={{ marginBottom: '20px' }}>Test SignIn (Debug)</h1>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <div style={{ marginBottom: '15px' }}>
          <label style={{ display: 'block', marginBottom: '5px' }}>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '10px', border: '1px solid #ccc', borderRadius: '4px' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: '100%',
            padding: '12px',
            backgroundColor: loading ? '#ccc' : '#0070f3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px'
          }}
        >
          {loading ? 'Chargement...' : 'Se connecter'}
        </button>
      </form>

      {status && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: status.includes('✅') ? '#d4edda' : status.includes('❌') ? '#f8d7da' : '#fff3cd',
          borderRadius: '4px',
          whiteSpace: 'pre-wrap'
        }}>
          {status}
        </div>
      )}

      <div style={{ marginTop: '30px', padding: '15px', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
        <strong>Instructions:</strong>
        <ol style={{ margin: '10px 0', paddingLeft: '20px' }}>
          <li>Ouvrez la console (F12)</li>
          <li>Entrez le mot de passe</li>
          <li>Cliquez sur "Se connecter"</li>
          <li>Regardez les logs dans la console</li>
        </ol>
      </div>
    </div>
  )
}
