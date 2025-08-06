import os
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_pinecone import PineconeVectorStore
from langchain.docstore.document import Document

PINECONE_INDEX_NAME = "hackrxuser"
EMBEDDING_MODEL_NAME = 'models/embedding-001'
vector_store = None

def get_vector_store() -> PineconeVectorStore:
    global vector_store
    if vector_store is not None:
        return vector_store
    google_api_key = os.getenv("GOOGLE_API_KEY")
    embeddings = GoogleGenerativeAIEmbeddings(model=EMBEDDING_MODEL_NAME, google_api_key=google_api_key, task_type="retrieval_document")
    vector_store = PineconeVectorStore.from_existing_index(index_name=PINECONE_INDEX_NAME, embedding=embeddings)
    return vector_store

# --- THIS FUNCTION IS UPDATED ---
def query_vectors_with_scores(query: str, top_k: int = 5, namespace: str = None) -> list[tuple[Document, float]]:
    """
    Queries the vector store within a specific namespace.
    """
    store = get_vector_store()
    # Pass the namespace to the similarity search function
    return store.similarity_search_with_score(query, k=top_k, namespace=namespace)