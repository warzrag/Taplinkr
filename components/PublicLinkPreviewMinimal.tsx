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
    <div className="min-h-screen bg-gradient-to-b from-purple-900 to-pink-900">
      {/* Header simple */}
      <div className="p-8 text-center">
        {/* Photo de profil */}
        {link.profileImage && (
          <img
            src={link.profileImage}
            alt=""
            className="w-32 h-32 mx-auto rounded-full mb-4 border-4 border-white/30"
          />
        )}
        
        {/* Titre */}
        <h1 className="text-3xl font-bold text-white mb-2">
          {link.title || 'Mon profil'}
        </h1>
        
        {/* Bio */}
        {link.bio && (
          <p className="text-white/80 mb-6 max-w-md mx-auto">
            {link.bio}
          </p>
        )}
      </div>

      {/* Liens */}
      <div className="px-4 pb-8">
        <div className="max-w-md mx-auto space-y-4">
          {link.multiLinks && link.multiLinks.map((item: any) => (
            <button
              key={item.id}
              onClick={() => handleLinkClick(item.url)}
              className="w-full bg-white/90 hover:bg-white text-gray-900 font-semibold py-4 px-6 rounded-xl transition-all hover:scale-105 shadow-lg"
            >
              {item.title}
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
      <div className="text-center pb-8">
        <a 
          href="https://www.taplinkr.com"
          className="text-white/50 text-sm hover:text-white/70"
        >
          Créé avec TapLinkr
        </a>
      </div>
    </div>
  )
}