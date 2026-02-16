from langchain_community.vectorstores import Chroma
from langchain_openai import OpenAIEmbeddings
from langchain_text_splitters import RecursiveCharacterTextSplitter
from app.core.config import settings
import shutil
import os

# Initialize OpenAI Embeddings (Cost effective model)
embedding_function = OpenAIEmbeddings(
    model="text-embedding-3-small",
    api_key=settings.OPENAI_API_KEY
)

def store_text_in_vector_db(text: str, doc_id: str):
    """
    1. Splits huge text into smaller chunks.
    2. Converts chunks to vectors.
    3. Stores them in ChromaDB.
    """
    
    # 1. Split Text (Chunks of 1000 chars with 200 overlap to maintain context)
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=1000,
        chunk_overlap=200,
        length_function=len,
    )
    chunks = text_splitter.split_text(text)
    
    # Metadata helps us find which PDF the text belongs to later
    metadatas = [{"source": doc_id} for _ in chunks]

    # 2. Store in ChromaDB (Persistent means it saves to disk)
    vector_store = Chroma.from_texts(
        texts=chunks,
        embedding=embedding_function,
        metadatas=metadatas,
        persist_directory=settings.CHROMA_DB_DIR
    )
    
    # In older versions .persist() was required, in new LangChain it's auto
    return len(chunks)

def clear_database():
    """Optional: Helper to reset DB during testing"""
    if os.path.exists(settings.CHROMA_DB_DIR):
        shutil.rmtree(settings.CHROMA_DB_DIR)