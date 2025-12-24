# main.py
from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import os
import logging
from openai import AsyncOpenAI
from dotenv import load_dotenv

# === Optional Qdrant (safe import) ===
try:
    from embeddings import search_qdrant
    QDRANT_AVAILABLE = True
except Exception as e:
    logging.warning(f"Qdrant not available: {e}")
    QDRANT_AVAILABLE = False
    search_qdrant = None

# === Database setup ===
try:
    from database import init_db
    from chat_history import router as chat_history_router
    from auth_routes import router as auth_router
    DB_AVAILABLE = True
except Exception as e:
    logging.warning(f"Database not available: {e}")
    DB_AVAILABLE = False

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Humanoid Robotics Expert")

# Initialize database on startup
if DB_AVAILABLE:
    try:
        init_db()
        app.include_router(auth_router)
        app.include_router(chat_history_router)
        logger.info("Database initialized and APIs enabled")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")
        DB_AVAILABLE = False

# CORS — REQUIRED for frontend to talk to backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Change to your domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

client = AsyncOpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not os.getenv("OPENAI_API_KEY"):
    raise RuntimeError("OPENAI_API_KEY not set in .env")

class QueryRequest(BaseModel):
    message: str
    stream: bool = True
    context: str | None = None  # Optional context from selection
    user_level: str | None = None  # User's developer level for response adjustment
    user_name: str | None = None  # User's first name for personalization
    conversation_history: list | None = None  # Previous messages in conversation

@app.get("/")
async def root():
    status = "ONLINE" if QDRANT_AVAILABLE else "QDRANT OFFLINE"
    return {
        "message": "Your Humanoid Robotics Textbook is ALIVE",
        "status": status,
        "chunks": "11,900+" if QDRANT_AVAILABLE else "0",
        "model": "gpt-4o-mini",
        "tip": "Ask anything about humanoid robots!"
    }

