from fastapi import APIRouter, UploadFile, File, HTTPException
from app.services.pdf_handler import extract_text_from_pdf
from app.services.rag_service import store_text_in_vector_db

router = APIRouter()

@router.post("/upload-pdf")
async def upload_study_material(file: UploadFile = File(...)):
    """
    Uploads a PDF, extracts text, and indexes it for the AI.
    """
    if not file.filename.endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Only PDF files are allowed.")

    try:
        # 1. Extract Text
        raw_text = extract_text_from_pdf(file)
        
        # 2. Store in Vector DB
        # We use the filename as the document ID for now
        chunk_count = store_text_in_vector_db(raw_text, doc_id=file.filename)
        
        return {
            "filename": file.filename,
            "status": "Success", 
            "message": f"Processed {len(raw_text)} characters into {chunk_count} chunks.",
            "db_path": "data/chroma_db"
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))