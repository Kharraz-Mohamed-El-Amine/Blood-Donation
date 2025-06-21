import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Pour obtenir l'ID de l'utilisateur
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css"; // Styles du sélecteur de date

function DonationRequestForm() {
  const { user } = useAuth(); // Récupère les infos de l'utilisateur connecté
  const [groupesSanguins, setGroupesSanguins] = useState([]); // Pour stocker les groupes sanguins de l'API
  
  const [idGroupeSanguinRequis, setIdGroupeSanguinRequis] = useState('');
  const [quantiteDemandeeMl, setQuantiteDemandeeMl] = useState('');
  const [localisationDemande, setLocalisationDemande] = useState('');
  const [urgence, setUrgence] = useState('moyenne'); // Statut par défaut
  const [description, setDescription] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  // Effet pour charger les groupes sanguins depuis l'API au chargement du composant
  useEffect(() => {
    const fetchGroupesSanguins = async () => {
      try {
        const response = await fetch('http://localhost:8000/groupesanguin/');
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des groupes sanguins');
        }
        const data = await response.json();
        setGroupesSanguins(data);
      } catch (err) {
        setError(err.message);
      }
    };
    fetchGroupesSanguins();
  }, []); // Le tableau vide [] assure que l'effet ne s'exécute qu'une fois au montage

  // Gère la soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');

    if (!user || !user.id) {
      setError("Erreur: Impossible de déterminer l'utilisateur. Veuillez vous reconnecter.");
      return;
    }
    if (!idGroupeSanguinRequis || !quantiteDemandeeMl || !description) {
      setError("Veuillez remplir tous les champs obligatoires (Groupe Sanguin, Quantité, Description).");
      return;
    }
    if (isNaN(quantiteDemandeeMl) || parseInt(quantiteDemandeeMl) <= 0) {
      setError("La quantité demandée doit être un nombre positif.");
      return;
    }

    try {
      const newRequest = {
        id_utilisateur: user.id,
        id_groupe_sanguin_requis: parseInt(idGroupeSanguinRequis),
        quantite_demandee_ml: parseInt(quantiteDemandeeMl),
        localisation_demande: localisationDemande,
        urgence: urgence,
        description: description,
      };

      const response = await fetch('http://localhost:8000/demandesdon/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // 'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(newRequest),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de la création de la demande de don');
      }

      const data = await response.json();
      setMessage('Demande de don créée avec succès ! ID: ' + data.id);
      // Réinitialise le formulaire
      setIdGroupeSanguinRequis('');
      setQuantiteDemandeeMl('');
      setLocalisationDemande('');
      setUrgence('moyenne');
      setDescription('');

    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-lg mx-auto">
      <h2 className="text-3xl font-bold text-purple-800 mb-6 text-center">Faire une Demande de Don</h2>
      <form onSubmit={handleSubmit}>

        {/* Champ Groupe Sanguin Requis */}
        <div className="mb-4">
          <label htmlFor="groupeSanguin" className="block text-gray-700 text-sm font-semibold mb-2">
            Groupe Sanguin Requis: <span className="text-red-500">*</span>
          </label>
          <select
            id="groupeSanguin"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={idGroupeSanguinRequis}
            onChange={(e) => setIdGroupeSanguinRequis(e.target.value)}
            required
          >
            <option value="">Sélectionnez un groupe</option>
            {groupesSanguins.map((groupe) => (
              <option key={groupe.id} value={groupe.id}>
                {groupe.nom_groupe}
              </option>
            ))}
          </select>
          {groupesSanguins.length === 0 && <p className="text-sm text-gray-500 mt-1">Aucun groupe sanguin disponible. Assurez-vous d'en créer via l'API backend.</p>}
        </div>

        {/* Champ Quantité Demandée */}
        <div className="mb-4">
          <label htmlFor="quantite" className="block text-gray-700 text-sm font-semibold mb-2">
            Quantité Demandée (ml): <span className="text-red-500">*</span>
          </label>
          <input
            type="number"
            id="quantite"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: 450"
            value={quantiteDemandeeMl}
            onChange={(e) => setQuantiteDemandeeMl(e.target.value)}
            required
            min="1"
          />
        </div>

        {/* Champ Localisation de la Demande */}
        <div className="mb-4">
          <label htmlFor="localisationDemande" className="block text-gray-700 text-sm font-semibold mb-2">
            Localisation (Ville ou Hôpital):
          </label>
          <input
            type="text"
            id="localisationDemande"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ex: Hôpital Central, Rabat"
            value={localisationDemande}
            onChange={(e) => setLocalisationDemande(e.target.value)}
          />
        </div>

        {/* Champ Urgence */}
        <div className="mb-4">
          <label htmlFor="urgence" className="block text-gray-700 text-sm font-semibold mb-2">
            Urgence:
          </label>
          <select
            id="urgence"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={urgence}
            onChange={(e) => setUrgence(e.target.value)}
          >
            <option value="faible">Faible</option>
            <option value="moyenne">Moyenne</option>
            <option value="élevée">Élevée</option>
            <option value="critique" className="text-red-600">Critique (Urgence absolue)</option> {/* Ajout d'une option */}
          </select>
        </div>

        {/* Champ Description */}
        <div className="mb-6">
          <label htmlFor="description" className="block text-gray-700 text-sm font-semibold mb-2">
            Description / Motif: <span className="text-red-500">*</span>
          </label>
          <textarea
            id="description"
            rows="3"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Décrivez pourquoi le don est nécessaire..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          ></textarea>
        </div>

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        {message && <p className="text-green-600 text-center mb-4">{message}</p>}

        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-2 px-4 rounded-lg hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition duration-300 font-semibold"
        >
          Soumettre la Demande
        </button>
      </form>
    </div>
  );
}

export default DonationRequestForm;
