import { notFound } from 'next/navigation'
import { prisma } from '@/lib/prisma'

interface PageProps {
  params: { slug: string }
}

export default async function LinkPage({ params }: PageProps) {
  const link = await prisma.link.findUnique({
    where: { slug: params.slug },
    include: {
      user: true,
      multiLinks: {
        orderBy: { order: 'asc' }
      }
    }
  })

  if (!link || !link.isActive) {
    notFound()
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 relative"
      style={link.coverImage ? {
        backgroundImage: `url(${link.coverImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat'
      } : {}}
    >
      {/* Overlay sombre si il y a une image de couverture */}
      {link.coverImage && (
        <div className="absolute inset-0 bg-black/40" />
      )}
      
      {/* Dégradé de fallback si pas d'image de couverture */}
      {!link.coverImage && (
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500" />
      )}
      
      <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 max-w-md w-full text-center relative z-10">
        {/* Photo de profil */}
        {link.profileImage && (
          <img
            src={link.profileImage}
            alt="Profile"
            className="w-20 h-20 object-cover rounded-full border-4 border-white shadow-lg mx-auto mb-4"
          />
        )}
        
        {/* Titre */}
        <h1 className="text-white text-3xl font-bold mb-2">
          {link.title}
        </h1>
        
        {/* Description */}
        {link.description && (
          <p className="text-white/90 text-sm mb-4">
            {link.description}
          </p>
        )}
        
        {/* Liens */}
        <div className="space-y-3">
          {link.multiLinks?.map((multiLink) => (
            <a
              key={multiLink.id}
              href={multiLink.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-white/90 hover:bg-white text-gray-900 p-4 rounded-xl transition-all"
            >
              <div className="flex items-center">
                <span className="text-2xl mr-3">{multiLink.icon || '🔗'}</span>
                <span className="font-semibold">{multiLink.title}</span>
              </div>
            </a>
          ))}
        </div>
        
        {/* Footer */}
        <div className="mt-6 text-white/60 text-xs">
          GetAllMyLinks
        </div>
      </div>
    </div>
  )
}