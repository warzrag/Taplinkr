'use client'

import { useState } from 'react'
import Link from 'next/link'

interface LinkData {
  id: string
  title: string
  url: string
  shortCode: string
  clicks: number
  isDirect?: boolean
  createdAt: string
  _count?: {
    clicks_details: number
  }
}

interface LinkCardProps {
  link: LinkData
  onDelete: (linkId: string) => void
  onCustomize?: (link: LinkData) => void
}

export function LinkCard({ link, onDelete, onCustomize }: LinkCardProps) {
  const [deleting, setDeleting] = useState(false)
  const [copied, setCopied] = useState(false)
  const [showActions, setShowActions] = useState(false)

  const shortUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/l/${link.shortCode}`
    : `/l/${link.shortCode}`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shortUrl)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error('Error copying:', err)
    }
  }

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this link?')) {
      return
    }

    setDeleting(true)
    try {
      const response = await fetch(`/api/links/${link.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        onDelete(link.id)
      }
    } catch (error) {
      console.error('Error deleting:', error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="group bg-white dark:bg-gray-800 rounded-2xl shadow-md hover:shadow-xl border border-gray-200 dark:border-gray-700 p-4 sm:p-6 transition-all">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0 mr-2">
          <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white truncate">
            {link.title}
          </h3>
          <a
            href={link.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors truncate block"
          >
            {link.url}
          </a>
        </div>
        
        {/* Mobile Action Button */}
        <div className="lg:hidden">
          <button
            onClick={() => setShowActions(!showActions)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Show actions"
          >
            <svg className="w-5 h-5 text-gray-500" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
            </svg>
          </button>
        </div>

        {/* Desktop Actions */}
        <div className="hidden lg:flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            href={`/analytics?linkId=${link.id}`}
            className="p-2 text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="View analytics"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </Link>
          {!link.isDirect && onCustomize && (
            <button
              onClick={() => onCustomize(link)}
              className="p-2 text-gray-400 hover:text-pink-600 dark:hover:text-pink-400 transition-colors rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
              title="Customize page"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="p-2 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
            title="Delete"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Actions Dropdown */}
      {showActions && (
        <div className="lg:hidden mb-4 bg-gray-50 dark:bg-gray-900 rounded-xl p-2 space-y-1">
          <Link
            href={`/analytics?linkId=${link.id}`}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span className="text-sm font-medium">View Analytics</span>
          </Link>
          {!link.isDirect && onCustomize && (
            <button
              onClick={() => onCustomize(link)}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left"
            >
              <svg className="w-5 h-5 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zM21 5a2 2 0 00-2-2h-4a2 2 0 00-2 2v12a4 4 0 004 4h4a2 2 0 002-2V5z" />
              </svg>
              <span className="text-sm font-medium">Customize Page</span>
            </button>
          )}
          <button
            onClick={handleDelete}
            disabled={deleting}
            className="flex items-center space-x-3 px-3 py-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors w-full text-left text-red-600 disabled:opacity-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            <span className="text-sm font-medium">Delete Link</span>
          </button>
        </div>
      )}

      {/* Link URL Box - Mobile Optimized */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-3 sm:p-4 mb-4">
        <div className="flex items-center justify-between">
          <div className="flex-1 mr-2 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-xs font-medium text-gray-600 dark:text-gray-400">Short Link</p>
              {link.isDirect ? (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                  </svg>
                  Direct
                </span>
              ) : (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300">
                  <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2.166 4.999A11.954 11.954 0 0010 1.944 11.954 11.954 0 0017.834 5c.11.65.166 1.32.166 2.001 0 5.225-3.34 9.67-8 11.317C5.34 16.67 2 12.225 2 7c0-.682.057-1.35.166-2.001zm11.541 3.708a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Protected
                </span>
              )}
            </div>
            <p className="text-sm font-mono text-purple-600 dark:text-purple-400 truncate">
              {shortUrl}
            </p>
          </div>
          <button
            onClick={handleCopy}
            className={`px-3 sm:px-4 py-2 text-sm font-medium rounded-lg transition-all transform active:scale-95 flex-shrink-0 ${
              copied 
                ? 'bg-green-500 text-white' 
                : 'bg-white dark:bg-gray-800 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/30 border border-purple-200 dark:border-purple-800'
            }`}
          >
            {copied ? (
              <span className="flex items-center">
                <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                </svg>
                <span className="hidden sm:inline">Copied!</span>
              </span>
            ) : (
              <span className="flex items-center">
                <svg className="w-4 h-4 sm:mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <span className="hidden sm:inline">Copy</span>
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Stats - Mobile Optimized */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center text-purple-600 dark:text-purple-400 mb-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </div>
          <div className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{link.clicks}</div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Total Clicks</div>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-3 text-center">
          <div className="flex items-center justify-center text-pink-600 dark:text-pink-400 mb-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xs sm:text-sm font-medium text-gray-900 dark:text-white">
            {new Date(link.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric'
            })}
          </div>
          <div className="text-xs text-gray-600 dark:text-gray-400">Created</div>
        </div>
      </div>
    </div>
  )
}