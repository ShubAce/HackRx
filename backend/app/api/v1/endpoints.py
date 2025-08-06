
# backend/app/api/v1/endpoints.py (Final Version)

import os
import json
from fastapi import APIRouter, Form, HTTPException, UploadFile, File
from typing import Annotated, List
from ...core import vector_db, llm_handler

router = APIRouter()
RELEVANCE_THRESHOLD = 0.7

@router.post("/upload", tags=["Document Processing"])
async def upload_documents(
    files: List[UploadFile] = File(...),
    chat_id: str = Form(...)
):
    if not files:
        raise HTTPException(status_code=400, detail="No files were uploaded.")
    if not chat_id:
        raise HTTPException(status_code=400, detail="A chat_id is required.")

    from ...core import doc_parser, text_processor, vector_db
    processed_files = []

    try:
        store = vector_db.get_vector_store()

        for file in files:
            contents = await file.read()

            # Determine file type and extract text
            if file.filename.lower().endswith(".pdf"):
                text = doc_parser.get_text_from_pdf(contents)
            elif file.filename.lower().endswith(".docx"):
                text = doc_parser.get_text_from_docx(contents)
            elif file.filename.lower().endswith(".eml"):
                text = doc_parser.get_text_from_eml(contents)
            else:
                raise HTTPException(status_code=400, detail=f"Unsupported file type: {file.filename}")

            # Chunk the text
            chunks = text_processor.chunk_text(text)

            # Create Document objects with metadata
            docs = [
                {
                    "page_content": chunk,
                    "metadata": {
                        "source": file.filename,
                        "chat_id": chat_id
                    }
                }
                for chunk in chunks
            ]

            # Add to Pinecone
            store.add_texts(
                texts=[d["page_content"] for d in docs],
                metadatas=[d["metadata"] for d in docs],
                namespace=chat_id
            )

            processed_files.append(file.filename)

        return {"processed_files": processed_files}

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred during processing: {e}")


@router.post("/query", tags=["Query & Reasoning"])
async def query_system(query: Annotated[str, Form()], messages_json: Annotated[str, Form()], chat_id: Annotated[str, Form()]):
    if not query or not query.strip(): raise HTTPException(status_code=400, detail="Query cannot be empty.")
    try:
        messages = json.loads(messages_json)
        new_title = None
        if len(messages) == 1 and messages[0]['role'] == 'ai':
             new_title = llm_handler.generate_chat_title(query)

        parsed_query = llm_handler.extract_entities_from_query(query)
        # For general questions, the raw query is a better search term.
        search_term = parsed_query.procedure or query
        context_chunks_with_scores = vector_db.query_vectors_with_scores(search_term, top_k=5, namespace=chat_id)

        if not context_chunks_with_scores or context_chunks_with_scores[0][1] < RELEVANCE_THRESHOLD:
            return { "response_type": "GeneralAnswer", "topic": "Irrelevant Inquiry", "decision": None, "conversational_answer": "I can only answer questions based on the documents you've uploaded in this chat.", "justification": "The user's query was determined to be irrelevant.", "supporting_clauses": [], "new_chat_title": new_title or "General Inquiry" }

        context_chunks = [{"source": doc.metadata.get("source", "unknown"), "text": doc.page_content, "score": score} for doc, score in context_chunks_with_scores]
        
        final_response = llm_handler.run_reasoning_pipeline(
            case_details=parsed_query,
            context_chunks=context_chunks,
            original_query=query # Pass the original query for intent detection
        )
        
        response_data = final_response.dict()
        response_data["new_chat_title"] = new_title
        return response_data
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
