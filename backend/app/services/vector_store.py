import chromadb
from chromadb.config import Settings

# 1. Setup Client
# This saves the AI memory to a local folder so you don't lose it on restart
chroma_client = chromadb.PersistentClient(path="./data/chroma_db")

# 2. Create/Get a Collection (Like a Table in SQL)
collection = chroma_client.get_or_create_collection(name="study_materials")

def add_text_to_vector_db(text_chunks, filename):
    ids = [f"{filename}_{i}" for i in range(len(text_chunks))]
    metadatas = [{"source": filename} for _ in text_chunks]
    
    # Chroma handles embedding automatically if configured, 
    # but usually, we pass embeddings explicitly.
    # For now, let's assume we pass raw text and Chroma uses default embedding.
    collection.add(
        documents=text_chunks,
        ids=ids,
        metadatas=metadatas
    )

def query_vector_db(query_text, n_results=3):
    results = collection.query(
        query_texts=[query_text],
        n_results=n_results
    )
    return results['documents'][0] # Returns list of relevant text chunks