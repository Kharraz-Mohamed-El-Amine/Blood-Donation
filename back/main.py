# MonProjetDonDuSang_Backend/main.py

# Importations nécessaires pour FastAPI, la base de données et la sécurité
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from sqlalchemy import create_engine, Column, Integer, String, Date, DateTime, Text, text, func
from sqlalchemy.orm import sessionmaker, declarative_base, Session
from sqlalchemy.exc import SQLAlchemyError
from dotenv import load_dotenv
import os
from datetime import datetime, date, timedelta
from typing import List, Optional
from pydantic import BaseModel, EmailStr
from passlib.context import CryptContext
import json

# NOUVELLE IMPORTATION POUR CORS
from fastapi.middleware.cors import CORSMiddleware 

# Charger les variables d'environnement
load_dotenv()

# Initialisation de FastAPI
app = FastAPI()

# --- Configuration CORS ---
# Liste des origines (domaines et ports) autorisées à faire des requêtes vers votre API.
origins = [
    "http://localhost",
    "http://localhost:5173", # L'origine de votre frontend React (Vite par défaut est 5173)
    "http://127.0.0.1:5173", # Une autre façon de spécifier localhost
    # Ajoutez d'autres origines si votre frontend est hébergé ailleurs ou sur un autre port
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins, # Liste des origines autorisées
    allow_credentials=True, # Autoriser les cookies, les en-têtes d'autorisation, etc.
    allow_methods=["*"],    # Autoriser toutes les méthodes HTTP (GET, POST, PUT, DELETE, etc.)
    allow_headers=["*"],    # Autoriser tous les en-têtes HTTP dans la requête
)
# --- FIN Configuration CORS ---


