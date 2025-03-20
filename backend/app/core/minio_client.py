from minio import Minio
from minio.error import S3Error
from fastapi import UploadFile
import os
from dotenv import load_dotenv

load_dotenv()

class MinioClient:
    def __init__(self):
        # En mode développement, on désactive MinIO
        self.client = None
        self.bucket_name = "evaluation-files"
        self._ensure_bucket_exists()

    def _ensure_bucket_exists(self):
        # En mode développement, on ne fait rien
        pass

    async def upload_file(self, file: UploadFile, object_name: str) -> str:
        # En mode développement, on simule un upload
        try:
            file_data = await file.read()
            # On stocke temporairement dans un dossier local
            os.makedirs("uploads", exist_ok=True)
            file_path = os.path.join("uploads", object_name)
            with open(file_path, "wb") as f:
                f.write(file_data)
            return f"uploads/{object_name}"
        except Exception as e:
            raise Exception(f"Erreur lors de l'upload du fichier: {e}")
        finally:
            await file.close()

    def get_file_url(self, object_name: str) -> str:
        # En mode développement, on retourne un chemin local
        return f"/uploads/{object_name}"

minio_client = MinioClient() 