import os
import math
import threading
from collections import defaultdict, Counter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.docstore.document import Document

PINECONE_INDEX_NAME = "hackrxuser1"
EMBEDDING_MODEL_NAME = 'models/embedding-001'
vector_store = None
fallback_mode = False  # True when remote vector DB unavailable
_init_lock = threading.Lock()

# In-memory fallback storage: namespace -> list[Document]
_local_store = defaultdict(list)

class VectorBackendUnavailable(Exception):
    pass

def _init_remote_store():
    global vector_store, fallback_mode
    if vector_store is not None or fallback_mode:
        return
    google_api_key = os.getenv("GOOGLE_API_KEY")
    pinecone_api_key = os.getenv("PINECONE_API_KEY")
    if not google_api_key or not pinecone_api_key:
        fallback_mode = True
        print("[vector_db] Missing API keys. Activating local fallback store.")
        return
    try:
        embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL_NAME, google_api_key=google_api_key, task_type="retrieval_document")
        vector_store = PineconeVectorStore.from_existing_index(index_name=PINECONE_INDEX_NAME, embedding=embeddings)
        print("[vector_db] Remote Pinecone vector store initialized.")
    except Exception as e:
        fallback_mode = True
        print(f"[vector_db] Remote store init failed ({e}). Falling back to in-memory store.")

def get_vector_store():
    with _init_lock:
        _init_remote_store()
    if fallback_mode:
        return None
    return vector_store

def add_texts(texts: list[str], metadatas: list[dict], namespace: str):
    """Add texts to remote store if available, else local fallback."""
    global fallback_mode
    store = get_vector_store()
    if store is not None:
        try:
            store.add_texts(texts=texts, metadatas=metadatas, namespace=namespace)
            return {"backend": "pinecone", "count": len(texts)}
        except Exception as e:
            # Switch to fallback for future operations
            fallback_mode = True
            print(f"[vector_db] Error adding texts to Pinecone ({e}). Switching to fallback.")
    # Fallback path
    for t, m in zip(texts, metadatas):
        _local_store[namespace].append(Document(page_content=t, metadata=m))
    return {"backend": "local", "count": len(texts)}

def _score_local(query: str, doc: Document) -> float:
    """Very simple keyword overlap scoring (normalized)."""
    q_tokens = [w.lower() for w in query.split() if w.isalnum()]
    if not q_tokens:
        return 0.0
    d_tokens = [w.lower() for w in doc.page_content.split()[:500]]  # limit tokens for speed
    q_counts = Counter(q_tokens)
    d_counts = Counter(d_tokens)
    overlap = sum(min(q_counts[t], d_counts.get(t, 0)) for t in q_counts)
    return overlap / (len(q_tokens) or 1)

def query_vectors_with_scores(query: str, top_k: int = 5, namespace: str = None) -> list[tuple[Document, float]]:
    """Query remote store if available; fallback to naive local search."""
    global fallback_mode
    store = get_vector_store()
    if store is not None and not fallback_mode:
        try:
            return store.similarity_search_with_score(query, k=top_k, namespace=namespace)
        except Exception as e:
            fallback_mode = True
            print(f"[vector_db] Query failed on remote ({e}). Falling back to local.")
    # Local search
    docs = _local_store.get(namespace, [])
    scored = [(d, _score_local(query, d)) for d in docs]
    scored.sort(key=lambda x: x[1], reverse=True)
    return scored[:top_k]

def delete_namespace(namespace: str):
    """Delete all vectors in a namespace (remote or local)."""
    if fallback_mode or get_vector_store() is None:
        if namespace in _local_store:
            del _local_store[namespace]
            print(f"[vector_db] Deleted local namespace '{namespace}'.")
        return
    try:
        store = get_vector_store()
        if store is not None:
            store.client.delete(delete_all=True, namespace=namespace)
            print(f"Successfully deleted all vectors in namespace '{namespace}'.")
    except Exception as e:
        print(f"Error cleaning up namespace '{namespace}': {e}")

def backend_status() -> dict:
    return {
        "fallback_mode": fallback_mode,
        "remote_initialized": vector_store is not None and not fallback_mode,
        "local_namespaces": list(_local_store.keys()),
    }