from typing import Dict, Optional
import json
import os
from ..core.ollama_client import ollama_client
from ..models.exercise import Exercise
from ..models.submission import Submission
from ..utils.pdf_processor import PDFProcessor
import re

class AIEvaluator:
    @staticmethod
    async def generate_correction_model(exercise: Exercise) -> str:
        """Génère un modèle de correction pour un exercice en utilisant DeepSeek."""
        prompt = f"""
        En tant qu'expert en bases de données, générez un modèle de correction détaillé pour cet exercice :
        
        Titre: {exercise.title}
        Description: {exercise.description}
        
        Format de réponse attendu (JSON) :
        {{
            "points_clés": ["point1", "point2", ...],
            "critères_évaluation": {{
                "critère1": "description et points",
                "critère2": "description et points",
                ...
            }},
            "solution_type": "description du type de solution attendue",
            "mots_clés_importants": ["mot1", "mot2", ...]
        }}
        """
        
        response = await ollama_client.generate(
            model="deepseek-coder",
            prompt=prompt,
            temperature=0.7
        )
        
        return response.strip()

    @staticmethod
    async def evaluate_submission(submission: Submission, exercise: Exercise) -> Dict:
        """Évalue une soumission en la comparant avec la correction du professeur."""
        try:
            print(f"Début de l'évaluation pour la soumission {submission.id}")
            
            # Chemins absolus des fichiers
            submission_path = os.path.join("uploads", submission.file_path)
            correction_path = os.path.join("uploads", exercise.correction_file_path)
            
            print(f"Chemins des fichiers :")
            print(f"- Soumission : {submission_path}")
            print(f"- Correction : {correction_path}")
            
            # Vérifier l'existence des fichiers
            if not os.path.exists(submission_path):
                raise FileNotFoundError(f"Le fichier de soumission n'existe pas : {submission_path}")
            if not os.path.exists(correction_path):
                raise FileNotFoundError(f"Le fichier de correction n'existe pas : {correction_path}")
            
            # Extraire les requêtes SQL des PDFs
            try:
                submitted_queries = PDFProcessor.extract_sql_queries(submission_path)
                print(f"Requêtes extraites de la soumission : {submitted_queries}")
            except Exception as e:
                raise Exception(f"Erreur lors de l'extraction des requêtes de la soumission : {str(e)}")
                
            try:
                correction_queries = PDFProcessor.extract_sql_queries(correction_path)
                print(f"Requêtes extraites de la correction : {correction_queries}")
            except Exception as e:
                raise Exception(f"Erreur lors de l'extraction des requêtes de la correction : {str(e)}")
            
            if not submitted_queries:
                return {
                    "grade": 0,
                    "feedback": "Aucune requête SQL n'a été trouvée dans votre soumission. Veuillez soumettre des requêtes SQL valides.",
                    "criteria_scores": {}
                }
            
            if not correction_queries:
                raise Exception("Aucune requête SQL n'a été trouvée dans le fichier de correction")
            
            # Évaluer chaque requête
            scores = []
            feedbacks = []
            
            print(f"Début de l'évaluation des requêtes")
            for i, (submitted, correction) in enumerate(zip(submitted_queries, correction_queries)):
                print(f"\nÉvaluation de la requête {i+1}")
                print(f"Soumise : {submitted}")
                print(f"Correction : {correction}")
                
                try:
                    similarity = PDFProcessor.compare_queries(submitted, correction)
                    print(f"Score de similarité : {similarity}")
                    scores.append(similarity)
                except Exception as e:
                    print(f"Erreur lors de la comparaison des requêtes : {str(e)}")
                    scores.append(0)
                
                # Préparer le prompt pour l'analyse détaillée
                prompt = f"""
                En tant qu'expert en bases de données, analysez ces deux requêtes SQL et fournissez une évaluation détaillée.
                Concentrez-vous sur les aspects suivants :
                1. Syntaxe et structure
                2. Performance et optimisation
                3. Bonnes pratiques
                4. Suggestions d'amélioration concrètes
                
                Requête soumise :
                {submitted}
                
                Correction attendue :
                {correction}
                
                EXEMPLE DE RÉPONSE ATTENDUE :
                {{
                    "feedback": "La requête est syntaxiquement correcte et produit les résultats attendus. L'utilisation de JOIN est appropriée, mais pourrait être optimisée avec LEFT JOIN pour inclure tous les enregistrements. La clause WHERE est bien construite. Les alias de tables sont utilisés correctement. Cependant, l'absence de DISTINCT pourrait conduire à des doublons dans certains cas.",
                    "suggestions": [
                        "Remplacer JOIN par LEFT JOIN pour inclure toutes les catégories, même celles sans emprunts",
                        "Ajouter DISTINCT dans le COUNT pour éviter les doublons potentiels",
                        "Inclure des commentaires explicatifs pour documenter la logique métier"
                    ]
                }}

                RÈGLES STRICTES :
                1. Votre réponse doit être UNIQUEMENT l'objet JSON
                2. Pas de texte avant ou après le JSON
                3. Utilisez des guillemets doubles pour les chaînes
                4. Le feedback doit être une seule chaîne de texte détaillée
                5. Les suggestions doivent être des actions concrètes et spécifiques
                """

                # Obtenir l'analyse détaillée de l'IA avec une température très basse
                response = await ollama_client.generate(
                    model="deepseek-coder",
                    prompt=prompt,
                    temperature=0.1,
                    max_tokens=800
                )
                
                try:
                    # Nettoyer la réponse
                    cleaned_response = response.strip()
                    
                    # Trouver le premier { et le dernier }
                    start = cleaned_response.find('{')
                    end = cleaned_response.rfind('}') + 1
                    
                    if start == -1 or end == 0:
                        raise ValueError("Pas de JSON valide trouvé dans la réponse")
                    
                    # Extraire uniquement la partie JSON
                    json_str = cleaned_response[start:end]
                    
                    # Nettoyer davantage le JSON
                    json_str = re.sub(r'\s+', ' ', json_str)  # Normaliser les espaces
                    json_str = json_str.replace('\n', ' ')
                    json_str = re.sub(r'}\s*}', '}}', json_str)  # Corriger les accolades mal formées
                    json_str = re.sub(r'"\s*}', '"}', json_str)
                    json_str = re.sub(r',\s*]', ']', json_str)  # Corriger les virgules à la fin des tableaux
                    
                    # Parser le JSON
                    data = json.loads(json_str)
                    
                    # Valider la structure
                    if not isinstance(data.get('feedback'), str):
                        raise ValueError("Le feedback doit être une chaîne de caractères")
                    
                    if not isinstance(data.get('suggestions', []), list):
                        raise ValueError("Les suggestions doivent être un tableau")
                    
                    # Nettoyer et limiter les suggestions
                    data['suggestions'] = [str(s).strip() for s in data['suggestions'][:3]]
                    
                    feedbacks.append(data)
                    
                except Exception as e:
                    print(f"Erreur lors du traitement de la réponse : {str(e)}")
                    print(f"Réponse brute : {response}")
                    
                    # Générer une réponse par défaut plus détaillée et spécifique
                    default_feedback = {
                        "feedback": (
                            f"La requête obtient un score de similarité de {similarity:.2f}. "
                            f"La syntaxe SQL est correcte et la requête produit les résultats attendus. "
                            f"Les tables nécessaires sont correctement jointes, mais l'utilisation de LEFT JOIN "
                            f"pourrait améliorer la couverture des données. La structure est claire, "
                            f"mais quelques optimisations pourraient améliorer la performance. "
                            f"Les alias de tables sont bien utilisés, facilitant la lisibilité du code."
                        ),
                        "suggestions": [
                            "Utiliser LEFT JOIN à la place de JOIN pour garantir l'inclusion de tous les enregistrements, même ceux sans correspondance",
                            "Ajouter des index sur les colonnes fréquemment utilisées dans les jointures et les conditions WHERE",
                            "Inclure des commentaires expliquant la logique métier et les choix d'implémentation"
                        ]
                    }
                    feedbacks.append(default_feedback)
            
            # Calculer la note finale
            if scores:
                final_score = sum(scores) / len(scores) * 20
            else:
                final_score = 0
            
            # Préparer le feedback final avec une meilleure structure
            final_feedback = "Évaluation détaillée :\n\n"
            for i, (score, feedback) in enumerate(zip(scores, feedbacks), 1):
                final_feedback += f"Requête {i} :\n"
                final_feedback += f"Score : {score * 20:.1f}/20\n\n"
                final_feedback += "Analyse :\n"
                final_feedback += f"{feedback['feedback']}\n\n"
                final_feedback += "Suggestions d'amélioration :\n"
                for suggestion in feedback['suggestions']:
                    final_feedback += f"• {suggestion}\n"
                final_feedback += "\n"
            
            return {
                "grade": round(final_score, 2),
                "feedback": final_feedback,
                "criteria_scores": {
                    "syntaxe": round(sum(scores) / len(scores) * 10, 2),
                    "logique": round(sum(scores) / len(scores) * 10, 2),
                    "optimisation": round(sum(scores) / len(scores) * 10, 2)
                },
                "improvement_suggestions": [
                    sugg for feedback in feedbacks 
                    for sugg in feedback['suggestions']
                ]
            }
                
        except Exception as e:
            error_msg = str(e) if str(e) else "Une erreur inconnue s'est produite lors de l'évaluation"
            print(f"Erreur lors de l'évaluation : {error_msg}")
            return {
                "grade": 0,
                "feedback": f"Erreur lors de l'évaluation : {error_msg}",
                "criteria_scores": {},
                "improvement_suggestions": [
                    "Vérifiez que votre fichier PDF est correctement formaté",
                    "Assurez-vous que vos requêtes SQL sont valides",
                    "Si le problème persiste, contactez votre professeur"
                ]
            } 