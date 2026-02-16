from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from .. import models, database
from pydantic import BaseModel
from fastapi import Response

router = APIRouter()

# --- For now, we will hardcode a user ---
# In a real app, this would come from a login system.
FAKE_USER_ID = 1 

@router.post("/save_quiz")
def save_quiz(quiz_data: dict, db: Session = Depends(database.get_db)):
    # First, check if our fake user exists, create if not
    db_user = db.query(models.User).filter(models.User.id == FAKE_USER_ID).first()
    if not db_user:
        db_user = models.User(id=FAKE_USER_ID, email="testuser@example.com")
        db.add(db_user)
        db.commit()
        db.refresh(db_user)

    new_quiz = models.Quiz(
        title=quiz_data.get('title', 'Untitled Quiz'),
        topic=quiz_data.get('topic'),
        questions=quiz_data.get('questions'),
        owner_id=FAKE_USER_ID
    )
    db.add(new_quiz)
    db.commit()
    db.refresh(new_quiz)
    return new_quiz

@router.get("/my_quizzes")
def get_my_quizzes(db: Session = Depends(database.get_db)):
    quizzes = db.query(models.Quiz).filter(models.Quiz.owner_id == FAKE_USER_ID).all()
    # Here you could also calculate stats like average score etc.
    return {"quizzes": quizzes, "total_quizzes": len(quizzes)}

@router.get("/quiz/{quiz_id}")
def get_quiz_details(quiz_id: int, db: Session = Depends(database.get_db)):
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")
    
    # --- THIS IS THE FIX ---
    # We need to manually convert the SQLAlchemy object to a dictionary
    # that can be sent as JSON.
    return {
        "id": quiz.id,
        "title": quiz.title,
        "topic": quiz.topic,
        "questions": quiz.questions
    }

class QuizAttemptRequest(BaseModel):
    quiz_id: int
    score: int
    total_questions: int
    selected_options: dict # {"0": "Option A", "1": "Option C"}

@router.post("/submit_quiz")
def submit_quiz(attempt_data: QuizAttemptRequest, db: Session = Depends(database.get_db)):
    # Calculate percentage
    # (Optional: You could recalculate the score here for security, but we trust frontend for now)
    
    new_attempt = models.QuizAttempt(
        quiz_id=attempt_data.quiz_id,
        user_id=FAKE_USER_ID, # Hardcoded user for now
        score=attempt_data.score,
        selected_options=attempt_data.selected_options
    )
    
    db.add(new_attempt)
    db.commit()
    db.refresh(new_attempt)
    
    return {"message": "Quiz submitted successfully", "attempt_id": new_attempt.id}

@router.get("/quiz/{quiz_id}/analytics")
def get_quiz_analytics(quiz_id: int, db: Session = Depends(database.get_db)):
    # 1. Get the Quiz
    quiz = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    if not quiz:
        raise HTTPException(status_code=404, detail="Quiz not found")

    # 2. Get all Attempts for this Quiz
    attempts = db.query(models.QuizAttempt).filter(models.QuizAttempt.quiz_id == quiz_id).all()
    
    # We define all our variables first, with default values.
    total_attempts = len(attempts)
    avg_score = 0
    question_stats = []

    # Only calculate stats if there are attempts to analyze
    if total_attempts > 0:
        # Calculate Average Score
        total_score = sum([a.score for a in attempts])
        avg_score = total_score / total_attempts

        # Calculate Question Performance
        questions = quiz.questions
        for index, question_data in enumerate(questions):
            correct_count = 0
            for attempt in attempts:
                # Retrieve the user's answer
                user_selected = attempt.selected_options.get(str(index))
                
                # Check if it matches the correct answer safely
                correct_ans = question_data.get('correct_answer', '').strip()
                if user_selected and user_selected.strip() == correct_ans:
                    correct_count += 1
            
            pass_rate = (correct_count / total_attempts) * 100
            
            # --- FIX IS HERE: COMMAS ADDED CORRECTLY ---
            question_stats.append({
                "question": question_data.get('question', 'Unknown Question'),
                "pass_rate": round(pass_rate, 1),
                "correct_answer": question_data.get('correct_answer', 'N/A')
            })

    # Return results
    return {
        "title": quiz.title,
        "total_attempts": total_attempts,
        "average_score": round(avg_score, 1),
        "question_stats": question_stats
    }
@router.delete("/quiz/{quiz_id}")
def delete_quiz(quiz_id: int, db: Session = Depends(database.get_db)):
    # We must delete the attempts first due to the database relationship
    db.query(models.QuizAttempt).filter(models.QuizAttempt.quiz_id == quiz_id).delete()
    
    # Then delete the quiz itself
    quiz_to_delete = db.query(models.Quiz).filter(models.Quiz.id == quiz_id).first()
    
    if not quiz_to_delete:
        raise HTTPException(status_code=404, detail="Quiz not found")
        
    db.delete(quiz_to_delete)
    db.commit()
    
    return Response(status_code=204)