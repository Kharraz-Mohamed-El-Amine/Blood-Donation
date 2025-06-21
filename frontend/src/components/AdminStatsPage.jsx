import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

function AdminStatsPage() {
  const { isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const fetchStats = async () => {
      if (!isAdmin) {
        setError("Accès refusé. Seuls les administrateurs peuvent consulter les statistiques.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      try {
        const response = await fetch(`${API_BASE_URL}/stats/`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des statistiques');
        }
        const data = await response.json();
        setStats(data);
      } catch (err) {
        console.error("Erreur chargement stats:", err);
        setError(err.message || "Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [isAdmin]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mb-6"></div>
          <p className="text-gray-600 text-xl font-medium">Chargement des statistiques...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-blue-100 text-center max-w-md">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-800 mb-3">Accès Administrateur Requis</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent consulter les statistiques.</p>
        </div>
      </div>
    );
  }

  if (error && error !== "Accès refusé. Seuls les administrateurs peuvent consulter les statistiques.") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border border-red-100 text-center max-w-md">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-red-800 mb-3">Erreur de Chargement</h3>
          <p className="text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header avec animation */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl mb-6 shadow-lg">
            <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <h1 className="text-4xl sm:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 mb-4">
            Tableau de Bord
          </h1>
          <p className="text-gray-600 text-xl max-w-2xl mx-auto">
            Vue d'ensemble complète de votre plateforme de don de sang
          </p>
        </div>

        {stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {/* Carte Utilisateurs */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-blue-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-1">Utilisateurs</h3>
                  <p className="text-blue-100 text-sm">Total des membres</p>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.total_utilisateurs}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{stats.utilisateurs_normaux} normaux</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {stats.administrateurs} admins
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Propositions */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-green-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-green-500 to-green-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-1">Propositions</h3>
                  <p className="text-green-100 text-sm">Offres de don</p>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.total_propositions_don}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{stats.propositions_en_attente} en attente</span>
                  <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {stats.propositions_affectees} affectées
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Demandes */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-purple-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-purple-500 to-purple-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-1">Demandes</h3>
                  <p className="text-purple-100 text-sm">Besoins urgents</p>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.total_demandes_don}</div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{stats.demandes_en_attente} en attente</span>
                  <span className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-semibold">
                    {stats.demandes_affectees} traitées
                  </span>
                </div>
              </div>
            </div>

            {/* Carte Affectations */}
            <div className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-orange-200 transform hover:-translate-y-1">
              <div className="bg-gradient-to-br from-orange-500 to-orange-600 p-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-20 h-20 bg-white opacity-10 rounded-full -mr-10 -mt-10"></div>
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 bg-white bg-opacity-20 rounded-xl flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                  </div>
                  <h3 className="text-white text-lg font-bold mb-1">Affectations</h3>
                  <p className="text-orange-100 text-sm">Connexions réalisées</p>
                </div>
              </div>
              <div className="p-6">
                <div className="text-3xl font-bold text-gray-800 mb-2">{stats.total_affectations}</div>
                <div className="text-sm text-gray-600">
                  Associations donneur/demandeur créées
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-800 mb-4">Aucune Statistique Disponible</h3>
            <p className="text-gray-600 text-lg">
              Les données statistiques apparaîtront ici une fois que votre plateforme sera active.
            </p>
          </div>
        )}

        {/* Section supplémentaire avec informations */}
        {stats && (
          <div className="mt-12 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Résumé de l'Activité
              </h2>
            </div>
            <div className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600 mb-2">
                    {Math.round((stats.propositions_affectees / Math.max(stats.total_propositions_don, 1)) * 100)}%
                  </div>
                  <p className="text-gray-600">Taux de traitement des propositions</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {Math.round((stats.demandes_affectees / Math.max(stats.total_demandes_don, 1)) * 100)}%
                  </div>
                  <p className="text-gray-600">Taux de satisfaction des demandes</p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {Math.round((stats.administrateurs / Math.max(stats.total_utilisateurs, 1)) * 100)}%
                  </div>
                  <p className="text-gray-600">Ratio administrateurs/utilisateurs</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminStatsPage;