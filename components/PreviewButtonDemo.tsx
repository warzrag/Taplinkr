'use client'

import PreviewEditButton from './PreviewEditButton'

export default function PreviewButtonDemo() {
  const handleClick = () => {
    console.log('Button clicked!')
  }

  return (
    <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">
        Options de bouton Modifier avec Prévisualisation
      </h1>

      {/* Option 1 */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Option 1: Texte qui change au survol
        </h2>
        <PreviewEditButton onClick={handleClick} variant="option1" />
        <p className="text-xs text-gray-500">
          ✨ Le texte passe de "Modifier" à "Prévisualiser" avec icône de téléphone
        </p>
      </div>

      {/* Option 2 */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Option 2: Bouton split (deux zones)
        </h2>
        <PreviewEditButton onClick={handleClick} variant="option2" />
        <p className="text-xs text-gray-500">
          ✨ Zone "Modifier" et zone "Live" colorée
        </p>
      </div>

      {/* Option 3 */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Option 3: Animation d'icône
        </h2>
        <PreviewEditButton onClick={handleClick} variant="option3" />
        <p className="text-xs text-gray-500">
          ✨ L'icône Edit se transforme en Eye au survol
        </p>
      </div>

      {/* Option 4 */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Option 4: Badge "LIVE" animé
        </h2>
        <PreviewEditButton onClick={handleClick} variant="option4" />
        <p className="text-xs text-gray-500">
          ✨ Badge "LIVE" qui pulse pour attirer l'attention
        </p>
      </div>

      {/* Option 5 */}
      <div className="space-y-2">
        <h2 className="text-sm font-medium text-gray-600 dark:text-gray-400">
          Option 5: Style futuriste avec glow
        </h2>
        <PreviewEditButton onClick={handleClick} variant="option5" />
        <p className="text-xs text-gray-500">
          ✨ Effet glow et icônes combinées pour un look moderne
        </p>
      </div>

      {/* Bonus: Tooltip suggestion */}
      <div className="mt-12 p-6 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          💡 Suggestion bonus: Tooltip au premier survol
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
          Pour les nouveaux utilisateurs, ajouter un tooltip qui apparaît automatiquement :
        </p>
        <div className="relative inline-block">
          <button className="px-4 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center gap-2">
            <span className="text-sm">Modifier</span>
          </button>
          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-black text-white text-xs rounded-lg whitespace-nowrap">
            <div className="flex items-center gap-2">
              <span>Prévisualisez vos modifications en temps réel</span>
              <span className="text-indigo-400">📱</span>
            </div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-2 h-2 bg-black rotate-45" />
          </div>
        </div>
      </div>
    </div>
  )
}