'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2, Database, Search, RefreshCw } from 'lucide-react';

const tables = [
  { name: 'users', displayName: 'Utilisateurs', description: 'Utilisateurs de l\'application' },
  { name: 'links', displayName: 'Liens', description: 'Liens créés par les utilisateurs' },
  { name: 'multi_links', displayName: 'Multi-liens', description: 'Sous-liens dans un lien principal' },
  { name: 'clicks', displayName: 'Clics', description: 'Enregistrements de clics' },
  { name: 'folders', displayName: 'Dossiers', description: 'Dossiers pour organiser les liens' },
  { name: 'files', displayName: 'Fichiers', description: 'Fichiers uploadés' },
  { name: 'analytics_events', displayName: 'Événements Analytics', description: 'Événements analytics détaillés' },
  { name: 'analytics_summary', displayName: 'Résumés Analytics', description: 'Statistiques agrégées par jour' },
  { name: 'templates', displayName: 'Templates', description: 'Templates de pages' },
  { name: 'user_profiles', displayName: 'Profils Utilisateurs', description: 'Profils personnalisés' },
  { name: 'user_themes', displayName: 'Thèmes Utilisateurs', description: 'Préférences de thème' },
  { name: 'password_protections', displayName: 'Protections par Mot de Passe', description: 'Protection par mot de passe' },
  { name: 'password_attempts', displayName: 'Tentatives de Connexion', description: 'Tentatives de connexion' },
  { name: 'link_schedules', displayName: 'Programmation de Liens', description: 'Programmation de liens' },
  { name: 'scheduled_jobs', displayName: 'Jobs Programmés', description: 'Jobs programmés' },
  { name: 'custom_domains', displayName: 'Domaines Personnalisés', description: 'Domaines personnalisés' },
  { name: 'notifications', displayName: 'Notifications', description: 'Notifications' },
  { name: 'notification_preferences', displayName: 'Préférences de Notification', description: 'Préférences de notification' },
  { name: 'push_subscriptions', displayName: 'Abonnements Push', description: 'Abonnements push' },
  { name: 'teams', displayName: 'Équipes', description: 'Équipes' },
  { name: 'team_invitations', displayName: 'Invitations d\'Équipe', description: 'Invitations d\'équipe' },
  { name: 'team_templates', displayName: 'Templates d\'Équipe', description: 'Templates d\'équipe' },
  { name: 'team_analytics', displayName: 'Analytics d\'Équipe', description: 'Analytics d\'équipe' }
];

export default function DatabasePage() {
  const [selectedTable, setSelectedTable] = useState<string>('');
  const [data, setData] = useState<any[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize] = useState(50);
  
  const supabase = createClientComponentClient();

  const fetchTableData = async (tableName: string) => {
    setLoading(true);
    setError(null);
    try {
      const from = page * pageSize;
      const to = from + pageSize - 1;
      
      const { data: tableData, error: fetchError, count } = await supabase
        .from(tableName)
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false, nullsFirst: false })
        .limit(pageSize);

      if (fetchError) throw fetchError;

      if (tableData && tableData.length > 0) {
        setColumns(Object.keys(tableData[0]));
        setData(tableData);
        setTotalCount(count || 0);
      } else {
        setColumns([]);
        setData([]);
        setTotalCount(0);
      }
    } catch (err: any) {
      console.error('Error fetching table data:', err);
      setError(err.message);
      setData([]);
      setColumns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  }, [selectedTable, page]);

  const handleTableSelect = (tableName: string) => {
    setSelectedTable(tableName);
    setPage(0);
    setSearchQuery('');
  };

  const handleRefresh = () => {
    if (selectedTable) {
      fetchTableData(selectedTable);
    }
  };

  const filteredData = data.filter(row => {
    if (!searchQuery) return true;
    return Object.values(row).some(value => 
      String(value).toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6 flex items-center gap-2">
        <Database className="w-8 h-8" />
        Base de données Supabase
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tables disponibles</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {tables.map((table) => (
                  <Button
                    key={table.name}
                    variant={selectedTable === table.name ? 'default' : 'outline'}
                    className="w-full justify-start"
                    onClick={() => handleTableSelect(table.name)}
                  >
                    {table.displayName}
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-3">
          {selectedTable ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>
                    {tables.find(t => t.name === selectedTable)?.displayName || selectedTable}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <div className="relative">
                      <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Rechercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-8 w-64"
                      />
                    </div>
                    <Button
                      onClick={handleRefresh}
                      size="icon"
                      variant="outline"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {tables.find(t => t.name === selectedTable)?.description}
                </p>
                <p className="text-sm text-muted-foreground">
                  Total: {totalCount} enregistrements
                </p>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : error ? (
                  <div className="text-red-500 text-center py-8">
                    Erreur: {error}
                  </div>
                ) : filteredData.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune donnée trouvée
                  </div>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse">
                        <thead>
                          <tr className="border-b">
                            {columns.map((col) => (
                              <th key={col} className="text-left p-2 font-medium">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {filteredData.map((row, i) => (
                            <tr key={i} className="border-b hover:bg-muted/50">
                              {columns.map((col) => (
                                <td key={col} className="p-2 text-sm">
                                  <div className="max-w-xs truncate">
                                    {typeof row[col] === 'object' 
                                      ? JSON.stringify(row[col])
                                      : String(row[col] || '-')}
                                  </div>
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {totalPages > 1 && (
                      <div className="flex justify-center items-center gap-2 mt-4">
                        <Button
                          onClick={() => setPage(p => Math.max(0, p - 1))}
                          disabled={page === 0}
                          variant="outline"
                          size="sm"
                        >
                          Précédent
                        </Button>
                        <span className="text-sm">
                          Page {page + 1} sur {totalPages}
                        </span>
                        <Button
                          onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))}
                          disabled={page === totalPages - 1}
                          variant="outline"
                          size="sm"
                        >
                          Suivant
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Database className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">
                  Sélectionnez une table pour voir ses données
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}