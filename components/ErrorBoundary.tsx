'use client'

import React from 'react'
import { useErrorHandler } from '@/lib/error-tracker'

interface Props {
  children: React.ReactNode
  fallback?: React.ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export default class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
    
    // Envoyer l'erreur au serveur
    fetch('/api/monitoring/errors', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: error.message,
        stack: error.stack,
        componentStack: errorInfo.componentStack,
        severity: 'critical'
      })
    }).catch(console.error)
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full">
            <div className="text-center">
              <div className="text-6xl mb-4">😕</div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">
                Oops! Quelque chose s'est mal passé
              </h1>
              <p className="text-gray-600 mb-6">
                Une erreur inattendue s'est produite. L'équipe technique a été notifiée.
              </p>
              <button
                onClick={() => window.location.reload()}
                className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Rafraîchir la page
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}