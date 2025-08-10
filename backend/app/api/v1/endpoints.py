# backend/app/api/v1/endpoints.py

# Add these imports at the top
import asyncio
import uuid
import requests
import json
from fastapi import APIRouter, HTTPException, Depends, Header, UploadFile, File, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from pydantic import BaseModel, Field, HttpUrl
from typing import List, Optional
import os
from ...core import doc_parser, text_processor, vector_db, llm_handler

# ... (your existing router and RELEVANCE_THRESHOLD can stay)
router = APIRouter()
RELEVANCE_THRESHOLD = 0.7 
# Hackathon Bearer Token
HACKRX_BEARER_TOKEN = "184b56fa8dab42f73bd2991d1873efbcb8cc0155aee1385aff188b59c4ff109e"
security = HTTPBearer()

# --- Pydantic Models for Hackathon Endpoint ---
class HackRxRequest(BaseModel):
    documents: HttpUrl = Field(..., description="URL to the document to be processed.")
    questions: List[str] = Field(..., description="A list of questions to answer based on the document.")

class HackRxResponse(BaseModel):
    answers: List[str]

# --- Security Dependency ---
def verify_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    if credentials.scheme != "Bearer" or credentials.credentials != HACKRX_BEARER_TOKEN:
        raise HTTPException(status_code=401, detail="Invalid or missing authentication token")
    return credentials.credentials

# Additional models for upload/query endpoints
class QueryResponse(BaseModel):
    conversational_answer: str
    topic: Optional[str] = None
    decision: Optional[str] = None
    justification: Optional[str] = None
    calculation_explanation: Optional[str] = None
    supporting_clauses: Optional[List[dict]] = None
    new_chat_title: Optional[str] = None

class UploadResponse(BaseModel):
    message: str
    processed_files: List[str]

