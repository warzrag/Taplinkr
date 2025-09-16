'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Copy, ExternalLink, AlertTriangle } from 'lucide-react'

export default function SetupStripePage() {
  const [envVars, setEnvVars] = useState({
    hasPublishableKey: false,
    hasSecretKey: false,
    hasWebhookSecret: false,
    hasStandardPriceId: false,
    hasPremiumPriceId: false,
  })

  useEffect(() => {
    // Vérifier les variables d'environnement côté client
    setEnvVars({
      hasPublishableKey: !!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY,
      hasSecretKey: false, // On ne peut pas vérifier côté client
      hasWebhookSecret: false, // On ne peut pas vérifier côté client
      hasStandardPriceId: false, // À configurer
      hasPremiumPriceId: false, // À configurer
    })
  }, [])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12">
      <div className="max-w-4xl mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4">Configuration Stripe</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez ces étapes pour configurer les paiements Stripe
          </p>
        </motion.div>

        {/* Alerte */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-4 mb-8 flex items-start gap-3"
        >
          <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-yellow-800 dark:text-yellow-200">
              Page de configuration temporaire
            </p>
            <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
              Cette page doit être supprimée après configuration
            </p>
          </div>
        </motion.div>

        {/* Étapes */}
        <div className="space-y-6">
          {/* Étape 1 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                1
              </span>
              Créer les produits dans Stripe
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Connectez-vous à votre dashboard Stripe et créez deux produits :
              </p>
              
              <div className="grid gap-4">
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Plan Standard</h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Nom : TapLinkr Standard</li>
                    <li>• Prix : 9,99€ / mois</li>
                    <li>• Type : Abonnement récurrent</li>
                  </ul>
                </div>
                
                <div className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold mb-2">Plan Premium</h3>
                  <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <li>• Nom : TapLinkr Premium</li>
                    <li>• Prix : 24,99€ / mois</li>
                    <li>• Type : Abonnement récurrent</li>
                  </ul>
                </div>
              </div>
              
              <a
                href="https://dashboard.stripe.com/test/products"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700"
              >
                Aller sur Stripe Dashboard
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </motion.div>

          {/* Étape 2 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                2
              </span>
              Ajouter les variables d'environnement
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Ajoutez ces lignes dans votre fichier <code className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">.env.local</code> :
              </p>
              
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-green-400"># IDs des prix (à récupérer depuis Stripe)</span>
                  </div>
                  <div className="flex items-center justify-between group">
                    <span>STRIPE_STANDARD_PRICE_ID=price_xxxxx</span>
                    <button
                      onClick={() => copyToClipboard('STRIPE_STANDARD_PRICE_ID=')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="flex items-center justify-between group">
                    <span>STRIPE_PREMIUM_PRICE_ID=price_xxxxx</span>
                    <button
                      onClick={() => copyToClipboard('STRIPE_PREMIUM_PRICE_ID=')}
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Copy className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Remplacez <code>price_xxxxx</code> par les IDs réels de vos prix Stripe
              </p>
            </div>
          </motion.div>

          {/* Étape 3 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4 flex items-center gap-2">
              <span className="w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm">
                3
              </span>
              Configurer les webhooks
            </h2>
            
            <div className="space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                Pour le développement local, utilisez Stripe CLI :
              </p>
              
              <div className="bg-gray-900 text-gray-100 rounded-lg p-4 font-mono text-sm overflow-x-auto">
                <div className="space-y-2">
                  <span className="text-green-400"># Installer Stripe CLI</span>
                  <div>brew install stripe/stripe-cli/stripe</div>
                  <br />
                  <span className="text-green-400"># Se connecter</span>
                  <div>stripe login</div>
                  <br />
                  <span className="text-green-400"># Écouter les webhooks</span>
                  <div>stripe listen --forward-to localhost:3000/api/stripe/webhook</div>
                </div>
              </div>
              
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Copiez le webhook secret affiché et ajoutez-le dans votre <code>.env.local</code>
              </p>
            </div>
          </motion.div>

          {/* État actuel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-lg"
          >
            <h2 className="text-2xl font-semibold mb-4">État de la configuration</h2>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Clé publique Stripe</span>
                {envVars.hasPublishableKey ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <X className="w-5 h-5 text-red-500" />
                )}
              </div>
              
              <div className="flex items-center justify-between">
                <span>Clé secrète Stripe</span>
                <span className="text-sm text-gray-500">Vérifier dans .env.local</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Webhook secret</span>
                <span className="text-sm text-gray-500">Vérifier dans .env.local</span>
              </div>
              
              <div className="flex items-center justify-between">
                <span>Prix Standard ID</span>
                <X className="w-5 h-5 text-red-500" />
              </div>
              
              <div className="flex items-center justify-between">
                <span>Prix Premium ID</span>
                <X className="w-5 h-5 text-red-500" />
              </div>
            </div>
            
            <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <p className="text-sm text-blue-700 dark:text-blue-300">
                Une fois toutes les variables configurées, redémarrez le serveur de développement
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}