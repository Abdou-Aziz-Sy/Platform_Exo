import os
import psycopg2
from dotenv import load_dotenv

# Charger les variables d'environnement
load_dotenv('.env.production')

try:
    # Connexion à PostgreSQL via le pooler
    print("Tentative de connexion à PostgreSQL via le pooler...")
    conn_str = "postgresql://postgres.llydnglwuftaabqhydlu:oDKueCdU4dEHi15D@aws-0-us-west-1.pooler.supabase.com:6543/postgres"
    conn = psycopg2.connect(conn_str)
    print("Connexion réussie !")
    
    # Test simple
    cursor = conn.cursor()
    cursor.execute('SELECT version();')
    version = cursor.fetchone()
    print(f"Version PostgreSQL : {version[0]}")
    
    # Fermer la connexion
    cursor.close()
    conn.close()
    print("Connexion fermée.")
except Exception as e:
    print(f"ERREUR lors de la connexion : {str(e)}") 