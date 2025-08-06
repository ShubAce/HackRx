import os
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.pydantic_v1 import BaseModel, Field
import json
from dotenv import load_dotenv
load_dotenv()
# --- Pydantic Schemas ---
class QueryEntities(BaseModel):
    procedure: Optional[str] = Field(None, description="A specific medical procedure or event, if mentioned (e.g., 'knee surgery', 'car accident').")
    total_claim_cost: Optional[float] = Field(None, description="The total cost of the procedure claimed by the user, if mentioned.")

class SupportingClause(BaseModel):
    clause_id: str
    clause_text: str
    source_document: str

class FinalResponse(BaseModel):
    response_type: str = Field(..., description="The type of response. Must be either 'ClaimDecision' or 'GeneralAnswer'.")
    topic: str = Field(..., description="The main subject of the user's query (e.g., 'Knee Surgery Claim', 'Eye Surgery Coverage').")
    conversational_answer: str = Field(..., description="A short, direct, and conversational answer to the user's query.")
    decision: Optional[str] = Field(None, description="If response_type is 'ClaimDecision', the formal status: 'Approved', 'Partially Approved', 'Denied', or 'Needs More Information'.")
    final_payout_amount: Optional[str] = None
    calculation_explanation: Optional[str] = None
    justification: str = Field(..., description="A detailed, formal justification for the decision or a comprehensive answer to a general question.")
    supporting_clauses: List[SupportingClause]

class ChatTitle(BaseModel):
    title: str

# --- Core Logic ---
def get_llm(schema: BaseModel):
    google_api_key = os.getenv("GOOGLE_API_KEY")
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=google_api_key, temperature=0.0)
    return llm.with_structured_output(schema)

def generate_chat_title(first_user_message: str) -> str:
    prompt = ChatPromptTemplate.from_messages([("system", "Generate a concise title (max 4 words) for a chat starting with this message."), ("human", "First message: '{message}'")])
    chain = prompt | get_llm(ChatTitle)
    return chain.invoke({"message": first_user_message}).title

def extract_entities_from_query(query: str) -> QueryEntities:
    prompt = ChatPromptTemplate.from_messages([("system", "You are an expert data extraction assistant. Extract entities from the user's query."), ("human", "User Query: {user_query}")])
    chain = prompt | get_llm(QueryEntities)
    return chain.invoke({"user_query": query})

def run_reasoning_pipeline(case_details: QueryEntities, context_chunks: List[dict], original_query: str) -> FinalResponse:
    formatted_context = json.dumps(context_chunks, indent=2)
    prompt = ChatPromptTemplate.from_messages([("system", """
        You are a world-class, multi-domain insurance assistant. Your task is to analyze a user's query and the provided evidence to generate a comprehensive, structured JSON response.

        **CRITICAL REASONING STEPS:**

        1.  **Determine User Intent:** First, analyze the original user query. Is the user submitting a specific claim (e.g., "I had knee surgery...") or asking a general question about their policy (e.g., "What eye surgeries are covered?")?
        2.  **Set `response_type`:**
            - If it's a specific claim, set `response_type` to "ClaimDecision".
            - If it's a general question, set `response_type` to "GeneralAnswer".
        3.  **If `response_type` is 'ClaimDecision':**
            - Determine a formal `decision`: 'Approved', 'Partially Approved', 'Denied', or 'Needs More Information'.
            - If a cost is provided, perform the calculation and explain it in `calculation_explanation`.
        4.  **If `response_type` is 'GeneralAnswer':**
            - The `decision` field should be null.
            - Provide a thorough answer to the user's question in the `justification` field, summarizing all relevant clauses you found.
        5.  **For ALL responses:**
            - Create a short, friendly `conversational_answer` suitable for a chat window.
            - Identify the main `topic` of the query.
            - You MUST cite all `supporting_clauses` you used to come to your conclusion.
        """), ("human", "**Original User Query:**\n{original_query}\n\n**Extracted Case Details:**\n{case_details}\n\n**Retrieved Policy Clauses (Evidence):**\n{context}")])
    chain = prompt | get_llm(FinalResponse)
    return chain.invoke({
        "original_query": original_query,
        "case_details": case_details.json(),
        "context": formatted_context
    })