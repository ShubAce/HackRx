from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.v1 import endpoints

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Insurance Claim Assistant",
    description="An advanced API for processing documents and answering natural language queries.",
    version="1.0.0",
)

# --- THIS IS THE FIX ---
# We have added your live Vercel URL to the list of allowed origins.
origins = [
    "https://insurance-claim-virid.vercel.app",  # Your deployed frontend URL
    "http://localhost:5173",                      # Local dev (Vite)
    "http://localhost:3000",                      # Local dev (alt)
]

# Allow Vercel preview deployments (*.vercel.app) using regex
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(endpoints.router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
async def read_root():
    return {"status": "success", "message": "Welcome to the DocQuery AI API. Navigate to /docs for interactive documentation."}

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "healthy", "timestamp": "2025-08-09"}

