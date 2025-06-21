import React, { createContext, useContext, useState, useEffect } from 'react';

// Crée le contexte d'authentification
const AuthContext = createContext(null);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => useContext(AuthContext);

// Fournisseur d'authentification qui enveloppera toute l'application
export const AuthProvider = ({ children }) => {
  // État pour stocker l'utilisateur connecté (email, id, et rôle)
  const [user, setUser] = useState(null);
  // État pour indiquer si l'authentification est en cours de chargement
  const [loading, setLoading] = useState(true);

  // Fonction de connexion : reçoit un objet utilisateur avec email, id, et role
  const login = (userData) => { 
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData)); // Stocke l'objet utilisateur complet
  };

  // Fonction de déconnexion
  const logout = () => {
    setUser(null);
    localStorage.removeItem('user'); // Supprime l'utilisateur du stockage local
  };

  // Effet pour vérifier si un utilisateur est déjà connecté au chargement de l'application
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // S'assurer que les propriétés essentielles sont présentes après parsing
        if (parsedUser && parsedUser.id && parsedUser.email && parsedUser.role) {
            setUser(parsedUser);
        } else {
            console.warn("Données utilisateur incomplètes dans localStorage. Nettoyage.");
            localStorage.removeItem('user'); // Nettoie si les données sont incomplètes/corrompues
        }
      } catch (e) {
        console.error("Échec de l'analyse des données utilisateur depuis localStorage", e);
        localStorage.removeItem('user'); // Nettoie si les données sont corrompues
      }
    }
    setLoading(false); // Fin du chargement
  }, []); // Le tableau vide [] assure que l'effet ne s'exécute qu'une fois au montage

  // Valeurs fournies par le contexte
  const authValue = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user, // true si user n'est pas null
    isAdmin: user && user.role === 'admin', // true si l'utilisateur est admin
  };

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children} {/* Rendre les enfants une fois que le chargement est terminé */}
    </AuthContext.Provider>
  );
};
