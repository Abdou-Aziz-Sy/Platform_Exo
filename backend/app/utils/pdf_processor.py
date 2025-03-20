import PyPDF2
import re
from typing import List, Optional

class PDFProcessor:
    @staticmethod
    def extract_sql_queries(pdf_path: str) -> List[str]:
        """Extrait les requêtes SQL d'un fichier PDF."""
        queries = []
        current_query = []
        
        try:
            with open(pdf_path, 'rb') as file:
                reader = PyPDF2.PdfReader(file)
                
                for page in reader.pages:
                    text = page.extract_text()
                    
                    # Diviser le texte en lignes
                    lines = text.split('\n')
                    
                    for line in lines:
                        # Ignorer les lignes vides
                        if not line.strip():
                            continue
                            
                        # Si c'est un commentaire SQL ou une ligne SQL
                        if line.strip().startswith('--') or any(keyword in line.upper() for keyword in ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'JOIN', 'HAVING']):
                            current_query.append(line.strip())
                        # Si c'est la fin d'une requête
                        elif line.strip().endswith(';'):
                            current_query.append(line.strip())
                            queries.append('\n'.join(current_query))
                            current_query = []
                        # Si c'est une partie de la requête en cours
                        elif current_query:
                            current_query.append(line.strip())
            
            # Ajouter la dernière requête si elle existe
            if current_query:
                queries.append('\n'.join(current_query))
            
            return queries
            
        except Exception as e:
            print(f"Erreur lors de l'extraction du PDF : {str(e)}")
            return []

    @staticmethod
    def normalize_sql_query(query: str) -> str:
        """Normalise une requête SQL pour la comparaison."""
        # Supprimer les commentaires
        query = re.sub(r'--.*$', '', query, flags=re.MULTILINE)
        
        # Supprimer les espaces multiples
        query = re.sub(r'\s+', ' ', query)
        
        # Normaliser les mots-clés en majuscules
        keywords = ['SELECT', 'FROM', 'WHERE', 'GROUP BY', 'ORDER BY', 'JOIN', 'HAVING', 'ON', 'AND', 'OR', 'AS']
        normalized = query.upper()
        
        # Supprimer les points-virgules de fin
        normalized = normalized.strip().rstrip(';')
        
        return normalized

    @staticmethod
    def compare_queries(query1: str, query2: str) -> float:
        """Compare deux requêtes SQL et retourne un score de similarité entre 0 et 1."""
        try:
            # Nettoyer les requêtes
            query1 = query1.strip().upper()
            query2 = query2.strip().upper()
            
            # Extraire les mots-clés et les tables
            keywords1 = set(re.findall(r'\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|JOIN|HAVING|AND|OR|IN|EXISTS|NOT|LIKE|BETWEEN|IS NULL|IS NOT NULL)\b', query1))
            keywords2 = set(re.findall(r'\b(SELECT|FROM|WHERE|GROUP BY|ORDER BY|JOIN|HAVING|AND|OR|IN|EXISTS|NOT|LIKE|BETWEEN|IS NULL|IS NOT NULL)\b', query2))
            
            tables1 = set(re.findall(r'\bFROM\s+(\w+)\b|\bJOIN\s+(\w+)\b', query1))
            tables2 = set(re.findall(r'\bFROM\s+(\w+)\b|\bJOIN\s+(\w+)\b', query2))
            
            # Calculer les scores partiels
            keyword_score = len(keywords1.intersection(keywords2)) / max(len(keywords1), len(keywords2)) if keywords1 or keywords2 else 0
            table_score = len(tables1.intersection(tables2)) / max(len(tables1), len(tables2)) if tables1 or tables2 else 0
            
            # Calculer le score final (pondération : 60% mots-clés, 40% tables)
            final_score = 0.6 * keyword_score + 0.4 * table_score
            
            return round(final_score, 2)
            
        except Exception as e:
            print(f"Erreur lors de la comparaison des requêtes : {str(e)}")
            return 0.0 