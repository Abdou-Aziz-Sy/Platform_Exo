import aiohttp
import json
from typing import Optional
import os
from dotenv import load_dotenv

load_dotenv()

class OllamaClient:
    def __init__(self):
        self.base_url = os.getenv("OLLAMA_API_URL", "http://localhost:11434")
        
    async def generate(
        self,
        model: str,
        prompt: str,
        temperature: float = 0.7,
        max_tokens: Optional[int] = None
    ) -> str:
        """
        Génère une réponse à partir du modèle spécifié.
        """
        url = f"{self.base_url}/api/generate"
        
        data = {
            "model": model,
            "prompt": prompt,
            "temperature": temperature,
        }
        
        if max_tokens:
            data["max_tokens"] = max_tokens
            
        async with aiohttp.ClientSession() as session:
            async with session.post(url, json=data) as response:
                if response.status != 200:
                    raise Exception(f"Erreur Ollama: {await response.text()}")
                
                # Ollama renvoie les réponses ligne par ligne en streaming
                full_response = ""
                async for line in response.content:
                    try:
                        json_response = json.loads(line)
                        if "response" in json_response:
                            full_response += json_response["response"]
                    except json.JSONDecodeError:
                        continue
                        
                return full_response

ollama_client = OllamaClient() 