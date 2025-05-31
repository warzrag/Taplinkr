'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LandingPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [emailCapture, setEmailCapture] = useState('')
  const [showDemo, setShowDemo] = useState(false)

  // Redirect to dashboard if authenticated
  useEffect(() => {
    if (session) {
      router.push('/dashboard')
    }
  }, [session, router])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  const handleEmailSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    router.push(`/auth/signup?email=${encodeURIComponent(emailCapture)}`)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
      {/* Navigation - Mobile First */}
      <nav className="fixed top-0 w-full bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg border-b border-gray-200 dark:border-gray-800 z-50">
        <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-sm">LT</span>
              </div>
              <span className="font-bold text-lg sm:text-xl bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">LinkTracker</span>
            </div>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <Link
                href="/auth/signin"
                className="text-sm sm:text-base text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 sm:px-6 py-2 rounded-full text-sm sm:text-base font-medium hover:shadow-lg transform hover:scale-105 transition-all"
              >
                Get Started
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section - Mobile First */}
      <section className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Hero Content */}
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-6">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs sm:text-sm font-medium bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <span className="mr-2">🔥</span> Used by 10,000+ marketers worldwide
              </span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Stop Losing Revenue
              </span>
              <br />
              <span className="text-gray-900 dark:text-white">
                To Social Media Bans
              </span>
            </h1>
            
            <p className="text-lg sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-8 leading-relaxed">
              Your competitors are getting banned daily. Their links detected, accounts suspended, revenue lost. 
              <span className="font-semibold text-gray-900 dark:text-white"> LinkTracker keeps you invisible and profitable.</span>
            </p>

            {/* Trust Badges */}
            <div className="flex flex-wrap justify-center gap-4 mb-8">
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>99.7% Protection Rate</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>Zero Bans Guarantee</span>
              </div>
              <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                <svg className="w-5 h-5 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span>2-Min Setup</span>
              </div>
            </div>

            {/* CTA Form */}
            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={emailCapture}
                  onChange={(e) => setEmailCapture(e.target.value)}
                  placeholder="Enter your business email"
                  className="flex-1 px-6 py-4 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-full text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-4 focus:ring-purple-500/20 focus:border-purple-500 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full font-semibold hover:shadow-xl transform hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  Start Free Trial
                </button>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-3">
                🔒 No credit card required • Cancel anytime • 30-day money-back guarantee
              </p>
            </form>
          </div>

          {/* Hero Visual */}
          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl opacity-20"></div>
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
              <div className="bg-gray-100 dark:bg-gray-900 px-4 py-3 flex items-center space-x-2">
                <div className="flex space-x-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="flex-1 text-center">
                  <span className="text-xs text-gray-600 dark:text-gray-400">linktracker.app/dashboard</span>
                </div>
              </div>
              <div className="p-8 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900">
                <div className="text-center py-12">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl mb-4">
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Protected Links Dashboard</h3>
                  <p className="text-gray-600 dark:text-gray-400">Your links are 100% invisible to detection algorithms</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Problem Section - Mobile First */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              The Silent Business Killer
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Every day, thousands of businesses lose their entire online presence. One banned link, and years of work vanish instantly.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: "😱",
                title: "Account Suspended Overnight",
                description: "Wake up to find your 100K follower account gone. All because of 'suspicious links'.",
                stat: "67% of marketers",
                statDesc: "experienced bans in 2024"
              },
              {
                icon: "💸",
                title: "Revenue Stream Destroyed",
                description: "Your sales funnels broken, ads rejected, affiliate links dead. Income drops to zero.",
                stat: "€15K average",
                statDesc: "monthly revenue lost"
              },
              {
                icon: "🚫",
                title: "Permanent Blacklist",
                description: "Once flagged, you're marked forever. New accounts get instant bans. Business ruined.",
                stat: "92% fail",
                statDesc: "to recover after ban"
              }
            ].map((item, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-6 sm:p-8 shadow-lg border border-red-200 dark:border-red-900/50 hover:border-red-300 dark:hover:border-red-800 transition-all">
                <div className="text-4xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">{item.description}</p>
                <div className="pt-4 border-t border-gray-200 dark:border-gray-800">
                  <div className="text-2xl font-bold text-red-600 dark:text-red-400">{item.stat}</div>
                  <div className="text-sm text-gray-600 dark:text-gray-500">{item.statDesc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Solution Section - Mobile First */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 font-medium mb-4">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              The Solution
            </div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Military-Grade Link Protection
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              LinkTracker uses advanced cloaking technology that makes your links completely invisible to detection systems.
            </p>
          </div>

          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              {[
                {
                  title: "15+ Bot Detection Layers",
                  description: "Advanced AI identifies and blocks all platform crawlers before they reach your links"
                },
                {
                  title: "Dynamic Link Morphing",
                  description: "Links change structure in real-time, making pattern detection impossible"
                },
                {
                  title: "Neutral Landing Pages",
                  description: "Your links appear as harmless content to automated systems"
                },
                {
                  title: "Zero Footprint Technology",
                  description: "No tracking pixels, no suspicious redirects, completely clean"
                }
              ].map((feature, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{feature.title}</h3>
                    <p className="text-gray-600 dark:text-gray-400">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-400 to-pink-400 blur-3xl opacity-20"></div>
              <div className="relative bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl p-8 text-white">
                <h3 className="text-2xl font-bold mb-6">See The Difference</h3>
                <div className="space-y-4">
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="text-sm opacity-75 mb-1">Regular Link:</div>
                    <code className="text-xs break-all">bit.ly/promo-sale-50off</code>
                    <div className="text-xs text-red-300 mt-2">❌ Instantly detected & banned</div>
                  </div>
                  <div className="bg-white/10 backdrop-blur rounded-lg p-4">
                    <div className="text-sm opacity-75 mb-1">LinkTracker Protected:</div>
                    <code className="text-xs break-all">linktracker.app/l/XyZ9Qm</code>
                    <div className="text-xs text-green-300 mt-2">✅ 100% invisible to bots</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Social Proof - Mobile First */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gray-100 dark:bg-gray-800/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              Join 10,000+ Protected Businesses
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300">
              From solo entrepreneurs to million-euro brands, they all trust LinkTracker
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                name: "Sarah M.",
                role: "E-commerce Founder",
                revenue: "€2.5M ARR",
                quote: "LinkTracker saved my business. After 3 Instagram bans, I finally sleep peacefully knowing my links are protected.",
                rating: 5
              },
              {
                name: "Marcus K.",
                role: "Performance Marketer",
                revenue: "€500K/month",
                quote: "ROI increased 340% since switching. No more campaign interruptions, no more lost revenue. Absolute game-changer.",
                rating: 5
              },
              {
                name: "Lisa Chen",
                role: "Influencer",
                revenue: "1M+ followers",
                quote: "Lost 2 accounts before finding LinkTracker. Now running campaigns 24/7 without any fear. Worth every penny!",
                rating: 5
              }
            ].map((testimonial, index) => (
              <div key={index} className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                    {testimonial.name[0]}
                  </div>
                  <div className="ml-4">
                    <h4 className="font-semibold text-gray-900 dark:text-white">{testimonial.name}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                  </div>
                </div>
                <div className="flex mb-3">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <svg key={i} className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <p className="text-gray-600 dark:text-gray-300 mb-3">"{testimonial.quote}"</p>
                <div className="text-sm font-semibold text-purple-600 dark:text-purple-400">{testimonial.revenue}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA - Mobile First */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-purple-600 to-pink-600">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-white/10 backdrop-blur-lg rounded-3xl p-8 sm:p-12">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-white/20 text-white font-medium mb-6">
              <span className="mr-2">⏰</span> Limited Time Offer
            </div>
            
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Start Protecting Your Links Today
            </h2>
            
            <p className="text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto">
              Join before we reach capacity. We limit new users to maintain our 99.7% protection rate.
            </p>

            <div className="bg-white/20 backdrop-blur rounded-2xl p-6 mb-8 max-w-md mx-auto">
              <div className="text-3xl font-bold text-white mb-2">First 7 Days FREE</div>
              <div className="text-white/80 line-through mb-1">Regular: €97/month</div>
              <div className="text-lg text-white/90">Then only €47/month</div>
            </div>

            <form onSubmit={handleEmailSubmit} className="max-w-md mx-auto mb-6">
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="email"
                  value={emailCapture}
                  onChange={(e) => setEmailCapture(e.target.value)}
                  placeholder="Enter your business email"
                  className="flex-1 px-6 py-4 bg-white/20 backdrop-blur border border-white/30 rounded-full text-white placeholder-white/70 focus:outline-none focus:ring-4 focus:ring-white/30 transition-all"
                  required
                />
                <button
                  type="submit"
                  className="px-8 py-4 bg-white text-purple-600 rounded-full font-bold hover:shadow-2xl transform hover:scale-105 active:scale-95 transition-all whitespace-nowrap"
                >
                  Claim Free Trial
                </button>
              </div>
            </form>

            <div className="flex flex-wrap justify-center gap-6 text-sm text-white/90">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                No credit card required
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cancel anytime
              </div>
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                30-day guarantee
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer - Mobile First */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-gray-200 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xs">LT</span>
              </div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                © 2024 LinkTracker - Protect Your Business
              </span>
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600 dark:text-gray-400">
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-gray-900 dark:hover:text-white transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}