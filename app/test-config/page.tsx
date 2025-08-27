'use client';

import { useEffect, useState } from 'react';

export default function TestConfig() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch('/api/debug-env')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        setData({ error: err.message });
        setLoading(false);
      });
  }, []);
  
  if (loading) return <div className="p-8">Chargement...</div>;
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <h1 className="text-2xl font-bold mb-4">Configuration Test</h1>
      
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-2">Variables d'environnement:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(data?.environment || {}, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-lg font-semibold mb-2">Base de données:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-x-auto text-sm">
          {JSON.stringify(data?.database || {}, null, 2)}
        </pre>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6 mt-4">
        <h2 className="text-lg font-semibold mb-2">Comptes Admin:</h2>
        <ul className="list-disc ml-6">
          <li>admin@taplinkr.com / Admin123!</li>
          <li>florentivo95270@gmail.com / Admin123!</li>
        </ul>
        <a 
          href="/auth/signin" 
          className="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Tester la connexion
        </a>
      </div>
    </div>
  );
}