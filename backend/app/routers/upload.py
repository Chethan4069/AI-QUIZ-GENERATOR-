from fastapi import APIRouter, UploadFile, File, HTTPException
import shutil
import os
from app.services.pdf_service import process_pdf
import uuid # <-- NEW: For generating unique IDs

router = APIRouter()
UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)

@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed")

    # --- NEW: Generate a unique ID for this file session ---
    unique_filename = f"{uuid.uuid4()}.pdf"
    file_path = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    try:
        # --- NEW: Pass the unique ID to the processing service ---
        result = process_pdf(file_path, str(file.filename), unique_filename)
        
        os.remove(file_path) 
        
        # --- NEW: Return the unique ID to the Frontend ---
        return {"message": result["message"], "file_id": unique_filename}

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))