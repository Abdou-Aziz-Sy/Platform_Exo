from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import A4
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import SimpleDocTemplate, Paragraph
from reportlab.lib.units import inch
import os

def create_pdf(content, output_file):
    # Create directory if it doesn't exist
    os.makedirs(os.path.dirname(output_file), exist_ok=True)
    
    # Create the PDF document
    doc = SimpleDocTemplate(
        output_file,
        pagesize=A4,
        rightMargin=72,
        leftMargin=72,
        topMargin=72,
        bottomMargin=72
    )
    
    # Create the story (content)
    Story = []
    styles = getSampleStyleSheet()
    normal_style = styles['Normal']
    
    # Split content into paragraphs
    paragraphs = content.split('\n\n')
    for para in paragraphs:
        if para.strip():
            p = Paragraph(para.replace('\n', '<br/>'), normal_style)
            Story.append(p)
    
    # Build the PDF
    doc.build(Story)

# Contenu de l'exercice
exercice_content = """Exercice de Base de Données - Requêtes SQL

Contexte :
Soit la base de données d'une bibliothèque avec les tables suivantes :

LIVRES (id_livre, titre, auteur, annee_publication, id_categorie)
CATEGORIES (id_categorie, nom_categorie)
EMPRUNTS (id_emprunt, id_livre, id_lecteur, date_emprunt, date_retour)
LECTEURS (id_lecteur, nom, prenom, email)

Questions :

1. Écrivez une requête SQL pour lister tous les livres (titre, auteur) publiés après 2020.

2. Écrivez une requête SQL pour trouver le nombre total de livres empruntés par catégorie.

3. Écrivez une requête SQL pour identifier les lecteurs qui ont emprunté plus de 3 livres.

4. Écrivez une requête SQL pour trouver les livres qui n'ont jamais été empruntés.

Temps alloué : 1 heure
Note : Justifiez chacune de vos réponses."""

# Contenu de la correction
correction_content = """Correction - Exercice de Base de Données

1. Liste des livres publiés après 2020 :
SELECT titre, auteur 
FROM LIVRES 
WHERE annee_publication > 2020;

Justification : Cette requête simple utilise WHERE pour filtrer les livres selon leur année de publication.

2. Nombre de livres empruntés par catégorie :
SELECT c.nom_categorie, COUNT(DISTINCT e.id_livre) as nombre_emprunts
FROM CATEGORIES c
LEFT JOIN LIVRES l ON c.id_categorie = l.id_categorie
LEFT JOIN EMPRUNTS e ON l.id_livre = e.id_livre
GROUP BY c.id_categorie, c.nom_categorie;

Justification : Utilisation de LEFT JOIN pour inclure toutes les catégories, même celles sans emprunts.

3. Lecteurs ayant emprunté plus de 3 livres :
SELECT l.nom, l.prenom, COUNT(e.id_livre) as nombre_emprunts
FROM LECTEURS l
JOIN EMPRUNTS e ON l.id_lecteur = e.id_lecteur
GROUP BY l.id_lecteur, l.nom, l.prenom
HAVING COUNT(e.id_livre) > 3;

Justification : GROUP BY avec HAVING pour filtrer après l'agrégation.

4. Livres jamais empruntés :
SELECT l.titre, l.auteur
FROM LIVRES l
LEFT JOIN EMPRUNTS e ON l.id_livre = e.id_livre
WHERE e.id_emprunt IS NULL;

Justification : LEFT JOIN avec IS NULL pour trouver les livres sans correspondance."""

# Contenu de la soumission
submission_content = """Réponses à l'exercice de Base de Données
Étudiant : John Doe
Date : 19/03/2024

1. Pour lister les livres publiés après 2020 :
SELECT titre, auteur
FROM LIVRES
WHERE annee_publication > 2020;

Cette requête permet de sélectionner uniquement les colonnes titre et auteur des livres dont l'année de publication est supérieure à 2020.

2. Pour compter les livres empruntés par catégorie :
SELECT c.nom_categorie, COUNT(e.id_livre) as total_emprunts
FROM CATEGORIES c
JOIN LIVRES l ON c.id_categorie = l.id_categorie
JOIN EMPRUNTS e ON l.id_livre = e.id_livre
GROUP BY c.nom_categorie;

J'ai utilisé des JOIN pour relier les tables et GROUP BY pour regrouper par catégorie.

3. Pour trouver les lecteurs avec plus de 3 emprunts :
SELECT l.nom, l.prenom, COUNT(*) as nb_emprunts
FROM LECTEURS l
JOIN EMPRUNTS e ON l.id_lecteur = e.id_lecteur
GROUP BY l.id_lecteur
HAVING COUNT(*) > 3;

Cette requête compte les emprunts par lecteur et filtre ceux qui en ont plus de 3.

4. Pour les livres jamais empruntés :
SELECT titre, auteur
FROM LIVRES
WHERE id_livre NOT IN (
    SELECT id_livre 
    FROM EMPRUNTS
);

J'ai utilisé une sous-requête pour trouver les livres qui n'apparaissent pas dans la table EMPRUNTS."""

# Create PDFs
create_pdf(exercice_content, 'uploads/exercises/exercice_test.pdf')
create_pdf(correction_content, 'uploads/exercises/correction_test.pdf')
create_pdf(submission_content, 'uploads/submissions/soumission_test.pdf')

print("PDFs created successfully!") 