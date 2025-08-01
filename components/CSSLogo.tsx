'use client'

interface CSSLogoProps {
  className?: string
}

export default function CSSLogo({ className = '' }: CSSLogoProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="relative w-16 h-16 md:w-20 md:h-20">
        {/* Cercle de fond avec dégradé */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl rotate-6 opacity-80"></div>
        <div className="absolute inset-0 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl -rotate-6 opacity-80"></div>
        
        {/* Texte du logo */}
        <div className="relative flex items-center justify-center w-full h-full bg-white/10 backdrop-blur-sm rounded-xl">
          <span className="text-2xl md:text-3xl font-black text-white drop-shadow-lg">
            TL
          </span>
        </div>
      </div>
    </div>
  )
}