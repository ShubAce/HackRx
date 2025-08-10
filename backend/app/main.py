
import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.v1 import endpoints

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="Insurance Claim App",
    description="An advanced API for processing documents and answering natural language queries using Retrieval-Augmented Generation.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for development purposes
    allow_credentials=True,
    allow_methods=["*"],  # Allows all HTTP methods
    allow_headers=["*"],  # Allows all headers
)

app.include_router(endpoints.router, prefix="/api/v1")

@app.get("/", tags=["Health Check"])
async def read_root():
    return {"status": "success", "message": "Welcome to the DocQuery AI API. Navigate to /docs for interactive documentation."}

@app.get("/health", tags=["Health Check"])
async def health_check():
    return {"status": "healthy", "timestamp": "2025-08-09"}

