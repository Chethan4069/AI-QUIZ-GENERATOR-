from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware # <--- NEW IMPORT
from .routers import upload, quiz, dashboard 
from . import models # <-- NEW
from .database import engine

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

# --- NEW: CORS CONFIGURATION ---
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"], # Allow all (GET, POST, etc.)
    allow_headers=["*"],
)

# Include Routers
app.include_router(upload.router)
app.include_router(quiz.router)
app.include_router(dashboard.router)

@app.get("/")
def read_root():
    return {"message": "AI Quiz Generator API is Running!"}