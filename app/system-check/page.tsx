'use client';

import { useEffect, useState } from 'react';

export default function SystemCheck() {
  const [checks, setChecks] = useState<any>({});
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    runChecks();
  }, []);
  
  const runChecks = async () => {
    const results: any = {};
    
    // Test API de base
    try {
      const res = await fetch('/api/test-auth');
      results.apiTest = { status: res.ok ? '✅' : '❌', code: res.status };
    } catch (e) {
      results.apiTest = { status: '❌', error: 'Failed to connect' };
    }
    
    // Test création de lien
    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Link',
          slug: `test-${Date.now()}`,
          directUrl: 'https://google.com'
        })
      });
      results.linkCreation = { status: res.ok ? '✅' : '❌', code: res.status };
    } catch (e) {
      results.linkCreation = { status: '❌', error: 'Failed' };
    }
    
    // Test analytics
    try {
      const res = await fetch('/api/analytics/dashboard');
      results.analytics = { status: res.ok ? '✅' : '❌', code: res.status };
    } catch (e) {
      results.analytics = { status: '❌', error: 'Failed' };
    }
    
    // Test utilisateurs
    try {
      const res = await fetch('/api/admin/users');
      results.adminUsers = { status: res.ok ? '✅' : '❌', code: res.status };
    } catch (e) {
      results.adminUsers = { status: '❌', error: 'Failed' };
    }
    
    setChecks(results);
    setLoading(false);
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 Vérification du système TapLinkr</h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6">
          {loading ? (
            <p className="text-center text-gray-600">Vérification en cours...</p>
          ) : (
            <div className="space-y-4">
              <div className="border-b pb-2">
                <h2 className="text-xl font-semibold mb-4">État des APIs</h2>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>API Test Auth:</span>
                  <span>{checks.apiTest?.status} {checks.apiTest?.code || checks.apiTest?.error}</span>
                </div>
                
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Création de liens:</span>
                  <span>{checks.linkCreation?.status} {checks.linkCreation?.code || checks.linkCreation?.error}</span>
                </div>
                
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Analytics:</span>
                  <span>{checks.analytics?.status} {checks.analytics?.code || checks.analytics?.error}</span>
                </div>
                
                <div className="flex justify-between p-3 bg-gray-50 rounded">
                  <span>Admin/Users:</span>
                  <span>{checks.adminUsers?.status} {checks.adminUsers?.code || checks.adminUsers?.error}</span>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-blue-50 rounded">
                <h3 className="font-semibold mb-2">Problèmes détectés:</h3>
                <ul className="space-y-1 text-sm">
                  <li>✅ Colonne animation ajoutée à la base de données</li>
                  <li>⚠️ Redirections peuvent encore avoir des problèmes</li>
                  <li>⚠️ Vérifier les permissions des APIs</li>
                </ul>
              </div>
              
              <button 
                onClick={runChecks}
                className="w-full py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Relancer les tests
              </button>
            </div>
          )}
        </div>
        
        <div className="mt-8 text-center">
          <a href="/dashboard" className="text-blue-600 hover:underline">
            → Retour au Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}