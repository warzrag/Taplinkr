'use client';

import { useState } from 'react';

export default function TestLogin() {
  const [email, setEmail] = useState('admin@taplinkr.com');
  const [password, setPassword] = useState('Admin123!');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const testAuth = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test-auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };
  
  const testInfo = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/test-auth');
      const data = await res.json();
      setResult(data);
    } catch (error: any) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Test d'authentification</h1>
        
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 mb-4">
          <h2 className="text-lg font-semibold mb-4">Tester une connexion</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Mot de passe</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={testAuth}
                disabled={loading}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {loading ? 'Test...' : 'Tester l\'authentification'}
              </button>
              
              <button
                onClick={testInfo}
                disabled={loading}
                className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 disabled:opacity-50"
              >
                Voir les infos
              </button>
            </div>
          </div>
        </div>
        
        {result && (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-2">Résultat :</h2>
            <pre className="bg-gray-100 dark:bg-gray-700 p-4 rounded overflow-x-auto text-sm">
              {JSON.stringify(result, null, 2)}
            </pre>
          </div>
        )}
        
        <div className="mt-6 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
          <p className="font-semibold mb-2">Comptes de test :</p>
          <ul className="text-sm space-y-1">
            <li>• admin@taplinkr.com / Admin123!</li>
            <li>• florentivo95270@gmail.com / Admin123!</li>
          </ul>
        </div>
      </div>
    </div>
  );
}