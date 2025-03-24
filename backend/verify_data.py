import psycopg2
from db_config import DB_CONFIG

try:
    print("Tentative de connexion à PostgreSQL...")
    # Connexion à PostgreSQL
    conn = psycopg2.connect(**DB_CONFIG)
    cur = conn.cursor()
    print("Connexion réussie !")

    # Vérifier les utilisateurs
    print("\nVérification de la table users...")
    cur.execute("SELECT id, email, full_name, role FROM users;")
    users = cur.fetchall()
    print(f"Nombre d'utilisateurs : {len(users)}")
    for user in users:
        print(user)

    # Vérifier les exercices
    print("\nVérification de la table exercises...")
    cur.execute("SELECT id, title, exercise_type, professor_id FROM exercises;")
    exercises = cur.fetchall()
    print(f"Nombre d'exercices : {len(exercises)}")
    for exercise in exercises:
        print(exercise)

    # Vérifier les soumissions
    print("\nVérification de la table submissions...")
    cur.execute("SELECT id, student_id, exercise_id, status, grade FROM submissions;")
    submissions = cur.fetchall()
    print(f"Nombre de soumissions : {len(submissions)}")
    for submission in submissions:
        print(submission)

    # Vérifier les notifications
    print("\nVérification de la table notifications...")
    cur.execute("SELECT id, user_id, type, message FROM notifications;")
    notifications = cur.fetchall()
    print(f"Nombre de notifications : {len(notifications)}")
    for notification in notifications:
        print(notification)

    # Fermer les connexions
    cur.close()
    conn.close()
    print("\nVérification terminée avec succès !")

except Exception as e:
    print(f"ERREUR : {str(e)}")
    if 'conn' in locals():
        conn.close() 