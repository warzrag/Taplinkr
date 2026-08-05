'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { HelpCircle, ChevronDown, ChevronUp, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useState } from 'react'

interface FAQItem {
  question: string
  answer: string
  category: string
}

const faqs: FAQItem[] = [
  {
    category: 'General',
    question: 'What is TapLinkr?',
    answer: 'TapLinkr lets you create custom link pages and share your content and social profiles in one place.'
  },
  {
    category: 'General',
    question: 'How do I create my first link?',
    answer: 'Click “New page” or “New direct link” in your dashboard, choose a name, and customize it. You can add social profiles, websites, and more.'
  },
  {
    category: 'Features',
    question: 'Can I organize links into groups?',
    answer: 'Yes. Create groups directly on the Links page, then drag links between them or use the move button.'
  },
  {
    category: 'Features',
    question: 'How do analytics work?',
    answer: 'Analytics show clicks, views, and visitor sources in real time. Core analytics are available on every plan.'
  },
  {
    category: 'Plans and pricing',
    question: 'What is the difference between plans?',
    answer: 'The free plan includes core features. Paid plans add premium themes, more links, teams, and advanced analytics.'
  },
  {
    category: 'Support',
    question: 'How do I contact support?',
    answer: 'Use the Support page or email support@taplinkr.com.'
  }
]

export default function FAQPage() {
  const [openItems, setOpenItems] = useState<number[]>([])
  const categories = [...new Set(faqs.map(faq => faq.category))]

  const toggleItem = (index: number) => {
    setOpenItems(prev => 
      prev.includes(index) 
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50/20 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <div className="max-w-4xl mx-auto p-4 lg:p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Link href="/dashboard">
            <button className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 mb-6">
              <ArrowLeft className="w-4 h-4" />
              Back to dashboard
            </button>
          </Link>
          
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl">
              <HelpCircle className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                Frequently asked questions
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Find quick answers to your questions
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Categories */}
        {categories.map((category, categoryIndex) => (
          <motion.div
            key={category}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: categoryIndex * 0.1 }}
            className="mb-8"
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {category}
            </h2>
            
            <div className="space-y-3">
              {faqs
                .filter(faq => faq.category === category)
                .map((faq, index) => {
                  const globalIndex = faqs.indexOf(faq)
                  const isOpen = openItems.includes(globalIndex)
                  
                  return (
                    <motion.div
                      key={globalIndex}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden"
                    >
                      <button
                        onClick={() => toggleItem(globalIndex)}
                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                      >
                        <span className="font-medium text-gray-900 dark:text-gray-100">
                          {faq.question}
                        </span>
                        <motion.div
                          animate={{ rotate: isOpen ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-5 h-5 text-gray-500" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {isOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="px-6 pb-4"
                          >
                            <p className="text-gray-600 dark:text-gray-400">
                              {faq.answer}
                            </p>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  )
                })}
            </div>
          </motion.div>
        ))}

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-12 text-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8"
        >
          <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-3">
            Can't find your answer?
          </h3>
          <p className="text-gray-600 dark:text-gray-400 mb-6">
            Our team is here to help
          </p>
          <Link href="/dashboard/support">
            <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-medium hover:shadow-lg transition-all">
              Contact support
            </button>
          </Link>
        </motion.div>
      </div>
    </div>
  )
}
