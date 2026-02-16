import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "AI Quiz Generator"
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY")
    CHROMA_DB_DIR: str = "data/chroma_db"
    
    # Load Database URL from .env (Fail if not found)
    DATABASE_URL: str = os.getenv("DATABASE_URL")

settings = Settings()