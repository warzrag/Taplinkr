'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function AdminLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  
  const handleLogin = async () => {
    setLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email: 'admin@taplinkr.com',
        password: 'Admin123!',
        redirect: false
      });
      
      if (result?.error) {
        setError(`Erreur: ${result.error}`);
        console.error('Erreur de connexion:', result);
      } else if (result?.ok) {
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(`Exception: ${err.message}`);
      console.error('Exception:', err);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center mb-8">Connexion Admin Rapide</h1>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-sm text-blue-900 mb-2">
            <strong>Compte pré-rempli :</strong>
          </p>
          <p className="text-sm text-blue-800">Email: admin@taplinkr.com</p>
          <p className="text-sm text-blue-800">Mot de passe: Admin123!</p>
        </div>
        
        <button
          onClick={handleLogin}
          disabled={loading}
          className="w-full py-3 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg font-semibold hover:from-indigo-700 hover:to-blue-700 transition-all disabled:opacity-50"
        >
          {loading ? 'Connexion...' : 'Se connecter en tant qu\'Admin'}
        </button>
        
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-800">{error}</p>
          </div>
        )}
        
        <div className="mt-6 space-y-2 text-center">
          <a 
            href="/auth/signin" 
            className="text-sm text-gray-600 hover:text-gray-900 block"
          >
            → Utiliser la page de connexion normale
          </a>
          <a 
            href="/test-login" 
            className="text-sm text-gray-600 hover:text-gray-900 block"
          >
            → Page de test d'authentification
          </a>
        </div>
      </div>
    </div>
  );
}