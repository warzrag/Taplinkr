'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QrCode, Download, Share2, Copy, Check, Palette, Sparkles } from 'lucide-react'
import QRCode from 'qrcode'
import { toast } from 'react-hot-toast'

interface QRCodeGeneratorProps {
  url: string
  title?: string
  logo?: string
  primaryColor?: string
  secondaryColor?: string
}

export default function QRCodeGenerator({ 
  url, 
  title = 'Mon QR Code',
  logo,
  primaryColor = '#000000',
  secondaryColor = '#ffffff'
}: QRCodeGeneratorProps) {
  const [qrCodeUrl, setQrCodeUrl] = useState<string>('')
  const [showOptions, setShowOptions] = useState(false)
  const [qrStyle, setQrStyle] = useState({
    color: primaryColor,
    bgColor: secondaryColor,
    margin: 2,
    size: 256
  })
  const [copied, setCopied] = useState(false)

  // Styles prédéfinis pour le QR code
  const qrStyles = [
    { name: 'Classique', color: '#000000', bgColor: '#ffffff', icon: '⚫' },
    { name: 'Bleu Pro', color: '#1e3a8a', bgColor: '#dbeafe', icon: '🔵' },
    { name: 'Violet', color: '#6b21a8', bgColor: '#f3e8ff', icon: '🟣' },
    { name: 'Rose', color: '#be185d', bgColor: '#fce7f3', icon: '🩷' },
    { name: 'Vert', color: '#15803d', bgColor: '#dcfce7', icon: '🟢' },
    { name: 'Orange', color: '#c2410c', bgColor: '#fed7aa', icon: '🟠' }
  ]

  useEffect(() => {
    generateQRCode()
  }, [url, qrStyle])

  const generateQRCode = async () => {
    try {
      const qrCodeDataUrl = await QRCode.toDataURL(url, {
        width: qrStyle.size,
        margin: qrStyle.margin,
        color: {
          dark: qrStyle.color,
          light: qrStyle.bgColor
        },
        errorCorrectionLevel: 'H' // High correction pour permettre un logo
      })
      setQrCodeUrl(qrCodeDataUrl)
    } catch (error) {
      console.error('Erreur génération QR code:', error)
      toast.error('Erreur lors de la génération du QR code')
    }
  }

  const downloadQRCode = () => {
    const link = document.createElement('a')
    link.download = `qrcode-${title.toLowerCase().replace(/ /g, '-')}.png`
    link.href = qrCodeUrl
    link.click()
    toast.success('QR code téléchargé!')
  }

  const copyQRCode = async () => {
    try {
      const blob = await fetch(qrCodeUrl).then(res => res.blob())
      await navigator.clipboard.write([
        new ClipboardItem({ 'image/png': blob })
      ])
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
      toast.success('QR code copié!')
    } catch (error) {
      toast.error('Impossible de copier l\'image')
    }
  }

  const shareQRCode = async () => {
    if (navigator.share) {
      try {
        const blob = await fetch(qrCodeUrl).then(res => res.blob())
        const file = new File([blob], 'qrcode.png', { type: 'image/png' })
        await navigator.share({
          title: title,
          text: `QR code pour ${title}`,
          files: [file]
        })
      } catch (error) {
        // User cancelled or error
      }
    } else {
      copyQRCode()
    }
  }

  return (
    <div className="relative">
      {/* Bouton principal */}
      <motion.button
        onClick={() => setShowOptions(!showOptions)}
        className="p-3 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl shadow-lg text-white hover:shadow-xl transition-all duration-300 group"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <QrCode className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
      </motion.button>

      {/* Modal QR Code */}
      <AnimatePresence>
        {showOptions && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
              onClick={() => setShowOptions(false)}
            />
            
            {/* Modal Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl z-50 overflow-hidden"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xl font-bold flex items-center gap-2">
                    <QrCode className="w-6 h-6" />
                    QR Code
                  </h3>
                  <button
                    onClick={() => setShowOptions(false)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-white/80 text-sm">{title}</p>
              </div>
              
              {/* QR Code Display */}
              <div className="p-6 flex flex-col items-center">
                <div className="relative group">
                  {/* QR Code avec effet */}
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-40 transition-opacity" />
                  <div className="relative bg-white p-4 rounded-2xl shadow-lg">
                    {qrCodeUrl && (
                      <img 
                        src={qrCodeUrl} 
                        alt="QR Code" 
                        className="w-64 h-64"
                      />
                    )}
                  </div>
                  
                  {/* Logo overlay (si fourni) */}
                  {logo && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-12 h-12 bg-white rounded-lg shadow-md p-1">
                        <img src={logo} alt="Logo" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
                
                {/* URL */}
                <p className="mt-4 text-xs text-gray-500 dark:text-gray-400 text-center break-all max-w-[250px]">
                  {url}
                </p>
              </div>
              
              {/* Style Options */}
              <div className="px-6 pb-4">
                <div className="flex items-center gap-2 mb-3">
                  <Palette className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Styles</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {qrStyles.map((style) => (
                    <motion.button
                      key={style.name}
                      onClick={() => setQrStyle({
                        ...qrStyle,
                        color: style.color,
                        bgColor: style.bgColor
                      })}
                      className={`p-3 rounded-xl border-2 transition-all ${
                        qrStyle.color === style.color 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' 
                          : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-lg">{style.icon}</span>
                        <span className="text-xs font-medium">{style.name}</span>
                      </div>
                    </motion.button>
                  ))}
                </div>
              </div>
              
              {/* Actions */}
              <div className="p-6 pt-0 flex gap-2">
                <motion.button
                  onClick={downloadQRCode}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:shadow-lg transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <Download className="w-4 h-4" />
                  Télécharger
                </motion.button>
                
                <motion.button
                  onClick={copyQRCode}
                  className="flex-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-green-500" />
                      Copié!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      Copier
                    </>
                  )}
                </motion.button>
                
                {navigator.share && (
                  <motion.button
                    onClick={shareQRCode}
                    className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-all"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Share2 className="w-4 h-4" />
                  </motion.button>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}