from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse # <--- NEW: Import this
from pydantic import BaseModel
from app.services.quiz_service import generate_questions

router = APIRouter()

class QuizRequest(BaseModel):
    topic: str
    difficulty: str
    count: int
    file_id: str

@router.post("/generate_quiz")
async def generate_quiz_endpoint(request: QuizRequest):
    try:
        questions = generate_questions(
            request.topic, 
            request.difficulty, 
            request.count,
            request.file_id
        )
        
        # Check for errors from the service
        if "error" in questions:
            raise HTTPException(status_code=400, detail=questions["error"])
        
        # --- THE FIX ---
        # Instead of returning a python dictionary directly,
        # we wrap it in a JSONResponse. This forces a clean conversion.
        return JSONResponse(content={"questions": questions})
    
    except Exception as e:
        # This will catch any unexpected crashes
        print(f"CRITICAL ERROR in quiz router: {e}") # <--- Added a print for visibility
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {str(e)}")