import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Pour obtenir l'ID de l'admin
    
function AdminAssignmentPage() {
  const { user, isAdmin } = useAuth(); // Récupère l'utilisateur connecté et son rôle
  const [propositions, setPropositions] = useState([]);
  const [demandes, setDemandes] = useState([]);
  const [affectations, setAffectations] = useState([]); // Pour afficher les affectations existantes
  const [selectedProposition, setSelectedProposition] = useState('');
  const [selectedDemande, setSelectedDemande] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const API_BASE_URL = 'http://localhost:8000'; // URL de votre backend FastAPI

  // Fonction pour charger toutes les données nécessaires
  const fetchData = async () => {
    if (!isAdmin) {
      setError("Accès refusé. Seuls les administrateurs peuvent gérer les affectations.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');
    try {
      // Récupérer les propositions de don
      const propositionsRes = await fetch(`${API_BASE_URL}/propositionsdon/`);
      if (!propositionsRes.ok) throw new Error('Erreur chargement propositions');
      const propositionsData = await propositionsRes.json();
      setPropositions(propositionsData.filter(p => p.statut === 'en attente')); // Filtrer les "en attente"

      // Récupérer les demandes de don
      const demandesRes = await fetch(`${API_BASE_URL}/demandesdon/`);
      if (!demandesRes.ok) throw new Error('Erreur chargement demandes');
      const demandesData = await demandesRes.json();
      setDemandes(demandesData.filter(d => d.statut === 'en attente')); // Filtrer les "en attente"

      // Récupérer les affectations existantes
      const affectationsRes = await fetch(`${API_BASE_URL}/affectationsdon/`);
      if (!affectationsRes.ok) throw new Error('Erreur chargement affectations');
      const affectationsData = await affectationsRes.json();
      setAffectations(affectationsData);

    } catch (err) {
      console.error("Erreur lors du chargement des données :", err);
      setError(err.message || "Erreur lors du chargement des données.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isAdmin]); // Re-fetch si le statut admin change

  // Gère la soumission du formulaire d'affectation
  const handleSubmitAssignment = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!selectedProposition || !selectedDemande) {
      setError("Veuillez sélectionner une proposition et une demande.");
      return;
    }
    if (!user || !user.id || !isAdmin) {
      setError("Erreur d'authentification ou d'autorisation. Veuillez vous reconnecter en tant qu'admin.");
      return;
    }

    try {
      const newAssignment = {
        id_proposition_don: parseInt(selectedProposition),
        id_demande_don: parseInt(selectedDemande),
        id_administrateur: user.id, // L'ID de l'admin connecté
        statut_affectation: 'en cours',
        notes_administrateur: 'Créée via le tableau de bord administrateur.'
      };

      const response = await fetch(`${API_BASE_URL}/affectationsdon/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // En production, vous ajouteriez ici le token d'autorisation JWT
          // 'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newAssignment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création de l\'affectation');
      }

      const data = await response.json();
      setMessage('Affectation créée avec succès ! ID: ' + data.id);
      setSelectedProposition('');
      setSelectedDemande('');
      fetchData(); // Recharger les données après une affectation réussie
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-red-600 mb-4"></div>
          <p className="text-gray-600 text-lg">Chargement des données d'affectation...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-2xl shadow-2xl border border-red-100 text-center max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Accès Restreint</h3>
          <p className="text-gray-600">Seuls les administrateurs peuvent gérer les affectations.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-red-600 to-red-800 mb-4">
            Gestion des Affectations
          </h1>
          <p className="text-gray-600 text-lg">Associez les propositions et demandes de don pour sauver des vies</p>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 rounded-r-lg shadow-sm animate-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-red-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
              </svg>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-500 rounded-r-lg shadow-sm animate-pulse">
            <div className="flex items-center">
              <svg className="w-5 h-5 text-green-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Formulaire d'Affectation */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-red-600 to-red-700 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer une Affectation
              </h2>
              <p className="text-red-100 mt-2">Associez une proposition à une demande</p>
            </div>

            <div className="p-6 space-y-6">
              {/* Sélection Proposition */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                  Proposition de Don
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={selectedProposition}
                  onChange={(e) => setSelectedProposition(e.target.value)}
                  required
                >
                  <option value="">-- Choisir une proposition --</option>
                  {propositions.map((prop) => (
                    <option key={prop.id} value={prop.id}>
                      Prop. #{prop.id} - Utilisateur: {prop.id_utilisateur} - {prop.localisation_proposition}
                    </option>
                  ))}
                </select>
                {propositions.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aucune proposition de don en attente</p>
                )}
              </div>

              {/* Sélection Demande */}
              <div className="space-y-2">
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  <svg className="w-4 h-4 mr-2 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                  </svg>
                  Demande de Don
                </label>
                <select
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all duration-200 bg-white"
                  value={selectedDemande}
                  onChange={(e) => setSelectedDemande(e.target.value)}
                  required
                >
                  <option value="">-- Choisir une demande --</option>
                  {demandes.map((dem) => (
                    <option key={dem.id} value={dem.id}>
                      Dem. #{dem.id} - Groupe: {dem.id_groupe_sanguin_requis} - {dem.quantite_demandee_ml}ml - {dem.urgence}
                    </option>
                  ))}
                </select>
                {demandes.length === 0 && (
                  <p className="text-sm text-gray-500 italic">Aucune demande de don en attente</p>
                )}
              </div>

              <button
                onClick={handleSubmitAssignment}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 text-white py-3 px-6 rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center justify-center"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Créer l'Affectation
              </button>
            </div>
          </div>

          {/* Liste des Affectations */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-6">
              <h2 className="text-2xl font-bold text-white flex items-center">
                <svg className="w-8 h-8 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                Affectations Actuelles
              </h2>
              <p className="text-blue-100 mt-2">Historique des associations créées</p>
            </div>

            <div className="p-6">
              {affectations.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <p className="text-gray-500 text-lg">Aucune affectation créée pour l'instant</p>
                  <p className="text-gray-400 text-sm mt-2">Les nouvelles affectations apparaîtront ici</p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {affectations.map((aff, index) => (
                    <div key={aff.id} className="bg-gradient-to-r from-gray-50 to-gray-100 p-4 rounded-xl border border-gray-200 hover:shadow-md transition-shadow duration-200">
                      <div className="flex items-center justify-between mb-3">
                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                          Affectation #{aff.id}
                        </span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          aff.statut_affectation === 'en cours' ? 'bg-yellow-100 text-yellow-800' :
                          aff.statut_affectation === 'terminé' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {aff.statut_affectation}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">Proposition</p>
                          {/* CORRECTION ICI: S'assurer que la valeur est convertie en chaîne si elle est numéerique */}
                          <p className="font-semibold text-gray-800">#{aff.id_proposition_don ? aff.id_proposition_don.toString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Demande</p>
                          {/* CORRECTION ICI: S'assurer que la valeur est convertie en chaîne si elle est numéerique */}
                          <p className="font-semibold text-gray-800">#{aff.id_demande_don ? aff.id_demande_don.toString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Admin</p>
                          {/* CORRECTION ICI: S'assurer que la valeur est convertie en chaîne si elle est numéerique */}
                          <p className="font-semibold text-gray-800">#{aff.id_administrateur ? aff.id_administrateur.toString() : 'N/A'}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">Date</p>
                          <p className="font-semibold text-gray-800">{new Date(aff.date_affectation).toLocaleDateString()}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminAssignmentPage;
