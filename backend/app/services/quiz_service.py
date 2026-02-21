import json
import json_repair
from langchain_groq import ChatGroq  # <-- CHANGED
from langchain_core.prompts import PromptTemplate
import chromadb
import os
import time
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Setup ChromaDB (no changes here)
chroma_client = chromadb.PersistentClient(path="./data/chroma_db")
collection = chroma_client.get_or_create_collection(name="study_material")

# --- NEW: Setup Groq AI ---
llm = ChatGroq(
    model="llama3-8b-8192", # A powerful, free model
    temperature=0.7,
    api_key=os.getenv("GROQ_API_KEY")
)

def generate_questions(topic: str, difficulty: str, count: int, file_id: str):
    
    # RAG Search (no changes here)
    results = collection.query(
        query_texts=[topic], n_results=5, where={"file_id": file_id}
    )
    context_text = ""
    if results.get('documents') and results['documents'][0]:
        context_text = "\n".join(results['documents'][0])
    
    if not context_text or len(context_text) < 100:
        return {"error": "Topic not found or text is too short. Try a broader keyword."}

    # Prompt (no changes here)
    prompt_template = f"""
    TASK: Generate {count} multiple-choice questions.
    DIFFICULTY: {difficulty.upper()}
    SOURCE TEXT: "{context_text[:3000]}"

    IMPERATIVE: YOUR ENTIRE RESPONSE MUST BE A SINGLE, VALID JSON ARRAY.
    Your response must start with `[` and end with `]`.

    JSON_FORMAT:
    [
      {{
        "question": "...", "options": ["...", "...", "...", "..."], "correct_answer": "...", "explanation": "..."
      }}
    ]
    """
    
    # Retry Mechanism (no changes here)
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"DEBUG: Groq AI Attempt {attempt + 1}/{max_retries}")
            response = llm.invoke(prompt_template)
            content = response.content.strip()
            
            if not content: continue
            
            repaired_json = json_repair.loads(content)
            questions = []
            if isinstance(repaired_json, dict): questions = [repaired_json] 
            elif isinstance(repaired_json, list): questions = repaired_json
            
            if len(questions) > 0: return questions
        
        except Exception as e:
            print(f"⚠️ Attempt {attempt + 1} failed: {e}")
            time.sleep(1)

    return {"error": "AI failed to generate a quiz after multiple attempts."}