'use client'

export default function PublicLinkPreviewDebug({ link }: any) {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg p-6">
        <h1 className="text-2xl font-bold mb-4">{link.title}</h1>
        <p className="text-gray-600 mb-4">Bio: {link.bio || 'Pas de bio'}</p>
        <p className="text-gray-600 mb-4">Description: {link.description || 'Pas de description'}</p>
        <p className="text-gray-600 mb-4">Nombre de liens: {link.multiLinks?.length || 0}</p>
        
        {link.multiLinks && link.multiLinks.length > 0 && (
          <div className="space-y-2">
            <h2 className="font-semibold">Liens:</h2>
            {link.multiLinks.map((ml: any) => (
              <a
                key={ml.id}
                href={ml.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-3 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                {ml.title}
              </a>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}