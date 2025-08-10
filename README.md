# Insurance Claims RAG Assistant

End-to-end document question-answering app for insurance claims. Users upload policy and claim documents, then ask natural-language questions. Answers are produced via Retrieval-Augmented Generation (RAG) with Google Generative AI embeddings and a resilient vector layer (Pinecone with in-memory fallback), surfaced in a responsive React UI with an evidence panel.

## Tech Stack

- Backend: FastAPI, Uvicorn, LangChain, Google Generative AI (embeddings and LLM)
- Vector layer: Pinecone (primary) + in-memory fallback store (for offline/local dev)
- Frontend: React (Vite), Tailwind CSS, Framer Motion, Axios
- Language: Python 3.12, Node.js 18+

## Monorepo Layout

```
backend/                # FastAPI app (API endpoints, vector DB, LLM pipeline)
	app/
		api/v1/             # /api/v1/upload, /api/v1/query, etc.
		core/               # vector_db, llm_handler, text processing
		main.py             # FastAPI app entrypoint

HackRxbackend/          # React frontend (Vite)
	src/                  # UI components and app shell
```

## Prerequisites

- Python 3.12 with pip
- Node.js 18+ and npm
- Optional but recommended: API keys
	- GOOGLE_API_KEY (for embeddings/LLM)
	- PINECONE_API_KEY and PINECONE_INDEX_NAME (for remote vector store)

If the Pinecone service is unavailable, the app gracefully falls back to an in-memory vector store so you can still upload and query during development.

## Backend Setup (Windows)

1) Create a virtual environment and install dependencies

```cmd
cd backend
python -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

2) Create a .env file (backend/.env)

```env
GOOGLE_API_KEY=your_google_api_key
PINECONE_API_KEY=your_pinecone_api_key   # optional for remote vector store
PINECONE_INDEX_NAME=your_index_name      # optional if using Pinecone
```

3) Run the API server

```cmd
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

API docs will be available at http://127.0.0.1:8000/docs

## Frontend Setup (Windows)

```cmd
cd HackRxbackend
npm install
npm run dev
```

The dev server typically starts at http://127.0.0.1:5173

## Key API Endpoints

- GET /health — service health check
- POST /api/v1/upload — multipart file upload (PDF, DOCX, EML)
- POST /api/v1/query — ask a question; returns an answer plus supporting clauses

## Features

- Multi-file upload with progress, robust timeouts, and server-side logging
- RAG pipeline using Google Generative AI embeddings and LangChain
- Resilient vector DB layer with Pinecone primary and in-memory fallback
- Structured LLM prompting for accurate, explainable decisions
- Responsive UI with a mobile bottom-sheet evidence panel and rich animations

## Troubleshooting

- Pinecone DNS/unavailable: The backend automatically switches to a local in-memory vector store; you can continue testing without cloud dependencies.
- CORS/Network errors: Ensure you run the backend on 127.0.0.1:8000 and the frontend on 127.0.0.1:5173. The backend enables permissive CORS for development.
- Upload timeouts: Large files or slow networks can cause slowness; the client uses extended timeouts and progress tracking.

## Notes

- This repository is set up for rapid local iteration. For production, harden CORS, restrict file types/size, and use a durable vector store.
