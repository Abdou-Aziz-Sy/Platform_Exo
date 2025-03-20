# Plateforme d'évaluation automatique des exercices de bases de données

Une plateforme web permettant aux professeurs de déposer des sujets d'exercices en bases de données et aux étudiants de soumettre leurs réponses sous forme de fichiers PDF.

## Fonctionnalités

- Gestion des utilisateurs (professeurs et étudiants)
- Dépôt de sujets d'examen en format PDF
- Soumission de réponses par les étudiants
- Correction automatique via IA (DeepSeek via Ollama)
- Tableau de bord pour les statistiques
- Interface séparée pour les professeurs et les étudiants

## Technologies utilisées

### Frontend
- React.js
- Tailwind CSS
- Chart.js pour les visualisations

### Backend
- FastAPI (Python)
- PostgreSQL
- Ollama pour l'IA

## Installation

### Prérequis
- Python 3.11+
- Node.js 18+
- PostgreSQL
- Ollama

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Sur Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm start
```

## Configuration

1. Créer un fichier `.env` dans le dossier backend :
```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
SECRET_KEY=votre_secret_key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

2. Créer un fichier `.env` dans le dossier frontend :
```env
REACT_APP_API_URL=http://localhost:8000
```

## Déploiement

Le projet est configuré pour être déployé sur :
- Frontend : Vercel
- Backend : Render
- Base de données : Supabase

## Contribution

1. Fork le projet
2. Créer une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Commit vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

### Prérequis
- Docker et Docker Compose
- Un domaine avec les sous-domaines suivants configurés :
  - app.votredomaine.com (frontoffice)
  - admin.votredomaine.com (backoffice)
  - api.votredomaine.com (backend)

### Configuration
1. Créer un fichier `.env` à la racine du projet avec les variables suivantes :
```env
SECRET_KEY=votre_secret_key_ici
DATABASE_URL=postgresql://user:password@db:5432/dbname
```

2. Configurer les DNS pour pointer vers votre serveur :
   - app.votredomaine.com -> IP du serveur
   - admin.votredomaine.com -> IP du serveur
   - api.votredomaine.com -> IP du serveur

### Déploiement
1. Cloner le repository :
```bash
git clone https://github.com/votre-username/votre-repo.git
cd votre-repo
```

2. Construire et démarrer les conteneurs :
```bash
docker-compose up -d --build
```

3. Vérifier que tous les services sont en cours d'exécution :
```bash
docker-compose ps
```

### Accès aux applications
- Frontoffice (étudiants) : https://app.votredomaine.com
- Backoffice (professeurs) : https://admin.votredomaine.com
- API : https://api.votredomaine.com

### Maintenance
- Pour arrêter les services :
```bash
docker-compose down
```

- Pour voir les logs :
```bash
docker-compose logs -f
```

- Pour redémarrer un service spécifique :
```bash
docker-compose restart [service_name]
```

### Sauvegarde
Les données sont stockées dans des volumes Docker :
- `postgres_data` : Base de données PostgreSQL
- `ollama_data` : Modèles Ollama

Pour sauvegarder ces données :
```bash
docker-compose down
tar -czf backup.tar.gz ./backend/uploads postgres_data ollama_data
```

### Sécurité
- Assurez-vous de changer les mots de passe par défaut dans le fichier docker-compose.yml
- Configurez un certificat SSL (recommandé avec Let's Encrypt)
- Maintenez les images Docker à jour
- Surveillez les logs pour détecter toute activité suspecte
