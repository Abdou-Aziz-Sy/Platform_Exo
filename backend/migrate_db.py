import sqlite3
import psycopg2
import os
import json
from dotenv import load_dotenv
from db_config import DB_CONFIG

# Tables à migrer
TABLES_TO_MIGRATE = ['users', 'exercises', 'submissions', 'notifications']

# Colonnes à ignorer par table
IGNORE_COLUMNS = {
    'users': ['is_active'],
    'exercises': ['corrections', 'evaluation_criteria'],
    'notifications': ['title', 'data', 'link', 'read']
}

# Charger les variables d'environnement
load_dotenv('.env.production')

try:
    # Connexion à la base de données SQLite
    print("Connexion à SQLite...")
    sqlite_conn = sqlite3.connect('evaluation.db')
    sqlite_cursor = sqlite_conn.cursor()

    # Connexion à PostgreSQL
    print("Connexion à PostgreSQL...")
    pg_conn = psycopg2.connect(**DB_CONFIG)
    pg_cursor = pg_conn.cursor()

    # Désactiver les contraintes de clé étrangère pour l'importation
    print("Désactivation des contraintes...")
    pg_cursor.execute("BEGIN;")
    pg_cursor.execute("SET constraints ALL DEFERRED;")

    # Migrer chaque table dans l'ordre spécifié
    for table_name in TABLES_TO_MIGRATE:
        print(f"\nMigration de la table {table_name}...")
        
        try:
            # Vérifier si la table existe dans SQLite
            sqlite_cursor.execute(f"SELECT name FROM sqlite_master WHERE type='table' AND name=?;", (table_name,))
            if not sqlite_cursor.fetchone():
                print(f"La table {table_name} n'existe pas dans SQLite, passage à la suivante...")
                continue
            
            # Obtenir les colonnes de la table
            sqlite_cursor.execute(f"PRAGMA table_info({table_name});")
            all_columns = [column[1] for column in sqlite_cursor.fetchall()]
            
            # Filtrer les colonnes à ignorer
            columns = [col for col in all_columns if col not in IGNORE_COLUMNS.get(table_name, [])]
            
            # Récupérer les données
            sqlite_cursor.execute(f"SELECT {','.join(columns)} FROM {table_name};")
            rows = sqlite_cursor.fetchall()
            
            if not rows:
                print(f"Aucune donnée à migrer pour la table {table_name}")
                continue
                
            print(f"Migration de {len(rows)} enregistrements...")
            
            # Créer les placeholders pour la requête d'insertion
            placeholders = ','.join(['%s'] * len(columns))
            
            # Insérer les données dans PostgreSQL
            for row in rows:
                # Convertir les valeurs pour PostgreSQL
                clean_row = []
                for val in row:
                    if isinstance(val, str) and (val.startswith('{') or val.startswith('[')):
                        try:
                            json_val = json.loads(val)
                            clean_row.append(json.dumps(json_val))
                        except:
                            clean_row.append(val)
                    else:
                        clean_row.append(val)
                
                try:
                    insert_query = f"""
                        INSERT INTO {table_name} ({','.join(columns)})
                        VALUES ({placeholders})
                        ON CONFLICT DO NOTHING;
                    """
                    pg_cursor.execute(insert_query, clean_row)
                except Exception as e:
                    print(f"Erreur lors de l'insertion dans {table_name}: {e}")
                    raise
            
            print(f"Migration de la table {table_name} terminée")
            
        except Exception as e:
            print(f"Erreur lors de la migration de la table {table_name}: {e}")
            pg_cursor.execute("ROLLBACK;")
            raise

    # Valider les transactions
    print("\nValidation des transactions...")
    pg_cursor.execute("COMMIT;")
    print("Transactions validées avec succès")

    # Fermer les connexions
    sqlite_conn.close()
    pg_cursor.close()
    pg_conn.close()

    print("\nMigration terminée avec succès !")

except Exception as e:
    print(f"\nERREUR CRITIQUE lors de la migration : {str(e)}")
    if 'pg_conn' in locals():
        pg_conn.close()
    if 'sqlite_conn' in locals():
        sqlite_conn.close()
    raise 