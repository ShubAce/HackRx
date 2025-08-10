import os
from typing import List, Optional
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import ChatPromptTemplate
from pydantic import BaseModel, Field
import json
from dotenv import load_dotenv
load_dotenv()
# --- Pydantic Schemas ---
class QueryEntities(BaseModel):
    procedure: Optional[str] = Field(None, description="A specific medical procedure, treatment, or event mentioned (e.g., 'knee surgery', 'car accident', 'dental cleaning')")
    total_claim_cost: Optional[float] = Field(None, description="The total cost of the procedure or claim amount, if mentioned")
    body_part: Optional[str] = Field(None, description="Specific body part or area affected (e.g., 'knee', 'eye', 'tooth')")
    claim_type: Optional[str] = Field(None, description="Type of claim (e.g., 'medical', 'dental', 'accident', 'emergency')")
    urgency_level: Optional[str] = Field(None, description="Urgency indicator (e.g., 'emergency', 'elective', 'routine')")
    query_intent: Optional[str] = Field(None, description="Intent of the query (e.g., 'coverage_inquiry', 'claim_submission', 'policy_question')")

class SupportingClause(BaseModel):
    clause_id: str = Field(..., description="Unique identifier for the policy clause")
    clause_text: str = Field(..., description="The actual text content of the clause")
    source_document: str = Field(..., description="Name of the source document containing this clause")
    relevance_score: Optional[float] = Field(None, description="Relevance score from 0-1 indicating how well this clause supports the decision")
    page_number: Optional[int] = Field(None, description="Page number in the source document, if available")

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
    prompt = ChatPromptTemplate.from_messages([("system", """
        You are an expert data extraction specialist for insurance claims processing. Your task is to carefully analyze user queries and extract relevant entities.

        **EXTRACTION GUIDELINES:**
        
        1. **Procedure Identification:**
           - Look for specific medical procedures, treatments, or events
           - Include details like body parts, surgery types, medical conditions
           - Examples: "knee surgery", "cataract removal", "car accident injury", "dental implant"
           
        2. **Cost Analysis:**
           - Extract any monetary amounts mentioned
           - Look for keywords like "cost", "bill", "charged", "paid", "$"
           - Convert to float value (e.g., "$5,000" → 5000.0)
           - If no cost mentioned, leave as null
           
        3. **Context Awareness:**
           - Consider the full context of the query
           - Distinguish between questions about coverage vs. actual claims
           - Be precise about procedure names and costs
           
        **IMPORTANT:** Only extract information that is explicitly mentioned in the query. Do not infer or assume details.
    """), ("human", "User Query: {user_query}")])
    chain = prompt | get_llm(QueryEntities)
    return chain.invoke({"user_query": query})

def run_reasoning_pipeline(case_details: QueryEntities, context_chunks: List[dict], original_query: str) -> FinalResponse:
    formatted_context = json.dumps(context_chunks, indent=2)
    prompt = ChatPromptTemplate.from_messages([("system", """
        You are a world-class insurance claims specialist with expertise in policy analysis, coverage determination, and claim assessment. Your task is to analyze a user's query and the provided evidence to generate a comprehensive, structured JSON response.

        **CRITICAL REASONING STEPS:**

        1. **Analyze User Intent:** First, carefully examine the original user query. Determine if the user is:
           - Submitting a specific claim (e.g., "I had knee surgery costing $5,000...")
           - Asking a general policy question (e.g., "What eye surgeries are covered?")
           
        2. **Set Response Type:**
           - If it's a specific claim with costs/procedures, set `response_type` to "ClaimDecision"
           - If it's a general question about coverage, set `response_type` to "GeneralAnswer"
           
        3. **For ClaimDecision responses:**
           - Determine a formal `decision`: 'Approved', 'Partially Approved', 'Denied', or 'Needs More Information'
           - If a cost is provided, calculate coverage and explain in `calculation_explanation`
           - Provide specific payout amounts when applicable
           - Be strict about policy terms and conditions
           
        4. **For GeneralAnswer responses:**
           - The `decision` field should be null
           - Provide comprehensive coverage information in the `justification` field
           - List all relevant policy sections and conditions
           
        5. **Evidence Analysis:**
           - Carefully examine each policy clause for relevance
           - Cite ONLY clauses that directly relate to the query
           - Ensure clause IDs and source documents are accurate
           - Do not fabricate or hallucinate evidence
           
        6. **Accuracy Requirements:**
           - Base answers STRICTLY on provided policy documents
           - Do not make assumptions beyond what's explicitly stated
           - If information is insufficient, request more details
           - Ensure calculations are mathematically correct
           
        7. **Response Quality:**
           - Make `conversational_answer` friendly but professional
           - Ensure `justification` is detailed and cites specific policy sections
           - Create meaningful `topic` that reflects the main subject
           - Provide clear reasoning for all decisions
        """), ("human", "**Original User Query:**\n{original_query}\n\n**Extracted Case Details:**\n{case_details}\n\n**Retrieved Policy Clauses (Evidence):**\n{context}")])
    chain = prompt | get_llm(FinalResponse)
    return chain.invoke({
        "original_query": original_query,
        "case_details": case_details.json(),
        "context": formatted_context
    })

# backend/app/core/llm_handler.py

# ... (keep all your existing code and Pydantic models)

# --- NEW FUNCTION for Hackathon Endpoint ---
async def get_direct_answer(question: str, context: str) -> str:
    """
    Enhanced LLM call for accurate, context-based answers.
    Improved for better reasoning and accuracy.
    """
    google_api_key = os.getenv("GOOGLE_API_KEY")
    # Using a standard, non-structured output LLM for a simple string response
    llm = ChatGoogleGenerativeAI(model="gemini-1.5-flash", google_api_key=google_api_key, temperature=0.0)

    prompt = ChatPromptTemplate.from_messages([
        ("system", """
            You are an expert insurance policy analyst and claims specialist. Your role is to provide accurate, evidence-based answers to insurance-related questions.

            **ANALYSIS GUIDELINES:**
            
            1. **Context Analysis:** Carefully examine the provided policy document context for relevant information.
            
            2. **Answer Requirements:**
               - Base your answer STRICTLY on the provided context
               - If the context doesn't contain sufficient information, explicitly state this
               - Do not use external knowledge or make assumptions
               - Cite specific policy sections when possible
               
            3. **Response Format:**
               - Provide clear, direct answers
               - Use professional but accessible language
               - Include relevant policy details and conditions
               - Explain any calculations or reasoning steps
               
            4. **Accuracy Standards:**
               - Ensure all facts come from the provided context
               - Double-check any numerical information
               - Highlight any limitations or conditions
               - Be precise about coverage terms and exclusions
               
            5. **Fallback Behavior:**
               - If information is incomplete, specify what additional details are needed
               - If the context is irrelevant, state that clearly
               - Always acknowledge the scope of your analysis
        """),
        ("human", """
            **Policy Document Context:**
            ---
            {context}
            ---
            
            **User Question:** {question}
            
            Please provide a comprehensive answer based solely on the provided policy context.
        """)
    ])
    
    chain = prompt | llm
    
    response = await chain.ainvoke({
        "question": question,
        "context": context
    })
    
    return response.content