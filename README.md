# 📚 AI Quiz Generator (RAG Pipeline)

A full-stack AI application that generates interactive quizzes from PDF study materials. Built with **Next.js**, **FastAPI**, **LangChain**, and **Local LLMs (Ollama)**.

## 🚀 Features
- **RAG Pipeline:** Extracts text from PDFs and retrieves relevant context using Vector Search (ChromaDB).
- **Local AI:** Uses `gemma:2b` (via Ollama) for cost-free, offline question generation.
- **Adaptive Learning:** Quizzes are generated based on difficulty levels (Easy/Medium/Hard).
- **Analytics Dashboard:** Tracks user scores, pass rates, and question performance.
- **Exam Mode:** Simulates real exams with timers and negative marking.

## 🛠️ Tech Stack
- **Frontend:** Next.js (React), Tailwind CSS, Lucide Icons.
- **Backend:** Python, FastAPI, SQLAlchemy (PostgreSQL).
- **AI/ML:** LangChain, Ollama, ChromaDB (Vector Store).

## 📦 Setup
1. Clone the repo.
2. Install Backend: `cd backend && pip install -r requirements.txt`
3. Install Frontend: `cd frontend && npm install`
4. Run Ollama: `ollama run gemma:2b`
5. Start App: Run `uvicorn` and `npm run dev`.