# Configuration du hachage de mot de passe (bcrypt est recommandé)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# OAuth2PasswordBearer pour l'authentification (utilisé comme un placeholder pour JWT)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# --- Fonctions d'authentification et de hachage ---
def verify_password(plain_password, hashed_password):
    """Vérifie si un mot de passe en clair correspond à un mot de passe haché."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    """Hache un mot de passe en clair."""
    return pwd_context.hash(password)

# --- Configuration de la Base de Données ---
DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL n'est pas définie dans le fichier .env")

engine = create_engine(DATABASE_URL)
Base = declarative_base()
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


# --- Modèles de Données SQLAlchemy (ORM) ---

class GroupeSanguin(Base):
    __tablename__ = "GroupeSanguin"
    id = Column(Integer, primary_key=True, index=True)
    nom_groupe = Column(String(5), unique=True, nullable=False) # Corrected typo here

class Utilisateur(Base):
    __tablename__ = "Utilisateur"
    id = Column(Integer, primary_key=True, index=True)
    nom = Column(String(255), nullable=False)
    prenom = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False)
    mot_de_passe_hache = Column(String(255), nullable=False)
    role = Column(String(50), default='normal', nullable=False)
    adresse = Column(String(255))
    ville = Column(String(100))
    telephone = Column(String(20))
    date_naissance = Column(Date)
    genre = Column(String(10))
    id_groupe_sanguin = Column(Integer, index=True)

class PropositionDon(Base):
    __tablename__ = "PropositionDon"
    id = Column(Integer, primary_key=True, index=True)
    id_utilisateur = Column(Integer, nullable=False, index=True)
    date_proposition = Column(DateTime, nullable=False, default=datetime.now)
    disponibilite_date_heure = Column(DateTime)
    localisation_proposition = Column(String(255))
    statut = Column(String(50), default='en attente', nullable=False)
    notes = Column(Text)

class DemandeDon(Base):
    __tablename__ = "DemandeDon"
    id = Column(Integer, primary_key=True, index=True)
    id_utilisateur = Column(Integer, nullable=False, index=True)
    id_groupe_sanguin_requis = Column(Integer, nullable=False, index=True)
    quantite_demandee_ml = Column(Integer, nullable=False)
    date_demande = Column(DateTime, nullable=False, default=datetime.now)
    localisation_demande = Column(String(255))
    urgence = Column(String(50), default='moyenne', nullable=False)
    statut = Column(String(50), default='en attente', nullable=False)
    description = Column(Text, nullable=False)

class AffectationDon(Base):
    __tablename__ = "AffectationDon"
    id = Column(Integer, primary_key=True, index=True)
    id_proposition_don = Column(Integer, unique=True, nullable=False, index=True)
    id_demande_don = Column(Integer, nullable=False, index=True)
    id_administrateur = Column(Integer, nullable=False, index=True)
    date_affectation = Column(DateTime, nullable=False, default=datetime.now)
    statut_affectation = Column(String(50), default='en cours', nullable=False)
    notes_administrateur = Column(Text)


# --- Schémas Pydantic (pour la validation des données de l'API) ---

class GroupeSanguinBase(BaseModel):
    nom_groupe: str

class GroupeSanguinCreate(GroupeSanguinBase):
    pass

class GroupeSanguinResponse(GroupeSanguinBase):
    id: int
    class Config:
        orm_mode = True

class UtilisateurBase(BaseModel):
    nom: str
    prenom: str
    email: EmailStr
    adresse: Optional[str] = None
    ville: Optional[str] = None
    telephone: Optional[str] = None
    date_naissance: Optional[date] = None
    genre: Optional[str] = None
    id_groupe_sanguin: Optional[int] = None
    role: str = "normal"

class UtilisateurCreate(UtilisateurBase):
    mot_de_passe: str

class UtilisateurResponse(UtilisateurBase):
    id: int
    # mot_de_passe_hache: str # À commenter/retirer en production pour la sécurité
    class Config:
        orm_mode = True

class PropositionDonBase(BaseModel):
    id_utilisateur: int
    disponibilite_date_heure: Optional[datetime] = None
    localisation_proposition: Optional[str] = None
    statut: str = "en attente"
    notes: Optional[str] = None

class PropositionDonCreate(PropositionDonBase):
    pass

class PropositionDonResponse(PropositionDonBase):
    id: int
    date_proposition: datetime
    class Config:
        orm_mode = True

class DemandeDonBase(BaseModel):
    id_utilisateur: int
    id_groupe_sanguin_requis: int
    quantite_demandee_ml: int
    localisation_demande: Optional[str] = None
    urgence: str = "moyenne"
    statut: str = "en attente"
    description: str

class DemandeDonCreate(DemandeDonBase):
    pass

class DemandeDonResponse(DemandeDonBase):
    id: int
    date_demande: datetime
    class Config:
        orm_mode = True

class AffectationDonBase(BaseModel):
    id_proposition_don: int
    id_demande_don: int
    id_administrateur: int
    statut_affectation: str = "en cours"
    notes_administrateur: Optional[str] = None

class AffectationDonCreate(AffectationDonBase):
    pass

class AffectationDonResponse(BaseModel):
        id: int
        # AJOUTEZ CES LIGNES pour inclure les IDs dans la réponse API
        id_proposition_don: int
        id_demande_don: int
        id_administrateur: int
        # Fin des ajouts

        date_affectation: datetime
        statut_affectation: str
        notes_administrateur: Optional[str] = None # Ce champ est optionnel

        class Config:
            orm_mode = True # ou from_attributes = True pour Pydantic V2
    

# Schéma pour la réponse de connexion (pourrait inclure un token JWT plus tard)
class Token(BaseModel):
    access_token: str
    token_type: str

class UserLogin(BaseModel):
    username: EmailStr
    password: str

# --- Dépendance pour les utilisateurs administrateurs (simplifié) ---
def get_current_admin_user(db: Session = Depends(get_db)):
    admin_user = db.query(Utilisateur).filter(Utilisateur.id == 1, Utilisateur.role == "admin").first()
    if not admin_user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Non autorisé: Seuls les administrateurs peuvent effectuer cette action.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return admin_user


# --- Endpoints de l'API ---

@app.get("/")
async def read_root():
    return {"message": "Bienvenue sur l'API de gestion de dons de sang !"}

@app.get("/db-test")
async def db_test(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
        return {"message": "Connexion à la base de données réussie !"}
    except SQLAlchemyError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur de connexion à la base de données: {str(e)}"
        )

# --- CRUD pour GroupeSanguin ---

@app.post("/groupesanguin/", response_model=GroupeSanguinResponse, status_code=status.HTTP_201_CREATED)
async def create_groupe_sanguin(groupe: GroupeSanguinCreate, db: Session = Depends(get_db)):
    db_groupe = db.query(GroupeSanguin).filter(GroupeSanguin.nom_groupe == groupe.nom_groupe).first()
    if db_groupe:
        raise HTTPException(status_code=400, detail="Groupe sanguin existe déjà")
    
    new_groupe = GroupeSanguin(nom_groupe=groupe.nom_groupe)
    db.add(new_groupe)
    db.commit()
    db.refresh(new_groupe)
    return new_groupe

@app.get("/groupesanguin/", response_model=List[GroupeSanguinResponse])
async def read_groupes_sanguin(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    groupes = db.query(GroupeSanguin).offset(skip).limit(limit).all()
    return groupes

@app.get("/groupesanguin/{groupe_id}", response_model=GroupeSanguinResponse)
async def read_groupe_sanguin(groupe_id: int, db: Session = Depends(get_db)):
    groupe = db.query(GroupeSanguin).filter(GroupeSanguin.id == groupe_id).first()
    if groupe is None:
        raise HTTPException(status_code=404, detail="Groupe sanguin non trouvé")
    return groupe

# --- CRUD pour Utilisateur ---

@app.post("/utilisateurs/", response_model=UtilisateurResponse, status_code=status.HTTP_201_CREATED)
async def create_utilisateur(user: UtilisateurCreate, db: Session = Depends(get_db)):
    db_user = db.query(Utilisateur).filter(Utilisateur.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="Email déjà enregistré")
    
    hashed_password = get_password_hash(user.mot_de_passe)
    
    new_user = Utilisateur(
        nom=user.nom,
        prenom=user.prenom,
        email=user.email,
        mot_de_passe_hache=hashed_password,
        role=user.role,
        adresse=user.adresse,
        ville=user.ville,
        telephone=user.telephone,
        date_naissance=user.date_naissance,
        genre=user.genre,
        id_groupe_sanguin=user.id_groupe_sanguin
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

@app.get("/utilisateurs/", response_model=List[UtilisateurResponse])
async def read_utilisateurs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = db.query(Utilisateur).offset(skip).limit(limit).all()
    return users

@app.get("/utilisateurs/{user_id}", response_model=UtilisateurResponse)
async def read_utilisateur(user_id: int, db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.id == user_id).first()
    if user is None:
        raise HTTPException(status_code=404, detail="Utilisateur non trouvé")
    return user

# --- CRUD pour PropositionDon ---

@app.post("/propositionsdon/", response_model=PropositionDonResponse, status_code=status.HTTP_201_CREATED)
async def create_proposition_don(proposition: PropositionDonCreate, db: Session = Depends(get_db)):
    db_user = db.query(Utilisateur).filter(Utilisateur.id == proposition.id_utilisateur).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur associé à la proposition non trouvé")

    new_proposition = PropositionDon(
        id_utilisateur=proposition.id_utilisateur,
        date_proposition=datetime.now(),
        disponibilite_date_heure=proposition.disponibilite_date_heure,
        localisation_proposition=proposition.localisation_proposition,
        statut=proposition.statut,
        notes=proposition.notes
    )
    db.add(new_proposition)
    db.commit()
    db.refresh(new_proposition)
    return new_proposition

@app.get("/propositionsdon/", response_model=List[PropositionDonResponse])
async def read_propositions_don(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    propositions = db.query(PropositionDon).offset(skip).limit(limit).all()
    return propositions

@app.get("/propositionsdon/{proposition_id}", response_model=PropositionDonResponse)
async def read_proposition_don(proposition_id: int, db: Session = Depends(get_db)):
    proposition = db.query(PropositionDon).filter(PropositionDon.id == proposition_id).first()
    if proposition is None:
        raise HTTPException(status_code=404, detail="Proposition de don non trouvée")
    return proposition

# --- CRUD pour DemandeDon ---

@app.post("/demandesdon/", response_model=DemandeDonResponse, status_code=status.HTTP_201_CREATED)
async def create_demande_don(demande: DemandeDonCreate, db: Session = Depends(get_db)):
    db_user = db.query(Utilisateur).filter(Utilisateur.id == demande.id_utilisateur).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="Utilisateur associé à la demande non trouvé")
    
    db_groupe_sanguin = db.query(GroupeSanguin).filter(GroupeSanguin.id == demande.id_groupe_sanguin_requis).first()
    if not db_groupe_sanguin:
        raise HTTPException(status_code=404, detail="Groupe sanguin requis non trouvé")

    new_demande = DemandeDon(
        id_utilisateur=demande.id_utilisateur,
        id_groupe_sanguin_requis=demande.id_groupe_sanguin_requis,
        quantite_demandee_ml=demande.quantite_demandee_ml,
        date_demande=datetime.now(),
        localisation_demande=demande.localisation_demande,
        urgence=demande.urgence,
        statut=demande.statut,
        description=demande.description
    )
    db.add(new_demande)
    db.commit()
    db.refresh(new_demande)
    return new_demande

@app.get("/demandesdon/", response_model=List[DemandeDonResponse])
async def read_demandes_don(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    demandes = db.query(DemandeDon).offset(skip).limit(limit).all()
    return demandes

@app.get("/demandesdon/{demande_id}", response_model=DemandeDonResponse)
async def read_demande_don(demande_id: int, db: Session = Depends(get_db)):
    demande = db.query(DemandeDon).filter(DemandeDon.id == demande_id).first()
    if demande is None:
        raise HTTPException(status_code=404, detail="Demande de don non trouvée")
    return demande


# --- CRUD pour AffectationDon (Accessible par les administrateurs) ---

@app.post("/affectationsdon/", response_model=AffectationDonResponse, status_code=status.HTTP_201_CREATED)
async def create_affectation_don(
    affectation: AffectationDonCreate,
    db: Session = Depends(get_db),
    current_admin: Utilisateur = Depends(get_current_admin_user)
):
    db_proposition = db.query(PropositionDon).filter(PropositionDon.id == affectation.id_proposition_don).first()
    if not db_proposition:
        raise HTTPException(status_code=404, detail="Proposition de don non trouvée")
    
    if db.query(AffectationDon).filter(AffectationDon.id_proposition_don == affectation.id_proposition_don).first():
        raise HTTPException(status_code=400, detail="Cette proposition de don est déjà affectée.")

    db_demande = db.query(DemandeDon).filter(DemandeDon.id == affectation.id_demande_don).first()
    if not db_demande:
        raise HTTPException(status_code=404, detail="Demande de don non trouvée")
    
    new_affectation = AffectationDon(
        id_proposition_don=affectation.id_proposition_don,
        id_demande_don=affectation.id_demande_don,
        id_administrateur=current_admin.id,
        date_affectation=datetime.now(),
        statut_affectation=affectation.statut_affectation,
        notes_administrateur=affectation.notes_administrateur
    )
    db.add(new_affectation)
    db.commit()
    db.refresh(new_affectation)
    
    db_proposition.statut = "affectée"
    db_demande.statut = "affectée"
    db.add(db_proposition)
    db.add(db_demande)
    db.commit()

    return new_affectation

@app.get("/affectationsdon/", response_model=List[AffectationDonResponse])
async def read_affectations_don(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db), 
    current_admin: Utilisateur = Depends(get_current_admin_user)
):
    affectations = db.query(AffectationDon).offset(skip).limit(limit).all()
    return affectations

@app.get("/affectationsdon/{affectation_id}", response_model=AffectationDonResponse)
async def read_affectation_don(
    affectation_id: int, 
    db: Session = Depends(get_db), 
    current_admin: Utilisateur = Depends(get_current_admin_user)
):
    affectation = db.query(AffectationDon).filter(AffectationDon.id == affectation_id).first()
    if affectation is None:
        raise HTTPException(status_code=404, detail="Affectation de don non trouvée")
    return affectation


# --- Endpoint de connexion (sans JWT complet, juste vérification des identifiants) ---
@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    user = db.query(Utilisateur).filter(Utilisateur.email == form_data.username).first()
    if not user or not verify_password(form_data.password, user.mot_de_passe_hache):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Identifiants incorrects",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # CORRECTION: Inclure l'ID et le rôle de l'utilisateur dans le token d'accès
    # En production, ce serait un vrai JWT chiffré qui contiendrait ces informations.
    # Pour cette démo, on les met directement dans le "token" pour le frontend.
    access_token_data = {
        "email": user.email,
        "id": user.id,
        "role": user.role
    }
    # Convertir le dictionnaire en chaîne JSON pour le renvoyer comme access_token
    return {"access_token": json.dumps(access_token_data), "token_type": "bearer"}


# --- Endpoint de Statistiques (Accessible par les administrateurs) ---
@app.get("/stats/", response_model=dict)
async def get_stats(db: Session = Depends(get_db), current_admin: Utilisateur = Depends(get_current_admin_user)):
    total_users = db.query(Utilisateur).count()
    total_normal_users = db.query(Utilisateur).filter(Utilisateur.role == "normal").count()
    total_admins = db.query(Utilisateur).filter(Utilisateur.role == "admin").count()
    
    total_propositions = db.query(PropositionDon).count()
    propositions_en_attente = db.query(PropositionDon).filter(PropositionDon.statut == "en attente").count()
    propositions_affectees = db.query(PropositionDon).filter(PropositionDon.statut == "affectée").count()

    total_demandes = db.query(DemandeDon).count()
    demandes_en_attente = db.query(DemandeDon).filter(DemandeDon.statut == "en attente").count()
    demandes_affectees = db.query(DemandeDon).filter(DemandeDon.statut == "affectée").count()

    total_affectations = db.query(AffectationDon).count()

    return {
        "total_utilisateurs": total_users,
        "utilisateurs_normaux": total_normal_users,
        "administrateurs": total_admins,
        "total_propositions_don": total_propositions,
        "propositions_en_attente": propositions_en_attente,
        "propositions_affectees": propositions_affectees,
        "total_demandes_don": total_demandes,
        "demandes_en_attente": demandes_en_attente,
        "demandes_affectees": demandes_affectees,
        "total_affectations": total_affectations
    }


# --- Bloc d'exécution principal du script ---
if __name__ == "__main__":
    print("Tentative de création des tables dans la base de données...")
    try:
        Base.metadata.create_all(bind=engine)
        print("Tables créées avec succès ou déjà existantes.")
    except SQLAlchemyError as e:
        print(f"Erreur lors de la création des tables: {e}")
    
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

