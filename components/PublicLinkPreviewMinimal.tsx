'use client'

interface PublicLinkPreviewProps {
  link: any
}

export default function PublicLinkPreviewMinimal({ link }: PublicLinkPreviewProps) {
  if (!link) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900">
        <div className="text-white">Chargement...</div>
      </div>
    )
  }

  const handleLinkClick = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="min-h-screen relative">
      {/* Photo de couverture en arrière-plan */}
      {link.coverImage && (
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${link.coverImage})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}
      
      {/* Fallback gradient si pas de couverture */}
      {!link.coverImage && (
        <div className="absolute inset-0 z-0 bg-gradient-to-b from-purple-900 to-pink-900" />
      )}

      {/* Contenu */}
      <div className="relative z-10 p-8 text-center">
        {/* Photo de profil */}
        {link.profileImage && (
          <div className="relative inline-block mb-4">
            <img
              src={link.profileImage}
              alt=""
              className="w-32 h-32 mx-auto rounded-full border-4 border-white/30 shadow-2xl object-cover"
            />
            <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center">
              <span className="text-white text-sm">✨</span>
            </div>
          </div>
        )}
        
        {/* Titre */}
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3 drop-shadow-lg">
          {link.title || 'Mon profil'}
        </h1>
        
        {/* Bio/Description */}
        {(link.bio || link.description) && (
          <p className="text-white/90 text-lg mb-6 max-w-md mx-auto drop-shadow">
            {link.bio || link.description}
          </p>
        )}
        
        {/* Stats si disponibles */}
        {link.clicks > 0 && (
          <div className="text-white/70 text-sm mb-4">
            👁 {link.clicks} vues
          </div>
        )}
      </div>

      {/* Liens */}
      <div className="relative z-10 px-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          {link.multiLinks && link.multiLinks.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.url)}
              className="w-full bg-white/95 hover:bg-white text-gray-900 font-bold py-4 px-6 rounded-xl transition-all hover:scale-105 shadow-xl flex items-center gap-4"
            >
              {/* Icône/Logo du lien */}
              {(item.icon || item.iconImage) && (
                <img 
                  src={item.icon || item.iconImage}
                  alt=""
                  className="w-12 h-12 rounded-lg object-cover flex-shrink-0"
                  onError={(e) => {
                    // Masquer si l'image ne charge pas
                    const img = e.target as HTMLImageElement;
                    img.style.display = 'none';
                  }}
                />
              )}
              
              {/* Titre du lien */}
              <span className="flex-1 text-left text-lg">
                {item.title}
              </span>
              
              {/* Flèche */}
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          ))}
          
          {(!link.multiLinks || link.multiLinks.length === 0) && (
            <div className="text-center text-white/60 py-8">
              Aucun lien disponible
            </div>
          )}
        </div>
      </div>

      {/* Footer simple */}
      <div className="relative z-10 text-center pb-8">
        <a 
          href="https://www.taplinkr.com"
          className="text-white/60 text-sm hover:text-white/80 transition-colors"
        >
          ✨ Créé avec TapLinkr
        </a>
      </div>
    </div>
  )
}