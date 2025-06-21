import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

function DonationOfferForm() {
  const { user } = useAuth();
  const [disponibiliteDateHeure, setDisponibiliteDateHeure] = useState(null);
  const [localisationProposition, setLocalisationProposition] = useState('');
  const [notes, setNotes] = useState('');
  const [status, setStatus] = useState('en attente');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsSubmitting(true);

    if (!user || !user.id) {
      setError("Erreur: Impossible de déterminer l'utilisateur. Veuillez vous reconnecter.");
      setIsSubmitting(false);
      return;
    }
    if (!disponibiliteDateHeure || !localisationProposition) {
      setError("Veuillez remplir tous les champs obligatoires (Date/Heure, Localisation).");
      setIsSubmitting(false);
      return;
    }

    try {
      const newOffer = {
        id_utilisateur: user.id,
        disponibilite_date_heure: disponibiliteDateHeure.toISOString(),
        localisation_proposition: localisationProposition,
        notes: notes,
        statut: status,
      };

      const response = await fetch('http://localhost:8000/propositionsdon/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newOffer),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création de la proposition de don');
      }

      const data = await response.json();
      setMessage('Proposition de don créée avec succès ! ID: ' + data.id);
      setDisponibiliteDateHeure(null);
      setLocalisationProposition('');
      setNotes('');
      setStatus('en attente');

    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      {/* En-tête inspirant */}
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-red-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
          <span className="text-2xl">❤️</span>
        </div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Proposer un Don de Sang</h2>
        <p className="text-gray-600 max-w-md mx-auto">
          Votre générosité peut sauver jusqu'à 3 vies. Chaque goutte compte pour faire la différence.
        </p>
      </div>

      {/* Statistiques motivantes */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <div className="text-center p-4 bg-gradient-to-br from-red-50 to-pink-50 rounded-xl border border-red-100">
          <div className="text-2xl mb-2">💝</div>
          <div className="text-sm font-medium text-red-700">3 vies sauvées</div>
          <div className="text-xs text-gray-600">par don</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl border border-blue-100">
          <div className="text-2xl mb-2">⏱️</div>
          <div className="text-sm font-medium text-blue-700">10-15 min</div>
          <div className="text-xs text-gray-600">durée du don</div>
        </div>
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl border border-green-100">
          <div className="text-2xl mb-2">🔄</div>
          <div className="text-sm font-medium text-green-700">56 jours</div>
          <div className="text-xs text-gray-600">entre 2 dons</div>
        </div>
      </div>

      {/* Formulaire principal */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-red-500 to-pink-500 p-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="mr-3">📅</span>
              Informations de Disponibilité
            </h3>
            <p className="text-red-100 text-sm mt-1">Indiquez quand vous êtes disponible pour donner</p>
          </div>
          
          <div className="p-6 space-y-6">
            {/* Date et Heure */}
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-3">
                <span className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center mr-3 text-sm">
                  📅
                </span>
                Date et Heure de Disponibilité
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={disponibiliteDateHeure}
                  onChange={(date) => setDisponibiliteDateHeure(date)}
                  showTimeSelect
                  dateFormat="dd/MM/yyyy à HH:mm"
                  minDate={new Date()}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-red-400 focus:ring-4 focus:ring-red-100 transition-all duration-200 text-gray-700"
                  placeholderText="Cliquez pour sélectionner une date et heure"
                  required
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <span className="mr-1">💡</span>
                Choisissez un moment où vous serez libre pendant au moins 1h
              </p>
            </div>

            {/* Localisation */}
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-3">
                <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-sm">
                  📍
                </span>
                Localisation
                <span className="text-red-500 ml-1">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 transition-all duration-200 text-gray-700 pl-12"
                  placeholder="Ville, hôpital ou centre de don"
                  value={localisationProposition}
                  onChange={(e) => setLocalisationProposition(e.target.value)}
                  required
                />
                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                  <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <span className="mr-1">🏥</span>
                Exemple: "Centre de Transfusion Sanguine de Tanger" ou "Hôpital Mohamed 6"
              </p>
            </div>
          </div>
        </div>

        {/* Section Notes */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="bg-gradient-to-r from-amber-400 to-orange-400 p-6">
            <h3 className="text-xl font-bold text-white flex items-center">
              <span className="mr-3">📝</span>
              Informations Complémentaires
            </h3>
            <p className="text-orange-100 text-sm mt-1">Ajoutez des détails si nécessaire (optionnel)</p>
          </div>
          
          <div className="p-6">
            <div>
              <label className="flex items-center text-gray-700 font-semibold mb-3">
                <span className="w-6 h-6 bg-amber-100 rounded-full flex items-center justify-center mr-3 text-sm">
                  💬
                </span>
                Notes et Commentaires
              </label>
              <textarea
                rows="4"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-amber-400 focus:ring-4 focus:ring-amber-100 transition-all duration-200 text-gray-700 resize-none"
                placeholder="Contraintes horaires, préférences, informations médicales importantes..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
              <p className="text-sm text-gray-500 mt-2 flex items-center">
                <span className="mr-1">📋</span>
                Mentionnez tout ce qui pourrait aider à organiser votre don
              </p>
            </div>
          </div>
        </div>

        {/* Messages d'état */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-red-400 mr-3 text-xl">⚠️</span>
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {message && (
          <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
            <div className="flex items-center">
              <span className="text-green-400 mr-3 text-xl">✅</span>
              <p className="text-green-700 font-medium">{message}</p>
            </div>
          </div>
        )}

        {/* Bouton de soumission */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6">
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full group relative overflow-hidden rounded-xl py-4 px-6 font-bold text-lg transition-all duration-300 ${
              isSubmitting 
                ? 'bg-gray-400 cursor-not-allowed' 
                : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 active:scale-95 shadow-lg hover:shadow-xl'
            } text-white`}
          >
            <div className="flex items-center justify-center space-x-3">
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <span className="text-2xl group-hover:scale-110 transition-transform">❤️</span>
                  <span>Proposer mon Don</span>
                  <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </>
              )}
            </div>
            
            {/* Effet de brillance au hover */}
            <div className="absolute inset-0 -top-full group-hover:top-0 bg-gradient-to-b from-white/20 to-transparent transition-all duration-500"></div>
          </button>
          
          <p className="text-center text-gray-500 text-sm mt-4">
            🔒 Vos informations sont sécurisées et confidentielles
          </p>
        </div>
      </form>

      {/* Section motivante finale */}
      <div className="mt-8 p-6 bg-gradient-to-r from-red-50 to-pink-50 rounded-2xl border border-red-100">
        <div className="text-center">
          <h4 className="text-lg font-bold text-red-800 mb-2">Merci pour votre générosité ! 🙏</h4>
          <p className="text-red-700 text-sm">
            En proposant votre don, vous rejoignez une communauté de héros du quotidien qui sauvent des vies.
          </p>
        </div>
      </div>
    </div>
  );
}

export default DonationOfferForm;