@app.post("/chat")
async def chat(req: QueryRequest):
    try:
        logger.info(f"Incoming question: {req.message}")

        # Get user level from request if available
        user_level = req.user_level or "Intermediate"
        is_beginner = user_level == "Beginner"
        is_advanced = user_level == "Advanced"

        # Check if message is a simple greeting or conversational query (skip RAG for these)
        greeting_keywords = ['hi', 'hello', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening']
        short_greetings = ['ok', 'thanks', 'thank you', 'bye', 'goodbye']
        conversational_patterns = [
            'what is your name', 'who are you', 'tell me about yourself',
            'what is my name', 'who am i', 'do you know my name', 'do you know me',
            'how are you', 'how are you doing', 'whats up', "what's up",
            'nice to meet you', 'pleased to meet you'
        ]
        message_lower = req.message.lower().strip()
        is_greeting = (
            any(message_lower == greeting or message_lower.startswith(greeting + ' ')
                for greeting in greeting_keywords) or
            message_lower in short_greetings or
            any(pattern in message_lower for pattern in conversational_patterns)
        )

        if is_greeting:
            logger.info(f"Greeting detected: '{req.message}' - skipping RAG search")

        # ——— QDRANT SEARCH (super safe) ———
        context = ""
        sources = []

        # Only search Qdrant if it's NOT a simple greeting
        if QDRANT_AVAILABLE and search_qdrant and not is_greeting:
            try:
                # Detect if this is a chapter summary request
                is_summary_request = any(keyword in req.message.lower() for keyword in ['summarize', 'summary', 'sum up', 'overview'])
                is_chapter_request = any(f'chapter {i}' in req.message.lower() for i in range(1, 7))

                # Detect comprehensive/detailed requests
                is_detailed_request = any(keyword in req.message.lower() for keyword in [
                    'explain in detail', 'comprehensive', 'detailed explanation', 'everything about',
                    'all about', 'complete guide', 'thorough', 'in-depth', 'elaborate'
                ])

                # Detect multi-topic questions (questions with "and", "also", multiple question marks, etc.)
                is_multi_topic = req.message.count('?') > 1 or ' and ' in req.message.lower() or ' also ' in req.message.lower()

                # Calculate word count of question to gauge complexity
                word_count = len(req.message.split())
                is_complex_question = word_count > 20

                # Adaptive chunk retrieval based on request type
                if is_summary_request and is_chapter_request:
                    top_k = 30  # Chapter summaries need comprehensive coverage
                elif is_detailed_request:
                    top_k = 40  # Detailed requests need more context
                elif is_multi_topic or is_complex_question:
                    top_k = 25  # Multiple topics or complex questions need more chunks
                else:
                    top_k = 15  # Default for simple questions

                logger.info(f"Using top_k={top_k} chunks for query type: summary={is_summary_request}, detailed={is_detailed_request}, multi_topic={is_multi_topic}, complex={is_complex_question}")

                results = search_qdrant(req.message, top_k=top_k)
                if results and len(results) > 0:
                    # Increase token limit for detailed requests
                    max_tokens = 40000 if (is_detailed_request or is_summary_request) else 25000
                    context = "\n\n".join([
                        r.payload.get("text", "") for r in results
                        if r.payload and "text" in r.payload
                    ][:max_tokens])
                    sources = [r.payload["text"][:160] + "..." for r in results[:3]]
                    logger.info(f"Qdrant found {len(results)} chunks, using up to {max_tokens} tokens")
                else:
                    logger.info("Qdrant returned 0 results")
            except Exception as e:
                logger.error(f"Qdrant error: {e}")
                context = "Qdrant search failed, using general knowledge."
        elif not is_greeting:
            # Only set fallback context for non-greetings when Qdrant is unavailable
            context = "Qdrant is offline — using general knowledge only."
            logger.warning("Qdrant not available")
        # For greetings, context stays empty and no warning is logged

        # ——— FINAL PROMPT ———
        # Check if we have valid book context
        has_valid_context = context and context not in [
            "Qdrant search failed, using general knowledge.",
            "Qdrant is offline — using general knowledge only."
        ] and len(context.strip()) > 50

        # Add user context for personalization
        user_context = ""
        if req.user_name:
            user_context = f"\n\nUser Info: You are talking to {req.user_name}. You can address them by name when appropriate."

        if is_beginner:
            system = f"""You are a knowledgeable, friendly AI teaching assistant specializing in humanoid robotics and Physical AI.

Your personality:
- Warm and encouraging - like a patient mentor
- Use a conversational, friendly tone (but stay professional)
- Keep responses concise and focused
- Engage naturally in casual conversation when appropriate

Your role:
- Answer questions using ONLY the provided textbook content
- Explain concepts in simple, clear language with everyday analogies when helpful
- Keep responses moderate in length - be informative but not verbose
- Break down technical terms briefly (e.g., "actuators - the robot's muscles")

For greetings and casual conversation:
- Respond naturally and warmly to greetings like "hi", "hello", "how are you"
- If asked your name or who you are, introduce yourself as an AI guide for humanoid robotics
- If asked about the user's name, you can reference it if available in context
- Keep casual responses brief but friendly

When you don't know something:
- If the question cannot be answered from the book context, respond friendly like: "I'm not quite sure about that! My knowledge is focused on humanoid robotics from the textbook. Could you ask me something about robot balance, control systems, or specific humanoid robots?"

IMPORTANT: Be concise. Provide clear, focused answers without excessive detail unless specifically requested.{user_context}"""

            if has_valid_context:
                if is_summary_request and is_chapter_request:
                    user_prompt = f"""BOOK CONTEXT:
{context}

USER QUESTION: {req.message}

This is a chapter summary request. Using the book content above, provide a comprehensive yet easy-to-understand summary. Structure your response with:
1. Main topics covered in the chapter
2. Key concepts explained in simple terms
3. Important examples or practical applications

Use beginner-friendly language with simple words and helpful analogies."""
                else:
                    user_prompt = f"""BOOK CONTEXT:
{context}

USER QUESTION: {req.message}

Answer using the book context above. Use beginner-friendly language with simple words, everyday analogies, and clear examples."""
            else:
                user_prompt = f"""USER QUESTION: {req.message}

You do not have access to the textbook content right now. If this is a greeting, respond politely. Otherwise, say: "I apologize, but I can only answer questions based on the textbook content. The textbook database is currently unavailable. Please try again later." """
        elif is_advanced:
            system = f"""You are a highly knowledgeable AI teaching assistant specializing in advanced humanoid robotics and Physical AI systems.

Your personality:
- Professional yet approachable - like a senior researcher
- Technical but concise
- Can engage in brief casual conversation while maintaining professionalism

Your role:
- Deliver precise, technically rigorous answers using ONLY the textbook content
- Use proper technical terminology and mathematical notation when present
- Keep responses focused and moderate in length - technical but not overly verbose
- Discuss key implementation details and trade-offs concisely

For greetings and casual conversation:
- Respond professionally but naturally to greetings
- If asked your name or who you are, introduce yourself as an AI teaching assistant for humanoid robotics
- If asked about the user's name, you can reference it if available in context
- Keep casual exchanges brief and professional

When you don't know something:
- If the question cannot be answered from the book context, respond professionally: "That's outside my current knowledge base. I specialize in humanoid robotics topics covered in the textbook. Is there something specific about robotic systems I can help with?"

IMPORTANT: Be technically accurate but concise. Provide focused answers without excessive elaboration unless specifically requested.{user_context}"""

            if has_valid_context:
                if is_summary_request and is_chapter_request:
                    user_prompt = f"""BOOK CONTEXT:
{context}

USER QUESTION: {req.message}

This is a chapter summary request. Using the book content above, provide a comprehensive technical summary. Include:
1. Core technical concepts and principles
2. Key algorithms, mathematical formulations, and system designs
3. Implementation considerations and practical applications
4. Connections to other chapters or advanced topics

Use precise technical terminology and rigorous explanations appropriate for advanced readers."""
                else:
                    user_prompt = f"""BOOK CONTEXT:
{context}

USER QUESTION: {req.message}

Answer using the book context above. Provide deep technical explanations with precise terminology, mathematical formulations where applicable, and detailed analysis."""
            else:
                user_prompt = f"""USER QUESTION: {req.message}

You do not have access to the textbook content right now. If this is a greeting, respond politely. Otherwise, say: "I apologize, but I can only answer questions based on the textbook content. The textbook database is currently unavailable. Please try again later." """
        else:
            system = f"""You are an expert, friendly AI teaching assistant for humanoid robotics and Physical AI.

Your personality:
- Approachable and conversational
- Balance being technically accurate with being personable
- Keep responses moderate in length
- Engage naturally in casual conversation

Your role:
- Provide accurate answers using ONLY the textbook content
- Balance technical depth with clarity - be thorough but concise
- Include relevant technical terminology with brief explanations when helpful
- Keep responses focused and informative without being overly verbose

For greetings and casual conversation:
- Respond warmly and naturally to greetings like "hi", "hello", "how are you"
- If asked your name or who you are, introduce yourself as an AI guide for humanoid robotics
- If asked about the user's name, you can reference it if available in context
- Keep casual exchanges friendly but focused

When you don't know something:
- If the question cannot be answered from the book context, respond conversationally: "I'm not sure about that one! My expertise is in humanoid robotics based on the textbook content. What would you like to know about robot locomotion, control, or specific platforms?"

IMPORTANT: Be informative but concise. Provide clear, focused answers of moderate length unless specifically asked for detailed explanations.{user_context}"""

            if has_valid_context:
                if is_summary_request and is_chapter_request:
                    user_prompt = f"""BOOK CONTEXT:
{context}

USER QUESTION: {req.message}

This is a chapter summary request. Using the book content above, provide a comprehensive and well-structured summary. Include:
1. Main topics and themes covered
2. Key technical concepts with clear explanations
3. Practical examples and applications
4. How this chapter connects to broader robotics concepts

Balance technical accuracy with accessibility for intermediate learners."""
                else:
                    user_prompt = f"""BOOK CONTEXT:
{context}

USER QUESTION: {req.message}

Answer using the book context above. Provide technically balanced explanations with appropriate terminology and clear explanations."""
            else:
                user_prompt = f"""USER QUESTION: {req.message}

You do not have access to the textbook content right now. If this is a greeting, respond politely. Otherwise, say: "I apologize, but I can only answer questions based on the textbook content. The textbook database is currently unavailable. Please try again later." """

        # ——— STREAMING ———
        async def streamer():
            try:
                # Build conversation messages
                messages = [{"role": "system", "content": system}]

                # Add conversation history if provided (last 10 messages for context)
                if req.conversation_history and len(req.conversation_history) > 0:
                    # Take last 10 messages to keep context manageable
                    recent_history = req.conversation_history[-10:]
                    for msg in recent_history:
                        if msg.get('role') in ['user', 'assistant']:
                            messages.append({
                                "role": msg.get('role'),
                                "content": msg.get('content', '')
                            })

                # Add current message
                messages.append({"role": "user", "content": user_prompt})

                logger.info(f"Conversation length: {len(messages)} messages (including system + {len(req.conversation_history or [])} history)")

                stream = await client.chat.completions.create(
                    model="gpt-4o-mini",
                    messages=messages,
                    temperature=0.4,  # Slightly higher for more natural conversation
                    max_tokens=800,  # Limit response length for cost-effectiveness (moderate responses)
                    stream=True
                )
                async for chunk in stream:
                    if chunk.choices[0].delta.content:
                        yield chunk.choices[0].delta.content
            except Exception as e:
                logger.error(f"Streaming error: {e}")
                yield f"\n\n⚠️ OpenAI error: {e}"

        return StreamingResponse(streamer(), media_type="text/event-stream")

    except Exception as e:
        logger.error(f"Unexpected error: {e}")
        raise HTTPException(status_code=500, detail=str(e))