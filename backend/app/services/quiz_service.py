import json
import json_repair
from langchain_ollama import ChatOllama
from langchain_core.prompts import PromptTemplate
import chromadb
import time

chroma_client = chromadb.PersistentClient(path="./data/chroma_db")
collection = chroma_client.get_or_create_collection(name="study_material")
llm = ChatOllama(model="gemma:2b")

def generate_questions(topic: str, difficulty: str, count: int, file_id: str):
    
    print(f"DEBUG: Searching for topic='{topic}' with file_id='{file_id}'")
    results = collection.query(
        query_texts=[topic],
        n_results=5,
        where={"file_id": file_id}
    )
    
    context_text = ""
    if results.get('documents') and results['documents'][0]:
        context_text = "\n".join(results['documents'][0])
    
    if not context_text or len(context_text) < 100:
        return {"error": f"Topic '{topic}' not found in the PDF. Try a broader keyword."}

    # Prompt Engineering
    prompt_template = f"""
    TASK: Generate {count} multiple-choice questions.
    DIFFICULTY: {difficulty.upper()}
    SOURCE TEXT: "{context_text[:2500]}"

    IMPERATIVE: YOUR ENTIRE RESPONSE MUST BE A SINGLE, VALID JSON ARRAY.
    DO NOT write any other text. Start with `[` and end with `]`.

    JSON_FORMAT:
    [
      {{
        "question": "...",
        "options": ["...", "...", "...", "..."],
        "correct_answer": "...",
        "explanation": "..."
      }}
    ]
    """
    
    # --- NEW: RETRY MECHANISM ---
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"DEBUG: AI Generation Attempt {attempt + 1}/{max_retries}")
            
            response = llm.invoke(prompt_template)
            content = response.content.strip()
            
            print(f"DEBUG: AI Raw Response:\n---\n{content}\n---")
            
            # If AI returns nothing, retry immediately
            if not content:
                print("⚠️ AI returned empty content. Retrying...")
                continue

            repaired_json = json_repair.loads(content)

            # Normalize data structure
            questions = []
            if isinstance(repaired_json, dict):
                questions = [repaired_json] 
            elif isinstance(repaired_json, list):
                questions = repaired_json
            
            # Validate questions exist
            if len(questions) > 0:
                return questions # Success! Return immediately
            else:
                print(f"⚠️ Attempt {attempt + 1} produced valid JSON but no questions.")
        
        except Exception as e:
            print(f"⚠️ Attempt {attempt + 1} failed: {e}")
            time.sleep(1) # Wait 1 second before retrying

    # If we get here, all 3 attempts failed
    return {"error": "AI failed to generate a quiz after multiple attempts. Please try a simpler topic."}