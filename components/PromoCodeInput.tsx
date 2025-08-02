'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { Tag, Check, X, Loader2 } from 'lucide-react'

interface PromoCodeInputProps {
  onApply?: (code: string, discount: any) => void
  className?: string
}

export default function PromoCodeInput({ onApply, className = '' }: PromoCodeInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [discount, setDiscount] = useState<any>(null)

  const validateCode = async () => {
    if (!code.trim()) {
      toast.error('Veuillez entrer un code promo')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/promo-codes/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: code.toUpperCase() })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        setDiscount({ ...data, code: code.toUpperCase() })
        toast.success('Code promo valide !')
        if (onApply) {
          onApply(code.toUpperCase(), { ...data, code: code.toUpperCase() })
        }
      } else {
        toast.error(data.error || 'Code promo invalide')
        setDiscount(null)
      }
    } catch (error) {
      toast.error('Erreur lors de la validation')
      setDiscount(null)
    } finally {
      setLoading(false)
    }
  }

  const removeCode = () => {
    setCode('')
    setDiscount(null)
    if (onApply) {
      onApply('', null)
    }
  }

  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex gap-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Code promo"
            disabled={loading || discount}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-50 disabled:cursor-not-allowed"
          />
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        </div>
        
        {!discount ? (
          <button
            onClick={validateCode}
            disabled={loading || !code.trim()}
            className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Validation...
              </>
            ) : (
              'Appliquer'
            )}
          </button>
        ) : (
          <button
            onClick={removeCode}
            className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-colors flex items-center gap-2"
          >
            <X className="w-4 h-4" />
            Retirer
          </button>
        )}
      </div>

      {discount && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 bg-green-50 border border-green-200 rounded-lg"
        >
          <div className="flex items-start gap-2">
            <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-800">
                Code promo appliqué !
              </p>
              <p className="text-xs text-green-600 mt-1">
                {discount.discountType === 'fixed_days' ? (
                  <>{discount.discountValue} jours Premium offerts</>
                ) : (
                  <>{discount.discountValue}% de réduction</>
                )}
              </p>
              {discount.description && (
                <p className="text-xs text-gray-600 mt-1">{discount.description}</p>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}