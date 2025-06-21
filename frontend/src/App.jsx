import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import AppHeader from './components/AppHeader';
import DonationOfferForm from './components/DonationOfferForm';
import DonationRequestForm from './components/DonationRequestForm';
import AdminAssignmentPage from './components/AdminAssignmentPage';
import AdminStatsPage from './components/AdminStatsPage';
import RegistrationPage from './components/RegistrationPage';
import { useAuth } from './context/AuthContext';

function App() {
  const { user, isAuthenticated, isAdmin, loading } = useAuth();
  const [currentView, setCurrentView] = useState('login');

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentView('dashboard');
    } else {
      if (currentView !== 'register') {
        setCurrentView('login');
      }
    }
  }, [isAuthenticated]);

  const handleNavigate = (view) => {
    setCurrentView(view);
  };

  // Écran de chargement amélioré
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-pink-100">
        <div className="text-center">
          <div className="relative w-16 h-16 mx-auto mb-4">
            <div className="absolute inset-0 border-4 border-red-200 rounded-full animate-pulse"></div>
            <div className="absolute inset-0 border-4 border-red-600 rounded-full border-t-transparent animate-spin"></div>
            <div className="absolute inset-2 bg-red-600 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-white animate-pulse" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
          </div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Don de Sang</h2>
          <p className="text-red-600 font-medium">Chargement de l'application...</p>
        </div>
      </div>
    );
  }

  // Pages d'authentification avec design amélioré
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {currentView === 'login' && <LoginPage onNavigate={handleNavigate} />}
          {currentView === 'register' && <RegistrationPage onNavigate={handleNavigate} />}
        </div>
      </div>
    );
  }

  // Fonction pour obtenir l'icône selon la vue actuelle
  const getViewIcon = (view) => {
    const icons = {
      'proposer-don': '❤️',
      'demander-don': '🩸',
      'affectations': '⚙️',
      'statistiques': '📊'
    };
    return icons[view] || '🏠';
  };

  // Titre de la page selon la vue
  const getViewTitle = (view) => {
    const titles = {
      'dashboard': 'Tableau de Bord',
      'proposer-don': 'Proposer un Don',
      'demander-don': 'Demander un Don',
      'affectations': 'Gérer les Affectations',
      'statistiques': 'Statistiques'
    };
    return titles[view] || 'Accueil';
  };

  // Rendu de l'application authentifiée
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-red-50/30 to-pink-50/50">
      <AppHeader onNavigate={handleNavigate} />
      
      {/* Breadcrumb */}
      <div className="container mx-auto px-6 pt-6">
        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-4">
          <span>🏠</span>
          <span>Accueil</span>
          {currentView !== 'dashboard' && (
            <>
              <span>/</span>
              <span className="flex items-center space-x-1">
                <span>{getViewIcon(currentView)}</span>
                <span className="font-medium text-red-700">{getViewTitle(currentView)}</span>
              </span>
            </>
          )}
        </div>
      </div>

      <main className="container mx-auto px-6 pb-8">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/50 overflow-hidden">
          
          {/* Dashboard */}
          {currentView === 'dashboard' && (
            <div className="p-8">
              {/* En-tête de bienvenue */}
              <div className="text-center mb-12">
                <div className="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <span className="text-3xl font-bold text-white">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <h2 className="text-4xl font-bold text-gray-800 mb-3">
                  Bienvenue, {user.email.split('@')[0]} !
                </h2>
                <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-red-100 to-pink-100 rounded-full">
                  <span className="text-lg text-gray-700">
                    {isAdmin ? '👑 Administrateur' : '👤 Utilisateur'}
                  </span>
                </div>
              </div>

              {/* Actions selon le rôle */}
              {isAdmin ? (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Panneau Administrateur</h3>
                    <p className="text-gray-600 mb-8">Gérez les dons et consultez les statistiques</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div 
                      onClick={() => handleNavigate('affectations')}
                      className="group relative bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">⚙️</div>
                      <div className="relative z-10">
                        <h4 className="text-2xl font-bold mb-3">Gérer les Affectations</h4>
                        <p className="text-blue-100 mb-4">Assignez les donneurs aux demandeurs</p>
                        <div className="flex items-center text-sm font-medium">
                          <span>Accéder</span>
                          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => handleNavigate('statistiques')}
                      className="group relative bg-gradient-to-br from-amber-500 to-orange-500 rounded-2xl p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">📊</div>
                      <div className="relative z-10">
                        <h4 className="text-2xl font-bold mb-3">Consulter les Statistiques</h4>
                        <p className="text-orange-100 mb-4">Analysez les données de don</p>
                        <div className="flex items-center text-sm font-medium">
                          <span>Accéder</span>
                          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="text-center">
                    <h3 className="text-2xl font-bold text-gray-800 mb-2">Vos Actions</h3>
                    <p className="text-gray-600 mb-8">Sauvez des vies en donnant ou en demandant du sang</p>
                  </div>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <div 
                      onClick={() => handleNavigate('proposer-don')}
                      className="group relative bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">❤️</div>
                      <div className="relative z-10">
                        <h4 className="text-2xl font-bold mb-3">Proposer un Don</h4>
                        <p className="text-green-100 mb-4">Offrez votre sang pour sauver des vies</p>
                        <div className="flex items-center text-sm font-medium">
                          <span>Donner maintenant</span>
                          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div 
                      onClick={() => handleNavigate('demander-don')}
                      className="group relative bg-gradient-to-br from-red-500 to-pink-600 rounded-2xl p-8 text-white cursor-pointer transform transition-all duration-300 hover:scale-105 hover:shadow-2xl active:scale-95"
                    >
                      <div className="absolute top-4 right-4 text-4xl opacity-20 group-hover:opacity-30 transition-opacity">🩸</div>
                      <div className="relative z-10">
                        <h4 className="text-2xl font-bold mb-3">Faire une Demande</h4>
                        <p className="text-red-100 mb-4">Demandez du sang en cas de besoin</p>
                        <div className="flex items-center text-sm font-medium">
                          <span>Demander maintenant</span>
                          <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Statistiques rapides (pour tous) */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <h4 className="text-lg font-semibold text-gray-800 mb-4 text-center">Impact Global</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div className="bg-gradient-to-br from-red-50 to-pink-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-red-600 mb-1">💝</div>
                    <div className="text-sm text-gray-600">Chaque don peut sauver</div>
                    <div className="text-lg font-bold text-red-700">3 vies</div>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-blue-600 mb-1">⏰</div>
                    <div className="text-sm text-gray-600">Durée du don</div>
                    <div className="text-lg font-bold text-blue-700">10-15 min</div>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-4">
                    <div className="text-2xl font-bold text-green-600 mb-1">🔄</div>
                    <div className="text-sm text-gray-600">Fréquence possible</div>
                    <div className="text-lg font-bold text-green-700">Tous les 56 jours</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Autres vues avec conteneur uniforme */}
          {currentView !== 'dashboard' && (
            <div className="p-8">
              <div className="mb-6">
                <h2 className="text-3xl font-bold text-gray-800 flex items-center space-x-3">
                  <span className="text-4xl">{getViewIcon(currentView)}</span>
                  <span>{getViewTitle(currentView)}</span>
                </h2>
              </div>
              
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                {currentView === 'proposer-don' && <DonationOfferForm />}
                {currentView === 'demander-don' && <DonationRequestForm />}
                {currentView === 'affectations' && <AdminAssignmentPage />}
                {currentView === 'statistiques' && <AdminStatsPage />}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;