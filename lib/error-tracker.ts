// Système de tracking d'erreurs pour TapLinkr

interface ErrorLog {
  id: string
  timestamp: Date
  message: string
  stack?: string
  type: 'client' | 'server' | 'api'
  url?: string
  userAgent?: string
  userId?: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  context?: any
}

class ErrorTracker {
  private static instance: ErrorTracker
  private errors: ErrorLog[] = []
  private maxErrors = 100

  static getInstance() {
    if (!ErrorTracker.instance) {
      ErrorTracker.instance = new ErrorTracker()
    }
    return ErrorTracker.instance
  }

  logError(error: Partial<ErrorLog>) {
    const errorLog: ErrorLog = {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      message: error.message || 'Erreur inconnue',
      type: error.type || 'server',
      severity: error.severity || 'medium',
      ...error
    }

    this.errors.unshift(errorLog)
    
    // Garder seulement les dernières erreurs
    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(0, this.maxErrors)
    }

    // Log en console en développement
    if (process.env.NODE_ENV === 'development') {
      console.error('🔴 TapLinkr Error:', errorLog)
    }

    // Envoyer à un service externe en production (Sentry, LogRocket, etc.)
    if (process.env.NODE_ENV === 'production') {
      // TODO: Intégrer Sentry ou autre service
      this.sendToMonitoringService(errorLog)
    }

    return errorLog
  }

  getErrors(filters?: {
    type?: string
    severity?: string
    limit?: number
  }) {
    let filtered = this.errors

    if (filters?.type) {
      filtered = filtered.filter(e => e.type === filters.type)
    }

    if (filters?.severity) {
      filtered = filtered.filter(e => e.severity === filters.severity)
    }

    if (filters?.limit) {
      filtered = filtered.slice(0, filters.limit)
    }

    return filtered
  }

  clearErrors() {
    this.errors = []
  }

  private async sendToMonitoringService(error: ErrorLog) {
    // Implémentation future pour envoyer à Sentry, LogRocket, etc.
    try {
      // await fetch('/api/monitoring/error', {
      //   method: 'POST',
      //   body: JSON.stringify(error)
      // })
    } catch (e) {
      // Silencieux en cas d'échec
    }
  }
}

export const errorTracker = ErrorTracker.getInstance()

// Wrapper pour les API routes
export function withErrorTracking(handler: (req: Request, ...args: any[]) => Promise<Response> | Response) {
  return async (req: Request, ...args: any[]) => {
    try {
      return await handler(req, ...args)
    } catch (error) {
      errorTracker.logError({
        message: error.message,
        stack: error.stack,
        type: 'api',
        url: req.url,
        severity: 'high'
      })
      throw error
    }
  }
}

// Hook pour les erreurs client
export function useErrorHandler() {
  const logError = (error: Error, errorInfo?: any) => {
    errorTracker.logError({
      message: error.message,
      stack: error.stack,
      type: 'client',
      url: typeof window !== 'undefined' ? window.location.href : undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      context: errorInfo,
      severity: 'high'
    })
  }

  return { logError }
}