@router.post("/upload", response_model=UploadResponse, tags=["Upload"])
async def upload_files(
    files: List[UploadFile] = File(...),
    chat_id: str = Form(...)
):
    """
    Upload multiple files and process them for a specific chat session.
    """
    MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB limit
    
    try:
        print(f"📁 Upload request received for chat_id: {chat_id}")
        print(f"📁 Number of files: {len(files)}")
        
        processed_files = []
        
        for file in files:
            print(f"📄 Processing file: {file.filename}")
            
            # Validate file type
            if not file.filename.lower().endswith(('.pdf', '.docx', '.eml')):
                print(f"❌ Invalid file type: {file.filename}")
                raise HTTPException(
                    status_code=400, 
                    detail=f"Unsupported file type: {file.filename}. Only PDF, DOCX, and EML files are supported."
                )
            
            # Check file size
            if file.size and file.size > MAX_FILE_SIZE:
                print(f"❌ File too large: {file.filename} ({file.size} bytes)")
                raise HTTPException(
                    status_code=413,
                    detail=f"File {file.filename} is too large. Maximum size is 10MB."
                )
            
            # Read file content
            try:
                print(f"📖 Reading file content: {file.filename}")
                contents = await file.read()
                if len(contents) > MAX_FILE_SIZE:
                    print(f"❌ File content too large: {file.filename} ({len(contents)} bytes)")
                    raise HTTPException(
                        status_code=413,
                        detail=f"File {file.filename} is too large. Maximum size is 10MB."
                    )
                print(f"✅ File read successfully: {file.filename} ({len(contents)} bytes)")
            except Exception as e:
                print(f"❌ Failed to read file {file.filename}: {str(e)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to read file {file.filename}: {str(e)}"
                )
            
            # Extract text based on file type
            try:
                print(f"🔍 Extracting text from: {file.filename}")
                if file.filename.lower().endswith('.pdf'):
                    text = doc_parser.get_text_from_pdf(contents)
                elif file.filename.lower().endswith('.docx'):
                    text = doc_parser.get_text_from_docx(contents)
                elif file.filename.lower().endswith('.eml'):
                    text = doc_parser.get_text_from_eml(contents)
                else:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Unsupported file type: {file.filename}"
                    )
                print(f"✅ Text extracted successfully: {len(text)} characters")
            except Exception as e:
                print(f"❌ Text extraction failed for {file.filename}: {str(e)}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Failed to extract text from {file.filename}: {str(e)}"
                )
            
            if not text or not text.strip():
                print(f"❌ No text content found in: {file.filename}")
                raise HTTPException(
                    status_code=400,
                    detail=f"Could not extract text from {file.filename}. The file may be empty or corrupted."
                )
            
            # Process and store text
            try:
                print(f"📦 Chunking text for: {file.filename}")
                chunks = text_processor.chunk_text(text)
                print(f"✅ Created {len(chunks)} chunks")
                
                if chunks:
                    print(f"🔗 Storing in vector database...")
                    backend_result = vector_db.add_texts(
                        texts=chunks,
                        metadatas=[{"source": file.filename, "chat_id": chat_id}] * len(chunks),
                        namespace=chat_id
                    )
                    processed_files.append(f"{file.filename} ({backend_result['backend']})")
                    print(f"✅ Stored {file.filename} using backend={backend_result['backend']} count={backend_result['count']}")
                else:
                    print(f"❌ No chunks created for: {file.filename}")
                    raise HTTPException(
                        status_code=400,
                        detail=f"Could not process text from {file.filename}"
                    )
            except Exception as e:
                print(f"❌ Vector storage failed for {file.filename}: {str(e)}. Using fallback if available.")
                # Last attempt: put minimal doc into fallback store
                try:
                    vector_db.add_texts(
                        texts=[text[:2000]],
                        metadatas=[{"source": file.filename, "chat_id": chat_id, "partial": True}],
                        namespace=chat_id
                    )
                    processed_files.append(f"{file.filename} (partial-fallback)")
                except Exception as inner_e:
                    print(f"💥 Fallback add failed for {file.filename}: {inner_e}")
                    raise HTTPException(
                        status_code=500,
                        detail=f"Failed to process {file.filename}: {str(e)}"
                    )
        
        print(f"🎉 Upload completed successfully! Processed files: {processed_files}")
        backend_state = vector_db.backend_status() if hasattr(vector_db, 'backend_status') else {}
        return UploadResponse(
            message=f"Successfully processed {len(processed_files)} files (backend: {'fallback' if backend_state.get('fallback_mode') else 'remote'})",
            processed_files=processed_files
        )
        
    except Exception as e:
        print(f"💥 Upload error: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

@router.post("/query", response_model=QueryResponse, tags=["Query"])
async def query_documents(
    query: str = Form(...),
    chat_id: str = Form(...),
    messages_json: str = Form(...)
):
    """
    Query the uploaded documents for a specific chat session.
    """
    try:
        # Parse the messages history
        try:
            messages = json.loads(messages_json)
        except json.JSONDecodeError:
            messages = []
        
        # Query the vector store within the chat namespace
        context_chunks_with_scores = vector_db.query_vectors_with_scores(
            query, top_k=8, namespace=chat_id
        )
        
        if not context_chunks_with_scores:
            return QueryResponse(
                conversational_answer="I couldn't find relevant information in your uploaded documents to answer this question. Please make sure you've uploaded the relevant policy or claim documents."
            )
        
        # Filter by relevance threshold
        relevant_docs = [
            doc.page_content for doc, score in context_chunks_with_scores 
            if score >= RELEVANCE_THRESHOLD
        ]
        
        if not relevant_docs:
            return QueryResponse(
                conversational_answer="The uploaded documents don't seem to contain relevant information for your question. Could you try rephrasing your question or upload more specific documents?"
            )
        
        context = "\n---\n".join(relevant_docs)
        
        # Use the enhanced LLM pipeline for structured analysis
        try:
            # Extract entities from the query
            entities = llm_handler.extract_entities_from_query(query)
            
            # Format context for the reasoning pipeline
            context_dict = [
                {
                    "content": doc.page_content,
                    "source": doc.metadata.get("source", "unknown"),
                    "score": score
                }
                for doc, score in context_chunks_with_scores if score >= RELEVANCE_THRESHOLD
            ]
            
            # Run the full reasoning pipeline
            response = llm_handler.run_reasoning_pipeline(entities, context_dict, query)
            
            # Format response
            response_data = {
                "conversational_answer": response.conversational_answer,
                "topic": response.topic,
                "decision": response.decision,
                "justification": response.justification,
                "calculation_explanation": response.calculation_explanation,
                "supporting_clauses": [
                    {
                        "clause_id": clause.clause_id,
                        "clause_text": clause.clause_text,
                        "source_document": clause.source_document,
                        "relevance_score": getattr(clause, 'relevance_score', None),
                        "page_number": getattr(clause, 'page_number', None)
                    }
                    for clause in response.supporting_clauses
                ] if response.supporting_clauses else []
            }
            
        except Exception as llm_error:
            # Fallback to simple LLM response if structured analysis fails
            print(f"LLM pipeline error: {llm_error}")
            answer = await llm_handler.get_direct_answer(query, context)
            response_data = {
                "conversational_answer": answer
            }
        
        # Generate chat title for new conversations
        if len(messages) <= 2:  # First user message
            try:
                response_data["new_chat_title"] = llm_handler.generate_chat_title(query)
            except:
                response_data["new_chat_title"] = f"Claim: {query[:50]}..." if len(query) > 50 else f"Claim: {query}"
        
        return QueryResponse(**response_data)
        
    except Exception as e:
        print(f"Query error: {e}")
        raise HTTPException(status_code=500, detail=f"Query failed: {str(e)}")

# --- NEW HACKATHON ENDPOINT ---
@router.post("/hackrx/run", 
             response_model=HackRxResponse,
             tags=["Hackathon Submission"],
             dependencies=[Depends(verify_token)])
async def hackrx_run_submission(payload: HackRxRequest):
    """
    Processes a single document from a URL and answers a list of questions about it.
    This is a stateless endpoint designed for the hackathon's evaluation.
    """
    # 1. Generate a unique ID for this request to use as a Pinecone namespace
    request_namespace = str(uuid.uuid4())
    
    try:
        # 2. Input Documents: Download the file from the URL
        response = requests.get(str(payload.documents))
        response.raise_for_status() # Raise an exception for bad status codes
        contents = response.content
        filename = os.path.basename(str(payload.documents).split('?')[0]) # Get a clean filename

        # 3. LLM Parser (File Content Extraction)
        if filename.lower().endswith(".pdf"):
            text = doc_parser.get_text_from_pdf(contents)
        elif filename.lower().endswith(".docx"):
            text = doc_parser.get_text_from_docx(contents)
        elif filename.lower().endswith(".eml"):
            text = doc_parser.get_text_from_eml(contents)
        else:
            raise HTTPException(status_code=400, detail=f"Unsupported file type from URL: {filename}")

        # 4. Chunking & Embedding
        chunks = text_processor.chunk_text(text)
        if not chunks:
            raise HTTPException(status_code=400, detail="Could not extract any text from the document.")

        store = vector_db.get_vector_store()
        store.add_texts(
            texts=chunks,
            metadatas=[{"source": filename}] * len(chunks),
            namespace=request_namespace # Use the unique namespace
        )

        # 5. Process all questions in parallel for efficiency (addresses Latency)
        async def process_question(question: str):
            # 5a. Embedding Search & Clause Matching
            context_chunks_with_scores = vector_db.query_vectors_with_scores(
                question, top_k=5, namespace=request_namespace
            )
            
            relevant_docs = [doc.page_content for doc, score in context_chunks_with_scores if score > RELEVANCE_THRESHOLD]
            
            if not relevant_docs:
                return "I could not find relevant information in the document to answer this question."

            context = "\n---\n".join(relevant_docs)
            
            # 5b. Logic Evaluation
            answer = await llm_handler.get_direct_answer(question, context)
            return answer

        # Run all question processing tasks concurrently
        tasks = [process_question(q) for q in payload.questions]
        answers = await asyncio.gather(*tasks)

        # 6. JSON Output
        return HackRxResponse(answers=answers)

    except requests.exceptions.RequestException as e:
        raise HTTPException(status_code=400, detail=f"Failed to download document from URL: {e}")
    except Exception as e:
        # Log the full error for debugging
        print(f"An unexpected error occurred: {e}")
        raise HTTPException(status_code=500, detail=f"An internal error occurred: {e}")
    finally:
        # IMPORTANT: Clean up the namespace in Pinecone to ensure statelessness
        print(f"Cleaning up namespace: {request_namespace}")
        vector_db.delete_namespace(request_namespace)