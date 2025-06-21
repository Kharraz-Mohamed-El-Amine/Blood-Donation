import React from 'react';
import { useAuth } from '../context/AuthContext';

function AppHeader({ onNavigate }) {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <header className="w-full bg-gradient-to-r from-red-600 via-red-700 to-red-800 text-white shadow-2xl">
      <div className="container mx-auto px-6 py-4">
        <div className="flex justify-between items-center">
          {/* Logo et titre */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-full backdrop-blur-sm">
              <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Don de Sang</h1>
              <p className="text-red-100 text-xs font-light">Sauvez des vies, donnez de l'espoir</p>
            </div>
          </div>

          {/* Navigation */}
          {isAuthenticated && (
            <nav className="hidden md:flex items-center space-x-1">
              <button
                onClick={() => onNavigate('dashboard')}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm active:scale-95"
              >
                🏠 Accueil
              </button>
              
              {user.role === 'normal' && (
                <>
                  <button
                    onClick={() => onNavigate('proposer-don')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm active:scale-95 border border-white/20"
                  >
                    ❤️ Proposer un Don
                  </button>
                  <button
                    onClick={() => onNavigate('demander-don')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm active:scale-95"
                  >
                    🩸 Demander un Don
                  </button>
                </>
              )}
              
              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => onNavigate('affectations')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm active:scale-95 border border-white/20"
                  >
                    ⚙️ Gérer Affectations
                  </button>
                  <button
                    onClick={() => onNavigate('statistiques')}
                    className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:backdrop-blur-sm active:scale-95"
                  >
                    📊 Statistiques
                  </button>
                </>
              )}
            </nav>
          )}

          {/* Profil utilisateur */}
          {isAuthenticated && (
            <div className="flex items-center space-x-4">
              {/* Informations utilisateur */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <span className="text-sm font-semibold">
                    {user.email.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium">{user.email}</p>
                  <p className="text-xs text-red-100 capitalize">
                    {user.role === 'admin' ? '👑 Administrateur' : '👤 Utilisateur'}
                  </p>
                </div>
              </div>

              {/* Bouton de déconnexion */}
              <button
                onClick={logout}
                className="group relative px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-lg font-medium text-sm transition-all duration-200 hover:bg-white/20 hover:scale-105 active:scale-95"
              >
                <span className="flex items-center space-x-2">
                  <svg className="w-4 h-4 transition-transform group-hover:rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Déconnexion</span>
                </span>
              </button>
            </div>
          )}
        </div>

        {/* Navigation mobile */}
        {isAuthenticated && (
          <nav className="md:hidden mt-4 pt-4 border-t border-white/20">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onNavigate('dashboard')}
                className="p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 text-center"
              >
                🏠 Accueil
              </button>
              
              {user.role === 'normal' && (
                <>
                  <button
                    onClick={() => onNavigate('proposer-don')}
                    className="p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 text-center border border-white/20"
                  >
                    ❤️ Proposer
                  </button>
                  <button
                    onClick={() => onNavigate('demander-don')}
                    className="p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 text-center"
                  >
                    🩸 Demander
                  </button>
                </>
              )}
              
              {user.role === 'admin' && (
                <>
                  <button
                    onClick={() => onNavigate('affectations')}
                    className="p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 text-center border border-white/20"
                  >
                    ⚙️ Affectations
                  </button>
                  <button
                    onClick={() => onNavigate('statistiques')}
                    className="p-3 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-white/10 text-center"
                  >
                    📊 Stats
                  </button>
                </>
              )}
            </div>
          </nav>
        )}
      </div>
    </header>
  );
}

export default AppHeader;