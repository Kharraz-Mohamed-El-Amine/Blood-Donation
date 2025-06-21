# **Application de Gestion des Dons de Sang**

## **Table des Matières**

1. [Introduction](#bookmark=id.i4m9z3s90hpg)  
2. [Technologies Utilisées](#bookmark=id.5edwp4v0v4gc)  
3. [Fonctionnalités Clés](#bookmark=id.1qkxt0kip1y)  
4. [Prérequis](#bookmark=id.8c7n6khj9fip)  
5. [Installation et Configuration](#bookmark=id.99ynrar75w4m)  
   * [5.1 Backend (FastAPI)](#bookmark=id.85264oxkuapq)  
   * [5.2 Frontend (React.js)](#bookmark=id.ldatry7pla03)  
6. [Exécution de l'Application](#bookmark=id.tzmjtx5vjbsj)  
   * [6.1 Lancer le Backend](#bookmark=id.wlnitqtar82i)  
   * [6.2 Lancer le Frontend](#bookmark=id.bedznyenbw1c)  
7. [Endpoints de l'API](#bookmark=id.7h0rm8pobhtz)  
8. [Modélisation UML](#bookmark=id.d0y93brk87ro)  
9. [Déploiement (Planifié)](#bookmark=id.rr0vg7q44f0b)

### **1\. Introduction**

Ce projet de fin de module présente une application web REST monolithique dédiée à la **gestion des dons de sang**. Face à la complexité de coordination entre donneurs et receveurs, cette plateforme vise à moderniser et optimiser ce processus vital. Elle permet aux donneurs potentiels de proposer leur sang et aux entités (via un administrateur) de soumettre des demandes. L'objectif est d'améliorer la visibilité des besoins et disponibilités, et de fluidifier l'association des dons et demandes, contribuant ainsi à sauver des vies.

### **2\. Technologies Utilisées**

* **Backend :**  
  * Python 3.11+  
  * FastAPI (Framework web asynchrone)  
  * SQLAlchemy (ORM pour base de données)  
  * PyMySQL (Connecteur MySQL)  
  * Passlib (Hachage de mots de passe)  
  * Python-dotenv (Gestion variables d'environnement)  
  * Uvicorn (Serveur ASGI)  
  * Pydantic (Validation de données)  
* **Base de Données :**  
  * MySQL  
* **Frontend :**  
  * React.js (Bibliothèque JavaScript pour UI)  
  * Vite (Outil de build rapide)  
  * Tailwind CSS (Framework CSS utilitaire)  
  * React-datepicker (Composant sélecteur de date)  
* **Outils de Développement :**  
  * Git / GitHub  
  * VS Code (Éditeur de code)  
* **Conteneurisation & CI/CD (Planifié) :**  
  * Docker  
  * GitHub Actions

### **3\. Fonctionnalités Clés**

L'application offre les fonctionnalités principales suivantes :

* **Gestion des Utilisateurs :**  
  * Inscription de nouveaux utilisateurs (rôle normal par défaut).  
  * Connexion sécurisée et gestion des sessions.  
  * Gestion des rôles (normal, admin).  
* **Fonctionnalités pour Utilisateurs (rôle normal) :**  
  * Proposer un don de sang (déclaration de disponibilité et localisation).  
  * Soumettre une demande de don de sang (spécification du groupe, quantité, urgence).  
  * Consulter l'état de ses propositions et demandes.  
* **Fonctionnalités pour Administrateurs (rôle admin) :**  
  * Tableau de bord de gestion.  
  * Visualisation et filtrage des propositions et demandes de dons.  
  * **Association de demandes à des propositions de don disponibles.**  
  * Consultation des statistiques globales de l'application (utilisateurs, dons, demandes, affectations).

### **4\. Prérequis**

Assurez-vous d'avoir les éléments suivants installés et configurés :

* [**Python 3.11+**](https://www.python.org/downloads/)  
* [**Node.js (LTS)**](https://nodejs.org/en/download/)  
* [**MySQL Server**](https://dev.mysql.com/downloads/mysql/) et un client de gestion (ex: MySQL Workbench).  
* [**Git**](https://git-scm.com/downloads)  
* [**VS Code**](https://code.visual.com/) (recommandé)

### **5\. Installation et Configuration**

Ce projet est structuré comme un monorepo, contenant le backend et le frontend dans un seul dépôt.

1. **Clonez le dépôt principal du projet :**  
   git clone https://github.com/Kharraz-Mohamed-El-Amine/Blood-Donation.git  
   cd Blood-Donation

#### **5.1 Backend (FastAPI)**

1. **Naviguez vers le dossier du backend :**  
   cd backend

2. **Créez et activez un environnement virtuel Python :**  
   python \-m venv venv  
   \# Sur Windows (PowerShell):  
   .\\venv\\Scripts\\Activate.ps1  
   \# Sur Linux/macOS ou Git Bash:  
   source venv/bin/activate

3. **Installez les dépendances Python :**  
   pip install \-r requirements.txt

   *(Si le fichier requirements.txt n'existe pas, exécutez pip install fastapi uvicorn SQLAlchemy PyMySQL python-dotenv "passlib\[bcrypt\]" python-jose fastapi\[all\])*  
4. Configurez les variables d'environnement (.env) :  
   À la racine du dossier backend/, créez un fichier nommé .env :  
   DATABASE\_URL=mysql+pymysql://user:password@host:port/database\_name

   *Remplacez user, password, host, port, et database\_name par vos informations MySQL.*  
5. **Initialisez la base de données MySQL :**  
   * Créez une base de données vide (ex: blood\_donation\_db) sur votre serveur MySQL.  
   * Utilisez le script SQL fourni (si disponible) ou lancez le backend une première fois pour que les tables soient créées automatiquement (via Base.metadata.create\_all() dans main.py).

   Comment créer un utilisateur administrateur :Pour tester les fonctionnalités d'administration, vous devez créer un utilisateur avec le rôle admin.

   * **Via l'API (recommandé) :** Une fois le backend lancé (uvicorn main:app \--reload), accédez à http://127.0.0.1:8000/docs (Swagger UI).  
     * Utilisez l'endpoint POST /utilisateurs/.  
     * Remplissez les champs (email, mot de passe, nom, prénom, etc.) et assurez-vous de définir le champ role à "admin".  
     * Il est recommandé que le **premier utilisateur** créé via cet endpoint soit l'administrateur, afin qu'il ait l'ID 1 (cela simplifie la dépendance get\_current\_admin\_user côté backend qui est configurée pour vérifier l'ID 1).  
   * **Directement via SQL :** Si vous initialisez la base de données manuellement avec un script SQL, vous pouvez insérer un administrateur directement. Assurez-vous d'utiliser un mot de passe haché (vous pouvez le générer avec un petit script Python utilisant passlib\[bcrypt\] comme celui de generate\_password.py si fourni).  
     \-- Exemple d'insertion d'un admin avec un mot de passe haché  
     INSERT INTO Utilisateur (id, nom, prenom, email, mot\_de\_passe\_hache, role) VALUES  
     (1, 'Admin', 'Root', 'admin@app.com', '$2b$12$VOTRE\_MOT\_DE\_PASSE\_HACHE\_ICI', 'admin');

#### **5.2 Frontend (React.js)**

1. **Naviguez vers le dossier du frontend :**  
   cd frontend

   *(Assurez-vous d'être dans le dossier frontend/ à la racine de votre dépôt principal.)*  
2. **Installez les dépendances Node.js :**  
   npm install

3. **Vérifiez/Configurez Tailwind CSS :**  
   * Assurez-vous que tailwind.config.js est présent à la racine du dossier frontend/ et configuré pour scanner les fichiers JSX/TSX.  
   * Assurez-vous que postcss.config.js est présent à la racine du dossier frontend/ avec les plugins tailwindcss et autoprefixer.  
   * Vérifiez que src/index.css dans frontend/src/ contient @tailwind base;, @tailwind components;, @tailwind utilities;.  
   * Assurez-vous que la police 'Inter' est importée dans frontend/public/index.html (recommandé) ou frontend/src/index.css.

### **6\. Exécution de l'Application**

Assurez-vous que votre serveur MySQL est opérationnel.

#### **6.1 Lancer le Backend**

1. Ouvrez un terminal et naviguez vers le dossier backend/ de votre projet.  
2. Activez l'environnement virtuel Python (si vous n'avez pas redémarré votre terminal depuis l'installation des dépendances).  
3. Lancez le serveur FastAPI :  
   uvicorn main:app \--reload

   Le backend sera accessible sur http://127.0.0.1:8000. La documentation interactive de l'API (Swagger UI) sera disponible à http://127.0.0.1:8000/docs.

#### **6.2 Lancer le Frontend**

1. Ouvrez un **nouveau** terminal et naviguez vers le dossier frontend/ de votre projet.  
2. Lancez le serveur de développement React :  
   npm run dev

   Le frontend sera généralement accessible sur http://localhost:5173/.

### **7\. Endpoints de l'API**

L'API est entièrement documentée via Swagger UI, accessible à http://127.0.0.1:8000/docs.

Quelques endpoints clés :

* POST /token : Authentification de l'utilisateur.  
* POST /utilisateurs/ : Inscription d'un nouvel utilisateur.  
* GET /utilisateurs/ : Récupère la liste des utilisateurs.  
* POST /propositionsdon/ : Crée une proposition de don.  
* GET /propositionsdon/ : Récupère les propositions de don.  
* POST /demandesdon/ : Crée une demande de don.  
* GET /demandesdon/ : Récupère les demandes de don.  
* POST /affectationsdon/ : Crée une affectation de don (accès admin).  
* GET /affectationsdon/ : Récupère les affectations de don (accès admin).  
* GET /stats/ : Récupère les statistiques globales (accès admin).

### **8\. Modélisation UML**

Les diagrammes UML clés du projet sont inclus dans le dossier docs/ à la racine de ce dépôt, fournissant une vue structurée de la conception :

* **Diagramme de Cas d'Utilisation :** Décrit les interactions entre les acteurs et les fonctionnalités du système.  
  * [Image du Diagramme de Cas d'Utilisation](https://github.com/Kharraz-Mohamed-El-Amine/Blood-Donation/blob/main/docs/use_case_diagram.png) 
* **Diagramme de Classes :** Représente les entités principales de la base de données et leurs relations.  
  * [Image du Diagramme de Classes](https://github.com/Kharraz-Mohamed-El-Amine/Blood-Donation) 

### **9\. Déploiement (Planifié)**

Le projet est conçu pour être conteneurisé avec Docker et déployé via un pipeline CI/CD (GitHub Actions).

* **Frontend :** Peut être déployé sur des services d'hébergement de sites statiques comme **GitHub Pages** (via npm run deploy dans le dossier frontend/).  
* **Backend & Base de Données :** Nécessitent un environnement serveur dynamique (ex: Heroku, Render, DigitalOcean, Google Cloud Run) pour exécuter le code Python et la base de données MySQL.

*(Pour un déploiement complet, l'URL du backend dans les fichiers du frontend devra être mise à jour de http://localhost:8000 vers l'URL du backend déployé.)*