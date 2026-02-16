import os
from pypdf import PdfReader
from langchain_text_splitters import RecursiveCharacterTextSplitter
import chromadb

chroma_client = chromadb.PersistentClient(path="./data/chroma_db")
collection = chroma_client.get_or_create_collection(name="study_material")

# --- NEW: Function now accepts file_id ---
def process_pdf(file_path: str, original_filename: str, file_id: str):
    reader = PdfReader(file_path)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    
    text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
    chunks = text_splitter.split_text(text)

    # --- NEW: Create a metadata tag for each chunk ---
    # This is how we will filter later
    metadatas = [{"file_id": file_id} for _ in range(len(chunks))]
    ids = [f"{file_id}_{i}" for i in range(len(chunks))]
    
    collection.add(
        documents=chunks,
        ids=ids,
        metadatas=metadatas
    )
    
    return {"message": f"Processed {len(chunks)} chunks from {original_filename}"}