import React, { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

// Composant InputField défini en dehors pour éviter la re-création
const InputField = ({ label, id, type = "text", value, onChange, required = false, placeholder, children }) => (
  <div className="group">
    <label htmlFor={id} className="block text-gray-700 text-sm font-semibold mb-2 transition-colors group-focus-within:text-red-500">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    {children || (
      <input
        type={type}
        id={id}
        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        required={required}
      />
    )}
  </div>
);

function RegistrationPage({ onNavigate }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [email, setEmail] = useState('');
  const [motDePasse, setMotDePasse] = useState('');
  const [confirmMotDePasse, setConfirmMotDePasse] = useState('');
  const [adresse, setAdresse] = useState('');
  const [ville, setVille] = useState('');
  const [telephone, setTelephone] = useState('');
  const [dateNaissance, setDateNaissance] = useState(null);
  const [genre, setGenre] = useState('');
  const [idGroupeSanguin, setIdGroupeSanguin] = useState('');
  const [groupesSanguins, setGroupesSanguins] = useState([]);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  const API_BASE_URL = 'http://localhost:8000';

  useEffect(() => {
    const fetchGroupesSanguins = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/groupesanguin/`);
        if (!response.ok) {
          throw new Error('Erreur lors de la récupération des groupes sanguins');
        }
        const data = await response.json();
        setGroupesSanguins(data);
      } catch (err) {
        setError(err.message || 'Impossible de charger les groupes sanguins.');
      }
    };
    fetchGroupesSanguins();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setIsLoading(true);

    if (motDePasse !== confirmMotDePasse) {
      setError("Les mots de passe ne correspondent pas.");
      setIsLoading(false);
      return;
    }
    if (motDePasse.length < 6) {
      setError("Le mot de passe doit contenir au moins 6 caractères.");
      setIsLoading(false);
      return;
    }

    try {
      const newUser = {
        nom,
        prenom,
        email,
        mot_de_passe: motDePasse, // Le backend va le hacher
        role: "normal", // Par défaut, un utilisateur s'inscrit avec le rôle "normal"
        adresse,
        ville,
        telephone,
        date_naissance: dateNaissance ? dateNaissance.toISOString().split('T')[0] : null, // Format YYYY-MM-DD
        genre,
        id_groupe_sanguin: idGroupeSanguin ? parseInt(idGroupeSanguin) : null,
      };

      const response = await fetch(`${API_BASE_URL}/utilisateurs/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Erreur lors de l\'inscription');
      }

      const data = await response.json();
      setMessage(`Inscription réussie pour ${data.email}! Vous pouvez maintenant vous connecter.`);
      
      // Réinitialiser le formulaire
      setNom('');
      setPrenom('');
      setEmail('');
      setMotDePasse('');
      setConfirmMotDePasse('');
      setAdresse('');
      setVille('');
      setTelephone('');
      setDateNaissance(null);
      setGenre('');
      setIdGroupeSanguin('');
      setCurrentStep(1); // Revenir à la première étape après succès

    } catch (err) {
      // CORRECTION: Assurez-vous que le message d'erreur est une chaîne
      setError(err.message || String(err)); // Utilise err.message ou String(err) si c'est un objet inconnu
    } finally {
      setIsLoading(false);
    }
  };

  const nextStep = () => {
    // Validation de l'étape 1 avant de passer à la suivante
    if (currentStep === 1 && !validateStep1()) {
        setError("Veuillez remplir tous les champs obligatoires de l'étape 1.");
        return;
    }
    if (currentStep < 3) setCurrentStep(currentStep + 1);
    setError(''); // Réinitialiser les erreurs en changeant d'étape
    setMessage('');
  };

  const prevStep = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
    setError(''); // Réinitialiser les erreurs en changeant d'étape
    setMessage('');
  };

  const validateStep1 = () => {
    // Vérifier les champs obligatoires de l'étape 1
    if (!nom || !prenom || !email || !motDePasse || !confirmMotDePasse) {
        return false;
    }
    if (motDePasse !== confirmMotDePasse) {
        return false;
    }
    if (motDePasse.length < 6) {
        return false;
    }
    // Simple validation d'email (le backend fera une validation plus robuste)
    if (!email.includes('@') || !email.includes('.')) {
        return false;
    }
    return true;
  };

  const ProgressBar = () => (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-2">
        {[1, 2, 3].map((step) => (
          <div key={step} className="flex items-center">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
              currentStep >= step ? 'bg-red-500 text-white' : 'bg-gray-200 text-gray-600'
            }`}>
              {currentStep > step ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              ) : (
                step
              )}
            </div>
            {step < 3 && (
              <div className={`flex-1 h-1 mx-2 ${
                currentStep > step ? 'bg-red-500' : 'bg-gray-200'
              }`}></div>
            )}
          </div>
        ))}
      </div>
      <div className="flex justify-between text-xs text-gray-600">
        <span className="text-center w-1/3">Informations personnelles</span>
        <span className="text-center w-1/3">Coordonnées</span>
        <span className="text-center w-1/3">Finalisation</span>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-red-100 py-8 px-4 flex items-center justify-center">
      <div className="max-w-2xl w-full">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-2xl border border-red-100 relative overflow-hidden">
          {/* Accent décoratif */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>
          
          <div className="p-8">
            {/* En-tête */}
            <div className="text-center mb-8">
              <div className="bg-red-500 p-4 rounded-full shadow-lg inline-block mb-4">
                <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Devenir Donneur</h2>
              <p className="text-gray-600 text-sm">Rejoignez notre communauté de héros du quotidien</p>
            </div>

            <ProgressBar />

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Étape 1: Informations personnelles */}
              {currentStep === 1 && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Nom"
                      id="nom"
                      value={nom}
                      onChange={(e) => setNom(e.target.value)}
                      required
                      placeholder="Votre nom"
                    />
                    <InputField
                      label="Prénom"
                      id="prenom"
                      value={prenom}
                      onChange={(e) => setPrenom(e.target.value)}
                      required
                      placeholder="Votre prénom"
                    />
                  </div>

                  <InputField
                    label="Adresse email"
                    id="emailReg"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="votre.email@example.com"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Mot de passe"
                      id="motDePasseReg"
                      type="password"
                      value={motDePasse}
                      onChange={(e) => setMotDePasse(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                    <InputField
                      label="Confirmer le mot de passe"
                      id="confirmMotDePasseReg"
                      type="password"
                      value={confirmMotDePasse}
                      onChange={(e) => setConfirmMotDePasse(e.target.value)}
                      required
                      placeholder="••••••••"
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="ml-3 text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={nextStep}
                      disabled={!validateStep1()} // Désactiver si l'étape 1 n'est pas valide
                      className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Suivant
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 2: Coordonnées */}
              {currentStep === 2 && (
                <div className="space-y-6">
                  <InputField
                    label="Adresse"
                    id="adresse"
                    value={adresse}
                    onChange={(e) => setAdresse(e.target.value)}
                    placeholder="123 Rue de la Paix"
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Ville"
                      id="ville"
                      value={ville}
                      onChange={(e) => setVille(e.target.value)}
                      placeholder="Paris"
                    />
                    <InputField
                      label="Téléphone"
                      id="telephone"
                      type="tel"
                      value={telephone}
                      onChange={(e) => setTelephone(e.target.value)}
                      placeholder="+33 1 23 45 67 89"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputField
                      label="Date de naissance"
                      id="dateNaissance"
                    >
                      <DatePicker
                        selected={dateNaissance}
                        onChange={(date) => setDateNaissance(date)}
                        dateFormat="dd/MM/yyyy"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 bg-gray-50 focus:bg-white placeholder-gray-400"
                        placeholderText="JJ/MM/AAAA"
                        showYearDropdown
                        yearDropdownItemNumber={100}
                        scrollableYearDropdown
                      />
                    </InputField>

                    <InputField
                      label="Genre"
                      id="genre"
                    >
                      <select
                        id="genre"
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                        value={genre}
                        onChange={(e) => setGenre(e.target.value)}
                      >
                        <option value="">Sélectionnez</option>
                        <option value="Homme">Homme</option>
                        <option value="Femme">Femme</option>
                      </select>
                    </InputField>
                  </div>

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Précédent
                    </button>
                    <button
                      type="button"
                      onClick={nextStep}
                      className="bg-red-500 text-white px-6 py-3 rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                    >
                      Suivant
                      <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* Étape 3: Finalisation */}
              {currentStep === 3 && (
                <div className="space-y-6">
                  <InputField
                    label="Groupe sanguin (optionnel)"
                    id="idGroupeSanguin"
                  >
                    <select
                      id="idGroupeSanguin"
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/20 transition-all duration-300 bg-gray-50 focus:bg-white"
                      value={idGroupeSanguin}
                      onChange={(e) => setIdGroupeSanguin(e.target.value)}
                    >
                      <option value="">Sélectionnez votre groupe sanguin</option>
                      {groupesSanguins.map(g => (
                        <option key={g.id} value={g.id}>{g.nom_groupe}</option>
                      ))}
                    </select>
                    {groupesSanguins.length === 0 && (
                      <p className="text-sm text-gray-500 mt-1">Chargement des groupes sanguins...</p>
                    )}
                  </InputField>

                  {/* Résumé des informations */}
                  <div className="bg-red-50 border border-red-200 rounded-xl p-6">
                    <h3 className="font-semibold text-red-800 mb-4">Résumé de votre inscription</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Nom complet:</span>
                        <p className="text-gray-600">{prenom} {nom}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Email:</span>
                        <p className="text-gray-600">{email}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Ville:</span>
                        <p className="text-gray-600">{ville || 'Non renseignée'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Genre:</span>
                        <p className="text-gray-600">{genre || 'Non renseigné'}</p>
                      </div>
                    </div>
                  </div>

                  {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
                      <div className="flex">
                        <svg className="h-5 w-5 text-red-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                        <p className="ml-3 text-sm text-red-700">{error}</p>
                      </div>
                    </div>
                  )}

                  {message && (
                    <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                      <div className="flex">
                        <svg className="h-5 w-5 text-green-400 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <p className="ml-3 text-sm text-green-700">{message}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between">
                    <button
                      type="button"
                      onClick={prevStep}
                      className="bg-gray-500 text-white px-6 py-3 rounded-xl hover:bg-gray-600 transition-all duration-300 font-semibold"
                    >
                      <svg className="w-5 h-5 mr-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                      </svg>
                      Précédent
                    </button>
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-3 rounded-xl hover:from-red-600 hover:to-red-700 focus:outline-none focus:ring-4 focus:ring-red-500/30 transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                    >
                      {isLoading ? (
                        <div className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Inscription en cours...
                        </div>
                      ) : (
                        <>
                          Finaliser l'inscription
                          <svg className="w-5 h-5 ml-2 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}
            </form>

            {/* Lien vers la connexion */}
            <div className="mt-8 text-center">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Déjà inscrit ?</span>
                </div>
              </div>
              
              <button 
                onClick={() => onNavigate('login')} 
                className="mt-4 text-red-600 hover:text-red-700 font-semibold text-sm transition-colors duration-200 hover:underline focus:outline-none focus:ring-2 focus:ring-red-500/30 rounded px-2 py-1"
              >
                Se connecter à votre compte
              </button>
            </div>

            {/* Message inspirant */}
            <div className="mt-6 text-center">
              <p className="text-xs text-gray-500 italic">
                "Ensemble, nous pouvons sauver des vies. Merci de rejoindre notre mission."
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RegistrationPage;