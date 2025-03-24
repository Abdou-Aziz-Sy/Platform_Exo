import os
import psycopg2
from dotenv import load_dotenv
from db_config import DB_CONFIG

# Charger les variables d'environnement
load_dotenv('.env.production')

try:
    # Connexion à PostgreSQL
    print("Tentative de connexion à PostgreSQL...")
    conn = psycopg2.connect(**DB_CONFIG)
    print("Connexion réussie !")
    cursor = conn.cursor()

    # Création des tables
    print("Création des tables...")
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        hashed_password VARCHAR(255) NOT NULL,
        role VARCHAR(50) NOT NULL,
        is_active BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS exercises (
        id SERIAL PRIMARY KEY,
        title VARCHAR(255) NOT NULL,
        description TEXT,
        exercise_type VARCHAR(50) NOT NULL,
        professor_id INTEGER REFERENCES users(id),
        file_path VARCHAR(255),
        corrections JSONB,
        evaluation_criteria JSONB,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS submissions (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users(id),
        exercise_id INTEGER REFERENCES exercises(id),
        file_path VARCHAR(255) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        grade FLOAT,
        feedback TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    cursor.execute("""
    CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        type VARCHAR(50),
        title VARCHAR(255),
        message TEXT NOT NULL,
        data JSONB,
        link VARCHAR(255),
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    """)

    # Valider les transactions
    conn.commit()
    print("Tables créées avec succès !")

    # Fermer les connexions
    cursor.close()
    conn.close()
    print("Connexions fermées.")

except Exception as e:
    print(f"ERREUR lors de l'exécution du script : {str(e)}")
    if 'conn' in locals():
        conn.close()

print("Schéma PostgreSQL initialisé avec succès !") 